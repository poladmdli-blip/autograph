#!/usr/bin/env node
// Shim for backwards compatibility — delegates to autograph-setup.
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const child = spawn(process.execPath, [join(__dirname, 'autograph-setup')], { stdio: 'inherit' });
child.on('exit', code => process.exit(code ?? 0));
