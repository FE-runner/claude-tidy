## ADDED Requirements

### Requirement: 总览对比
系统 SHALL 基于相对路径标识符匹配全局和项目中同名的 rules，展示修改时间对比表。

#### Scenario: 无参数执行 diff
- **WHEN** 用户执行 `claude-tidy diff`
- **THEN** 系统列出所有同标识符 rules 的对比表，每行包含：标识符、全局修改时间、项目修改时间、状态（全局更新/项目更新/仅全局/仅项目）

#### Scenario: 无同名 rules
- **WHEN** 全局和项目之间没有同标识符的 rules
- **THEN** 系统显示"全局和项目之间没有同名 rules"提示

### Requirement: 单条 rule 内容差异
系统 SHALL 对指定标识符的 rule，展示修改时间对比和 unified diff 内容差异。

#### Scenario: 对比有差异的同名 rule
- **WHEN** 用户执行 `claude-tidy diff react/core.md`，且全局和项目都存在该 rule
- **THEN** 系统先显示两边的路径和修改时间，再输出 unified diff 格式的内容差异

#### Scenario: 对比内容相同的同名 rule
- **WHEN** 用户执行 `claude-tidy diff react/core.md`，且两边内容完全一致
- **THEN** 系统显示修改时间，并提示"内容相同"

#### Scenario: 指定的标识符仅存在于一侧
- **WHEN** 用户执行 `claude-tidy diff react/core.md`，但该标识符仅存在于全局或项目
- **THEN** 系统提示该 rule 仅存在于某一侧，无法对比

### Requirement: 相对路径匹配
系统 SHALL 以 rules 根目录（`~/.claude/rules/` 或 `.claude/rules/`）为基准，取文件的相对路径作为标识符进行匹配。

#### Scenario: 相对路径匹配
- **WHEN** 全局存在 `~/.claude/rules/react/core.md`，项目存在 `.claude/rules/react/core.md`
- **THEN** 两者的标识符均为 `react/core.md`，被识别为同一条 rule
