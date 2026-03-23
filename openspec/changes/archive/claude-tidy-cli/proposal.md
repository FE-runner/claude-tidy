## Why

Claude Code 的 rules（`~/.claude/rules/`、`.claude/rules/`）和 skills（`~/.claude/skills/`、`.claude/skills/`）散落在全局和项目级目录中，缺乏统一管理工具。用户无法快速查看全部配置、对比全局与项目版本差异、在两者之间移动，或安全地删除不需要的配置。部分 skills 通过 symlink 安装，增加了管理复杂度。

## What Changes

- 新建 `claude-tidy` CLI 工具（npm 包），提供纯交互式单命令体验：
  - 运行 `claude-tidy` 显示欢迎语，进入交互流程：先选 skills/rules，再选操作（list/diff/move/delete）
  - 多选列表支持 `a` 键全选
  - 仅保留 `--help` 和 `--version` 两个 CLI 参数
- 使用 `@inquirer/prompts` 作为交互提示库（checkbox 原生支持全选）
- Skills 和 rules 均支持全局和项目双作用域
- 全面兼容 symlink skills（扫描、标注、移动保持链接）
- 时间比较取 birthtime 和 mtime 中较晚的
- Rule 标识符采用相对路径匹配（如 `react/core.md`）

## Capabilities

### New Capabilities

- `interactive-flow`: 纯交互式单命令入口，欢迎语 + 选择管理对象和操作
- `rule-listing`: 扫描和列出全局/项目 rules，解析 frontmatter，展示修改时间，全部时分开展示
- `skill-listing`: 扫描和列出全局/项目 skills，展示文件数量，symlink 标注 `[链接]`
- `rule-diffing`: 对比全局和项目同名 rules，多选后逐个选保留哪个
- `skill-diffing`: 对比全局和项目同名 skills，多选后逐个选保留哪个
- `rule-moving`: 在全局和项目之间多选移动 rules，冲突提示覆盖/跳过，可选删除源文件
- `skill-moving`: 在全局和项目之间多选移动 skills，symlink 保持链接方式
- `config-removing`: 多选删除 rules（直接删除）或 skills（二次确认后整目录删除）

### Modified Capabilities

（无现有 spec 需要修改）

## Impact

- **新文件**: `src/` 目录下全部源码、`package.json`、`tsconfig.json`
- **修改文件**: `CLAUDE.md`、`README.md`
- **依赖**: `@inquirer/prompts`、`chalk`（精确版本）
- **git**: remote origin 变更为 `https://github.com/FE-runner/claude-tidy.git`
- **文件系统**: 运行时读写 `~/.claude/` 和 `.claude/` 目录
