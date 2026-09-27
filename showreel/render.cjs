#!/usr/bin/env node
// Renders the Premium Power showreel to MP4.
//
// The film is drawn by src/ (a canvas page that can draw any frame on its
// own). This script serves the repository on localhost, opens the page in
// headless Chromium through Playwright, collects raw frames from several
// pages in parallel and pipes them into ffmpeg together with the soundtrack
// the page renders offline.
//
//   node showreel/render.cjs                    full film -> showreel/premium-power-showreel.mp4
//   node showreel/render.cjs --stills 1,6.2     PNG stills -> showreel/.cache/stills
//   node showreel/render.cjs --from 5 --to 9    a clip, for checking a section
//   node showreel/render.cjs --audio-only       soundtrack only -> showreel/.cache/audio.wav
//
// Options: --fps 60 --sub 4 (motion-blur samples per frame) --workers 4
//          --preset medium --crf 18 --out FILE --only music|sfx (audio stems)

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn, execSync } = require('child_process');

const HERE = __dirname;
const REPO = path.resolve(HERE, '..');
const CACHE = path.join(HERE, '.cache');
const FFMPEG = process.env.FFMPEG || path.join(CACHE, 'ffmpeg');
const W = 1920, H = 1080, DURATION = 30;

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith('--')) continue;
  const next = process.argv[i + 1];
  if (next === undefined || next.startsWith('--')) args[a.slice(2)] = true;
  else { args[a.slice(2)] = next; i++; }
}
const FPS = Number(args.fps || 60);
const SUB = Number(args.sub || 4);
const WORKERS = Number(args.workers || 4);

function loadPlaywright() {
  try { return require('playwright'); } catch (_) {
    const root = execSync('npm root -g').toString().trim();
    return require(path.join(root, 'playwright'));
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
};

// ---------------------------------------------------------------- server
function startServer(handlers) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (req.method === 'POST') {
      const size = Number(req.headers['content-length'] || 0);
      const body = size ? Buffer.allocUnsafe(size) : null;
      const chunks = [];
      let at = 0;
      req.on('data', c => {
        if (body) { c.copy(body, at); at += c.length; } else chunks.push(c);
      });
      req.on('end', async () => {
        try {
          const h = handlers[url.pathname];
          if (!h) throw new Error('no handler ' + url.pathname);
          await h(body ? body.subarray(0, at) : Buffer.concat(chunks), url.searchParams);
          res.writeHead(200).end('ok');
        } catch (e) {
          console.error(e);
          res.writeHead(500).end(String(e));
        }
      });
      return;
    }
    const file = path.join(REPO, decodeURIComponent(url.pathname));
    if (!file.startsWith(REPO) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  server.on('upgrade', (req, socket) => {
    const h = handlers['ws:' + new URL(req.url, 'http://x').pathname];
    if (!h) return socket.destroy();
    acceptSocket(req, socket, h);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// ---------------------------------------------------------------- websocket
// Just enough of RFC 6455 to receive large binary messages from the page and
// answer with short text acknowledgements.
function acceptSocket(req, socket, onMessage) {
  const accept = crypto.createHash('sha1')
    .update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${accept}\r\n\r\n`);
  socket.setNoDelay(true);
  let chunks = [], have = 0, parts = null;
  const byteAt = i => { for (const c of chunks) { if (i < c.length) return c[i]; i -= c.length; } return 0; };
  const take = n => {
    const out = Buffer.allocUnsafeSlow(n);
    let o = 0;
    while (o < n) {
      const c = chunks[0], k = Math.min(c.length, n - o);
      c.copy(out, o, 0, k);
      o += k;
      if (k === c.length) chunks.shift(); else chunks[0] = c.subarray(k);
    }
    have -= n;
    return out;
  };
  const unmask = (b, m) => {
    const words = b.length >> 2, m32 = m.readUInt32LE(0);
    const u = new Uint32Array(b.buffer, b.byteOffset, words);
    for (let k = 0; k < words; k++) u[k] ^= m32;
    for (let i = words * 4; i < b.length; i++) b[i] ^= m[i & 3];
  };
  const reply = text => {
    const p = Buffer.from(text);
    socket.write(Buffer.concat([Buffer.from([0x81, p.length]), p]));
  };
  socket.on('data', d => {
    chunks.push(d);
    have += d.length;
    while (have >= 2) {
      const b0 = byteAt(0), b1 = byteAt(1);
      let len = b1 & 0x7f, hl = 2;
      if (len === 126) { if (have < 4) return; len = byteAt(2) * 256 + byteAt(3); hl = 4; }
      else if (len === 127) { if (have < 10) return; len = 0; for (let i = 2; i < 10; i++) len = len * 256 + byteAt(i); hl = 10; }
      const ml = b1 & 0x80 ? 4 : 0;
      if (have < hl + ml + len) return;
      take(hl);
      const mask = ml ? take(4) : null;
      const payload = take(len);
      if (mask) unmask(payload, mask);
      const op = b0 & 0x0f, fin = b0 & 0x80;
      if (op === 8) { socket.end(); return; }
      if (op !== 0 && op !== 1 && op !== 2) continue;
      if (!fin) { (parts = parts || []).push(payload); continue; }
      const msg = parts ? Buffer.concat([...parts, payload]) : payload;
      parts = null;
      Promise.resolve(onMessage(msg)).then(() => reply('ok'), e => { console.error(e); socket.destroy(); });
    }
  });
  socket.on('error', () => {});
}

async function openPage(browser, base) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  page.on('pageerror', e => console.log('[page error]', e.message));
  await page.goto(base + '/showreel/src/index.html?render=1');
  await page.evaluate(() => window.SR.ready);
  return page;
}

// Loudness to -14 LUFS with a peak limiter at -1.5 dBFS running at 4x the
// sample rate (so it also catches inter-sample peaks): measure, apply one
// gain plus the limiter, measure again and correct if needed.
function measureLoudness(file) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, ['-hide_banner', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-']);
    let err = '';
    p.stderr.on('data', d => (err += d));
    p.on('exit', code => {
      if (code !== 0) return reject(new Error('ebur128 failed'));
      const summary = err.slice(err.lastIndexOf('Summary:'));
      resolve({ i: Number(/I:\s+(-?[\d.]+) LUFS/.exec(summary)[1]), tp: Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(summary)[1]) });
    });
  });
}

async function normalise(src, dst) {
  const before = await measureLoudness(src);
  let gain = -14 - before.i;
  let after;
  for (let pass = 0; pass < 3; pass++) {
    await run(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-af',
      `volume=${gain.toFixed(2)}dB,aresample=192000:resampler=soxr,alimiter=limit=0.84:attack=1:release=50:level=disabled:asc=1,aresample=48000:resampler=soxr`,
      '-ar', '48000', '-c:a', 'pcm_s24le', dst]);
    after = await measureLoudness(dst);
    if (Math.abs(after.i + 14) < 0.2) break;
    gain += -14 - after.i;
  }
  console.log(`  loudness ${before.i} → ${after.i} LUFS, true peak ${after.tp} dBTP`);
}

function run(cmd, argv) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, argv, { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('exit', code => (code === 0 ? resolve() : reject(new Error(cmd + ' exited ' + code))));
  });
}

// ---------------------------------------------------------------- main
(async () => {
  fs.mkdirSync(CACHE, { recursive: true });
  const rawAudioPath = path.join(CACHE, 'audio-raw.wav');
  const audioPath = path.join(CACHE, 'audio.wav');
  const stillDir = path.join(CACHE, 'stills');

  // Frames arrive out of order from the workers; they are written to ffmpeg
  // strictly in sequence.
  let ff = null, nextFrame = 0, lastFrame = 0;
  const pending = new Map();
  const waiters = [];
  let written = 0, t0 = Date.now();
  function flush() {
    while (pending.has(nextFrame)) {
      const buf = pending.get(nextFrame);
      pending.delete(nextFrame);
      ff.stdin.write(buf);
      nextFrame++;
      written++;
      if (written % 60 === 0) {
        const s = (Date.now() - t0) / 1000;
        process.stdout.write(`\r  frame ${nextFrame}/${lastFrame}  ${(written / s).toFixed(1)} fps   `);
      }
    }
    for (let i = waiters.length - 1; i >= 0; i--) {
      if (waiters[i].f - nextFrame < 48) { waiters[i].resolve(); waiters.splice(i, 1); }
    }
  }

  const server = await startServer({
    'ws:/frames': async msg => {
      const f = msg.readUInt32LE(0);
      const buf = msg.subarray(4);
      if (buf.length !== W * H * 3) throw new Error('bad frame size ' + buf.length);
      pending.set(f, buf);
      flush();
      if (f - nextFrame >= 48) await new Promise(resolve => waiters.push({ f, resolve }));
      // Hold the acknowledgement while ffmpeg catches up.
      if (ff.stdin.writableNeedDrain) await new Promise(resolve => ff.stdin.once('drain', resolve));
    },
    '/audio': async buf => fs.writeFileSync(rawAudioPath, buf),
    '/still': async (buf, q) => {
      fs.mkdirSync(stillDir, { recursive: true });
      fs.writeFileSync(path.join(stillDir, q.get('name')), buf);
    },
  });
  const base = 'http://127.0.0.1:' + server.address().port;
  const { chromium } = loadPlaywright();
  // The container has no GPU: draw canvases in software.
  const browser = await chromium.launch({
    args: ['--disable-gpu', '--disable-accelerated-2d-canvas', '--disable-gpu-compositing', '--disable-frame-rate-limit'],
  });

  try {
    if (args.stills) {
      const page = await openPage(browser, base);
      const times = String(args.stills).split(',').map(Number);
      for (const t of times) {
        const name = `t${t.toFixed(2).padStart(5, '0')}.png`;
        await page.evaluate(([t, name, sub]) => window.SR.still(t, '/still?name=' + name, sub), [t, name, Number(args.sub || 1)]);
        console.log('  ' + path.join(stillDir, name));
      }
      return;
    }

    const needAudio = !args['no-audio'];
    if (needAudio) {
      console.log('audio');
      const page = await openPage(browser, base);
      await page.evaluate(only => window.SR.renderAudio('/audio', { only }), String(args.only || ''));
      await page.close();
      await normalise(rawAudioPath, audioPath);
      console.log('  ' + audioPath);
      if (args['audio-only']) return;
    }

    const from = Number(args.from || 0), to = Number(args.to || DURATION);
    const first = Math.round(from * FPS), last = Math.round(to * FPS);
    nextFrame = first;
    lastFrame = last;
    const out = path.resolve(args.out || (args.from || args.to
      ? path.join(CACHE, `clip-${from}-${to}.mp4`)
      : path.join(HERE, 'premium-power-showreel.mp4')));

    const ffArgs = ['-hide_banner', '-loglevel', 'error', '-y',
      '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-framerate', String(FPS), '-i', 'pipe:0'];
    if (needAudio) ffArgs.push('-ss', String(from), '-t', String(to - from), '-i', audioPath);
    ffArgs.push('-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
      '-c:v', 'libx264', '-preset', String(args.preset || 'medium'), '-crf', String(args.crf || 18), '-tune', 'film',
      '-profile:v', 'high', '-level', '4.2', '-g', String(FPS * 2),
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709');
    if (needAudio) ffArgs.push('-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-shortest');
    ffArgs.push('-movflags', '+faststart', out);
    ff = spawn(FFMPEG, ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
    const ffDone = new Promise((resolve, reject) => ff.on('exit', c => (c === 0 ? resolve() : reject(new Error('ffmpeg ' + c)))));

    console.log(`video ${first}..${last - 1} @ ${FPS} fps, ${SUB} samples/frame, ${WORKERS} workers`);
    t0 = Date.now();
    const pages = await Promise.all(Array.from({ length: WORKERS }, () => openPage(browser, base)));
    await Promise.all(pages.map((page, w) => page.evaluate(
      o => window.SR.renderFrames(o),
      { first: first + w, last, step: WORKERS, fps: FPS, sub: SUB, url: '/frames' })));
    ff.stdin.end();
    await ffDone;
    console.log(`\n  ${out}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  } finally {
    await browser.close();
    server.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
