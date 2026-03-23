## Context

claude-tidy 是一个纯交互式 CLI 工具，管理 Claude Code 的 rules 和 skills。已实现全部功能。

当前 Claude Code 配置文件的实际状况：
- 全局 rules 38+ 个文件，分布在 `~/.claude/rules/` 下，部分有双层嵌套（如 `conventions/conventions/`）
- 全局 skills 20+ 个目录，部分为 symlink（指向 `~/.agents/skills/`），存在 `skills/skills/` 嵌套
- 项目 rules 在 `.claude/rules/` 下
- 项目 skills 在 `.claude/skills/` 下
- 每条 rule 是 markdown 文件，带 YAML frontmatter（`description`、`alwaysApply`、`globs`）
- 每个 skill 是一个目录，包含 `SKILL.md` 和可选附属文件

## Goals / Non-Goals

**Goals:**
- 纯交互式单命令体验：`claude-tidy` 进入交互流程，无子命令
- 使用 `@inquirer/prompts` 提供交互 UI（select、checkbox 支持 `a` 键全选、confirm）
- 支持 list、diff、move、delete 四个操作，均通过交互引导
- skills 和 rules 均支持全局和项目两个作用域
- diff 对 rules 和 skills 均生效：对比全局 vs 项目的同名项
- 全面兼容 symlink skills（扫描、list 标注、move 保持链接、delete 删除链接）
- 时间比较取创建时间（birthtime）和修改时间（mtime）中较晚的

**Non-Goals:**
- 不实现子命令模式
- 不实现 toggle（启用/禁用）
- 不实现 rule/skill 的创建或编辑
- 不使用 CLI 框架（commander、yargs、oclif）

## Decisions

### 1. 交互模型：纯交互式单命令

**决策**: `claude-tidy` 只有一个入口，通过交互引导完成所有操作。

**交互流程**:
```
claude-tidy
  → 欢迎语（名称 + 版本 + 描述）
  → 选择: skills / rules
    → 选择: list / diff / move / delete

    list:
      → 选择: 全局 / 项目 / 全部
      → 显示列表（全部时分开展示全局和项目）

    diff:
      → 展示同名项数量
      → checkbox 多选要处理的（a 键全选）
      → 逐个 select 保留全局还是项目（标注最新，可跳过）

    move:
      → 选方向（全局→项目 / 项目→全局）
      → checkbox 多选要移动的
      → 逐个处理冲突（覆盖/跳过）
      → 复制完成后问是否删除源文件
      → symlink 源创建 symlink 目标

    delete:
      → 选作用域（全局 / 项目）
      → checkbox 多选要删除的
      → rules 直接删除，skills 二次确认后整目录删除
```

### 2. 提示库：@inquirer/prompts

**决策**: 使用 `@inquirer/prompts`。

**理由**: checkbox 原生支持 `a` 键全选/全不选。@clack/prompts 的 multiselect 不支持。

### 3. CLI 参数：仅保留 --help 和 --version

**决策**: 只接受 `--help/-h` 和 `--version/-v`，其他参数显示帮助。

### 4. Rule 标识符：相对路径

**决策**: 以 rules 根目录为基准的相对路径作为标识符（如 `react/core.md`）。

### 5. diff 策略：多选 + 逐个选保留

**决策**: 先展示同名项数量，然后 checkbox 多选要处理的，再逐个 select 保留哪个版本。

### 6. Skills 全局和项目双作用域

**决策**: skills 和 rules 一样，支持全局（`~/.claude/skills/`）和项目（`.claude/skills/`）两个作用域。list、diff、move、delete 均支持。

### 7. Symlink 兼容

**决策**: scanner 用 `fs.statSync` 跟踪 symlink 目标判断是否是目录，记录 `isSymlink` 和 `symlinkTarget`。list 标注 `[链接]`，move 时 symlink 源创建 junction 链接而非复制目录。

### 8. 时间比较：取较晚的

**决策**: `getLatestTime()` 取 `max(birthtime, mtime)`。

**理由**: 复制文件时 mtime 被保留但 birthtime 是新的，直接比 mtime 会导致两边时间相同。

### 9. 项目结构

```
claude-tidy/
├── src/
│   ├── cli.ts            # 入口：欢迎语 + --help/--version + 交互流程
│   ├── flows/
│   │   ├── list.ts       # list 交互流程
│   │   ├── diff.ts       # diff 交互流程
│   │   ├── move.ts       # move 交互流程
│   │   └── delete.ts     # delete 交互流程
│   ├── utils/
│   │   ├── paths.ts      # 路径解析（全局/项目 rules/skills 目录）
│   │   ├── parser.ts     # rule frontmatter 解析
│   │   ├── scanner.ts    # 文件系统扫描（symlink 兼容，getLatestTime）
│   │   └── display.ts    # 终端输出格式化（日期精确到秒）
│   └── types.ts          # 类型定义（Rule、Skill 含 isSymlink/symlinkTarget）
├── package.json
├── tsconfig.json
├── CLAUDE.md
└── README.md
```

### 10. 构建

**决策**: TypeScript ESM，`tsc` 编译。`npm run dev` = 编译 + 运行，`npm run build` = 编译，`npm start` = 运行。

## Risks / Trade-offs

- **[纯交互式 vs 可脚本化]** → 不支持脚本/CI 调用。可接受：个人管理工具。
- **[Windows 路径兼容]** → 全部使用 `path.join`/`path.resolve`，不硬编码分隔符。
- **[symlink 兼容]** → Windows 上 `fs.symlinkSync` 使用 `junction` 类型，不需要管理员权限。
- **[skill 识别]** → 递归扫描，`statSync` 跟踪 symlink，以 `SKILL.md` 存在作为标志。
