// Image assets from the website, prepared for compositing on a dark stage:
// the logo is keyed off its white background and split into the "P" and the
// lightning bolt, and the gallery photos are cut out of their white sweeps.
import { makeCanvas, clamp } from './core.js';

export const A = {};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load ' + src));
    img.src = src;
  });
}

// Logo: every logo colour has a red channel near 28, the paper is 255, so the
// red channel gives the coverage. The bolt is the connected shape that
// contains a point in its upper arm.
function prepareLogo(img) {
  const w = img.naturalWidth, h = img.naturalHeight;
  const c = makeCanvas(w, h);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const src = g.getImageData(0, 0, w, h);
  const d = src.data;
  const n = w * h;
  const alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) alpha[i] = clamp((255 - d[i * 4]) / 227);

  const bolt = new Uint8Array(n);
  const stack = [1150 + 200 * w];
  while (stack.length) {
    const p = stack.pop();
    if (bolt[p] || alpha[p] < 0.12) continue;
    bolt[p] = 1;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }

  const make = keep => {
    const out = g.createImageData(w, h);
    const o = out.data;
    for (let i = 0; i < n; i++) {
      const a = alpha[i];
      if (a <= 0.004 || !keep(i)) continue;
      for (let k = 0; k < 3; k++) o[i * 4 + k] = clamp((d[i * 4 + k] - (1 - a) * 255) / a, 0, 255);
      o[i * 4 + 3] = a * 255;
    }
    const cv = makeCanvas(w, h);
    cv.getContext('2d').putImageData(out, 0, 0);
    return cv;
  };
  A.logo = make(() => true);
  A.logoP = make(i => !bolt[i]);
  A.logoBolt = make(i => bolt[i]);
  // Glow silhouette of the whole mark, used for flashes.
  const sil = makeCanvas(w, h);
  const sg = sil.getContext('2d');
  sg.drawImage(A.logo, 0, 0);
  sg.globalCompositeOperation = 'source-in';
  sg.fillStyle = '#ffffff';
  sg.fillRect(0, 0, w, h);
  A.logoWhite = sil;
}

// Gallery photos: flood the white/grey sweep from the border, stop at the
// product, then feather the edge so no white halo survives on dark
// backgrounds.
function cutout(img, targetW) {
  const s = targetW / img.naturalWidth;
  const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
  const c = makeCanvas(w, h);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, 0, 0, w, h);
  const im = g.getImageData(0, 0, w, h);
  const d = im.data;
  const n = w * h;
  const bg = new Uint8Array(n);
  const isBg = p => {
    const r = d[p * 4], gg = d[p * 4 + 1], b = d[p * 4 + 2];
    const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
    return mx - mn < 26 && (r + gg + b) / 3 > 168;
  };
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, x + (h - 1) * w);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (bg[p] || !isBg(p)) continue;
    bg[p] = 1;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  // Distance (in px, up to 3) from the background for the edge feather.
  const dist = new Uint8Array(n).fill(255);
  for (let i = 0; i < n; i++) if (bg[i]) dist[i] = 0;
  for (let pass = 1; pass <= 3; pass++) {
    for (let i = 0; i < n; i++) {
      if (dist[i] !== 255) continue;
      const x = i % w;
      if ((x > 0 && dist[i - 1] === pass - 1) || (x < w - 1 && dist[i + 1] === pass - 1) ||
          (i >= w && dist[i - w] === pass - 1) || (i < n - w && dist[i + w] === pass - 1)) dist[i] = pass;
    }
  }
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let i = 0; i < n; i++) {
    const k = dist[i];
    const a = k === 0 ? 0 : k === 1 ? 0.28 : k === 2 ? 0.75 : 1;
    if (k === 1 || k === 2) {
      // Pull edge pixels towards the product colour, away from the paper.
      for (let ch = 0; ch < 3; ch++) d[i * 4 + ch] *= k === 1 ? 0.55 : 0.85;
    }
    d[i * 4 + 3] = a * 255;
    if (a > 0) {
      const x = i % w, y = (i / w) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  g.putImageData(im, 0, 0);
  const out = makeCanvas(maxX - minX + 1, maxY - minY + 1);
  out.getContext('2d').drawImage(c, -minX, -minY);
  return out;
}

export async function loadAssets() {
  const base = '../../images/';
  const [logo, canopy, open, canopy2, open2] = await Promise.all([
    loadImage(base + 'logo.png'),
    loadImage(base + 'gallery/gen_3.webp'),
    loadImage(base + 'gallery/gen_8.webp'),
    loadImage(base + 'gallery/gen_1.webp'),
    loadImage(base + 'gallery/gen_7.webp'),
  ]);
  prepareLogo(logo);
  A.canopy = cutout(canopy, 1700);
  A.open = cutout(open, 1700);
  A.canopySmall = cutout(canopy2, 900);
  A.openSmall = cutout(open2, 900);
}
