import { IsString, IsOptional, MaxLength, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '昵称' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  nickname?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: '创作年限' })
  @IsOptional()
  creationYears?: number;

  @ApiPropertyOptional({ description: '偏好品类' })
  @IsOptional()
  preferredCategory?: string[];

  @ApiPropertyOptional({ description: '目标平台' })
  @IsOptional()
  targetPlatforms?: string[];

  @ApiPropertyOptional({ description: '每日字数目标' })
  @IsOptional()
  dailyWordGoal?: number;
}
