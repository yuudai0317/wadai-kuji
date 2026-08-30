#!/usr/bin/env bash
# 500Theme を GitHub に作成し、Netlify に公開するセットアップスクリプト。
#
# 前提: gh CLI (https://cli.github.com/) にログイン済みであること。
#   gh auth login
# Netlify まで自動で行う場合は netlify-cli も使います（未インストールなら npx で実行）。
#
# 使い方:
#   bash setup-500theme.sh              # GitHub リポジトリ作成 + push まで
#   bash setup-500theme.sh --netlify    # 続けて Netlify にデプロイして公開URLを表示

set -euo pipefail

REPO_NAME="500Theme"
SITE_NAME="${SITE_NAME:-}"   # 例: SITE_NAME=merit-500theme bash setup-500theme.sh --netlify
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK_DIR="$(mktemp -d)"
DO_NETLIFY=0
[ "${1:-}" = "--netlify" ] && DO_NETLIFY=1

command -v gh >/dev/null || { echo "gh CLI が見つかりません: https://cli.github.com/"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh にログインしてください: gh auth login"; exit 1; }

OWNER="$(gh api user --jq .login)"
echo "==> GitHub ユーザー: $OWNER"

# --- 公開する中身だけを作業ディレクトリに集める ---
cp "$SRC_DIR/index.html" "$SRC_DIR/netlify.toml" "$SRC_DIR/README.md" "$WORK_DIR/"

cd "$WORK_DIR"
git init -q -b main
git add .
git commit -q -m "話題のくじ（100問）を公開する"

# --- リポジトリ作成 + push ---
if gh repo view "$OWNER/$REPO_NAME" >/dev/null 2>&1; then
  echo "==> $OWNER/$REPO_NAME は既にあります。そこへ push します。"
  git remote add origin "https://github.com/$OWNER/$REPO_NAME.git"
  git push -u origin main --force
else
  echo "==> $OWNER/$REPO_NAME を作成します（public）"
  gh repo create "$OWNER/$REPO_NAME" \
    --public \
    --description "話題のくじ — 雑談が盛り上がる100の問いかけ（HTML1枚の静的サイト）" \
    --source=. --remote=origin --push
fi
echo "==> リポジトリ: https://github.com/$OWNER/$REPO_NAME"

# --- Netlify デプロイ ---
if [ "$DO_NETLIFY" -eq 1 ]; then
  NTL="netlify"
  command -v netlify >/dev/null || NTL="npx --yes netlify-cli"
  echo "==> Netlify にログインします（ブラウザが開きます。ログイン済みならスキップされます）"
  $NTL login || true
  CREATE_ARGS=(--manual)
  [ -n "$SITE_NAME" ] && CREATE_ARGS+=(--name "$SITE_NAME")
  $NTL sites:create "${CREATE_ARGS[@]}" || true
  echo "==> 本番デプロイ"
  $NTL deploy --dir . --prod
  echo "==> 公開URLは上の 'Website URL' 行です。"
fi

echo
echo "作業ディレクトリ: $WORK_DIR"
