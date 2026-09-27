// The Cairo night skyline used in the opening: pyramids on the horizon,
// Cairo Tower, a minaret, a hospital, towers with lit windows, a highway and
// the transmission line that carries the grid. `level` decides how many
// lights are on, so the same drawing serves the grid, the blackout and the
// moment the generator takes the load.
import { W, H, CX, CY, C, clamp, lerp, rng, hash, noise1, rgba, mixHex } from './core.js';

const GROUND = 842;
let city = null;

function build() {
  const r = rng(20061);
  const landmarks = [
    { kind: 'tower', x: 760, w: 64, h: 560 },
    { kind: 'mosque', x: 1040, w: 190, h: 150 },
    { kind: 'hospital', x: 1330, w: 250, h: 270 },
    { kind: 'glass', x: 1640, w: 120, h: 430 },
    { kind: 'factory', x: 60, w: 230, h: 130 },
  ];
  const blocked = x => landmarks.some(l => x > l.x - 20 && x < l.x + l.w + 20);
  const near = [];
  let x = -360;
  while (x < W + 360) {
    const w = 46 + r() * 104;
    if (!blocked(x + w / 2)) {
      let h = 110 + r() ** 1.7 * 330;
      if (Math.abs(x - 800) < 160) h *= 0.55; // keep the tower clear
      near.push({ kind: 'block', x, w, h, seed: Math.floor(r() * 1e9), roof: r() });
    }
    x += w + (r() < 0.25 ? 6 + r() * 26 : 2);
  }
  const far = [];
  x = -500;
  while (x < W + 500) {
    const w = 60 + r() * 140;
    far.push({ x, w, h: 60 + r() ** 1.3 * 190, seed: Math.floor(r() * 1e9) });
    x += w + 4;
  }
  const stars = Array.from({ length: 170 }, (_, i) => ({
    x: r() * W, y: r() * 560, s: 0.6 + r() * 1.5, p: r() * 10, b: 0.25 + r() * 0.75, i,
  }));
  const cars = Array.from({ length: 34 }, () => ({
    lane: r() < 0.5 ? 0 : 1, off: r() * 3000, v: 260 + r() * 180,
  }));
  city = { near, far, stars, cars, landmarks };
}

// Light level for one window. level() gives the city state; x lets the
// blackout travel across the skyline.
export function cityLight(t, x, seed) {
  const n = hash(seed);
  if (t < 1.2) return 0.85 + 0.15 * noise1(t * 0.7 + n * 50, seed);
  if (t < 2.0) {
    const flick = noise1(t * 26 + n * 90, seed) > 0.72 ? 0.15 : 1;
    const sag = lerp(1, 0.72, (t - 1.2) / 0.8);
    return sag * flick;
  }
  if (t < 6.0) {
    const off = 2.0 + 0.3 * (1 - clamp(x / W)) + n * 0.07;
    if (t < off) return noise1(t * 40 + n * 70, seed) > 0.5 ? 0.6 : 0.15;
    return 0;
  }
  const on = 6.0 + 0.1 * Math.abs(x - CX) / CX + n * 0.04;
  return t < on ? 0 : 1;
}

// Overall grid state, used for sky glow, cables and street lights.
export function gridLevel(t) {
  if (t < 1.2) return 1;
  if (t < 2.0) return lerp(1, 0.7, (t - 1.2) / 0.8) * (noise1(t * 30, 5) > 0.7 ? 0.45 : 1);
  if (t < 2.28) return lerp(0.55, 0, (t - 2.0) / 0.28);
  if (t < 6.0) return 0;
  return 1;
}

function windowColor(seed) {
  const h = hash(seed * 3 + 1);
  return h < 0.72 ? C.warm : h < 0.9 ? '#EAF4FF' : '#9FDcff';
}

function drawWindows(ctx, t, b, x, top, w, h, density = 0.42, size = [7, 10], gap = [15, 21]) {
  const cols = Math.max(1, Math.floor((w - 14) / gap[0]));
  const rows = Math.max(1, Math.floor((h - 26) / gap[1]));
  const x0 = x + (w - (cols - 1) * gap[0] - size[0]) / 2;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const s = b.seed + j * 131 + i * 7;
      if (hash(s) > density) continue;
      const wx = x0 + i * gap[0];
      const lv = cityLight(t, wx, s);
      if (lv <= 0.02) continue;
      const bright = 0.45 + 0.55 * hash(s + 99);
      ctx.fillStyle = rgba(windowColor(s), lv * bright);
      ctx.fillRect(wx, top + 16 + j * gap[1], size[0], size[1]);
    }
  }
}

function drawBlock(ctx, t, b) {
  const top = GROUND - b.h;
  const g = ctx.createLinearGradient(0, top, 0, GROUND);
  g.addColorStop(0, '#0B1A31');
  g.addColorStop(1, '#050B16');
  ctx.fillStyle = g;
  ctx.fillRect(b.x, top, b.w, b.h);
  if (b.roof > 0.7) {
    ctx.fillRect(b.x + b.w * 0.3, top - 18, b.w * 0.2, 18);
    ctx.fillRect(b.x + b.w * 0.62, top - 34, 3, 34);
  }
  ctx.fillStyle = 'rgba(126,216,255,0.10)';
  ctx.fillRect(b.x, top, b.w, 2);
  drawWindows(ctx, t, b, b.x, top, b.w, b.h);
}

function drawTower(ctx, t, l) {
  // Cairo Tower: a slim lattice shaft, a flared crown and a mast.
  const cx = l.x + l.w / 2;
  const top = GROUND - l.h;
  ctx.fillStyle = '#081427';
  ctx.beginPath();
  ctx.moveTo(cx - 26, GROUND);
  ctx.lineTo(cx - 17, top + 110);
  ctx.lineTo(cx + 17, top + 110);
  ctx.lineTo(cx + 26, GROUND);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(126,216,255,0.13)';
  ctx.lineWidth = 1;
  for (let y = top + 110; y < GROUND; y += 14) {
    ctx.beginPath();
    ctx.moveTo(cx - 30, y);
    ctx.lineTo(cx + 30, y + 14);
    ctx.moveTo(cx + 30, y);
    ctx.lineTo(cx - 30, y + 14);
    ctx.stroke();
  }
  ctx.restore();
  // Crown.
  ctx.fillStyle = '#0A1830';
  ctx.beginPath();
  ctx.moveTo(cx - 17, top + 112);
  ctx.bezierCurveTo(cx - 20, top + 90, cx - 44, top + 70, cx - 42, top + 48);
  ctx.lineTo(cx + 42, top + 48);
  ctx.bezierCurveTo(cx + 44, top + 70, cx + 20, top + 90, cx + 17, top + 112);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(cx - 30, top + 30, 60, 18);
  ctx.fillRect(cx - 6, top - 60, 12, 92);
  ctx.fillRect(cx - 2, top - 120, 4, 62);
  // Crown lights and the red aviation lamp.
  const lv = cityLight(t, cx, 77);
  if (lv > 0) {
    ctx.fillStyle = rgba(C.warm, 0.9 * lv);
    for (let i = -3; i <= 3; i++) ctx.fillRect(cx + i * 9 - 2, top + 36, 4, 6);
    ctx.fillStyle = rgba('#8FDFFF', 0.5 * lv);
    ctx.fillRect(cx - 40, top + 52, 80, 2);
  }
  const blink = (Math.floor(t * 1.4) % 2 === 0 ? 1 : 0.15) * (t > 2.1 && t < 6 ? 0 : 1);
  if (blink > 0.2) {
    ctx.save();
    ctx.shadowColor = C.red;
    ctx.shadowBlur = 18;
    ctx.fillStyle = rgba(C.red, blink);
    ctx.beginPath();
    ctx.arc(cx, top - 122, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawMosque(ctx, t, l) {
  const base = GROUND - 70;
  ctx.fillStyle = '#081528';
  ctx.fillRect(l.x, base, l.w, 70);
  const cx = l.x + l.w * 0.42;
  ctx.beginPath();
  ctx.moveTo(cx - 62, base);
  ctx.bezierCurveTo(cx - 64, base - 70, cx - 20, base - 92, cx, base - 104);
  ctx.bezierCurveTo(cx + 20, base - 92, cx + 64, base - 70, cx + 62, base);
  ctx.fill();
  ctx.fillRect(cx - 2, base - 130, 4, 28);
  // Minaret.
  const mx = l.x + l.w - 24;
  ctx.fillRect(mx - 9, GROUND - 330, 18, 330);
  ctx.fillRect(mx - 14, GROUND - 250, 28, 8);
  ctx.fillRect(mx - 13, GROUND - 190, 26, 7);
  ctx.beginPath();
  ctx.moveTo(mx - 9, GROUND - 330);
  ctx.lineTo(mx, GROUND - 380);
  ctx.lineTo(mx + 9, GROUND - 330);
  ctx.fill();
  const lv = cityLight(t, mx, 1301);
  if (lv > 0) {
    ctx.fillStyle = rgba('#B8F0C8', 0.75 * lv);
    ctx.fillRect(mx - 14, GROUND - 252, 28, 2);
    ctx.fillRect(mx - 13, GROUND - 192, 26, 2);
    ctx.fillStyle = rgba(C.warm, 0.55 * lv);
    for (let i = 0; i < 6; i++) ctx.fillRect(l.x + 14 + i * 24, base + 24, 8, 16);
  }
}

function drawHospital(ctx, t, l) {
  const top = GROUND - l.h;
  ctx.fillStyle = '#0A1A31';
  ctx.fillRect(l.x, top, l.w, l.h);
  ctx.fillRect(l.x + l.w * 0.2, top - 40, l.w * 0.6, 40);
  ctx.fillStyle = 'rgba(126,216,255,0.12)';
  ctx.fillRect(l.x, top, l.w, 2);
  drawWindows(ctx, t, { seed: 9091 }, l.x, top, l.w, l.h, 0.62, [9, 8], [17, 18]);
  // The H sign on the roof; the last light to die in the blackout.
  const cx = l.x + l.w / 2, cy = top - 86;
  let lv = t < 2.0 ? cityLight(t, cx, 4242) : t < 6 ? (t < 2.42 ? (noise1(t * 30, 9) > 0.45 ? 0.8 : 0.1) : 0) : 1;
  ctx.fillStyle = '#0C1D36';
  ctx.fillRect(cx - 38, cy - 38, 76, 76);
  ctx.fillRect(cx - 3, cy + 38, 6, 12);
  if (lv > 0.05) {
    ctx.save();
    ctx.shadowColor = '#FF5A5A';
    ctx.shadowBlur = 30 * lv;
    ctx.fillStyle = rgba('#FF4A4A', lv);
    ctx.fillRect(cx - 34, cy - 34, 68, 68);
    ctx.restore();
    ctx.fillStyle = rgba('#FFFFFF', lv);
    ctx.fillRect(cx - 18, cy - 22, 9, 44);
    ctx.fillRect(cx + 9, cy - 22, 9, 44);
    ctx.fillRect(cx - 9, cy - 4, 18, 8);
  }
}

function drawGlass(ctx, t, l) {
  const top = GROUND - l.h;
  const g = ctx.createLinearGradient(l.x, 0, l.x + l.w, 0);
  g.addColorStop(0, '#0B1D38');
  g.addColorStop(1, '#061126');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(l.x, GROUND);
  ctx.lineTo(l.x, top + 30);
  ctx.lineTo(l.x + l.w, top);
  ctx.lineTo(l.x + l.w, GROUND);
  ctx.fill();
  const lv = cityLight(t, l.x + l.w / 2, 5150);
  // Vertical LED strips of the data floors.
  for (let i = 0; i < 5; i++) {
    const x = l.x + 14 + i * 23;
    const a = lv * (0.35 + 0.35 * noise1(t * 3 + i, 17));
    if (a <= 0.02) continue;
    ctx.fillStyle = rgba(C.ice, a);
    ctx.fillRect(x, top + 40 + (i % 2) * 20, 2, l.h - 70);
  }
}

function drawFactory(ctx, t, l) {
  const top = GROUND - l.h;
  ctx.fillStyle = '#081426';
  ctx.beginPath();
  ctx.moveTo(l.x, GROUND);
  ctx.lineTo(l.x, top + 40);
  for (let i = 0; i < 4; i++) {
    const x = l.x + i * (l.w / 4);
    ctx.lineTo(x + l.w / 4, top);
    ctx.lineTo(x + l.w / 4, top + 40);
  }
  ctx.lineTo(l.x + l.w, GROUND);
  ctx.fill();
  ctx.fillRect(l.x + l.w - 50, top - 150, 22, 150);
  const lv = cityLight(t, l.x + 100, 6060);
  if (lv > 0) {
    ctx.fillStyle = rgba(C.warm, 0.6 * lv);
    for (let i = 0; i < 8; i++) ctx.fillRect(l.x + 16 + i * 26, top + 64, 14, 22);
  }
}

function drawPyramids(ctx, alpha) {
  const g = ctx.createLinearGradient(0, GROUND - 240, 0, GROUND);
  g.addColorStop(0, rgba('#12294A', alpha));
  g.addColorStop(1, rgba('#0B1B33', alpha));
  ctx.fillStyle = g;
  for (const [x, b, h] of [[170, 420, 230], [520, 330, 185], [760, 170, 96]]) {
    ctx.beginPath();
    ctx.moveTo(x - b / 2, GROUND - 60);
    ctx.lineTo(x, GROUND - 60 - h);
    ctx.lineTo(x + b / 2, GROUND - 60);
    ctx.fill();
    // Moon-lit face.
    ctx.fillStyle = rgba('#1B3C66', alpha * 0.6);
    ctx.beginPath();
    ctx.moveTo(x, GROUND - 60 - h);
    ctx.lineTo(x + b / 2, GROUND - 60);
    ctx.lineTo(x + b * 0.08, GROUND - 60);
    ctx.fill();
    ctx.fillStyle = g;
  }
}

function pylon(ctx, x, top, bottom, scale) {
  const hw = 70 * scale, tw = 12 * scale;
  ctx.beginPath();
  ctx.moveTo(x - hw, bottom);
  ctx.lineTo(x - tw, top);
  ctx.lineTo(x + tw, top);
  ctx.lineTo(x + hw, bottom);
  ctx.stroke();
  const levels = 9;
  for (let i = 0; i < levels; i++) {
    const y1 = lerp(bottom, top, i / levels), y2 = lerp(bottom, top, (i + 1) / levels);
    const w1 = lerp(hw, tw, i / levels), w2 = lerp(hw, tw, (i + 1) / levels);
    ctx.beginPath();
    ctx.moveTo(x - w1, y1);
    ctx.lineTo(x + w2, y2);
    ctx.moveTo(x + w1, y1);
    ctx.lineTo(x - w2, y2);
    ctx.moveTo(x - w2, y2);
    ctx.lineTo(x + w2, y2);
    ctx.stroke();
  }
  // Cross-arms.
  const arms = [[top + 40 * scale, 150], [top + 120 * scale, 190], [top + 200 * scale, 150]];
  for (const [y, len] of arms) {
    ctx.beginPath();
    ctx.moveTo(x - len * scale, y);
    ctx.lineTo(x + len * scale, y);
    ctx.lineTo(x + 20 * scale, y + 26 * scale);
    ctx.moveTo(x - len * scale, y);
    ctx.lineTo(x - 20 * scale, y + 26 * scale);
    ctx.stroke();
  }
  return arms.map(([y, len]) => [[x - len * scale, y + 30 * scale], [x + len * scale, y + 30 * scale]]);
}

function catenary(ax, ay, bx, by, sag) {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    pts.push([lerp(ax, bx, u), lerp(ay, by, u) + sag * 4 * u * (1 - u)]);
  }
  return pts;
}

// camera: { s: zoom, x: pan }. level override lets scenes dim the city.
export function drawCity(ctx, t, cam, { dim = 0 } = {}) {
  if (!city) build();
  const lvl = gridLevel(t);
  const dark = t >= 2.0 && t < 6.0 ? clamp((t - 2.0) / 0.4) : 0;

  // Sky: the horizon glow is the city's own light.
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND + 40);
  sky.addColorStop(0, '#010309');
  sky.addColorStop(0.55, mixHex('#06142A', '#030914', dark));
  sky.addColorStop(1, mixHex('#1A3A66', '#07101F', 1 - lvl * (1 - dark)));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const layer = (par, fn) => {
    ctx.save();
    const s = 1 + (cam.s - 1) * par;
    ctx.translate(CX, CY + 120);
    ctx.scale(s, s);
    ctx.translate(-CX - cam.x * par, -CY - 120 - (cam.y || 0) * par);
    fn();
    ctx.restore();
  };

  // Stars get brighter when the city goes dark.
  layer(0.05, () => {
    for (const s of city.stars) {
      const tw = 0.6 + 0.4 * Math.sin(t * 2.2 + s.p * 7);
      const a = s.b * tw * (0.35 + 0.65 * dark);
      ctx.fillStyle = `rgba(220,236,255,${a})`;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }
  });

  layer(0.25, () => drawPyramids(ctx, 1));

  layer(0.5, () => {
    ctx.fillStyle = '#0A1830';
    for (const b of city.far) {
      ctx.fillRect(b.x, GROUND - 30 - b.h, b.w, b.h + 30);
    }
    for (const b of city.far) {
      for (let j = 0; j < 6; j++) {
        const s = b.seed + j;
        if (hash(s) > 0.5) continue;
        const lv = cityLight(t, b.x, s);
        if (lv <= 0) continue;
        ctx.fillStyle = rgba(C.warm, 0.35 * lv);
        ctx.fillRect(b.x + 6 + hash(s + 1) * (b.w - 16), GROUND - 30 - b.h + 10 + hash(s + 2) * (b.h - 20), 4, 5);
      }
    }
  });

  layer(1, () => {
    for (const b of city.near) drawBlock(ctx, t, b);
    for (const l of city.landmarks) {
      if (l.kind === 'tower') drawTower(ctx, t, l);
      else if (l.kind === 'mosque') drawMosque(ctx, t, l);
      else if (l.kind === 'hospital') drawHospital(ctx, t, l);
      else if (l.kind === 'glass') drawGlass(ctx, t, l);
      else drawFactory(ctx, t, l);
    }
    // Ground and highway.
    const gg = ctx.createLinearGradient(0, GROUND, 0, H + 200);
    gg.addColorStop(0, '#060D19');
    gg.addColorStop(1, '#01040A');
    ctx.fillStyle = gg;
    ctx.fillRect(-400, GROUND, W + 800, H);
    // Street lamps.
    for (let i = 0; i < 46; i++) {
      const x = -300 + i * 56 + hash(i * 7 + 3) * 30;
      const lv = cityLight(t, x, 7000 + i);
      if (lv <= 0.02) continue;
      const gl = ctx.createRadialGradient(x, GROUND + 9, 0, x, GROUND + 9, 16);
      gl.addColorStop(0, rgba('#FFE2B0', 0.55 * lv));
      gl.addColorStop(0.25, rgba('#FFC870', 0.16 * lv));
      gl.addColorStop(1, 'rgba(255,200,112,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(x - 16, GROUND - 7, 32, 32);
    }
    // Cars keep moving with their own lights through the blackout.
    for (const c of city.cars) {
      const dir = c.lane === 0 ? 1 : -1;
      const span = W + 800;
      const x = ((c.off + t * c.v * dir) % span + span) % span - 400;
      const y = GROUND + 26 + c.lane * 10;
      ctx.fillStyle = dir > 0 ? 'rgba(255,70,60,0.85)' : 'rgba(255,244,220,0.9)';
      ctx.fillRect(x, y, 14, 2);
    }
  });

  // Foreground transmission line.
  layer(1.35, () => {
    ctx.strokeStyle = '#02050B';
    ctx.lineWidth = 3;
    const armsA = pylon(ctx, 170, 150, 1250, 1.05);
    const armsB = pylon(ctx, 1590, 250, 1250, 0.85);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(126,216,255,0.10)';
    pylon(ctx, 170, 150, 1250, 1.05);
    pylon(ctx, 1590, 250, 1250, 0.85);
    const cables = [];
    for (let k = 0; k < 3; k++) {
      cables.push(catenary(armsA[k][1][0], armsA[k][1][1], armsB[k][0][0], armsB[k][0][1], 150));
      cables.push(catenary(armsB[k][1][0], armsB[k][1][1], W + 500, armsB[k][1][1] + 110, 120));
      cables.push(catenary(-500, armsA[k][0][1] + 140, armsA[k][0][0], armsA[k][0][1], 110));
    }
    ctx.strokeStyle = '#030811';
    ctx.lineWidth = 2.2;
    for (const c of cables) {
      ctx.beginPath();
      c.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    }
    // Current flowing along the cables.
    const flow = lvl;
    if (flow > 0.02) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      cables.forEach((c, ci) => {
        ctx.strokeStyle = rgba(C.cyan, 0.34 * flow);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        c.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
        for (let p = 0; p < 3; p++) {
          const speed = t >= 6 ? 0.9 : 0.45;
          const u = ((t * speed + p / 3 + ci * 0.137) % 1 + 1) % 1;
          const idx = u * (c.length - 1);
          const i0 = Math.floor(idx), f = idx - i0;
          const a = c[i0], b = c[Math.min(c.length - 1, i0 + 1)];
          const x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f);
          const gr = ctx.createRadialGradient(x, y, 0, x, y, 26);
          gr.addColorStop(0, rgba('#CFF3FF', 0.9 * flow));
          gr.addColorStop(0.3, rgba(C.cyan, 0.4 * flow));
          gr.addColorStop(1, 'rgba(0,156,222,0)');
          ctx.fillStyle = gr;
          ctx.fillRect(x - 26, y - 26, 52, 52);
        }
      });
      ctx.restore();
    }
  });

  if (dim > 0) {
    ctx.fillStyle = `rgba(2,6,13,${dim})`;
    ctx.fillRect(0, 0, W, H);
  }
}
