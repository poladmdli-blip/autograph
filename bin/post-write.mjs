#!/usr/bin/env node
/**
 * PostToolUse hook (Write|Edit) — cross-platform git auto-commit.
 * Stages and commits wiki changes in wiki_path after every file write.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, '..', 'autograph.config.json');

let config = {};
try { if (existsSync(configPath)) config = JSON.parse(readFileSync(configPath, 'utf8')); } catch {}

const wikiPath = config.wiki_path;
if (!wikiPath || !existsSync(resolve(wikiPath, '.git'))) process.exit(0);

const date = new Date().toISOString().slice(0, 16).replace('T', ' ');

try {
  execSync(
    `git add wiki/ work/ brain/ team/ .raw/.manifest.json`,
    { cwd: wikiPath, stdio: 'ignore' }
  );
  execSync(
    `git diff --cached --quiet || git commit -m "wiki-graph: auto-commit ${date}"`,
    { cwd: wikiPath, stdio: 'ignore', shell: true }
  );
} catch { /* non-fatal */ }
