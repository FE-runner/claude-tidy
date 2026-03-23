# claude-tidy

Claude Code 的 skills 和 rules 管理工具。查看、比对、移动、删除，一个命令搞定。

## 使用

```bash
npx claude-tidy
```

纯交互式，运行后按提示操作：

1. 选择管理对象：skills / rules
2. 选择操作：list / diff / move / delete
3. 跟随交互引导完成（多选列表按 `a` 全选）

```bash
claude-tidy --help       # 帮助信息
claude-tidy --version    # 版本号
```

## 功能

| 操作 | 说明 |
|------|------|
| **list** | 查看 rules/skills，支持全局/项目/全部，全部时分开展示 |
| **diff** | 对比全局和项目的同名 rules/skills，标注最新版本，选择保留哪个 |
| **move** | 在全局和项目之间移动 rules/skills，symlink 保持链接方式 |
| **delete** | 删除 rules 或 skills，确认后删除（skills 整目录删除） |

## 特性

- 支持 symlink（软链接）skills，list 标注 `[链接]`，move 保持链接
- 时间比较取创建时间和修改时间中较晚的，解决复制文件时间不准的问题
- 日期精确到秒

## 许可证

MIT
