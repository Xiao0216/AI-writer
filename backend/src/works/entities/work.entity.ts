import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { WorkStatus, WorkCategory, TargetPlatform } from '../../common/constants';

@Entity('works')
export class Work {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @Index()
  title: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: WorkCategory,
    default: WorkCategory.QITA,
  })
  category: WorkCategory;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({
    type: 'enum',
    enum: TargetPlatform,
    default: TargetPlatform.OTHER,
    name: 'target_platform',
  })
  targetPlatform: TargetPlatform;

  @Column({ name: 'expected_words', default: 0 })
  expectedWords: number;

  @Column({ name: 'actual_words', default: 0 })
  actualWords: number;

  @Column({ name: 'chapter_count', default: 0 })
  chapterCount: number;

  @Column({ name: 'cover_url', length: 255, nullable: true })
  coverUrl: string;

  @Column({
    type: 'enum',
    enum: WorkStatus,
    default: WorkStatus.DRAFT,
  })
  status: WorkStatus;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'last_chapter_at', type: 'datetime', nullable: true })
  lastChapterAt: Date;

  @Column({ name: 'daily_words', type: 'json', nullable: true })
  dailyWords: Record<string, number>;

  @Column({ name: 'total_reading_time', default: 0 })
  totalReadingTime: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date;
}
