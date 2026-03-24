# Quest 1.4 基础设施验收模板

## 目标

证明数据库和缓存服务已经真实跑起来，而不是只写了配置文件。

## 学生需要提交的证据

### Docker 证据

- `docker compose -f infra/docker-compose.yml ps` 截图

### 服务证据

- PostgreSQL 运行状态截图
- Redis 运行状态截图

## PM 黑盒验收动作

- [ ] 执行 `docker compose -f infra/docker-compose.yml up -d`
- [ ] 执行 `docker compose -f infra/docker-compose.yml ps`
- [ ] 确认 `postgres` 和 `redis` 都是运行状态

## 常见错误

- 只提交 compose 文件，没有真实运行证据
- 只起了数据库，没起 Redis
- 服务起了但端口不可用
