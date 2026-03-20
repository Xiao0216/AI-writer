import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto) {
    const { phone, password, nickname } = registerDto;

    // 检查手机号是否已注册
    const existingUser = await this.userRepository.findOne({ where: { phone } });
    if (existingUser) {
      throw new BadRequestException('该手机号已注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepository.create({
      phone,
      password: hashedPassword,
      nickname: nickname || `用户${phone.slice(-4)}`,
    });

    await this.userRepository.save(user);

    // 生成 token
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.phone, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 更新最后登录时间
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
      lastLoginIp: loginDto.ip,
    });

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * 验证用户
   */
  async validateUser(phone: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * 刷新 Token
   */
  async refreshToken(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return this.generateTokens(user);
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(phone: string) {
    // TODO: 实现短信验证码发送
    // 生成6位验证码
    const code = Math.random().toString().slice(-6);
    
    // 存储到 Redis，设置5分钟过期
    // await this.redisService.set(`verify:${phone}`, code, 300);

    // 发送短信
    // await this.smsService.send(phone, code);

    return { message: '验证码已发送' };
  }

  /**
   * 手机号验证码登录
   */
  async loginWithCode(phone: string, code: string) {
    // TODO: 实现验证码验证
    // const storedCode = await this.redisService.get(`verify:${phone}`);
    // if (!storedCode || storedCode !== code) {
    //   throw new UnauthorizedException('验证码错误或已过期');
    // }

    let user = await this.userRepository.findOne({ where: { phone } });
    
    // 如果用户不存在，自动注册
    if (!user) {
      user = this.userRepository.create({
        phone,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        nickname: `用户${phone.slice(-4)}`,
      });
      await this.userRepository.save(user);
    }

    const tokens = await this.generateTokens(user);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * 生成访问令牌
   */
  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: 7 * 24 * 60 * 60, // 7天
    };
  }

  /**
   * 移除敏感信息
   */
  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
