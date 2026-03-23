## Why

Claude Code 的 rules（`~/.claude/rules/`、`.claude/rules/`）和 skills（`~/.claude/skills/`）散落在全局和项目级目录中，缺乏统一管理工具。用户无法快速查看全部配置、对比全局与项目版本差异、在两者之间移动规则，或安全地删除不需要的配置。需要一个 CLI 工具来解决这些痛点。

## What Changes

- 新建 `claude-tidy` CLI 工具（npm 包），提供四个核心命令：
  - `list` — 列出所有 rules 或 skills，区分全局/项目级，显示触发方式和修改时间
  - `diff` — 对比全局和项目 rules 的修改时间和内容差异
  - `move` — 在全局和项目之间移动/复制 rules，支持冲突提示和覆盖
  - `remove` — 删除 rule（直接删除）或 skill（二次确认后整目录删除）
- 更新项目元数据：CLAUDE.md、README.md、git remote origin
- Rule 标识符采用相对路径匹配（如 `react/core.md`）
- 不包含 `toggle`（启用/禁用）命令

## Capabilities

### New Capabilities

- `rule-listing`: 扫描和列出全局/项目 rules，解析 frontmatter（description、alwaysApply、globs），展示修改时间
- `skill-listing`: 扫描和列出全局 skills，展示目录结构和文件数量
- `rule-diffing`: 基于相对路径匹配全局和项目同名 rules，对比修改时间，输出 unified diff
- `rule-moving`: 在全局和项目之间移动/复制 rule 文件，处理冲突（提示后覆盖）
- `config-removing`: 删除 rule 文件或 skill 目录，skill 删除需二次确认
- `cli-entry`: 命令路由入口，参数解析，帮助信息输出

### Modified Capabilities

（无现有 spec 需要修改）

## Impact

- **新文件**: `src/` 目录下全部源码、`package.json`、`tsconfig.json`
- **修改文件**: `CLAUDE.md`（项目名和命令设计更新）、`README.md`（项目描述更新）
- **依赖**: 少量 npm 工具库（diff、chalk 等），不使用 CLI 框架
- **git**: remote origin 变更为 `https://github.com/FE-runner/claude-tidy.git`
- **文件系统**: 运行时读写 `~/.claude/` 和 `.claude/` 目录
