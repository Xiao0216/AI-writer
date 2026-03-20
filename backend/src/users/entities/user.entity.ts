import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserRole } from '../../common/constants';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  @Index()
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 100 })
  password: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: 'membership_expire_at', type: 'datetime', nullable: true })
  membershipExpireAt: Date;

  @Column({ name: 'creation_years', default: 0 })
  creationYears: number;

  @Column({ name: 'preferred_category', type: 'json', nullable: true })
  preferredCategory: string[];

  @Column({ name: 'target_platforms', type: 'json', nullable: true })
  targetPlatforms: string[];

  @Column({ name: 'daily_word_goal', default: 2000 })
  dailyWordGoal: number;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', length: 45, nullable: true })
  lastLoginIp: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关联关系
  // @OneToMany(() => Work, (work) => work.author)
  // works: Work[];
}
