# autograph

Claude Code plugin that turns documents into a queryable knowledge graph. Drop files into `.raw/`, configure domains in `domains.json`, and Claude handles ingestion, structuring, and cross-referencing automatically.

## This repo vs your knowledge repo

**autograph** (this repo) provides:
- `agents/` — wiki-ingest, wiki-lint
- `commands/` — /wiki, /save, /autoresearch, /dump
- `hooks/` — hooks.json reference
- `_templates/` — source, entity, concept, standard, decision, task, team-member, plan
- `bin/` — check-new-files.mjs, watch-raw.mjs, setup.sh

**Your knowledge repo** (separate private repo) provides:
- `domains.json` — your domain config
- `wiki/`, `brain/`, `team/`, `work/` — your actual knowledge
- `.claude/settings.json` — your hooks (references tool scripts)

See [KNOWLEDGE_REPO.md](KNOWLEDGE_REPO.md) for setup instructions.

## Key files

| File | Purpose |
|------|---------|
| `domains.example.json` | Aviation domain config example |
| `domains.default.json` | Generic minimal domain config |
| `agents/wiki-ingest.md` | Ingest agent — reads `domains.json` for domain detection |
| `agents/wiki-lint.md` | Lint agent — validates frontmatter, links, orphans |
| `bin/check-new-files.mjs` | Detects new files in `.raw/` vs manifest |
| `bin/watch-raw.mjs` | Background file watcher — writes to `.raw/.queue` |
| `bin/init-knowledge.sh` | Creates a new knowledge repo from this template |

## Ingest agent behavior

The `wiki-ingest` agent:
1. Reads `domains.json` — domain detection is fully configurable, no hardcoded keywords
2. Classifies document type from content (standard, concept, decision, person, plan, source)
3. Creates folders dynamically — `wiki/[type]/[domain]/[slug].md`
4. Extracts entities → `wiki/entities/[category]/[name].md`
5. Detects contradictions — adds `[!contradiction]` callouts
6. Updates `.raw/.manifest.json`

## Vault structure (in your knowledge repo)

```
.raw/              Source documents (gitignored in knowledge repo)
wiki/              Knowledge graph
  [type]/[domain]/ Auto-created from domains.json
work/              Dev tasks
team/              Team profiles, plans, goals
brain/             Operational context for Claude
```

## Rules

- `domains.json` controls all domain detection — never hardcode domain keywords
- `.raw/` files are immutable — only `.manifest.json` and `.queue` can be modified
- Every note must link to at least one existing note
- Contradictions between sources: flag with `[!contradiction]`, never silently resolve
