#!/usr/bin/env bash
# wiki-graph team setup
# Run once after cloning: bash bin/setup.sh

set -e

echo "=== wiki-graph setup ==="

# 1. Check Node.js
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js not found. Install Node.js 22+ from https://nodejs.org"
  exit 1
fi
NODE_VERSION=$(node --version | cut -d. -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js 18+ required (found $(node --version)). Please upgrade."
  exit 1
fi
echo "Node.js $(node --version) ✓"

# 2. Check Claude Code
if ! command -v claude &>/dev/null; then
  echo "WARNING: Claude Code CLI not found."
  echo "  Install: https://claude.ai/code"
  echo "  Or use the Claude Code desktop app and open this folder directly."
else
  echo "Claude Code ✓"
fi

# 3. Check git config
if [ -z "$(git config user.email)" ]; then
  echo ""
  echo "Git user not configured. Enter your details:"
  read -p "  Your name: " GIT_NAME
  read -p "  Your email: " GIT_EMAIL
  git config user.name "$GIT_NAME"
  git config user.email "$GIT_EMAIL"
fi
echo "Git user: $(git config user.name) <$(git config user.email)> ✓"

# 4. Set up git remote (if not already set)
if ! git remote get-url origin &>/dev/null; then
  echo ""
  echo "No git remote set. To share the knowledge graph with the team:"
  echo "  git remote add origin <your-repo-url>"
  echo "  git push -u origin main"
fi

# 5. Create .raw/ if missing
mkdir -p .raw

# 6. Done
echo ""
echo "=== Setup complete ==="
echo ""
echo "Next steps:"
echo "  1. Open this folder in Claude Code: claude ."
echo "  2. Drop source files (PDFs, docs, text) into .raw/"
echo "  3. Start a new Claude session — files are ingested automatically"
echo ""
echo "Optional — run the file watcher in a separate terminal:"
echo "  node bin/watch-raw.mjs"
echo ""
echo "Share source files with teammates via Google Drive, SharePoint, or S3."
echo "The wiki/ knowledge graph is shared via git — pull to get latest."
