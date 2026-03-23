# claude-tidy

Claude Code 的 skills 和 rules 管理工具。查看、比对、移动、删除，一个命令搞定。

## 项目概述

claude-tidy 是一个 CLI 工具，用于管理 Claude Code 的 skills（`~/.claude/skills/`）和 rules（`~/.claude/rules/` + `.claude/rules/`）。解决 rules/skills 散落在全局和项目级目录中难以管理的问题。

## 核心功能

| 功能 | 说明 |
|------|------|
| list | 列出所有 skills 和 rules，区分全局/项目级，显示触发方式和修改时间 |
| diff | 对比全局和项目 rules 的修改时间和内容差异 |
| move | 在全局和项目之间移动/复制 rules |
| remove | 删除指定的 rule（直接删除）或 skill（确认后整目录删除） |

## 管理对象

### Rules

- 全局 rules：`~/.claude/rules/**/*.md`
- 项目 rules：`.claude/rules/**/*.md`
- 每个 rule 是一个 markdown 文件，带 frontmatter（`description`、`alwaysApply`、`globs`）
- Rule 标识符：以 rules 根目录为基准的相对路径（如 `react/core.md`）

### Skills

- 全局 skills：`~/.claude/skills/*/`
- 每个 skill 是一个目录，包含 `SKILL.md` 和可选的附属文件
- 以 `SKILL.md` 存在作为 skill 根目录的标志

## 目录结构

```
claude-tidy/
├── src/
│   ├── cli.ts            # 命令路由入口，参数解析
│   ├── commands/
│   │   ├── list.ts       # 查看 rules/skills
│   │   ├── diff.ts       # 比对全局 vs 项目
│   │   ├── move.ts       # 移动 rule（全局↔项目）
│   │   └── remove.ts     # 删除 rule/skill
│   ├── utils/
│   │   ├── paths.ts      # 路径解析（全局/项目 rules/skills 目录）
│   │   ├── parser.ts     # rule 文件解析（frontmatter + 内容）
│   │   ├── scanner.ts    # 文件系统扫描（rules/skills 发现）
│   │   └── display.ts    # 终端输出格式化（表格、颜色）
│   └── types.ts          # 类型定义
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## 命令设计

```bash
claude-tidy list [rules|skills]           # 列出 rules 或 skills（无参数时交互选择）
claude-tidy list rules --scope global     # 只看全局 rules
claude-tidy list rules --scope project    # 只看项目 rules

claude-tidy diff                          # 比对全局和项目 rules 差异（时间总览表）
claude-tidy diff <rule-id>                # 比对某条 rule（时间 + unified diff）

claude-tidy move <rule-id> --to global    # 项目 rule 移动/复制到全局
claude-tidy move <rule-id> --to project   # 全局 rule 移动/复制到项目

claude-tidy remove <rule-id|skill-name>   # 删除 rule 或 skill
claude-tidy remove <rule-id> --scope global  # 指定删除全局版本
```

## 技术栈

- TypeScript（ESM）
- Node.js CLI（>=18）
- 轻量工具库：diff、chalk、gray-matter、@inquirer/prompts
- 不使用 CLI 框架（commander、yargs 等）

## 语言

始终用中文回复。代码注释使用中文。技术术语保持原文。
