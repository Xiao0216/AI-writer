import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { UserRole } from '../common/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  async updatePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);
    
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error('原密码错误');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(id, { password: hashedPassword });
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    await this.userRepository.update(id, { role });
    return this.findById(id);
  }

  async updateMembership(id: string, expireAt: Date): Promise<User> {
    await this.userRepository.update(id, { membershipExpireAt: expireAt });
    return this.findById(id);
  }

  async getStats(id: string): Promise<{
    totalWorks: number;
    totalWords: number;
    totalChapters: number;
    avgDailyWords: number;
  }> {
    // TODO: 实现统计数据查询
    return {
      totalWorks: 0,
      totalWords: 0,
      totalChapters: 0,
      avgDailyWords: 0,
    };
  }

  async deactivate(id: string): Promise<void> {
    await this.userRepository.update(id, { isActive: false });
  }
}
