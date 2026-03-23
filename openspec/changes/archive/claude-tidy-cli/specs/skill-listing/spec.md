## ADDED Requirements

### Requirement: list skills
系统 SHALL 列出 skills，支持选择作用域，全部时分开展示。

#### Scenario: 选择作用域
- **WHEN** 用户选择 skills → list
- **THEN** 系统提示选择：全部 / 全局 / 项目

#### Scenario: 全部 — 分开展示
- **WHEN** 选择「全部」
- **THEN** 系统分别显示「全局 skills」和「项目 skills」两个列表

#### Scenario: symlink 标注
- **WHEN** 某个 skill 是 symlink
- **THEN** 系统在名称后标注 `[链接]`

### Requirement: symlink 兼容扫描
系统 SHALL 用 `fs.statSync` 跟踪 symlink 目标判断是否是目录，正确识别 symlink skills。
