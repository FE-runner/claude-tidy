#!/usr/bin/env bash
set -euo pipefail

# claude-tidy 发布脚本
# 用法:
#   ./scripts/release.sh          # 交互式选择版本类型
#   ./scripts/release.sh patch    # 直接指定

REMOTE="old-origin"
BRANCH="main"

# 读取当前版本
CURRENT=$(node -p "require('./package.json').version")

# 预计算版本号
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
PATCH_VER="${MAJOR}.${MINOR}.$((PATCH + 1))"
MINOR_VER="${MAJOR}.$((MINOR + 1)).0"
MAJOR_VER="$((MAJOR + 1)).0.0"

if [ $# -eq 0 ]; then
  # 交互式选择
  echo "当前版本: $CURRENT"
  echo ""
  echo "选择发布类型:"
  echo "  1) patch  ($CURRENT → $PATCH_VER)"
  echo "  2) minor  ($CURRENT → $MINOR_VER)"
  echo "  3) major  ($CURRENT → $MAJOR_VER)"
  echo ""
  read -p "请选择 [1-3] (默认 1): " -n 1 -r
  echo ""

  case "${REPLY:-1}" in
    1) BUMP_TYPE="patch" ;;
    2) BUMP_TYPE="minor" ;;
    3) BUMP_TYPE="major" ;;
    *)
      echo "错误: 无效的选择"
      exit 1
      ;;
  esac
else
  BUMP_TYPE="$1"
  if [[ "$BUMP_TYPE" != "patch" && "$BUMP_TYPE" != "minor" && "$BUMP_TYPE" != "major" ]]; then
    echo "错误: 无效的升级类型 '$BUMP_TYPE'"
    echo "用法: $0 [patch|minor|major]"
    exit 1
  fi
fi

# 显示确认信息
case "$BUMP_TYPE" in
  patch) NEW_PREVIEW="$PATCH_VER" ;;
  minor) NEW_PREVIEW="$MINOR_VER" ;;
  major) NEW_PREVIEW="$MAJOR_VER" ;;
esac
echo ""
echo "$CURRENT → $NEW_PREVIEW ($BUMP_TYPE)"

# 检查工作区是否干净
if [ -n "$(git status --porcelain)" ]; then
  echo ""
  echo "错误: 工作区有未提交的更改:"
  git status --short
  echo ""
  echo "请先提交或暂存所有更改后再发布。"
  exit 1
fi

# 升版本号
npm version "$BUMP_TYPE" -m "v%s"

# 读取新版本
NEW_VER=$(node -p "require('./package.json').version")

# 推送代码和 tag
echo ""
echo "推送到 $REMOTE/$BRANCH ..."
git push "$REMOTE" "$BRANCH"
git push "$REMOTE" "v${NEW_VER}"

echo ""
echo "✓ v${NEW_VER} 已推送，GitHub Actions 将自动发布到 npm。"
echo "查看进度: https://github.com/FE-runner/claude-tidy/actions"
