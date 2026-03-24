# Quest 1 工程底座执行区

这个目录用于执行 `Quest 1`。

## 目标

把前后端、数据库、缓存和测试环境统一跑起来，让后续所有业务关卡都建立在稳定底座之上。

## 建议执行顺序

1. [environment-checklist.md](/Users/ze/Desktop/AI-writer/docs/execution/bootstrap/environment-checklist.md)
2. [frontend-boot-proof.md](/Users/ze/Desktop/AI-writer/docs/execution/bootstrap/frontend-boot-proof.md)
3. [backend-health-proof.md](/Users/ze/Desktop/AI-writer/docs/execution/bootstrap/backend-health-proof.md)
4. [infra-proof.md](/Users/ze/Desktop/AI-writer/docs/execution/bootstrap/infra-proof.md)
5. [bootstrap-delivery-log.md](/Users/ze/Desktop/AI-writer/docs/execution/bootstrap/bootstrap-delivery-log.md)

## 最小完成标准

- 根目录统一脚本存在
- 前端可在 `localhost:3000` 打开
- 后端 `health` 接口可访问
- PostgreSQL 与 Redis 可运行
- `test` 环境文件存在且能被统一脚本加载
