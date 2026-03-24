import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NovelDocumentType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

const DOCUMENT_BLUEPRINTS: Array<{ type: NovelDocumentType; title: string }> = [
  { type: 'PROJECT_OVERVIEW', title: '项目总览' },
  { type: 'THEME_AND_PROPOSITION', title: '主题与命题' },
  { type: 'WORLDBUILDING', title: '世界设定' },
  { type: 'CAST_BIBLE', title: '人物圣经' },
  { type: 'RELATIONSHIP_MAP', title: '关系图谱' },
  { type: 'MAIN_PLOTLINES', title: '主线与支线' },
  { type: 'FORESHADOW_LEDGER', title: '伏笔账本' },
  { type: 'CHAPTER_ROADMAP', title: '章节路线图' },
  { type: 'DYNAMIC_STATE', title: '动态状态' },
  { type: 'STYLE_GUIDE', title: '风格指南' },
  { type: 'WRITING_LOG', title: '写作日志' },
];

@Injectable()
export class NovelDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async seedDefaults(novelId: string) {
    await this.prisma.$transaction(
      DOCUMENT_BLUEPRINTS.map((document) =>
        this.prisma.novelDocument.upsert({
          where: {
            novelId_type: {
              novelId,
              type: document.type,
            },
          },
          update: {},
          create: {
            novelId,
            type: document.type,
            title: document.title,
          },
        }),
      ),
    );
  }

  async list(userId: string, novelId: string) {
    await this.assertNovelOwner(userId, novelId);

    return this.prisma.novelDocument.findMany({
      where: { novelId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(
    userId: string,
    novelId: string,
    documentId: string,
    input: { content?: string; title?: string },
  ) {
    await this.assertNovelOwner(userId, novelId);

    const existing = await this.prisma.novelDocument.findUnique({
      where: { id: documentId },
    });

    if (!existing || existing.novelId !== novelId) {
      throw new NotFoundException('项目真相文件不存在');
    }

    return this.prisma.novelDocument.update({
      where: { id: documentId },
      data: {
        title: input.title ?? existing.title,
        content: input.content ?? existing.content,
      },
    });
  }

  private async assertNovelOwner(userId: string, novelId: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
    });

    if (!novel) {
      throw new NotFoundException('作品不存在');
    }

    if (novel.userId !== userId) {
      throw new ForbiddenException('无权访问该作品');
    }
  }
}
