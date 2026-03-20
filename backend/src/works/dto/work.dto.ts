import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkCategory, TargetPlatform } from '../../common/constants';

export class CreateWorkDto {
  @ApiProperty({ description: '作品标题' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: '作品品类', enum: WorkCategory })
  @IsEnum(WorkCategory)
  category: WorkCategory;

  @ApiProperty({ description: '目标平台', enum: TargetPlatform })
  @IsEnum(TargetPlatform)
  targetPlatform: TargetPlatform;

  @ApiPropertyOptional({ description: '作品简介' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: '预计字数' })
  @IsNumber()
  @IsOptional()
  expectedWords?: number;

  @ApiPropertyOptional({ description: '封面URL' })
  @IsString()
  @IsOptional()
  coverUrl?: string;
}

export class UpdateWorkDto {
  @ApiPropertyOptional({ description: '作品标题' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ description: '作品简介' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '作品品类' })
  @IsEnum(WorkCategory)
  @IsOptional()
  category?: WorkCategory;

  @ApiPropertyOptional({ description: '目标平台' })
  @IsEnum(TargetPlatform)
  @IsOptional()
  targetPlatform?: TargetPlatform;

  @ApiPropertyOptional({ description: '预计字数' })
  @IsNumber()
  @IsOptional()
  expectedWords?: number;

  @ApiPropertyOptional({ description: '封面URL' })
  @IsString()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional({ description: '作品状态' })
  @IsOptional()
  status?: any;
}
