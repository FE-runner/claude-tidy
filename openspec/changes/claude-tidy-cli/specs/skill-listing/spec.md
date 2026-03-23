## ADDED Requirements

### Requirement: 列出全局 skills
系统 SHALL 扫描 `~/.claude/skills/` 目录，识别所有包含 `SKILL.md` 的目录作为 skill，展示 skill 名称、路径和文件数量。

#### Scenario: 列出 skills
- **WHEN** 用户执行 `claude-tidy list skills`
- **THEN** 系统列出所有 skills，每行包含：skill 名称（目录名）、路径、包含的文件数量

#### Scenario: 嵌套 skills 目录
- **WHEN** `~/.claude/skills/skills/` 下存在 skill 目录（如 `skills/skills/browser-use/`）
- **THEN** 系统递归扫描，以 `SKILL.md` 所在目录为 skill 根，正确识别并列出

#### Scenario: skills 目录不存在
- **WHEN** `~/.claude/skills/` 目录不存在
- **THEN** 系统显示"未找到 skills"提示，正常退出

### Requirement: 展示 skill 详情
系统 SHALL 展示每个 skill 的文件组成（SKILL.md + references 等附属文件）。

#### Scenario: 带 references 的 skill
- **WHEN** skill 目录包含 `references/` 子目录
- **THEN** 系统在文件数量中包含 references 目录下的文件
