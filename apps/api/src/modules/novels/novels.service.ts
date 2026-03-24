import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Novel } from '@prisma/client';

import { isPreviewMode } from '../../common/utils/preview-mode';
import { NovelDocumentsService } from '../novel-documents/novel-documents.service';
import { PrismaService } from '../prisma/prisma.service';

type CreateNovelInput = {
  title: string;
  genre: string;
  synopsis?: string;
  targetWordCount?: number;
};

@Injectable()
export class NovelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly novelDocumentsService: NovelDocumentsService,
  ) {}

  async list(userId: string) {
    if (isPreviewMode()) {
      return [];
    }

    const novels = await this.prisma.novel.findMany({
      where: { userId },
      include: {
        chapters: {
          select: {
            title: true,
            status: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: { chapters: true, characters: true, outlines: true },
        },
        documents: {
          select: {
            type: true,
            content: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return novels.map((novel) => {
      const documentCompletionCount = novel.documents.filter(
        (document) => document.content.trim().length > 0,
      ).length;
      const completedChapterCount = novel.chapters.filter(
        (chapter) => chapter.status === 'COMPLETED',
      ).length;

      const latestDocumentUpdate = novel.documents.reduce<string | null>(
        (latest, document) => {
          const current = document.updatedAt.toISOString();
          if (!latest || current > latest) {
            return current;
          }
          return latest;
        },
        null,
      );

      const writingLog = novel.documents.find(
        (document) =>
          document.type === 'WRITING_LOG' && document.content.trim(),
      );
      const dynamicState = novel.documents.find(
        (document) =>
          document.type === 'DYNAMIC_STATE' && document.content.trim(),
      );

      const latestWritebackSummary = (() => {
        const source = writingLog?.content || dynamicState?.content;
        if (!source) {
          return null;
        }

        const lines = source
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
        const lastMeaningfulLine = [...lines]
          .reverse()
          .find(
            (line) =>
              line.startsWith('- ') ||
              line.startsWith('## ') ||
              line.startsWith('### '),
          );

        return (
          lastMeaningfulLine?.replace(/^[-#\s]+/, '') ?? lines.at(-1) ?? null
        );
      })();

      const latestChapter = novel.chapters[0] ?? null;

      const nextAction =
        documentCompletionCount < 3
          ? '优先补齐项目总览、主题命题和动态状态'
          : novel._count.chapters === 0
            ? '先创建第一章，再进入章节作战室'
            : latestChapter?.status === 'DRAFT'
              ? `先完成《${latestChapter.title}》并写回真相文件`
              : `继续推进下一章，最近已写回《${latestChapter?.title ?? '当前章节'}》`;

      const stage =
        documentCompletionCount < 3
          ? 'ALIGNMENT'
          : novel._count.chapters === 0
            ? 'OUTLINE_READY'
            : 'WRITING';

      return {
        ...novel,
        latestDocumentUpdate,
        documentCompletionCount,
        completedChapterCount,
        latestWritebackSummary,
        latestChapterTitle: latestChapter?.title ?? null,
        latestChapterStatus: latestChapter?.status ?? null,
        nextAction,
        stage,
      };
    });
  }

  async create(userId: string, input: CreateNovelInput): Promise<Novel> {
    if (isPreviewMode()) {
      return {
        id: 'preview-novel',
        userId,
        title: input.title.trim(),
        genre: input.genre.trim(),
        synopsis: input.synopsis ?? null,
        targetWordCount: input.targetWordCount ?? null,
        totalWordCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const novel = await this.prisma.novel.create({
      data: {
        userId,
        title: input.title.trim(),
        genre: input.genre.trim(),
        synopsis: input.synopsis,
        targetWordCount: input.targetWordCount,
      },
    });

    await this.novelDocumentsService.seedDefaults(novel.id);

    return novel;
  }

  async findOne(userId: string, novelId: string) {
    if (isPreviewMode()) {
      throw new NotFoundException('预览模式暂不提供作品详情');
    }

    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
      include: {
        chapters: { orderBy: { sortOrder: 'asc' } },
        outlines: { orderBy: { version: 'desc' } },
        characters: { orderBy: { updatedAt: 'desc' } },
        documents: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!novel) {
      throw new NotFoundException('作品不存在');
    }
    if (novel.userId !== userId) {
      throw new ForbiddenException('无权访问该作品');
    }
    return novel;
  }

  async remove(userId: string, novelId: string) {
    if (isPreviewMode()) {
      return { success: true };
    }

    await this.findOne(userId, novelId);
    await this.prisma.novel.delete({ where: { id: novelId } });
    return { success: true };
  }
}
