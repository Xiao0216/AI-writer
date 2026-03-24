import { test, expect } from "@playwright/test";

test("home and login flow renders correctly", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("用 AI，写好每一本小说。")).toBeVisible();

  await page.getByRole("link", { name: "立即进入创作台" }).click();
  await expect(page).toHaveURL(/\/login$/);

  const wechatButton = page.getByRole("link", { name: "使用微信扫码登录" });
  await expect(wechatButton).toBeVisible();
  await expect(wechatButton).toHaveAttribute("href", /auth\/wechat\/start/);

  await expect(
    page.getByRole("button", { name: "开发环境快捷登录" }),
  ).toBeVisible();
  await expect(page.getByPlaceholder("openid")).toHaveValue("demo-writer");
});
