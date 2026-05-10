---
description: Ingest a large PDF from .raw/ into the wiki. Reads in 20-page chunks, accumulates findings across all chunks, then synthesizes into wiki pages.
---

Ingest the PDF file given as `$ARGUMENTS` (e.g. `/ingest-pdf .raw/doc-4444.pdf`).

If no argument is given, list all `.pdf` files in `.raw/` that are not yet in `.raw/.manifest.json` and ask which to ingest.

---

## Phase 1 — Setup

1. Read `domains.json` (fall back to `domains.default.json` if missing) — needed for domain detection.
2. Check `.raw/.manifest.json`. If the file is already ingested, report "Already ingested" and stop.
3. Derive the slug: lowercase filename without extension, spaces → hyphens (e.g. `doc-4444-pans-atm.pdf` → `doc-4444-pans-atm`).

---

## Phase 2 — Classify (pages 1–10)

Read the PDF `pages: "1-10"`.

Extract:
- **Title** — from cover page or first heading
- **Type** — standard / concept / source / decision / person / plan (same rules as wiki-ingest)
- **Domain** — match against `domains.json` keywords; note the top candidate
- **Structure** — is there a table of contents? Note the main sections and their page numbers if visible
- **Estimated length** — note the highest page number visible in footers/headers, or "unknown"

Store these as working variables for the next phases.

---

## Phase 3 — Chunk Extraction

Read the PDF in 20-page windows until you reach the end of the document. Start at page 11 (pages 1-10 already read). For each chunk:

```
pages: "11-30" → "31-50" → "51-70" → ...
```

Stop when a Read call returns fewer pages than requested (end of document reached).

For each chunk, accumulate into a running extraction log:

**Entities** (organizations, tools, systems, people, aircraft):
- Name, category, one-line description, first mention page

**Concepts** (technical procedures, ideas, rules):
- Name, domain, one-sentence summary, relevant section

**Key facts** (definitions, requirements, thresholds, dates):
- Brief statement of the fact, page number

**Cross-references** (references to other standards, docs, or wiki pages):
- Title or ID of referenced document

You do not need to be exhaustive per chunk — capture what is significant. Move on quickly.

---

## Phase 4 — Synthesize

After all chunks are read, consolidate the extraction log:

1. Deduplicate entities and concepts (same item may appear across chunks)
2. Merge related facts under the concept they belong to
3. Identify the 3–7 most important concepts this document introduces or defines
4. Identify the 2–5 most important entities

---

## Phase 5 — Write Wiki Pages

Follow the same conventions as `wiki-ingest`:

**Source summary page** — `[type_folder]/[domain]/[slug].md`
- Full frontmatter, summary of document purpose, key sections, notable facts
- Link to every concept and entity page created

**Concept pages** — one per major concept, at `wiki/concepts/[domain]/[slug].md`
- Do not create a concept page if one already exists — update it instead (add a `related` link)
- Only create pages for concepts central to this document, not every passing mention

**Entity pages** — one per significant entity, at `wiki/entities/[category]/[name].md`
- Same rule: update existing, create only if new

**`_index.md` updates** — every folder that received a new page needs its `_index.md` updated

---

## Phase 6 — Contradiction Detection

For each concept page created or updated, grep existing wiki pages for the same concept name and check for conflicting claims. If found, add to both pages:

```markdown
> [!contradiction] Conflict with [[Other Page]]
> This source says X. [[Other Page]] says Y. Needs resolution.
```

---

## Phase 7 — Write Sidecar Manifest

Write `.raw/.manifest-[slug].json` (NOT `.manifest.json` directly — parallel agents would overwrite each other):

```json
{
  "file": ".raw/[filename]",
  "ingested_at": "YYYY-MM-DD",
  "title": "...",
  "pages_created": ["wiki/..."],
  "pages_updated": ["wiki/..."]
}
```

Remove the file from `.raw/.queue` if present.

---

## Output

```
PDF: [title] ([page count] pages)
Type: [type] | Domain: [domain]
Chunks read: [n] × 20-page windows
Pages created: [[Page 1]], [[Page 2]], ...
Pages updated: [[Page 3]], ...
Entities: [n] new, [n] updated
Concepts: [n] new, [n] updated
Contradictions: [none | list]
Key insight: [one sentence]
```

---

## Do NOT

- Read the entire PDF in one call — always use the chunked loop
- Modify source files in `.raw/` (except the sidecar and `.queue`)
- Write directly to `.raw/.manifest.json`
- Create concept or entity pages for items only briefly mentioned
- Use hardcoded domain keywords — always read `domains.json`
