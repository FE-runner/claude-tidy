## ADDED Requirements

### Requirement: rules diff
系统 SHALL 对比全局和项目的同名 rules，引导用户多选后逐个选择保留哪个版本。

#### Scenario: 展示数量并多选
- **WHEN** 用户选择 rules → diff
- **THEN** 系统展示同名 rules 数量，然后 checkbox 多选要处理的（a 键全选），列表标注哪个最新

#### Scenario: 逐个选保留
- **WHEN** 用户选定了要处理的 rules
- **THEN** 系统逐个 select 保留全局还是项目（标注时间和最新标记），可跳过

#### Scenario: 无同名 rules
- **WHEN** 全局和项目之间没有同标识符的 rules
- **THEN** 系统提示「全局和项目没有同名 rules」

### Requirement: 时间比较
系统 SHALL 取 birthtime 和 mtime 中较晚的作为比较依据。
