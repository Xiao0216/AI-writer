import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { MembershipType, User } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

import type { AuthUser } from '../../common/types/auth-user';
import { isPreviewMode } from '../../common/utils/preview-mode';
import { PrismaService } from '../prisma/prisma.service';

type LoginInput = {
  openid: string;
  nickname?: string;
  preferredGenre?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async login(input: LoginInput): Promise<{ user: User; token: string }> {
    if (isPreviewMode()) {
      const previewOpenid = input.openid?.trim() || 'preview-writer';
      const previewNickname =
        input.nickname?.trim() || `作者${previewOpenid.slice(-4)}`;
      const previewUser = {
        id: `preview-${previewOpenid}`,
        nickname: previewNickname,
        avatar: null,
        wechatOpenid: previewOpenid,
        phone: null,
        preferredGenre: input.preferredGenre?.trim() || '都市爽文',
        membershipType: 'FREE' as MembershipType,
        membershipExpireAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } satisfies User;

      return {
        user: previewUser,
        token: await this.signToken({
          sub: previewUser.id,
          openid: previewUser.wechatOpenid,
          nickname: previewUser.nickname,
          membershipType: previewUser.membershipType,
          preferredGenre: previewUser.preferredGenre,
          membershipExpireAt: null,
        }),
      };
    }

    const nickname = input.nickname?.trim() || `作者${input.openid.slice(-4)}`;

    const user = await this.prisma.user.upsert({
      where: { wechatOpenid: input.openid },
      update: {
        nickname,
        preferredGenre: input.preferredGenre,
      },
      create: {
        nickname,
        preferredGenre: input.preferredGenre,
        wechatOpenid: input.openid,
      },
    });

    return {
      user,
      token: await this.signToken({
        sub: user.id,
        openid: user.wechatOpenid,
        nickname: user.nickname,
        membershipType: user.membershipType,
        preferredGenre: user.preferredGenre,
        membershipExpireAt: user.membershipExpireAt?.toISOString() ?? null,
      }),
    };
  }

  async getCurrentUser(currentUser: AuthUser): Promise<User> {
    if (isPreviewMode()) {
      return {
        id: currentUser.id,
        nickname: currentUser.nickname,
        avatar: null,
        wechatOpenid: currentUser.openid,
        phone: null,
        preferredGenre: currentUser.preferredGenre ?? '都市爽文',
        membershipType: currentUser.membershipType,
        membershipExpireAt: currentUser.membershipExpireAt ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const userId = currentUser.id;
    const dbUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) {
      throw new UnauthorizedException('用户不存在');
    }
    return dbUser;
  }

  getWechatLoginUrl(state?: string): string {
    const appId = this.configService.get<string>('WECHAT_APP_ID');
    const redirectUri = this.configService.get<string>('WECHAT_REDIRECT_URI');
    const scope = this.configService.get<string>(
      'WECHAT_SCOPE',
      'snsapi_login',
    );

    if (!appId || !redirectUri) {
      throw new ServiceUnavailableException('微信登录未配置完成');
    }

    const params = new URLSearchParams({
      appid: appId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      state: state ?? 'wenshu-login',
    });

    return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`;
  }

  async loginByWechatCode(
    code: string,
    preferredGenre?: string,
  ): Promise<{ user: User; token: string }> {
    const appId = this.configService.get<string>('WECHAT_APP_ID');
    const appSecret = this.configService.get<string>('WECHAT_APP_SECRET');

    if (!appId || !appSecret) {
      throw new ServiceUnavailableException('微信登录未配置完成');
    }

    const accessParams = new URLSearchParams({
      appid: appId,
      secret: appSecret,
      code,
      grant_type: 'authorization_code',
    });

    const accessResponse = await firstValueFrom(
      this.httpService.get<{
        access_token?: string;
        openid?: string;
        unionid?: string;
        errcode?: number;
        errmsg?: string;
      }>(
        `https://api.weixin.qq.com/sns/oauth2/access_token?${accessParams.toString()}`,
      ),
    );

    const accessData = accessResponse.data;

    if (!accessData.openid || accessData.errcode) {
      throw new UnauthorizedException(
        accessData.errmsg || '微信授权失败，请重新扫码登录',
      );
    }

    let nickname = `微信作者${accessData.openid.slice(-4)}`;

    if (accessData.access_token) {
      const profileParams = new URLSearchParams({
        access_token: accessData.access_token,
        openid: accessData.openid,
      });

      const profileResponse = await firstValueFrom(
        this.httpService.get<{
          nickname?: string;
        }>(
          `https://api.weixin.qq.com/sns/userinfo?${profileParams.toString()}`,
        ),
      );

      if (profileResponse.data.nickname) {
        nickname = profileResponse.data.nickname;
      }
    }

    return this.login({
      openid: accessData.openid,
      nickname,
      preferredGenre,
    });
  }

  private signToken(payload: {
    sub: string;
    openid: string;
    nickname: string;
    membershipType: MembershipType;
    preferredGenre?: string | null;
    membershipExpireAt?: string | null;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }
}
