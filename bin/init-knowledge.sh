#!/usr/bin/env bash
# Create a new knowledge repo using autograph as the tool.
# Usage: bash bin/init-knowledge.sh [target-directory] [domain-template]
#   target-directory: where to create the knowledge repo (default: ../my-knowledge)
#   domain-template:  example|default  (default: default)
#
# Example:
#   bash bin/init-knowledge.sh ../team-knowledge example

set -e

TARGET="${1:-../my-knowledge}"
TEMPLATE="${2:-default}"
TOOL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ -d "$TARGET" ] && [ "$(ls -A "$TARGET")" ]; then
  echo "ERROR: $TARGET already exists and is not empty."
  exit 1
fi

echo "Creating knowledge repo at $TARGET ..."
mkdir -p "$TARGET/wiki/sources" "$TARGET/wiki/entities" "$TARGET/wiki/concepts" \
         "$TARGET/wiki/standards" "$TARGET/wiki/decisions" "$TARGET/wiki/meta" \
         "$TARGET/brain" "$TARGET/team/members" "$TARGET/team/plans" "$TARGET/team/goals" \
         "$TARGET/work/active" "$TARGET/work/archive" "$TARGET/.raw" \
         "$TARGET/bin" "$TARGET/.claude"

# Copy domains config
if [ "$TEMPLATE" = "example" ]; then
  cp "$TOOL_DIR/domains.example.json" "$TARGET/domains.json"
  echo "Copied aviation domain example → domains.json"
else
  cp "$TOOL_DIR/domains.default.json" "$TARGET/domains.json"
  echo "Copied default domain config → domains.json (edit to match your domain)"
fi

# Copy vault-manifest template
cp "$TOOL_DIR/vault-manifest.json" "$TARGET/vault-manifest.json"

# Install tool files
cp -r "$TOOL_DIR/agents/."     "$TARGET/agents/"
cp -r "$TOOL_DIR/commands/."   "$TARGET/commands/"
cp -r "$TOOL_DIR/hooks/."      "$TARGET/hooks/"
cp -r "$TOOL_DIR/_templates/." "$TARGET/_templates/"
cp    "$TOOL_DIR/bin/check-new-files.mjs" "$TARGET/bin/"
cp    "$TOOL_DIR/bin/watch-raw.mjs"       "$TARGET/bin/"
cp    "$TOOL_DIR/bin/setup.sh"            "$TARGET/bin/"

# Create install/update scripts
cat > "$TARGET/bin/install-tool.sh" << 'INSTALLEOF'
#!/usr/bin/env bash
TOOL_REPO="https://github.com/YOUR_ORG/autograph"
TOOL_REF="${1:-main}"
echo "Installing autograph @ $TOOL_REF ..."
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git clone --depth 1 --branch "$TOOL_REF" "$TOOL_REPO" "$tmp" || { echo "ERROR: Could not clone $TOOL_REPO"; exit 1; }
mkdir -p agents commands hooks _templates bin
cp -r "$tmp/agents/."      ./agents/
cp -r "$tmp/commands/."    ./commands/
cp -r "$tmp/hooks/."       ./hooks/
cp -r "$tmp/_templates/."  ./_templates/
cp    "$tmp/bin/check-new-files.mjs" ./bin/
cp    "$tmp/bin/watch-raw.mjs"       ./bin/
echo "autograph $TOOL_REF installed."
INSTALLEOF

cat > "$TARGET/bin/update-tool.sh" << 'UPDATEEOF'
#!/usr/bin/env bash
bash "$(dirname "$0")/install-tool.sh" "${1:-main}"
UPDATEEOF

chmod +x "$TARGET/bin/"*.sh

# Copy .claude/settings.json
cp "$TOOL_DIR/.claude/settings.json" "$TARGET/.claude/settings.json"

# Create .gitignore
cat > "$TARGET/.gitignore" << 'IGNOREEOF'
agents/
commands/
hooks/
_templates/
bin/check-new-files.mjs
bin/watch-raw.mjs
.raw/*
!.raw/.manifest.json
!.raw/.gitkeep
.obsidian/workspace.json
.obsidian/workspace-mobile.json
.obsidian/plugins/*/data.json
.DS_Store
Thumbs.db
*.tmp
node_modules/
IGNOREEOF

touch "$TARGET/.raw/.gitkeep"
touch "$TARGET/team/members/.gitkeep"
touch "$TARGET/team/plans/.gitkeep"
touch "$TARGET/team/goals/.gitkeep"
touch "$TARGET/work/active/.gitkeep"
touch "$TARGET/work/archive/.gitkeep"

# Copy empty wiki structure
for f in index.md hot.md log.md overview.md; do
  cp "$TOOL_DIR/wiki/$f" "$TARGET/wiki/$f" 2>/dev/null || true
done
for d in sources entities concepts standards decisions meta; do
  [ -f "$TOOL_DIR/wiki/$d/_index.md" ] && cp "$TOOL_DIR/wiki/$d/_index.md" "$TARGET/wiki/$d/_index.md" || true
done
for f in "North Star.md" "Key Decisions.md" "Patterns.md" "Gotchas.md" "Memories.md"; do
  cp "$TOOL_DIR/brain/$f" "$TARGET/brain/$f" 2>/dev/null || true
done
cp "$TOOL_DIR/work/Index.md"   "$TARGET/work/Index.md"   2>/dev/null || true
cp "$TOOL_DIR/team/roadmap.md" "$TARGET/team/roadmap.md" 2>/dev/null || true

# Git init
cd "$TARGET"
git init
echo ""
echo "Knowledge repo created at $TARGET"
echo ""
echo "Next steps:"
echo "  1. Edit domains.json to match your domain"
echo "  2. Edit vault-manifest.json (change vault_name)"
echo "  3. git remote add origin git@github.com:YOUR_ORG/YOUR_KNOWLEDGE_REPO"
echo "  4. git add -A && git commit -m 'init: knowledge repo'"
echo "  5. git push -u origin main"
echo "  6. claude .   — open in Claude Code"
