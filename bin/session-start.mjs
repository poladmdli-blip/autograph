#!/usr/bin/env node
/**
 * SessionStart hook — cross-platform, outputs JSON in Claude Code hook format.
 * 1. git pull in wiki_path (silent, non-fatal)
 * 2. Reads hot cache, North Star, and active work index
 * 3. Returns everything as a single JSON systemMessage
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, '..', 'autograph.config.json');

let config = {};
try { if (existsSync(configPath)) config = JSON.parse(readFileSync(configPath, 'utf8')); } catch {}

const wikiPath = config.wiki_path ?? null;

// ── 1. git pull ───────────────────────────────────────────────────────────────
if (wikiPath) {
  try { execSync('git pull --quiet', { cwd: wikiPath, stdio: 'ignore' }); } catch {}
}

// ── 2. Collect context files ──────────────────────────────────────────────────
const sections = [];

function addSection(label, filePath, maxLines) {
  if (!wikiPath || !existsSync(filePath)) return;
  const lines = readFileSync(filePath, 'utf8').split('\n');
  sections.push(`--- ${label} ---\n${lines.slice(0, maxLines ?? lines.length).join('\n')}`);
}

addSection('Hot Cache',   resolve(wikiPath ?? '', 'wiki', 'hot.md'));
addSection('North Star',  resolve(wikiPath ?? '', 'brain', 'North Star.md'));
addSection('Active Work', resolve(wikiPath ?? '', 'work', 'Index.md'), 60);

// ── 3. Output as JSON hook response ──────────────────────────────────────────
const output = {
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: sections.join('\n\n'),
  },
};

process.stdout.write(JSON.stringify(output) + '\n');
