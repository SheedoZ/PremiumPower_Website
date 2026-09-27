// Entry point: loads assets, exposes the render API used by render.cjs and
// a small player for previewing the film in a browser.
import { W, H } from './core.js';
import { DURATION } from './cues.js';
import { preload, render } from './scenes.js';
import { renderSoundtrack, encodeWav } from './audio.js';

const params = new URLSearchParams(location.search);
const RENDER = params.has('render');
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: RENDER });

async function loadFonts() {
  const faces = [
    '400 100px "League Gothic"', '500 20px "Inter"', '600 20px "Inter"', '700 20px "Inter"',
    '900 20px "Inter Display"', '400 20px "JetBrains Mono"', '500 20px "JetBrains Mono"',
    '700 20px "JetBrains Mono"', '700 20px "IBM Plex Sans Arabic"',
  ];
  await Promise.all(faces.map(f => document.fonts.load(f, f.includes('Arabic') ? 'مشروعك' : 'AZ09')));
  await document.fonts.ready;
}

const ready = (async () => {
  await loadFonts();
  await preload();
  render(ctx, 0);
})();

// Motion blur: each output frame averages `sub` samples spread over a 180°
// shutter centred on the frame time. Frames leave the page as raw RGB over a
// WebSocket (far faster than fetch uploads), each message prefixed with its
// frame number; the renderer acknowledges every frame.
function openSocket(path) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${location.host}${path}`);
    ws.binaryType = 'arraybuffer';
    const acks = [];
    ws.onmessage = () => acks.shift()?.();
    ws.onopen = () => resolve({ send: msg => new Promise(r => { acks.push(r); ws.send(msg); }), close: () => ws.close() });
    ws.onerror = reject;
  });
}

async function renderFrames({ first, last, step, fps, sub, url, shutter = 0.5 }) {
  const n = W * H;
  const acc = new Uint32Array(n * 3);
  const msg = new Uint8Array(4 + n * 3);
  const head = new DataView(msg.buffer);
  const socket = await openSocket(url);
  for (let f = first; f < last; f += step) {
    const t = f / fps;
    acc.fill(0);
    for (let k = 0; k < sub; k++) {
      const ts = sub > 1 ? t + ((k + 0.5) / sub - 0.5) * (shutter / fps) : t;
      render(ctx, Math.max(0, ts));
      const d = ctx.getImageData(0, 0, W, H).data;
      for (let i = 0, j = 0; j < n * 3; i += 4, j += 3) {
        acc[j] += d[i];
        acc[j + 1] += d[i + 1];
        acc[j + 2] += d[i + 2];
      }
    }
    const half = sub >> 1;
    for (let j = 0; j < n * 3; j++) msg[j + 4] = (acc[j] + half) / sub;
    head.setUint32(0, f, true);
    await socket.send(msg);
  }
  socket.close();
}

async function still(t, url, sub = 1) {
  if (sub > 1) {
    const n = W * H * 4, acc = new Uint32Array(n);
    for (let k = 0; k < sub; k++) {
      render(ctx, Math.max(0, t + ((k + 0.5) / sub - 0.5) * (0.5 / 60)));
      const d = ctx.getImageData(0, 0, W, H).data;
      for (let i = 0; i < n; i++) acc[i] += d[i];
    }
    const img = ctx.createImageData(W, H);
    for (let i = 0; i < n; i++) img.data[i] = acc[i] / sub;
    ctx.putImageData(img, 0, 0);
  } else {
    render(ctx, t);
  }
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  await fetch(url, { method: 'POST', body: blob });
}

async function renderAudio(url, opts = {}) {
  const buffer = await renderSoundtrack(opts);
  await fetch(url, { method: 'POST', body: encodeWav(buffer) });
}

window.SR = { ready, render: t => render(ctx, t), renderFrames, still, renderAudio, duration: DURATION };

// ---------------------------------------------------------------- player
if (!RENDER) {
  const ui = document.getElementById('ui');
  ui.hidden = false;
  const btn = document.getElementById('play');
  const bar = document.getElementById('scrub');
  const clock = document.getElementById('clock');
  let audioCtx = null, audioBuf = null, src = null;
  let playing = false, startAt = 0, offset = 0;

  const now = () => (playing ? offset + (audioCtx.currentTime - startAt) : offset);
  function draw() {
    const t = Math.min(now(), DURATION);
    render(ctx, t);
    bar.value = String(t);
    clock.textContent = t.toFixed(2).padStart(5, '0') + ' / 30.00';
    if (playing && t >= DURATION) stop(0);
    if (playing) requestAnimationFrame(draw);
  }
  async function start() {
    if (!audioCtx) audioCtx = new AudioContext({ sampleRate: 48000 });
    if (!audioBuf) {
      btn.textContent = 'Rendering sound…';
      audioBuf = await renderSoundtrack();
    }
    src = audioCtx.createBufferSource();
    src.buffer = audioBuf;
    src.connect(audioCtx.destination);
    startAt = audioCtx.currentTime;
    src.start(0, offset);
    playing = true;
    btn.textContent = 'Pause';
    requestAnimationFrame(draw);
  }
  function stop(to) {
    if (src) { src.stop(); src = null; }
    offset = to ?? now();
    playing = false;
    btn.textContent = 'Play';
    draw();
  }
  btn.onclick = () => (playing ? stop() : start());
  bar.oninput = () => { const was = playing; stop(Number(bar.value)); if (was) start(); };
  ready.then(() => { btn.disabled = false; draw(); });
}
