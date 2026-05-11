# autograph — Setup Guide

Turn documents into a queryable knowledge graph. Drop files into your raw folder, and Claude ingests, structures, and cross-references them automatically — across every project you work in.

---

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Claude Code** — [claude.ai/code](https://claude.ai/code) (desktop app or CLI)

---

## Install

**Step 1 — Install the plugin** (inside Claude Code chat):

```
/plugin install YOUR_USERNAME/wiki-graph
```

This gives you `/autograph:save`, `/autograph:dump`, `/autograph:wrap`, `/autograph:autoresearch`, and the `autograph:wiki-ingest` agent — available across every project.

**Step 2 — Run setup** (in any terminal):

```bash
autograph-setup        # Mac / Linux
autograph-setup.cmd    # Windows
```

You'll be asked two questions:

```
Wiki output path (where pages will be created) [~/knowledge]:
Raw files path (where you drop source documents) [~/knowledge/.raw]:
```

Press Enter to accept the defaults, or type your own paths. Setup then:

1. Creates the wiki directory structure at your chosen paths
2. Patches `~/.claude/CLAUDE.md` with the wiki lookup protocol and ingest instructions
3. Creates `~/.claude/commands/wiki-search.md` (path-aware, so it's generated — not delivered via plugin)
4. Patches `~/.claude/settings.json` with lifecycle hooks (SessionStart, PostCompact, PostToolUse, Stop)

You can re-run `autograph-setup` at any time to change paths. It updates in place.

---

## Configure domains

Open `<wiki_path>/domains.json`. This is the **only file you must customize** — it controls how documents are classified into your wiki structure. Claude reads it during every ingest; no keywords are hardcoded.

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

See `domains.example.json` for a full aviation example.

---

## Daily workflow

### Ingesting a document

1. Drop any file (PDF, Markdown, TXT, DOCX) into your raw folder
2. Open or resume any Claude Code session
3. Claude detects the file and asks for confirmation
4. After confirmation, the `autograph:wiki-ingest` agent runs per file — creates pages, extracts entities and concepts, detects contradictions with existing knowledge
5. `wiki/index.md` and `wiki/log.md` are updated automatically

To ingest mid-session: say `ingest new files in raw`

### Searching from any project

```
/wiki-search authentication decisions
/wiki-search kafka
/wiki-search payment flow
```

Claude reads `wiki/index.md` first, navigates to matching pages, and surfaces any blocking decisions before showing results.

### Recording a decision

Say it naturally, or run `/save decision <name>`:

> "We decided not to use GraphQL because the mobile team can't support it yet"

Claude creates `wiki/decisions/<name>.md` with `status: rejected` and the reasoning. From that point on, asking Claude to implement GraphQL in any project will trigger the decisions gate.

### Asking questions across projects

Just ask naturally in any project — Claude checks your wiki automatically:

```
How does our system handle auth tokens?
What database does the notification service use?
Who owns the billing module?
```

---

## Team setup

Each teammate installs the plugin and runs `autograph-setup`, pointing `wiki_path` to a shared git clone of the knowledge folder:

```bash
# Install plugin (each teammate, once)
/plugin install autograph@YOUR_USERNAME

# Run setup pointing to shared wiki
autograph-setup
# → Wiki output path: ~/knowledge   (git clone of shared knowledge repo)
```

### Keeping knowledge in sync

```bash
git pull   # get teammates' ingested pages (happens automatically at session start)
git push   # share your ingested pages (happens automatically after every write)
```

### Sharing source files

Source documents in the raw folder are gitignored. Share them separately:

- Google Drive / SharePoint — teammates download to their raw folder
- S3: `aws s3 sync ~/knowledge/.raw s3://your-bucket/knowledge-raw/`

---

## What gets committed (in the wiki folder)

| Content | Committed | Why |
|---------|:---------:|-----|
| `wiki/`, `team/`, `work/`, `brain/` | Yes | Shared knowledge graph |
| `.raw/.manifest.json` | Yes | Tracks what's been ingested |
| `.raw/*.pdf` and other source files | No | Too large — share via Drive/S3 |

---

## Updating the plugin

```
/plugin update autograph
```

Your wiki folder, `domains.json`, and `~/.claude/CLAUDE.md` are never touched by updates. Re-run `autograph-setup` only if you want to change your wiki or raw paths.

---

## Troubleshooting

**`autograph-setup` not found after plugin install**
The plugin's `bin/` is added to your PATH by Claude Code. If the terminal doesn't see it, open a new terminal window or run `hash -r` (Mac/Linux).

**Auto-ingest not triggering**
Start a fresh Claude Code session — the SessionStart hook runs once per session on open or resume.

**`/wiki-search` not found**
Confirm `~/.claude/commands/wiki-search.md` exists. Re-run `autograph-setup` to recreate it.

**Claude not checking the wiki in other projects**
Confirm `~/.claude/CLAUDE.md` contains the `<!-- autograph:begin -->` block. Re-run `autograph-setup` to re-patch it.

**Git conflicts on `wiki/hot.md`**
Hot cache is per-session. Accept the newer version:
```bash
git checkout --theirs wiki/hot.md && git add wiki/hot.md && git commit
```

**Grep tool returns empty results (Windows)**
Known issue on Windows. The CLAUDE.md block written by `autograph-setup` is pre-configured to use `Bash grep -r` instead. If you add custom commands, always use `Bash grep -r`, never the Grep tool.

---

## Alternative: clone locally

For contributors or users who want to inspect and modify autograph directly:

```bash
git clone https://github.com/YOUR_USERNAME/autograph
cd autograph
node bin/setup.js
```

`node bin/setup.js` is a shim that calls `bin/autograph-setup` — identical behavior to the plugin path.
