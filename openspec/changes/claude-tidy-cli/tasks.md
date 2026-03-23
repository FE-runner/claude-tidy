## 1. 项目初始化

- [x] 1.1 修改 git remote origin 为 `https://github.com/FE-runner/claude-tidy.git`
- [x] 1.2 创建 `package.json`（name: claude-tidy, type: module, bin 字段）
- [x] 1.3 创建 `tsconfig.json`（ESM, strict, outDir: dist）
- [x] 1.4 安装依赖：`diff`、`chalk`、`gray-matter`、`@inquirer/prompts`（精确版本）
- [x] 1.5 更新 CLAUDE.md（项目名改为 claude-tidy，去掉 toggle，更新命令设计和目录结构）
- [x] 1.6 更新 README.md（项目描述、命令用法、安装方式）

## 2. 类型定义和工具函数

- [x] 2.1 创建 `src/types.ts`：定义 Rule、Skill、RuleScope、DiffResult 等类型
- [x] 2.2 创建 `src/utils/paths.ts`：全局/项目 rules 和 skills 目录路径解析
- [x] 2.3 创建 `src/utils/parser.ts`：使用 gray-matter 解析 rule frontmatter（处理有/无 frontmatter）
- [x] 2.4 创建 `src/utils/scanner.ts`：递归扫描 rules 文件和 skills 目录（以 SKILL.md 为标志）
- [x] 2.5 创建 `src/utils/display.ts`：终端表格格式化、颜色输出（chalk）

## 3. CLI 入口

- [x] 3.1 创建 `src/cli.ts`：命令路由（list/diff/move/remove）、--help、--version、未知命令处理
- [x] 3.2 添加 shebang（`#!/usr/bin/env node`）和 package.json bin 配置

## 4. list 命令

- [x] 4.1 创建 `src/commands/list.ts`：实现 list rules（全局/项目/全部）
- [x] 4.2 实现 list skills（扫描、展示名称/路径/文件数）
- [x] 4.3 实现无参数交互选择（readline 提示选择 rules 或 skills）

## 5. diff 命令

- [x] 5.1 创建 `src/commands/diff.ts`：实现无参数总览表（相对路径匹配 + 修改时间对比）
- [x] 5.2 实现带标识符的详细对比（修改时间 + 使用 diff 包输出 unified diff）
- [x] 5.3 处理边界情况：仅一侧存在、内容相同、无同名 rules

## 6. move 命令

- [x] 6.1 创建 `src/commands/move.ts`：实现 move 核心逻辑（复制/剪切选择）
- [x] 6.2 实现冲突检测和提示（覆盖/取消）
- [x] 6.3 实现目标目录自动创建

## 7. remove 命令

- [x] 7.1 创建 `src/commands/remove.ts`：实现 rule 删除（直接删除，自动定位或提示选择 scope）
- [x] 7.2 实现 skill 删除（显示信息 + 确认提示 + 整目录删除）
- [x] 7.3 实现 rule/skill 自动区分（路径分隔符和 .md 后缀判断）

## 8. 构建验证

- [x] 8.1 配置 tsc 构建，验证 `npx claude-tidy --help` 正常输出
- [x] 8.2 在实际的 `~/.claude/` 目录上手动测试各命令
