# 文枢AI 公网部署说明

## 目标

- 前端部署到 Vercel
- API 通过 Vercel Serverless 入口提供
- PostgreSQL 使用 Supabase 托管数据库

## GitHub 准备

1. 创建 GitHub 仓库
2. 将本地仓库推送到远端
3. 确保默认分支可被 Vercel 导入

## Supabase 准备

1. 创建新项目
2. 获取项目数据库连接串
3. 在本地执行 Prisma migration 到 Supabase 数据库

关键环境变量：

- `DATABASE_URL`
- `DIRECT_URL`（可选，供 Prisma 使用）

## Vercel 准备

需要在 Vercel 中配置：

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `NEXT_PUBLIC_API_URL`
- `WECHAT_APP_ID`
- `WECHAT_APP_SECRET`
- `WECHAT_REDIRECT_URI`
- `WECHAT_PAY_APP_ID`
- `WECHAT_PAY_MCH_ID`
- `WECHAT_PAY_SERIAL_NO`
- `WECHAT_PAY_PRIVATE_KEY` 或 `WECHAT_PAY_PRIVATE_KEY_PATH`
- `WECHAT_PAY_PLATFORM_PUBLIC_KEY` 或 `WECHAT_PAY_PLATFORM_PUBLIC_KEY_PATH`
- `WECHAT_PAY_API_V3_KEY`
- `WECHAT_PAY_NOTIFY_URL`

## 推荐公网结构

- 前端域名：`https://your-web.vercel.app`
- API 路径：`https://your-web.vercel.app/api/...`

此时前端建议配置：

- `NEXT_PUBLIC_API_URL=https://your-web.vercel.app/api`

后端建议配置：

- `FRONTEND_URL=https://your-web.vercel.app`

## 上线后检查

1. 访问首页
2. 访问 `/dashboard`
3. 访问 `/api/health`
4. 测试开发环境快捷登录
5. 创建项目
6. 打开启动访谈页
7. 完成一章并确认写回
