#!/usr/bin/env bash
# Full production build in a disposable git worktree — safe to run while the
# dev server is up (docs/DECISIONS.md, 2026-09-01). Carries the working tree's
# uncommitted changes across, clones node_modules with an APFS copy-on-write
# clone (a symlink is refused by Turbopack), builds, and cleans up on exit.
#
#   npm run verify
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
WT=$(mktemp -d "${TMPDIR:-/tmp}/arun-verify.XXXXXX")
BRANCH="verify-$(date +%s)"

cleanup() {
  cd "$ROOT"
  git worktree remove --force "$WT" >/dev/null 2>&1 || rm -rf "$WT"
  git branch -D "$BRANCH" >/dev/null 2>&1 || true
}
trap cleanup EXIT

cd "$ROOT"
git worktree add -q "$WT" -b "$BRANCH" HEAD

# Modified and untracked (non-ignored) files travel with us; deletions too.
git ls-files -m -o --exclude-standard -z | while IFS= read -r -d '' f; do
  mkdir -p "$WT/$(dirname "$f")"
  cp "$ROOT/$f" "$WT/$f"
done
git ls-files -d -z | while IFS= read -r -d '' f; do rm -f "$WT/$f"; done

echo "verify-build: cloning node_modules…"
cp -Rc node_modules "$WT/node_modules" 2>/dev/null || cp -R node_modules "$WT/node_modules"

cd "$WT"
npm run build

pages=$(find out -name '*.html' | wc -l | tr -d ' ')
echo "verify-build: OK — ${pages} HTML pages in out/ (worktree removed on exit)"
