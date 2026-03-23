## Context

这是一个全新的 CLI 项目，目前仓库中只有 CLAUDE.md 和 OpenSpec 骨架，没有任何源码。目标是构建 `claude-tidy` — 一个管理 Claude Code rules 和 skills 的命令行工具。

当前 Claude Code 配置文件的实际状况：
- 全局 rules 38 个文件，分布在 `~/.claude/rules/` 下，部分有双层嵌套（如 `conventions/conventions/`）
- 全局 skills 16+ 个目录，结构不统一（简单/带 references/复杂含脚本），存在 `skills/skills/` 嵌套
- 项目 rules 在 `.claude/rules/` 下，当前项目暂无
- 每条 rule 是 markdown 文件，带 YAML frontmatter（`description`、`alwaysApply`、`globs`）
- 每个 skill 是一个目录，包含 `SKILL.md` 和可选附属文件

## Goals / Non-Goals

**Goals:**
- 提供 `list`、`diff`、`move`、`remove` 四个核心命令
- 正确处理不规则的目录嵌套（双层、`skills/skills/` 等）
- 解析 rule frontmatter 并在列表中展示触发方式
- 支持全局和项目级 rules 的修改时间对比和内容 diff
- 发布为 npm 包 `claude-tidy`，通过 `npx claude-tidy` 使用

**Non-Goals:**
- 不实现 toggle（启用/禁用）命令
- 不实现 rule/skill 的创建或编辑功能
- 不实现自动修复目录嵌套问题
- 不使用 CLI 框架（commander、yargs、oclif）
- 不实现 skill 的项目级管理（skills 仅存在于全局）

## Decisions

### 1. 命令参数解析：手写 vs CLI 框架

**决策**: 手写参数解析，使用 `process.argv` 切片。

**理由**: 只有 4 个命令，参数模式简单（`list [rules|skills]`、`diff [id]`、`move <id> --to <scope>`、`remove <id>`）。引入 commander/yargs 增加依赖但几乎无收益。

### 2. Rule 标识符：相对路径

**决策**: 以 rules 根目录为基准的相对路径作为标识符（如 `react/core.md`）。

**理由**: 文件名匹配可能误匹配同名文件，完整路径太长。相对路径精确且可读。双层嵌套（如 `conventions/conventions/core.md`）原样暴露，帮助用户发现问题。

### 3. diff 策略：修改时间 + 内容差异

**决策**:
- `claude-tidy diff`（无参数）：列出所有同标识符 rules 的修改时间对比表
- `claude-tidy diff <id>`：显示时间对比 + unified diff 内容差异

**理由**: 修改时间快速判断谁更新，内容 diff 看具体改了什么。两级设计满足不同需求。

### 4. diff 实现：npm `diff` 包

**决策**: 使用 `diff` npm 包生成 unified diff。

**理由**: diff 算法手写工作量大且容易出错。`diff` 包轻量（无依赖）、稳定、广泛使用。

### 5. 终端输出：`chalk` 包

**决策**: 使用 `chalk` 进行终端颜色输出。

**理由**: 纯 ANSI 转义码可读性差、跨平台兼容性问题。chalk 是事实标准，零额外依赖。

### 6. list 交互：先选择类型

**决策**: `claude-tidy list` 不带参数时提示用户选择 rules 或 skills；带参数（`claude-tidy list rules`）直接展示。

**理由**: 减少用户记忆负担，同时保留快捷用法。交互提示使用 `@inquirer/prompts` 包。

### 7. move 行为：支持剪切和复制

**决策**: `move` 命令默认提示用户选择剪切或复制。目标已存在时提示后直接覆盖。

**理由**: 用户可能想保留全局原件（复制到项目做定制），也可能想彻底迁移（剪切）。冲突处理简洁 — 提示选择后立即执行。

### 8. remove 行为：rule 直删 / skill 确认

**决策**: 删除 rule 直接执行；删除 skill 显示路径和文件数后需要用户确认。

**理由**: rule 是单文件，误删可通过 git 恢复。skill 是整个目录（可能包含多个文件），不可逆风险更高。

### 9. 项目结构

```
claude-tidy/
├── src/
│   ├── cli.ts            # 命令路由入口，参数解析
│   ├── commands/
│   │   ├── list.ts       # list 命令
│   │   ├── diff.ts       # diff 命令
│   │   ├── move.ts       # move 命令
│   │   └── remove.ts     # remove 命令
│   ├── utils/
│   │   ├── paths.ts      # 路径解析（全局/项目 rules/skills 目录）
│   │   ├── parser.ts     # rule frontmatter 解析
│   │   ├── scanner.ts    # 文件系统扫描（rules/skills 发现）
│   │   └── display.ts    # 终端输出格式化（表格、颜色）
│   └── types.ts          # 类型定义
├── package.json
├── tsconfig.json
├── CLAUDE.md
└── README.md
```

### 10. 构建和发布

**决策**: TypeScript ESM，使用 `tsc` 编译，`bin` 字段指向编译后的入口。

**理由**: 项目简单，不需要 bundler。tsc 直出即可。

## Risks / Trade-offs

- **[Windows 路径兼容]** → 已确认：全部使用 `path.join`/`path.resolve`，不硬编码分隔符。
- **[frontmatter 解析]** → 已确认：使用 `gray-matter` npm 包。手写解析容易遗漏边界情况（多行值、引号转义等），gray-matter 是成熟方案。
- **[终端交互]** → 已确认：使用 `@inquirer/prompts` 包（inquirer v5 的轻量拆分版），避免 Node.js 内置 readline 在 Git Bash on Windows 上的兼容性问题。
- **[skill 识别]** → 已确认：递归扫描，以 `SKILL.md` 存在作为 skill 根目录的标志。
