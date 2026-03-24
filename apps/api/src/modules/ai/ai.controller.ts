import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GenerationType } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthUser } from '../../common/types/auth-user';
import { AiService } from './ai.service';

export class GenerateRequestDto {
  @IsString()
  novelId!: string;

  @IsOptional()
  @IsString()
  chapterId?: string;

  @IsOptional()
  @IsString()
  outlineId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  characterIds?: string[];

  @IsOptional()
  @IsString()
  selectedText?: string;

  @IsOptional()
  @IsString()
  instruction?: string;

  @IsEnum(GenerationType)
  type!: GenerationType;
}

@UseGuards(AuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  generate(@CurrentUser() user: AuthUser, @Body() body: GenerateRequestDto) {
    return this.aiService.generate(user.id, body);
  }
}
