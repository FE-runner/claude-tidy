## ADDED Requirements

### Requirement: 删除 rule
系统 SHALL 支持直接删除指定标识符的 rule 文件，无需确认。

#### Scenario: 删除全局 rule
- **WHEN** 用户执行 `claude-tidy remove react/core.md --scope global`
- **THEN** 系统直接删除 `~/.claude/rules/react/core.md`

#### Scenario: 删除项目 rule
- **WHEN** 用户执行 `claude-tidy remove react/core.md --scope project`
- **THEN** 系统直接删除 `.claude/rules/react/core.md`

#### Scenario: 同名 rule 存在于两侧时需指定 scope
- **WHEN** 用户执行 `claude-tidy remove react/core.md`，且全局和项目都存在该 rule
- **THEN** 系统提示用户选择删除全局还是项目版本

#### Scenario: 仅一侧存在时自动定位
- **WHEN** 用户执行 `claude-tidy remove react/core.md`，且仅全局存在
- **THEN** 系统直接删除全局版本，无需指定 scope

#### Scenario: rule 不存在
- **WHEN** 用户执行 `claude-tidy remove react/core.md`，但该 rule 不存在
- **THEN** 系统提示"未找到该 rule"，正常退出

### Requirement: 删除 skill（需确认）
系统 SHALL 支持删除 skill 整个目录，但 MUST 在删除前要求用户确认。

#### Scenario: 删除 skill 并确认
- **WHEN** 用户执行 `claude-tidy remove prisma-database-setup`，系统识别为 skill
- **THEN** 系统显示 skill 路径和文件数量，提示"确认删除？(y/N)"，用户输入 y 后删除整个目录

#### Scenario: 删除 skill 但取消
- **WHEN** 用户执行 `claude-tidy remove prisma-database-setup`，确认提示时输入 N
- **THEN** 系统不执行删除，正常退出

### Requirement: 区分 rule 和 skill
系统 SHALL 根据名称自动判断目标是 rule 还是 skill。

#### Scenario: 标识符包含路径分隔符
- **WHEN** 用户执行 `claude-tidy remove react/core.md`（含 `/` 和 `.md`）
- **THEN** 系统将其识别为 rule

#### Scenario: 标识符是简单名称
- **WHEN** 用户执行 `claude-tidy remove prisma-database-setup`（无 `/` 和 `.md`）
- **THEN** 系统先在 skills 中查找，若找到则视为 skill；否则提示未找到
