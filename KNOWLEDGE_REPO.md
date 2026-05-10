# Separating Tool from Knowledge

autograph is designed to keep the **tool** (public) separate from your **knowledge** (private). This document explains how.

## The pattern

```
autograph/          public tool repo — clone, install, update
team-knowledge/     private knowledge repo — your wiki, decisions, tasks
```

Your knowledge repo commits: `wiki/`, `brain/`, `team/`, `work/`, `domains.json`, `CLAUDE.md`.
Tool files are installed into the knowledge repo by a script — **not committed**.

---

## Setting up a new knowledge repo

### Option A — Use `bin/init-knowledge.sh`

```bash
cd autograph
bash bin/init-knowledge.sh /path/to/my-knowledge
cd /path/to/my-knowledge
# edit domains.json, push to your private GitHub
```

### Option B — Manual

```bash
mkdir my-knowledge && cd my-knowledge
git init

# Copy starting structure from autograph
cp /path/to/autograph/domains.example.json ./domains.json   # aviation
# OR
cp /path/to/autograph/domains.default.json ./domains.json   # generic

mkdir -p wiki/sources wiki/entities wiki/concepts wiki/standards wiki/decisions wiki/meta
mkdir -p brain team/members team/plans team/goals work/active work/archive .raw bin .claude
```

Create `.claude/settings.json` with the hooks from autograph's `.claude/settings.json`.

Create `.gitignore` excluding tool files:
```
agents/
commands/
hooks/
_templates/
bin/check-new-files.mjs
bin/watch-raw.mjs
.raw/*
!.raw/.manifest.json
!.raw/.gitkeep
```

Create `bin/install-tool.sh`:
```bash
#!/usr/bin/env bash
TOOL_REPO="https://github.com/YOUR_ORG/autograph"
TOOL_REF="${1:-main}"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git clone --depth 1 --branch "$TOOL_REF" "$TOOL_REPO" "$tmp"
mkdir -p agents commands hooks _templates bin
cp -r "$tmp/agents/."      ./agents/
cp -r "$tmp/commands/."    ./commands/
cp -r "$tmp/hooks/."       ./hooks/
cp -r "$tmp/_templates/."  ./_templates/
cp    "$tmp/bin/check-new-files.mjs" ./bin/
cp    "$tmp/bin/watch-raw.mjs"       ./bin/
echo "autograph $TOOL_REF installed."
```

---

## Teammate onboarding (3 steps)

```bash
git clone git@github.com:YOUR_ORG/my-knowledge
cd my-knowledge
bash bin/install-tool.sh    # pulls tool from public autograph
bash bin/setup.sh           # checks Node.js, git config
claude .                    # open in Claude Code
```

---

## Updating the tool

When autograph ships new features:

```bash
# In your knowledge repo
bash bin/update-tool.sh           # update to latest main
bash bin/update-tool.sh v1.2.0    # pin to a specific release
```

Tool files are re-downloaded. Your `domains.json`, `wiki/`, `brain/`, `work/` are untouched.

---

## Sharing source files

Source documents in `.raw/` are gitignored (PDFs can be large). Share them with teammates via:

- **Google Drive / SharePoint**: drop the folder there, teammates sync to their `.raw/`
- **S3**: `aws s3 sync .raw/ s3://your-bucket/knowledge-raw/`
- **Internal file server**: any shared path

The wiki pages (summaries, extractions, cross-references) are the shareable artifact — committed and synced via git.

---

## What gets committed where

| Content | autograph (public) | knowledge repo (private) |
|---------|:-----------------:|:----------------------:|
| agents/, commands/, hooks/ | ✓ | gitignored (installed) |
| _templates/, bin/ scripts | ✓ | gitignored (installed) |
| domains.example.json | ✓ | — |
| domains.json | — | ✓ |
| wiki/, brain/, team/, work/ | empty templates only | ✓ real content |
| .raw/ source files | — | gitignored (too large) |
| .raw/.manifest.json | — | ✓ |
