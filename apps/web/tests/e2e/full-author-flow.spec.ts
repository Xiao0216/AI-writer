import { expect, test } from "@playwright/test";

test("author core flow works end-to-end without membership", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  const projectTitle = `测试项目-${Date.now()}`;

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /不是帮你写一段/ }),
  ).toBeVisible();

  await page.getByRole("link", { name: "进入控制站" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByPlaceholder("openid").fill("writer-e2e");
  await page.getByPlaceholder("笔名").fill("链路作者");
  await page.getByPlaceholder("常写品类").fill("悬疑");
  await page.getByRole("button", { name: "开发环境快捷登录" }).click();

  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await expect(page.getByRole("link", { name: "新建项目" })).toBeVisible();

  await page.getByRole("link", { name: "新建项目" }).click();
  await expect(page).toHaveURL(/\/novels\/new$/);

  await page.getByPlaceholder("作品名称").fill(projectTitle);
  await page.getByPlaceholder("作品品类").fill("悬疑");
  await page.getByPlaceholder("作品简介或一句话承诺").fill("一封旧信牵出一座城的失踪债务。");
  await page.getByRole("button", { name: "创建项目并进入立项流" }).click();

  await page.waitForURL("**/novels/*/intake", { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "启动立项流" })).toBeVisible();

  const intakeAnswers = [
    "这本书要让读者一路追查旧城失踪案背后的真相。",
    "主角是被旧案拖住多年的调查记者，越接近答案越危险。",
    "结局要让真相公开，但主角必须为此失去一段重要关系。",
    "冷静、压迫、留白、持续承压",
    "最早形成张力的人物是主角的旧搭档，他知道主角不愿提的过去。",
    "第一章必须抛出失踪旧信，并让主角背上必须追查的债务。",
  ];

  for (const [index, answer] of intakeAnswers.entries()) {
    const field = page.locator(".station-input:visible").last();
    await field.fill(answer);
    if (index < intakeAnswers.length - 1) {
      await page.getByRole("button", { name: "下一步" }).click();
    }
  }

  await page.getByRole("button", { name: "保存作品资料并返回项目页" }).click();

  await page.waitForURL(/\/novels\/.+$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: projectTitle })).toBeVisible();
  await expect(page.getByRole("link", { name: "写前回顾", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "自动续写", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "创建首章并进入章节控制页" }).click();
  await page.waitForURL(/\/novels\/.+\/chapters\/.+$/, { timeout: 15000 });
  await expect(page.getByText("章节控制进行中")).toBeVisible();

  const editor = page.locator(".ProseMirror");
  await editor.click();
  await page.keyboard.type("深夜十一点，周砚收到一封没有寄件人的来信。");
  await page.getByRole("button", { name: "立即保存" }).click();
  await expect(page.getByText("已手动保存")).toBeVisible();

  await page.locator("select").first().selectOption("INSPIRATION");
  await page
    .getByPlaceholder("比如：开头三段一定要直接抛出冲突，文风偏热血。")
    .fill("延续悬疑气氛，收尾留下追查钩子。");
  await page.getByRole("button", { name: "生成内容" }).click();
  await expect(page.getByText(/当前模型：demo-control-engine|当前模型：/)).toBeVisible();
  await page.getByRole("button", { name: "插入文末" }).click();
  await expect(editor).toContainText("这一段建议强化人物动作与因果桥接");

  await page.getByRole("button", { name: "完成并写回" }).last().click();
  await expect(page.getByText("当前章已标记为完成")).toBeVisible();

  await page.getByRole("link", { name: "写前回顾", exact: true }).click();
  await page.waitForURL(/\/novels\/.+\/memory$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "写前回顾" })).toBeVisible();
  await expect(page.getByRole("link", { name: "打开章节控制页" })).toBeVisible();

  await page.getByRole("link", { name: "自动续写", exact: true }).click();
  await page.waitForURL(/\/novels\/.+\/marathon$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "自动续写台" })).toBeVisible();
  await expect(page.getByText("自动续写流程")).toBeVisible();

  await page.getByRole("link", { name: "作品资料", exact: true }).click();
  await page.waitForURL(/\/novels\/.+$/, { timeout: 15000 });
  await expect(page.getByRole("button", { name: "保存资料" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "00 项目总览" })).toBeVisible();
});
