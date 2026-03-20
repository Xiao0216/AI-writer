import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ChapterStatus } from '../../common/constants';

@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'work_id' })
  @Index()
  workId: string;

  @Column({ length: 100 })
  title: string;

  @Column({ name: 'chapter_number' })
  chapterNumber: number;

  @Column({ name: 'volume_number', default: 1 })
  volumeNumber: number;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ name: 'word_count', default: 0 })
  wordCount: number;

  @Column({
    type: 'enum',
    enum: ChapterStatus,
    default: ChapterStatus.DRAFT,
  })
  status: ChapterStatus;

  @Column({ name: 'is_ai_generated', default: false })
  isAiGenerated: boolean;

  @Column({ name: 'ai_generation_count', default: 0 })
  aiGenerationCount: number;

  @Column({ name: 'plot_node_id', nullable: true })
  plotNodeId: string;

  @Column({ name: 'author_notes', type: 'text', nullable: true })
  authorNotes: string;

  @Column({ name: 'writing_duration', default: 0 })
  writingDuration: number;

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  publishedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date;
}
