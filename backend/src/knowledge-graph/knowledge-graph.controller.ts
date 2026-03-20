import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { KnowledgeGraphService } from './knowledge-graph.service';

@ApiTags('knowledge-graph')
@ApiBearerAuth()
@Controller('works/:workId/knowledge-graph')
export class KnowledgeGraphController {
  constructor(private readonly kgService: KnowledgeGraphService) {}

  @Get('summary')
  @ApiOperation({ summary: '获取知识图谱摘要' })
  async getSummary(@Param('workId') workId: string) {
    return this.kgService.getGraphSummary(workId);
  }

  @Get('characters')
  @ApiOperation({ summary: '获取角色列表' })
  async getCharacters(@Param('workId') workId: string) {
    return this.kgService.getCharacters(workId);
  }

  @Post('characters')
  @ApiOperation({ summary: '创建角色' })
  async createCharacter(@Param('workId') workId: string, @Body() data: any) {
    return this.kgService.createCharacter(workId, data);
  }

  @Patch('characters/:id')
  @ApiOperation({ summary: '更新角色' })
  async updateCharacter(@Param('workId') workId: string, @Param('id') id: string, @Body() data: any) {
    return this.kgService.updateCharacter(id, data);
  }

  @Delete('characters/:id')
  @ApiOperation({ summary: '删除角色' })
  async deleteCharacter(@Param('id') id: string) {
    await this.kgService.deleteCharacter(id);
    return { message: '删除成功' };
  }

  @Get('world-settings')
  @ApiOperation({ summary: '获取世界观设定' })
  async getWorldSettings(@Param('workId') workId: string) {
    return this.kgService.getWorldSettings(workId);
  }

  @Get('timeline')
  @ApiOperation({ summary: '获取时间线' })
  async getTimeline(@Param('workId') workId: string) {
    return this.kgService.getTimelineEvents(workId);
  }

  @Get('foreshadowings')
  @ApiOperation({ summary: '获取伏笔列表' })
  async getForeshadowings(@Param('workId') workId: string, @Param('status') status?: string) {
    return this.kgService.getForeshadowings(workId, status);
  }

  @Post('foreshadowings')
  @ApiOperation({ summary: '创建伏笔' })
  async createForeshadowing(@Param('workId') workId: string, @Body() data: any) {
    return this.kgService.createForeshadowing(workId, data);
  }

  @Post('validate')
  @ApiOperation({ summary: '校验内容一致性' })
  async validate(@Param('workId') workId: string, @Body() body: { content: string; chapterNumber: number }) {
    return this.kgService.validateConsistency(workId, body.content, body.chapterNumber);
  }
}
