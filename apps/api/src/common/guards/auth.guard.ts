import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { MembershipType } from '@prisma/client';
import type { Request } from 'express';

import type { AuthUser } from '../types/auth-user';

type JwtPayload = {
  sub: string;
  openid: string;
  nickname: string;
  membershipType: MembershipType;
  preferredGenre?: string | null;
  membershipExpireAt?: string | null;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    const token = this.getToken(request);

    if (!token) {
      throw new UnauthorizedException('请先登录');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET')?.trim() || 'change-me';
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });
      request.user = {
        id: payload.sub,
        openid: payload.openid,
        nickname: payload.nickname,
        membershipType: payload.membershipType,
        preferredGenre: payload.preferredGenre,
        membershipExpireAt: payload.membershipExpireAt
          ? new Date(payload.membershipExpireAt)
          : null,
      };
      return true;
    } catch {
      throw new UnauthorizedException('登录状态已失效');
    }
  }

  private getToken(request: Request): string | undefined {
    const cookieToken = request.cookies?.wenshu_token as string | undefined;
    if (cookieToken) {
      return cookieToken;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return undefined;
    }

    return authHeader.slice(7);
  }
}
