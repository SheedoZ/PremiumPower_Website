/* Deterministic frame-by-frame capture driver.
 *
 * We never screen-record in real time. Each frame is rendered deliberately:
 *   run interactions scheduled at t -> setT(t) (which also sets scrollTop) -> screenshot
 * so the motion is perfect regardless of how slow the capture is.
 */
import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildStageHTML, CANVAS } from './stage.js';

const run = promisify(execFile);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pad = (n, w = 5) => String(n).padStart(w, '0');

/** Interaction helpers handed to each reel config. */
function makeCtx(page) {
  const app = (fn, arg) =>
    page.evaluate(
      ({ src, arg }) => {
        const d = document.getElementById('app').contentDocument;
        // eslint-disable-next-line no-new-func
        return new Function('d', 'w', 'arg', 'return (' + src + ')(d, w, arg)')(
          d, d.defaultView, arg
        );
      },
      { src: fn.toString(), arg }
    );

  return {
    page,
    app,
    /** Focus without letting the browser hijack our scroll position. */
    focus: (sel) => app((d, w, s) => { const e = d.querySelector(s); if (e) e.focus({ preventScroll: true }); }, sel),
    blur: () => app((d) => { if (d.activeElement) d.activeElement.blur(); }),
    /** Live typing: native value setter + input event, so app handlers fire. */
    setValue: (sel, value) =>
      app((d, w, a) => {
        const e = d.querySelector(a.sel);
        if (!e) return null;
        const proto = e.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(e, a.value);
        e.dispatchEvent(new w.Event('input', { bubbles: true }));
        return e.value;
      }, { sel, value }),
    /** Type `text` proportionally to progress u in [0,1]. */
    type(sel, text, u) {
      const n = Math.round(Math.max(0, Math.min(1, u)) * text.length);
      return this.setValue(sel, text.slice(0, n));
    },
    read: (sel) => app((d, w, s) => { const e = d.querySelector(s); return e ? e.textContent.trim() : null; }, sel),
    /** Let the app's own debounce/timers resolve before the next frame. */
    settle: (ms = 400) => sleep(ms),
  };
}

export async function capture(cfg, opts = {}) {
  const outDir = opts.outDir;
  const framesDir = path.join(outDir, 'frames');
  const stagePath = path.join(outDir, 'stage.html');
  const total = Math.round(CANVAS.seconds * CANVAS.fps); // 1080

  await fs.mkdir(framesDir, { recursive: true });
  await fs.writeFile(stagePath, buildStageHTML(cfg));

  const spotTimes = opts.spot ? (cfg.spotTimes || []) : null;
  const spotFrames = spotTimes ? new Set(spotTimes.map((t) => Math.round(t * CANVAS.fps))) : null;

  const browser = await chromium.launch({
    args: ['--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none',
           '--disable-lcd-text', '--autoplay-policy=no-user-gesture-required'],
  });
  const context = await browser.newContext({
    viewport: { width: CANVAS.w, height: CANVAS.h },
    deviceScaleFactor: opts.dsf || 1,
    reducedMotion: 'reduce',
  });

  // Freeze in-app timers before the app boots, or visible countdowns/marquees
  // burn wall-clock during the capture. setTimeout is left alone: the app's
  // calculator relies on a 300ms debounce.
  await context.addInitScript(() => {
    window.setInterval = function () { return 0; };
  });

  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 160)));

  await page.goto(opts.stageUrl, { waitUntil: 'load', timeout: 90000 });
  await page.evaluate(() => window.STAGE.appReady());
  await page.evaluate(() => window.STAGE.freezeApp());

  // Warm up: fonts, layout, first paint. Anchors resolved before this would be
  // measured against a pre-font layout.
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.getElementById('app').contentDocument.fonts.ready);
  await sleep(1500);
  await page.evaluate(() => window.STAGE.setT(0));
  await sleep(1200);
  await page.evaluate(() => window.STAGE.resetCaches());

  if (cfg.setup) await cfg.setup(makeCtx(page));

  const ctx = makeCtx(page);
  const actions = [...(cfg.actions || [])].sort((a, b) => (a.t ?? a.t0) - (b.t ?? b.t0));
  const fired = new Set();
  const shot = [];
  const t0 = Date.now();

  for (let i = 0; i < total; i++) {
    const t = i / CANVAS.fps;

    // 1. scripted interaction scheduled at this frame
    for (let k = 0; k < actions.length; k++) {
      const a = actions[k];
      if (a.run != null && a.t <= t && !fired.has(k)) { fired.add(k); await a.run(ctx); }
      if (a.perFrame && t >= a.t0 && t <= a.t1) {
        await a.perFrame((t - a.t0) / Math.max(1e-6, a.t1 - a.t0), ctx);
      }
    }

    // 2. + 3. scroll and every other visual property, as a pure function of t
    await page.evaluate((tt) => window.STAGE.setT(tt), t);

    // 4. one screenshot
    if (!spotFrames || spotFrames.has(i)) {
      const file = path.join(framesDir, pad(spotFrames ? shot.length : i) + '.jpg');
      await page.screenshot({ path: file, type: 'jpeg', quality: 95 });
      shot.push({ i, t, file });
    }

    if (i % 60 === 0 && !spotFrames) {
      const el = (Date.now() - t0) / 1000;
      process.stdout.write(
        `  frame ${i}/${total}  t=${t.toFixed(2)}s  ${el.toFixed(0)}s elapsed  ` +
        `eta ${(el / Math.max(1, i) * (total - i) / 60).toFixed(1)}min\n`
      );
    }
  }

  const verify = cfg.verify ? await cfg.verify(ctx) : null;
  await browser.close();
  return { framesDir, shot, total, pageErrors, verify };
}

/** Contact sheet for the spot pass. */
export async function contactSheet(framesDir, outFile, cols, rows) {
  await run('ffmpeg', [
    '-y', '-framerate', '1', '-i', path.join(framesDir, '%05d.jpg'),
    '-vf', `scale=360:640,tile=${cols}x${rows}:margin=8:padding=6:color=0x222222`,
    '-frames:v', '1', outFile,
  ]);
  return outFile;
}

/** Final encode: H.264 High@L4.1, yuv420p, CRF 19, +faststart, silent AAC. */
export async function encode(framesDir, outFile) {
  await run('ffmpeg', [
    '-y',
    '-framerate', String(CANVAS.fps), '-i', path.join(framesDir, '%05d.jpg'),
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.1',
    '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'slow',
    '-x264-params', 'keyint=60:min-keyint=30:scenecut=0',
    '-r', String(CANVAS.fps), '-fps_mode', 'cfr',
    '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-ar', '48000',
    '-shortest', '-movflags', '+faststart',
    outFile,
  ], { maxBuffer: 1 << 26 });
  return outFile;
}
