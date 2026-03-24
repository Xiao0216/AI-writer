import { BadRequestException, Injectable } from '@nestjs/common';
import { GenerationType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ComplianceService } from '../compliance/compliance.service';
import { MembershipService } from '../membership/membership.service';
import { buildPrompt } from './prompt-builder';
import { ClaudeProvider } from './providers/claude.provider';
import { DeepseekProvider } from './providers/deepseek.provider';
import type { AiProvider } from './providers/provider.interface';
import { QwenProvider } from './providers/qwen.provider';
import type { GenerateRequestDto } from './ai.controller';

@Injectable()
export class AiService {
  private readonly providers: Record<string, AiProvider>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly membershipService: MembershipService,
    private readonly complianceService: ComplianceService,
    claudeProvider: ClaudeProvider,
    qwenProvider: QwenProvider,
    deepseekProvider: DeepseekProvider,
  ) {
    this.providers = {
      mock: {
        key: 'mock',
        generate: async (input) => ({
          model: 'mock-wenshu-v1',
          outputs: this.mockGenerate(input.type, input),
        }),
      },
      claude: claudeProvider,
      qwen: qwenProvider,
      deepseek: deepseekProvider,
    };
  }

  async generate(userId: string, request: GenerateRequestDto) {
    await this.membershipService.assertCanGenerate(userId);

    const novel = await this.prisma.novel.findUnique({
      where: { id: request.novelId },
    });
    if (!novel || novel.userId !== userId) {
      throw new BadRequestException('作品不存在或无权访问');
    }

    const selectedOutline = request.outlineId
      ? await this.prisma.outline.findUnique({
          where: { id: request.outlineId },
        })
      : null;
    const selectedCharacters = request.characterIds?.length
      ? await this.prisma.character.findMany({
          where: { id: { in: request.characterIds }, novelId: request.novelId },
        })
      : [];
    const recentChapters = await this.prisma.chapter.findMany({
      where: { novelId: request.novelId },
      orderBy: { sortOrder: 'desc' },
      take: 2,
    });

    const prompt = buildPrompt({
      novel,
      request,
      recentChapters: recentChapters.reverse(),
      selectedOutline,
      selectedCharacters,
    });

    const provider =
      this.providers[process.env.AI_PROVIDER ?? 'mock'] ?? this.providers.mock;
    const result = await provider.generate({
      type: request.type,
      prompt,
      title: novel.title,
      genre: novel.genre,
      instruction: request.instruction,
    });

    await Promise.all(
      result.outputs.map((output) =>
        this.prisma.generationLog.create({
          data: {
            userId,
            novelId: request.novelId,
            chapterId: request.chapterId,
            type: request.type,
            prompt,
            result: output,
            model: result.model,
          },
        }),
      ),
    );

    const membership = await this.membershipService.getStatus(userId);

    return {
      model: result.model,
      outputs: result.outputs.map((content) => ({
        content,
        findings: this.complianceService.scan(content).findings,
      })),
      usage: membership,
    };
  }

  private mockGenerate(
    type: GenerationType,
    input: { prompt: string; title?: string },
  ): string[] {
    const base = input.title ? `《${input.title}》` : '这部作品';
    const outputsByType: Record<GenerationType, string[]> = {
      OUTLINE: [
        `${base}大纲版本一：主角在危机中觉醒底牌，前三章快速建立目标、冲突与悬念。`,
        `${base}大纲版本二：从失败开局切入，用反差和强动机推动黄金三章节奏。`,
      ],
      OPENING: [
        `${base}开篇版本一：雨夜、追杀、反转身份，2000字以内直接抛出强悬念。`,
        `${base}开篇版本二：以失败和羞辱入场，让主角迅速拿回主动权。`,
      ],
      CONTINUATION: [
        `延续上一章冲突，推进新的抉择和角色关系变化。\n\n${input.prompt.slice(0, 300)}`,
      ],
      EXPAND: [
        `在原有剧情不变的前提下扩写细节、动作和情绪层次。\n\n${input.prompt.slice(0, 300)}`,
      ],
      SHORTEN: [`保留主线信息，压缩赘述，提升段落密度和节奏感。`],
      REWRITE: [
        `在不改变关键剧情节点的前提下重写表达，让文风更流畅、冲突更明确。`,
      ],
      INSPIRATION: [
        '灵感 1：让配角提前暴露一个误导信息。',
        '灵感 2：把主角的短期目标改成必须在一夜内完成。',
        '灵感 3：通过一场交易把敌我关系临时反转。',
      ],
    };

    return outputsByType[type];
  }
}
