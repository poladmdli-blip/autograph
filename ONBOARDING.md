# Onboarding — wiki-graph

Team knowledge base for aviation systems development. Combines source ingestion (ICAO, AIXM, FIXM, NOTAM, FF-ICE, Weather) with team workflow tracking.

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Claude Code** — [claude.ai/code](https://claude.ai/code) (desktop app or CLI)
- **Git** — any version
- **Obsidian** (optional) — browse the wiki visually at [obsidian.md](https://obsidian.md)

## Setup (one time)

```bash
# 1. Clone the repo
git clone <repo-url> wiki-graph
cd wiki-graph

# 2. Run setup
bash bin/setup.sh

# 3. Open in Claude Code
claude .
```

That's it. No npm install, no Python env, no database to configure.

## Daily Workflow

### Ingesting new sources

1. Drop any file (PDF, markdown, txt, docx) into the `.raw/` folder
2. Start or resume a Claude Code session in this folder
3. Claude automatically detects new files and ingests them — no commands needed
4. Wiki pages are created, cross-referenced, and committed to git

To ingest mid-session without restarting, say: `ingest new files in .raw/`

### Asking questions

```
query: What are the ICAO requirements for ADS-B equipage?
query deep: How does FIXM relate to FF-ICE flight planning?
What did the team decide about [topic]?
```

### Logging a decision

Say `/dump` or just describe the decision:
> "We decided to use ASTERIX Cat 21 for ADS-B data because it's required by ICAO Annex 10"

Claude creates the decision record, links it to the relevant standard, and adds it to `brain/Key Decisions.md`.

### Adding a team member

Drop a short bio or profile text into `.raw/` — Claude creates the member page in `team/members/` automatically.

### Updating tasks

Say `/dump` or describe the task update. Claude routes it to `work/active/`.

### Getting latest knowledge from teammates

```bash
git pull
```
Or it happens automatically at session start.

### Pushing your ingested knowledge to teammates

Happens automatically after every write (PostToolUse hook commits and the Stop hook reminds you to push).

```bash
git push
```

## Optional: Real-time file watcher

Run this in a separate terminal to queue files for ingestion as soon as they appear in `.raw/`:

```bash
node bin/watch-raw.mjs
```

Files are queued immediately and ingested at your next Claude session start.

## Folder Structure

```
.raw/          Drop source files here (NOT committed to git — share via Drive)
wiki/          Knowledge graph — committed and shared via git
  standards/   Aviation standards (auto-subfoldered by domain)
  concepts/    Technical concepts and procedures
  entities/    Organizations, tools, aircraft
  decisions/   Team decisions with reasoning
  sources/     Ingested document summaries
team/          Team knowledge — committed and shared
  members/     One page per team member
  plans/       Sprint and quarterly plans
  goals/       Team goals and OKRs
work/          Dev tasks — committed and shared
brain/         Operational context for Claude
```

## What Gets Committed to Git

| Content | Git | Why |
|---------|-----|-----|
| `wiki/` pages | ✓ | The shared knowledge graph |
| `team/` pages | ✓ | Team visibility |
| `work/` tasks | ✓ | Shared task tracking |
| `brain/` context | ✓ | Shared operational memory |
| `.raw/.manifest.json` | ✓ | Tracks what's been ingested |
| `.raw/*.pdf` and other source files | ✗ | Too large — share via Drive/S3 |

## Sharing Source Files

Source documents in `.raw/` are gitignored. Share them with teammates via:
- Google Drive / SharePoint — drop the PDFs there, teammates download to their `.raw/`
- S3 bucket — `aws s3 sync .raw/ s3://your-bucket/wiki-graph-raw/`
- Internal file server

The wiki pages (summaries, extractions, cross-references) are the shareable artifacts — those are in git.

## Troubleshooting

**Auto-ingest not triggering**: Make sure you start a fresh Claude session (close and reopen). The SessionStart hook runs once per session.

**Hooks not running**: Verify `.claude/settings.json` exists in the project root. In Claude Code, check Settings → Hooks.

**Git conflicts on `wiki/hot.md`**: Hot cache is per-session. If two teammates edited it, accept the newer version: `git checkout --theirs wiki/hot.md && git add wiki/hot.md && git commit`.

**Node.js not found in hooks**: Add Node.js to your PATH or use the full path in hooks.
