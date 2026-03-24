import type {
  Character,
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

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
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
    request(`/novels/${novelId}/chapters`, { method: "POST", body }),
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
  ) => request<NovelDocument>(`/novels/${novelId}/documents/${documentId}`, { method: "PATCH", body }),
  createOutline: (novelId: string, body: { title?: string; content: string }) =>
    request<Outline>(`/novels/${novelId}/outlines`, { method: "POST", body }),
  listCharacters: (novelId: string) =>
    request<Character[]>(`/novels/${novelId}/characters`),
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
