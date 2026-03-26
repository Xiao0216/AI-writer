import type { Chapter, Character, NovelDetail, NovelDocument, NovelSummary } from "./types";

type Tone = "amber" | "cyan" | "paper" | "danger";

export type TruthFileMeta = {
  code: string;
  shortTitle: string;
  description: string;
  priority: "critical" | "core" | "support";
  tone: Tone;
};

export type PlotlineHeat = {
  title: string;
  value: number;
  status: string;
  description: string;
  tone: Tone;
};

export type CharacterPressure = {
  name: string;
  role: string;
  pressure: "高压" | "承压" | "待回归";
  cue: string;
  tone: Tone;
};

export type ForeshadowWindow = {
  title: string;
  status: string;
  note: string;
  tone: Tone;
};

export type DebtItem = {
  title: string;
  note: string;
  severity: "高" | "中" | "低";
};

export type ContinuityCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type MemorySlice = {
  title: string;
  body: string;
  note: string;
  tone: Tone;
};

export type MarathonStage = {
  title: string;
  status: "running" | "ready" | "blocked";
  detail: string;
};

export const truthFileMetaMap: Record<NovelDocument["type"], TruthFileMeta> = {
  PROJECT_OVERVIEW: {
    code: "00",
    shortTitle: "项目总览",
    description: "整本书的承诺、规模与当前推进目标。",
    priority: "critical",
    tone: "amber",
  },
  THEME_AND_PROPOSITION: {
    code: "01",
    shortTitle: "主题命题",
    description: "这本书真正要反复逼问的问题。",
    priority: "critical",
    tone: "amber",
  },
  WORLDBUILDING: {
    code: "02",
    shortTitle: "世界规则",
    description: "世界观、机制与边界约束。",
    priority: "core",
    tone: "paper",
  },
  CAST_BIBLE: {
    code: "03",
    shortTitle: "人物圣经",
    description: "人物稳定性的第一控制文件。",
    priority: "critical",
    tone: "amber",
  },
  RELATIONSHIP_MAP: {
    code: "04",
    shortTitle: "关系图谱",
    description: "主要关系张力、联盟与裂痕。",
    priority: "core",
    tone: "cyan",
  },
  MAIN_PLOTLINES: {
    code: "05",
    shortTitle: "主线账本",
    description: "主线与支线的推进状态与温度。",
    priority: "critical",
    tone: "cyan",
  },
  FORESHADOW_LEDGER: {
    code: "06",
    shortTitle: "伏笔账本",
    description: "埋下、回收与延期的追踪台。",
    priority: "critical",
    tone: "amber",
  },
  CHAPTER_ROADMAP: {
    code: "07",
    shortTitle: "章节路线",
    description: "章节节拍和近期推进计划。",
    priority: "critical",
    tone: "cyan",
  },
  DYNAMIC_STATE: {
    code: "08",
    shortTitle: "动态状态",
    description: "写回后整本书当前真实状态。",
    priority: "critical",
    tone: "amber",
  },
  STYLE_GUIDE: {
    code: "09",
    shortTitle: "风格护栏",
    description: "长篇语气、叙述习惯与禁止项。",
    priority: "core",
    tone: "paper",
  },
  WRITING_LOG: {
    code: "LOG",
    shortTitle: "写作日志",
    description: "每次推进后的摘要与运行记录。",
    priority: "support",
    tone: "paper",
  },
};

export function formatStationTime(value?: string | null) {
  if (!value) {
    return "暂无记录";
  }

  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

export function summarizeDocument(content: string) {
  const normalized = content
    .replace(/^#.*$/gm, "")
    .replace(/[-*]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || "当前还没有写入内容，建议尽快补齐。";
}

export function getStageLabel(stage?: NovelSummary["stage"]) {
  switch (stage) {
    case "ALIGNMENT":
      return "立项对齐";
    case "OUTLINE_READY":
      return "待开章节";
    case "WRITING":
      return "章节推进";
    default:
      return "尚未建立";
  }
}

export function getTruthCompletion(files: NovelDocument[]) {
  if (files.length === 0) {
    return 0;
  }

  return Math.round((files.filter((file) => file.content.trim()).length / files.length) * 100);
}

function findDocument(novel: Pick<NovelDetail, "documents">, type: NovelDocument["type"]) {
  return novel.documents.find((item) => item.type === type);
}

export function buildPlotlineHeat(novel: NovelDetail): PlotlineHeat[] {
  const chapterCount = novel.chapters.length;
  const completedCount = novel.chapters.filter((chapter) => chapter.status === "COMPLETED").length;
  const truthCompletion = getTruthCompletion(novel.documents);
  const mainPlotDoc = findDocument(novel, "MAIN_PLOTLINES");
  const foreshadowDoc = findDocument(novel, "FORESHADOW_LEDGER");

  return [
    {
      title: "主推进线",
      value: Math.min(92, 28 + completedCount * 11 + (mainPlotDoc?.content.trim() ? 18 : 0)),
      status: completedCount >= 3 ? "升温中" : "待点燃",
      description: completedCount >= 3 ? "章节推进已经形成惯性。" : "需要用下一章拉起整本书的前进感。",
      tone: "amber",
    },
    {
      title: "人物张力线",
      value: Math.min(86, 24 + novel.characters.length * 12 + truthCompletion / 4),
      status: novel.characters.length >= 3 ? "可调度" : "需补人物",
      description: novel.characters.length >= 3 ? "角色系统已具备承压能力。" : "人物池太薄，容易导致推进单线化。",
      tone: "cyan",
    },
    {
      title: "伏笔回收线",
      value: Math.min(80, 18 + (foreshadowDoc?.content.trim() ? 30 : 0) + chapterCount * 6),
      status: foreshadowDoc?.content.trim() ? "在监控" : "待立账本",
      description: foreshadowDoc?.content.trim()
        ? "伏笔账本已启用，适合继续加压。"
        : "没有账本，伏笔会先失踪再失控。",
      tone: "paper",
    },
  ];
}

export function buildCharacterPressure(novel: NovelDetail): CharacterPressure[] {
  const fallback = [
    {
      name: "主角群",
      role: "核心视角",
      pressure: "待回归" as const,
      cue: "请先补人物圣经，再决定谁在下一章承压。",
      tone: "paper" as const,
    },
  ];

  if (novel.characters.length === 0) {
    return fallback;
  }

  return novel.characters.slice(0, 4).map((character, index) => {
    const cueSource = character.personality || character.background || character.identity || "尚未写入压力线索";
    const pressure = index === 0 ? "高压" : index === 1 ? "承压" : "待回归";

    return {
      name: character.name,
      role: character.identity || "未标记身份",
      pressure,
      cue: cueSource,
      tone: pressure === "高压" ? "amber" : pressure === "承压" ? "cyan" : "paper",
    };
  });
}

export function buildForeshadowWindows(novel: NovelDetail): ForeshadowWindow[] {
  const foreshadowDoc = findDocument(novel, "FORESHADOW_LEDGER");
  const writingLog = findDocument(novel, "WRITING_LOG");
  const latestChapter = novel.chapters[0];

  return [
    {
      title: "近期埋点",
      status: foreshadowDoc?.content.trim() ? "已记录" : "待建立",
      note: foreshadowDoc?.content.trim()
        ? summarizeDocument(foreshadowDoc.content).slice(0, 56)
        : "先把已经埋下的钩子整理成账本，再考虑继续加新伏笔。",
      tone: foreshadowDoc?.content.trim() ? "amber" : "danger",
    },
    {
      title: "写回窗口",
      status: latestChapter?.status === "COMPLETED" ? "已闭环" : "待闭环",
      note: latestChapter
        ? `${latestChapter.title} ${latestChapter.status === "COMPLETED" ? "已进入写回闭环。" : "尚未完成动态写回。"}`
        : "还没有章节记录，无法建立写回窗口。",
      tone: latestChapter?.status === "COMPLETED" ? "cyan" : "paper",
    },
    {
      title: "日志回声",
      status: writingLog?.content.trim() ? "有轨迹" : "无轨迹",
      note: writingLog?.content.trim()
        ? summarizeDocument(writingLog.content).slice(0, 56)
        : "缺少写作日志时，马拉松推进会失去可复盘性。",
      tone: writingLog?.content.trim() ? "paper" : "danger",
    },
  ];
}

export function buildDebtItems(novel: NovelDetail, chapter?: Chapter | null): DebtItem[] {
  const chapterRoadmap = findDocument(novel, "CHAPTER_ROADMAP");
  const dynamicState = findDocument(novel, "DYNAMIC_STATE");
  const latestChapter = chapter ?? novel.chapters[0] ?? null;

  return [
    {
      title: "下一章债务",
      note: latestChapter
        ? `${latestChapter.title} 之后必须明确下一笔承接，否则推进会断层。`
        : "先建立第 1 章任务，再谈后续债务衔接。",
      severity: latestChapter ? "高" : "中",
    },
    {
      title: "动态状态写回",
      note: dynamicState?.content.trim()
        ? "当前已有动态状态文件，但每章完成后仍需继续补写状态变化。"
        : "动态状态文件仍为空，章节完成后无法形成闭环。",
      severity: dynamicState?.content.trim() ? "中" : "高",
    },
    {
      title: "章节路线维护",
      note: chapterRoadmap?.content.trim()
        ? "路线图已存在，建议补足最近 3 章的具体任务。"
        : "章节路线图仍未成形，容易在中段失速。",
      severity: chapterRoadmap?.content.trim() ? "低" : "高",
    },
  ];
}

export function buildContinuityChecks(novel: NovelDetail, chapter: Chapter): ContinuityCheck[] {
  const hasCharacters = novel.characters.length > 0;
  const hasDynamicState = Boolean(findDocument(novel, "DYNAMIC_STATE")?.content.trim());
  const hasForeshadowLedger = Boolean(findDocument(novel, "FORESHADOW_LEDGER")?.content.trim());
  const hasWords = chapter.wordCount >= 1200;

  return [
    {
      label: "人物行为有锚点",
      passed: hasCharacters,
      detail: hasCharacters ? "人物圣经已建立，可回到既定性格。": "还没有人物池，角色容易跑偏。",
    },
    {
      label: "本章具备推进体量",
      passed: hasWords,
      detail: hasWords ? "当前字数足以承载一个明确的推进动作。" : "章节体量偏短，可能只停留在铺垫层。",
    },
    {
      label: "写回链路可执行",
      passed: hasDynamicState,
      detail: hasDynamicState ? "动态状态文件存在，可以接住本章变化。" : "动态状态为空，章节完成后没有真实归档目标。",
    },
    {
      label: "伏笔账本在场",
      passed: hasForeshadowLedger,
      detail: hasForeshadowLedger ? "伏笔窗口可直接对照账本。" : "没有账本时，伏笔只能靠记忆维护。",
    },
  ];
}

export function buildMemorySlices(novel: NovelDetail): MemorySlice[] {
  const dynamicState = findDocument(novel, "DYNAMIC_STATE");
  const relationshipMap = findDocument(novel, "RELATIONSHIP_MAP");
  const castBible = findDocument(novel, "CAST_BIBLE");

  return [
    {
      title: "人物现态切片",
      body: castBible?.content.trim()
        ? summarizeDocument(castBible.content)
        : "人物当前状态还未进入真相源，请先补人物圣经与动态状态。",
      note: "用于防止人物性格、立场和情绪突然漂移。",
      tone: "amber",
    },
    {
      title: "关系温度切片",
      body: relationshipMap?.content.trim()
        ? summarizeDocument(relationshipMap.content)
        : "关系图谱为空，当前无法判断谁在同盟、谁在裂变。",
      note: "用于监控联盟、裂痕与镜像人物之间的张力变化。",
      tone: "cyan",
    },
    {
      title: "全书动态回忆",
      body: dynamicState?.content.trim()
        ? summarizeDocument(dynamicState.content)
        : "动态状态未写入，系统无法告诉你整本书此刻到底变成了什么。",
      note: "这是章节写回之后最应该更新的总账。",
      tone: "paper",
    },
  ];
}

export function buildMarathonStages(novel: NovelDetail): MarathonStage[] {
  const latestChapter = novel.chapters[0];
  const truthCompletion = getTruthCompletion(novel.documents);
  const canRun = truthCompletion >= 50 && novel.chapters.length > 0;

  return [
    {
      title: "对齐真相源",
      status: truthCompletion >= 50 ? "running" : "blocked",
      detail: truthCompletion >= 50 ? "核心资料已过半，可作为自动续写前置。" : "作品资料不足一半，自动续写风险过高。",
    },
    {
      title: "执行当前章节",
      status: latestChapter ? "running" : "ready",
      detail: latestChapter
        ? `当前焦点章节：${latestChapter.title}`
        : "还没有章节，先建立一条可执行的章节路线。",
    },
    {
      title: "动态写回归档",
      status: latestChapter?.status === "COMPLETED" ? "ready" : canRun ? "blocked" : "ready",
      detail: latestChapter?.status === "COMPLETED"
        ? "最近章节已闭环，可以准备下一段自动推进。"
        : "没有写回确认前，自动续写不应继续放行。",
    },
  ];
}

export function getCharacterInitial(character: Character) {
  return character.name.slice(0, 1);
}
