#!/usr/bin/env node
/**
 * Marks raw source files as ingested in .manifest.json.
 * Called by the main session after reading all sidecar manifests,
 * before deleting them — so the manifest stays current.
 *
 * Usage:
 *   node bin/mark-ingested.mjs <manifest_path> <file1> [file2 ...]
 *
 * Arguments:
 *   manifest_path  Absolute path to .manifest.json
 *   file1 ...      Absolute path(s) to the ingested source file(s)
 *
 * Example:
 *   node bin/mark-ingested.mjs \
 *     C:/Users/you/knowledge/.raw/.manifest.json \
 *     C:/Users/you/knowledge/.raw/doc.md \
 *     C:/Users/you/knowledge/.raw/report.pdf
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const [,, manifestPath, ...rawFiles] = process.argv;

if (!manifestPath || rawFiles.length === 0) {
  console.error('Usage: mark-ingested.mjs <manifest_path> <file1> [file2 ...]');
  process.exit(1);
}

const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8'))
  : { sources: {} };

if (!manifest.sources) manifest.sources = {};

const today = new Date().toISOString().slice(0, 10);
for (const f of rawFiles) {
  const key = resolve(f).replaceAll('\\', '/');
  manifest.sources[key] = { ingested: today };
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Marked ${rawFiles.length} file(s) as ingested in ${manifestPath}`);
