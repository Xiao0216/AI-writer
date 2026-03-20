import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Chapter } from './entities/chapter.entity';
import { ChapterStatus } from '../common/constants';
import { countChineseWords } from '../common/utils/common.utils';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
  ) {}

  async findByWork(workId: string, userId: string) {
    return this.chapterRepository.find({
      where: { workId },
      order: { chapterNumber: 'ASC' },
    });
  }

  async findById(id: string, workId: string): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({
      where: { id, workId },
    });
    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }
    return chapter;
  }

  async create(workId: string, data: Partial<Chapter>): Promise<Chapter> {
    // 获取最新章节号
    const lastChapter = await this.chapterRepository.findOne({
      where: { workId },
      order: { chapterNumber: 'DESC' },
    });
    
    const chapterNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1;
    
    const chapter = this.chapterRepository.create({
      ...data,
      workId,
      chapterNumber,
      wordCount: data.content ? countChineseWords(data.content) : 0,
    });
    
    return this.chapterRepository.save(chapter);
  }

  async update(id: string, workId: string, data: Partial<Chapter>): Promise<Chapter> {
    await this.findById(id, workId);
    
    if (data.content) {
      data.wordCount = countChineseWords(data.content);
    }
    
    await this.chapterRepository.update(id, data);
    return this.findById(id, workId);
  }

  async delete(id: string, workId: string): Promise<void> {
    await this.findById(id, workId);
    await this.chapterRepository.update(id, { deletedAt: new Date() });
  }

  async publish(id: string, workId: string): Promise<Chapter> {
    const chapter = await this.findById(id, workId);
    return this.update(id, workId, {
      status: ChapterStatus.PUBLISHED,
      publishedAt: new Date(),
    });
  }

  async reorder(workId: string, chapterIds: string[]): Promise<void> {
    for (let i = 0; i < chapterIds.length; i++) {
      await this.chapterRepository.update(chapterIds[i], { chapterNumber: i + 1 });
    }
  }
}
