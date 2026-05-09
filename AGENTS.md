# wiki-graph — Multi-Agent Guide

## Agent Discovery

Skills are in `commands/` and `agents/`. Supported agents: Claude Code, Codex CLI, Gemini CLI.

## Dispatch Agents

| Agent | File | Invoked when |
|-------|------|-------------|
| wiki-ingest | `agents/wiki-ingest.md` | Batch ingestion (5+ sources) |
| wiki-lint | `agents/wiki-lint.md` | "lint the wiki", "health check" |

## Commands (Slash Commands)

| Command | File | Purpose |
|---------|------|---------|
| `/wiki` | `commands/wiki.md` | Check vault state |
| `/save` | `commands/save.md` | File conversation as wiki note |
| `/autoresearch` | `commands/autoresearch.md` | Autonomous research loop |
| `/dump` | `commands/dump.md` | Freeform capture, auto-routed |

## Bootstrap Flow

1. Open this directory in Claude Code
2. Say `/wiki` to check vault state
3. Drop source files into `.raw/`
4. Say `ingest all` to begin building the knowledge graph

## Cross-Platform

For Codex CLI or other agents: read `CLAUDE.md` for the full operating manual.
Commands work as plain prompts (without `/` prefix) on non-Claude Code agents.
