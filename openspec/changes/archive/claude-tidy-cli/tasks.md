## 1. 依赖和配置更新

- [x] 1.1 替换 `@inquirer/prompts` 为 `@clack/prompts`（卸载旧包，安装新包，精确版本）
- [x] 1.2 更新 CLAUDE.md（交互模型改为纯交互式，去掉子命令描述，目录结构 commands/ → flows/）
- [x] 1.3 更新 README.md（用法改为纯交互式说明）

## 2. 重构 CLI 入口

- [x] 2.1 重写 `src/cli.ts`：去掉子命令路由，无参数进入交互流程，保留 --help/--version
- [x] 2.2 交互流程：使用 @clack/prompts 的 intro → select 管理对象 → select 操作 → 调用对应 flow → outro

## 3. 重构为交互流程（commands/ → flows/）

- [x] 3.1 重命名 `src/commands/` 为 `src/flows/`
- [x] 3.2 重写 `src/flows/list.ts`：交互选择作用域（全局/项目/全部），显示列表
- [x] 3.3 重写 `src/flows/diff.ts`（rules）：显示对比，标注最新，引导保留并删除另一个
- [x] 3.4 新建 `src/flows/diff.ts` 中的 skills diff：检测重复，标注最新，引导保留并删除
- [x] 3.5 重写 `src/flows/move.ts`：交互选方向 → 显示列表选条目 → 移动 → 问是否删除源文件
- [x] 3.6 重写 `src/flows/delete.ts`（原 remove.ts）：交互选作用域 → 显示列表 → 选择删除

## 4. 适配 @clack/prompts

- [x] 4.1 将所有 `@inquirer/prompts` 的 select/confirm 调用替换为 @clack/prompts 的 select/confirm
- [x] 4.2 添加 intro/outro 包裹整个流程
- [x] 4.3 使用 spinner 包裹耗时操作（扫描文件系统）

## 5. 构建验证

- [x] 5.1 编译并验证 `npx claude-tidy` 进入交互流程
- [x] 5.2 验证 `npx claude-tidy --help` 和 `--version`
- [ ] 5.3 在实际 `~/.claude/` 目录上测试各交互流程
