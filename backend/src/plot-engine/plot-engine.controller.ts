import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { PlotEngineService } from './plot-engine.service';

@ApiTags('plot-engine')
@ApiBearerAuth()
@Controller('works/:workId/plot-engine')
export class PlotEngineController {
  constructor(private readonly plotService: PlotEngineService) {}

  @Get('nodes')
  @ApiOperation({ summary: '获取剧情节点列表' })
  async getNodes(@Param('workId') workId: string, @Param('volumeNumber') volumeNumber?: number) {
    return this.plotService.getNodes(workId, volumeNumber);
  }

  @Post('nodes')
  @ApiOperation({ summary: '创建剧情节点' })
  async createNode(@Param('workId') workId: string, @Body() data: any) {
    return this.plotService.createNode(workId, data);
  }

  @Patch('nodes/:id')
  @ApiOperation({ summary: '更新剧情节点' })
  async updateNode(@Param('workId') workId: string, @Param('id') id: string, @Body() data: any) {
    return this.plotService.updateNode(id, data);
  }

  @Delete('nodes/:id')
  @ApiOperation({ summary: '删除剧情节点' })
  async deleteNode(@Param('id') id: string) {
    await this.plotService.deleteNode(id);
    return { message: '删除成功' };
  }

  @Get('outline')
  @ApiOperation({ summary: '获取剧情大纲' })
  async getOutline(@Param('workId') workId: string) {
    return this.plotService.getOutline(workId);
  }

  @Post('outline')
  @ApiOperation({ summary: '创建剧情大纲' })
  async createOutline(@Param('workId') workId: string, @Body() data: any) {
    return this.plotService.createOutline(workId, data);
  }

  @Get('progress')
  @ApiOperation({ summary: '获取节点进度' })
  async getProgress(@Param('workId') workId: string) {
    return this.plotService.getNodeProgress(workId);
  }

  @Post('nodes/:id/complete')
  @ApiOperation({ summary: '标记节点完成' })
  async completeNode(@Param('workId') workId: string, @Param('id') id: string, @Body() body: { wordCount: number }) {
    return this.plotService.completeNode(id, body.wordCount);
  }
}
