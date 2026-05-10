# autograph — Setup Guide

Turn documents into a queryable knowledge graph. Drop files into `.raw/`, and Claude ingests, structures, and cross-references them automatically. Works across every project — Claude checks your wiki before answering questions, even when you're in a completely different codebase.

---

## How it works

There are two repositories:

| Repo | Purpose | Visibility |
|------|---------|------------|
| **autograph** (this repo) | Tool: agents, commands, hooks, templates, scripts | Public |
| **Your knowledge repo** | Content: your `wiki/`, `brain/`, `team/`, `work/` | Private |

You clone your knowledge repo, run `bin/install-tool.sh` to pull tool files from autograph into it, and open it in Claude Code. The tool files are gitignored in your knowledge repo — they stay separate.

---

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Claude Code** — [claude.ai/code](https://claude.ai/code) (desktop app or CLI)
- **Git** — any version

---

## 1. Create your knowledge repo

### Option A — Automated (recommended)

```bash
git clone https://github.com/YOUR_ORG/autograph
cd autograph
bash bin/init-knowledge.sh /path/to/my-knowledge
cd /path/to/my-knowledge
```

This scaffolds the full folder structure, copies `domains.example.json` → `domains.json`, and installs tool files.

### Option B — Manual

```bash
mkdir my-knowledge && cd my-knowledge
git init

# Copy the domain config (edit this to match your domains)
cp /path/to/autograph/domains.example.json ./domains.json

# Create folder structure
mkdir -p wiki/{concepts,entities,standards,decisions,sources,meta}
mkdir -p brain team/{members,plans,goals} work/{active,archive} .raw bin .claude

# Install tool files from autograph
bash bin/install-tool.sh
```

---

## 2. Configure domains

Open `domains.json`. This is the **only file you must customize** — it controls all domain detection. Claude reads it during every ingest; no domain keywords are hardcoded anywhere.

```json
{
  "domains": [
    {
      "id": "backend",
      "label": "Backend Systems",
      "folder": "wiki/concepts/backend",
      "keywords": ["API", "database", "microservice", "REST", "gRPC"]
    },
    {
      "id": "auth",
      "label": "Authentication",
      "folder": "wiki/concepts/auth",
      "keywords": ["OAuth", "JWT", "session", "identity", "SSO"]
    }
  ],
  "type_folders": {
    "concept":  "wiki/concepts",
    "entity":   "wiki/entities",
    "decision": "wiki/decisions",
    "source":   "wiki/sources",
    "person":   "team/members",
    "task":     "work/active"
  }
}
```

See `domains.example.json` for a full aviation example and `domains.default.json` for a minimal generic starting point.

---

## 3. Open in Claude Code

```bash
claude .
```

Claude Code loads the project hooks from `.claude/settings.json` automatically. No further configuration needed inside the project.

---

## 4. Configure global CLAUDE.md (critical for cross-project awareness)

This step makes Claude check your wiki **in every project**, not just when you're inside the knowledge repo. Without it, Claude has no idea your wiki exists when you're working elsewhere.

**File location**: `~/.claude/CLAUDE.md` (create it if it doesn't exist)

Add this block, replacing `<REPO_PATH>` with the absolute path to your knowledge repo:

```markdown
## Knowledge Graph

My personal knowledge base lives at:

\```
<REPO_PATH>
\```

When the user references the wiki, knowledge base, vault, or asks to save/ingest something, open or operate within that directory.

**Wiki lookup protocol** — apply silently before answering any question that touches
people, systems, projects, workflows, standards, domain concepts, or implementation decisions.

### Step 1 — Read the index
Read `<REPO_PATH>/wiki/index.md`. Scan section headers and page titles for anything
related to the user's request. Note the relative paths of candidate pages.

### Step 2 — Check decisions first (BLOCKING)
Read `<REPO_PATH>/wiki/decisions/_index.md`.
If the request involves implementing, building, adding, or changing something, also run:
\```
grep -ri "<keywords>" "<REPO_PATH>/wiki/decisions" --include="*.md" -l
\```
Read every matched decision file. If a decision blocks or contradicts what the user is
asking, surface it as a warning BEFORE responding:
> "⚠️ Wiki decision: **[Title]** (status: rejected) — [summary]. Do you want to proceed anyway?"

### Step 3 — Read relevant pages
From the candidates identified in Step 1, read the most relevant pages (up to 4).
Prefer `concepts/` and `entities/` pages that directly match the topic.

**Note for Windows users**: Do NOT use the Grep tool — it returns empty results on Windows.
Always use Bash `grep -r` for full-text search.

## Auto-ingest

If the session-start system-reminder contains `NEW_FILES_DETECTED`, announce how many
files are pending and list them. Ask for confirmation before ingesting. Never ingest without
explicit user approval.

Once confirmed:
- `.pdf` files → follow `commands/ingest-pdf.md` (chunked 20-page read loop)
- All other files → spawn one `wiki-ingest` agent per file (run in parallel)

After all agents finish:
1. Read all `.raw/.manifest-*.json` sidecars
2. Update `wiki/index.md` — append new entries under the correct type/domain section, alphabetically. Update the Stats line.
3. Update `wiki/log.md` — prepend a new entry (newest-first):
   ```
   ## YYYY-MM-DD — Ingest: <filename>
   **Type**: ingest  **Source**: .raw/<filename>  **Pages created**: N
   - list of pages
   **Pages updated**: list or "none"
   ```
4. Delete each sidecar after reading it.
```

---

## 5. Add the global `/wiki-search` command

This gives you a `/wiki-search <query>` command available in **every project**.

Create `~/.claude/commands/wiki-search.md`:

```markdown
---
description: Search the personal wiki knowledge graph. Usage: /wiki-search <query>
---

Search the wiki for: $ARGUMENTS

1. Read `<REPO_PATH>/wiki/index.md`. Scan all titles and section headers for matches.
   Collect candidate page paths grouped by section.

2. Check decisions first:
   grep -ri "$ARGUMENTS" "<REPO_PATH>/wiki/decisions" --include="*.md" -l
   Read every matched decision file. Note status: (approved / rejected / superseded).

3. Read the top matching pages (up to 5, decisions always included). If the index scan
   found fewer than 3 matches, also run:
   grep -ri "$ARGUMENTS" "<REPO_PATH>/wiki" --include="*.md" -l
   Exclude index.md, log.md, hot.md, _index.md from results.

4. Report:

---
**Wiki results for "$ARGUMENTS"**

### Decisions
- **[Title](path)** — `status: rejected` — One-line summary.

### Concepts
- **[Title](path)** — One-line summary.

### Entities / Systems / People
- **[Title](path)** — One-line summary.

### Sources
- **[Title](path)** — One-line summary.

*(N pages matched)*
---

If nothing matches: "No wiki pages found for '$ARGUMENTS'. Consider ingesting a source
or creating a decision page."

Do NOT use the Grep tool on Windows — use Bash grep -r.
```

Replace `<REPO_PATH>` with the same absolute path used in step 4.

---

## Daily workflow

### Ingesting a document

1. Drop any file (PDF, Markdown, TXT, DOCX) into `.raw/`
2. Start or resume a Claude Code session in the knowledge repo
3. Claude detects the file and asks for confirmation
4. After confirmation, the `wiki-ingest` agent runs, creates pages, extracts entities and concepts, and detects contradictions with existing pages
5. `wiki/index.md` and `wiki/log.md` are updated automatically

To ingest mid-session: say `ingest new files in .raw/`

### Searching from any project

```
/wiki-search CHG flight plan
/wiki-search kafka
/wiki-search authentication decisions
```

Claude reads `wiki/index.md` first, navigates to matching pages, and surfaces any blocking decisions before showing results.

### Recording a decision

In the knowledge repo, run `/save decision <name>` or describe it naturally:

> "We decided not to implement CHG messages because the downstream system doesn't support them"

Claude creates `wiki/decisions/<name>.md` with `status: rejected` and the reasoning. From that point on, asking Claude to implement CHG in any project will trigger the decisions gate and surface the warning.

### Asking questions across projects

Just ask naturally in any project. Claude checks the wiki automatically:

```
How does our system handle RPL imports?
What database does the notification service use?
Who owns the billing module?
```

Claude reads `wiki/index.md`, navigates to relevant pages, and answers from your actual knowledge rather than general knowledge.

---

## Team setup

### Teammate onboarding (3 steps)

```bash
git clone git@github.com:YOUR_ORG/my-knowledge
cd my-knowledge
bash bin/install-tool.sh   # pulls tool files from public autograph repo
bash bin/setup.sh          # checks Node.js, git config
claude .                   # open in Claude Code
```

Each teammate also needs to complete steps 4 and 5 above (global CLAUDE.md and `/wiki-search` command) on their own machine.

### Keeping knowledge in sync

```bash
git pull   # get teammates' ingested pages (happens automatically at session start)
git push   # share your ingested pages (happens automatically after every write)
```

### Sharing source files

Source documents in `.raw/` are gitignored (PDFs can be large). Share them separately:

- Google Drive / SharePoint — teammates download to their `.raw/`
- S3: `aws s3 sync .raw/ s3://your-bucket/knowledge-raw/`

The wiki pages (summaries, extractions, cross-references) are the shareable artifact — they live in `wiki/` and sync via git.

---

## What gets committed

| Content | Committed | Why |
|---------|:---------:|-----|
| `wiki/`, `team/`, `work/`, `brain/` | Yes | Shared knowledge graph |
| `.raw/.manifest.json` | Yes | Tracks what's been ingested |
| `.raw/*.pdf` and other source files | No | Too large — share via Drive/S3 |
| `agents/`, `commands/`, `hooks/` | No | Tool files — installed, not committed |

---

## Updating the tool

When autograph ships new features:

```bash
bash bin/update-tool.sh          # update to latest main
bash bin/update-tool.sh v1.2.0   # pin to a specific release
```

Your `domains.json`, `wiki/`, `brain/`, `work/` are never touched.

---

## Troubleshooting

**Auto-ingest not triggering**
Make sure you start a fresh Claude session. The SessionStart hook runs once per session on open/resume.

**Hooks not running**
Verify `.claude/settings.json` exists in the project root. In Claude Code: Settings → Hooks.

**`/wiki-search` not found**
Confirm `~/.claude/commands/wiki-search.md` exists and contains the correct `<REPO_PATH>`.

**Claude not checking the wiki in other projects**
Confirm `~/.claude/CLAUDE.md` exists and contains the wiki lookup protocol with the correct `<REPO_PATH>`.

**Git conflicts on `wiki/hot.md`**
Hot cache is per-session. Accept the newer version:
```bash
git checkout --theirs wiki/hot.md && git add wiki/hot.md && git commit
```

**Node.js not found in hooks**
Add Node.js to your PATH, or use the full path in `.claude/settings.json` hooks.

**Grep tool returns empty results (Windows)**
This is a known issue on Windows. The global CLAUDE.md and `/wiki-search` command are pre-configured to use `Bash grep -r` instead. If you add custom commands or prompts, always use `Bash grep -r`, never the Grep tool.
