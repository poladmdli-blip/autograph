#!/usr/bin/env node
/**
 * Scans raw_path for files not yet tracked in .manifest.json
 * Called by SessionStart hook — outputs NEW_FILES_DETECTED or RAW_DIR_CLEAN
 * Also merges any .manifest-[slug].json sidecars written by parallel ingest agents.
 * Reads raw_path from autograph.config.json if present, else falls back to .raw/
 */
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, '..', 'autograph.config.json');
let config = {};
try { if (existsSync(configPath)) config = JSON.parse(readFileSync(configPath, 'utf8')); } catch {}

const RAW_DIR = config.raw_path || '.raw';
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
    // Accept any of: file, source_file, source — normalize to absolute path
    const rawKey = sidecar.file ?? sidecar.source_file ?? sidecar.source;
    if (rawKey) {
      const absKey = resolve(rawKey).replaceAll('\\', '/');
      const { file, source_file, source, ...rest } = sidecar;
      manifest.sources[absKey] = rest;
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

// Also check .queue (written by watch-raw.mjs)
const QUEUE_PATH = join(RAW_DIR, '.queue');
const queued = existsSync(QUEUE_PATH)
  ? readFileSync(QUEUE_PATH, 'utf8').split('\n').filter(Boolean).map(f => f.replaceAll('\\', '/'))
  : [];
const queuedNew = queued.filter(f => !ingested.has(f) && existsSync(f));

const pending = [...new Set([...newFiles, ...queuedNew])];

if (pending.length > 0) {
  const additionalContext = `NEW_FILES_DETECTED: ${pending.length} file(s) pending ingestion:\n${pending.map(f => `  INGEST: ${f}`).join('\n')}`;
  const systemMessage = `${pending.length} file(s) pending ingestion. Type anything and Claude will ask what to do.`;
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
