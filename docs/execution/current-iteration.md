# 当前迭代任务板

## 本轮目标

把项目从“已有代码和课程文档”切换到“按 Quest 真正执行”。

## 当前执行范围

### Epic A：设计先行

- [ ] Quest 0.1 建立 Figma 项目文件与页面结构
- [ ] Quest 0.2 完成低保真信息架构草图
- [ ] Quest 0.3 定义设计系统基础 Token
- [ ] Quest 0.4 产出高保真关键页面设计稿
- [ ] Quest 0.5 定义交互规格与状态清单

### Epic B：工程底座

- [ ] Quest 1.1 创建 Monorepo 根工作区
- [ ] Quest 1.2 跑通前端空白站点
- [ ] Quest 1.3 跑通后端健康检查服务
- [ ] Quest 1.4 启动本地 PostgreSQL 与 Redis
- [ ] Quest 1.5 建立统一测试环境入口

### Epic C：静态产品骨架

- [ ] Quest 2.1 搭出全站 App Shell
- [ ] Quest 2.2 渲染登录页和设置页静态骨架
- [ ] Quest 2.3 渲染项目控制台首页静态版
- [ ] Quest 2.4 渲染项目真相区静态版
- [ ] Quest 2.5 渲染章节控制页静态版

## 当前使用工具包

- 设计执行区：`docs/execution/design/`
- 工程底座执行区：`docs/execution/bootstrap/`
- 静态产品骨架执行区：`docs/execution/static-ui/`

## 迭代完成定义

满足以下条件，视为第一轮执行完成：

1. 有一套可检查的 Figma 设计资产
2. 前后端和测试环境都能启动
3. 浏览器里可看到与新产品定位一致的静态骨架页面

## PM 黑盒检查入口

- 设计稿：Figma 文件链接
- 前端：`http://localhost:3000`
- 后端：`http://localhost:3001/health`
- 数据库：Prisma Studio 或 PostgreSQL 面板
