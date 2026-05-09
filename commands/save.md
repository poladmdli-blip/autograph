---
description: Save the current conversation or a specific insight into the wiki vault as a structured note.
---

Analyze this conversation and save the most valuable content into the wiki.

Usage:
- `/save` — analyze the full conversation and save the most valuable content
- `/save [name]` — save with a specific note title
- `/save decision [name]` — explicitly save as a decision record in `wiki/decisions/`
- `/save concept [name]` — explicitly save as a concept page in `wiki/concepts/`
- `/save standard [name]` — explicitly save as a standard page in `wiki/standards/`
- `/save task [name]` — save as a task in `work/active/`

Steps:
1. Determine the best note type and location based on content.
2. Check if a page with the same name already exists. If yes, offer to update instead.
3. Create the note with proper frontmatter from `vault-manifest.json` schemas.
4. Add wikilinks to at least one existing wiki page.
5. Update `wiki/index.md` and `wiki/log.md`.
6. If it's a decision, also update `brain/Key Decisions.md`.
7. Update `wiki/hot.md` with a brief note about what was saved.
