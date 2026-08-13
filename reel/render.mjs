#!/usr/bin/env node
/* CLI: node render.mjs [--spot] [--reel <name>]
 *
 *   --spot   capture ~12 timestamps into a contact sheet and stop.
 *            Always run this and LOOK at the sheet before the full pass.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { capture, contactSheet, encode } from './lib/capture.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const spot = argv.includes('--spot');
const reelName = (argv[argv.indexOf('--reel') + 1] && !argv[argv.indexOf('--reel') + 1].startsWith('--'))
  ? argv[argv.indexOf('--reel') + 1] : 'kva-calculator';

const cfg = (await import(`./reels/${reelName}.js`)).default;
const outDir = path.join(here, 'out', reelName + (spot ? '-spot' : ''));
await fs.rm(path.join(outDir, 'frames'), { recursive: true, force: true });
await fs.mkdir(outDir, { recursive: true });

// The stage must be same-origin with the app so it can drive the iframe's
// scrollTop and read real bounding boxes.
const stageUrl = `http://127.0.0.1:8099/reel/out/${reelName + (spot ? '-spot' : '')}/stage.html`;

console.log(`▶ ${spot ? 'SPOT' : 'FULL'} capture — reel "${reelName}"`);
const t0 = Date.now();
const res = await capture(cfg, { outDir, spot, stageUrl });
console.log(`  captured ${res.shot.length} frame(s) in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

if (res.pageErrors.length) console.log('  ⚠ page errors:', [...new Set(res.pageErrors)].slice(0, 5));

if (res.verify) {
  console.log('  verify:', JSON.stringify(res.verify));
  if (!res.verify.ok) {
    console.error('✗ ABORT: on-screen figures do not match an independent recomputation.');
    process.exit(1);
  }
  console.log('  ✓ on-screen figures match the app\'s own computation');
}

if (spot) {
  const [cols, rows] = cfg.spotGrid || [4, 3];
  const sheet = path.join(outDir, 'contact-sheet.jpg');
  await contactSheet(res.framesDir, sheet, cols, rows);
  console.log('  contact sheet →', sheet);
  console.log('  times:', res.shot.map((s) => s.t.toFixed(2) + 's').join('  '));
} else {
  const mp4 = path.join(here, 'out', `premiumpower-${reelName}.mp4`);
  await encode(res.framesDir, mp4);
  const { size } = await fs.stat(mp4);
  console.log(`✓ ${mp4}  (${(size / 1048576).toFixed(1)} MB)`);
}
