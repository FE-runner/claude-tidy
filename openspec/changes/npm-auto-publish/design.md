## 架构

```
本地                                  GitHub
─────────────────────────            ─────────────────────────────────

scripts/release.sh                   .github/workflows/
├── 参数: patch/minor/major           ├── ci.yml
├── git status 检查工作区              │   └─ push/PR → typecheck + test
├── npm version <type>                │      (ubuntu + windows 矩阵)
├── git push                          │
└── git push --tags                  └── publish.yml
                                         └─ tag v* →
                                            typecheck → test → build
                                            → npm publish --provenance
                                            → gh release create
                                              (仅 publish 成功后)

.github/release.yml                  .npmignore
└── 发布日志分组规则                   └── 发布过滤
```

## scripts/release.sh

Bash 脚本，参考 skills-cli 的 `release.sh`，简化掉 `-bmc` 版本号逻辑（claude-tidy 用标准 semver）。

### 流程

```
1. 读取参数（默认 patch）
2. 验证参数：patch / minor / major
3. 读取当前 package.json version，显示给用户
4. 检查 git status --porcelain，工作区脏则退出
5. npm version <type> -m "v%s"
   └── npm 自动: 改 package.json → git commit → git tag vX.Y.Z
6. git push origin main
7. git push origin vX.Y.Z
8. 输出: "✓ vX.Y.Z 已推送，GitHub Actions 将自动发布到 npm"
```

### 用法

```bash
./scripts/release.sh          # 默认 patch
./scripts/release.sh patch    # 0.1.0 → 0.1.1
./scripts/release.sh minor    # 0.1.0 → 0.2.0
./scripts/release.sh major    # 0.1.0 → 1.0.0
```

### 错误处理

- 参数无效 → 输出用法提示并退出
- 工作区不干净 → 输出 `git status --short` 并退出
- `npm version` 失败 → set -e 自动退出
- `git push` 失败（网络问题）→ 提示 tag 已在本地创建，手动重试 `git push --tags`

### 与 skills-cli 的差异

| 点 | skills-cli | claude-tidy |
|----|-----------|-------------|
| 版本号 | `-bmc` 自定义后缀，手动解析 | 标准 semver，npm version 直接处理 |
| remote | `old-origin` | `origin` |
| branch | `master` | `main` |
| 工作区脏时 | 提示是否自动 commit | 直接退出，要求用户手动处理 |

## .github/workflows/ci.yml

```yaml
触发:
  push（所有分支），paths-ignore: **/*.md
  pull_request（到 main），paths-ignore: **/*.md

矩阵: ubuntu-latest + windows-latest

步骤:
  - checkout
  - setup-node (lts/*)
  - npm ci
  - tsc --noEmit
  - npm test
```

跨平台矩阵确保 CLI 在 Linux 和 Windows 上都能通过。md 文件变更跳过，省 CI 资源。

## .github/workflows/publish.yml

```yaml
触发: push tags v*

权限:
  contents: write    # 创建 GitHub Release
  id-token: write    # npm provenance

步骤:
  - checkout (fetch-depth: 0，用于 release notes 收集 commit 历史)
  - setup-node + registry-url: https://registry.npmjs.org
  - npm ci
  - tsc --noEmit
  - npm test
  - npm run build
  - npm publish --provenance --access public
    id: publish
    env: NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  - gh release create (if: steps.publish.outcome == 'success')
    --generate-notes
    env: GH_TOKEN: ${{ github.token }}
```

### publish 成功才建 Release

参考 skills-cli，用 `id: publish` + `if: steps.publish.outcome == 'success'` 确保 npm publish 失败时不建 GitHub Release。避免"Release 有了但包没发"的混乱状态。

### publish 和 ci 都跑 typecheck + test 的原因

tag push 和普通 push 是独立事件。publish 里重跑一遍是安全网，确保发布时环境一致。

### 失败场景

| 失败点 | 后果 | 恢复方式 |
|--------|------|----------|
| typecheck 失败 | 不 build，不 publish | 修复后删除远程 tag，重新发版 |
| test 失败 | 同上 | 同上 |
| build 失败 | 不 publish | 同上 |
| npm publish 失败 | 包未发布，无 Release | 检查 NPM_TOKEN，修复后删 tag 重来 |
| gh release 失败 | 包已发布，但无 Release 页面 | 手动 `gh release create` 补建 |

## .github/release.yml

```yaml
changelog:
  categories:
    - title: ✨ 新功能
      labels: [enhancement, feat]
    - title: 🐛 Bug 修复
      labels: [bug, fix]
    - title: 📝 文档
      labels: [documentation, docs]
    - title: 🔧 其他变更
      labels: ["*"]
```

无 label 的 commit 归入"其他变更"。纯 commit（无 PR）时 GitHub 按 commit message 罗列。

## .npmignore

```
src/
openspec/
.claude/
.github/
scripts/
tsconfig.json
.prettierrc
*.md
!README.md
!LICENSE
```

与 `package.json` 的 `files` 字段互补：`files` 白名单制（只包含 dist），`.npmignore` 黑名单制（排除源码和配置）。两者同时存在时 npm 以 `files` 为准，`.npmignore` 作为额外保险。

## package.json 变更

```json
{
  "files": ["dist"],
  "scripts": {
    "release": "./scripts/release.sh"
  }
}
```

## GitHub 仓库配置（手动）

| 配置项 | 位置 | 值 |
|--------|------|-----|
| NPM_TOKEN | Settings → Secrets → Actions | npm access token（Automation 类型） |
| Actions 权限 | Settings → Actions → General | Read and write permissions |
