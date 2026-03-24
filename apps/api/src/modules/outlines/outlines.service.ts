import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type UpsertOutlineInput = {
  title?: string;
  content: string;
};

@Injectable()
export class OutlinesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, novelId: string) {
    await this.assertNovelOwner(userId, novelId);
    return this.prisma.outline.findMany({
      where: { novelId },
      orderBy: { version: 'desc' },
    });
  }

  async create(userId: string, novelId: string, input: UpsertOutlineInput) {
    await this.assertNovelOwner(userId, novelId);
    const latest = await this.prisma.outline.findFirst({
      where: { novelId },
      orderBy: { version: 'desc' },
    });

    return this.prisma.outline.create({
      data: {
        novelId,
        title: input.title,
        content: input.content,
        version: (latest?.version ?? 0) + 1,
      },
    });
  }

  async update(
    userId: string,
    novelId: string,
    outlineId: string,
    input: UpsertOutlineInput,
  ) {
    await this.assertNovelOwner(userId, novelId);
    return this.prisma.outline.update({
      where: { id: outlineId },
      data: { title: input.title, content: input.content },
    });
  }

  private async assertNovelOwner(
    userId: string,
    novelId: string,
  ): Promise<void> {
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
    });
    if (!novel) {
      throw new NotFoundException('作品不存在');
    }
    if (novel.userId !== userId) {
      throw new ForbiddenException('无权操作该作品');
    }
  }
}
