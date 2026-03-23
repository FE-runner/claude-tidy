## ADDED Requirements

### Requirement: move rules
系统 SHALL 支持多选移动 rules 在全局和项目之间。

#### Scenario: 选择方向并多选
- **WHEN** 用户选择 rules → move
- **THEN** 系统提示选择方向，然后 checkbox 多选要移动的 rules（a 键全选）

#### Scenario: 冲突处理
- **WHEN** 目标位置已存在同名 rule
- **THEN** 系统显示两边时间，提示覆盖或跳过

#### Scenario: 删除源文件
- **WHEN** 所有选中的 rules 复制完成
- **THEN** 系统提示是否删除源文件

### Requirement: move skills
系统 SHALL 支持多选移动 skills 在全局和项目之间。symlink 源创建 symlink 目标。

#### Scenario: symlink 保持链接
- **WHEN** 源 skill 是 symlink
- **THEN** 系统在目标创建 junction 链接，而非复制目录

### Requirement: 自动创建目标目录
系统 SHALL 在目标路径不存在时自动创建。
