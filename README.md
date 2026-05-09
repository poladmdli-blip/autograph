# wiki-graph

Aviation knowledge base combining source ingestion with team brain context.

Built by combining the best of [obsidian-mind](../obsidian-mind) (persistent team brain, work tracking, context injection) and [claude-obsidian](../claude-obsidian) (LLM wiki engine, source ingestion, entity extraction).

## What It Does

- **Ingest** ICAO standards, app manuals, dev docs, meeting notes → structured wiki pages
- **Extract** entities (standards bodies, aircraft), concepts (procedures), and standards (ICAO annexes) automatically
- **Track** dev tasks, team decisions, and implementation status
- **Inject** context on demand into any Claude session — from inside this vault or from any other project
- **Search** semantically across the entire knowledge graph (via QMD, optional)

## Quick Start

```bash
# 1. Open this directory in Claude Code
cd wiki-graph
claude

# 2. Check vault state
/wiki

# 3. Drop source files and ingest
# Drop ICAO docs, app manuals, meeting notes into .raw/
ingest all

# 4. Ask questions
query: What are the ICAO requirements for ADS-B equipage?

# 5. Log a team decision
/save decision Use ASTERIX Cat 21 for ADS-B data format
```

## Structure

```
.raw/           Drop source documents here (immutable)
wiki/           Auto-generated knowledge graph
  sources/      One page per ingested document
  entities/     Organizations, standards bodies, aircraft
  concepts/     Procedures, technical ideas
  standards/    ICAO annexes and regulatory requirements
  decisions/    Team decisions with reasoning
work/           Dev tasks (active → archive when done)
brain/          Persistent context for Claude (North Star, decisions, patterns)
_templates/     Note templates for each type
commands/       Slash commands
agents/         Dispatch agents for heavy operations
hooks/          Session lifecycle hooks
```

## Cross-Project Access

Add to any other project's CLAUDE.md:

```markdown
## Knowledge Base
Path: C:/Users/polad/wiki-graph

When you need aviation or project context:
1. Read wiki/hot.md first (recent activity, ~500 words)
2. Read wiki/index.md for the full knowledge map
3. Read wiki/standards/_index.md for ICAO context
```

## Optional: QMD Semantic Search

QMD enables "what did we decide about X?" queries across all wiki pages without reading them manually.

```bash
# Install QMD
npm install -g qmd-cli   # or follow https://github.com/tobi/qmd

# Bootstrap the index (run once)
node --experimental-strip-types .claude/scripts/qmd-bootstrap.ts
```

Index name: `wiki-graph` (configured in `vault-manifest.json`).
