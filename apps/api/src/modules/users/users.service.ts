import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';

import { isPreviewMode } from '../../common/utils/preview-mode';
import { PrismaService } from '../prisma/prisma.service';

type UpdateProfileInput = {
  nickname?: string;
  avatar?: string;
  preferredGenre?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<User> {
    if (isPreviewMode()) {
      return {
        id: userId,
        nickname: input.nickname?.trim() || '预览作者',
        avatar: input.avatar ?? null,
        wechatOpenid: 'preview-writer',
        phone: null,
        preferredGenre: input.preferredGenre ?? '都市爽文',
        membershipType: 'FREE',
        membershipExpireAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existing) {
      throw new NotFoundException('用户不存在');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        nickname: input.nickname?.trim() || existing.nickname,
        avatar: input.avatar,
        preferredGenre: input.preferredGenre,
      },
    });
  }
}
