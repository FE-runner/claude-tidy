# claude-tidy

Claude Code 的 skills 和 rules 管理工具。查看、比对、移动、删除，一个命令搞定。

## 项目概述

claude-tidy 是一个纯交互式 CLI 工具，用于管理 Claude Code 的 skills（`~/.claude/skills/` + `.claude/skills/`）和 rules（`~/.claude/rules/` + `.claude/rules/`）。解决 rules/skills 散落在全局和项目级目录中难以管理的问题。

## 核心功能

| 操作 | 说明 |
|------|------|
| list | 列出 rules 或 skills，区分全局/项目级，显示触发方式和修改时间，symlink 标注 `[链接]` |
| diff | 对比全局 vs 项目的同名 rules/skills，标注最新版本（取 birthtime 和 mtime 较晚者），多选后逐个选保留哪个 |
| move | 在全局和项目之间移动 rules/skills（多选，a 键全选），symlink 源创建 symlink 目标，完成后可选删除源文件 |
| delete | 删除 rules（多选直接删除）或 skills（多选后二次确认，整目录删除） |

## 交互流程

```
claude-tidy
  → 欢迎语（名称 + 版本 + 描述）
  → 选择: skills / rules
    → 选择: list / diff / move / delete
      → 各操作的交互子流程（多选支持 a 键全选）
```

无子命令，仅支持 `--help` 和 `--version` 参数。

## 管理对象

### Rules

- 全局 rules：`~/.claude/rules/**/*.md`
- 项目 rules：`.claude/rules/**/*.md`
- 每个 rule 是一个 markdown 文件，带 frontmatter（`description`、`alwaysApply`、`globs`）
- Rule 标识符：以 rules 根目录为基准的相对路径（如 `react/core.md`）

### Skills

- 全局 skills：`~/.claude/skills/*/`
- 项目 skills：`.claude/skills/*/`
- 每个 skill 是一个目录，包含 `SKILL.md` 和可选的附属文件
- 以 `SKILL.md` 存在作为 skill 根目录的标志
- 支持 symlink（软链接）skills，scanner 用 `statSync` 跟踪

## 目录结构

```
claude-tidy/
├── src/
│   ├── cli.ts            # 入口：欢迎语 + --help/--version + 交互流程
│   ├── flows/
│   │   ├── list.ts       # list 交互流程
│   │   ├── diff.ts       # diff 交互流程
│   │   ├── move.ts       # move 交互流程
│   │   └── delete.ts     # delete 交互流程
│   ├── utils/
│   │   ├── paths.ts      # 路径解析（全局/项目 rules/skills 目录）
│   │   ├── parser.ts     # rule 文件解析（frontmatter + 内容）
│   │   ├── scanner.ts    # 文件系统扫描（rules/skills 发现，symlink 兼容）
│   │   └── display.ts    # 终端输出格式化（表格、颜色、日期精确到秒）
│   └── types.ts          # 类型定义（Rule、Skill 含 isSymlink/symlinkTarget）
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## 技术栈

- TypeScript（ESM）
- Node.js CLI（>=18）
- 轻量工具库：@inquirer/prompts（交互，支持 a 键全选）、chalk
- 不使用 CLI 框架（commander、yargs 等）

## 语言

始终用中文回复。代码注释使用中文。技术术语保持原文。
