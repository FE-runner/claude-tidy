## Why

claude-tidy 作为 npm CLI 工具，写完后需要发布到 npm registry。手动发布容易出错（忘记 build、版本不一致、发布脏代码），需要一套自动化方案。目标：本地只负责选版本和触发，其余全部交给 GitHub Actions。

## What Changes

- 新增本地 release 脚本（`scripts/release.sh`），职责极简：参数接收版本类型 → 工作区检查 → npm version bump → git push（含 tag）
- 新增 GitHub Actions workflow，监听 tag 推送，自动完成：typecheck → test → build → npm publish（带 provenance）→ 创建 GitHub Release（带自动生成的发布日志）
- 新增 `.github/release.yml` 配置发布日志的 commit 分组规则
- 新增 `.npmignore` 过滤发布内容，只发布编译产物
- 新增 CI workflow，push/PR 时跑 typecheck + test（ubuntu + windows 矩阵，paths-ignore *.md）

## Design Decisions

### 发布前必须跑测试

publish workflow 在 build 之前运行 `npm test`。测试不过则整个发布中断，npm publish 不会执行。CI workflow（push/PR）也跑测试，双重保障。

### Bash 脚本，与 skills-cli 保持一致

选择 bash 而非 Node 脚本。原因：零依赖、体积小（~30 行）、和同 monorepo 的 skills-cli 发版体验一致。Windows 环境通过 Git Bash 运行，无兼容问题。版本类型通过命令行参数传入（`release.sh patch`），不做交互式选择。

### 脚本做工作区检查

参考 skills-cli，脚本在 `npm version` 前检查 `git status --porcelain`。工作区脏则提示并退出，避免把未提交的变更混入发版 commit。

### 本地脚本只做触发，不做重活

脚本不生成 changelog、不调用 npm publish。CI 天然就是预检环境，GitHub 自带 `--generate-notes` 生成发布日志。职责分离，脚本保持极简。

### Tag 触发 publish，不用 workflow_dispatch

用 `git tag v*` 推送触发 Actions，而非 GitHub 网页手动触发。原因：本地 `npm version` 一条命令同时改 package.json + commit + tag，流程最顺畅。

### GitHub Release 由 Actions 创建

publish workflow 中 npm publish 成功后（`if: steps.publish.outcome == 'success'`），用 `gh release create --generate-notes` 自动创建 Release。发布日志由 GitHub 从两个 tag 之间的 commits/PRs 自动收集，无需手动维护。

### CI 跨平台矩阵

CLI 工具用户可能在 Windows/Linux/Mac，CI 跑 ubuntu + windows 矩阵。md 文件变更通过 paths-ignore 跳过，省资源。

### npm provenance 开启

零成本增加包的可信度，在 npm 页面显示构建来源。需要 `id-token: write` 权限。

## Artifacts

| 文件 | 说明 |
|------|------|
| `scripts/release.sh` | 本地 release 脚本：参数选版本 → 工作区检查 → npm version → git push + tags |
| `.github/workflows/ci.yml` | push/PR 触发：typecheck + test（ubuntu + windows 矩阵，paths-ignore *.md） |
| `.github/workflows/publish.yml` | tag v* 触发：typecheck → test → build → npm publish → gh release create |
| `.github/release.yml` | GitHub Release 发布日志分组规则（按 conventional commit label） |
| `.npmignore` | 排除 src/、openspec/、.claude/、scripts/ 等非发布内容 |

## Impact

- **package.json**: 新增 `"release"` script，新增 `"files"` 字段
- **GitHub 手动配置**: repo Settings → Secrets → 添加 `NPM_TOKEN`（npm access token）
- **GitHub 手动配置**: repo Settings → Actions → 允许 Actions 读写 repo
- **依赖**: 无新增依赖

## Flow

```
本地                              GitHub
─────                             ──────
$ ./scripts/release.sh minor
  │
  ├─ 检查参数 (patch/minor/major)
  ├─ 检查工作区是否干净
  ├─ npm version <type>
  │   ├─ 改 package.json
  │   ├─ git commit "vX.Y.Z"
  │   └─ git tag vX.Y.Z
  └─ git push + push --tags
       │
       │                          ci.yml (push 触发)
       ├─────────────────────────▶ typecheck + test
       │                          (ubuntu + windows)  ✓
       │
       │                          publish.yml (tag v* 触发)
       └─────────────────────────▶ npm ci
                                   tsc --noEmit
                                   npm test
                                   npm run build
                                   npm publish --provenance
                                   ↓ (成功后)
                                   gh release create --generate-notes
                                        │
                                        ▼
                                   ✓ npm 包已发布
                                   ✓ GitHub Release 已创建
                                   ✓ 发布日志已自动生成
```

## Non-goals

- 不做 CHANGELOG.md 文件维护 — GitHub Release 页面就是 changelog
- 不做 monorepo 发布（只有一个包）
- 不做 prerelease / beta 发布流程（后续按需加）
- 不做交互式版本选择 — 命令行参数足够
