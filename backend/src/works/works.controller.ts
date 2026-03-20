import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { WorksService } from './works.service';
import { CreateWorkDto, UpdateWorkDto } from './dto/work.dto';

@ApiTags('works')
@ApiBearerAuth()
@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get()
  @ApiOperation({ summary: '获取作品列表' })
  async list(
    @Request() req,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.worksService.findAll(req.user.id, {
      status: status as any,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取作品详情' })
  async get(@Param('id') id: string, @Request() req) {
    return this.worksService.findById(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: '创建作品' })
  async create(@Request() req, @Body() dto: CreateWorkDto) {
    return this.worksService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新作品' })
  async update(@Param('id') id: string, @Request() req, @Body() dto: UpdateWorkDto) {
    return this.worksService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除作品' })
  async delete(@Param('id') id: string, @Request() req) {
    await this.worksService.delete(id, req.user.id);
    return { message: '删除成功' };
  }

  @Get(':id/stats')
  @ApiOperation({ summary: '获取作品统计' })
  async stats(@Param('id') id: string, @Request() req) {
    return this.worksService.getStats(id, req.user.id);
  }
}
