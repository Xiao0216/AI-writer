/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */

import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import type { PaymentOrder } from '@prisma/client';
import { of } from 'rxjs';
import { createCipheriv, createSign, generateKeyPairSync } from 'node:crypto';

import { MembershipService } from '../membership/membership.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  const merchantKeyPair = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const platformKeyPair = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const privateKeyPem = merchantKeyPair.privateKey.export({
    type: 'pkcs8',
    format: 'pem',
  });
  const platformPublicKeyPem = platformKeyPair.publicKey.export({
    type: 'spki',
    format: 'pem',
  });
  const apiV3Key = '12345678901234567890123456789012';

  const buildConfigService = () =>
    ({
      get: jest.fn((key: string, defaultValue?: string) => {
        const values: Record<string, string> = {
          WECHAT_PAY_APP_ID: 'wx-test-app',
          WECHAT_APP_ID: 'wx-test-app',
          WECHAT_PAY_MCH_ID: '1234567890',
          WECHAT_PAY_SERIAL_NO: 'SERIAL123456',
          WECHAT_PAY_PRIVATE_KEY: String(privateKeyPem),
          WECHAT_PAY_PLATFORM_PUBLIC_KEY: String(platformPublicKeyPem),
          WECHAT_PAY_API_V3_KEY: apiV3Key,
          WECHAT_PAY_NOTIFY_URL: 'https://example.com/payments/wechat/notify',
          WECHAT_PAY_BASE_URL: 'https://api.mch.weixin.qq.com',
          MEMBERSHIP_MONTH_PRICE_FEN: '1990',
          MEMBERSHIP_MONTH_DURATION_MONTHS: '1',
          MEMBERSHIP_MONTH_TITLE: '文枢AI 会员月卡',
          MEMBERSHIP_MONTH_DESCRIPTION: '开通后解锁会员额度与完整创作权益',
        };

        return values[key] ?? defaultValue;
      }),
    }) as unknown as ConfigService;

  const createBaseOrder = (): PaymentOrder => ({
    id: 'order-1',
    userId: 'user-1',
    planCode: 'MEMBER_MONTH',
    description: '文枢AI 会员月卡',
    channel: 'WECHAT_NATIVE',
    amountFen: 1990,
    currency: 'CNY',
    status: 'PENDING',
    outTradeNo: 'WS202603230001',
    codeUrl: null,
    providerOrderId: null,
    providerPayload: null,
    paidAt: null,
    expireAt: new Date('2026-03-23T10:15:00.000Z'),
    createdAt: new Date('2026-03-23T10:00:00.000Z'),
    updatedAt: new Date('2026-03-23T10:00:00.000Z'),
  });

  it('creates a native payment order and stores the QR code URL', async () => {
    const createdOrder = createBaseOrder();
    const updatedOrder = {
      ...createdOrder,
      codeUrl: 'weixin://wxpay/bizpayurl?pr=test-order',
    };
    const prisma = {
      paymentOrder: {
        create: jest.fn().mockResolvedValue(createdOrder),
        update: jest.fn().mockResolvedValue(updatedOrder),
      },
    } as unknown as PrismaService;
    const httpService = {
      request: jest.fn().mockReturnValue(
        of({
          data: {
            code_url: 'weixin://wxpay/bizpayurl?pr=test-order',
          },
        }),
      ),
    } as unknown as HttpService;
    const membershipService = {
      activatePaidMembership: jest.fn(),
    } as unknown as MembershipService;
    const service = new PaymentsService(
      prisma,
      httpService,
      buildConfigService(),
      membershipService,
    );

    const result = await service.createMembershipOrder('user-1');

    expect(prisma.paymentOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          amountFen: 1990,
          status: 'PENDING',
        }),
      }),
    );
    expect(httpService.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: '/v3/pay/transactions/native',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('WECHATPAY2-SHA256-RSA2048'),
        }),
      }),
    );
    expect(prisma.paymentOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          codeUrl: 'weixin://wxpay/bizpayurl?pr=test-order',
        }),
      }),
    );
    expect(result.codeUrl).toBe('weixin://wxpay/bizpayurl?pr=test-order');
  });

  it('syncs a pending order to paid when querying WeChat order state', async () => {
    const baseOrder = createBaseOrder();
    const paidOrder = {
      ...baseOrder,
      status: 'PAID',
      providerOrderId: '42000000000001',
      paidAt: new Date('2026-03-23T10:01:00.000Z'),
      updatedAt: new Date('2026-03-23T10:01:00.000Z'),
    };
    const tx = {
      paymentOrder: {
        findUniqueOrThrow: jest.fn().mockResolvedValue(baseOrder),
        update: jest.fn().mockResolvedValue(paidOrder),
      },
    };
    const prisma = {
      paymentOrder: {
        findFirst: jest.fn().mockResolvedValue(baseOrder),
      },
      $transaction: jest.fn(
        async (callback: (client: typeof tx) => Promise<PaymentOrder>) =>
          callback(tx),
      ),
    } as unknown as PrismaService;
    const httpService = {
      request: jest.fn().mockReturnValue(
        of({
          data: {
            trade_state: 'SUCCESS',
            transaction_id: '42000000000001',
            success_time: '2026-03-23T10:01:00+08:00',
          },
        }),
      ),
    } as unknown as HttpService;
    const membershipService = {
      activatePaidMembership: jest.fn().mockResolvedValue(undefined),
    } as unknown as MembershipService;
    const service = new PaymentsService(
      prisma,
      httpService,
      buildConfigService(),
      membershipService,
    );

    const result = await service.getOrderForUser('user-1', 'order-1');

    expect(httpService.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/v3/pay/transactions/out-trade-no/WS202603230001?mchid=1234567890',
      }),
    );
    expect(membershipService.activatePaidMembership).toHaveBeenCalledWith(
      'user-1',
      1,
      tx,
      new Date('2026-03-23T10:01:00+08:00'),
    );
    expect(result.status).toBe('PAID');
  });

  it('verifies and decrypts a notify payload before activating membership', async () => {
    const baseOrder = createBaseOrder();
    const paidOrder = {
      ...baseOrder,
      status: 'PAID',
      providerOrderId: '42000000000002',
      paidAt: new Date('2026-03-23T10:05:00.000Z'),
      updatedAt: new Date('2026-03-23T10:05:00.000Z'),
    };
    const tx = {
      paymentOrder: {
        findUniqueOrThrow: jest.fn().mockResolvedValue(baseOrder),
        update: jest.fn().mockResolvedValue(paidOrder),
      },
      user: {},
    };
    const prisma = {
      paymentOrder: {
        findUnique: jest.fn().mockResolvedValue(baseOrder),
      },
      $transaction: jest.fn(
        async (callback: (client: typeof tx) => Promise<PaymentOrder>) =>
          callback(tx),
      ),
    } as unknown as PrismaService;
    const httpService = {
      request: jest.fn(),
    } as unknown as HttpService;
    const membershipService = {
      activatePaidMembership: jest.fn().mockResolvedValue(undefined),
    } as unknown as MembershipService;
    const service = new PaymentsService(
      prisma,
      httpService,
      buildConfigService(),
      membershipService,
    );

    const associatedData = 'transaction';
    const resourceNonce = 'nonce1234567';
    const plaintext = JSON.stringify({
      out_trade_no: 'WS202603230001',
      transaction_id: '42000000000002',
      trade_state: 'SUCCESS',
      success_time: '2026-03-23T10:05:00+08:00',
    });
    const cipher = createCipheriv(
      'aes-256-gcm',
      Buffer.from(apiV3Key, 'utf8'),
      Buffer.from(resourceNonce, 'utf8'),
    );
    cipher.setAAD(Buffer.from(associatedData, 'utf8'));
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
      cipher.getAuthTag(),
    ]).toString('base64');
    const rawBody = JSON.stringify({
      id: 'notify-1',
      event_type: 'TRANSACTION.SUCCESS',
      resource: {
        algorithm: 'AEAD_AES_256_GCM',
        ciphertext,
        nonce: resourceNonce,
        associated_data: associatedData,
      },
    });
    const timestamp = '1711159500';
    const nonce = 'notify-sign-nonce';
    const signer = createSign('RSA-SHA256');
    signer.update(`${timestamp}\n${nonce}\n${rawBody}\n`);
    signer.end();
    const signature = signer.sign(platformKeyPair.privateKey, 'base64');

    const result = await service.handleWechatNotify(rawBody, {
      'wechatpay-timestamp': timestamp,
      'wechatpay-nonce': nonce,
      'wechatpay-signature': signature,
    });

    expect(result).toEqual({ code: 'SUCCESS', message: '成功' });
    expect(prisma.paymentOrder.findUnique).toHaveBeenCalledWith({
      where: { outTradeNo: 'WS202603230001' },
    });
    expect(membershipService.activatePaidMembership).toHaveBeenCalledWith(
      'user-1',
      1,
      tx,
      new Date('2026-03-23T10:05:00+08:00'),
    );
  });
});
