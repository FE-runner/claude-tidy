## 交互式流程入口

### 概述

`claude-tidy` 是纯交互式单命令 CLI。运行后显示欢迎语，进入交互流程。仅支持 `--help/-h` 和 `--version/-v` 两个参数。

### 交互流程

1. 显示欢迎语（名称 + 版本 + 描述）
2. 选择管理对象：skills / rules（skills 在前）
3. 选择操作：list / diff / move / delete
4. 进入对应操作的子流程（多选支持 a 键全选）
5. 显示完成提示

### 参数行为

| 输入 | 行为 |
|------|------|
| `claude-tidy` | 进入交互流程 |
| `claude-tidy --help` / `-h` | 显示帮助文本 |
| `claude-tidy --version` / `-v` | 显示版本号 |
| `claude-tidy <其他>` | 显示帮助文本 |

### 提示库

使用 `@inquirer/prompts`，提供 select、checkbox（a 键全选）、confirm 等交互元素。
