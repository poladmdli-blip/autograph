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
- `/save person [name]` — explicitly save as a team member profile in `team/members/`

Type routing rules (applied in Step 1):
- People, team members, colleagues → `wiki/entities/people/[name].md`
- Decisions, choices, "we decided" → `wiki/decisions/`
- Tasks, action items, "we need to" → `work/active/`
- Concepts, technical knowledge → `wiki/concepts/`
- Standards, regulations → `wiki/standards/`
- Everything else → `wiki/sources/`

Steps:
1. Determine the best note type and location using the routing rules above.
2. Check if a page with the same name already exists. If yes, offer to update instead.
3. Create the note with proper frontmatter from `vault-manifest.json` schemas.
4. Add wikilinks to at least one existing wiki page.
5. Update `wiki/index.md` and `wiki/log.md`.
6. If it's a decision, also update `brain/Key Decisions.md`.
7. Update `wiki/hot.md` with a brief note about what was saved.
