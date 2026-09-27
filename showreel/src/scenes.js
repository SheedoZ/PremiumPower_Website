// The 30-second film, shot by shot. render(ctx, t) draws any moment of it.
//
//  0.0  Cairo at night, the grid monitor           4.1  generator controller, 0 → 1500 rpm
//  2.0  blackout: THE GRID GOES DOWN.              6.0  drop: the lights return, logo sting
//  3.5  YOUR BUSINESS DOESN'T.                     8.0  8 → 3000 KVA
// 10.0  Perkins, Volvo Penta, Doosan              12.0  product hero shots with callouts
// 15.0  105 → 65 dB                               17.0  eight services on the beat
// 19.0  turnkey process                           21.0  track record
// 23.5  coverage map of Egypt                     26.0  call to action and end card
import {
  W, H, CX, CY, C, F, clamp, lerp, TAU, ease, P, rng, hash, noise1, snoise,
  makeCanvas, font, rgba, mixHex, textWidth, drawText, riseText, scramble,
  line, polyPartial, brackets, boltPath, grain, vignette, bloom, chroma, glitch, smear,
} from './core.js';
import { drawCity } from './city.js';
import { A, loadAssets } from './assets.js';
import { T, SERVICES, PROCESS, STATS } from './cues.js';

export async function preload() {
  await loadAssets();
}

// ================================================================ utilities
const scratch = {};
function scratchCanvas(name, w, h) {
  let c = scratch[name];
  if (!c || c.width < w || c.height < h) c = scratch[name] = makeCanvas(Math.ceil(w) + 2, Math.ceil(h) + 2);
  return c;
}

// Down-scaled copies of large images, so small draws stay crisp.
const scaledCache = new Map();
function scaled(img, h) {
  if (h >= img.height * 0.8) return img;
  const bucket = Math.min(img.height, Math.ceil(h / 32) * 32 * 1.25);
  const key = img;
  let m = scaledCache.get(key);
  if (!m) scaledCache.set(key, (m = new Map()));
  let c = m.get(bucket);
  if (!c) {
    const s = bucket / img.height;
    c = makeCanvas(Math.round(img.width * s), Math.round(bucket));
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, c.width, c.height);
    m.set(bucket, c);
  }
  return c;
}

function img(ctx, im, x, y, w, h) {
  ctx.drawImage(scaled(im, h), x, y, w, h);
}

// A band of light across an image's pixels only.
function shine(ctx, im, x, y, w, h, pos, alpha = 0.7, width = 0.18) {
  if (pos <= 0 || pos >= 1 || w < 2 || h < 2) return;
  const c = scratchCanvas('shine', w, h);
  const g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, c.width, c.height);
  g.drawImage(scaled(im, h), 0, 0, w, h);
  g.globalCompositeOperation = 'source-in';
  const bx = lerp(-0.35, 1.35, pos) * w;
  const gr = g.createLinearGradient(bx - w * width, 0, bx + w * width, h * 0.5);
  gr.addColorStop(0, 'rgba(255,255,255,0)');
  gr.addColorStop(0.5, 'rgba(255,255,255,1)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha *= alpha;
  ctx.drawImage(c, 0, 0, w, h, x, y, w, h);
  ctx.restore();
}

function studio(ctx, t, o = {}) {
  const g = ctx.createRadialGradient(CX + (o.cx || 0), CY + (o.cy ?? -90), 30, CX, CY, 1250);
  g.addColorStop(0, o.inner || '#0C2A50');
  g.addColorStop(0.5, o.mid || '#061430');
  g.addColorStop(1, '#02060D');
  ctx.fillStyle = g;
  ctx.fillRect(-400, -400, W + 800, H + 800);
  if (o.grid !== false) blueprint(ctx, o.gridAlpha ?? 0.045, o.sx || 0, o.sy || 0, o.gridColor || C.ice);
}

function blueprint(ctx, a, sx, sy, col) {
  const s = 64;
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(col, a);
  const ox = ((sx % s) + s) % s, oy = ((sy % s) + s) % s;
  ctx.beginPath();
  for (let x = ox - s; x < W + s; x += s) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); }
  for (let y = oy - s; y < H + s; y += s) { ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); }
  ctx.stroke();
  const big = s * 4;
  const bx = ((sx % big) + big) % big, by = ((sy % big) + big) % big;
  ctx.strokeStyle = rgba(col, a * 2.4);
  ctx.beginPath();
  for (let x = bx - big; x < W + big; x += big) for (let y = by - big; y < H + big; y += big) {
    ctx.moveTo(x - 6, y + 0.5); ctx.lineTo(x + 6, y + 0.5);
    ctx.moveTo(x + 0.5, y - 6); ctx.lineTo(x + 0.5, y + 6);
  }
  ctx.stroke();
  ctx.restore();
}

function kicker(ctx, str, x, y, p, color = C.cyan, size = 22, align = 'left') {
  if (p <= 0) return;
  ctx.save();
  font(ctx, F.sans, size, 600);
  ctx.fillStyle = color;
  if (align === 'left') {
    ctx.fillRect(x, y - size * 0.4, 42 * ease.out3(clamp(p * 1.6)), 2);
    riseText(ctx, str, x + 58, y, ease.out3(clamp(p)), size, { ls: size * 0.3 });
  } else {
    riseText(ctx, str, x, y, ease.out3(clamp(p)), size, { ls: size * 0.3, align });
  }
  ctx.restore();
}

// Several coloured runs on one line, each rising out of its own mask.
function headline(ctx, parts, x, y, size, p, { align = 'left', ls = 0, stagger = 0.14 } = {}) {
  if (p <= 0) return 0;
  ctx.save();
  font(ctx, F.display, size, 400);
  const widths = parts.map(pt => textWidth(ctx, pt.t, ls));
  const total = widths.reduce((a, b) => a + b, 0) + ls * (parts.length - 1);
  let x0 = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const n = parts.length;
  parts.forEach((pt, i) => {
    const pi = ease.out4(clamp(p * (1 + stagger * (n - 1)) - i * stagger));
    ctx.fillStyle = pt.c;
    ctx.strokeStyle = pt.c;
    ctx.lineWidth = pt.lw || 2.5;
    if (pt.glow) { ctx.shadowColor = pt.c; ctx.shadowBlur = pt.glow; }
    riseText(ctx, pt.t, x0, y, pi, size, { ls, stroke: pt.stroke });
    ctx.shadowBlur = 0;
    x0 += widths[i] + ls;
  });
  ctx.restore();
  return total;
}

// Odometer digit value for column k, with true carry behaviour: a column
// only rolls while every column to its right is passing 9 → 0.
function odoDigit(v, k) {
  const p10 = 10 ** k;
  const q = Math.floor(v / p10);
  const base = ((q % 10) + 10) % 10;
  if (k === 0) return base + (v - Math.floor(v));
  const r = v - q * p10;
  return base + (r > p10 - 1 ? r - (p10 - 1) : 0);
}

function odometer(ctx, v, x, y, size, digits, { color = C.white, lead = 0.16, colW = 0 } = {}) {
  ctx.save();
  font(ctx, F.display, size, 400);
  const dw = colW || ctx.measureText('0').width * 1.06;
  const lineH = size * 0.94;
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  for (let k = 0; k < digits; k++) {
    const cx = x + (digits - 1 - k) * dw + dw / 2;
    const d = odoDigit(v, k);
    const base = Math.floor(d), frac = d - base;
    let a = 1;
    if (k > 0 && v < 10 ** k) a = lerp(lead, 1, frac);
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - dw / 2 - 4, y - size * 0.86, dw + 8, size * 0.99);
    ctx.clip();
    ctx.globalAlpha *= a;
    for (let j = 0; j <= 1; j++) ctx.fillText(String((base + j) % 10), cx, y + (j - frac) * lineH);
    ctx.restore();
  }
  ctx.restore();
  return dw * digits;
}

// Leader-line callout. pts: anchor → elbow → label point.
function callout(ctx, pts, title, sub, p) {
  if (p <= 0) return;
  const [ax, ay] = pts[0];
  const [lx, ly] = pts[pts.length - 1];
  const dir = lx >= pts[pts.length - 2][0] ? 1 : -1;
  const align = dir > 0 ? 'left' : 'right';
  const pd = ease.out3(clamp(p / 0.2));
  const pl = ease.io3(clamp((p - 0.1) / 0.4));
  const pt = clamp((p - 0.38) / 0.5);
  ctx.save();
  ctx.fillStyle = C.white;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(ax, ay, 6 * pd, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  const ring = clamp(p * 1.6);
  ctx.strokeStyle = rgba(C.cyan, 0.9 * (1 - ring));
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ax, ay, 6 + 34 * ring, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = rgba(C.ice, 0.9);
  ctx.lineWidth = 1.6;
  polyPartial(ctx, pts, pl);
  ctx.stroke();
  if (pt > 0) {
    ctx.fillStyle = C.white;
    font(ctx, F.sans, 23, 700);
    riseText(ctx, title, lx + dir * 16, ly - 9, ease.out3(pt), 23, { ls: 2.5, align });
    font(ctx, F.mono, 17, 500);
    ctx.fillStyle = C.ice;
    drawText(ctx, scramble(sub, ease.out2(clamp((pt - 0.15) / 0.7)), p * 4, 5), lx + dir * 16, ly + 25, { ls: 1, align });
  }
  ctx.restore();
}

function glowLine(ctx, x1, y1, x2, y2, color, w = 2, blur = 14) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  line(ctx, x1, y1, x2, y2);
  ctx.restore();
}

function particles(ctx, t, t0, cx, cy, n, seed, { speed = 900, life = 0.9, color = C.ice, size = 3, gravity = 380 } = {}) {
  const dt = t - t0;
  if (dt < 0 || dt > life * 1.4) return;
  const r = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const ang = r() * TAU, sp = speed * (0.25 + r() * 0.75), l = life * (0.5 + r() * 0.5);
    const k = dt / l;
    if (k >= 1) continue;
    const drag = (1 - Math.exp(-dt * 3)) / 3;
    const x = cx + Math.cos(ang) * sp * drag;
    const y = cy + Math.sin(ang) * sp * drag + 0.5 * gravity * dt * dt;
    const a = (1 - k) ** 1.5;
    ctx.strokeStyle = rgba(color, a);
    ctx.lineWidth = size * (1 - k * 0.6);
    const vx = Math.cos(ang) * sp * Math.exp(-dt * 3) * 0.02, vy = (Math.sin(ang) * sp * Math.exp(-dt * 3) + gravity * dt) * 0.02;
    line(ctx, x, y, x - vx, y - vy);
  }
  ctx.restore();
}

// Anamorphic flare: a long horizontal streak with a hot core.
function flare(ctx, x, y, k, color = C.ice) {
  if (k <= 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const w = 2000 * (0.55 + 0.45 * k);
  const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, 'rgba(0,156,222,0)');
  g.addColorStop(0.5, rgba(color, 0.95 * k));
  g.addColorStop(1, 'rgba(0,156,222,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - w / 2, y - 2.5 * k, w, 5 * k);
  ctx.globalAlpha = 0.3 * k;
  ctx.fillRect(x - w / 2, y - 16 * k, w, 32 * k);
  ctx.globalAlpha = 1;
  const r = 190 * k;
  const core = ctx.createRadialGradient(x, y, 0, x, y, r);
  core.addColorStop(0, rgba('#FFFFFF', 0.85 * k));
  core.addColorStop(0.25, rgba(C.cyan, 0.35 * k));
  core.addColorStop(1, 'rgba(0,156,222,0)');
  ctx.fillStyle = core;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

function shockwave(ctx, t, t0, cx, cy, { dur = 0.7, maxR = 1300, color = C.ice, w = 26 } = {}) {
  const k = (t - t0) / dur;
  if (k < 0 || k > 1) return;
  const r = maxR * ease.out3(k);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = rgba(color, 0.55 * (1 - k) ** 2);
  ctx.lineWidth = w * (1 - k) + 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function lightning(ctx, t, t0, dur, x1, y1, x2, y2, seed, w = 3) {
  const k = (t - t0) / dur;
  if (k < 0 || k > 1) return;
  const frame = Math.floor(t * 30);
  const pts = boltPath(x1, y1, x2, y2, seed * 131 + frame, 0.2, 6);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = rgba('#E8F8FF', (1 - k) * (hash(frame + seed) > 0.25 ? 1 : 0.3));
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 22;
  ctx.lineWidth = w * (1 - k * 0.5);
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.restore();
}

// ================================================================ logo
const LOGO_W = 1385, LOGO_H = 1333;
// Outline of the bolt in logo pixels, traced from the artwork.
const BOLT = [[876, 60], [1327, 60], [1226, 300], [1123, 545], [1347, 568], [1213, 750], [1095, 900],
  [977, 1050], [788, 1290], [754, 1300], [858, 990], [888, 900], [1012, 750], [1068, 600], [1079, 480],
  [1050, 300], [961, 150]];

function drawMark(ctx, cx, cy, h, o = {}) {
  const s = h / LOGO_H, w = LOGO_W * s;
  const x = cx - w / 2, y = cy - h / 2;
  ctx.save();
  if ((o.p ?? 1) > 0) {
    ctx.globalAlpha = o.p ?? 1;
    img(ctx, A.logoP, x, y, w, h);
  }
  if ((o.bolt ?? 1) > 0) {
    ctx.globalAlpha = o.bolt ?? 1;
    img(ctx, A.logoBolt, x + (o.bdx || 0), y + (o.bdy || 0), w, h);
  }
  if (o.flash > 0) {
    ctx.globalAlpha = o.flash;
    img(ctx, A.logoWhite, x, y, w, h);
  }
  ctx.restore();
  if (o.shine > 0 && o.shine < 1) shine(ctx, A.logo, x, y, w, h, o.shine, 0.75);
  return { x, y, w, h, s };
}

function wordmark(ctx, x, yTop, size, p1, p2, ls) {
  ctx.save();
  font(ctx, F.display, size, 400);
  ctx.fillStyle = C.white;
  riseText(ctx, 'PREMIUM', x, yTop + size * 0.74, ease.out4(p1), size, { ls });
  ctx.fillStyle = C.cyan;
  ctx.shadowColor = rgba(C.cyan, 0.6);
  ctx.shadowBlur = 20;
  riseText(ctx, 'POWER', x, yTop + size * 0.74 + size * 0.86, ease.out4(p2), size, { ls });
  ctx.restore();
  font(ctx, F.display, size, 400);
  return Math.max(textWidth(ctx, 'PREMIUM', ls), textWidth(ctx, 'POWER', ls));
}

// Lockup geometry for a mark of height h: mark + two-line wordmark.
function lockupGeom(ctx, h, cy) {
  const size = h * 0.56, ls = size * 0.06;
  font(ctx, F.display, size, 400);
  const ww = Math.max(textWidth(ctx, 'PREMIUM', ls), textWidth(ctx, 'POWER', ls));
  const mw = LOGO_W * (h / LOGO_H);
  const gap = h * 0.12;
  const total = mw * 0.97 + gap + ww;
  const x0 = CX - total / 2;
  return { markCx: x0 + mw / 2, markCy: cy, textX: x0 + mw * 0.97 + gap, textTop: cy - size * 0.83, size, ls };
}

// ================================================================ scene 1-3: the grid fails
function freqAt(t) {
  if (t < T.unstable) return 50 + snoise(t * 3, 1) * 0.015;
  if (t < T.blackout) return 50 - (t - T.unstable) * 4.2 - Math.abs(snoise(t * 25, 2)) * 1.2;
  return 0;
}

function mainsWave(ctx, t, x0, x1, y, amp, chaos) {
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 3) {
    const u = (x - x0) / (x1 - x0);
    let v = Math.sin(u * 9 * TAU - t * 11);
    if (chaos > 0) {
      v += chaos * snoise(u * 60 + t * 30, 3) * 0.9;
      v *= 1 - chaos * 0.5 * noise1(u * 8 + t * 12, 4);
    }
    const yy = y - v * amp;
    if (x === x0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
  }
  ctx.stroke();
}

function clockStr(t, base = 14 * 60 + 7) {
  const s = base + t;
  const mm = Math.floor(s / 60) % 60, ss = Math.floor(s) % 60, cs = Math.floor((s % 1) * 100);
  return `02:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function gridHud(ctx, t) {
  const a = P(t, T.hudOn, T.hudOn + 0.45, ease.out3) * (1 - P(t, 2.35, 2.9));
  if (a <= 0) return;
  const failing = t >= T.unstable, dead = t >= T.blackout;
  const warn = P(t, T.unstable, 1.9);
  const col = dead ? C.red : mixHex(C.cyan, C.red, warn);
  ctx.save();
  ctx.globalAlpha = a;

  // Status, top left.
  const blink = dead ? (Math.floor(t * 6) % 2 ? 0.25 : 1) : 0.6 + 0.4 * Math.sin(t * 8);
  ctx.fillStyle = rgba(col, blink);
  ctx.beginPath();
  ctx.arc(128, 143, 7, 0, TAU);
  ctx.fill();
  font(ctx, F.mono, 22, 700);
  ctx.fillStyle = col;
  const status = dead ? 'MAINS LOST' : failing ? 'MAINS UNSTABLE' : 'MAINS ONLINE';
  drawText(ctx, scramble(status, P(t, T.hudOn, T.hudOn + 0.4), t, 2), 148, 151, { ls: 3 });
  font(ctx, F.mono, 16, 500);
  ctx.fillStyle = rgba(C.mist, 0.85);
  drawText(ctx, 'CAIRO  ' + clockStr(Math.min(t, 2.3)), 120, 186, { ls: 2 });

  // Readouts, top right.
  const f = freqAt(t);
  const v = dead ? 0 : t < T.unstable ? 400 + snoise(t * 2, 5) * 1.2 : 400 - (t - T.unstable) * 48 - Math.abs(snoise(t * 30, 6)) * 20;
  const load = dead ? 0 : 86 + snoise(t, 7) * 2;
  const rows = [['FREQUENCY', f.toFixed(2) + ' Hz'], ['VOLTAGE', Math.round(v) + ' V'], ['LOAD', Math.round(load) + ' %']];
  rows.forEach(([k, val], i) => {
    const p = P(t, T.hudOn + 0.1 + i * 0.08, T.hudOn + 0.5 + i * 0.08);
    const y = 151 + i * 34;
    font(ctx, F.mono, 16, 500);
    ctx.fillStyle = rgba(C.mist, 0.85);
    drawText(ctx, scramble(k, p, t, 3 + i), 1440, y, { ls: 2 });
    font(ctx, F.mono, 20, 700);
    ctx.fillStyle = i === 0 ? col : C.white;
    drawText(ctx, scramble(val, p, t, 9 + i), 1800, y, { ls: 1, align: 'right' });
  });

  // L1 waveform along the bottom.
  const collapse = P(t, T.blackout, T.blackout + 0.22, ease.out3);
  const amp = 30 * (1 - collapse) * (failing && !dead ? 1 - 0.35 * noise1(t * 20, 8) : 1);
  const chaos = dead ? 0 : warn;
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = col;
  ctx.shadowColor = col;
  ctx.shadowBlur = 14;
  const wp = P(t, T.hudOn, T.hudOn + 0.7, ease.io3);
  ctx.save();
  ctx.beginPath();
  ctx.rect(120, 900, 1680 * wp, 120);
  ctx.clip();
  mainsWave(ctx, t, 120, 1800, 962, amp, chaos);
  ctx.restore();
  ctx.shadowBlur = 0;
  font(ctx, F.mono, 15, 500);
  ctx.fillStyle = rgba(C.mist, 0.8);
  drawText(ctx, 'L1 · 400 V · 50 Hz', 120, 900, { ls: 2 });

  // Alarm banner.
  if (t > T.alarm[0] && t < 2.6) {
    const on = Math.floor((t - T.alarm[0]) * 5) % 2 === 0 || dead;
    const bw = 520, bh = 64, bx = CX - bw / 2, by = 230;
    ctx.strokeStyle = rgba(C.red, on ? 1 : 0.35);
    ctx.lineWidth = 2;
    ctx.fillStyle = rgba('#3A0508', on ? 0.75 : 0.4);
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = rgba(C.red, on ? 1 : 0.4);
    ctx.beginPath();
    ctx.moveTo(bx + 40, by + 16);
    ctx.lineTo(bx + 58, by + 48);
    ctx.lineTo(bx + 22, by + 48);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2A0003';
    ctx.fillRect(bx + 38.5, by + 26, 3, 12);
    ctx.fillRect(bx + 38.5, by + 41, 3, 3);
    font(ctx, F.mono, 22, 700);
    ctx.fillStyle = rgba('#FFD6D6', on ? 1 : 0.45);
    drawText(ctx, dead ? 'GRID FAILURE · MAINS LOST' : 'WARNING · GRID UNSTABLE', bx + 78, by + 40, { ls: 2 });
  }
  ctx.restore();
}

function rgbText(ctx, str, x, y, split, a = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a;
  ctx.fillStyle = '#FF3030';
  drawText(ctx, str, x - split, y, { ls: 6, align: 'center' });
  ctx.fillStyle = '#00E1FF';
  drawText(ctx, str, x + split, y, { ls: 6, align: 'center' });
  ctx.restore();
}

function lineOne(ctx, t) {
  const pIn = P(t, T.line1, T.line1 + 0.2);
  const pOut = P(t, T.line1Out - 0.1, T.line1Out);
  if (pIn <= 0 || pOut >= 1) return;
  ctx.save();
  font(ctx, F.mono, 22, 700);
  ctx.fillStyle = rgba(C.red, (1 - pOut) * pIn);
  drawText(ctx, scramble(clockStr(0.9 + 1.2) + ' · MAINS LOST', pIn, t, 7), CX, 420, { ls: 4, align: 'center' });
  font(ctx, F.display, 190, 400);
  const str = 'THE GRID GOES DOWN.';
  const tick = Math.floor(t * 40);
  const visible = pOut > 0 ? (hash(tick * 3 + 1) > pOut ? 1 : 0) : 1;
  if (visible) {
    const split = 2 + 14 * (1 - ease.out3(pIn)) + (hash(tick) > 0.85 ? 8 : 0);
    ctx.save();
    // Glitch-in: slices of the line appear in random order.
    const r = rng(9);
    const slices = 9;
    for (let i = 0; i < slices; i++) {
      const show = r() * 0.8;
      if (pIn < show) continue;
      const y0 = 600 - 150 + i * (190 / slices);
      const dx = pIn < 1 ? (hash(i * 7 + tick) - 0.5) * 60 * (1 - pIn) : 0;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, y0, W, 190 / slices + 0.5);
      ctx.clip();
      rgbText(ctx, str, CX + dx, 640, split);
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
}

function lineTwo(ctx, t) {
  const pIn = P(t, T.line2, T.line2 + 0.24, ease.out3);
  const pOut = P(t, 4.08, 4.38, ease.in3);
  if (pOut >= 1) return;
  ctx.save();
  ctx.translate(CX, 600 - pOut * 180);
  const s = lerp(1.14, 1, pIn) * lerp(1, 0.55, pOut);
  ctx.scale(s, s);
  ctx.globalAlpha = clamp(pIn * 4) * (1 - pOut);
  headline(ctx, [{ t: 'YOUR BUSINESS ', c: C.white }, { t: "DOESN'T.", c: C.cyan, glow: 30 }], 0, 40, 190, 1,
    { align: 'center', ls: 5 });
  ctx.restore();
}

function rpmAt(t) {
  if (t < T.crank) return 0;
  if (t < T.fire) return 150 + 45 * Math.abs(Math.sin((t - T.crank) * 38)) + (t - T.crank) * 100;
  if (t < T.rated) return lerp(240, 1548, ease.out3((t - T.fire) / (T.rated - T.fire)));
  const k = clamp((t - T.rated) / 0.35);
  return lerp(1548, 1500, ease.out3(k)) + snoise(t * 25, 2) * 2 * (1 - k);
}

function gauge(ctx, t, cx, cy, R, build, rpm) {
  const a0 = Math.PI * 0.75, sweep = Math.PI * 1.5, maxR = 1800;
  const ang = v => a0 + sweep * clamp(v / maxR);
  ctx.save();
  ctx.lineCap = 'butt';
  ctx.strokeStyle = rgba(C.ice, 0.16);
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, R, a0, a0 + sweep * build);
  ctx.stroke();
  for (let v = 0; v <= maxR; v += 100) {
    if (v / maxR > build) break;
    const an = ang(v), major = v % 300 === 0;
    const r1 = R - (major ? 42 : 30), r2 = R - 18;
    const band = v >= 1400 && v <= 1600;
    ctx.strokeStyle = rgba(band ? C.cyan : C.ice, major ? 0.85 : 0.4);
    ctx.lineWidth = major ? 3 : 1.5;
    line(ctx, cx + Math.cos(an) * r1, cy + Math.sin(an) * r1, cx + Math.cos(an) * r2, cy + Math.sin(an) * r2);
    if (major) {
      font(ctx, F.mono, 17, 500);
      ctx.fillStyle = rgba(C.mist, 0.9);
      ctx.textAlign = 'center';
      ctx.fillText(String(v), cx + Math.cos(an) * (R + 40), cy + Math.sin(an) * (R + 40) + 6);
      ctx.textAlign = 'left';
    }
  }
  if (rpm > 1) {
    ctx.save();
    ctx.shadowColor = C.cyan;
    ctx.shadowBlur = 30;
    const g = ctx.createLinearGradient(cx - R, cy + R, cx + R, cy - R);
    g.addColorStop(0, C.blue);
    g.addColorStop(1, C.ice);
    ctx.strokeStyle = g;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, R, a0, ang(rpm));
    ctx.stroke();
    ctx.restore();
    const an = ang(rpm);
    ctx.strokeStyle = C.white;
    ctx.lineWidth = 4;
    ctx.shadowColor = C.ice;
    ctx.shadowBlur = 18;
    line(ctx, cx + Math.cos(an) * (R * 0.66), cy + Math.sin(an) * (R * 0.66), cx + Math.cos(an) * (R - 16), cy + Math.sin(an) * (R - 16));
    ctx.shadowBlur = 0;
  }
  // Inner dial ring framing the readout.
  ctx.strokeStyle = rgba(C.ice, 0.14);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.6, a0, a0 + sweep * build);
  ctx.stroke();
  ctx.restore();
}

function atsDiagram(ctx, t, x0, y0, a) {
  if (a <= 0) return;
  const running = t >= T.fire;
  const k = P(t, T.ats - 0.06, T.ats, ease.in3);
  const onGen = k >= 1;
  const mX = x0 + 50, gX = x0 + 290, cY = y0 + 190, pvX = x0 + 170, pvY = y0 + 330;
  const flow = -t * 90;
  ctx.save();
  ctx.globalAlpha = a;
  font(ctx, F.sans, 16, 600);
  ctx.fillStyle = rgba(C.mist, 0.9);
  drawText(ctx, 'AUTOMATIC TRANSFER SWITCH', x0, y0 - 44, { ls: 3 });
  const node = (x, label, col, glow) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = '#081830';
    if (glow) { ctx.shadowColor = col; ctx.shadowBlur = 22; }
    ctx.beginPath();
    ctx.arc(x, y0 + 40, 34, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    font(ctx, F.mono, 22, 700);
    ctx.fillStyle = col;
    drawText(ctx, label, x, y0 + 48, { align: 'center' });
  };
  node(mX, 'M', C.red, false);
  node(gX, 'G', running ? C.cyan : C.steel, running);
  // Dead mains: a cross through the feeder.
  ctx.strokeStyle = C.red;
  ctx.lineWidth = 3;
  line(ctx, mX - 16, y0 + 110, mX + 16, y0 + 142);
  line(ctx, mX + 16, y0 + 110, mX - 16, y0 + 142);
  const feeder = (x, live) => {
    ctx.save();
    ctx.strokeStyle = live ? C.cyan : rgba(C.steel, 0.8);
    ctx.lineWidth = live ? 3 : 2;
    if (live) { ctx.setLineDash([14, 10]); ctx.lineDashOffset = flow; ctx.shadowColor = C.cyan; ctx.shadowBlur = 12; }
    line(ctx, x, y0 + 74, x, cY);
    ctx.restore();
  };
  feeder(mX, false);
  feeder(gX, running);
  for (const x of [mX, gX]) {
    ctx.fillStyle = C.white;
    ctx.beginPath();
    ctx.arc(x, cY, 6, 0, TAU);
    ctx.fill();
  }
  // The blade swings from the mains contact to the generator contact.
  const tx = lerp(mX, gX, k), ty = cY + 8 * Math.sin(k * Math.PI);
  ctx.save();
  ctx.strokeStyle = onGen ? C.cyan : C.white;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  if (onGen) { ctx.shadowColor = C.cyan; ctx.shadowBlur = 20; }
  line(ctx, pvX, pvY, tx + (onGen ? 0 : -6), ty + (onGen ? 0 : 10));
  ctx.restore();
  ctx.fillStyle = C.white;
  ctx.beginPath();
  ctx.arc(pvX, pvY, 8, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.strokeStyle = onGen ? C.cyan : rgba(C.steel, 0.8);
  ctx.lineWidth = onGen ? 3 : 2;
  if (onGen) { ctx.setLineDash([14, 10]); ctx.lineDashOffset = flow; ctx.shadowColor = C.cyan; ctx.shadowBlur = 12; }
  line(ctx, pvX, pvY, pvX, pvY + 90);
  ctx.restore();
  ctx.strokeStyle = onGen ? C.cyan : rgba(C.mist, 0.6);
  ctx.lineWidth = 2;
  ctx.fillStyle = onGen ? rgba(C.cyan, 0.2) : '#081830';
  ctx.beginPath();
  ctx.roundRect(pvX - 80, pvY + 90, 160, 50, 4);
  ctx.fill();
  ctx.stroke();
  font(ctx, F.mono, 18, 700);
  ctx.fillStyle = onGen ? C.white : C.mist;
  drawText(ctx, 'LOAD', pvX, pvY + 122, { align: 'center', ls: 4 });
  font(ctx, F.mono, 14, 500);
  ctx.fillStyle = rgba(C.mist, 0.8);
  drawText(ctx, 'MAINS', mX, y0 - 8, { align: 'center', ls: 2 });
  drawText(ctx, 'GENERATOR', gX, y0 - 8, { align: 'center', ls: 2 });
  ctx.restore();
}

const LOG = [
  [T.panel + 0.02, '02:14:09', 'MAINS FAIL', C.red],
  [T.crank, '02:14:10', 'START SIGNAL', C.white],
  [T.fire, '02:14:11', 'ENGINE RUNNING', C.white],
  [T.rated, '02:14:14', '1500 RPM · 50.0 Hz', C.ice],
  [5.66, '02:14:15', '400 V · READY', C.ice],
  [T.ats, '02:14:16', 'ATS → GENERATOR', C.cyan],
];

function eventLog(ctx, t, x0, y0, a) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  font(ctx, F.sans, 16, 600);
  ctx.fillStyle = rgba(C.mist, 0.9);
  drawText(ctx, 'EVENT LOG', x0, y0 - 44, { ls: 3 });
  ctx.strokeStyle = rgba(C.ice, 0.25);
  ctx.lineWidth = 1;
  line(ctx, x0, y0 - 28, x0 + 400, y0 - 28);
  LOG.forEach(([tl, ts, msg, col], i) => {
    const p = P(t, tl, tl + 0.22);
    if (p <= 0) return;
    const y = y0 + i * 44;
    font(ctx, F.mono, 16, 500);
    ctx.fillStyle = rgba(C.mist, 0.75);
    drawText(ctx, ts, x0, y, { ls: 1 });
    font(ctx, F.mono, 18, 700);
    ctx.fillStyle = col;
    drawText(ctx, scramble(msg, p, t, 20 + i), x0 + 110, y, { ls: 1 });
  });
  ctx.restore();
}

function controller(ctx, t) {
  const build = P(t, T.panel, T.panel + 0.55, ease.io3);
  const a = P(t, T.panel, T.panel + 0.2);
  const rpm = rpmAt(t);
  const tension = P(t, 5.3, T.cutBlack, ease.in2);
  ctx.save();
  // Push towards the gauge as the drop approaches.
  const z = 1 + 0.07 * tension;
  ctx.translate(CX, 575);
  ctx.scale(z, z);
  ctx.translate(-CX, -575);

  // Rays behind the gauge.
  if (tension > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(CX, 575);
    ctx.rotate(t * 0.6);
    for (let i = 0; i < 36; i++) {
      const an = (i / 36) * TAU;
      ctx.strokeStyle = rgba(C.cyan, 0.12 * tension * (0.5 + 0.5 * hash(i)));
      ctx.lineWidth = 2;
      line(ctx, Math.cos(an) * 300, Math.sin(an) * 300, Math.cos(an) * (500 + 600 * tension), Math.sin(an) * (500 + 600 * tension));
    }
    ctx.restore();
  }

  ctx.globalAlpha = a;
  gauge(ctx, t, CX, 575, 250, build, rpm);
  // RPM readout.
  const readA = P(t, T.panel + 0.3, T.panel + 0.5);
  ctx.globalAlpha = a * readA;
  font(ctx, F.mono, 92, 700);
  ctx.fillStyle = C.white;
  ctx.shadowColor = rgba(C.cyan, 0.8);
  ctx.shadowBlur = 24 * clamp(rpm / 1500);
  drawText(ctx, String(Math.round(rpm)).padStart(4, '0'), CX, 610, { align: 'center', ls: 2 });
  ctx.shadowBlur = 0;
  font(ctx, F.sans, 18, 600);
  ctx.fillStyle = C.mist;
  drawText(ctx, 'RPM', CX, 652, { align: 'center', ls: 8 });

  // Frequency / voltage / power factor under the gauge.
  const hz = rpm / 30, volts = 400 * clamp((rpm - 300) / 1200) ** 1.3;
  const cells = [['FREQ', hz.toFixed(1) + ' Hz'], ['VOLT', Math.round(volts) + ' V'], ['PF', rpm > 1400 ? '0.80' : '--']];
  cells.forEach(([k, v], i) => {
    const p = P(t, T.panel + 0.35 + i * 0.07, T.panel + 0.6 + i * 0.07, ease.out3);
    if (p <= 0) return;
    const x = CX - 280 + i * 190, y = 875;
    ctx.globalAlpha = a * p;
    ctx.strokeStyle = rgba(C.ice, 0.35);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y - 50 + (1 - p) * 20, 170, 74, 4);
    ctx.stroke();
    font(ctx, F.mono, 14, 500);
    ctx.fillStyle = C.mist;
    drawText(ctx, k, x + 14, y - 26 + (1 - p) * 20, { ls: 3 });
    font(ctx, F.mono, 24, 700);
    ctx.fillStyle = C.white;
    drawText(ctx, v, x + 14, y + 8 + (1 - p) * 20, { ls: 1 });
  });

  // Status pill.
  const states = [[T.panel, 'MAINS FAILURE', C.red], [T.crank, 'CRANKING', '#FFB347'], [T.fire, 'RUNNING UP', C.cyan],
    [T.rated, 'READY TO TRANSFER', C.cyan], [T.ats, 'ON LOAD', C.white]];
  let st = states[0];
  for (const s of states) if (t >= s[0]) st = s;
  ctx.globalAlpha = a;
  font(ctx, F.mono, 20, 700);
  const sw = textWidth(ctx, st[1], 4) + 64;
  ctx.fillStyle = st[1] === 'ON LOAD' ? C.cyan : rgba(st[2], 0.14);
  ctx.strokeStyle = st[2];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(CX - sw / 2, 186, sw, 48, 24);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = st[1] === 'ON LOAD' ? '#02101F' : st[2];
  drawText(ctx, st[1], CX, 217, { align: 'center', ls: 4 });
  ctx.restore();

  const side = P(t, T.panel + 0.15, T.panel + 0.55, ease.out3);
  ctx.save();
  ctx.translate(-80 * (1 - side), 0);
  atsDiagram(ctx, t, 150, 360, side);
  ctx.restore();
  ctx.save();
  ctx.translate(80 * (1 - side), 0);
  eventLog(ctx, t, 1380, 360, side);
  ctx.restore();

  // Energy converging on the gauge just before the drop.
  if (tension > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const r = rng(55);
    for (let i = 0; i < 70; i++) {
      const an = r() * TAU, d0 = 500 + r() * 700, sp = 0.6 + r() * 0.8;
      const k = ((t - 5.3) * sp * 1.8 + r()) % 1;
      const d = d0 * (1 - ease.in2(k));
      const x = CX + Math.cos(an) * d, y = 575 + Math.sin(an) * d;
      ctx.strokeStyle = rgba(C.ice, 0.7 * tension * k);
      ctx.lineWidth = 2;
      line(ctx, x, y, x + Math.cos(an) * 30, y + Math.sin(an) * 30);
    }
    ctx.restore();
  }
}

function sceneGrid(ctx, t) {
  const cam = { s: 1 + 0.1 * ease.smooth(clamp(t / 6)), x: lerp(-30, 50, t / 6), y: 0 };
  drawCity(ctx, t, cam, { dim: 0.62 * P(t, 3.9, 4.4, ease.out3) });
  gridHud(ctx, t);
  lineOne(ctx, t);
  if (t >= T.line2) lineTwo(ctx, t);
  if (t >= T.panel) controller(ctx, t);
  if (t >= T.cutBlack) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
  }
}

// ================================================================ scene 4: drop + logo
let cityBuf = null, cityBlur = null;
function softCity(ctx, t, cam, dim, blur = 2) {
  if (!cityBuf) {
    cityBuf = makeCanvas(W / 2, H / 2);
    cityBlur = makeCanvas(W / 2, H / 2);
  }
  const g = cityBuf.getContext('2d');
  g.setTransform(0.5, 0, 0, 0.5, 0, 0);
  drawCity(g, t, cam);
  // Blur at half size, then scale up: cheap depth of field.
  const b = cityBlur.getContext('2d');
  b.globalCompositeOperation = 'copy';
  b.filter = blur > 0.2 ? `blur(${blur / 2}px)` : 'none';
  b.drawImage(cityBuf, 0, 0);
  b.filter = 'none';
  ctx.save();
  ctx.drawImage(cityBlur, 0, 0, W, H);
  ctx.fillStyle = `rgba(2,6,13,${dim})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Where the bolt of the zooming lockup sits on screen (used by the logo
// scene and by the next scene's reveal mask).
function logoZoom(ctx, t) {
  const L = lockupGeom(ctx, 300, 530);
  const s = 300 / LOGO_H;
  const bx = L.markCx + (1050 - LOGO_W / 2) * s, by = L.markCy + (680 - LOGO_H / 2) * s;
  const k = P(t, T.zoom, 8.02);
  const Z = Math.exp(Math.log(95) * ease.in4(k));
  const m = ease.io3(k);
  return { L, bx, by, Z, ox: (CX - bx) * m, oy: (CY - by) * m };
}

function applyZoom(ctx, z) {
  ctx.translate(z.bx + z.ox, z.by + z.oy);
  ctx.scale(z.Z, z.Z);
  ctx.translate(-z.bx, -z.by);
}

function boltClipAt(ctx, t) {
  const z = logoZoom(ctx, t);
  const s = 300 / LOGO_H;
  ctx.save();
  applyZoom(ctx, z);
  ctx.beginPath();
  BOLT.forEach(([x, y], i) => {
    const X = z.L.markCx + (x - LOGO_W / 2) * s, Y = z.L.markCy + (y - LOGO_H / 2) * s;
    if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
  });
  ctx.closePath();
  ctx.restore();
}

function sceneLogo(ctx, t) {
  const cam = { s: 1.1 + 0.06 * P(t, 6, 8.1, ease.out2), x: 50, y: 0 };
  const dim = lerp(0.05, 0.6, P(t, 6.15, 6.7, ease.out3));
  softCity(ctx, t, cam, dim, lerp(0.6, 3, P(t, 6.1, 6.8)));
  shockwave(ctx, t, T.drop, CX, 560, { dur: 0.8, maxR: 1400 });
  particles(ctx, t, T.drop, CX, 560, 90, 606, { speed: 1400, life: 1.0 });

  const z = logoZoom(ctx, t);
  ctx.save();
  applyZoom(ctx, z);
  const L = z.L;
  // Phase A: the mark on its own, the bolt strikes into the P.
  const pIn = P(t, 6.05, 6.4, ease.pop);
  const move = P(t, T.lockup, T.lockup + 0.42, ease.snap);
  const h = lerp(380, 300, move);
  const cx = lerp(CX, L.markCx, move), cy = lerp(520, L.markCy, move);
  const strike = P(t, 6.14, T.bolt, ease.in3);
  const flash = t >= T.bolt ? 1 - P(t, T.bolt, T.bolt + 0.3, ease.out2) : 0;
  const shineP = P(t, T.shine, T.shine + 0.45, ease.io2);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(lerp(0.72, 1, pIn), lerp(0.72, 1, pIn));
  drawMark(ctx, 0, 0, h, {
    p: clamp(pIn * 2.5) * (1 - P(t, T.zoom + 0.02, T.zoom + 0.2)),
    bolt: t >= 6.14 ? 1 : 0,
    bdx: 320 * (1 - strike), bdy: -560 * (1 - strike),
    flash,
    shine: shineP,
  });
  ctx.restore();
  // Arcs around the bolt at impact.
  for (let i = 0; i < 4; i++) {
    const an = -0.9 + i * 0.7;
    lightning(ctx, t, T.bolt + i * 0.03, 0.3, cx + 30, cy - 20, cx + Math.cos(an) * 420, cy + Math.sin(an) * 320, i + 3, 2.5);
  }
  // Phase B: wordmark and tagline.
  const p1 = P(t, T.wordmark, T.wordmark + 0.4), p2 = P(t, T.wordmark + 0.1, T.wordmark + 0.5);
  const zf = 1 - P(t, T.zoom, T.zoom + 0.12);
  ctx.globalAlpha = zf;
  if (p1 > 0 && zf > 0) {
    const ls = lerp(L.ls * 3, L.ls, ease.out4(p1));
    wordmark(ctx, L.textX, L.textTop, L.size, p1, p2, ls);
    if (shineP > 0 && shineP < 1) {
      // Shine over the words: render them into a buffer.
      const c = scratchCanvas('wm', 700, 360);
      const g = c.getContext('2d');
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, c.width, c.height);
      wordmark(g, 0, 20, L.size, 1, 1, L.ls);
      shine(ctx, c, L.textX, L.textTop - 20, c.width, c.height, clamp(shineP * 1.3 - 0.2), 0.8);
    }
  }
  const tg = P(t, T.tagline, T.tagline + 0.5, ease.out3) * zf;
  if (tg > 0) {
    ctx.save();
    font(ctx, F.sans, 23, 600);
    ctx.fillStyle = C.mist;
    const str = 'DIESEL GENERATOR SOLUTIONS  ·  EGYPT';
    const tw = textWidth(ctx, str, 7);
    riseText(ctx, str, CX, 790, tg, 23, { ls: 7, align: 'center' });
    ctx.strokeStyle = rgba(C.cyan, 0.8);
    ctx.lineWidth = 2;
    const lw = 110 * tg;
    line(ctx, CX - tw / 2 - 30, 782, CX - tw / 2 - 30 - lw, 782);
    line(ctx, CX + tw / 2 + 30, 782, CX + tw / 2 + 30 + lw, 782);
    ctx.restore();
  }
  ctx.restore();
}

// ================================================================ scene 5: 8 → 3000 KVA
const LN8 = Math.log(8), LN3000 = Math.log(3000);
const logX = (v, x0, x1) => lerp(x0, x1, (Math.log(v) - LN8) / (LN3000 - LN8));

function kvaAt(t) {
  const k = P(t, T.rollA, T.rollB, ease.io3);
  return Math.exp(lerp(LN8, LN3000, k));
}

function sceneRange(ctx, t) {
  ctx.save();
  if (t < 8.02) {
    boltClipAt(ctx, t);
    ctx.clip();
  }
  const out = P(t, T.rangeOut, 10.02, ease.in4);
  ctx.save();
  ctx.translate(0, -out * H);
  studio(ctx, t, { sy: -out * 300, cx: -200 });
  const v = kvaAt(t);
  const pl = (Math.log(v) - LN8) / (LN3000 - LN8);

  kicker(ctx, 'POWER RANGE', 200, 300, P(t, 8.0, 8.45));
  // Big odometer.
  const inP = P(t, 7.95, 8.3, ease.out3);
  ctx.save();
  ctx.globalAlpha = inP;
  ctx.shadowColor = rgba(C.cyan, 0.35);
  ctx.shadowBlur = 40;
  const dw = odometer(ctx, v, 186, 740, 470, 4, { color: C.white });
  ctx.restore();
  ctx.save();
  font(ctx, F.display, 170, 400);
  ctx.fillStyle = C.cyan;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 30;
  riseText(ctx, 'KVA', 186 + dw + 26, 740, P(t, 8.08, 8.45, ease.out4), 170, { ls: 6 });
  ctx.restore();

  // Log scale under the number.
  const x0 = 200, x1 = 1130, y = 850;
  const sp = P(t, 8.1, 8.6, ease.io3);
  ctx.save();
  ctx.strokeStyle = rgba(C.ice, 0.3);
  ctx.lineWidth = 2;
  line(ctx, x0, y, lerp(x0, x1, sp), y);
  for (const tv of [8, 50, 100, 500, 1000, 3000]) {
    const x = logX(tv, x0, x1);
    if (x > lerp(x0, x1, sp)) continue;
    ctx.strokeStyle = rgba(C.ice, 0.55);
    line(ctx, x, y - 10, x, y + 10);
    font(ctx, F.mono, 16, 500);
    ctx.fillStyle = rgba(C.mist, 0.9);
    drawText(ctx, String(tv), x, y + 38, { align: 'center', ls: 1 });
  }
  const mx = logX(v, x0, x1);
  const g = ctx.createLinearGradient(x0, 0, mx, 0);
  g.addColorStop(0, rgba(C.blue, 0.2));
  g.addColorStop(1, C.cyan);
  ctx.strokeStyle = g;
  ctx.lineWidth = 6;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 16;
  if (sp > 0.05) line(ctx, x0, y, mx, y);
  ctx.fillStyle = C.white;
  ctx.beginPath();
  ctx.arc(mx, y, 9 * sp, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  const cp = P(t, 8.5, 9.0);
  font(ctx, F.sans, 16, 600);
  ctx.fillStyle = rgba(C.mist, cp);
  drawText(ctx, 'STANDBY FOR HOMES & OFFICES', x0, y + 78, { ls: 3 });
  drawText(ctx, 'INDUSTRIAL PRIME POWER', x1, y + 78, { ls: 3, align: 'right' });
  ctx.restore();

  // The machine grows with the number.
  const small = pl < 0.55;
  const im = small ? A.canopySmall : A.open;
  const k = small ? lerp(0.45, 0.72, pl / 0.55) : lerp(0.8, 1, (pl - 0.55) / 0.45);
  const iw = 640 * k, ih = iw * (im.height / im.width);
  const ix = 1520 - iw / 2, iy = 820 - ih;
  const swap = small ? 0 : 1 - P(pl, 0.55, 0.62);
  ctx.save();
  ctx.globalAlpha = P(t, 8.1, 8.5) * (1 - swap);
  const sh = ctx.createRadialGradient(1520, 822, 5, 1520, 822, iw * 0.6);
  sh.addColorStop(0, rgba(C.cyan, 0.35));
  sh.addColorStop(1, rgba(C.cyan, 0));
  ctx.fillStyle = sh;
  ctx.save();
  ctx.translate(1520, 822);
  ctx.scale(1, 0.12);
  ctx.translate(-1520, -822);
  ctx.fillRect(1520 - iw, 822 - iw, iw * 2, iw * 2);
  ctx.restore();
  img(ctx, im, ix, iy, iw, ih);
  ctx.restore();
  ctx.restore();
  ctx.restore();
  if (t < 8.02) {
    ctx.save();
    boltClipAt(ctx, t);
    ctx.strokeStyle = rgba(C.ice, 0.9);
    ctx.lineWidth = 4;
    ctx.shadowColor = C.cyan;
    ctx.shadowBlur = 30;
    ctx.stroke();
    ctx.restore();
  }
}

// ================================================================ scene 6: three brands
const BRANDS = [
  { name: 'PERKINS', country: 'UNITED KINGDOM', min: 9, max: 2500 },
  { name: 'VOLVO PENTA', country: 'SWEDEN', min: 85, max: 700 },
  { name: 'DOOSAN', country: 'SOUTH KOREA', min: 150, max: 825 },
];

function sceneBrands(ctx, t) {
  const inY = (1 - P(t, T.rangeOut, 10.05, ease.out4)) * H;
  const exiting = t >= T.brandsOut;
  ctx.save();
  ctx.translate(0, inY);
  if (!exiting) studio(ctx, t, { sy: inY * 0.3, inner: '#0B2446' });
  const hp = P(t, 10.0, 10.5);
  const out = P(t, T.brandsOut, 12.0, ease.in4);
  ctx.save();
  ctx.translate(0, -out * 500);
  ctx.globalAlpha = 1 - out;
  kicker(ctx, 'AUTHORIZED DEALER — EGYPT', 160, 170, P(t, 9.95, 10.4));
  headline(ctx, [{ t: 'THREE BRANDS. ', c: C.white }, { t: 'ONE STANDARD.', c: C.white, stroke: true, lw: 2.2 }],
    160, 290, 112, hp, { ls: 3 });
  ctx.restore();

  BRANDS.forEach((b, i) => {
    const t0 = T.brandRows[i];
    const p = P(t, t0, t0 + 0.55, ease.glide);
    if (p <= 0) return;
    const dir = i % 2 ? 1 : -1;
    const top = 340 + i * 190;
    const dx = dir * (1 - p) * 700 + (exiting ? -dir * ease.in3(P(t, T.brandsOut + i * 0.03, 12.0)) * 2300 : 0);
    ctx.save();
    ctx.translate(dx, 0);
    ctx.globalAlpha = clamp(p * 1.5);
    ctx.strokeStyle = rgba(C.ice, 0.18);
    ctx.lineWidth = 1;
    line(ctx, 160, top, 160 + 1600 * p, top);
    font(ctx, F.mono, 18, 500);
    ctx.fillStyle = C.cyan;
    drawText(ctx, '0' + (i + 1), 160, top + 70, { ls: 2 });
    font(ctx, F.display, 142, 400);
    ctx.fillStyle = C.white;
    riseText(ctx, b.name, 222, top + 150, ease.out4(clamp(p * 1.3)), 142, { ls: 3 });
    font(ctx, F.sans, 18, 600);
    ctx.fillStyle = C.mist;
    drawText(ctx, b.country, 830, top + 76, { ls: 5 });
    font(ctx, F.mono, 26, 700);
    ctx.fillStyle = C.white;
    drawText(ctx, `${b.min} – ${b.max} KVA`, 830, top + 124, { ls: 1 });
    // Range bar on the shared log scale.
    const bx0 = 1200, bx1 = 1760, by = top + 100;
    ctx.strokeStyle = rgba(C.ice, 0.22);
    ctx.lineWidth = 2;
    line(ctx, bx0, by, bx1, by);
    const f = P(t, t0 + 0.2, t0 + 0.8, ease.io3);
    const a = logX(b.min, bx0, bx1), z = logX(b.max, bx0, bx1);
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 8;
    ctx.shadowColor = C.cyan;
    ctx.shadowBlur = 14;
    if (f > 0) line(ctx, a, by, lerp(a, z, f), by);
    ctx.fillStyle = C.white;
    for (const x of [a, lerp(a, z, f)]) {
      ctx.beginPath();
      ctx.arc(x, by, 6 * f, 0, TAU);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    font(ctx, F.mono, 14, 500);
    ctx.fillStyle = rgba(C.mist, 0.7 * f);
    drawText(ctx, '8', bx0, by + 32, { align: 'center' });
    drawText(ctx, '3000 KVA', bx1, by + 32, { align: 'right' });
    ctx.restore();
  });
  ctx.restore();
}

// ================================================================ scene 7: product hero shots
const FLOOR = 868;

function stage(ctx, t, word, wordP, drift) {
  const g = ctx.createLinearGradient(0, 0, 0, FLOOR);
  g.addColorStop(0, '#02060F');
  g.addColorStop(1, '#0B2445');
  ctx.fillStyle = g;
  ctx.fillRect(-300, -300, W + 600, FLOOR + 300);
  const f = ctx.createLinearGradient(0, FLOOR, 0, H);
  f.addColorStop(0, '#0B2140');
  f.addColorStop(1, '#02060D');
  ctx.fillStyle = f;
  ctx.fillRect(-300, FLOOR, W + 600, H - FLOOR + 300);
  // Light cone from above.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cone = ctx.createLinearGradient(0, 0, 0, FLOOR);
  cone.addColorStop(0, rgba(C.cyan, 0.13));
  cone.addColorStop(1, rgba(C.cyan, 0.0));
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(CX - 180, 0);
  ctx.lineTo(CX + 180, 0);
  ctx.lineTo(CX + 760, FLOOR);
  ctx.lineTo(CX - 760, FLOOR);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Giant outline word behind the product.
  if (wordP > 0) {
    ctx.save();
    font(ctx, F.display, 360, 400);
    ctx.strokeStyle = rgba(C.ice, 0.13 * wordP);
    ctx.lineWidth = 2;
    drawText(ctx, word, CX + drift, 560, { align: 'center', ls: 12, stroke: true });
    ctx.restore();
  }
  ctx.fillStyle = rgba(C.cyan, 0.35);
  ctx.fillRect(-300, FLOOR, W + 600, 1.5);
}

function product(ctx, t, im, cx, width, bright, shineP) {
  const w = width, h = w * (im.height / im.width);
  const x = cx - w / 2, y = FLOOR + 6 - h;
  // Pool of light under the machine.
  ctx.save();
  const pool = ctx.createRadialGradient(cx, FLOOR, 10, cx, FLOOR, w * 0.7);
  pool.addColorStop(0, rgba(C.cyan, 0.3 * bright));
  pool.addColorStop(1, rgba(C.cyan, 0));
  ctx.translate(cx, FLOOR);
  ctx.scale(1, 0.1);
  ctx.fillStyle = pool;
  ctx.fillRect(-w, -w, w * 2, w * 2);
  ctx.restore();
  // Reflection: flipped copy faded out with a mask, so no edges show.
  const rh = Math.ceil(h * 0.42);
  const rc = scratchCanvas('reflect', w, rh);
  const g = rc.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, rc.width, rc.height);
  g.setTransform(1, 0, 0, -1, 0, h);
  g.drawImage(scaled(im, h), 0, 0, w, h);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  const m = g.createLinearGradient(0, 0, 0, rh);
  m.addColorStop(0, 'rgba(0,0,0,0.32)');
  m.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = m;
  g.fillRect(0, 0, w, rh);
  ctx.save();
  ctx.globalAlpha = bright;
  ctx.drawImage(rc, 0, 0, w, rh, x, FLOOR + 6, w, rh);
  ctx.restore();
  // The machine itself.
  ctx.save();
  ctx.globalAlpha = bright;
  img(ctx, im, x, y, w, h);
  ctx.restore();
  shine(ctx, im, x, y, w, h, shineP, 0.35, 0.12);
  return { x, y, w, h };
}

// Anchor points in each photo, as fractions of the cut-out.
const CANOPY_CALLOUTS = [
  { at: [0.285, 0.30], elbow: [-120, -130], len: -170, title: 'SMART CONTROLLER', sub: 'DSE · COMAP · AUTO START' },
  { at: [0.64, 0.40], elbow: [170, -200], len: 160, title: 'SUPER-SILENT CANOPY', sub: '≤ 65 dB @ 1 m' },
  { at: [0.17, 0.87], elbow: [-110, 60], len: -150, title: 'STEEL & ROCKWOOL', sub: '2 mm ST.37 · >70 kg/m³' },
];
const OPEN_CALLOUTS = [
  { at: [0.30, 0.42], elbow: [-150, -170], len: -150, title: 'DIESEL ENGINE', sub: 'PERKINS · VOLVO PENTA · DOOSAN' },
  { at: [0.655, 0.30], elbow: [150, -150], len: 150, title: 'DSE CONTROLLER', sub: 'AUTO MAINS FAILURE' },
  { at: [0.80, 0.56], elbow: [130, 110], len: 150, title: 'ALTERNATOR', sub: 'LEROY SOMER · STAMFORD' },
];

function drawCallouts(ctx, t, box, list, times) {
  list.forEach((c, i) => {
    const p = P(t, times[i], times[i] + 0.6);
    const ax = box.x + box.w * c.at[0], ay = box.y + box.h * c.at[1];
    const ex = ax + c.elbow[0], ey = ay + c.elbow[1];
    callout(ctx, [[ax, ay], [ex, ey], [ex + c.len, ey]], c.title, c.sub, p);
  });
}

function sceneHero(ctx, t) {
  const swapOut = P(t, T.heroSwap, T.heroSwap + 0.18, ease.in4);
  const swapIn = P(t, T.heroSwap + 0.1, T.heroSwap + 0.6, ease.glide);
  const out = P(t, T.heroOut, 15.0, ease.in3);
  ctx.save();
  ctx.translate(CX, CY);
  ctx.scale(1 + out * 0.25, 1 + out * 0.25);
  ctx.translate(-CX, -CY);
  const whip = t >= T.heroSwap && t < T.heroSwap + 0.35;
  const camX = whip ? -swapOut * 900 + (1 - swapIn) * (swapOut >= 1 ? 900 : 0) : 0;
  const canopyPhase = t < T.heroSwap + 0.18;
  stage(ctx, t, canopyPhase ? 'SUPER SILENT' : 'PRIME POWER',
    canopyPhase ? P(t, 12.0, 12.6) : swapIn, (canopyPhase ? -1 : 1) * 40 * (t - 12.8) + camX * 0.4);

  if (canopyPhase) {
    const p = P(t, 11.85, 12.6, ease.glide);
    const x = lerp(1500, 1000, p) - swapOut * 1600;
    const box = product(ctx, t, A.canopy, x, lerp(820, 870, p), clamp(p * 1.4), P(t, 12.3, 12.95));
    if (swapOut <= 0) drawCallouts(ctx, t, box, CANOPY_CALLOUTS, T.heroCallouts);
  } else {
    const x = lerp(1700, 1000, swapIn);
    const box = product(ctx, t, A.open, x, 900, clamp(swapIn * 1.6), P(t, 13.8, 14.45));
    drawCallouts(ctx, t, box, OPEN_CALLOUTS, T.openCallouts);
  }
  ctx.restore();

  // Fixed titles.
  const a = 1 - out;
  ctx.save();
  ctx.globalAlpha = a;
  kicker(ctx, 'BUILT TO SPECIFICATION', 160, 170, P(t, 12.05, 12.5));
  const sp = P(t, 12.3, 12.8);
  font(ctx, F.mono, 16, 500);
  ctx.fillStyle = rgba(C.mist, 0.85 * sp);
  drawText(ctx, scramble('ISO 8528  ·  IEC 60034  ·  ISO 9001  ·  EEAA', sp, t, 44), 160, 960, { ls: 3 });
  ctx.restore();
  if (whip) smear(ctx, 70 * Math.sin(Math.PI * clamp((t - T.heroSwap) / 0.35)), 0, 8);
}

// ================================================================ scene 8: 105 → 65 dB
function dbAt(t) {
  return lerp(105, 65, P(t, T.dbFallA, T.dbFallB, ease.io3));
}

function dbColor(v) {
  return v > 85 ? mixHex(C.white, '#FF5446', (v - 85) / 20) : mixHex(C.ice, C.white, (v - 65) / 20);
}

function sceneDb(ctx, t) {
  const v = dbAt(t);
  const hot = clamp((v - 65) / 40);
  const out = P(t, T.dbOut, 17.0, ease.in3);
  ctx.save();
  ctx.translate(560, 640);
  ctx.scale(1 + out * 0.9, 1 + out * 0.9);
  ctx.translate(-560, -640);
  studio(ctx, t, { inner: mixHex('#0C2A50', '#4A0F16', hot), mid: mixHex('#061430', '#1A0609', hot) });

  kicker(ctx, 'ACOUSTIC ENGINEERING', 160, 170, P(t, 15.02, 15.4));
  headline(ctx, [{ t: 'HEAR THE ', c: C.white }, { t: 'DIFFERENCE.', c: C.cyan }], 160, 290, 112, P(t, 15.1, 15.6), { ls: 3 });

  // Number.
  const col = dbColor(v);
  ctx.save();
  ctx.globalAlpha = P(t, 15.0, 15.2);
  ctx.shadowColor = rgba(col, 0.5);
  ctx.shadowBlur = 40;
  const dw = odometer(ctx, v, 140, 830, 470, 3, { color: col, lead: 0 });
  font(ctx, F.display, 190, 400);
  ctx.fillStyle = col;
  drawText(ctx, 'dB', 140 + dw + 22, 830, { ls: 4 });
  ctx.restore();

  // LED meter.
  const mx = 1200, top = 180, bottom = 900, segs = 28;
  const segH = (bottom - top) / segs;
  const toY = d => lerp(bottom, top, (d - 40) / 70);
  const mp = P(t, 15.0, 15.35, ease.out3);
  for (let i = 0; i < segs; i++) {
    const d = 40 + (i + 0.5) * (70 / segs);
    const y = bottom - (i + 1) * segH + 3;
    const lit = d <= v && i / segs < mp;
    const c = d > 90 ? '#FF5446' : d > 75 ? '#FFB347' : C.cyan;
    ctx.fillStyle = lit ? c : rgba(C.ice, 0.08);
    if (lit) { ctx.shadowColor = c; ctx.shadowBlur = 14; }
    ctx.fillRect(mx, y, 90, segH - 6);
    ctx.shadowBlur = 0;
  }
  const marks = [[105, 'OPEN SET', 'INDUSTRIAL MACHINERY'], [85, 'STANDARD CANOPY', '−20 dBA'], [65, 'SUPER SILENT', 'HOSPITALS · HOMES']];
  marks.forEach(([d, label, sub], i) => {
    const appear = i === 0 ? P(t, 15.1, 15.4) : P(v, d + 3, d + 0.5);
    if (appear <= 0) return;
    const y = toY(d);
    const active = Math.abs(v - d) < 6;
    ctx.save();
    ctx.globalAlpha = appear * (active ? 1 : 0.55);
    ctx.strokeStyle = active ? C.white : C.ice;
    ctx.lineWidth = 2;
    line(ctx, mx + 104, y, mx + 104 + 60 * appear, y);
    font(ctx, F.mono, 26, 700);
    ctx.fillStyle = active ? dbColor(d) : C.mist;
    drawText(ctx, d + ' dB', mx + 184, y + 9, { ls: 1 });
    font(ctx, F.sans, 19, 700);
    ctx.fillStyle = C.white;
    drawText(ctx, label, mx + 320, y + 1, { ls: 3 });
    font(ctx, F.sans, 15, 600);
    ctx.fillStyle = C.mist;
    drawText(ctx, sub, mx + 320, y + 26, { ls: 3 });
    ctx.restore();
  });

  // Noise waveform: loud and ragged, then calm.
  ctx.save();
  ctx.beginPath();
  const amp = 8 + 80 * hot;
  for (let x = 0; x <= W; x += 4) {
    const u = x / W;
    const y = 990 + (Math.sin(u * 50 + t * 30) * 0.5 + snoise(u * 90 + t * 24, 12) * hot + Math.sin(u * 14 - t * 9) * 0.4) * amp;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = rgba(col, 0.8);
  ctx.lineWidth = 2;
  ctx.shadowColor = col;
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

// ================================================================ scene 9: services on the beat
const SERVICE_STYLE = ['fill', 'stroke', 'cyan', 'fill', 'stroke', 'cyan', 'fill', 'stroke'];

function sceneServices(ctx, t) {
  const i = clamp(Math.floor((t - T.services) / T.serviceStep), 0, SERVICES.length - 1);
  const lt = t - T.services - i * T.serviceStep;
  studio(ctx, t, { inner: i % 2 ? '#0E2F5A' : '#0B2446', sx: -t * 120 });
  const [word, sub] = SERVICES[i];
  // Index number behind.
  ctx.save();
  font(ctx, F.display, 760, 400);
  ctx.strokeStyle = rgba(C.ice, 0.09);
  ctx.lineWidth = 2;
  drawText(ctx, String(i + 1).padStart(2, '0'), 1840, 900, { align: 'right', stroke: true });
  ctx.restore();

  const bk = clamp(lt / 0.22);
  if (bk < 1) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const r = rng(300 + i);
    for (let k = 0; k < 26; k++) {
      const an = r() * TAU, d0 = 300 + r() * 180, len = 70 + r() * 170;
      const d = d0 + ease.out3(bk) * 280;
      ctx.strokeStyle = rgba(C.ice, 0.32 * (1 - bk));
      ctx.lineWidth = 2;
      line(ctx, CX + Math.cos(an) * d, 600 + Math.sin(an) * d * 0.5,
        CX + Math.cos(an) * (d + len), 600 + Math.sin(an) * (d + len) * 0.5);
    }
    ctx.restore();
  }
  const p = clamp(lt / 0.09);
  const s = lerp(1.22, 1, ease.out3(p));
  ctx.save();
  ctx.translate(CX, 600);
  ctx.scale(s, s);
  ctx.globalAlpha = p;
  font(ctx, F.display, 250, 400);
  const style = SERVICE_STYLE[i];
  const ls = lerp(22, 8, ease.out3(clamp(lt / 0.25)));
  if (style === 'stroke') {
    ctx.strokeStyle = C.white;
    ctx.lineWidth = 3;
    drawText(ctx, word, 0, 85, { align: 'center', ls, stroke: true });
  } else {
    ctx.fillStyle = style === 'cyan' ? C.cyan : C.white;
    if (style === 'cyan') { ctx.shadowColor = C.cyan; ctx.shadowBlur = 36; }
    drawText(ctx, word, 0, 85, { align: 'center', ls });
  }
  ctx.restore();
  font(ctx, F.sans, 22, 600);
  ctx.fillStyle = C.mist;
  drawText(ctx, scramble(sub, clamp(lt / 0.12), t, 70 + i), CX, 745, { align: 'center', ls: 5 });

  kicker(ctx, 'COMPLETE POWER SOLUTIONS', 160, 170, P(t, 17.0, 17.3));
  font(ctx, F.mono, 18, 700);
  ctx.fillStyle = C.cyan;
  drawText(ctx, `${String(i + 1).padStart(2, '0')} / 08`, 1760, 172, { align: 'right', ls: 3 });

  // Segmented progress that becomes the process line.
  const merge = P(t, 18.8, 19.0, ease.io3);
  const segW = 150, gap = lerp(14, 0, merge), n = 8;
  const total = n * segW + (n - 1) * gap;
  const x0 = CX - total / 2;
  for (let k = 0; k < n; k++) {
    const x = x0 + k * (segW + gap);
    const lit = k <= i;
    ctx.fillStyle = lit ? C.cyan : rgba(C.ice, 0.15);
    if (lit) { ctx.shadowColor = C.cyan; ctx.shadowBlur = 10; }
    ctx.fillRect(x, 898, segW, 4);
    ctx.shadowBlur = 0;
  }
}

// ================================================================ scene 10: process
const NODE_X = [240, 600, 960, 1320, 1680];

// Line icons for the five delivery steps, drawn around (0, 0) in a 64 px box.
function stepIcon(ctx, i) {
  ctx.beginPath();
  if (i === 0) {
    // Survey: reticle.
    ctx.arc(0, 0, 22, 0, TAU);
    ctx.moveTo(0, -32); ctx.lineTo(0, -12); ctx.moveTo(0, 12); ctx.lineTo(0, 32);
    ctx.moveTo(-32, 0); ctx.lineTo(-12, 0); ctx.moveTo(12, 0); ctx.lineTo(32, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, TAU);
    ctx.fill();
  } else if (i === 1) {
    // Civil works: foundation blocks.
    ctx.rect(-30, 10, 60, 16);
    ctx.rect(-22, -8, 44, 18);
    ctx.rect(-12, -26, 24, 18);
    ctx.stroke();
  } else if (i === 2) {
    // Delivery: truck.
    ctx.rect(-32, -16, 38, 28);
    ctx.moveTo(6, -6); ctx.lineTo(22, -6); ctx.lineTo(32, 6); ctx.lineTo(32, 12); ctx.lineTo(6, 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-18, 18, 7, 0, TAU);
    ctx.moveTo(25, 18);
    ctx.arc(18, 18, 7, 0, TAU);
    ctx.stroke();
  } else if (i === 3) {
    // Installation: gear.
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18);
      ctx.lineTo(Math.cos(a) * 28, Math.sin(a) * 28);
    }
    ctx.moveTo(18, 0);
    ctx.arc(0, 0, 18, 0, TAU);
    ctx.moveTo(8, 0);
    ctx.arc(0, 0, 8, 0, TAU);
    ctx.stroke();
  } else {
    // Commissioning: power symbol.
    ctx.arc(0, 2, 24, -Math.PI / 2 + 0.7, -Math.PI / 2 - 0.7 + TAU);
    ctx.moveTo(0, -28); ctx.lineTo(0, 0);
    ctx.stroke();
  }
}

function sceneProcess(ctx, t) {
  studio(ctx, t, { inner: '#0B2446' });
  const ly = lerp(900, 650, P(t, 19.0, 19.35, ease.io3));
  const lw = P(t, 19.0, 19.3, ease.out3);
  const out = P(t, T.processOut, 21.0, ease.in3);
  ctx.save();
  ctx.globalAlpha = 1 - out * 0.5;
  kicker(ctx, 'HOW WE DELIVER', 160, 170, P(t, 19.05, 19.4));
  headline(ctx, [{ t: 'TURNKEY. ', c: C.white }, { t: 'END TO END.', c: C.cyan }], 160, 300, 124, P(t, 19.1, 19.6), { ls: 3 });
  // Base line.
  ctx.strokeStyle = rgba(C.ice, 0.25);
  ctx.lineWidth = 4;
  line(ctx, lerp(CX - 600, 160, lw), ly, lerp(CX + 600, 1760, lw), ly);
  // Current travelling from node to node.
  let px = NODE_X[0];
  const times = T.processNodes;
  for (let i = 0; i < times.length; i++) {
    if (t >= times[i]) px = NODE_X[i];
    if (i > 0 && t > times[i] - 0.3 && t < times[i]) px = lerp(NODE_X[i - 1], NODE_X[i], ease.io3((t - times[i] + 0.3) / 0.3));
  }
  if (t >= times[0] - 0.1) {
    const g = ctx.createLinearGradient(160, 0, px, 0);
    g.addColorStop(0, rgba(C.blue, 0.3));
    g.addColorStop(1, C.cyan);
    ctx.strokeStyle = g;
    ctx.lineWidth = 5;
    ctx.shadowColor = C.cyan;
    ctx.shadowBlur = 16;
    line(ctx, 160, ly, px, ly);
    ctx.fillStyle = C.white;
    ctx.beginPath();
    ctx.arc(px, ly, 10, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  PROCESS.forEach(([title, desc], i) => {
    const t0 = times[i];
    const p = P(t, t0, t0 + 0.4, ease.out3);
    const x = NODE_X[i];
    ctx.fillStyle = p > 0 ? C.cyan : '#0A1B33';
    ctx.strokeStyle = p > 0 ? C.white : rgba(C.ice, 0.5);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, ly, 14 + 4 * p, 0, TAU);
    ctx.fill();
    ctx.stroke();
    if (p <= 0) return;
    const ring = P(t, t0, t0 + 0.6, ease.out2);
    ctx.strokeStyle = rgba(C.cyan, 1 - ring);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, ly, 18 + 60 * ring, 0, TAU);
    ctx.stroke();
    font(ctx, F.mono, 20, 700);
    ctx.fillStyle = C.cyan;
    riseText(ctx, '0' + (i + 1), x, ly - 44, p, 20, { align: 'center', ls: 2 });
    const ip = P(t, t0 + 0.05, t0 + 0.4, ease.pop);
    ctx.save();
    ctx.translate(x, ly - 150);
    ctx.scale(ip, ip);
    ctx.strokeStyle = C.white;
    ctx.fillStyle = C.white;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = C.cyan;
    ctx.shadowBlur = 18;
    stepIcon(ctx, i);
    ctx.restore();
    font(ctx, F.sans, 25, 700);
    ctx.fillStyle = C.white;
    riseText(ctx, title, x, ly + 70, p, 25, { align: 'center', ls: 2 });
    font(ctx, F.sans, 18, 500);
    ctx.fillStyle = rgba(C.mist, p);
    drawText(ctx, desc, x, ly + 104, { align: 'center', ls: 0.5 });
  });
  ctx.restore();
}

// ================================================================ scene 11: track record (light)
const CLIENTS_A = 'EGYPTIAN AMBULANCE ORGANIZATION · CANAL FOR SUGAR · SODIC · METITO · CERAMICA CLEOPATRA · ';
const CLIENTS_B = 'SCZONE · MENOUFIA UNIVERSITY · CONCORD · OLIVE LAND · DEFACTO · UPWYDE · ';

function wipeClip(ctx, p, fromLeft = true) {
  const x = lerp(-500, W + 500, p);
  ctx.beginPath();
  if (fromLeft) {
    ctx.moveTo(-600, -10);
    ctx.lineTo(x + 250, -10);
    ctx.lineTo(x - 250, H + 10);
    ctx.lineTo(-600, H + 10);
  }
  ctx.closePath();
  return x;
}

function wipeEdge(ctx, p) {
  const x = lerp(-500, W + 500, p);
  ctx.save();
  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 6;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 30;
  line(ctx, x + 250, -10, x - 250, H + 10);
  ctx.restore();
}

function sceneStats(ctx, t) {
  const wp = P(t, T.processOut, 21.05, ease.io3);
  ctx.save();
  if (wp < 1) {
    wipeClip(ctx, wp);
    ctx.clip();
  }
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  blueprint(ctx, 0.06, -t * 20, 0, C.ink);
  // Client names drifting behind.
  ctx.save();
  font(ctx, F.display, 170, 400);
  ctx.strokeStyle = rgba(C.deep, 0.08);
  ctx.lineWidth = 2;
  const wa = textWidth(ctx, CLIENTS_A, 8), wb = textWidth(ctx, CLIENTS_B, 8);
  const xa = -((t - 20.8) * 140) % wa, xb = -wb + ((t - 20.8) * 140) % wb;
  drawText(ctx, CLIENTS_A + CLIENTS_A, xa, 420, { ls: 8, stroke: true });
  drawText(ctx, CLIENTS_B + CLIENTS_B, xb, 1040, { ls: 8, stroke: true });
  ctx.restore();

  const ink = C.deep;
  ctx.save();
  font(ctx, F.sans, 22, 600);
  kicker(ctx, 'OUR CLIENTS', 160, 170, P(t, 21.0, 21.4), C.blue);
  headline(ctx, [{ t: 'TRUSTED BY ', c: ink }, { t: "EGYPT'S LEADERS", c: C.blue }], 160, 290, 112, P(t, 21.05, 21.55), { ls: 3 });
  ctx.restore();

  const cols = [330, 750, 1170, 1590];
  for (let i = 1; i < 4; i++) {
    const p = P(t, 21.1 + i * 0.05, 21.5 + i * 0.05, ease.out3);
    ctx.strokeStyle = rgba(C.ink, 0.15);
    ctx.lineWidth = 2;
    line(ctx, (cols[i - 1] + cols[i]) / 2, 480, (cols[i - 1] + cols[i]) / 2, 480 + 250 * p);
  }
  STATS.forEach((s, i) => {
    const t0 = T.statStarts[i];
    const p = P(t, t0, t0 + 0.8, ease.outExpo);
    if (t < t0) return;
    const val = s.value * p;
    const num = s.decimals ? val.toFixed(s.decimals) : String(Math.round(val));
    const rise = P(t, t0, t0 + 0.3, ease.out3);
    ctx.save();
    ctx.globalAlpha = rise;
    font(ctx, F.display, 214, 400);
    const nw = textWidth(ctx, num, 2), sw = textWidth(ctx, s.suffix, 2);
    const x0 = cols[i] - (nw + sw + 4) / 2;
    ctx.fillStyle = ink;
    drawText(ctx, num, x0, 670 + (1 - rise) * 40, { ls: 2 });
    ctx.fillStyle = C.cyan;
    const sp = P(t, t0 + 0.35, t0 + 0.6, ease.pop);
    ctx.save();
    ctx.translate(x0 + nw + 4 + sw / 2, 670);
    ctx.scale(sp, sp);
    drawText(ctx, s.suffix, 0, 0, { ls: 2, align: 'center' });
    ctx.restore();
    font(ctx, F.sans, 20, 700);
    ctx.fillStyle = C.steel;
    drawText(ctx, s.label, cols[i], 730, { align: 'center', ls: 4 });
    ctx.restore();
  });
  const sp = P(t, 22.3, 22.8);
  font(ctx, F.sans, 19, 600);
  ctx.fillStyle = rgba(C.steel, sp);
  drawText(ctx, 'HEALTHCARE  ·  INDUSTRY  ·  REAL ESTATE  ·  GOVERNMENT  ·  AGRICULTURE  ·  WATER', CX, 880, { align: 'center', ls: 4 });
  ctx.restore();
  if (wp > 0 && wp < 1) wipeEdge(ctx, wp);
}

// ================================================================ scene 12: map of Egypt
const EGYPT = [
  [25.15, 31.57], [25.92, 31.61], [27.23, 31.35], [28.44, 31.03], [28.95, 30.83], [29.5, 30.95], [29.92, 31.2],
  [30.07, 31.32], [30.37, 31.47], [31.1, 31.6], [31.85, 31.52], [32.3, 31.26], [33.1, 31.15], [33.8, 31.13],
  [34.22, 31.3], [34.9, 29.49], [34.66, 28.97], [34.52, 28.5], [34.33, 27.91], [34.25, 27.73], [33.61, 28.24],
  [33.1, 29.04], [32.7, 29.59], [32.55, 29.97], [32.35, 29.6], [32.65, 29.12], [33.08, 28.36], [33.81, 27.26],
  [33.94, 26.75], [34.28, 26.1], [34.89, 25.07], [35.47, 23.95], [35.6, 23.13], [36.2, 22.6], [36.88, 22.0],
  [31.3, 22.0], [25.0, 22.0], [25.0, 29.4], [24.72, 30.0], [24.85, 31.0],
];
const NILE = [
  [31.3, 22.0], [31.6, 22.4], [32.2, 22.8], [32.8, 23.5], [32.9, 24.09], [32.93, 24.47], [32.87, 24.98],
  [32.55, 25.29], [32.64, 25.7], [32.73, 26.16], [32.25, 26.05], [31.7, 26.56], [31.18, 27.18], [30.75, 28.1],
  [31.1, 29.07], [31.24, 30.04], [31.2, 30.2],
];
const ROSETTA = [[31.2, 30.2], [30.95, 30.6], [30.6, 30.95], [30.37, 31.47]];
const DAMIETTA = [[31.2, 30.2], [31.3, 30.6], [31.5, 31.0], [31.85, 31.52]];
const CAIRO = [31.32, 30.09];
const REGIONS = [
  [31.13, 29.97, 'GIZA'], [31.0, 30.56, 'MENOUFIA'], [29.92, 31.2, 'ALEXANDRIA'], [28.95, 30.9, 'NORTH COAST'],
  [31.76, 30.02, 'NEW CAPITAL'], [30.75, 28.1, 'MINIA'],
];
const MAP = { x0: 150, y0: 170, k: 78, lon0: 24.7, lat0: 31.8, c: Math.cos((27 * Math.PI) / 180) };
const proj = ([lon, lat]) => [MAP.x0 + (lon - MAP.lon0) * MAP.k * MAP.c, MAP.y0 + (MAP.lat0 - lat) * MAP.k];

function tracePath(ctx, pts) {
  ctx.beginPath();
  pts.forEach((p, i) => {
    const [x, y] = proj(p);
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  });
}

const FACILITIES = [
  ['CAIRO HQ', 'HELIOPOLIS'], ['MAIN WAREHOUSE', '6TH OF OCTOBER'], ['DELTA BRANCH', 'SHEBIN EL-KOM'], ['FABRICATION UNIT', 'GIZA'],
];

function sceneMap(ctx, t) {
  const wp = P(t, T.statsOut, 23.55, ease.io3);
  ctx.save();
  if (wp < 1) {
    wipeClip(ctx, wp);
    ctx.clip();
  }
  const build = P(t, T.riser, T.mapOut, ease.in2);
  studio(ctx, t, { inner: '#0B2446', cx: -420 });
  ctx.save();
  const z = 1 + 0.05 * build;
  ctx.translate(560, 560);
  ctx.scale(z, z);
  ctx.translate(-560, -560);

  // Seas.
  font(ctx, F.mono, 15, 500);
  ctx.fillStyle = rgba(C.ice, 0.4 * P(t, 23.8, 24.2));
  drawText(ctx, 'MEDITERRANEAN SEA', 520, 150, { ls: 6 });
  drawText(ctx, 'RED SEA', 900, 560, { ls: 6 });

  const op = P(t, 23.45, 24.1, ease.io3);
  ctx.save();
  const pts = EGYPT.map(proj);
  pts.push(pts[0]);
  if (t > 23.85) {
    tracePath(ctx, EGYPT);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 170, 0, 940);
    g.addColorStop(0, rgba(C.blue, 0.35 * P(t, 23.85, 24.3)));
    g.addColorStop(1, rgba(C.deep, 0.18 * P(t, 23.85, 24.3)));
    ctx.fillStyle = g;
    ctx.fill();
    // Coverage wave from Cairo, clipped to the country.
    ctx.save();
    ctx.clip();
    const [cx, cy] = proj(CAIRO);
    for (let w = 0; w < 2; w++) {
      const k = P(t, 24.15 + w * 0.45, 25.1 + w * 0.45, ease.out2);
      if (k <= 0 || k >= 1) continue;
      const r = 900 * k;
      const rg = ctx.createRadialGradient(cx, cy, Math.max(0, r - 120), cx, cy, r);
      rg.addColorStop(0, rgba(C.cyan, 0));
      rg.addColorStop(0.8, rgba(C.cyan, 0.35 * (1 - k)));
      rg.addColorStop(1, rgba(C.cyan, 0));
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }
  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 16;
  polyPartial(ctx, pts, op);
  ctx.stroke();
  ctx.shadowBlur = 0;
  // The Nile and its delta.
  const np = P(t, 23.75, 24.25, ease.io3);
  ctx.strokeStyle = rgba(C.ice, 0.85);
  ctx.lineWidth = 2.2;
  polyPartial(ctx, NILE.map(proj), np);
  ctx.stroke();
  const dp = P(t, 24.2, 24.45, ease.out3);
  for (const br of [ROSETTA, DAMIETTA]) {
    polyPartial(ctx, br.map(proj), dp);
    ctx.stroke();
  }
  ctx.restore();

  // Arcs and pins.
  const [hx, hy] = proj(CAIRO);
  REGIONS.forEach(([lon, lat, name], i) => {
    const t0 = T.mapPins[i + 1];
    const p = P(t, t0, t0 + 0.35, ease.out3);
    if (p <= 0) return;
    const [x, y] = proj([lon, lat]);
    const mx = (hx + x) / 2, my = (hy + y) / 2 - Math.hypot(x - hx, y - hy) * 0.45 - 10;
    ctx.save();
    ctx.strokeStyle = rgba(C.ice, 0.75);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    const steps = 24;
    for (let s = 0; s <= steps * p; s++) {
      const u = s / steps;
      const qx = (1 - u) ** 2 * hx + 2 * (1 - u) * u * mx + u * u * x;
      const qy = (1 - u) ** 2 * hy + 2 * (1 - u) * u * my + u * u * y;
      if (s === 0) ctx.moveTo(qx, qy); else ctx.lineTo(qx, qy);
    }
    ctx.stroke();
    const pin = P(t, t0 + 0.25, t0 + 0.45, ease.pop);
    if (pin > 0) {
      ctx.fillStyle = C.white;
      ctx.shadowColor = C.cyan;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(x, y, 6 * pin, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      const rr = P(t, t0 + 0.25, t0 + 0.85);
      ctx.strokeStyle = rgba(C.cyan, 1 - rr);
      ctx.beginPath();
      ctx.arc(x, y, 6 + 26 * rr, 0, TAU);
      ctx.stroke();
      if (name === 'ALEXANDRIA' || name === 'NORTH COAST' || name === 'MINIA' || name === 'NEW CAPITAL') {
        font(ctx, F.mono, 14, 700);
        ctx.fillStyle = rgba(C.white, pin);
        const right = name === 'NEW CAPITAL' || name === 'MINIA';
        drawText(ctx, name, x + (right ? 16 : -16), y + (name === 'NEW CAPITAL' ? 20 : -12), { ls: 2, align: right ? 'left' : 'right' });
      }
    }
    ctx.restore();
  });
  // Head office.
  const hp = P(t, T.mapPins[0], T.mapPins[0] + 0.3, ease.pop);
  if (hp > 0) {
    for (let k = 0; k < 3; k++) {
      const rr = ((t - T.mapPins[0]) * 1.2 + k / 3) % 1;
      ctx.strokeStyle = rgba(C.cyan, 0.8 * (1 - rr) * hp);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hx, hy, 10 + 50 * rr, 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = C.cyan;
    ctx.shadowColor = C.cyan;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(hx, hy, 11 * hp, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = C.white;
    ctx.beginPath();
    ctx.arc(hx, hy, 4.5 * hp, 0, TAU);
    ctx.fill();
    font(ctx, F.sans, 18, 700);
    ctx.fillStyle = rgba(C.white, hp);
    drawText(ctx, 'CAIRO HQ', hx + 24, hy - 16, { ls: 3 });
  }
  ctx.restore();

  // Text block.
  kicker(ctx, 'OUR REACH', 1130, 250, P(t, 23.55, 23.95));
  ctx.save();
  font(ctx, F.display, 150, 400);
  ctx.fillStyle = C.white;
  riseText(ctx, 'NATIONWIDE', 1130, 400, P(t, 23.6, 24.0, ease.out4), 150, { ls: 4 });
  ctx.fillStyle = C.cyan;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 24;
  riseText(ctx, 'COVERAGE.', 1130, 530, P(t, 23.7, 24.1, ease.out4), 150, { ls: 4 });
  ctx.restore();
  FACILITIES.forEach(([k, v], i) => {
    const p = P(t, 24.2 + i * 0.12, 24.6 + i * 0.12, ease.out3);
    if (p <= 0) return;
    const y = 640 + i * 62;
    ctx.save();
    ctx.globalAlpha = p;
    ctx.translate((1 - p) * 40, 0);
    ctx.fillStyle = C.cyan;
    ctx.fillRect(1130, y - 14, 10, 10);
    font(ctx, F.sans, 21, 700);
    ctx.fillStyle = C.white;
    drawText(ctx, k, 1158, y - 3, { ls: 2 });
    font(ctx, F.mono, 17, 500);
    ctx.fillStyle = C.ice;
    drawText(ctx, v, 1780, y - 3, { ls: 1, align: 'right' });
    ctx.strokeStyle = rgba(C.ice, 0.2);
    ctx.setLineDash([2, 6]);
    line(ctx, 1158, y + 16, 1780, y + 16);
    ctx.restore();
  });
  ctx.restore();
  if (wp > 0 && wp < 1) wipeEdge(ctx, wp);
  if (t >= T.mapOut) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
  }
}

// ================================================================ scene 13: call to action + end card
function phoneIcon(ctx, x, y, s, col) {
  ctx.save();
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, 24 * s, 40 * s, 5 * s);
  ctx.stroke();
  ctx.fillStyle = col;
  ctx.fillRect(x + 8 * s, y + 33 * s, 8 * s, 2.5 * s);
  ctx.restore();
}

function globeIcon(ctx, x, y, r, col) {
  ctx.save();
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.45, r, 0, 0, TAU);
  ctx.stroke();
  line(ctx, x - r, y, x + r, y);
  ctx.restore();
}

function sceneCta(ctx, t) {
  const cam = { s: 1.14 + 0.05 * P(t, 26, 30), x: 60 + 40 * P(t, 26, 30), y: 0 };
  const endDim = P(t, T.endCard - 0.2, T.endCard + 0.4, ease.io2);
  softCity(ctx, t, cam, lerp(lerp(0.35, 0.72, P(t, 26.0, 26.5, ease.out2)), 0.84, endDim), lerp(3, 5, endDim));
  shockwave(ctx, t, T.cta, CX, 560, { dur: 0.9, maxR: 1500 });
  particles(ctx, t, T.cta, CX, 560, 110, 2600, { speed: 1600, life: 1.1 });

  // LET'S POWER / YOUR PROJECT.
  const out = P(t, T.endCard - 0.15, T.endCard + 0.2, ease.in3);
  if (out < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - out;
    ctx.translate(0, -out * 120);
    const words = [
      { s: "LET'S ", c: C.white, t0: T.ctaWords[0], line: 0 },
      { s: 'POWER', c: C.cyan, t0: T.ctaWords[1], line: 0, glow: true },
      { s: 'YOUR PROJECT.', c: C.white, t0: T.ctaWords[2], line: 1 },
    ];
    font(ctx, F.display, 210, 400);
    const w0 = textWidth(ctx, "LET'S ", 5) + 5 + textWidth(ctx, 'POWER', 5);
    const lines = [[CX - w0 / 2, 520], [CX - textWidth(ctx, 'YOUR PROJECT.', 5) / 2, 720]];
    let xCursor = lines[0][0];
    for (const w of words) {
      const p = P(t, w.t0, w.t0 + 0.2, ease.out3);
      const ww = textWidth(ctx, w.s, 5);
      const x = w.line === 0 ? xCursor : lines[1][0];
      const y = lines[w.line][1];
      if (w.line === 0) xCursor += ww + 5;
      if (p <= 0) continue;
      ctx.save();
      ctx.translate(x + ww / 2, y - 75);
      const s = lerp(1.35, 1, p);
      ctx.scale(s, s);
      ctx.globalAlpha *= clamp(p * 3);
      ctx.fillStyle = w.c;
      if (w.glow) { ctx.shadowColor = C.cyan; ctx.shadowBlur = 40; }
      font(ctx, F.display, 210, 400);
      drawText(ctx, w.s.trim(), -ww / 2, 75, { ls: 5 });
      ctx.restore();
    }
    // Arabic line from the site's own contact heading.
    const ap = P(t, T.ctaArabic, T.ctaArabic + 0.4, ease.out3);
    if (ap > 0) {
      ctx.save();
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      font(ctx, F.arabic, 76, 700);
      ctx.fillStyle = rgba(C.ice, ap);
      ctx.fillText('لنشغّل مشروعك', CX, 860 + (1 - ap) * 30);
      ctx.restore();
    }
    ctx.restore();
  }

  // End card.
  if (t >= T.endCard) {
    const L = lockupGeom(ctx, 230, 420);
    const pm = P(t, T.endCard, T.endCard + 0.35, ease.pop);
    const strike = P(t, T.endCard + 0.05, T.endCard + 0.17, ease.in3);
    const flash = t >= T.endCard + 0.17 ? 1 - P(t, T.endCard + 0.17, T.endCard + 0.45) : 0;
    const shineP = P(t, T.endShine, T.endShine + 0.5, ease.io2);
    ctx.save();
    ctx.translate(L.markCx, L.markCy);
    ctx.scale(lerp(0.6, 1, pm), lerp(0.6, 1, pm));
    drawMark(ctx, 0, 0, 230, { p: clamp(pm * 2), bolt: t > T.endCard + 0.05 ? 1 : 0, bdx: 200 * (1 - strike), bdy: -340 * (1 - strike), flash, shine: shineP });
    ctx.restore();
    const p1 = P(t, T.endCard + 0.2, T.endCard + 0.55), p2 = P(t, T.endCard + 0.28, T.endCard + 0.63);
    wordmark(ctx, L.textX, L.textTop, L.size, p1, p2, L.ls);
    if (shineP > 0 && shineP < 1) {
      const c = scratchCanvas('wm2', 560, 300);
      const g = c.getContext('2d');
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, c.width, c.height);
      wordmark(g, 0, 20, L.size, 1, 1, L.ls);
      shine(ctx, c, L.textX, L.textTop - 20, c.width, c.height, clamp(shineP * 1.3 - 0.2), 0.8);
    }
    const dl = P(t, 27.95, 28.35, ease.io3);
    ctx.strokeStyle = rgba(C.cyan, 0.8);
    ctx.lineWidth = 2;
    line(ctx, CX - 330 * dl, 620, CX + 330 * dl, 620);
    const pp = P(t, 28.0, 28.35, ease.out3);
    if (pp > 0) {
      ctx.save();
      ctx.globalAlpha = pp;
      font(ctx, F.mono, 50, 700);
      const phone = '012 2968 8688';
      const pw = textWidth(ctx, phone, 2);
      const px = CX - (pw + 50) / 2;
      phoneIcon(ctx, px, 673 + (1 - pp) * 20, 1, C.cyan);
      ctx.fillStyle = C.white;
      drawText(ctx, phone, px + 50, 710 + (1 - pp) * 20, { ls: 2 });
      ctx.restore();
    }
    const wp = P(t, 28.1, 28.45, ease.out3);
    if (wp > 0) {
      ctx.save();
      ctx.globalAlpha = wp;
      font(ctx, F.sans, 32, 600);
      const web = 'www.premiumpower-eg.com';
      const ww = textWidth(ctx, web, 1);
      const x = CX - (ww + 46) / 2;
      globeIcon(ctx, x + 14, 776 + (1 - wp) * 20, 14, C.cyan);
      ctx.fillStyle = C.ice;
      drawText(ctx, web, x + 46, 787 + (1 - wp) * 20, { ls: 1 });
      ctx.restore();
    }
    const sp = P(t, 28.25, 28.7);
    font(ctx, F.sans, 17, 600);
    ctx.fillStyle = rgba(C.mist, sp);
    drawText(ctx, scramble('AUTHORIZED DEALER  ·  PERKINS  ·  VOLVO PENTA  ·  DOOSAN  ·  24/7 SUPPORT', sp, t, 88), CX, 880, { align: 'center', ls: 4 });
  }
}

// ================================================================ HUD frame
const LABELS = [
  [0, '01', 'GRID MONITOR · CAIRO'], [2.0, '02', 'MAINS FAILURE'], [4.1, '03', 'GENERATOR CONTROL'],
  [6.0, '04', 'POWER RESTORED'], [8.0, '05', 'POWER RANGE'], [10.0, '06', 'ENGINE PARTNERS'],
  [12.0, '07', 'CANOPY SET'], [13.45, '08', 'OPEN SET'], [15.0, '09', 'ACOUSTICS'], [17.0, '10', 'SOLUTIONS'],
  [19.0, '11', 'DELIVERY'], [21.0, '12', 'TRACK RECORD'], [23.5, '13', 'COVERAGE'],
];

function hudFrame(ctx, t) {
  const a = P(t, 0.1, 0.6) * (1 - P(t, 25.7, 26.0));
  if (a <= 0 || (t >= T.cutBlack && t < T.drop)) return;
  const light = lightMix(t) > 0.5;
  const col = light ? C.ink : C.ice;
  let cur = LABELS[0];
  for (const l of LABELS) if (t >= l[0]) cur = l;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = rgba(col, light ? 0.45 : 0.4);
  ctx.lineWidth = 1.5;
  brackets(ctx, 48, 48, W - 96, H - 96, 28);
  font(ctx, F.mono, 15, 500);
  ctx.fillStyle = rgba(col, light ? 0.8 : 0.75);
  const txt = `[${cur[1]}] ${cur[2]}`;
  drawText(ctx, scramble(txt, P(t, cur[0], cur[0] + 0.35), t, Number(cur[1])), 80, 88, { ls: 2 });
  drawText(ctx, 'PREMIUM POWER · EST. 2006', W - 80, 88, { ls: 2, align: 'right' });
  const f = Math.floor(t * 60);
  const tc = `TC 00:00:${String(Math.floor(t)).padStart(2, '0')}:${String(f % 60).padStart(2, '0')}`;
  drawText(ctx, tc, 80, H - 72, { ls: 2 });
  drawText(ctx, 'PREMIUMPOWER-EG.COM', W - 80, H - 72, { ls: 2, align: 'right' });
  ctx.restore();
}

// ================================================================ camera shake, flashes, grading
const IMPACTS = [[T.line2, 8, 9], [T.ats, 4, 16], [T.drop, 24, 5], [T.bolt, 12, 8], [T.range, 5, 10],
  [T.brands, 4, 10], [T.hero, 4, 10], [T.db, 8, 8], [T.services, 5, 10], [T.process, 4, 10], [T.stats, 4, 10],
  [T.map, 4, 10], [T.cta, 22, 5], [T.endCard + 0.17, 6, 9]];

function shake(t) {
  let x = 0, y = 0, r = 0, z = 0;
  for (const [ti, amp, dec] of IMPACTS) {
    const dt = t - ti;
    if (dt < 0 || dt > 1.2) continue;
    const e = amp * Math.exp(-dt * dec);
    x += snoise(t * 38, ti * 10) * e;
    y += snoise(t * 41, ti * 10 + 3) * e;
    r += snoise(t * 23, ti * 10 + 7) * e * 0.0012;
    z += e * 0.0016;
  }
  // Engine vibration while the generator runs up.
  if (t > T.crank && t < T.cutBlack) {
    const v = t < T.fire ? 1.6 : 1.1;
    x += snoise(t * 70, 91) * v;
    y += snoise(t * 75, 92) * v;
  }
  return { x, y, r, z };
}

const FLARES = [[T.drop, CX, 560, 0.7, 1], [T.bolt, 1060, 470, 0.45, 0.8], [T.cta, CX, 560, 0.8, 1],
  [T.endCard + 0.17, 790, 420, 0.5, 0.6]];

const FLASHES = [[T.drop, 0.85, 0.32], [T.bolt, 0.4, 0.2], [8.0, 0.3, 0.2], [T.db, 0.4, 0.28], [T.cta, 0.6, 0.36], [T.endCard + 0.17, 0.25, 0.3]];

function glitchAt(t) {
  let g = 0;
  if (t > T.unstable && t < T.blackout) g = noise1(t * 14, 11) > 0.7 ? 0.3 + 0.5 * P(t, T.unstable, T.blackout) : 0;
  if (t >= T.blackout && t < T.blackout + 0.14) g = 0.95;
  if (t >= T.line1 && t < T.line1 + 0.12) g = Math.max(g, 0.45);
  if (t >= T.line1Out - 0.1 && t < T.line1Out + 0.03) g = Math.max(g, 0.55);
  return g;
}

// 0 on the dark stage, 1 on the light track-record scene.
function lightMix(t) {
  return Math.min(P(t, T.processOut, 21.05, ease.io3), 1 - P(t, T.statsOut, 23.55, ease.io3));
}

function bloomAt(t) {
  let b = 0.42;
  if (t >= T.drop && t < 8.0) b = 0.52;
  if (t >= T.cta) b = 0.5;
  return lerp(b, 0.06, lightMix(t));
}

// ================================================================ render
const SCENES = [
  { a: 0, b: T.drop, draw: sceneGrid },
  { a: T.drop, b: 8.03, draw: sceneLogo },
  { a: T.zoom, b: 10.03, draw: sceneRange },
  { a: T.brandsOut, b: 15.0, draw: sceneHero, push: 0.035 },
  { a: T.rangeOut, b: 12.0, draw: sceneBrands, push: 0.025 },
  { a: T.db, b: 17.0, draw: sceneDb, push: 0.03 },
  { a: T.services, b: T.process, draw: sceneServices, push: 0.05 },
  { a: T.process, b: 21.06, draw: sceneProcess, push: 0.03 },
  { a: T.processOut, b: 23.56, draw: sceneStats, push: 0.025 },
  { a: T.statsOut, b: T.cta, draw: sceneMap, push: 0.02 },
  { a: T.cta, b: 30.01, draw: sceneCta },
];

export function render(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  ctx.shadowBlur = 0;
  ctx.letterSpacing = '0px';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.void;
  ctx.fillRect(0, 0, W, H);

  const sh = shake(t);
  ctx.save();
  ctx.translate(CX + sh.x, CY + sh.y);
  ctx.rotate(sh.r);
  ctx.scale(1 + sh.z, 1 + sh.z);
  ctx.translate(-CX, -CY);
  const PR = window.__prof;
  const mark = (k) => { if (!PR) return; ctx.getImageData(0, 0, 1, 1); const n = performance.now(); PR[k] = (PR[k] || 0) + n - PR._t; PR._t = n; };
  if (PR) { ctx.getImageData(0, 0, 1, 1); PR._t = performance.now(); }
  for (const s of SCENES) {
    if (t >= s.a && t < s.b) {
      ctx.save();
      if (s.push) {
        const z = 1 + s.push * ease.smooth(clamp((t - s.a) / (s.b - s.a)));
        ctx.translate(CX, CY);
        ctx.scale(z, z);
        ctx.translate(-CX, -CY);
      }
      s.draw(ctx, t);
      ctx.restore();
      mark(s.draw.name);
    }
  }
  ctx.restore();

  for (const [t0, x, y, dur, peak] of FLARES) {
    const k = (t - t0) / dur;
    if (k >= 0 && k < 1) flare(ctx, x, y, peak * (1 - k) ** 2);
  }
  hudFrame(ctx, t);
  mark('hud');
  const g = glitchAt(t);
  if (g > 0) {
    glitch(ctx, g, t);
    chroma(ctx, 4 + g * 10);
  }
  mark('glitch');
  bloom(ctx, bloomAt(t));
  mark('bloom');
  for (const [t0, peak, dur] of FLASHES) {
    const k = (t - t0) / dur;
    if (k < 0 || k > 1) continue;
    ctx.fillStyle = `rgba(235,248,255,${peak * (1 - k) ** 2})`;
    ctx.fillRect(0, 0, W, H);
  }
  mark('flash');
  vignette(ctx, lerp(0.5, 0.16, lightMix(t)));
  mark('vignette');
  grain(ctx, t, 0.055);
  mark('grain');
  const fade = Math.max(1 - P(t, 0, 0.3), P(t, T.fadeOut, 30));
  if (fade > 0) {
    ctx.fillStyle = `rgba(0,0,0,${fade})`;
    ctx.fillRect(0, 0, W, H);
  }
}
