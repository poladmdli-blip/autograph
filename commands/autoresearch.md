---
description: Autonomous research loop — search, fetch, synthesize, and file wiki pages on a topic.
---

Run an autonomous research loop on the given topic.

Steps:
1. Read `wiki/hot.md` and `wiki/index.md` to understand what is already known.
2. Identify 3-5 specific questions that would meaningfully extend the wiki on this topic.
3. For each question:
   a. Search the web for authoritative sources (prefer ICAO docs, aviation authorities, academic papers).
   b. Fetch and clean the source content.
   c. Extract key facts, entities, concepts, and standards.
   d. File new wiki pages or update existing ones.
4. After all rounds: do a cross-reference pass between newly created pages.
5. Update `wiki/index.md`, `wiki/log.md`, and `wiki/hot.md`.
6. Report: "Researched [topic]. Created X pages, updated Y. Key findings: ..."

If no topic is given, scan `wiki/concepts/` and `wiki/standards/` for pages with status `seed` and no outbound links — these are the knowledge gaps to fill first.

Focus on: ICAO standards, aviation regulations, technical procedures, safety requirements.
