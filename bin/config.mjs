#!/usr/bin/env node
/**
 * Read a value from autograph.config.json.
 * Usage: node bin/config.mjs <key>
 * Outputs the value, or the current working directory as fallback.
 * Used by .claude/settings.json hooks to resolve wiki_path and raw_path.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, '..', 'autograph.config.json');
const key = process.argv[2];

if (!existsSync(configPath)) {
  process.stdout.write(process.cwd());
  process.exit(0);
}

let config = {};
try {
  config = JSON.parse(readFileSync(configPath, 'utf8'));
} catch {
  process.stdout.write(process.cwd());
  process.exit(0);
}
process.stdout.write(config[key] ?? process.cwd());
