## ADDED Requirements

### Requirement: 命令路由
系统 SHALL 根据第一个参数路由到对应命令：`list`、`diff`、`move`、`remove`。

#### Scenario: 有效命令
- **WHEN** 用户执行 `claude-tidy list rules`
- **THEN** 系统路由到 list 命令并执行

#### Scenario: 无参数
- **WHEN** 用户执行 `claude-tidy`（无参数）
- **THEN** 系统显示帮助信息，列出可用命令和用法

#### Scenario: 未知命令
- **WHEN** 用户执行 `claude-tidy unknown`
- **THEN** 系统提示"未知命令: unknown"，并显示可用命令列表

### Requirement: 帮助信息
系统 SHALL 在 `--help` 或无参数时显示使用说明。

#### Scenario: 全局帮助
- **WHEN** 用户执行 `claude-tidy --help`
- **THEN** 系统显示工具描述和所有命令的简要说明

#### Scenario: 命令帮助
- **WHEN** 用户执行 `claude-tidy list --help`
- **THEN** 系统显示 list 命令的详细用法和参数说明

### Requirement: 版本信息
系统 SHALL 在 `--version` 时显示当前版本号。

#### Scenario: 查看版本
- **WHEN** 用户执行 `claude-tidy --version`
- **THEN** 系统从 package.json 读取并显示版本号
