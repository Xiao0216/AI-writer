import type {
  Character,
  Chapter,
  GenerationResponse,
  MembershipStatus,
  NovelDocument,
  NovelDetail,
  NovelSummary,
  Outline,
  PaymentOrder,
  PaymentPlan,
  ScanFinding,
  User,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const ENABLE_DEV_LOGIN = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN !== "false";
const MOCK_STORE_KEY = "wenshu_mock_store_v1";
const LAST_PROJECT_KEY = "wenshu_last_project_id";
const LAST_CHAPTER_KEY = "wenshu_last_chapter_id";
const LAST_CHAPTER_PROJECT_KEY = "wenshu_last_chapter_project_id";
const CONTEXT_EVENT = "wenshu-context-change";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

type MockNovel = NovelDetail & {
  targetWordCount?: number;
};

type MockStore = {
  user: User;
  novels: MockNovel[];
  membership: MembershipStatus;
  paymentPlan: PaymentPlan;
  paymentOrders: PaymentOrder[];
};

const documentBlueprints: Array<{ type: NovelDocument["type"]; title: string }> = [
  { type: "PROJECT_OVERVIEW", title: "00 项目总览" },
  { type: "THEME_AND_PROPOSITION", title: "01 主题与命题" },
  { type: "WORLDBUILDING", title: "02 世界设定" },
  { type: "CAST_BIBLE", title: "03 人物圣经" },
  { type: "RELATIONSHIP_MAP", title: "04 关系图谱" },
  { type: "MAIN_PLOTLINES", title: "05 主线账本" },
  { type: "FORESHADOW_LEDGER", title: "06 伏笔账本" },
  { type: "CHAPTER_ROADMAP", title: "07 章节路线图" },
  { type: "DYNAMIC_STATE", title: "08 动态状态" },
  { type: "STYLE_GUIDE", title: "09 风格指南" },
  { type: "WRITING_LOG", title: "logs/writing-log.md" },
];

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function countWords(text: string) {
  const normalized = text.trim();
  if (!normalized) {
    return 0;
  }

  return normalized.replace(/\s+/g, "").length;
}

function htmlToText(content?: string) {
  if (!content) {
    return "";
  }

  return content
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textToHtmlBlock(text: string) {
  return text
    .split(/\n{2,}/)
    .map((part) => `<p>${part.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

function ensureBrowser() {
  return typeof window !== "undefined";
}

function saveLastContext(novelId?: string, chapterId?: string) {
  if (!ensureBrowser()) {
    return;
  }

  if (novelId) {
    window.localStorage.setItem(LAST_PROJECT_KEY, novelId);
  }

  if (chapterId) {
    window.localStorage.setItem(LAST_CHAPTER_KEY, chapterId);
    if (novelId) {
      window.localStorage.setItem(LAST_CHAPTER_PROJECT_KEY, novelId);
    }
  }

  window.dispatchEvent(new Event(CONTEXT_EVENT));
}

function getDemoDocuments(seedTitle: string): NovelDocument[] {
  const createdAt = nowIso();

  const seedContent: Partial<Record<NovelDocument["type"], string>> = {
    PROJECT_OVERVIEW: `# 项目总览\n- 核心承诺：${seedTitle} 不是靠段落炫技，而是靠整本书持续升温。\n- 主角设定：主角必须在亲情、江湖与自我判断之间承压。\n- 结局方向：以代价换取真正的秩序重建。`,
    THEME_AND_PROPOSITION: "# 主题与命题\n- 这本书真正要测试的问题：当血缘与选择冲突时，谁定义一个人的归属？",
    CAST_BIBLE: "# 人物圣经\n- 当前人物焦点：主角、镜像对手、隐藏操盘者。",
    MAIN_PLOTLINES: "# 主线账本\n- 主推进线：血缘真相逐步揭露。\n- 次推进线：恶人谷旧债与移花宫新债交叠。",
    CHAPTER_ROADMAP: "# 章节路线图\n- 第1章：制造第一笔必须追查的债务。\n- 第2章：角色关系第一次发生可逆冲突。",
    DYNAMIC_STATE: "# 动态状态\n- 当前系统状态：主角已被推入无法回避的冲突场。",
    STYLE_GUIDE: "# 风格指南\n- 当前建议风格：冷峻、克制、持续承压。\n- 写作要求：先推进冲突，再补解释。",
    WRITING_LOG: "# 写作日志\n- 初始化作品资料，等待新的章节写回。",
  };

  return documentBlueprints.map((item) => ({
    id: makeId(`doc-${item.type.toLowerCase()}`),
    type: item.type,
    title: item.title,
    content: seedContent[item.type] ?? "",
    createdAt,
    updatedAt: createdAt,
  }));
}

function getDemoNovel(): MockNovel {
  const createdAt = nowIso();
  const chapters: Chapter[] = [
    {
      id: makeId("chapter"),
      title: "第143章：恶人谷的重逢",
      content: textToHtmlBlock(
        "江小鱼在谷口停住，听见风里夹着旧债的回声。\n\n他知道这一次的重逢不是叙旧，而是让旧秩序重新对他开刀。",
      ),
      plainText:
        "江小鱼在谷口停住，听见风里夹着旧债的回声。\n\n他知道这一次的重逢不是叙旧，而是让旧秩序重新对他开刀。",
      wordCount: 1200,
      status: "DRAFT",
      sortOrder: 142,
      updatedAt: createdAt,
    },
    {
      id: makeId("chapter"),
      title: "第142章：邀月宫主的阴谋",
      content: textToHtmlBlock(
        "邀月没有直接出手，她先让真相变形，再让所有人用自己的立场替她把局面推下去。",
      ),
      plainText:
        "邀月没有直接出手，她先让真相变形，再让所有人用自己的立场替她把局面推下去。",
      wordCount: 3800,
      status: "COMPLETED",
      sortOrder: 141,
      updatedAt: createdAt,
    },
    {
      id: makeId("chapter"),
      title: "第141章：燕南天之托",
      content: textToHtmlBlock(
        "燕南天留下的不是一句嘱托，而是一整条必须被追完的债务线。",
      ),
      plainText: "燕南天留下的不是一句嘱托，而是一整条必须被追完的债务线。",
      wordCount: 3400,
      status: "COMPLETED",
      sortOrder: 140,
      updatedAt: createdAt,
    },
  ];

  const characters: Character[] = [
    {
      id: makeId("char"),
      name: "江小鱼",
      identity: "核心视角 / 反制者",
      personality: "机敏、好胜、把玩笑当护甲",
      appearance: "轻快、锋利、目光总在试探",
      background: "在恶人谷长大，对秩序天然不信任。",
    },
    {
      id: makeId("char"),
      name: "花无缺",
      identity: "镜像对手 / 规则执行者",
      personality: "克制、冷静、压抑情绪",
      appearance: "整洁、肃静、带距离感",
      background: "被训练成完美武器，却逐渐被血缘与情感撬动。",
    },
    {
      id: makeId("char"),
      name: "铁心兰",
      identity: "情感与选择的牵引点",
      personality: "柔韧、敏感、会为他人承担后果",
      appearance: "清峻、利落、藏着疲惫",
      background: "不是陪衬，而是推动关系温度变化的关键节点。",
    },
  ];

  const outlines: Outline[] = [
    {
      id: makeId("outline"),
      version: 3,
      title: "高潮铺垫期路线",
      content: "先让旧债回收，再让血缘真相和关系裂缝同时升温。",
      updatedAt: createdAt,
    },
  ];

  return {
    id: makeId("novel"),
    title: "绝代双骄",
    genre: "武侠巨作",
    synopsis: "不是帮你生成一段，而是帮助作者把整本书的债务、伏笔、人物与节奏稳稳控住。",
    totalWordCount: chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0),
    updatedAt: createdAt,
    latestDocumentUpdate: createdAt,
    documentCompletionCount: 8,
    completedChapterCount: 2,
    latestWritebackSummary: "已同步邀月宫主动机、双生兄弟冲突温度与下一章债务。",
    latestChapterTitle: chapters[0].title,
    latestChapterStatus: chapters[0].status,
    nextAction: "先推进第143章，再回写动态状态与伏笔账本。",
    stage: "WRITING",
    _count: {
      chapters: chapters.length,
      characters: characters.length,
      outlines: outlines.length,
    },
    chapters,
    outlines,
    characters,
    documents: getDemoDocuments("绝代双骄"),
    targetWordCount: 500000,
  };
}

function getDefaultStore(): MockStore {
  return {
    user: {
      id: "demo-user",
      nickname: "试写作者",
      preferredGenre: "武侠 / 都市",
      membershipType: "MEMBER",
    },
    novels: [getDemoNovel()],
    membership: {
      membershipType: "MEMBER",
      membershipExpireAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
      dailyLimit: null,
      usedToday: 3,
      remainingToday: null,
    },
    paymentPlan: {
      code: "PRO_AUTHOR",
      title: "专业作者版",
      description: "完整控制能力、作品资料维护、稳定章节写回、自动续写护栏。",
      priceFen: 9900,
      durationMonths: 1,
      channel: "WECHAT_NATIVE",
      configured: true,
    },
    paymentOrders: [],
  };
}

function readStore(): MockStore {
  if (!ensureBrowser()) {
    return getDefaultStore();
  }

  const raw = window.localStorage.getItem(MOCK_STORE_KEY);
  if (!raw) {
    const initial = getDefaultStore();
    window.localStorage.setItem(MOCK_STORE_KEY, JSON.stringify(initial));
    saveLastContext(initial.novels[0]?.id, initial.novels[0]?.chapters[0]?.id);
    return initial;
  }

  try {
    return JSON.parse(raw) as MockStore;
  } catch {
    const initial = getDefaultStore();
    window.localStorage.setItem(MOCK_STORE_KEY, JSON.stringify(initial));
    saveLastContext(initial.novels[0]?.id, initial.novels[0]?.chapters[0]?.id);
    return initial;
  }
}

function writeStore(store: MockStore) {
  if (!ensureBrowser()) {
    return;
  }

  window.localStorage.setItem(MOCK_STORE_KEY, JSON.stringify(store));
}

function sortChapters(chapters: Chapter[]) {
  return [...chapters].sort((a, b) => b.sortOrder - a.sortOrder);
}

function getNovelStage(novel: MockNovel): NovelSummary["stage"] {
  const docCompletion = novel.documents.filter((item) => item.content.trim()).length;
  if (novel.chapters.length > 0) {
    return "WRITING";
  }
  if (docCompletion >= 3) {
    return "OUTLINE_READY";
  }
  return "ALIGNMENT";
}

function buildSummary(novel: MockNovel): NovelSummary {
  const chapters = sortChapters(novel.chapters);
  const latestChapter = chapters[0] ?? null;
  const completedChapterCount = chapters.filter((chapter) => chapter.status === "COMPLETED").length;
  const latestDocument = [...novel.documents].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];
  const docCompletionCount = novel.documents.filter((item) => item.content.trim()).length;

  return {
    id: novel.id,
    title: novel.title,
    genre: novel.genre,
    synopsis: novel.synopsis,
    totalWordCount: chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0),
    updatedAt: latestChapter?.updatedAt ?? latestDocument?.updatedAt ?? novel.updatedAt,
    latestDocumentUpdate: latestDocument?.updatedAt ?? novel.updatedAt,
    documentCompletionCount: docCompletionCount,
    completedChapterCount,
    latestWritebackSummary:
      novel.documents.find((item) => item.type === "WRITING_LOG")?.content.split("\n").slice(-1)[0]?.replace(/^- /, "") ||
      novel.latestWritebackSummary,
    latestChapterTitle: latestChapter?.title ?? null,
    latestChapterStatus: latestChapter?.status ?? null,
    nextAction:
      latestChapter?.status === "DRAFT"
        ? `优先完成 ${latestChapter.title} 的正文与写回闭环。`
        : docCompletionCount < 4
          ? "先补齐项目总览、人物圣经、动态状态等作品资料。"
          : "检查下一章债务、伏笔回收和角色回归提醒。",
    stage: getNovelStage(novel),
    _count: {
      chapters: chapters.length,
      characters: novel.characters.length,
      outlines: novel.outlines.length,
    },
  };
}

function hydrateNovel(novel: MockNovel): MockNovel {
  const chapters = sortChapters(novel.chapters);
  const summary = buildSummary({ ...novel, chapters });

  return {
    ...novel,
    ...summary,
    chapters,
  };
}

function withNovel(store: MockStore, novelId: string) {
  const novelIndex = store.novels.findIndex((item) => item.id === novelId);
  if (novelIndex === -1) {
    throw new Error("项目不存在");
  }

  return { novelIndex, novel: hydrateNovel(store.novels[novelIndex]) };
}

function makeResponse<T>(value: T) {
  return Promise.resolve(value);
}

async function mockRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const body = options.body as Record<string, unknown> | undefined;
  const store = readStore();

  if (path === "/health") {
    return makeResponse({ status: "ok", timestamp: nowIso() } as T);
  }

  if (path === "/auth/me") {
    return makeResponse(store.user as T);
  }

  if (path === "/auth/dev-login" && method === "POST") {
    store.user = {
      ...store.user,
      id: String(body?.openid ?? store.user.id),
      nickname: String(body?.nickname ?? store.user.nickname),
      preferredGenre: String(body?.preferredGenre ?? store.user.preferredGenre ?? ""),
    };
    writeStore(store);
    return makeResponse({ user: store.user } as T);
  }

  if (path === "/auth/logout" && method === "POST") {
    return makeResponse({ success: true } as T);
  }

  if (path === "/users/me" && method === "PATCH") {
    store.user = {
      ...store.user,
      nickname: String(body?.nickname ?? store.user.nickname),
      avatar: body?.avatar ? String(body.avatar) : store.user.avatar,
      preferredGenre: body?.preferredGenre ? String(body.preferredGenre) : store.user.preferredGenre,
    };
    writeStore(store);
    return makeResponse(store.user as T);
  }

  if (path === "/novels" && method === "GET") {
    const novels = store.novels.map((item) => buildSummary(hydrateNovel(item)));
    if (novels[0]) {
      saveLastContext(novels[0].id);
    }
    return makeResponse(novels as T);
  }

  if (path === "/novels" && method === "POST") {
    const createdAt = nowIso();
    const novel = hydrateNovel({
      id: makeId("novel"),
      title: String(body?.title ?? "未命名项目"),
      genre: String(body?.genre ?? "长篇小说"),
      synopsis: body?.synopsis ? String(body.synopsis) : "",
      totalWordCount: 0,
      updatedAt: createdAt,
      latestDocumentUpdate: createdAt,
      documentCompletionCount: 0,
      completedChapterCount: 0,
      latestWritebackSummary: "项目已创建，等待启动立项流写入作品资料。",
      latestChapterTitle: null,
      latestChapterStatus: null,
      nextAction: "下一步进入启动立项流，先写入作品资料。",
      stage: "ALIGNMENT",
      _count: { chapters: 0, characters: 0, outlines: 0 },
      chapters: [],
      outlines: [],
      characters: [],
      documents: getDemoDocuments(String(body?.title ?? "未命名项目")),
      targetWordCount: Number(body?.targetWordCount ?? 500000),
    });
    store.novels.unshift(novel);
    writeStore(store);
    saveLastContext(novel.id);
    return makeResponse(buildSummary(novel) as T);
  }

  const novelMatch = path.match(/^\/novels\/([^/]+)$/);
  if (novelMatch && method === "GET") {
    const { novel } = withNovel(store, novelMatch[1]);
    writeStore(store);
    saveLastContext(novel.id, novel.chapters[0]?.id);
    return makeResponse(novel as T);
  }

  const chapterCreateMatch = path.match(/^\/novels\/([^/]+)\/chapters$/);
  if (chapterCreateMatch && method === "POST") {
    const { novelIndex, novel } = withNovel(store, chapterCreateMatch[1]);
    const createdAt = nowIso();
    const nextChapter: Chapter = {
      id: makeId("chapter"),
      title: String(body?.title ?? `第${novel.chapters.length + 1}章`),
      content: "",
      plainText: "",
      wordCount: 0,
      status: "DRAFT",
      sortOrder: novel.chapters.length,
      updatedAt: createdAt,
    };
    const updated = hydrateNovel({
      ...novel,
      chapters: [nextChapter, ...novel.chapters],
      updatedAt: createdAt,
    });
    store.novels[novelIndex] = updated;
    writeStore(store);
    saveLastContext(updated.id, nextChapter.id);
    return makeResponse(nextChapter as T);
  }

  const chapterUpdateMatch = path.match(/^\/novels\/([^/]+)\/chapters\/([^/]+)$/);
  if (chapterUpdateMatch && method === "PATCH") {
    const { novelIndex, novel } = withNovel(store, chapterUpdateMatch[1]);
    const updatedAt = nowIso();
    const chapters = novel.chapters.map((chapter) =>
      chapter.id === chapterUpdateMatch[2]
        ? {
            ...chapter,
            title: body?.title ? String(body.title) : chapter.title,
            content: body?.content ? String(body.content) : chapter.content,
            plainText: body?.plainText ? String(body.plainText) : chapter.plainText,
            wordCount: countWords(
              body?.plainText ? String(body.plainText) : htmlToText(body?.content ? String(body.content) : chapter.content),
            ),
            updatedAt,
          }
        : chapter,
    );
    const updated = hydrateNovel({ ...novel, chapters, updatedAt });
    store.novels[novelIndex] = updated;
    writeStore(store);
    saveLastContext(updated.id, chapterUpdateMatch[2]);
    const chapter = updated.chapters.find((item) => item.id === chapterUpdateMatch[2]);
    return makeResponse(chapter as T);
  }

  const completeMatch = path.match(/^\/novels\/([^/]+)\/chapters\/([^/]+)\/complete$/);
  if (completeMatch && method === "POST") {
    const { novelIndex, novel } = withNovel(store, completeMatch[1]);
    const updatedAt = nowIso();
    const chapters = novel.chapters.map((chapter) =>
      chapter.id === completeMatch[2]
        ? { ...chapter, status: "COMPLETED" as const, updatedAt }
        : chapter,
    );
    const writingLog = novel.documents.find((item) => item.type === "WRITING_LOG");
    const documents = novel.documents.map((item) =>
      item.id === writingLog?.id
        ? {
            ...item,
            content: `${item.content}\n- ${body?.completionNote ? String(body.completionNote) : "章节已完成并进入写回闭环"}`,
            updatedAt,
          }
        : item,
    );
    const updated = hydrateNovel({
      ...novel,
      chapters,
      documents,
      latestWritebackSummary: "章节已完成，动态写回待作者补充。",
      latestDocumentUpdate: updatedAt,
      updatedAt,
    });
    store.novels[novelIndex] = updated;
    writeStore(store);
    return makeResponse({
      success: true,
      chapterId: completeMatch[2],
    } as T);
  }

  const docsListMatch = path.match(/^\/novels\/([^/]+)\/documents$/);
  if (docsListMatch && method === "GET") {
    const { novel } = withNovel(store, docsListMatch[1]);
    return makeResponse(novel.documents as T);
  }

  const docUpdateMatch = path.match(/^\/novels\/([^/]+)\/documents\/([^/]+)$/);
  if (docUpdateMatch && method === "PATCH") {
    const { novelIndex, novel } = withNovel(store, docUpdateMatch[1]);
    const updatedAt = nowIso();
    const documents = novel.documents.map((doc) =>
      doc.id === docUpdateMatch[2]
        ? {
            ...doc,
            title: body?.title ? String(body.title) : doc.title,
            content: body?.content ? String(body.content) : doc.content,
            updatedAt,
          }
        : doc,
    );
    const updated = hydrateNovel({ ...novel, documents, latestDocumentUpdate: updatedAt, updatedAt });
    store.novels[novelIndex] = updated;
    writeStore(store);
    const doc = updated.documents.find((item) => item.id === docUpdateMatch[2]);
    return makeResponse(doc as T);
  }

  const outlineCreateMatch = path.match(/^\/novels\/([^/]+)\/outlines$/);
  if (outlineCreateMatch && method === "POST") {
    const { novelIndex, novel } = withNovel(store, outlineCreateMatch[1]);
    const outline: Outline = {
      id: makeId("outline"),
      title: body?.title ? String(body.title) : null,
      content: String(body?.content ?? ""),
      version: novel.outlines.length + 1,
      updatedAt: nowIso(),
    };
    const updated = hydrateNovel({ ...novel, outlines: [outline, ...novel.outlines] });
    store.novels[novelIndex] = updated;
    writeStore(store);
    return makeResponse(outline as T);
  }

  const listCharactersMatch = path.match(/^\/novels\/([^/]+)\/characters$/);
  if (listCharactersMatch && method === "GET") {
    const { novel } = withNovel(store, listCharactersMatch[1]);
    return makeResponse(novel.characters as T);
  }

  if (listCharactersMatch && method === "POST") {
    const { novelIndex, novel } = withNovel(store, listCharactersMatch[1]);
    const character: Character = {
      id: makeId("char"),
      name: String(body?.name ?? "未命名角色"),
      identity: body?.identity ? String(body.identity) : null,
      personality: body?.personality ? String(body.personality) : null,
      appearance: body?.appearance ? String(body.appearance) : null,
      background: body?.background ? String(body.background) : null,
    };
    const updated = hydrateNovel({ ...novel, characters: [character, ...novel.characters] });
    store.novels[novelIndex] = updated;
    writeStore(store);
    return makeResponse(character as T);
  }

  const deleteCharacterMatch = path.match(/^\/novels\/([^/]+)\/characters\/([^/]+)$/);
  if (deleteCharacterMatch && method === "DELETE") {
    const { novelIndex, novel } = withNovel(store, deleteCharacterMatch[1]);
    const updated = hydrateNovel({
      ...novel,
      characters: novel.characters.filter((item) => item.id !== deleteCharacterMatch[2]),
    });
    store.novels[novelIndex] = updated;
    writeStore(store);
    return makeResponse({ success: true } as T);
  }

  if (path === "/compliance/scan" && method === "POST") {
    const content = String(body?.content ?? "");
    const findings: ScanFinding[] = content.includes("现代词汇")
      ? [
          {
            word: "现代词汇",
            start: 0,
            end: 4,
            suggestion: "检查是否与当前小说时代感冲突。",
          },
        ]
      : [];
    return makeResponse({ findings } as T);
  }

  if (path === "/ai/generate" && method === "POST") {
    const type = String(body?.type ?? "INSPIRATION");
    return makeResponse({
      model: "demo-control-engine",
      outputs: [
        {
          content:
            type === "OUTLINE"
              ? "下一章先回收一笔旧债，再让角色关系升温，最后留下新的推进钩子。"
              : "这一段建议强化人物动作与因果桥接，不要只增加修辞密度。",
          findings: [],
        },
      ],
      usage: store.membership,
    } as T);
  }

  if (path === "/membership/me") {
    return makeResponse(store.membership as T);
  }

  if (path === "/payments/membership-plan") {
    return makeResponse(store.paymentPlan as T);
  }

  if (path === "/payments/orders/membership" && method === "POST") {
    const createdAt = nowIso();
    const order: PaymentOrder = {
      id: makeId("order"),
      planCode: store.paymentPlan.code,
      description: store.paymentPlan.title,
      channel: "WECHAT_NATIVE",
      amountFen: store.paymentPlan.priceFen,
      currency: "CNY",
      status: "PENDING",
      outTradeNo: makeId("trade"),
      codeUrl: "https://example.com/mock-payment",
      expireAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      createdAt,
      updatedAt: createdAt,
    };
    store.paymentOrders.unshift(order);
    writeStore(store);
    return makeResponse(order as T);
  }

  const orderMatch = path.match(/^\/payments\/orders\/([^/]+)$/);
  if (orderMatch && method === "GET") {
    const order = store.paymentOrders.find((item) => item.id === orderMatch[1]);
    if (!order) {
      throw new Error("订单不存在");
    }
    return makeResponse(order as T);
  }

  if (path === "/membership/mock-upgrade" && method === "POST") {
    store.user = { ...store.user, membershipType: "MEMBER" };
    store.membership = { ...store.membership, membershipType: "MEMBER" };
    writeStore(store);
    return makeResponse(store.user as T);
  }

  const exportMatch = path.match(/^\/novels\/([^/]+)\/export$/);
  if (exportMatch && method === "GET") {
    const { novel } = withNovel(store, exportMatch[1]);
    const content = sortChapters(novel.chapters)
      .slice()
      .reverse()
      .map((chapter) => `${chapter.title}\n\n${chapter.plainText}`)
      .join("\n\n");
    return makeResponse({
      filename: `${novel.title}.txt`,
      content,
    } as T);
  }

  throw new Error(`未实现的本地接口: ${method} ${path}`);
}

function shouldFallbackToMock(error: unknown) {
  if (!ensureBrowser()) {
    return false;
  }

  if (error instanceof TypeError) {
    return true;
  }

  if (error instanceof Error) {
    return /fetch|network|Failed to fetch|Load failed|ECONNREFUSED/i.test(error.message);
  }

  return false;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "请求失败");
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (shouldFallbackToMock(error)) {
      return mockRequest<T>(path, options);
    }

    throw error;
  }
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>("/health"),
  enableDevLogin: ENABLE_DEV_LOGIN,
  getWechatLoginUrl: (state?: string) =>
    `${API_URL}/auth/wechat/start${state ? `?state=${encodeURIComponent(state)}` : ""}`,
  login: (body: { openid: string; nickname?: string; preferredGenre?: string }) =>
    request<{ user: User }>("/auth/dev-login", {
      method: "POST",
      body,
    }),
  logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST" }),
  me: () => request<User>("/auth/me"),
  updateProfile: (body: { nickname?: string; avatar?: string; preferredGenre?: string }) =>
    request<User>("/users/me", { method: "PATCH", body }),
  listNovels: () => request<NovelSummary[]>("/novels"),
  createNovel: (body: {
    title: string;
    genre: string;
    synopsis?: string;
    targetWordCount?: number;
  }) => request<NovelSummary>("/novels", { method: "POST", body }),
  getNovel: (novelId: string) => request<NovelDetail>(`/novels/${novelId}`),
  createChapter: (novelId: string, body: { title: string }) =>
    request<Chapter>(`/novels/${novelId}/chapters`, { method: "POST", body }),
  updateChapter: (
    novelId: string,
    chapterId: string,
    body: { title?: string; content?: string; plainText?: string },
  ) => request(`/novels/${novelId}/chapters/${chapterId}`, { method: "PATCH", body }),
  completeChapter: (
    novelId: string,
    chapterId: string,
    body?: { completionNote?: string },
  ) =>
    request(`/novels/${novelId}/chapters/${chapterId}/complete`, {
      method: "POST",
      body,
    }),
  listNovelDocuments: (novelId: string) =>
    request<NovelDocument[]>(`/novels/${novelId}/documents`),
  updateNovelDocument: (
    novelId: string,
    documentId: string,
    body: { title?: string; content?: string },
  ) =>
    request<NovelDocument>(`/novels/${novelId}/documents/${documentId}`, {
      method: "PATCH",
      body,
    }),
  createOutline: (novelId: string, body: { title?: string; content: string }) =>
    request<Outline>(`/novels/${novelId}/outlines`, { method: "POST", body }),
  listCharacters: (novelId: string) => request<Character[]>(`/novels/${novelId}/characters`),
  createCharacter: (
    novelId: string,
    body: {
      name: string;
      identity?: string;
      personality?: string;
      appearance?: string;
      background?: string;
    },
  ) => request<Character>(`/novels/${novelId}/characters`, { method: "POST", body }),
  deleteCharacter: (novelId: string, characterId: string) =>
    request<{ success: boolean }>(`/novels/${novelId}/characters/${characterId}`, {
      method: "DELETE",
    }),
  scanContent: (content: string) =>
    request<{ findings: ScanFinding[] }>("/compliance/scan", {
      method: "POST",
      body: { content },
    }),
  generate: (body: {
    novelId: string;
    chapterId?: string;
    outlineId?: string;
    characterIds?: string[];
    selectedText?: string;
    instruction?: string;
    type:
      | "OUTLINE"
      | "OPENING"
      | "CONTINUATION"
      | "EXPAND"
      | "SHORTEN"
      | "REWRITE"
      | "INSPIRATION";
  }) => request<GenerationResponse>("/ai/generate", { method: "POST", body }),
  membership: () => request<MembershipStatus>("/membership/me"),
  getMembershipPlan: () => request<PaymentPlan>("/payments/membership-plan"),
  createMembershipOrder: () =>
    request<PaymentOrder>("/payments/orders/membership", { method: "POST" }),
  getPaymentOrder: (orderId: string) =>
    request<PaymentOrder>(`/payments/orders/${orderId}`),
  mockUpgradeMembership: () =>
    request<User>("/membership/mock-upgrade", { method: "POST" }),
  exportNovel: (novelId: string) =>
    request<{ filename: string; content: string }>(`/novels/${novelId}/export`),
};
