#!/usr/bin/env node
/**
 * Background file watcher for .raw/
 * Run in a separate terminal: node bin/watch-raw.mjs
 *
 * Watches .raw/ for new files and writes them to .raw/.queue
 * The SessionStart hook reads .queue and auto-ingests at next session.
 *
 * No external dependencies — uses Node.js built-in fs.watch
 */
import { watch, existsSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const RAW_DIR = '.raw';
const QUEUE_FILE = join(RAW_DIR, '.queue');
const MANIFEST_PATH = join(RAW_DIR, '.manifest.json');
const SKIP = new Set(['.manifest.json', '.queue', '.gitkeep', '.gitignore']);

function isIngested(filepath) {
  if (!existsSync(MANIFEST_PATH)) return false;
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  return !!(manifest.sources && manifest.sources[filepath.replaceAll('\\', '/')]);
}

function enqueue(filepath) {
  const normalized = filepath.replaceAll('\\', '/');
  if (isIngested(normalized)) return;
  const queue = existsSync(QUEUE_FILE)
    ? readFileSync(QUEUE_FILE, 'utf8').split('\n').filter(Boolean)
    : [];
  if (!queue.includes(normalized)) {
    queue.push(normalized);
    writeFileSync(QUEUE_FILE, queue.join('\n') + '\n');
    const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(`[${ts}] Queued for ingestion: ${normalized}`);
  }
}

if (!existsSync(RAW_DIR)) {
  console.error(`.raw/ directory not found. Run from the wiki-graph root.`);
  process.exit(1);
}

console.log(`Watching ${RAW_DIR}/ for new files...`);
console.log('Drop any file into .raw/ — it will be auto-ingested at next Claude session start.');
console.log('Press Ctrl+C to stop.\n');

watch(RAW_DIR, { recursive: true }, (event, filename) => {
  if (!filename) return;
  const basename = filename.split(/[/\\]/).pop();
  if (SKIP.has(basename) || basename.startsWith('.')) return;
  const filepath = join(RAW_DIR, filename);
  if (!existsSync(filepath)) return;
  const stat = statSync(filepath);
  if (!stat.isFile()) return;
  enqueue(filepath);
});
