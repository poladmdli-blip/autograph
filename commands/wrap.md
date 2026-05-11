---
description: Write an intelligent session summary to wiki/hot.md. Run at end of session.
---

Read autograph.config.json to get wiki_path.
Read {wiki_path}/wiki/hot.md.

Rewrite it (≤500 words) with this exact structure:

```
---
description: "Hot cache — recent session context, ~500 words. Updated at session end."
updated: YYYY-MM-DD
---

# Hot Cache

**Last Updated**: YYYY-MM-DD

## Key Recent Facts
- [3-5 most important facts, decisions, or discoveries from this session]

## Recent Changes
- [files or wiki pages created or modified this session]

## Active Threads
- [open questions, pending tasks, anything needing follow-up]
```

Use today's date. Draw from the actual conversation history. Write the file back to {wiki_path}/wiki/hot.md.
