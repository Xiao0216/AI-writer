export type User = {
  id: string;
  nickname: string;
  avatar?: string | null;
  preferredGenre?: string | null;
  membershipType: "FREE" | "MEMBER";
  membershipExpireAt?: string | null;
};

export type Chapter = {
  id: string;
  title: string;
  content: string;
  plainText: string;
  wordCount: number;
  status: "DRAFT" | "COMPLETED";
  sortOrder: number;
  updatedAt: string;
};

export type NovelDocument = {
  id: string;
  type:
    | "PROJECT_OVERVIEW"
    | "THEME_AND_PROPOSITION"
    | "WORLDBUILDING"
    | "CAST_BIBLE"
    | "RELATIONSHIP_MAP"
    | "MAIN_PLOTLINES"
    | "FORESHADOW_LEDGER"
    | "CHAPTER_ROADMAP"
    | "DYNAMIC_STATE"
    | "STYLE_GUIDE"
    | "WRITING_LOG";
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Outline = {
  id: string;
  title?: string | null;
  content: string;
  version: number;
  updatedAt: string;
};

export type Character = {
  id: string;
  name: string;
  identity?: string | null;
  personality?: string | null;
  appearance?: string | null;
  background?: string | null;
};

export type NovelSummary = {
  id: string;
  title: string;
  genre: string;
  synopsis?: string | null;
  totalWordCount: number;
  updatedAt: string;
  latestDocumentUpdate?: string | null;
  documentCompletionCount?: number;
  completedChapterCount?: number;
  latestWritebackSummary?: string | null;
  latestChapterTitle?: string | null;
  latestChapterStatus?: "DRAFT" | "COMPLETED" | null;
  nextAction?: string;
  stage?: "ALIGNMENT" | "OUTLINE_READY" | "WRITING";
  _count?: {
    chapters: number;
    characters: number;
    outlines: number;
  };
};

export type NovelDetail = NovelSummary & {
  chapters: Chapter[];
  outlines: Outline[];
  characters: Character[];
  documents: NovelDocument[];
};

export type ScanFinding = {
  word: string;
  start: number;
  end: number;
  suggestion: string;
};

export type MembershipStatus = {
  membershipType: "FREE" | "MEMBER";
  membershipExpireAt?: string | null;
  dailyLimit?: number | null;
  usedToday: number;
  remainingToday?: number | null;
};

export type PaymentPlan = {
  code: string;
  title: string;
  description: string;
  priceFen: number;
  durationMonths: number;
  channel: "WECHAT_NATIVE";
  configured: boolean;
};

export type PaymentOrder = {
  id: string;
  planCode: string;
  description: string;
  channel: "WECHAT_NATIVE";
  amountFen: number;
  currency: string;
  status: "PENDING" | "PAID" | "CLOSED" | "FAILED" | "REFUNDED";
  outTradeNo: string;
  codeUrl?: string | null;
  paidAt?: string | null;
  expireAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GenerationOutput = {
  content: string;
  findings: ScanFinding[];
};

export type GenerationResponse = {
  model: string;
  outputs: GenerationOutput[];
  usage: MembershipStatus;
};
