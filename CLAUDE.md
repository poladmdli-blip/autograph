# wiki-graph — Aviation Knowledge Base

Combined LLM wiki engine + team brain for aviation systems development. Ingests ICAO standards, app manuals, and technical documents into a structured knowledge graph. Tracks dev tasks, team decisions, and implementation status. Claude can pull context on demand from any project.

## Skills

| Trigger | What happens |
|---------|-------------|
| `ingest [file or url]` | Ingest a document or URL into the wiki |
| `ingest all` | Batch-ingest all files in `.raw/` not yet processed |
| `query: [question]` | Answer from wiki with citations to specific pages |
| `query deep: [question]` | Deep query — reads all related pages |
| `lint the wiki` | Health check — orphans, dead links, frontmatter gaps |
| `/wiki` | Check vault state and stats |
| `/save [type] [name]` | File current conversation as a wiki note |
| `/autoresearch [topic]` | Autonomous research loop |
| `/dump` | Freeform capture — auto-routed to correct location |

## Vault Structure

```
.raw/              Source documents — immutable, drop files here for ingestion
wiki/              Knowledge graph
  sources/         One summary page per ingested document
  entities/        Organizations, standards bodies, aircraft, people
  concepts/        Procedures, technical ideas, regulations
  standards/       ICAO annexes, docs, regulatory requirements
  decisions/       Team architectural and technical decisions
  meta/            Lint reports, dashboard
work/              Dev tasks and projects
  active/          Current tasks (keep to 1-5 files)
  archive/YYYY/    Completed tasks by year
brain/             Persistent operational context for Claude
  North Star.md    Current goals and priorities (read every session)
  Key Decisions.md Significant decisions index
  Patterns.md      Recurring patterns
  Gotchas.md       Known issues and lessons
  Memories.md      Index of brain topics
_templates/        Note templates (source, entity, concept, standard, decision, task)
_attachments/      PDFs and images referenced by wiki pages
```

## Session Workflow

### Starting a Session

The `SessionStart` hook automatically loads:
- `wiki/hot.md` — recent wiki activity (~500 words)
- `brain/North Star.md` — current goals
- `work/Index.md` (first 60 lines) — active tasks

Context is already available. No manual file reads needed.

### Ingesting Sources

1. Drop files into `.raw/`
2. Say `ingest [filename]` or `ingest all`
3. For batches of 5+, parallel wiki-ingest agents are dispatched
4. Result: typed wiki pages created and cross-referenced

### Querying

Use `query: [question]` for standard questions with citations.
Use `query deep: [question]` when you need comprehensive coverage.

Claude reads: hot.md → index.md → relevant pages → answers with `[[wikilinks]]` to sources.

### Logging Decisions

When the team makes a decision:
1. Use `/save decision [name]` or `/dump` — auto-creates the record
2. Entry appears in `wiki/decisions/` + `brain/Key Decisions.md`
3. Link from the task or standard that prompted it

### Ending a Session

The `Stop` hook prompts to:
1. Update `wiki/hot.md` (format: Last Updated / Key Recent Facts / Recent Changes / Active Threads)
2. Update `brain/Key Decisions.md` if decisions were made
3. Update `work/Index.md` if task status changed

## Cross-Project Access

To pull context from this vault in another project, add to that project's CLAUDE.md:

```markdown
## Knowledge Base
Path: C:/Users/polad/wiki-graph

When you need aviation or project context not in this codebase:
1. Read wiki/hot.md — recent activity (~500 words)
2. Read brain/North Star.md — current priorities
3. Read wiki/index.md — full knowledge map
4. Read wiki/standards/_index.md — ICAO/regulatory context
5. Query specific pages as needed

Do NOT read the wiki for general coding questions.
```

## Note Types & Frontmatter

All schemas are in `vault-manifest.json`. Required fields per type:

| Type | Location | Extra required fields |
|------|----------|----------------------|
| source | `wiki/sources/` | source_type, author, date_published, confidence |
| entity | `wiki/entities/` | entity_type, role, first_mentioned |
| concept | `wiki/concepts/` | complexity, domain |
| standard | `wiki/standards/` | standard_id, icao_annex, effective_date, domain |
| decision | `wiki/decisions/` | decision_date, status, decided_by |
| task | `work/active/` | status, priority, quarter |

All pages also require: `type`, `title`, `created`, `updated`, `tags`, `status`, `related`.

## Linking Rules

- Every note must link to at least one existing note (orphans are bugs)
- Standards link to → concepts they define, entities they govern
- Decisions link to → tasks that prompted them, standards they interpret
- Concepts link to → standards that define them, related concepts
- Tasks link to → standards being implemented, decisions that shaped them

## QMD Semantic Search (when installed)

If QMD is configured, use these tools before grepping:
1. `mcp__qmd__query` — semantic search across all vault pages
2. `mcp__qmd__get` — fetch a specific page
3. `mcp__qmd__multi_get` — fetch multiple pages
4. `mcp__qmd__status` — check index status

Fall back to Grep/Glob only when QMD is unavailable.

QMD index name: `wiki-graph` (from `vault-manifest.json`).
On a fresh clone: `node --experimental-strip-types .claude/scripts/qmd-bootstrap.ts` (requires QMD installed).

## Rules

- `.raw/` files are immutable — never modify source documents
- Always use YAML frontmatter with required fields
- After creating a note, add wikilinks before finishing (orphans are bugs)
- Use `git mv` when renaming or moving notes — never delete without confirmation
- Contradictions between standards must be flagged with `> [!contradiction]` callouts, not silently resolved
