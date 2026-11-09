// Renders dist/preview.html to dist/preview.png with headless Chrome.
// Set CHROME to the browser binary if it is not at the macOS default path.

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));

execFileSync(chrome, [
  '--headless=new',
  '--hide-scrollbars',
  '--force-device-scale-factor=2',
  '--window-size=1400,1500',
  `--screenshot=${dist}preview.png`,
  `file://${dist}preview.html`,
], { stdio: 'ignore' });
console.warn('wrote dist/preview.png');
