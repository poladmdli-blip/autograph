#!/usr/bin/env node
/**
 * Stop hook — updates wiki/hot.md frontmatter date and recent git log.
 * Run as a command hook (not prompt) so it always executes reliably.
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const configPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'autograph.config.json');
if (!existsSync(configPath)) process.exit(0);

const { wiki_path } = JSON.parse(readFileSync(configPath, 'utf8'));
const hotPath = join(wiki_path, 'wiki', 'hot.md');
if (!existsSync(hotPath)) process.exit(0);

const today = new Date().toISOString().slice(0, 10);

let recentLog = '';
try {
  recentLog = execSync(`git -C "${wiki_path}" log --oneline -5 2>/dev/null`, { encoding: 'utf8' }).trim();
} catch {}

let content = readFileSync(hotPath, 'utf8');

// Update frontmatter date
content = content.replace(/^(updated:\s*).*$/m, `$1${today}`);
// Update inline date header
content = content.replace(/^(\*\*Last Updated\*\*:\s*).*$/m, `$1${today}`);

// Append recent git log as a trailing section if we have one
if (recentLog) {
  content = content.trimEnd();
  const logSection = `\n\n## Recent Commits\n${recentLog.split('\n').map(l => `- ${l}`).join('\n')}\n`;
  // Replace existing Recent Commits section if present, else append
  if (content.includes('## Recent Commits')) {
    content = content.replace(/\n## Recent Commits[\s\S]*$/, logSection);
  } else {
    content += logSection;
  }
}

writeFileSync(hotPath, content);
