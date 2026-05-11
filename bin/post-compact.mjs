#!/usr/bin/env node
/**
 * PostCompact hook — re-injects context after conversation compaction.
 * Outputs JSON in Claude Code hook format.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, '..', 'autograph.config.json');

let config = {};
try { if (existsSync(configPath)) config = JSON.parse(readFileSync(configPath, 'utf8')); } catch {}

const wikiPath = config.wiki_path;
if (!wikiPath) process.exit(0);

const sections = [];

function addSection(label, filePath, maxLines) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, 'utf8').split('\n');
  sections.push(`--- ${label} ---\n${lines.slice(0, maxLines ?? lines.length).join('\n')}`);
}

addSection('Hot Cache',   resolve(wikiPath, 'wiki', 'hot.md'));
addSection('North Star',  resolve(wikiPath, 'brain', 'North Star.md'));
addSection('Active Work', resolve(wikiPath, 'work', 'Index.md'), 60);

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PostCompact',
    additionalContext: sections.join('\n\n'),
  },
}) + '\n');
