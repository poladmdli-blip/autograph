---
description: Bootstrap or check the wiki-graph vault. Checks vault state and runs setup workflow.
---

Check vault state:

1. Confirm `wiki/index.md` exists. If not, scaffold the wiki structure from scratch.
2. Report current stats: number of pages per type (sources, entities, concepts, standards, decisions).
3. Check if `hooks/hooks.json` is registered in Claude Code settings.
4. Check if QMD is available (`qmd --version 2>/dev/null || echo "not installed"`).
5. Show the top 5 most recently updated wiki pages.
6. Show active tasks from `work/Index.md`.

Then ask: "Ready to ingest sources? Drop files into `.raw/` and say 'ingest all', or paste a URL to start."

If vault is already populated, skip to showing recent activity and offering to continue.
