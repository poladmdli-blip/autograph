# autograph

**Drop documents. Get a knowledge graph.**

autograph is a [Claude Code](https://claude.ai/code) plugin that turns any folder of documents into a queryable, structured knowledge graph — automatically. Drop files into `.raw/`, start a Claude session, and autograph ingests them, extracts entities and concepts, cross-references everything, and builds a wiki you can query from any project.

No commands. No configuration. No server.

---

## What it does

- **Auto-ingests** — drop files into `.raw/`, start Claude Code, ingestion happens without typing anything
- **Content-driven structure** — no predefined folders. Claude reads the file, detects the domain via `domains.json`, creates the right subfolders automatically
- **Knowledge graph** — typed pages (source, entity, concept, standard, decision) with wikilinks, `_index.md` files, and contradiction detection
- **Team brain** — tracks decisions, tasks, goals, and team context alongside the knowledge
- **Git-native sharing** — knowledge syncs across teammates via git. No server, no subscription
- **Cross-project access** — reference this knowledge base from any other Claude Code project via CLAUDE.md

---

## Quick start

```bash
# 1. Clone or download autograph
git clone https://github.com/YOUR_ORG/autograph my-knowledge
cd my-knowledge

# 2. Copy the domain config for your domain
cp domains.example.json domains.json   # aviation example
# OR
cp domains.default.json domains.json   # generic minimal

# 3. Edit domains.json to match your domain (or use the example as-is)

# 4. Open in Claude Code
claude .

# 5. Drop documents
# Copy any PDFs, markdown files, or docs into .raw/
# Then start a new Claude session — ingestion happens automatically
```

---

## How it works

```
You drop a file into .raw/
          ↓
SessionStart hook runs check-new-files.mjs
  → detects files not yet in .raw/.manifest.json
          ↓
Claude reads domains.json
  → detects domain from file content keywords
          ↓
wiki pages created automatically:
  wiki/[type]/[domain]/[slug].md
  wiki/entities/[category]/[name].md
  wiki/concepts/[domain]/[concept].md
          ↓
wiki/index.md, wiki/log.md, wiki/hot.md updated
Changes committed to git
```

---

## Domain configuration

Domain detection is fully configurable. Edit `domains.json`:

```json
{
  "domains": [
    {
      "id": "regulations",
      "label": "Regulatory Standards",
      "folder": "wiki/standards/regulations",
      "keywords": ["regulation", "standard", "compliance", "requirement"]
    },
    {
      "id": "architecture",
      "label": "System Architecture",
      "folder": "wiki/concepts/architecture",
      "keywords": ["architecture", "API", "database", "microservice"]
    }
  ],
  "type_folders": {
    "standard":  "wiki/standards",
    "concept":   "wiki/concepts",
    "entity":    "wiki/entities",
    "source":    "wiki/sources",
    "decision":  "wiki/decisions",
    "person":    "team/members",
    "plan":      "team/plans",
    "task":      "work/active"
  }
}
```

See `domains.example.json` for a full aviation example (ICAO, AIXM, FIXM, NOTAM, FF-ICE, Weather).

---

## For teams: separate tool from knowledge

Keep the tool public, keep your knowledge private:

```
autograph/         ← public tool (this repo) — clone and install
team-knowledge/    ← private knowledge repo — your wiki, decisions, tasks
```

See [KNOWLEDGE_REPO.md](KNOWLEDGE_REPO.md) for the full separation pattern and setup guide.

---

## Querying the knowledge base

```
query: What does [standard] say about [topic]?
query deep: How does [concept A] relate to [concept B]?
lint the wiki
/save decision Use X because Y
/dump  →  paste anything, it gets routed automatically
/autoresearch [topic]  →  autonomous web research loop
```

---

## File watcher (optional)

Run in a separate terminal to queue files for ingestion as they appear:

```bash
node bin/watch-raw.mjs
```

---

## Cross-project access

Add to any other project's CLAUDE.md:

```markdown
## Knowledge Base
Path: /path/to/my-knowledge

When you need domain context not in this codebase:
1. Read wiki/hot.md — recent activity (~500 words)
2. Read wiki/index.md — full knowledge map
3. Read specific domain pages as needed
```

---

## Optional: semantic search (QMD)

Install [QMD](https://github.com/tobi/qmd) for semantic search across all wiki pages:

```bash
node --experimental-strip-types .claude/scripts/qmd-bootstrap.ts
```

Claude will use `mcp__qmd__query` tools instead of grep when available.

---

## License

MIT
