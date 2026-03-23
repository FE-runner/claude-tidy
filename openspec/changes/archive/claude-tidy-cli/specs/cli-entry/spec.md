## ADDED Requirements

### Requirement: 纯交互式入口
系统 SHALL 以纯交互式方式运行，显示欢迎语后进入交互流程。

#### Scenario: 无参数启动
- **WHEN** 用户执行 `claude-tidy`
- **THEN** 系统显示欢迎语（名称 + 版本 + 描述），进入交互流程（选择管理对象 → 选择操作）

#### Scenario: 管理对象选择
- **WHEN** 进入交互流程
- **THEN** 系统提示选择 skills 或 rules（skills 在前）

#### Scenario: 操作选择
- **WHEN** 选择了管理对象
- **THEN** 系统提示选择操作：list / diff / move / delete

#### Scenario: 带无效参数
- **WHEN** 用户执行 `claude-tidy something`
- **THEN** 系统显示帮助信息

### Requirement: 帮助和版本
系统 SHALL 支持 `--help/-h` 和 `--version/-v`。
