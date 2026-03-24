import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthUser } from '../../common/types/auth-user';
import { NovelsService } from './novels.service';

class CreateNovelDto {
  @IsString()
  title!: string;

  @IsString()
  genre!: string;

  @IsOptional()
  @IsString()
  synopsis?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetWordCount?: number;
}

@UseGuards(AuthGuard)
@Controller('novels')
export class NovelsController {
  constructor(private readonly novelsService: NovelsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.novelsService.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() body: CreateNovelDto) {
    return this.novelsService.create(user.id, body);
  }

  @Get(':novelId')
  findOne(@CurrentUser() user: AuthUser, @Param('novelId') novelId: string) {
    return this.novelsService.findOne(user.id, novelId);
  }

  @Delete(':novelId')
  remove(@CurrentUser() user: AuthUser, @Param('novelId') novelId: string) {
    return this.novelsService.remove(user.id, novelId);
  }
}
