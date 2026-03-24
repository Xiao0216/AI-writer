import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsArray, IsOptional, IsString } from 'class-validator';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthUser } from '../../common/types/auth-user';
import { ChaptersService } from './chapters.service';

class CreateChapterDto {
  @IsString()
  title!: string;
}

class UpdateChapterDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  plainText?: string;
}

class ReorderChaptersDto {
  @IsArray()
  @IsString({ each: true })
  chapterIds!: string[];
}

class CompleteChapterDto {
  @IsOptional()
  @IsString()
  completionNote?: string;
}

@UseGuards(AuthGuard)
@Controller('novels/:novelId/chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('novelId') novelId: string) {
    return this.chaptersService.list(user.id, novelId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('novelId') novelId: string,
    @Body() body: CreateChapterDto,
  ) {
    return this.chaptersService.create(user.id, novelId, body);
  }

  @Patch(':chapterId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('novelId') novelId: string,
    @Param('chapterId') chapterId: string,
    @Body() body: UpdateChapterDto,
  ) {
    return this.chaptersService.update(user.id, novelId, chapterId, body);
  }

  @Delete(':chapterId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('novelId') novelId: string,
    @Param('chapterId') chapterId: string,
  ) {
    return this.chaptersService.remove(user.id, novelId, chapterId);
  }

  @Patch('reorder/sort')
  reorder(
    @CurrentUser() user: AuthUser,
    @Param('novelId') novelId: string,
    @Body() body: ReorderChaptersDto,
  ) {
    return this.chaptersService.reorder(user.id, novelId, body.chapterIds);
  }

  @Post(':chapterId/complete')
  complete(
    @CurrentUser() user: AuthUser,
    @Param('novelId') novelId: string,
    @Param('chapterId') chapterId: string,
    @Body() body: CompleteChapterDto,
  ) {
    return this.chaptersService.complete(user.id, novelId, chapterId, body);
  }
}
