# 执行证据归档区

这个目录用于归档每个 Quest 的黑盒验收证据。

## 证据类型

- 浏览器截图
- 终端截图
- 数据库面板截图
- 测试通过截图
- Figma 链接与导出图

## 归档规则

按 Quest 编号建立子目录，例如：

- `q0.1-figma-file-setup/`
- `q0.2-wireframes/`
- `q1.2-frontend-boot/`
- `q2.3-dashboard-static/`

## 文件命名建议

- `browser-home.png`
- `terminal-health-check.png`
- `db-new-project.png`
- `figma-dashboard-link.md`

## PM 检查规则

- 没有证据，不算完成
- 证据必须能对应到具体 Quest
- 证据文件名必须可读，不允许 `截图1.png`
