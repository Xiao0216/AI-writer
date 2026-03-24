import { expect, test } from "@playwright/test";

type User = {
  id: string;
  nickname: string;
  membershipType: "FREE" | "MEMBER";
  membershipExpireAt?: string | null;
  preferredGenre?: string | null;
};

type Character = {
  id: string;
  name: string;
  identity?: string | null;
  personality?: string | null;
  appearance?: string | null;
  background?: string | null;
};

type Outline = {
  id: string;
  title?: string | null;
  content: string;
  version: number;
  updatedAt: string;
};

type Chapter = {
  id: string;
  title: string;
  content: string;
  plainText: string;
  wordCount: number;
  sortOrder: number;
  updatedAt: string;
};

type Novel = {
  id: string;
  title: string;
  genre: string;
  synopsis?: string | null;
  totalWordCount: number;
  updatedAt: string;
  characters: Character[];
  outlines: Outline[];
  chapters: Chapter[];
};

type PaymentOrder = {
  id: string;
  amountFen: number;
  codeUrl: string;
  outTradeNo: string;
  status: "PENDING" | "PAID";
  expireAt: string;
};

const now = () => new Date().toISOString();

test("author flow: login, create novel, create assets, write and generate", async ({
  page,
}) => {
  const corsHeaders = {
    "access-control-allow-origin": "http://127.0.0.1:3000",
    "access-control-allow-credentials": "true",
    "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
    "content-type": "application/json",
  };

  const user: User = {
    id: "user-1",
    nickname: "试写作者",
    membershipType: "FREE",
    membershipExpireAt: null,
    preferredGenre: "都市爽文",
  };

  const state: {
    novels: Novel[];
    membershipRequests: number;
    order: PaymentOrder | null;
  } = {
    novels: [],
    membershipRequests: 0,
    order: null,
  };

  const buildNovelDetail = (novel: Novel) => ({
    id: novel.id,
    title: novel.title,
    genre: novel.genre,
    synopsis: novel.synopsis,
    totalWordCount: novel.totalWordCount,
    updatedAt: novel.updatedAt,
    chapters: [...novel.chapters].sort((a, b) => a.sortOrder - b.sortOrder),
    outlines: [...novel.outlines].sort((a, b) => b.version - a.version),
    characters: [...novel.characters].sort((a, b) => b.name.localeCompare(a.name)),
  });

  await page.route("http://127.0.0.1:4010/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;
    const body = request.postDataJSON?.() as Record<string, unknown> | undefined;

    if (method === "OPTIONS") {
      await route.fulfill({
        status: 204,
        headers: corsHeaders,
        body: "",
      });
      return;
    }

    if (method === "POST" && path === "/auth/dev-login") {
      await route.fulfill({ json: { user }, headers: corsHeaders });
      return;
    }

    if (method === "GET" && path === "/auth/me") {
      await route.fulfill({ json: user, headers: corsHeaders });
      return;
    }

    if (method === "GET" && path === "/membership/me") {
      await route.fulfill({
        json: {
          membershipType: user.membershipType,
          membershipExpireAt: user.membershipExpireAt,
          usedToday: 1,
          remainingToday: user.membershipType === "FREE" ? 29 : null,
        },
        headers: corsHeaders,
      });
      return;
    }

    if (method === "GET" && path === "/payments/membership-plan") {
      await route.fulfill({
        headers: corsHeaders,
        json: {
          code: "MEMBER_MONTH",
          title: "文枢AI 会员月卡",
          description: "开通后解锁会员额度与完整创作权益",
          priceFen: 1990,
          durationMonths: 1,
          channel: "WECHAT_NATIVE",
          configured: true,
        },
      });
      return;
    }

    if (method === "POST" && path === "/payments/orders/membership") {
      state.order = {
        id: "order-1",
        amountFen: 1990,
        codeUrl: "weixin://wxpay/bizpayurl?pr=wenshu-order-1",
        outTradeNo: "WS202603220001",
        status: "PENDING",
        expireAt: "2026-03-22T12:15:00.000Z",
      };
      await route.fulfill({
        headers: corsHeaders,
        json: {
          ...state.order,
          planCode: "MEMBER_MONTH",
          description: "文枢AI 会员月卡",
          channel: "WECHAT_NATIVE",
          currency: "CNY",
          paidAt: null,
          createdAt: now(),
          updatedAt: now(),
        },
      });
      return;
    }

    const orderMatch = path.match(/^\/payments\/orders\/([^/]+)$/);
    if (method === "GET" && orderMatch && state.order) {
      state.membershipRequests += 1;
      if (state.membershipRequests >= 1) {
        state.order.status = "PAID";
        user.membershipType = "MEMBER";
        user.membershipExpireAt = "2026-04-22T12:00:00.000Z";
      }

      await route.fulfill({
        headers: corsHeaders,
        json: {
          ...state.order,
          planCode: "MEMBER_MONTH",
          description: "文枢AI 会员月卡",
          channel: "WECHAT_NATIVE",
          currency: "CNY",
          paidAt:
            state.order.status === "PAID" ? "2026-03-22T12:01:00.000Z" : null,
          createdAt: now(),
          updatedAt: now(),
        },
      });
      return;
    }

    if (method === "GET" && path === "/novels") {
      await route.fulfill({
        headers: corsHeaders,
        json: state.novels.map((novel) => ({
          id: novel.id,
          title: novel.title,
          genre: novel.genre,
          synopsis: novel.synopsis,
          totalWordCount: novel.totalWordCount,
          updatedAt: novel.updatedAt,
          _count: {
            chapters: novel.chapters.length,
            characters: novel.characters.length,
            outlines: novel.outlines.length,
          },
        })),
      });
      return;
    }

    if (method === "POST" && path === "/novels") {
      const novel: Novel = {
        id: `novel-${state.novels.length + 1}`,
        title: String(body?.title ?? ""),
        genre: String(body?.genre ?? ""),
        synopsis: String(body?.synopsis ?? ""),
        totalWordCount: 0,
        updatedAt: now(),
        characters: [],
        outlines: [],
        chapters: [],
      };
      state.novels.push(novel);
      await route.fulfill({
        headers: corsHeaders,
        json: {
          id: novel.id,
          title: novel.title,
          genre: novel.genre,
          synopsis: novel.synopsis,
          totalWordCount: novel.totalWordCount,
          updatedAt: novel.updatedAt,
        },
      });
      return;
    }

    const novelMatch = path.match(/^\/novels\/([^/]+)$/);
    if (method === "GET" && novelMatch) {
      const novel = state.novels.find((item) => item.id === novelMatch[1]);
      await route.fulfill({ json: buildNovelDetail(novel!), headers: corsHeaders });
      return;
    }

    const outlineMatch = path.match(/^\/novels\/([^/]+)\/outlines$/);
    if (method === "POST" && outlineMatch) {
      const novel = state.novels.find((item) => item.id === outlineMatch[1])!;
      novel.outlines.push({
        id: `outline-${novel.outlines.length + 1}`,
        title: null,
        content: String(body?.content ?? ""),
        version: novel.outlines.length + 1,
        updatedAt: now(),
      });
      novel.updatedAt = now();
      await route.fulfill({ json: novel.outlines.at(-1), headers: corsHeaders });
      return;
    }

    const charactersMatch = path.match(/^\/novels\/([^/]+)\/characters$/);
    if (charactersMatch && method === "GET") {
      const novel = state.novels.find((item) => item.id === charactersMatch[1])!;
      await route.fulfill({ json: novel.characters, headers: corsHeaders });
      return;
    }

    if (charactersMatch && method === "POST") {
      const novel = state.novels.find((item) => item.id === charactersMatch[1])!;
      const character: Character = {
        id: `character-${novel.characters.length + 1}`,
        name: String(body?.name ?? ""),
        identity: String(body?.identity ?? ""),
        personality: String(body?.personality ?? ""),
        appearance: String(body?.appearance ?? ""),
        background: String(body?.background ?? ""),
      };
      novel.characters.unshift(character);
      novel.updatedAt = now();
      await route.fulfill({ json: character, headers: corsHeaders });
      return;
    }

    const chaptersMatch = path.match(/^\/novels\/([^/]+)\/chapters$/);
    if (chaptersMatch && method === "POST") {
      const novel = state.novels.find((item) => item.id === chaptersMatch[1])!;
      const chapter: Chapter = {
        id: `chapter-${novel.chapters.length + 1}`,
        title: String(body?.title ?? ""),
        content: "",
        plainText: "",
        wordCount: 0,
        sortOrder: novel.chapters.length,
        updatedAt: now(),
      };
      novel.chapters.push(chapter);
      novel.updatedAt = now();
      await route.fulfill({ json: chapter, headers: corsHeaders });
      return;
    }

    const chapterUpdateMatch = path.match(/^\/novels\/([^/]+)\/chapters\/([^/]+)$/);
    if (chapterUpdateMatch && method === "PATCH") {
      const novel = state.novels.find((item) => item.id === chapterUpdateMatch[1])!;
      const chapter = novel.chapters.find((item) => item.id === chapterUpdateMatch[2])!;
      chapter.content = String(body?.content ?? chapter.content);
      chapter.plainText = String(body?.plainText ?? chapter.plainText);
      chapter.wordCount = chapter.plainText.replace(/\s+/g, "").length;
      chapter.updatedAt = now();
      novel.totalWordCount = novel.chapters.reduce(
        (sum, item) => sum + item.wordCount,
        0,
      );
      novel.updatedAt = now();
      await route.fulfill({ json: chapter, headers: corsHeaders });
      return;
    }

    if (method === "POST" && path === "/compliance/scan") {
      await route.fulfill({ json: { findings: [] }, headers: corsHeaders });
      return;
    }

    if (method === "POST" && path === "/ai/generate") {
      await route.fulfill({
        headers: corsHeaders,
        json: {
          model: "mock-wenshu-e2e",
          outputs: [
            {
              content: "AI补全文案：主角在门外听见异响，决定主动出击。",
              findings: [],
            },
          ],
          usage: {
            membershipType: "FREE",
            usedToday: 1,
            remainingToday: 29,
          },
        },
      });
      return;
    }

    await route.fulfill({
      status: 500,
      headers: corsHeaders,
      json: { error: `Unhandled route: ${method} ${path}` },
    });
  });

  await page.goto("/login");
  await page.getByPlaceholder("openid").fill("writer-e2e");
  await page.getByPlaceholder("笔名").fill("作者甲");
  await page.getByPlaceholder("常写品类").fill("悬疑");
  await expect(
    page.getByRole("button", { name: "开发环境快捷登录" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "开发环境快捷登录" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /创作台$/ })).toBeVisible();

  await page.getByRole("link", { name: "新建作品" }).click();
  await expect(page).toHaveURL(/\/novels\/new$/);

  await page.getByPlaceholder("作品名称").fill("夜行回廊");
  await page.getByPlaceholder("作品品类").fill("悬疑");
  await page.getByPlaceholder("作品简介").fill("一个失踪案牵出旧城回廊的真相。");
  await page.getByRole("button", { name: "创建作品" }).click();

  await expect(page).toHaveURL(/\/novels\/novel-1$/);
  await expect(page.getByText("夜行回廊")).toBeVisible();

  await page.getByPlaceholder("把你自己的主线拆解写在这里。").fill("第一卷：失踪案。");
  await page.getByRole("button", { name: "保存大纲版本" }).click();
  await expect(page.getByText("第一卷：失踪案。")).toBeVisible();

  await page.getByRole("link", { name: "进入角色页" }).click();
  await expect(page).toHaveURL(/\/novels\/novel-1\/characters$/);
  await page.getByPlaceholder("角色名").fill("周砚");
  await page.getByPlaceholder("身份").fill("调查记者");
  await page.getByPlaceholder("性格").fill("冷静克制");
  await page.getByPlaceholder("外貌").fill("黑风衣");
  await page.getByPlaceholder("背景故事").fill("三年前追查旧案失败。");
  await page.getByRole("button", { name: "保存角色" }).click();
  await expect(page.getByText("周砚")).toBeVisible();

  await page.goto("/novels/novel-1");
  await page.locator("input").first().fill("第一章 回廊来信");
  await page.getByRole("button", { name: "添加章节" }).click();
  await page.getByRole("link", { name: /第一章 回廊来信/ }).click();

  await expect(page).toHaveURL(/\/novels\/novel-1\/chapters\/chapter-1$/);
  const editor = page.locator(".ProseMirror");
  await editor.click();
  await page.keyboard.type("深夜十一点，周砚收到一封没有寄件人的来信。");
  await page.getByRole("button", { name: "立即保存" }).click();
  await expect(page.getByText("已手动保存")).toBeVisible();

  await page.getByRole("button", { name: "周砚" }).click();
  await page
    .getByPlaceholder("比如：开头三段一定要直接抛出冲突，文风偏热血。")
    .fill("延续悬疑气氛，收尾留下追查钩子。");
  await page.getByRole("button", { name: "生成内容" }).click();

  await expect(page.getByText("当前模型：mock-wenshu-e2e")).toBeVisible();
  await expect(page.getByText("AI补全文案：主角在门外听见异响")).toBeVisible();
  await page.getByRole("button", { name: "插入文末" }).click();
  await expect(editor).toContainText("AI补全文案：主角在门外听见异响，决定主动出击。");

  await page.getByRole("link", { name: "会员" }).click();
  await expect(page).toHaveURL(/\/membership$/);
  await expect(page.getByRole("heading", { name: "免费版" })).toBeVisible();
  await page.getByRole("button", { name: "立即开通月卡" }).click();
  await expect(page.getByRole("heading", { name: "扫码完成支付" })).toBeVisible();
  await page.getByRole("button", { name: "刷新支付状态" }).click();
  await expect(page.getByText("支付成功，会员权益已到账。")).toBeVisible();
  await expect(page.getByRole("heading", { name: "会员版" })).toBeVisible();
});
