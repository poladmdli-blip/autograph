---
description: Freeform capture — dump anything (decision, task, note, finding) and it gets routed to the right place.
---

The user is dumping unstructured content. Classify it and route it to the correct vault location.

Classification rules:
- "we decided..." / "decision:" → `wiki/decisions/` + update `brain/Key Decisions.md`
- "task:" / "implement..." / "we need to..." → `work/active/` with task template
- ICAO standard / regulation reference → `wiki/standards/` if it doesn't exist yet
- Technical concept or procedure → `wiki/concepts/`
- Meeting notes / discussion → think about whether it contains decisions or tasks, extract those first
- General finding or insight → `wiki/sources/` as a short source page

Steps:
1. Classify the content (can be multiple types).
2. For each classified item: check if a matching page already exists.
3. Create or update the relevant pages.
4. Add wikilinks between the new content and existing related pages.
5. Update `wiki/log.md` with what was captured.
6. Report what was created/updated and where.

If the content is ambiguous, ask one clarifying question before routing.
