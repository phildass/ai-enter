/**
 * Production start for Hostinger Node.js apps and VPS PM2.
 * Hostinger assigns PORT dynamically; VPS/nginx expects 3040 by default.
 */
const { spawn } = require('child_process');
const path = require('path');

const port = process.env.PORT || '3040';
const host = process.env.HOST || '0.0.0.0';

const nextBin = path.join(
  path.dirname(require.resolve('next/package.json')),
  'dist',
  'bin',
  'next',
);

console.log(`[start-server] next start -H ${host} -p ${port}`);

const child = spawn(process.execPath, [nextBin, 'start', '-H', host, '-p', port], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`[start-server] next start killed by signal: ${signal}`);
    process.exit(1);
  }
  process.exit(code === null ? 1 : code);
});

child.on('error', (err) => {
  console.error('[start-server] failed to launch next start:', err);
  process.exit(1);
});
