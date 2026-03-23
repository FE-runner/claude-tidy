# claude-tidy

Claude Code 的 skills 和 rules 管理工具。查看、比对、移动、删除，一个命令搞定。

## 安装

```bash
npx claude-tidy
```

## 命令

```bash
# 查看
claude-tidy list rules              # 列出所有 rules
claude-tidy list skills             # 列出所有 skills
claude-tidy list rules --scope global   # 只看全局 rules

# 比对
claude-tidy diff                    # 全局 vs 项目 rules 时间总览
claude-tidy diff react/core.md      # 某条 rule 的详细 diff

# 移动
claude-tidy move react/core.md --to project  # 全局 → 项目
claude-tidy move react/core.md --to global   # 项目 → 全局

# 删除
claude-tidy remove react/core.md             # 删除 rule
claude-tidy remove prisma-database-setup     # 删除 skill（需确认）
```

## 许可证

MIT
