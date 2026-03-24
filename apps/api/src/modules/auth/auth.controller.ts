import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthUser } from '../../common/types/auth-user';
import { AuthService } from './auth.service';

class LoginDto {
  @IsString()
  openid!: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  preferredGenre?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('dev-login')
  async devLogin(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(body);
    this.setCookie(response, result.token);
    return { user: result.user };
  }

  @Get('wechat/url')
  getWechatUrl(@Query('state') state?: string) {
    return {
      url: this.authService.getWechatLoginUrl(state),
    };
  }

  @Get('wechat/start')
  wechatStart(
    @Query('state') state: string | undefined,
    @Res() response: Response,
  ) {
    response.redirect(this.authService.getWechatLoginUrl(state));
  }

  @Get('wechat/callback')
  async wechatCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!code) {
      response.redirect(
        `${this.getFrontendUrl()}/login?error=wechat_code_missing`,
      );
      return;
    }

    const result = await this.authService.loginByWechatCode(code);
    this.setCookie(response, result.token);
    response.redirect(
      `${this.getFrontendUrl()}/dashboard?login=wechat&state=${encodeURIComponent(
        state ?? '',
      )}`,
    );
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('wenshu_token');
    return { success: true };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    return this.authService.getCurrentUser(user);
  }

  private setCookie(response: Response, token: string): void {
    response.cookie('wenshu_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private getFrontendUrl(): string {
    return this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }
}
