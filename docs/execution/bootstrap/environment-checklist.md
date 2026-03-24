# Quest 1 环境检查表

## 必须存在的文件

- `package.json`
- `apps/api/.env.test`
- `apps/web/.env.test`
- `infra/docker-compose.yml`

## 必须存在的根脚本

- `dev`
- `build`
- `lint`
- `test`

## PM 黑盒验收动作

- [ ] 打开根目录 `package.json`
- [ ] 肉眼确认根脚本存在
- [ ] 打开前后端 `.env.test` 文件
- [ ] 肉眼确认测试环境配置存在

## 打回标准

- 根目录没有统一脚本
- 测试环境文件缺失
- 只有本地临时命令，没有固定入口
