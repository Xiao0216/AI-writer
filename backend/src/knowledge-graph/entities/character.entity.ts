import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'work_id' })
  @Index()
  workId: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50, nullable: true })
  alias: string;

  @Column({ length: 20, nullable: true })
  gender: string;

  @Column({ length: 50, nullable: true })
  age: string;

  @Column({ type: 'text', nullable: true })
  appearance: string;

  @Column({ type: 'text', nullable: true })
  personality: string;

  @Column({ type: 'text', nullable: true })
  background: string;

  @Column({ name: 'power_level', length: 100, nullable: true })
  powerLevel: string;

  @Column({ type: 'json', nullable: true })
  abilities: string[];

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ name: 'is_protagonist', default: false })
  isProtagonist: boolean;

  @Column({ name: 'first_appear_chapter', nullable: true })
  firstAppearChapter: number;

  @Column({ name: 'appear_count', default: 0 })
  appearCount: number;

  @Column({ type: 'json', nullable: true })
  relationships: Record<string, string>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('world_settings')
export class WorldSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'work_id' })
  @Index()
  workId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  type: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('timeline_events')
export class TimelineEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'work_id' })
  @Index()
  workId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'event_time', length: 100, nullable: true })
  eventTime: string;

  @Column({ name: 'chapter_number', nullable: true })
  chapterNumber: number;

  @Column({ name: 'is_key_event', default: false })
  isKeyEvent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('foreshadowings')
export class Foreshadowing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'work_id' })
  @Index()
  workId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'plant_chapter' })
  plantChapter: number;

  @Column({ name: 'expected_recall_chapter', nullable: true })
  expectedRecallChapter: number;

  @Column({ name: 'actual_recall_chapter', nullable: true })
  actualRecallChapter: number;

  @Column({ type: 'text', nullable: true })
  recallContent: string;

  @Column({ default: 'planted' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
