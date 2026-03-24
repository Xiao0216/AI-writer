# 文枢AI 公网部署说明（Web on Vercel, API on Railway, DB on Supabase）

## 目标

- 前端部署到 Vercel
- API 部署到 Railway
- PostgreSQL 使用 Supabase

这是当前更稳的方案，因为项目后端是完整 Nest 应用，不是轻量 Serverless 函数组合。

## 当前公网地址

- Web: [https://web-4w77wsuxu-xiao0216s-projects.vercel.app](https://web-4w77wsuxu-xiao0216s-projects.vercel.app)

## Railway 部署 API

### 方式

1. 打开 Railway 网页后台
2. 新建项目
3. 选择 `Deploy from GitHub repo`
4. 选择仓库 `Xiao0216/AI-writer`

### Railway 使用的部署配置

- [railway.json](/Users/ze/Desktop/AI-writer/railway.json)
- [nixpacks.toml](/Users/ze/Desktop/AI-writer/nixpacks.toml)

### API 环境变量

至少配置：

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `WECHAT_APP_ID`
- `WECHAT_APP_SECRET`
- `WECHAT_REDIRECT_URI`
- `WECHAT_PAY_APP_ID`
- `WECHAT_PAY_MCH_ID`
- `WECHAT_PAY_SERIAL_NO`
- `WECHAT_PAY_PRIVATE_KEY`
- `WECHAT_PAY_PLATFORM_PUBLIC_KEY`
- `WECHAT_PAY_API_V3_KEY`
- `WECHAT_PAY_NOTIFY_URL`

### 当前推荐数据库连接串

```env
DATABASE_URL=postgresql://postgres.voocqwxigybycwzjmvtd:7QvgWH3yOHSz6N7A@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require
DIRECT_URL=postgresql://postgres.voocqwxigybycwzjmvtd:7QvgWH3yOHSz6N7A@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require
```

## Vercel Web 环境变量

在 Vercel `web` 项目中配置：

- `NEXT_PUBLIC_API_URL=https://你的-railway-api-域名`
- `NEXT_PUBLIC_ENABLE_DEV_LOGIN=true`
- `NEXT_PUBLIC_SUPPORTS_WECHAT_NATIVE_PAY=true`

## 连接检查

### API 健康检查

- `https://你的-railway-api-域名/health`

### Web 健康检查

- 打开首页
- 进入 `/dashboard`
- 登录并创建项目

## 当前建议

先把 API 切到 Railway，再把 Vercel Web 的 `NEXT_PUBLIC_API_URL` 改到 Railway 域名。
这样可以避免继续在 Vercel Serverless 上和 Nest 运行时对抗。
