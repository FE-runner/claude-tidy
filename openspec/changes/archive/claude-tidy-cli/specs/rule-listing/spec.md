## ADDED Requirements

### Requirement: list rules
系统 SHALL 列出 rules，支持选择作用域，全部时分开展示。

#### Scenario: 选择作用域
- **WHEN** 用户选择 rules → list
- **THEN** 系统提示选择：全部 / 全局 / 项目

#### Scenario: 全部 — 分开展示
- **WHEN** 选择「全部」
- **THEN** 系统分别显示「全局 rules」和「项目 rules」两个列表

#### Scenario: 单作用域
- **WHEN** 选择「全局」或「项目」
- **THEN** 系统只显示该作用域的 rules 列表

### Requirement: 解析 rule frontmatter
系统 SHALL 解析每个 rule 文件的 YAML frontmatter，提取 `description`、`alwaysApply`、`globs` 字段。无 frontmatter 时触发方式标记为「无」。
