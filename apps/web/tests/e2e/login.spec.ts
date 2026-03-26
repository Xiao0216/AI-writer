import { test, expect } from "@playwright/test";

test("home and login flow renders correctly", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "不是帮你写一段， 是帮你把整本书控住。" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "进入控制站" }).click();
  await expect(page).toHaveURL(/\/login$/);

  const wechatButton = page.getByRole("link", { name: "使用微信扫码登录" });
  await expect(wechatButton).toBeVisible();
  await expect(wechatButton).toHaveAttribute("href", /auth\/wechat\/start/);

  await expect(
    page.getByRole("button", { name: "开发环境快捷登录" }),
  ).toBeVisible();
  await expect(page.getByPlaceholder("openid")).toHaveValue("demo-writer");
});
