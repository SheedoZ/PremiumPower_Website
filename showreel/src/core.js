// Shared helpers for the Premium Power showreel: palette, easing, seeded
// randomness, text layout and the post-processing passes. Every function is
// a pure function of its inputs so any frame can be rendered on its own.

export const W = 1920, H = 1080, CX = W / 2, CY = H / 2;

// Brand palette from index.html (:root) plus the night tones the film needs.
export const C = {
  void: '#02060D',
  night: '#050D1B',
  navy: '#0A1F3F',
  deep: '#003087',
  blue: '#0070BA',
  cyan: '#009CDE',
  ice: '#7ED8FF',
  white: '#FFFFFF',
  paper: '#F3F6FA',
  mist: '#A8BBD1',
  steel: '#5A6A7A',
  ink: '#0B1B33',
  red: '#FF4040',
  warm: '#FFD9A3',
};

export const F = {
  display: '"League Gothic"',
  sans: '"Inter"',
  black: '"Inter Display"',
  mono: '"JetBrains Mono"',
  arabic: '"IBM Plex Sans Arabic"',
};

// ---------------------------------------------------------------- math
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const TAU = Math.PI * 2;

export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t;
  const sy = t => ((ay * t + by) * t + cy) * t;
  const dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-6) return sy(t);
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1;
    t = x;
    for (let i = 0; i < 40; i++) {
      const v = sx(t);
      if (Math.abs(v - x) < 1e-7) break;
      if (v < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}

export const ease = {
  lin: x => x,
  in2: x => x * x,
  out2: x => 1 - (1 - x) ** 2,
  io2: x => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2),
  in3: x => x ** 3,
  out3: x => 1 - (1 - x) ** 3,
  io3: x => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2),
  in4: x => x ** 4,
  out4: x => 1 - (1 - x) ** 4,
  io4: x => (x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2),
  out5: x => 1 - (1 - x) ** 5,
  inExpo: x => (x <= 0 ? 0 : 2 ** (10 * x - 10)),
  outExpo: x => (x >= 1 ? 1 : 1 - 2 ** (-10 * x)),
  ioExpo: x => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 2 ** (20 * x - 10) / 2 : (2 - 2 ** (-20 * x + 10)) / 2),
  outBack: x => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2,
  inBack: x => 2.70158 * x ** 3 - 1.70158 * x * x,
  outElastic: x => (x <= 0 ? 0 : x >= 1 ? 1 : 2 ** (-10 * x) * Math.sin((x * 10 - 0.75) * (TAU / 3)) + 1),
  snap: cubicBezier(0.85, 0, 0.15, 1),
  smooth: cubicBezier(0.65, 0, 0.35, 1),
  glide: cubicBezier(0.16, 1, 0.3, 1),
  pop: cubicBezier(0.34, 1.56, 0.64, 1),
};

// Progress of t through [a, b], eased.
export const P = (t, a, b, e = ease.lin) => e(clamp((t - a) / (b - a)));

// ---------------------------------------------------------------- randomness
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(n) {
  let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const a = hash(i * 374761393 + seed * 668265263);
  const b = hash((i + 1) * 374761393 + seed * 668265263);
  const u = f * f * (3 - 2 * f);
  return a + (b - a) * u;
}
// Signed smooth noise in [-1, 1].
export const snoise = (x, seed = 0) => noise1(x, seed) * 2 - 1;

// ---------------------------------------------------------------- canvas
export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function font(ctx, fam, size, weight = 400) {
  ctx.font = `${weight} ${size}px ${fam}`;
}

export function rgba(hex, a = 1) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function mixHex(h1, h2, t) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const r = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, t));
  const g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t));
  const bl = Math.round(lerp(a & 255, b & 255, t));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}

// Width of a string with the current font and a tracking value, without the
// trailing space the canvas adds after the last glyph.
export function textWidth(ctx, str, ls = 0) {
  ctx.letterSpacing = '0px';
  return ctx.measureText(str).width + ls * Math.max(0, str.length - 1);
}

// Draw text with tracking; align handled here so tracking stays centred.
export function drawText(ctx, str, x, y, { ls = 0, align = 'left', stroke = false } = {}) {
  const w = textWidth(ctx, str, ls);
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.textAlign = 'left';
  ctx.letterSpacing = ls + 'px';
  if (stroke) ctx.strokeText(str, x0, y);
  else ctx.fillText(str, x0, y);
  ctx.letterSpacing = '0px';
  return w;
}

// Text that rises out of a mask line. p = 0 hidden below, 1 in place,
// values past 1 are not used. Baseline is y; the mask spans the cap height.
export function riseText(ctx, str, x, y, p, size, opts = {}) {
  if (p <= 0) return;
  const { ls = 0, align = 'left', over = 0.3 } = opts;
  const w = textWidth(ctx, str, ls);
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0 - size, y - size * (1 + over), w + size * 2, size * (1 + over * 2));
  ctx.clip();
  const dy = (1 - p) * size * 1.15;
  drawText(ctx, str, x0, y + dy, { ls, stroke: opts.stroke });
  ctx.restore();
}

// Decoding text effect: resolved characters from the left, noise after.
const SCRAMBLE = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%/<>*+=';
export function scramble(str, p, t, seed = 1) {
  const n = str.length;
  const k = Math.floor(clamp(p) * n);
  const tick = Math.floor(t * 30);
  let out = '';
  for (let i = 0; i < n; i++) {
    const ch = str[i];
    if (i < k || ch === ' ' || ch === '.' || ch === '·') out += ch;
    else if (i < k + 6) out += SCRAMBLE[Math.floor(hash(i * 131 + tick * 7 + seed * 977) * SCRAMBLE.length)];
    else out += ' ';
  }
  return out;
}

// ---------------------------------------------------------------- shapes
export function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Partial polyline, p in [0, 1] of total length.
export function polyPartial(ctx, pts, p) {
  if (p <= 0 || pts.length < 2) return null;
  let total = 0;
  const seg = [];
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(d);
    total += d;
  }
  let left = total * clamp(p);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  let end = pts[0];
  for (let i = 1; i < pts.length; i++) {
    if (left >= seg[i - 1]) {
      ctx.lineTo(pts[i][0], pts[i][1]);
      left -= seg[i - 1];
      end = pts[i];
    } else {
      const f = seg[i - 1] ? left / seg[i - 1] : 0;
      end = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
      ctx.lineTo(end[0], end[1]);
      break;
    }
  }
  return end;
}

// Corner brackets around a box, a recurring HUD motif.
export function brackets(ctx, x, y, w, h, len = 18) {
  ctx.beginPath();
  ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
  ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
  ctx.moveTo(x + w, y + h - len); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - len, y + h);
  ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
  ctx.stroke();
}

// Jagged lightning between two points, deterministic for a seed.
export function boltPath(x1, y1, x2, y2, seed, rough = 0.18, depth = 6) {
  let pts = [[x1, y1], [x2, y2]];
  const r = rng(seed);
  let amp = Math.hypot(x2 - x1, y2 - y1) * rough;
  for (let d = 0; d < depth; d++) {
    const next = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const len = Math.hypot(bx - ax, by - ay) || 1;
      const nx = -(by - ay) / len, ny = (bx - ax) / len;
      const o = (r() * 2 - 1) * amp;
      next.push([mx + nx * o, my + ny * o], pts[i]);
    }
    pts = next;
    amp *= 0.55;
  }
  return pts;
}

// ---------------------------------------------------------------- post fx
let grainTiles = null;
function buildGrain() {
  grainTiles = [];
  for (let k = 0; k < 6; k++) {
    const c = makeCanvas(256, 256);
    const g = c.getContext('2d');
    const img = g.createImageData(256, 256);
    const r = rng(1000 + k);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(128 + (r() + r() + r() - 1.5) * 120);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = clamp(v, 0, 255);
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    grainTiles.push(c);
  }
}

export function grain(ctx, t, amount = 0.07) {
  if (!grainTiles) buildGrain();
  const f = Math.floor(t * 30);
  const tile = grainTiles[f % grainTiles.length];
  const ox = Math.floor(hash(f * 13 + 1) * 256), oy = Math.floor(hash(f * 29 + 7) * 256);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = amount;
  for (let y = -oy; y < H; y += 256) for (let x = -ox; x < W; x += 256) ctx.drawImage(tile, x, y);
  ctx.restore();
}

let vignetteCanvas = null;
export function vignette(ctx, strength = 0.55) {
  if (!vignetteCanvas) {
    vignetteCanvas = makeCanvas(W / 2, H / 2);
    const v = vignetteCanvas.getContext('2d');
    const g = v.createRadialGradient(CX / 2, CY / 2, H * 0.175, CX / 2, CY / 2, H * 0.525);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,1)');
    v.fillStyle = g;
    v.fillRect(0, 0, W / 2, H / 2);
  }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = strength;
  ctx.drawImage(vignetteCanvas, 0, 0, W, H);
  ctx.restore();
}

// Cheap bloom: crush the darks of a quarter-size copy, blur it at two radii
// (still at quarter size), then add it back in a single full-size pass.
let bloomA = null, bloomB = null;
export function bloom(ctx, amount = 0.45, radius = 7) {
  if (amount <= 0) return;
  if (!bloomA) {
    bloomA = makeCanvas(W / 4, H / 4);
    bloomB = makeCanvas(W / 4, H / 4);
  }
  const a = bloomA.getContext('2d'), b = bloomB.getContext('2d');
  a.globalCompositeOperation = 'copy';
  a.drawImage(ctx.canvas, 0, 0, W / 4, H / 4);
  a.globalCompositeOperation = 'multiply';
  a.drawImage(bloomA, 0, 0);
  a.drawImage(bloomA, 0, 0);
  b.globalCompositeOperation = 'copy';
  b.globalAlpha = 1;
  b.filter = `blur(${radius / 4}px)`;
  b.drawImage(bloomA, 0, 0);
  b.globalCompositeOperation = 'lighter';
  b.globalAlpha = 0.7;
  b.filter = `blur(${(radius * 3) / 4}px)`;
  b.drawImage(bloomA, 0, 0);
  b.filter = 'none';
  b.globalAlpha = 1;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = amount;
  ctx.drawImage(bloomB, 0, 0, W, H);
  ctx.restore();
}

// RGB split: the frame is separated into channels and offset horizontally.
let chromaCanvas = null, chromaChan = null;
export function chroma(ctx, px) {
  if (Math.abs(px) < 0.5) return;
  if (!chromaCanvas) {
    chromaCanvas = makeCanvas(W, H);
    chromaChan = makeCanvas(W, H);
  }
  const src = chromaCanvas.getContext('2d');
  src.globalCompositeOperation = 'copy';
  src.drawImage(ctx.canvas, 0, 0);
  const ch = chromaChan.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'copy';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  const parts = [['#ff0000', -px], ['#00ff00', 0], ['#0000ff', px]];
  for (const [col, dx] of parts) {
    ch.globalCompositeOperation = 'copy';
    ch.drawImage(chromaCanvas, 0, 0);
    ch.globalCompositeOperation = 'multiply';
    ch.fillStyle = col;
    ch.fillRect(0, 0, W, H);
    ctx.drawImage(chromaChan, dx, 0);
  }
  ctx.restore();
}

// Horizontal slice displacement for glitch hits.
let glitchCanvas = null;
export function glitch(ctx, amount, t, seed = 3) {
  if (amount <= 0.01) return;
  if (!glitchCanvas) glitchCanvas = makeCanvas(W, H);
  const g = glitchCanvas.getContext('2d');
  g.globalCompositeOperation = 'copy';
  g.drawImage(ctx.canvas, 0, 0);
  const tick = Math.floor(t * 24);
  const r = rng(seed * 7919 + tick * 104729);
  const slices = 6 + Math.floor(amount * 14);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < slices; i++) {
    const y = Math.floor(r() * H);
    const h = Math.floor(4 + r() * 60 * amount);
    const dx = (r() * 2 - 1) * 160 * amount;
    ctx.drawImage(glitchCanvas, 0, y, W, h, dx, y, W, h);
  }
  // A few solid blocks in brand colours.
  const blocks = Math.floor(amount * 6);
  for (let i = 0; i < blocks; i++) {
    ctx.fillStyle = r() > 0.5 ? rgba(C.cyan, 0.5 * amount) : rgba('#ffffff', 0.35 * amount);
    ctx.fillRect(r() * W, r() * H, 40 + r() * 260, 2 + r() * 10);
  }
  ctx.restore();
}

// Directional smear for whip moves: the current frame is re-drawn several
// times along the motion vector.
let smearCanvas = null;
export function smear(ctx, dx, dy, taps = 10) {
  const len = Math.hypot(dx, dy);
  if (len < 2) return;
  if (!smearCanvas) smearCanvas = makeCanvas(W, H);
  const s = smearCanvas.getContext('2d');
  s.globalCompositeOperation = 'copy';
  s.drawImage(ctx.canvas, 0, 0);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 1; i <= taps; i++) {
    const f = i / taps - 0.5;
    ctx.globalAlpha = 1 / (i + 1);
    ctx.drawImage(smearCanvas, dx * f, dy * f);
  }
  ctx.restore();
}
