## ADDED Requirements

### Requirement: 移动 rule 到目标作用域
系统 SHALL 支持将 rule 在全局和项目之间移动或复制。

#### Scenario: 复制全局 rule 到项目
- **WHEN** 用户执行 `claude-tidy move react/core.md --to project` 并选择"复制"
- **THEN** 系统将 `~/.claude/rules/react/core.md` 复制到 `.claude/rules/react/core.md`，保留全局原件

#### Scenario: 剪切项目 rule 到全局
- **WHEN** 用户执行 `claude-tidy move react/core.md --to global` 并选择"移动"
- **THEN** 系统将 `.claude/rules/react/core.md` 移动到 `~/.claude/rules/react/core.md`，删除项目原件

### Requirement: 操作方式选择
系统 SHALL 在执行 move 时提示用户选择复制或移动（剪切）。

#### Scenario: 提示选择操作方式
- **WHEN** 用户执行 `claude-tidy move react/core.md --to project`
- **THEN** 系统提示"操作方式"并列出"复制（保留原件）"和"移动（删除原件）"选项

### Requirement: 冲突处理
当目标位置已存在同标识符的 rule 时，系统 SHALL 提示用户并支持覆盖。

#### Scenario: 目标已存在同名 rule
- **WHEN** 用户执行 `claude-tidy move react/core.md --to project`，且项目中已存在 `react/core.md`
- **THEN** 系统显示两边的修改时间，提示"覆盖"或"取消"选项

#### Scenario: 用户选择覆盖
- **WHEN** 冲突提示时用户选择"覆盖"
- **THEN** 系统直接用源文件覆盖目标文件

#### Scenario: 用户选择取消
- **WHEN** 冲突提示时用户选择"取消"
- **THEN** 系统不执行任何操作，正常退出

### Requirement: 自动创建目标目录
系统 SHALL 在目标路径的父目录不存在时自动创建。

#### Scenario: 目标目录不存在
- **WHEN** 用户移动 `react/core.md --to project`，但 `.claude/rules/react/` 目录不存在
- **THEN** 系统自动创建 `.claude/rules/react/` 目录，然后执行移动/复制
