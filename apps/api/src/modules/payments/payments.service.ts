import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  PaymentChannel,
  PaymentOrder,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { isAxiosError } from 'axios';
import {
  createDecipheriv,
  createPrivateKey,
  createPublicKey,
  createSign,
  createVerify,
  randomBytes,
} from 'node:crypto';
import { readFileSync } from 'node:fs';
import { firstValueFrom } from 'rxjs';

import { MembershipService } from '../membership/membership.service';
import { PrismaService } from '../prisma/prisma.service';

type MembershipPlan = {
  code: string;
  title: string;
  description: string;
  priceFen: number;
  durationMonths: number;
  channel: PaymentChannel;
  configured: boolean;
};

type NativeOrderResponse = {
  code_url: string;
};

type QueryOrderResponse = {
  trade_state?:
    | 'SUCCESS'
    | 'REFUND'
    | 'NOTPAY'
    | 'CLOSED'
    | 'REVOKED'
    | 'USERPAYING'
    | 'PAYERROR'
    | 'ACCEPT';
  transaction_id?: string;
  success_time?: string;
};

type NotifyEnvelope = {
  event_type?: string;
  resource?: {
    algorithm?: string;
    ciphertext?: string;
    nonce?: string;
    associated_data?: string;
  };
};

type DecryptedNotifyPayload = {
  out_trade_no?: string;
  transaction_id?: string;
  trade_state?: string;
  success_time?: string;
};

type ProviderJson = Prisma.InputJsonValue;

const MEMBER_MONTH_PLAN_CODE = 'MEMBER_MONTH';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly membershipService: MembershipService,
  ) {}

  getMembershipPlan(): MembershipPlan {
    return {
      code: MEMBER_MONTH_PLAN_CODE,
      title: this.configService.get<string>(
        'MEMBERSHIP_MONTH_TITLE',
        '文枢AI 会员月卡',
      ),
      description: this.configService.get<string>(
        'MEMBERSHIP_MONTH_DESCRIPTION',
        '开通后解锁会员额度与完整创作权益',
      ),
      priceFen: this.getPlanPriceFen(),
      durationMonths: this.getPlanDurationMonths(),
      channel: 'WECHAT_NATIVE',
      configured: this.isWechatPayConfigured(),
    };
  }

  async createMembershipOrder(userId: string) {
    this.ensureWechatPayConfigured();

    const plan = this.getMembershipPlan();
    const expireAt = new Date(
      Date.now() + this.getOrderExpireMinutes() * 60 * 1000,
    );

    const order = await this.prisma.paymentOrder.create({
      data: {
        userId,
        planCode: plan.code,
        description: plan.title,
        channel: plan.channel,
        amountFen: plan.priceFen,
        currency: 'CNY',
        status: 'PENDING',
        outTradeNo: this.createOutTradeNo(),
        expireAt,
      },
    });

    try {
      const nativeOrder = await this.createWechatNativeOrder(order, plan);

      return this.serializeOrder(
        await this.prisma.paymentOrder.update({
          where: { id: order.id },
          data: {
            codeUrl: nativeOrder.code_url,
            providerPayload: nativeOrder as ProviderJson,
          },
        }),
      );
    } catch (error) {
      await this.prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: 'FAILED',
          providerPayload: this.serializeProviderError(error),
        },
      });
      throw this.toProviderException(error);
    }
  }

  async getOrderForUser(userId: string, orderId: string) {
    const order = await this.prisma.paymentOrder.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException('支付订单不存在');
    }

    if (order.status !== 'PENDING' || !this.isWechatPayConfigured()) {
      return this.serializeOrder(order);
    }

    const syncedOrder = await this.syncOrderWithWechat(order);
    return this.serializeOrder(syncedOrder);
  }

  async handleWechatNotify(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>,
  ) {
    this.ensureWechatPayConfigured();
    this.verifyWechatSignature(rawBody, headers);

    const envelope = JSON.parse(rawBody) as NotifyEnvelope;
    if (envelope.event_type !== 'TRANSACTION.SUCCESS') {
      return { code: 'SUCCESS', message: '忽略非支付成功通知' };
    }

    const payload = this.decryptWechatNotifyBody(envelope);
    if (payload.trade_state !== 'SUCCESS' || !payload.out_trade_no) {
      return { code: 'SUCCESS', message: '忽略非支付成功通知' };
    }

    const order = await this.prisma.paymentOrder.findUnique({
      where: { outTradeNo: payload.out_trade_no },
    });

    if (!order) {
      throw new NotFoundException('支付订单不存在');
    }

    await this.markOrderPaid(
      order.id,
      payload.transaction_id,
      payload.success_time,
      payload as ProviderJson,
    );

    return { code: 'SUCCESS', message: '成功' };
  }

  private async syncOrderWithWechat(
    order: PaymentOrder,
  ): Promise<PaymentOrder> {
    try {
      const response = await this.wechatRequest<QueryOrderResponse>(
        'GET',
        `/v3/pay/transactions/out-trade-no/${order.outTradeNo}?mchid=${encodeURIComponent(
          this.getWechatPayMerchantId(),
        )}`,
      );

      if (response.trade_state === 'SUCCESS') {
        return this.markOrderPaid(
          order.id,
          response.transaction_id,
          response.success_time,
          response as ProviderJson,
        );
      }

      const mappedStatus = this.mapWechatTradeState(response.trade_state);
      if (mappedStatus && mappedStatus !== order.status) {
        return this.prisma.paymentOrder.update({
          where: { id: order.id },
          data: {
            status: mappedStatus,
            providerOrderId: response.transaction_id,
            providerPayload: response as ProviderJson,
          },
        });
      }

      return order;
    } catch (error) {
      throw this.toProviderException(error);
    }
  }

  private async createWechatNativeOrder(
    order: PaymentOrder,
    plan: MembershipPlan,
  ): Promise<NativeOrderResponse> {
    return this.wechatRequest<NativeOrderResponse>(
      'POST',
      '/v3/pay/transactions/native',
      {
        appid: this.getWechatPayAppId(),
        mchid: this.getWechatPayMerchantId(),
        description: plan.title,
        out_trade_no: order.outTradeNo,
        notify_url: this.getWechatPayNotifyUrl(),
        attach: plan.code,
        time_expire: order.expireAt?.toISOString(),
        amount: {
          total: order.amountFen,
          currency: order.currency,
        },
      },
    );
  }

  private async markOrderPaid(
    orderId: string,
    providerOrderId?: string,
    successTime?: string,
    providerPayload?: ProviderJson,
  ): Promise<PaymentOrder> {
    return this.prisma.$transaction(async (tx) => {
      const currentOrder = await tx.paymentOrder.findUniqueOrThrow({
        where: { id: orderId },
      });

      if (currentOrder.status === 'PAID') {
        return currentOrder;
      }

      const paidAt = successTime ? new Date(successTime) : new Date();

      await this.membershipService.activatePaidMembership(
        currentOrder.userId,
        this.getPlanDurationMonths(),
        tx,
        paidAt,
      );

      return tx.paymentOrder.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paidAt,
          providerOrderId,
          providerPayload,
        },
      });
    });
  }

  private async wechatRequest<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const payload = body ? JSON.stringify(body) : '';
    const authorization = this.buildWechatAuthorization(method, path, payload);

    const response = await firstValueFrom(
      this.httpService.request<T>({
        baseURL: this.getWechatPayBaseUrl(),
        method,
        url: path,
        data: body,
        headers: {
          Authorization: authorization,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'WenShu-AI/1.0',
        },
      }),
    );

    return response.data;
  }

  private buildWechatAuthorization(
    method: 'GET' | 'POST',
    path: string,
    body: string,
  ): string {
    const nonce = randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = `${method}\n${path}\n${timestamp}\n${nonce}\n${body}\n`;

    const signer = createSign('RSA-SHA256');
    signer.update(message);
    signer.end();

    const signature = signer.sign(this.getWechatPayPrivateKey(), 'base64');

    return `WECHATPAY2-SHA256-RSA2048 mchid="${this.getWechatPayMerchantId()}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${this.getWechatPaySerialNo()}",signature="${signature}"`;
  }

  private verifyWechatSignature(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>,
  ): void {
    const timestamp = this.readHeader(headers, 'wechatpay-timestamp');
    const nonce = this.readHeader(headers, 'wechatpay-nonce');
    const signature = this.readHeader(headers, 'wechatpay-signature');
    const message = `${timestamp}\n${nonce}\n${rawBody}\n`;

    const verifier = createVerify('RSA-SHA256');
    verifier.update(message);
    verifier.end();

    const valid = verifier.verify(
      this.getWechatPayPlatformPublicKey(),
      signature,
      'base64',
    );

    if (!valid) {
      throw new UnauthorizedException('微信支付回调验签失败');
    }
  }

  private decryptWechatNotifyBody(
    envelope: NotifyEnvelope,
  ): DecryptedNotifyPayload {
    const resource = envelope.resource;

    if (!resource?.ciphertext || !resource.nonce) {
      throw new BadRequestException('微信支付回调内容不完整');
    }

    if (resource.algorithm !== 'AEAD_AES_256_GCM') {
      throw new BadRequestException('不支持的微信支付加密算法');
    }

    const encrypted = Buffer.from(resource.ciphertext, 'base64');
    const authTag = encrypted.subarray(encrypted.length - 16);
    const ciphertext = encrypted.subarray(0, encrypted.length - 16);
    const decipher = createDecipheriv(
      'aes-256-gcm',
      Buffer.from(this.getWechatPayApiV3Key(), 'utf8'),
      Buffer.from(resource.nonce, 'utf8'),
    );

    if (resource.associated_data) {
      decipher.setAAD(Buffer.from(resource.associated_data, 'utf8'));
    }
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');

    return JSON.parse(decrypted) as DecryptedNotifyPayload;
  }

  private mapWechatTradeState(tradeState?: string): PaymentStatus | null {
    switch (tradeState) {
      case 'CLOSED':
      case 'REVOKED':
        return 'CLOSED';
      case 'PAYERROR':
        return 'FAILED';
      case 'REFUND':
        return 'REFUNDED';
      default:
        return null;
    }
  }

  private serializeOrder(order: PaymentOrder) {
    return {
      id: order.id,
      planCode: order.planCode,
      description: order.description,
      channel: order.channel,
      amountFen: order.amountFen,
      currency: order.currency,
      status: order.status,
      outTradeNo: order.outTradeNo,
      codeUrl: order.codeUrl,
      paidAt: order.paidAt,
      expireAt: order.expireAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private serializeProviderError(error: unknown): ProviderJson {
    if (isAxiosError(error)) {
      return {
        message: error.message,
        status: error.response?.status ?? null,
        data:
          typeof error.response?.data === 'object'
            ? (error.response.data as ProviderJson)
            : String(error.response?.data ?? ''),
      };
    }

    if (error instanceof Error) {
      return { message: error.message };
    }

    return { message: 'unknown_error' };
  }

  private toProviderException(error: unknown): ServiceUnavailableException {
    if (isAxiosError(error)) {
      const providerData = error.response?.data as
        | { message?: string; errmsg?: string }
        | undefined;
      const providerMessage =
        providerData?.message ?? providerData?.errmsg ?? error.message;
      return new ServiceUnavailableException(
        `微信支付请求失败: ${providerMessage}`,
      );
    }

    return new ServiceUnavailableException(
      error instanceof Error ? error.message : '微信支付请求失败',
    );
  }

  private createOutTradeNo(): string {
    const timestamp = Date.now().toString();
    const random = randomBytes(4).toString('hex').toUpperCase();
    return `WS${timestamp}${random}`.slice(0, 32);
  }

  private ensureWechatPayConfigured(): void {
    if (!this.isWechatPayConfigured()) {
      throw new ServiceUnavailableException(
        '微信支付未配置完成，请检查商户号、证书序列号、私钥、APIv3 Key 与平台公钥',
      );
    }
  }

  private isWechatPayConfigured(): boolean {
    const hasMerchantId = this.getOptionalConfig('WECHAT_PAY_MCH_ID');
    const hasSerialNo = this.getOptionalConfig('WECHAT_PAY_SERIAL_NO');
    const hasNotifyUrl = this.getOptionalConfig('WECHAT_PAY_NOTIFY_URL');
    const hasPrivateKey = this.getOptionalPem(
      'WECHAT_PAY_PRIVATE_KEY',
      'WECHAT_PAY_PRIVATE_KEY_PATH',
    );
    const hasApiV3Key = this.getOptionalConfig('WECHAT_PAY_API_V3_KEY');
    const hasPlatformKey = this.getOptionalPem(
      'WECHAT_PAY_PLATFORM_PUBLIC_KEY',
      'WECHAT_PAY_PLATFORM_PUBLIC_KEY_PATH',
    );
    const hasAppId = this.getOptionalConfig(
      'WECHAT_PAY_APP_ID',
      'WECHAT_APP_ID',
    );

    const hasAllRequiredConfig =
      hasMerchantId &&
      hasSerialNo &&
      hasNotifyUrl &&
      hasPrivateKey &&
      hasApiV3Key &&
      hasPlatformKey &&
      hasAppId;

    return Boolean(hasAllRequiredConfig);
  }

  private getPlanPriceFen(): number {
    return Number(
      this.configService.get<string>('MEMBERSHIP_MONTH_PRICE_FEN', '1990'),
    );
  }

  private getPlanDurationMonths(): number {
    return Number(
      this.configService.get<string>('MEMBERSHIP_MONTH_DURATION_MONTHS', '1'),
    );
  }

  private getOrderExpireMinutes(): number {
    return Number(
      this.configService.get<string>('WECHAT_PAY_ORDER_EXPIRE_MINUTES', '15'),
    );
  }

  private getWechatPayAppId(): string {
    return this.requireConfig('WECHAT_PAY_APP_ID', 'WECHAT_APP_ID');
  }

  private getWechatPayMerchantId(): string {
    return this.requireConfig('WECHAT_PAY_MCH_ID');
  }

  private getWechatPaySerialNo(): string {
    return this.requireConfig('WECHAT_PAY_SERIAL_NO');
  }

  private getWechatPayNotifyUrl(): string {
    return this.requireConfig('WECHAT_PAY_NOTIFY_URL');
  }

  private getWechatPayApiV3Key(): string {
    return this.requireConfig('WECHAT_PAY_API_V3_KEY');
  }

  private getWechatPayBaseUrl(): string {
    return this.configService.get<string>(
      'WECHAT_PAY_BASE_URL',
      'https://api.mch.weixin.qq.com',
    );
  }

  private getWechatPayPrivateKey() {
    return createPrivateKey(
      this.requirePem('WECHAT_PAY_PRIVATE_KEY', 'WECHAT_PAY_PRIVATE_KEY_PATH'),
    );
  }

  private getWechatPayPlatformPublicKey() {
    return createPublicKey(
      this.requirePem(
        'WECHAT_PAY_PLATFORM_PUBLIC_KEY',
        'WECHAT_PAY_PLATFORM_PUBLIC_KEY_PATH',
      ),
    );
  }

  private requireConfig(...keys: string[]): string {
    const value = this.getOptionalConfig(...keys);
    if (!value) {
      throw new ServiceUnavailableException(
        `缺少支付配置: ${keys.join(' / ')}`,
      );
    }
    return value;
  }

  private getOptionalConfig(...keys: string[]): string | undefined {
    for (const key of keys) {
      const value = this.configService.get<string>(key)?.trim();
      if (value) {
        return value;
      }
    }
    return undefined;
  }

  private requirePem(valueKey: string, pathKey: string): string {
    const value = this.getOptionalPem(valueKey, pathKey);
    if (!value) {
      throw new ServiceUnavailableException(
        `缺少支付证书配置: ${valueKey} / ${pathKey}`,
      );
    }
    return value;
  }

  private getOptionalPem(
    valueKey: string,
    pathKey: string,
  ): string | undefined {
    const inlineValue = this.getOptionalConfig(valueKey);
    if (inlineValue) {
      return inlineValue.replace(/\\n/g, '\n');
    }

    const path = this.getOptionalConfig(pathKey);
    if (!path) {
      return undefined;
    }

    return readFileSync(path, 'utf8');
  }

  private readHeader(
    headers: Record<string, string | string[] | undefined>,
    key: string,
  ): string {
    const headerValue = headers[key] ?? headers[key.toLowerCase()];
    const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (!value) {
      throw new BadRequestException(`缺少微信支付回调头: ${key}`);
    }

    return value;
  }
}
