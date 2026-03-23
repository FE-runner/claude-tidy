## ADDED Requirements

### Requirement: 删除 rule
系统 SHALL 通过交互流程引导用户删除 rule。

#### Scenario: 选择作用域并列出 rules
- **WHEN** 用户在交互流程中选择 rules → delete
- **THEN** 系统提示选择作用域（全局/项目），然后显示该作用域下的 rules 列表

#### Scenario: 确认后删除
- **WHEN** 用户从列表中选择了要删除的 rules
- **THEN** 系统列出将删除的 rules，提示确认，确认后删除文件

#### Scenario: 取消删除 rule
- **WHEN** 用户在确认提示时选择取消
- **THEN** 系统不执行删除，返回流程

### Requirement: 删除 skill（需确认）
系统 SHALL 通过交互流程引导用户删除 skill，但 MUST 在删除前要求确认。

#### Scenario: 列出 skills 并选择
- **WHEN** 用户在交互流程中选择 skills → delete
- **THEN** 系统显示所有 skills 列表（名称、路径、文件数）

#### Scenario: 确认后删除
- **WHEN** 用户选择了要删除的 skill
- **THEN** 系统显示路径和文件数，提示确认，确认后删除整个目录

#### Scenario: 取消删除
- **WHEN** 用户在确认提示时选择取消
- **THEN** 系统不执行删除，返回流程
