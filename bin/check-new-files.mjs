#!/usr/bin/env node
/**
 * Scans .raw/ for files not yet tracked in .raw/.manifest.json
 * Called by SessionStart hook — outputs NEW_FILES_DETECTED or RAW_DIR_CLEAN
 * Also merges any .manifest-[slug].json sidecars written by parallel ingest agents.
 */
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

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

// Merge any sidecar files left by parallel ingest agents
const manifest = existsSync(MANIFEST_PATH)
  ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  : { sources: {} };

if (!manifest.sources) manifest.sources = {};

let sidecarsMerged = 0;
for (const entry of readdirSync(RAW_DIR)) {
  if (!entry.startsWith('.manifest-') || !entry.endsWith('.json')) continue;
  const sidecarPath = join(RAW_DIR, entry);
  try {
    const sidecar = JSON.parse(readFileSync(sidecarPath, 'utf8'));
    if (sidecar.file) {
      const { file, ...rest } = sidecar;
      manifest.sources[file] = rest;
      sidecarsMerged++;
    }
    unlinkSync(sidecarPath);
  } catch {}
}

if (sidecarsMerged > 0) {
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

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
  const list = pending.map(f => `  - ${f}`).join('\n');
  const additionalContext = `NEW_FILES_DETECTED: ${pending.length} file(s) pending ingestion:\n${pending.map(f => `  INGEST: ${f}`).join('\n')}`;
  const systemMessage = `${pending.length} file(s) pending ingestion — awaiting your confirmation to ingest:\n${list}`;
  console.log(JSON.stringify({
    systemMessage,
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext,
    },
  }));
} else {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: 'RAW_DIR_CLEAN: No new files pending ingestion.',
    },
  }));
}
