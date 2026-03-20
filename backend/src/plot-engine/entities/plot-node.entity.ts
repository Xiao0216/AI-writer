import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { NodeType, NodeStatus } from '../../common/constants';

@Entity('plot_nodes')
export class PlotNode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'work_id' })
  @Index()
  workId: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'chapter_number', nullable: true })
  chapterNumber: number;

  @Column({ name: 'volume_number', default: 1 })
  volumeNumber: number;

  @Column({ name: 'node_order' })
  nodeOrder: number;

  @Column({ type: 'enum', enum: NodeType, default: NodeType.OPTIONAL })
  type: NodeType;

  @Column({ type: 'enum', enum: NodeStatus, default: NodeStatus.PENDING })
  status: NodeStatus;

  @Column({ type: 'json', nullable: true })
  keyEvents: string[];

  @Column({ type: 'json', nullable: true })
  characters: string[];

  @Column({ type: 'json', nullable: true })
  emotions: string[];

  @Column({ name: 'expected_word_count', nullable: true })
  expectedWordCount: number;

  @Column({ name: 'actual_word_count', default: 0 })
  actualWordCount: number;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('plot_outlines')
export class PlotOutline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'work_id' })
  @Index()
  workId: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'total_volumes', default: 1 })
  totalVolumes: number;

  @Column({ type: 'json', nullable: true })
  structure: any;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
