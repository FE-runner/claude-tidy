## ADDED Requirements

### Requirement: 列出全局 rules
系统 SHALL 扫描 `~/.claude/rules/` 目录下所有 `.md` 文件（递归），并展示每条 rule 的相对路径标识符、触发方式和修改时间。

#### Scenario: 列出全局 rules
- **WHEN** 用户执行 `claude-tidy list rules --scope global`
- **THEN** 系统列出所有全局 rules，每行包含：相对路径标识符、触发方式（alwaysApply / globs 值）、修改时间

#### Scenario: 全局 rules 目录不存在
- **WHEN** `~/.claude/rules/` 目录不存在
- **THEN** 系统显示"未找到全局 rules"提示，正常退出

### Requirement: 列出项目 rules
系统 SHALL 扫描当前项目 `.claude/rules/` 目录下所有 `.md` 文件（递归），并展示每条 rule 的信息。

#### Scenario: 列出项目 rules
- **WHEN** 用户执行 `claude-tidy list rules --scope project`
- **THEN** 系统列出所有项目 rules，格式同全局 rules

#### Scenario: 项目 rules 目录不存在
- **WHEN** `.claude/rules/` 目录不存在
- **THEN** 系统显示"未找到项目 rules"提示，正常退出

### Requirement: 列出所有 rules（默认）
系统 SHALL 同时展示全局和项目 rules，并标注来源。

#### Scenario: 不指定 scope 列出 rules
- **WHEN** 用户执行 `claude-tidy list rules`（不带 --scope）
- **THEN** 系统列出全局和项目所有 rules，每行额外显示来源（全局/项目）

### Requirement: 解析 rule frontmatter
系统 SHALL 解析每个 rule 文件的 YAML frontmatter，提取 `description`、`alwaysApply`、`globs` 字段。

#### Scenario: 有完整 frontmatter 的 rule
- **WHEN** rule 文件包含 `---` 分隔的 YAML frontmatter
- **THEN** 系统正确解析 description、alwaysApply、globs 字段

#### Scenario: 无 frontmatter 的 rule
- **WHEN** rule 文件没有 frontmatter
- **THEN** 系统将触发方式标记为"无"，正常展示

### Requirement: 交互式选择类型
当用户执行 `claude-tidy list` 不带子参数时，系统 SHALL 提示选择 rules 或 skills。

#### Scenario: 不带参数执行 list
- **WHEN** 用户执行 `claude-tidy list`
- **THEN** 系统提示"查看什么？"并列出 rules / skills 选项
