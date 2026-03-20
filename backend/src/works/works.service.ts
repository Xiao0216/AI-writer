import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Work } from './entities/work.entity';
import { WorkStatus } from '../common/constants';

@Injectable()
export class WorksService {
  constructor(
    @InjectRepository(Work)
    private workRepository: Repository<Work>,
  ) {}

  async findAll(userId: string, options?: { status?: WorkStatus; page?: number; pageSize?: number }) {
    const { status, page = 1, pageSize = 20 } = options || {};
    
    const query = this.workRepository.createQueryBuilder('work')
      .where('work.author_id = :userId', { userId })
      .andWhere('work.deleted_at IS NULL');
    
    if (status) {
      query.andWhere('work.status = :status', { status });
    }
    
    const [data, total] = await query
      .orderBy('work.updated_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    
    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string, userId: string): Promise<Work> {
    const work = await this.workRepository.findOne({
      where: { id, authorId: userId },
    });
    if (!work) {
      throw new NotFoundException('作品不存在');
    }
    return work;
  }

  async create(userId: string, data: Partial<Work>): Promise<Work> {
    const work = this.workRepository.create({
      ...data,
      authorId: userId,
    });
    return this.workRepository.save(work);
  }

  async update(id: string, userId: string, data: Partial<Work>): Promise<Work> {
    await this.findById(id, userId); // 验证权限
    await this.workRepository.update(id, data);
    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findById(id, userId);
    await this.workRepository.update(id, { deletedAt: new Date() });
  }

  async updateWordCount(id: string, wordCount: number): Promise<void> {
    await this.workRepository.increment({ id }, 'actualWords', wordCount);
    await this.workRepository.increment({ id }, 'chapterCount', 1);
    await this.workRepository.update(id, { lastChapterAt: new Date() });
  }

  async getStats(id: string, userId: string): Promise<any> {
    const work = await this.findById(id, userId);
    return {
      totalWords: work.actualWords,
      chapterCount: work.chapterCount,
      expectedWords: work.expectedWords,
      progress: work.expectedWords > 0 
        ? Math.round((work.actualWords / work.expectedWords) * 100) 
        : 0,
      status: work.status,
      lastChapterAt: work.lastChapterAt,
    };
  }
}
