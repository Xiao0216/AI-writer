import type { Character, Chapter, Novel, Outline } from '@prisma/client';

import type { GenerateRequestDto } from './ai.controller';

export function buildPrompt(params: {
  novel: Novel;
  request: GenerateRequestDto;
  recentChapters: Chapter[];
  selectedOutline: Outline | null;
  selectedCharacters: Character[];
}): string {
  const {
    novel,
    request,
    recentChapters,
    selectedOutline,
    selectedCharacters,
  } = params;

  const chaptersBlock =
    recentChapters.length > 0
      ? recentChapters
          .map(
            (chapter) =>
              `## ${chapter.title}\n${chapter.plainText || chapter.content}`,
          )
          .join('\n\n')
      : '暂无章节上下文';

  const charactersBlock =
    selectedCharacters.length > 0
      ? selectedCharacters
          .map(
            (character) =>
              `${character.name}｜身份:${character.identity ?? '未设定'}｜性格:${character.personality ?? '未设定'}｜外貌:${character.appearance ?? '未设定'}｜背景:${character.background ?? '未设定'}`,
          )
          .join('\n')
      : '暂无角色设定';

  return [
    `你正在辅助创作网文小说《${novel.title}》。`,
    `品类：${novel.genre}`,
    `作品简介：${novel.synopsis ?? '暂无简介'}`,
    `任务类型：${request.type}`,
    `用户补充要求：${request.instruction ?? '无'}`,
    `选中的大纲：${selectedOutline?.content ?? '无'}`,
    `选中的角色：\n${charactersBlock}`,
    `最近章节上下文：\n${chaptersBlock}`,
    `当前选中文本：${request.selectedText ?? '无'}`,
    `请输出适合网文场景、节奏明确、人物一致的中文内容。`,
  ].join('\n\n');
}
