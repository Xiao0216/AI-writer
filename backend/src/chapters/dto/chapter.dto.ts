import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChapterDto {
  @ApiPropertyOptional({ description: '章节标题' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '章节内容' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: '卷号' })
  @IsNumber()
  @IsOptional()
  volumeNumber?: number;
}

export class UpdateChapterDto {
  @ApiPropertyOptional({ description: '章节标题' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '章节内容' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: '作者备注' })
  @IsString()
  @IsOptional()
  authorNotes?: string;

  @ApiPropertyOptional({ description: '创作时长(秒)' })
  @IsNumber()
  @IsOptional()
  writingDuration?: number;

  @ApiPropertyOptional({ description: '是否AI生成' })
  @IsBoolean()
  @IsOptional()
  isAiGenerated?: boolean;
}
