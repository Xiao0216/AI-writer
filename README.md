# 文枢AI

文枢AI是一个面向网文作者的 AI 辅助创作平台。当前仓库采用前后端同仓结构：

- `apps/web`: Next.js Web 客户端
- `apps/api`: NestJS API 服务
- `infra`: 本地 PostgreSQL / Redis 基础设施
- `docs`: 计划、设计和上线文档

## Quick Start

1. `cp apps/web/.env.example apps/web/.env.local`
2. `cp apps/api/.env.example apps/api/.env`
3. `docker compose -f infra/docker-compose.yml up -d`
4. `npm install`
5. `npm run dev`

## Product Scope

文枢AI的最新产品方向已经从“AI 写作工具”升级为“长篇小说创作控制站”。

当前建议优先阅读这份产品手册：

- [docs/plans/2026-03-23-wenshu-ai-product-manual.md](/Users/ze/Desktop/AI-writer/docs/plans/2026-03-23-wenshu-ai-product-manual.md)

配套课程化拆解文档：

- [docs/plans/2026-03-23-wenshu-ai-quest-map-l1.md](/Users/ze/Desktop/AI-writer/docs/plans/2026-03-23-wenshu-ai-quest-map-l1.md)
- [docs/plans/2026-03-23-wenshu-ai-quest-map-l2.md](/Users/ze/Desktop/AI-writer/docs/plans/2026-03-23-wenshu-ai-quest-map-l2.md)
- [docs/plans/2026-03-23-wenshu-ai-quest-map-l3.md](/Users/ze/Desktop/AI-writer/docs/plans/2026-03-23-wenshu-ai-quest-map-l3.md)

当前执行入口：

- [docs/execution/README.md](/Users/ze/Desktop/AI-writer/docs/execution/README.md)

新版 V1 的核心不再是堆叠零散生成按钮，而是围绕以下能力建立闭环：

- 项目启动访谈与立项对齐
- 标准控制文件体系
- 项目控制台
- 章节控制卡
- 连续性检查与动态写回
- 疯狂写作 / 马拉松模式的护栏化推进

## Payment Setup

真实微信支付走 API v3 Native 扫码支付。至少需要在 `apps/api/.env` 配置：

- `WECHAT_PAY_APP_ID`
- `WECHAT_PAY_MCH_ID`
- `WECHAT_PAY_SERIAL_NO`
- `WECHAT_PAY_PRIVATE_KEY` 或 `WECHAT_PAY_PRIVATE_KEY_PATH`
- `WECHAT_PAY_PLATFORM_PUBLIC_KEY` 或 `WECHAT_PAY_PLATFORM_PUBLIC_KEY_PATH`
- `WECHAT_PAY_API_V3_KEY`
- `WECHAT_PAY_NOTIFY_URL`

会员价格与时长也可以通过以下变量调整：

- `MEMBERSHIP_MONTH_PRICE_FEN`
- `MEMBERSHIP_MONTH_DURATION_MONTHS`
- `MEMBERSHIP_MONTH_TITLE`
- `MEMBERSHIP_MONTH_DESCRIPTION`
