import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { AiGenerationService } from './ai-generation.service';

@ApiTags('ai-generation')
@ApiBearerAuth()
@Controller()
export class AiGenerationController {
  constructor(private readonly aiService: AiGenerationService) {}

  @Post('works/:workId/ai/opening')
  @ApiOperation({ summary: '生成开篇' })
  async generateOpening(@Param('workId') workId: string, @Body() body: any) {
    return this.aiService.generateOpening({ workId, ...body });
  }

  @Post('works/:workId/chapters/:chapterId/ai/continue')
  @ApiOperation({ summary: '续写章节' })
  async continueChapter(
    @Param('workId') workId: string,
    @Param('chapterId') chapterId: string,
    @Body() body: any,
  ) {
    return this.aiService.continueChapter({ workId, chapterId, ...body });
  }

  @Post('works/:workId/ai/outline')
  @ApiOperation({ summary: '生成大纲' })
  async generateOutline(@Param('workId') workId: string, @Body() body: any) {
    return this.aiService.generateOutline({ workId, ...body });
  }

  @Post('works/:workId/ai/expand')
  @ApiOperation({ summary: '扩写内容' })
  async expand(@Param('workId') workId: string, @Body() body: any) {
    return this.aiService.expand(body);
  }

  @Post('works/:workId/ai/condense')
  @ApiOperation({ summary: '缩写内容' })
  async condense(@Param('workId') workId: string, @Body() body: any) {
    return this.aiService.condense(body);
  }

  @Post('works/:workId/ai/rewrite')
  @ApiOperation({ summary: '改写内容' })
  async rewrite(@Param('workId') workId: string, @Body() body: any) {
    return this.aiService.rewrite(body);
  }

  @Post('works/:workId/ai/dialogue')
  @ApiOperation({ summary: '生成对话' })
  async generateDialogue(@Param('workId') workId: string, @Body() body: any) {
    return this.aiService.generateDialogue(body);
  }

  @Post('works/:workId/ai/inspiration')
  @ApiOperation({ summary: '生成灵感' })
  async generateInspiration(@Param('workId') workId: string, @Body() body: any) {
    return this.aiService.generateInspiration(body);
  }
}
