import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PlotNode, PlotOutline } from './entities/plot-node.entity';
import { NodeStatus } from '../common/constants';

/**
 * 剧情引擎服务
 * 核心功能：节点式剧情管控
 */
@Injectable()
export class PlotEngineService {
  private readonly logger = new Logger(PlotEngineService.name);

  constructor(
    @InjectRepository(PlotNode)
    private plotNodeRepository: Repository<PlotNode>,
    @InjectRepository(PlotOutline)
    private plotOutlineRepository: Repository<PlotOutline>,
  ) {}

  // ==================== 剧情节点管理 ====================

  async createNode(workId: string, data: Partial<PlotNode>): Promise<PlotNode> {
    const node = this.plotNodeRepository.create({ ...data, workId });
    return this.plotNodeRepository.save(node);
  }

  async getNodes(workId: string, volumeNumber?: number): Promise<PlotNode[]> {
    const where: any = { workId };
    if (volumeNumber) where.volumeNumber = volumeNumber;
    
    return this.plotNodeRepository.find({
      where,
      order: { nodeOrder: 'ASC' },
    });
  }

  async getNode(id: string): Promise<PlotNode> {
    return this.plotNodeRepository.findOne({ where: { id } });
  }

  async updateNode(id: string, data: Partial<PlotNode>): Promise<PlotNode> {
    await this.plotNodeRepository.update(id, data);
    return this.getNode(id);
  }

  async deleteNode(id: string): Promise<void> {
    await this.plotNodeRepository.delete(id);
  }

  /**
   * 批量创建节点（从大纲导入）
   */
  async importFromOutline(workId: string, outline: PlotOutline): Promise<PlotNode[]> {
    const nodes: PlotNode[] = [];
    let order = 0;

    for (const volume of outline.structure.volumes) {
      // 创建卷节点
      const volumeNode = await this.createNode(workId, {
        title: volume.title,
        description: volume.description,
        volumeNumber: volume.number,
        nodeOrder: order++,
        type: 'required' as any,
      });
      nodes.push(volumeNode);
    }

    return nodes;
  }

  /**
   * 标记节点完成
   */
  async completeNode(id: string, actualWordCount: number): Promise<PlotNode> {
    return this.updateNode(id, {
      status: NodeStatus.COMPLETED,
      actualWordCount,
      completedAt: new Date(),
    });
  }

  // ==================== 剧情大纲管理 ====================

  async createOutline(workId: string, data: Partial<PlotOutline>): Promise<PlotOutline> {
    const outline = this.plotOutlineRepository.create({ ...data, workId });
    return this.plotOutlineRepository.save(outline);
  }

  async getOutline(workId: string): Promise<PlotOutline> {
    return this.plotOutlineRepository.findOne({ where: { workId } });
  }

  async approveOutline(id: string): Promise<PlotOutline> {
    await this.plotOutlineRepository.update(id, { isApproved: true });
    return this.plotOutlineRepository.findOne({ where: { id } });
  }

  // ==================== 节点约束校验 ====================

  /**
   * 校验内容是否符合节点约束
   */
  async validateNodeConstraints(nodeId: string, content: string): Promise<{
    isValid: boolean;
    violations: Array<{
      type: string;
      description: string;
    }>;
    score: number;
  }> {
    const node = await this.getNode(nodeId);
    if (!node) {
      return { isValid: false, violations: [{ type: 'node_not_found', description: '节点不存在' }], score: 0 };
    }

    this.logger.log(`校验节点约束: ${node.title}`);
    
    // TODO: 实现约束校验
    // 1. 检查必须包含的事件是否出现
    // 2. 检查必须避免的内容是否出现
    // 3. 检查角色行为是否符合规则
    // 4. 检查节奏要求
    
    return {
      isValid: true,
      violations: [],
      score: 100,
    };
  }

  /**
   * 获取下一个待执行的节点
   */
  async getNextNode(workId: string): Promise<PlotNode | null> {
    const nodes = await this.getNodes(workId);
    return nodes.find(n => n.status === NodeStatus.PENDING) || null;
  }

  /**
   * 获取节点进度
   */
  async getNodeProgress(workId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    percentage: number;
  }> {
    const nodes = await this.getNodes(workId);
    const total = nodes.length;
    const completed = nodes.filter(n => n.status === NodeStatus.COMPLETED).length;
    const inProgress = nodes.filter(n => n.status === NodeStatus.IN_PROGRESS).length;
    const pending = nodes.filter(n => n.status === NodeStatus.PENDING).length;

    return {
      total,
      completed,
      inProgress,
      pending,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  // ==================== 节奏分析 ====================

  /**
   * 分析作品节奏
   */
  async analyzeRhythm(workId: string): Promise<{
    averageClimaxInterval: number;
    emotionalArc: string[];
    pacing: 'fast' | 'medium' | 'slow';
    suggestions: string[];
  }> {
    this.logger.log(`分析作品节奏: ${workId}`);
    
    // TODO: 实现节奏分析
    // 1. 分析高潮间隔
    // 2. 分析情绪曲线
    // 3. 分析节奏快慢
    // 4. 生成优化建议
    
    return {
      averageClimaxInterval: 0,
      emotionalArc: [],
      pacing: 'medium',
      suggestions: [],
    };
  }
}
