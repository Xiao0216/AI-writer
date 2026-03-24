import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NovelDocumentType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type CreateChapterInput = {
  title: string;
};

type UpdateChapterInput = {
  title?: string;
  content?: string;
  plainText?: string;
};

type CompleteChapterInput = {
  completionNote?: string;
};

@Injectable()
export class ChaptersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, novelId: string) {
    await this.assertNovelOwner(userId, novelId);
    return this.prisma.chapter.findMany({
      where: { novelId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(userId: string, novelId: string, input: CreateChapterInput) {
    await this.assertNovelOwner(userId, novelId);
    const last = await this.prisma.chapter.findFirst({
      where: { novelId },
      orderBy: { sortOrder: 'desc' },
    });

    return this.prisma.chapter.create({
      data: {
        novelId,
        title: input.title.trim(),
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
  }

  async update(
    userId: string,
    novelId: string,
    chapterId: string,
    input: UpdateChapterInput,
  ) {
    await this.assertNovelOwner(userId, novelId);
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });
    if (!chapter || chapter.novelId !== novelId) {
      throw new NotFoundException('章节不存在');
    }

    const plainText = input.plainText ?? chapter.plainText;

    const updated = await this.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        title: input.title ?? chapter.title,
        content: input.content ?? chapter.content,
        plainText,
        wordCount: this.getWordCount(plainText),
      },
    });

    await this.refreshNovelWordCount(novelId);
    return updated;
  }

  async remove(userId: string, novelId: string, chapterId: string) {
    await this.assertNovelOwner(userId, novelId);
    await this.prisma.chapter.delete({ where: { id: chapterId } });
    await this.refreshNovelWordCount(novelId);
    return { success: true };
  }

  async reorder(userId: string, novelId: string, chapterIds: string[]) {
    await this.assertNovelOwner(userId, novelId);

    await this.prisma.$transaction(
      chapterIds.map((chapterId, index) =>
        this.prisma.chapter.update({
          where: { id: chapterId },
          data: { sortOrder: index },
        }),
      ),
    );

    return this.list(userId, novelId);
  }

  async complete(
    userId: string,
    novelId: string,
    chapterId: string,
    input: CompleteChapterInput,
  ) {
    await this.assertNovelOwner(userId, novelId);

    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter || chapter.novelId !== novelId) {
      throw new NotFoundException('章节不存在');
    }

    const completedChapter = await this.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        status: 'COMPLETED',
        updatedAt: input.completionNote ? new Date() : undefined,
      },
    });

    await this.appendDynamicStateEntry(
      novelId,
      completedChapter,
      input.completionNote,
    );
    await this.appendChapterRoadmapEntry(novelId, completedChapter);
    await this.appendWritingLogEntry(
      novelId,
      completedChapter,
      input.completionNote,
    );

    return completedChapter;
  }

  private async appendDynamicStateEntry(
    novelId: string,
    chapter: { title: string; wordCount: number },
    completionNote?: string,
  ) {
    const dynamicState = await this.prisma.novelDocument.findUnique({
      where: {
        novelId_type: {
          novelId,
          type: NovelDocumentType.DYNAMIC_STATE,
        },
      },
    });

    if (!dynamicState) {
      return;
    }

    const timestamp = new Date().toLocaleString('zh-CN', {
      hour12: false,
    });
    const nextEntry = [
      `## ${chapter.title}`,
      `- 完成时间：${timestamp}`,
      `- 当前章节字数：${chapter.wordCount}`,
      `- 状态变化：章节已标记为 COMPLETED`,
      `- 下一步动作：补角色变化、情节线推进和待回收债务`,
      completionNote ? `- 备注：${completionNote}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const content = dynamicState.content
      ? `${dynamicState.content.trim()}\n\n${nextEntry}`
      : nextEntry;

    await this.prisma.novelDocument.update({
      where: { id: dynamicState.id },
      data: { content },
    });
  }

  private async appendChapterRoadmapEntry(
    novelId: string,
    chapter: { title: string; wordCount: number },
  ) {
    const roadmap = await this.prisma.novelDocument.findUnique({
      where: {
        novelId_type: {
          novelId,
          type: NovelDocumentType.CHAPTER_ROADMAP,
        },
      },
    });

    if (!roadmap) {
      return;
    }

    const line = `- ${chapter.title}：已完成，当前章节字数 ${chapter.wordCount}，下一步进入后续章节控制卡生成。`;
    const content = roadmap.content
      ? `${roadmap.content.trim()}\n${line}`
      : line;

    await this.prisma.novelDocument.update({
      where: { id: roadmap.id },
      data: { content },
    });
  }

  private async appendWritingLogEntry(
    novelId: string,
    chapter: { title: string; wordCount: number },
    completionNote?: string,
  ) {
    const writingLog = await this.prisma.novelDocument.findUnique({
      where: {
        novelId_type: {
          novelId,
          type: NovelDocumentType.WRITING_LOG,
        },
      },
    });

    if (!writingLog) {
      return;
    }

    const timestamp = new Date().toLocaleString('zh-CN', {
      hour12: false,
    });
    const logEntry = [
      `### ${timestamp}`,
      `- 完成章节：${chapter.title}`,
      `- 本章字数：${chapter.wordCount}`,
      completionNote ? `- 备注：${completionNote}` : '- 备注：前端触发完成章节',
    ].join('\n');

    const content = writingLog.content
      ? `${writingLog.content.trim()}\n\n${logEntry}`
      : logEntry;

    await this.prisma.novelDocument.update({
      where: { id: writingLog.id },
      data: { content },
    });
  }

  private async refreshNovelWordCount(novelId: string): Promise<void> {
    const chapters = await this.prisma.chapter.findMany({
      where: { novelId },
      select: { wordCount: true },
    });
    const totalWordCount = chapters.reduce(
      (sum, chapter) => sum + chapter.wordCount,
      0,
    );

    await this.prisma.novel.update({
      where: { id: novelId },
      data: { totalWordCount },
    });
  }

  private getWordCount(text: string): number {
    return text.replace(/\s+/g, '').length;
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
