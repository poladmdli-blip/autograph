#!/usr/bin/env node
/**
 * Scans .raw/ for files not yet tracked in .raw/.manifest.json
 * Called by SessionStart hook — outputs NEW_FILES_DETECTED or RAW_DIR_CLEAN
 */
import { readdirSync, statSync, existsSync, readFileSync } from 'fs';
import { join, relative } from 'path';

const RAW_DIR = '.raw';
const MANIFEST_PATH = join(RAW_DIR, '.manifest.json');
const SKIP = new Set(['.manifest.json', '.queue', '.gitkeep', '.gitignore']);

function scan(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry) || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) results.push(...scan(full));
    else results.push(full.replaceAll('\\', '/'));
  }
  return results;
}

const manifest = existsSync(MANIFEST_PATH)
  ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  : { sources: {} };

const ingested = new Set(Object.keys(manifest.sources || {}));
const allFiles = scan(RAW_DIR);
const newFiles = allFiles.filter(f => !ingested.has(f));

// Also check .raw/.queue (written by watch-raw.mjs)
const QUEUE_PATH = join(RAW_DIR, '.queue');
const queued = existsSync(QUEUE_PATH)
  ? readFileSync(QUEUE_PATH, 'utf8').split('\n').filter(Boolean).map(f => f.replaceAll('\\', '/'))
  : [];
const queuedNew = queued.filter(f => !ingested.has(f) && existsSync(f));

const pending = [...new Set([...newFiles, ...queuedNew])];

if (pending.length > 0) {
  console.log(`NEW_FILES_DETECTED: ${pending.length} file(s) pending ingestion:`);
  pending.forEach(f => console.log(`  INGEST: ${f}`));
} else {
  console.log('RAW_DIR_CLEAN: No new files pending ingestion.');
}
