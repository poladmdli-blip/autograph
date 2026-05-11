# autograph

Claude Code plugin that turns documents into a queryable knowledge graph. Drop files into `.raw/`, configure domains in `domains.json`, and Claude handles ingestion, structuring, and cross-referencing automatically.

## Plugin structure

```
.claude-plugin/
  plugin.json          Plugin manifest — name, version, description
agents/
  wiki-ingest.md       Ingest agent (autograph:wiki-ingest) — reads paths from invocation prompt
  wiki-lint.md         Lint agent — validates frontmatter, links, orphans
commands/
  wiki.md              /autograph:wiki — open or search wiki
  save.md              /autograph:save — save a decision, concept, or note
  dump.md              /autograph:dump — quick capture, routes automatically
  autoresearch.md      /autograph:autoresearch — deep research across wiki
  wrap.md              /autograph:wrap — intelligent session summary
  ingest-pdf.md        /autograph:ingest-pdf — chunked PDF ingestion
bin/
  autograph-setup      Setup executable (Mac/Linux) — patches ~/.claude on first run
  autograph-setup.cmd  Setup executable (Windows)
  setup.js             Shim → delegates to autograph-setup
  check-new-files.mjs  Detects new files in .raw/ vs manifest (runs at SessionStart)
  config.mjs           Resolves wiki_path/raw_path from autograph.config.json
  update-hot-cache.mjs Updates wiki/hot.md at session end (runs at Stop)
_templates/            Note templates: source, entity, concept, standard, decision, task, plan

## Knowledge folder structure (created by autograph-setup)

```
wiki/
  concepts/    domain knowledge
  decisions/   decisions log
  entities/
    people/    team members (no separate team/ folder)
  sources/     ingested documents
  standards/   specs and regulations
  meta/        dashboards, goals
brain/         north star, patterns, gotchas
work/
  active/      tasks and plans
  archive/     completed work
.raw/          ingest inbox
```
```

## User journey

1. `/plugin install autograph@YOUR_USERNAME` — install in Claude Code
2. `autograph-setup` — run once in terminal; patches `~/.claude/CLAUDE.md` and `~/.claude/settings.json`
3. Edit `<wiki_path>/domains.json` — configure domain keywords
4. Drop files into raw folder → Claude detects and ingests automatically

## Ingest agent behavior

`autograph:wiki-ingest` receives `wiki_path`, `raw_path`, and `source_file` in its invocation prompt (injected by the CLAUDE.md block that `autograph-setup` writes). It does not read `autograph.config.json` — paths are always passed explicitly by the caller.

1. Reads `{wiki_path}/domains.json` — all domain detection is configurable
2. Classifies document type (standard, concept, decision, person, plan, source)
3. Creates `wiki/[type]/[domain]/[slug].md`
4. Extracts entities → `wiki/entities/[category]/[name].md`
5. Detects contradictions — adds `[!contradiction]` callouts
6. Writes sidecar `.raw/.manifest-[slug].json` — never touches `.manifest.json` directly

## Rules

- `domains.json` controls all domain detection — never hardcode domain keywords in agents
- `.raw/` files are immutable — only `.manifest-*.json` sidecars and `.queue` can be written
- Every wiki note must link to at least one existing note
- Contradictions between sources: flag with `[!contradiction]`, never silently resolve
- Agent paths always come from the invocation prompt, never from filesystem config lookup
