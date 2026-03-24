import { Injectable } from '@nestjs/common';
import type { MembershipType, Prisma } from '@prisma/client';

import { isPreviewMode } from '../../common/utils/preview-mode';
import { PrismaService } from '../prisma/prisma.service';

const FREE_DAILY_LIMIT = 30;

@Injectable()
export class MembershipService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(userId: string) {
    if (isPreviewMode()) {
      return {
        membershipType: 'FREE' as MembershipType,
        membershipExpireAt: null,
        dailyLimit: FREE_DAILY_LIMIT,
        usedToday: 0,
        remainingToday: FREE_DAILY_LIMIT,
      };
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const usedToday = await this.getUsageToday(userId);

    return {
      membershipType: user.membershipType,
      membershipExpireAt: user.membershipExpireAt,
      dailyLimit: user.membershipType === 'FREE' ? FREE_DAILY_LIMIT : null,
      usedToday,
      remainingToday:
        user.membershipType === 'FREE'
          ? Math.max(FREE_DAILY_LIMIT - usedToday, 0)
          : null,
    };
  }

  async assertCanGenerate(userId: string): Promise<void> {
    const status = await this.getStatus(userId);
    if (status.membershipType === 'FREE' && (status.remainingToday ?? 0) <= 0) {
      throw new Error('今日免费生成次数已用完');
    }
  }

  async upgradeToMember(userId: string) {
    if (isPreviewMode()) {
      const expireAt = new Date();
      expireAt.setMonth(expireAt.getMonth() + 1);

      return {
        id: userId,
        nickname: '预览作者',
        avatar: null,
        wechatOpenid: 'preview-writer',
        phone: null,
        preferredGenre: '都市爽文',
        membershipType: 'MEMBER' as MembershipType,
        membershipExpireAt: expireAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return this.activatePaidMembership(userId, 1);
  }

  private async getUsageToday(userId: string): Promise<number> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.prisma.generationLog.count({
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });
  }

  async activatePaidMembership(
    userId: string,
    months: number,
    db: Pick<Prisma.TransactionClient, 'user'> = this.prisma,
    baseTime = new Date(),
  ) {
    const user = await db.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const effectiveBase =
      user.membershipExpireAt && user.membershipExpireAt > baseTime
        ? user.membershipExpireAt
        : baseTime;
    const expireAt = new Date(effectiveBase);
    expireAt.setMonth(expireAt.getMonth() + months);

    return db.user.update({
      where: { id: userId },
      data: {
        membershipType: 'MEMBER' as MembershipType,
        membershipExpireAt: expireAt,
      },
    });
  }
}
