import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Character, WorldSetting, TimelineEvent, Foreshadowing } from './entities/character.entity';

/**
 * 知识图谱服务
 * 核心功能：构建和维护小说全生命周期知识图谱
 */
@Injectable()
export class KnowledgeGraphService {
  private readonly logger = new Logger(KnowledgeGraphService.name);

  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(WorldSetting)
    private worldSettingRepository: Repository<WorldSetting>,
    @InjectRepository(TimelineEvent)
    private timelineEventRepository: Repository<TimelineEvent>,
    @InjectRepository(Foreshadowing)
    private foreshadowingRepository: Repository<Foreshadowing>,
  ) {}

  /**
   * 自动构建知识图谱
   * 基于已写内容自动抽取实体和关系
   */
  async buildKnowledgeGraph(workId: string, content: string, chapterNumber: number) {
    this.logger.log(`构建知识图谱: 作品 ${workId}, 章节 ${chapterNumber}`);
    
    // TODO: 实现知识图谱构建
    // 1. NER 实体识别（角色、地点、组织等）
    // 2. 关系抽取
    // 3. 实体链接（与已有图谱对齐）
    // 4. 更新 Neo4j 图数据库
    
    // 临时返回
    return {
      characters: [],
      settings: [],
      events: [],
      foreshadowings: [],
    };
  }

  // ==================== 角色管理 ====================

  async createCharacter(workId: string, data: Partial<Character>): Promise<Character> {
    const character = this.characterRepository.create({ ...data, workId });
    return this.characterRepository.save(character);
  }

  async getCharacters(workId: string): Promise<Character[]> {
    return this.characterRepository.find({ where: { workId } });
  }

  async getCharacter(id: string): Promise<Character> {
    return this.characterRepository.findOne({ where: { id } });
  }

  async updateCharacter(id: string, data: Partial<Character>): Promise<Character> {
    await this.characterRepository.update(id, data);
    return this.getCharacter(id);
  }

  async deleteCharacter(id: string): Promise<void> {
    await this.characterRepository.delete(id);
  }

  // ==================== 世界观管理 ====================

  async createWorldSetting(workId: string, data: Partial<WorldSetting>): Promise<WorldSetting> {
    const setting = this.worldSettingRepository.create({ ...data, workId });
    return this.worldSettingRepository.save(setting);
  }

  async getWorldSettings(workId: string): Promise<WorldSetting[]> {
    return this.worldSettingRepository.find({ where: { workId } });
  }

  // ==================== 时间线管理 ====================

  async createTimelineEvent(workId: string, data: Partial<TimelineEvent>): Promise<TimelineEvent> {
    const event = this.timelineEventRepository.create({ ...data, workId });
    return this.timelineEventRepository.save(event);
  }

  async getTimelineEvents(workId: string): Promise<TimelineEvent[]> {
    return this.timelineEventRepository.find({
      where: { workId },
      order: { chapterNumber: 'ASC' },
    });
  }

  // ==================== 伏笔管理 ====================

  async createForeshadowing(workId: string, data: Partial<Foreshadowing>): Promise<Foreshadowing> {
    const foreshadowing = this.foreshadowingRepository.create({ ...data, workId });
    return this.foreshadowingRepository.save(foreshadowing);
  }

  async getForeshadowings(workId: string, status?: string): Promise<Foreshadowing[]> {
    const where: any = { workId };
    if (status) where.status = status;
    return this.foreshadowingRepository.find({ where });
  }

  async recallForeshadowing(id: string, chapterNumber: number, content: string): Promise<Foreshadowing> {
    await this.foreshadowingRepository.update(id, {
      status: 'recalled' as any,
      actualRecallChapter: chapterNumber as any,
      recallContent: content as any,
    });
    return this.foreshadowingRepository.findOne({ where: { id } });
  }

  // ==================== 一致性校验 ====================

  /**
   * 校验内容是否与知识图谱冲突
   */
  async validateConsistency(workId: string, content: string, chapterNumber: number = 0): Promise<{
    isValid: boolean;
    conflicts: Array<{
      type: string;
      description: string;
      suggestion: string;
    }>;
  }> {
    this.logger.log(`校验一致性: 作品 ${workId}`);
    
    // TODO: 实现一致性校验
    // 1. 抽取内容中的实体
    // 2. 与图谱对比
    // 3. 检测冲突（OOC、设定矛盾、时间线错乱等）
    // 4. 生成修正建议
    
    return {
      isValid: true,
      conflicts: [],
    };
  }

  /**
   * 获取图谱摘要
   */
  async getGraphSummary(workId: string): Promise<{
    characterCount: number;
    settingCount: number;
    eventCount: number;
    foreshadowingCount: {
      planted: number;
      recalled: number;
      abandoned: number;
    };
  }> {
    const [characterCount, settingCount, eventCount] = await Promise.all([
      this.characterRepository.count({ where: { workId } }),
      this.worldSettingRepository.count({ where: { workId } }),
      this.timelineEventRepository.count({ where: { workId } }),
    ]);

    const [planted, recalled, abandoned] = await Promise.all([
      this.foreshadowingRepository.count({ where: { workId, status: 'planted' } }),
      this.foreshadowingRepository.count({ where: { workId, status: 'recalled' } }),
      this.foreshadowingRepository.count({ where: { workId, status: 'abandoned' } }),
    ]);

    return {
      characterCount,
      settingCount,
      eventCount,
      foreshadowingCount: { planted, recalled, abandoned },
    };
  }
}
