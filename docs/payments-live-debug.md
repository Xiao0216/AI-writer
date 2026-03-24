# 微信支付真实联调手册

这份手册用于把文枢AI当前已经接好的 `微信 Native 扫码支付` 代码真正跑起来。

## 现状

代码侧已经完成：

- Native 下单：`POST /payments/orders/membership`
- 订单查询：`GET /payments/orders/:orderId`
- 支付回调：`POST /payments/wechat/notify`
- 支付成功后自动开通会员

当前机器还缺三样东西，所以还不能直接发起真实商户实单：

- PostgreSQL 运行环境
- 面向微信支付平台的公网回调地址
- 商户参数与证书

## 一次性准备

### 1. 准备数据库

任选一种：

- 安装 Docker Desktop，然后执行 `docker compose -f infra/docker-compose.yml up -d`
- 或者直接准备一套外部 PostgreSQL，并把 `DATABASE_URL` 指过去

确认数据库准备好后，在 [apps/api/.env](/Users/ze/Desktop/AI-writer/apps/api/.env) 填好：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wenshu_ai?schema=public"
```

然后执行：

```bash
npm --prefix apps/api run prisma:generate
npm --prefix apps/api run prisma:migrate
```

### 2. 准备支付参数

在 [apps/api/.env](/Users/ze/Desktop/AI-writer/apps/api/.env) 填入：

```env
WECHAT_PAY_APP_ID=""
WECHAT_PAY_MCH_ID=""
WECHAT_PAY_SERIAL_NO=""
WECHAT_PAY_PRIVATE_KEY=""
WECHAT_PAY_PLATFORM_PUBLIC_KEY=""
WECHAT_PAY_API_V3_KEY=""
WECHAT_PAY_NOTIFY_URL=""
```

说明：

- `WECHAT_PAY_PRIVATE_KEY` 可以直接填 PEM 文本，支持 `\n`
- `WECHAT_PAY_PLATFORM_PUBLIC_KEY` 同样支持直接填 PEM 文本
- 如果你更想走文件路径，也可以改用 `WECHAT_PAY_PRIVATE_KEY_PATH` 和 `WECHAT_PAY_PLATFORM_PUBLIC_KEY_PATH`

### 3. 准备公网回调

微信支付通知地址必须是微信服务器能访问到的公网 HTTPS 地址。

可选方案：

- `ngrok http 3001`
- `cloudflared tunnel --url http://localhost:3001`

拿到 HTTPS 地址后，把：

```env
WECHAT_PAY_NOTIFY_URL="https://你的公网域名/payments/wechat/notify"
FRONTEND_URL="http://localhost:3000"
```

填回 [apps/api/.env](/Users/ze/Desktop/AI-writer/apps/api/.env)。

## 启动联调

### 1. 启动服务

```bash
npm run dev
```

### 2. 访问会员页

打开：

- `http://localhost:3000/login`
- 登录后进入 `http://localhost:3000/membership`

### 3. 创建真实订单

点击“立即开通月卡”后，预期行为：

- 后端创建 `PaymentOrder`
- 调用微信支付 Native 下单
- 页面展示二维码

### 4. 完成扫码支付

支付成功后，预期行为：

- 微信服务器调用 `/payments/wechat/notify`
- `PaymentOrder.status` 更新为 `PAID`
- 用户 `membershipType` 升级为 `MEMBER`
- 前端轮询订单状态后展示“支付成功，会员权益已到账”

## 排障顺序

### A. 点击开通时报“微信支付未配置完成”

检查：

- 商户号
- 证书序列号
- 私钥
- 平台公钥
- API v3 Key
- Notify URL

### B. 能下单但没有回调

先看：

- `WECHAT_PAY_NOTIFY_URL` 是否公网 HTTPS
- 隧道是否仍在线
- 微信支付后台是否允许该回调地址

### C. 有回调但订单没有变成已支付

优先检查：

- 平台公钥是否正确
- API v3 Key 是否与商户平台一致
- 回调体是否解密成功

### D. 支付成功但前端没升级会员

检查：

- `/payments/orders/:orderId` 返回状态是否已经变为 `PAID`
- 数据库里用户的 `membershipType` / `membershipExpireAt` 是否已更新

## 当前建议

最快的真实联调路径是：

1. 安装 Docker Desktop
2. 安装 `ngrok` 或 `cloudflared`
3. 填好 [apps/api/.env](/Users/ze/Desktop/AI-writer/apps/api/.env)
4. 执行 Prisma migration
5. 直接从会员页发起实单
