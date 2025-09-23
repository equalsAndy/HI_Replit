#!/usr/bin/env node
import { spawn } from 'node:child_process';

const args = [
  'vitest',
  '--reporter=json',
  '--coverage=false',
];

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, CI: 'true' },
});

let json = '';
child.stdout.on('data', (d) => {
  json += d.toString();
});

child.stderr.on('data', (d) => {
  // keep stderr visible in case vitest logs important info
  process.stderr.write(d);
});

child.on('close', (code) => {
  try {
    const report = JSON.parse(json);
    const failed = report?.failures || [];
    if (failed.length === 0) {
      console.log('All tests passed.');
      process.exit(0);
      return;
    }

    console.log(`Failed tests: ${failed.length}`);
    for (const f of failed) {
      const file = f?.file || 'unknown file';
      for (const test of f?.failures || []) {
        const title = test?.name || '(no title)';
        const err = test?.error || {};
        const msg = (err.message || err.name || 'Error').toString().split('\n')[0];
        console.log(`- ${file} :: ${title} -> ${msg}`);
      }
    }
    process.exit(1);
  } catch (e) {
    // If JSON parse fails, dump output for debugging
    console.error('Could not parse vitest JSON output. Raw output follows:');
    console.error(json.slice(0, 5000));
    process.exit(code ?? 1);
  }
});

