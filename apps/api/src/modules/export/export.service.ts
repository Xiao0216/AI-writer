import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportNovel(userId: string, novelId: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
      include: { chapters: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!novel) {
      throw new NotFoundException('作品不存在');
    }
    if (novel.userId !== userId) {
      throw new ForbiddenException('无权导出该作品');
    }

    const content = novel.chapters
      .map(
        (chapter) =>
          `${chapter.title}\n\n${chapter.plainText || chapter.content}`,
      )
      .join('\n\n');

    return {
      filename: `${novel.title}.txt`,
      content,
    };
  }
}
