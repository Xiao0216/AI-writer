import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { ChaptersService } from './chapters.service';
import { CreateChapterDto, UpdateChapterDto } from './dto/chapter.dto';

@ApiTags('chapters')
@ApiBearerAuth()
@Controller('works/:workId/chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get()
  @ApiOperation({ summary: '获取作品章节列表' })
  async list(@Param('workId') workId: string) {
    return this.chaptersService.findByWork(workId, '');
  }

  @Get(':id')
  @ApiOperation({ summary: '获取章节详情' })
  async get(@Param('workId') workId: string, @Param('id') id: string) {
    return this.chaptersService.findById(id, workId);
  }

  @Post()
  @ApiOperation({ summary: '创建章节' })
  async create(@Param('workId') workId: string, @Body() dto: CreateChapterDto) {
    return this.chaptersService.create(workId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新章节' })
  async update(
    @Param('workId') workId: string,
    @Param('id') id: string,
    @Body() dto: UpdateChapterDto,
  ) {
    return this.chaptersService.update(id, workId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除章节' })
  async delete(@Param('workId') workId: string, @Param('id') id: string) {
    await this.chaptersService.delete(id, workId);
    return { message: '删除成功' };
  }

  @Post(':id/publish')
  @ApiOperation({ summary: '发布章节' })
  async publish(@Param('workId') workId: string, @Param('id') id: string) {
    return this.chaptersService.publish(id, workId);
  }
}
