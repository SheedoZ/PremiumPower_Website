// Sound design and score for the showreel, rendered offline with the Web
// Audio API. Every sound is synthesised here (no samples) and every cue is
// read from cues.js, the same table the picture uses, so hits land on cuts.
//
// Story in sound: mains hum → the grid wobbles and dies (power-down whine,
// breaker, silence, clock) → a relay clacks, a diesel cranks and revs to
// 1500 rpm under a riser → the drop, and a 120 bpm score in E minor carries
// the rest, resolving to G major on the call to action.
import { T, BEAT, DURATION, STATS } from './cues.js';
import { rng, clamp, lerp, ease } from './core.js';

const SR = 48000;
const MASTER = 0.72;
const MUSIC = 0.74;
const midi = n => 440 * 2 ** ((n - 69) / 12);

let ctx, bus;

// ---------------------------------------------------------------- plumbing
function gainNode(v, ...dest) {
  const g = ctx.createGain();
  g.gain.value = v;
  dest.forEach(d => d && g.connect(d));
  return g;
}

function filter(type, f, q = 0.7, dest) {
  const b = ctx.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  if (dest) b.connect(dest);
  return b;
}

function panner(p, dest) {
  const s = ctx.createStereoPanner();
  s.pan.value = p;
  s.connect(dest);
  return s;
}

function osc(type, f, t0, t1, dest, detune = 0) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = f;
  o.detune.value = detune;
  o.connect(dest);
  o.start(t0);
  o.stop(t1);
  return o;
}

let noiseSeed = 1;
function noise(t0, t1, dest, kind = 'white') {
  const s = ctx.createBufferSource();
  s.buffer = kind === 'pink' ? bus.pink : bus.white;
  s.loop = true;
  s.connect(dest);
  const off = (noiseSeed++ * 0.61803) % 1.9;
  s.start(t0, off);
  s.stop(t1);
  return s;
}

// Percussive envelope: fast attack, exponential decay.
function perc(param, t, peak, decay, attack = 0.002) {
  param.setValueAtTime(0, t);
  param.linearRampToValueAtTime(peak, t + attack);
  param.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  param.setValueAtTime(0, t + attack + decay + 0.001);
}

function shaperCurve(k) {
  const n = 2048, c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.tanh(k * x) / Math.tanh(k);
  }
  return c;
}

function makeNoise(seconds, seed, pink = false) {
  const b = ctx.createBuffer(1, SR * seconds, SR);
  const d = b.getChannelData(0);
  const r = rng(seed);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < d.length; i++) {
    const w = r() * 2 - 1;
    if (!pink) { d[i] = w; continue; }
    b0 = 0.99765 * b0 + w * 0.099046;
    b1 = 0.963 * b1 + w * 0.2965164;
    b2 = 0.57 * b2 + w * 1.0526913;
    d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.22;
  }
  return b;
}

// Stereo hall: decorrelated noise with a decay that also darkens over time.
function makeImpulse(seconds, decay, seed) {
  const n = Math.floor(SR * seconds);
  const b = ctx.createBuffer(2, n, SR);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    const r = rng(seed + ch * 101);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const a = lerp(0.85, 0.08, Math.min(1, t / seconds));
      lp += a * (r() * 2 - 1 - lp);
      const pre = t < 0.018 ? 0 : 1;
      d[i] = lp * Math.exp(-t / decay) * pre;
    }
  }
  return b;
}

function buildBuses() {
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -2;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.12;
  limiter.connect(ctx.destination);
  const glue = ctx.createDynamicsCompressor();
  glue.threshold.value = -18;
  glue.knee.value = 8;
  glue.ratio.value = 2.5;
  glue.attack.value = 0.012;
  glue.release.value = 0.2;
  glue.connect(limiter);
  // Mastering EQ: trim sub rumble and low-mid mud, lift presence.
  const eq = [
    ['highpass', 30, 0.7, 0],
    ['lowshelf', 150, 0.7, -5],
    ['peaking', 300, 0.9, -3],
    ['highshelf', 3000, 0.7, 3],
    ['highshelf', 12000, 0.7, -5],
  ].map(([type, f, q, gdb]) => {
    const b = filter(type, f, q);
    b.gain.value = gdb;
    return b;
  });
  eq.reduce((a, b) => (a.connect(b), b)).connect(glue);
  const master = gainNode(MASTER, eq[0]);

  const verb = ctx.createConvolver();
  verb.buffer = makeImpulse(3.2, 0.62, 77);
  const verbOut = gainNode(0.42, master);
  verb.connect(verbOut);
  const verbIn = gainNode(1, verb);

  // Stereo delay: dotted eighth left, quarter right, darkened feedback.
  const delayIn = gainNode(1);
  const dl = ctx.createDelay(1), dr = ctx.createDelay(1);
  dl.delayTime.value = BEAT * 0.75;
  dr.delayTime.value = BEAT;
  const fb = gainNode(0.32);
  const dark = filter('lowpass', 3200, 0.5);
  delayIn.connect(dl);
  delayIn.connect(dr);
  dl.connect(dark);
  dr.connect(dark);
  dark.connect(fb);
  fb.connect(dl);
  fb.connect(dr);
  const delayOut = gainNode(0.3);
  dl.connect(panner(-0.7, delayOut));
  dr.connect(panner(0.7, delayOut));
  delayOut.connect(master);
  delayOut.connect(verbIn);

  // Music runs through a sidechain duck and a filter (for the acoustic scene).
  const musicOut = gainNode(1, master);
  const musicLP = filter('lowpass', 20000, 0.6, musicOut);
  const duck = gainNode(1, musicLP);
  const music = gainNode(1, duck);
  const drums = gainNode(1, musicLP);
  const sfx = gainNode(1, master);
  const shaper = ctx.createWaveShaper();
  shaper.curve = shaperCurve(2.2);
  shaper.oversample = '2x';

  bus = {
    master, verbIn, delayIn, musicOut, musicLP, duck, music, drums, sfx, shaper,
    white: makeNoise(4, 11), pink: makeNoise(4, 12, true),
  };
}

// ---------------------------------------------------------------- drums
function kick(t, amp = 1) {
  const g = gainNode(0, bus.drums);
  const o = osc('sine', 150, t, t + 0.6, g);
  o.frequency.setValueAtTime(165, t);
  o.frequency.exponentialRampToValueAtTime(52, t + 0.09);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.3);
  perc(g.gain, t, 0.72 * amp, 0.3);
  const c = gainNode(0, bus.drums);
  noise(t, t + 0.02, filter('highpass', 2500, 0.7, c));
  perc(c.gain, t, 0.22 * amp, 0.012, 0.0005);
  // Sidechain: the music ducks under every kick.
  bus.duck.gain.setTargetAtTime(0.32, t, 0.004);
  bus.duck.gain.setTargetAtTime(1, t + 0.035, 0.07);
}

function clap(t, amp = 1, p = 0) {
  const g = gainNode(0, panner(p, bus.drums), bus.verbIn);
  const bp = filter('bandpass', 1500, 0.9, g);
  noise(t, t + 0.35, bp);
  g.gain.setValueAtTime(0, t);
  for (const k of [0, 0.011, 0.022]) {
    g.gain.linearRampToValueAtTime(0.55 * amp, t + k + 0.001);
    g.gain.exponentialRampToValueAtTime(0.08 * amp, t + k + 0.009);
  }
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
  const body = gainNode(0, bus.drums);
  osc('triangle', 190, t, t + 0.12, body);
  perc(body.gain, t, 0.25 * amp, 0.08);
}

function hat(t, amp = 0.2, open = false, p = 0) {
  const g = gainNode(0, panner(p, bus.drums));
  noise(t, t + (open ? 0.4 : 0.08), filter('highpass', open ? 6500 : 8000, 0.8, g));
  perc(g.gain, t, amp, open ? 0.28 : 0.045, 0.001);
}

function snare(t, amp = 0.5, dest = bus.drums) {
  const g = gainNode(0, dest, bus.verbIn);
  noise(t, t + 0.2, filter('bandpass', 2400, 0.6, g));
  perc(g.gain, t, amp, 0.12, 0.001);
  const b = gainNode(0, dest);
  osc('triangle', 220, t, t + 0.1, b);
  perc(b.gain, t, amp * 0.4, 0.06);
}

// ---------------------------------------------------------------- tonal
function bassNote(t, n, dur, amp = 0.5) {
  const f = midi(n);
  const g = gainNode(0, bus.music);
  const lp = filter('lowpass', 300, 1.4, g);
  osc('sawtooth', f, t, t + dur + 0.05, lp);
  osc('square', f, t, t + dur + 0.05, lp, 7);
  lp.frequency.setValueAtTime(900, t);
  lp.frequency.exponentialRampToValueAtTime(220, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(amp, t + 0.006);
  g.gain.setTargetAtTime(amp * 0.6, t + 0.02, 0.06);
  g.gain.setTargetAtTime(0, t + dur, 0.015);
  const s = gainNode(0, bus.music);
  osc('sine', f / 2, t, t + dur + 0.05, s);
  g.gain.setValueAtTime(0, t + dur + 0.049);
  s.gain.setValueAtTime(0, t);
  s.gain.linearRampToValueAtTime(amp * 0.38, t + 0.008);
  s.gain.setTargetAtTime(0, t + dur, 0.02);
}

function pad(t0, t1, notes, amp = 0.05, cutoff = 1500) {
  const g = gainNode(0, bus.music, bus.verbIn);
  const hp = filter('highpass', 260, 0.6, g);
  const lp = filter('lowpass', cutoff, 0.6, hp);
  notes.forEach((n, i) => {
    for (const d of [-9, 9]) osc('sawtooth', midi(n), t0, t1 + 0.6, panner(i % 2 ? 0.35 : -0.35, lp), d + i);
  });
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(amp, t0 + 0.12);
  g.gain.setValueAtTime(amp, t1);
  g.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.55);
  return lp;
}

function pluck(t, n, amp = 0.1, p = 0, bright = 1) {
  const g = gainNode(0, panner(p, bus.music), bus.delayIn);
  const hp = filter('highpass', 320, 0.7, g);
  const lp = filter('lowpass', 3000, 2, hp);
  osc('sawtooth', midi(n), t, t + 0.4, lp);
  osc('square', midi(n + 12), t, t + 0.4, lp, 5);
  lp.frequency.setValueAtTime(900 + 3200 * bright, t);
  lp.frequency.exponentialRampToValueAtTime(500, t + 0.16);
  perc(g.gain, t, amp, 0.24, 0.002);
}

function bell(t, n, amp = 0.12, p = 0) {
  const g = gainNode(0, panner(p, bus.sfx), bus.verbIn, bus.delayIn);
  osc('sine', midi(n), t, t + 1.8, g);
  const h = gainNode(0, g);
  osc('sine', midi(n) * 2.76, t, t + 0.6, h);
  perc(h.gain, t, 0.4, 0.3);
  perc(g.gain, t, amp, 1.6, 0.003);
}

// ---------------------------------------------------------------- sfx
function impact(t, size = 1, p = 0) {
  const sub = gainNode(0, bus.master);
  const o = osc('sine', 110, t, t + 1.8, sub);
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(36, t + 0.55);
  perc(sub.gain, t, 0.75 * Math.min(size, 1.2), 0.8 + 0.45 * size);
  const body = gainNode(0, panner(p, bus.sfx), bus.verbIn);
  noise(t, t + 0.8, filter('lowpass', 1100, 0.8, body));
  perc(body.gain, t, 0.75 * size, 0.38, 0.001);
  const crack = gainNode(0, panner(p, bus.sfx), bus.verbIn);
  noise(t, t + 0.12, filter('highpass', 2600, 0.7, crack));
  perc(crack.gain, t, 0.4 * size, 0.07, 0.0005);
  // Metallic ring that gives the hit its sheen.
  const ring = gainNode(0, bus.verbIn, bus.sfx);
  for (const f of [523, 787, 1187, 1733]) osc('sine', f, t, t + 2.5, ring);
  perc(ring.gain, t, 0.03 * size, 1.8, 0.004);
}

function braam(t, dur, notes, level = 0.35) {
  const out = gainNode(0, bus.sfx, bus.verbIn);
  const lp = filter('lowpass', 180, 1.2, out);
  const sh = ctx.createWaveShaper();
  sh.curve = shaperCurve(3);
  sh.connect(lp);
  const pre = gainNode(0.5, sh);
  notes.forEach(n => {
    for (const d of [-12, 0, 12]) osc('sawtooth', midi(n), t, t + dur + 0.1, pre, d);
  });
  lp.frequency.setValueAtTime(160, t);
  lp.frequency.exponentialRampToValueAtTime(1500, t + 0.22);
  lp.frequency.exponentialRampToValueAtTime(420, t + dur);
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(level, t + 0.05);
  out.gain.setTargetAtTime(level * 0.55, t + 0.3, 0.4);
  out.gain.setTargetAtTime(0, t + dur - 0.3, 0.18);
}

function crash(t, amp = 0.35) {
  const g = gainNode(0, bus.sfx, bus.verbIn);
  noise(t, t + 3, filter('highpass', 4200, 0.5, g));
  perc(g.gain, t, amp, 2.2, 0.002);
}

function whoosh(t, dur, { from = -0.6, to = 0.6, f0 = 280, f1 = 2600, level = 0.45, q = 1.2, peak = 0.7, verb = 0.35 } = {}) {
  const pn = ctx.createStereoPanner();
  pn.connect(bus.sfx);
  const vs = gainNode(verb, bus.verbIn);
  pn.connect(vs);
  const g = gainNode(0, pn);
  const bp = filter('bandpass', f0, q, g);
  noise(t, t + dur + 0.05, bp, 'pink');
  const tp = t + dur * peak;
  bp.frequency.setValueAtTime(f0, t);
  bp.frequency.exponentialRampToValueAtTime(f1, tp);
  bp.frequency.exponentialRampToValueAtTime(Math.max(120, f0 * 1.2), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(level, tp);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  pn.pan.setValueAtTime(from, t);
  pn.pan.linearRampToValueAtTime(to, t + dur);
}

function riser(t0, t1, level = 0.5) {
  const g = gainNode(0, bus.sfx, bus.verbIn);
  const bp = filter('bandpass', 250, 1.8, g);
  noise(t0, t1, bp, 'pink');
  bp.frequency.setValueAtTime(250, t0);
  bp.frequency.exponentialRampToValueAtTime(7500, t1);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(level, t1 - 0.01);
  g.gain.setValueAtTime(0, t1);
  const tg = gainNode(0, bus.sfx);
  const lp = filter('lowpass', 2600, 1, tg);
  for (const d of [0, 7, 12]) {
    const o = osc('sawtooth', midi(40 + d), t0, t1, lp);
    o.frequency.setValueAtTime(midi(40 + d), t0);
    o.frequency.exponentialRampToValueAtTime(midi(64 + d), t1);
  }
  tg.gain.setValueAtTime(0, t0);
  tg.gain.linearRampToValueAtTime(level * 0.16, t1 - 0.01);
  tg.gain.setValueAtTime(0, t1);
}

function snareRoll(t0, t1, amp0 = 0.08, amp1 = 0.4, dest = bus.drums) {
  let t = t0;
  while (t < t1 - 0.01) {
    const k = (t - t0) / (t1 - t0);
    snare(t, lerp(amp0, amp1, k * k), dest);
    t += k < 0.5 ? BEAT / 4 : k < 0.8 ? BEAT / 8 : BEAT / 12;
  }
}

function reverseSwell(tEnd, dur, amp = 0.3) {
  const g = gainNode(0, bus.sfx, bus.verbIn);
  noise(tEnd - dur, tEnd, filter('highpass', 3500, 0.5, g));
  g.gain.setValueAtTime(0.0001, tEnd - dur);
  g.gain.exponentialRampToValueAtTime(amp, tEnd - 0.005);
  g.gain.setValueAtTime(0, tEnd);
}

function tick(t, f = 3200, amp = 0.1, p = 0) {
  const g = gainNode(0, panner(p, bus.sfx));
  osc('sine', f, t, t + 0.05, g);
  perc(g.gain, t, amp, 0.022, 0.0008);
}

function blip(t, f, amp = 0.16, p = 0, dur = 0.14) {
  const g = gainNode(0, panner(p, bus.sfx), bus.delayIn);
  const o = osc('triangle', f, t, t + dur + 0.05, g);
  o.frequency.setValueAtTime(f * 1.5, t);
  o.frequency.exponentialRampToValueAtTime(f, t + 0.03);
  perc(g.gain, t, amp, dur, 0.002);
}

function chirp(t, amp = 0.08, p = 0) {
  const g = gainNode(0, panner(p, bus.sfx), bus.delayIn);
  const o = osc('sine', 900, t, t + 0.12, g);
  o.frequency.setValueAtTime(900, t);
  o.frequency.exponentialRampToValueAtTime(2400, t + 0.07);
  perc(g.gain, t, amp, 0.09, 0.004);
}

// Fast data chatter for decoding text.
function chatter(t, dur, amp = 0.035, seed = 1, p = 0) {
  const r = rng(seed * 977);
  let k = t;
  while (k < t + dur) {
    tick(k, 2200 + r() * 3200, amp * (0.5 + r() * 0.5), p + (r() - 0.5) * 0.4);
    k += 0.018 + r() * 0.02;
  }
}

function clack(t, amp = 0.8) {
  const hit = (tt, a) => {
    const c = gainNode(0, bus.sfx, bus.verbIn);
    noise(tt, tt + 0.03, filter('highpass', 1400, 0.8, c));
    perc(c.gain, tt, a, 0.018, 0.0004);
    const b = gainNode(0, bus.sfx);
    osc('sine', 170, tt, tt + 0.08, b);
    perc(b.gain, tt, a * 0.9, 0.05, 0.001);
    const ring = gainNode(0, bus.sfx, bus.verbIn);
    for (const f of [2350, 3710, 5120]) osc('sine', f, tt, tt + 0.2, ring);
    perc(ring.gain, tt, a * 0.08, 0.12, 0.001);
  };
  hit(t, amp);
  hit(t + 0.014, amp * 0.35);
}

// Electric arc: a buzzing oscillator and noise, both gated erratically.
function zap(t, dur, amp = 0.3, seed = 1, p = 0) {
  const r = rng(seed * 331);
  const g = gainNode(0, panner(p, bus.sfx), bus.verbIn);
  const bp = filter('bandpass', 2600, 0.5, g);
  const o = osc('sawtooth', 90, t, t + dur, bp);
  noise(t, t + dur, filter('highpass', 3000, 0.7, bp));
  g.gain.setValueAtTime(0, t);
  for (let k = t; k < t + dur; k += 0.006 + r() * 0.012) {
    o.frequency.setValueAtTime(55 + r() * 240, k);
    g.gain.setValueAtTime(amp * (r() > 0.35 ? 0.4 + r() * 0.6 : 0.05) * (1 - (k - t) / dur), k);
  }
  g.gain.setValueAtTime(0, t + dur);
}

function glitchSfx(t, dur, amp = 0.2, seed = 1) {
  const r = rng(seed * 719);
  const g = gainNode(0, bus.sfx);
  const sh = ctx.createWaveShaper();
  const steps = new Float32Array(64);
  for (let i = 0; i < 64; i++) steps[i] = Math.round(((i / 63) * 2 - 1) * 4) / 4;
  sh.curve = steps;
  sh.connect(filter('highpass', 300, 0.7, g));
  const o = osc('square', 400, t, t + dur, sh);
  noise(t, t + dur, gainNode(0.3, sh));
  g.gain.setValueAtTime(0, t);
  for (let k = t; k < t + dur; k += 0.012 + r() * 0.03) {
    o.frequency.setValueAtTime(120 + r() * 2600, k);
    g.gain.setValueAtTime(r() > 0.3 ? amp : 0, k);
  }
  g.gain.setValueAtTime(0, t + dur);
}

function shimmer(t, dur, amp = 0.06, seed = 1) {
  const r = rng(seed * 43);
  const notes = [79, 83, 86, 88, 91, 95, 98, 100];
  for (let i = 0; i < 14; i++) {
    const tt = t + r() * dur;
    const g = gainNode(0, panner(r() * 1.6 - 0.8, bus.sfx), bus.verbIn, bus.delayIn);
    osc('sine', midi(notes[Math.floor(r() * notes.length)]), tt, tt + 0.6, g);
    perc(g.gain, tt, amp * (0.4 + r() * 0.6), 0.45, 0.002);
  }
}

function ping(t, f = 1250, amp = 0.14) {
  const g = gainNode(0, bus.sfx, bus.verbIn, bus.delayIn);
  osc('sine', f, t, t + 1.2, g);
  perc(g.gain, t, amp, 0.9, 0.002);
}

function lockClunk(t, amp = 0.35) {
  const b = gainNode(0, bus.sfx);
  const o = osc('sine', 140, t, t + 0.2, b);
  o.frequency.setValueAtTime(220, t);
  o.frequency.exponentialRampToValueAtTime(90, t + 0.08);
  perc(b.gain, t, amp, 0.12, 0.001);
  tick(t, 4200, amp * 0.5);
  ping(t + 0.005, 2637, amp * 0.35);
}

function thunder(t, amp = 0.6) {
  const c = gainNode(0, bus.sfx, bus.verbIn);
  noise(t, t + 0.2, filter('highpass', 900, 0.6, c));
  perc(c.gain, t, amp, 0.12, 0.0005);
  const rum = gainNode(0, bus.sfx, bus.verbIn);
  noise(t, t + 2, filter('lowpass', 260, 0.8, rum), 'pink');
  rum.gain.setValueAtTime(0, t);
  rum.gain.linearRampToValueAtTime(amp * 1.4, t + 0.05);
  rum.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
}

// ---------------------------------------------------------------- the grid
function mainsHum(t0, tDie) {
  const out = gainNode(0, bus.sfx);
  const real = new Float32Array(12), imag = new Float32Array(12);
  [0, 1, 0.8, 0.5, 0.45, 0.2, 0.3, 0.12, 0.15, 0.06, 0.08, 0.04].forEach((v, i) => (imag[i] = v));
  const wave = ctx.createPeriodicWave(real, imag);
  const o = ctx.createOscillator();
  o.setPeriodicWave(wave);
  o.frequency.value = 50;
  o.connect(out);
  o.start(t0);
  o.stop(tDie + 0.5);
  // Transformer buzz.
  const buzz = gainNode(0.25, out);
  osc('square', 100, t0, tDie + 0.5, filter('bandpass', 700, 0.8, buzz));
  out.gain.setValueAtTime(0, t0);
  out.gain.linearRampToValueAtTime(0.11, t0 + 0.35);
  // Instability: the hum sags and flutters.
  const r = rng(5);
  for (let k = T.unstable; k < tDie; k += 0.05) {
    const u = (k - T.unstable) / (tDie - T.unstable);
    o.frequency.setValueAtTime(50 - u * 4 - r() * 1.5 * u, k);
    out.gain.setTargetAtTime(0.11 * (1 - 0.4 * u) * (r() > 0.75 ? 0.35 : 1), k, 0.008);
  }
  o.frequency.setValueAtTime(46, tDie);
  o.frequency.exponentialRampToValueAtTime(18, tDie + 0.35);
  out.gain.setTargetAtTime(0.1, tDie - 0.04, 0.01);
  out.gain.setValueAtTime(0.1, tDie);
  out.gain.exponentialRampToValueAtTime(0.0001, tDie + 0.35);
}

function crackle(t0, t1, amp = 0.25, seed = 3) {
  const r = rng(seed * 13);
  let t = t0;
  while (t < t1) {
    const k = (t - t0) / (t1 - t0);
    const g = gainNode(0, panner(r() * 1.4 - 0.7, bus.sfx), bus.verbIn);
    noise(t, t + 0.01, filter('highpass', 2000 + r() * 3000, 0.7, g));
    perc(g.gain, t, amp * (0.3 + 0.7 * r()) * (0.4 + 0.6 * k), 0.004 + r() * 0.01, 0.0003);
    t += (0.09 - 0.075 * k) * (0.3 + r());
  }
}

function powerDown(t) {
  const g = gainNode(0, bus.sfx, bus.verbIn);
  const lp = filter('lowpass', 2600, 2, g);
  for (const [type, d] of [['sawtooth', 0], ['sine', 12]]) {
    const o = osc(type, 320, t, t + 1.5, lp, d * 100);
    o.frequency.setValueAtTime(330, t);
    o.frequency.exponentialRampToValueAtTime(26, t + 1.2);
  }
  lp.frequency.setValueAtTime(2600, t);
  lp.frequency.exponentialRampToValueAtTime(140, t + 1.2);
  g.gain.setValueAtTime(0.42, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
}

function alarmBeep(t, f) {
  const g = gainNode(0, bus.sfx, bus.verbIn);
  osc('square', f, t, t + 0.14, filter('lowpass', 2500, 0.7, g));
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.07, t + 0.005);
  g.gain.setValueAtTime(0.07, t + 0.1);
  g.gain.linearRampToValueAtTime(0, t + 0.12);
}

function roomTone(t0, t1, amp = 0.02) {
  const g = gainNode(0, bus.sfx);
  noise(t0, t1, filter('lowpass', 900, 0.5, g), 'pink');
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(amp, t0 + 0.5);
  g.gain.setValueAtTime(amp, t1 - 0.4);
  g.gain.linearRampToValueAtTime(0, t1);
}

function drone(t0, t1, n, amp = 0.06) {
  const g = gainNode(0, bus.sfx, bus.verbIn);
  const lp = filter('lowpass', 200, 1, g);
  for (const d of [-6, 6]) osc('sawtooth', midi(n), t0, t1, lp, d);
  osc('sine', midi(n - 12), t0, t1, g);
  lp.frequency.setValueAtTime(160, t0);
  lp.frequency.exponentialRampToValueAtTime(900, t1);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(amp, t1 - 0.05);
  g.gain.setValueAtTime(0, t1);
}

// Diesel engine, synthesised sample by sample: starter motor, compression
// pulses, then combustion pulses at the firing frequency of a six-cylinder
// four-stroke (rpm / 60 × 3 → 75 Hz at 1500 rpm), rumble and turbo whine.
function engineBuffer(dur, rpmAt, { fireAt = 0, crankFrom = -1, seed = 9 } = {}) {
  const n = Math.ceil(dur * SR);
  const b = ctx.createBuffer(1, n, SR);
  const d = b.getChannelData(0);
  const r = rng(seed);
  let ph = 0, since = 1, amp = 0, rum = 0, l1 = 0, l2 = 0, tph = 0, sph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const rpm = rpmAt(t);
    const fire = (rpm / 60) * 3;
    ph += fire / SR;
    if (ph >= 1) {
      ph -= 1;
      since = 0;
      amp = (t >= fireAt ? 1 : 0.3) * (0.75 + 0.25 * r());
    }
    since += 1 / SR;
    const w = r() * 2 - 1;
    const env = Math.exp(-since * (38 + fire * 0.6));
    let x = amp * env * (0.55 * w + 0.9 * Math.sin(2 * Math.PI * 58 * since));
    rum += 0.03 * (w - rum);
    x += rum * 2.2 * clamp(rpm / 1500) * (t >= fireAt ? 1 : 0.4);
    l1 += 0.18 * (x - l1);
    l2 += 0.18 * (l1 - l2);
    let y = l2;
    // Starter motor whine while cranking.
    if (crankFrom >= 0 && t >= crankFrom && t < fireAt + 0.12) {
      sph += (170 + 40 * Math.sin(t * 50)) / SR;
      const e = clamp((t - crankFrom) / 0.03) * clamp((fireAt + 0.12 - t) / 0.12);
      y += e * 0.16 * ((sph % 1) * 2 - 1) * (0.6 + 0.4 * Math.sin(2 * Math.PI * fire * t));
    }
    tph += (1400 * clamp(rpm / 1500) ** 2 + 200) / SR;
    y += Math.sin(2 * Math.PI * tph) * 0.025 * clamp(rpm / 1500) ** 2;
    d[i] = y;
  }
  return b;
}

function playBuffer(buffer, t, dest) {
  const s = ctx.createBufferSource();
  s.buffer = buffer;
  s.connect(dest);
  s.start(t);
  return s;
}

// ---------------------------------------------------------------- score
const ROOTS = { Em: 40, C: 36, G: 43, D: 38 };
const PADS = {
  Em: [64, 67, 71, 74],
  C: [64, 67, 71, 72],
  G: [62, 67, 71, 74],
  D: [62, 66, 69, 74],
};
const ARPS = {
  Em: [64, 67, 71, 76, 71, 67, 64, 71],
  C: [60, 64, 67, 72, 67, 64, 60, 67],
  G: [62, 67, 71, 74, 71, 67, 62, 71],
  D: [62, 66, 69, 74, 69, 66, 62, 69],
};
// Two-second bars from the drop; the last bar splits C | D into the finale.
const BARS = [
  [6, 'Em'], [8, 'C'], [10, 'G'], [12, 'D'], [14, 'Em'], [16, 'C'], [18, 'G'], [20, 'D'], [22, 'Em'], [24, 'C'], [25, 'D'],
];

function score() {
  const end = T.cta;
  const breakAt = 25.0;
  BARS.forEach(([t0, ch], i) => {
    const t1 = i + 1 < BARS.length ? BARS[i + 1][0] : end;
    pad(t0, t1, PADS[ch], i === 0 ? 0.024 : 0.017, t0 >= 19 ? 3200 : 2200);
    // Off-beat bass with a pickup on the last sixteenth of each beat.
    for (let b = t0; b < t1 - 0.001; b += BEAT) {
      if (b >= breakAt) break;
      bassNote(b + BEAT / 2, ROOTS[ch], BEAT * 0.42, 0.33);
      if ((Math.round((b - 6) / BEAT) % 2) === 1) bassNote(b + BEAT * 0.75, ROOTS[ch] + 12, BEAT * 0.2, 0.2);
    }
    // Arpeggio from the brands scene on, brighter after the process scene.
    if (t0 >= 10 && t0 < breakAt) {
      const notes = ARPS[ch];
      for (let k = 0; k * (BEAT / 4) < t1 - t0 - 0.001; k++) {
        const t = t0 + k * (BEAT / 4);
        if (t >= breakAt) break;
        pluck(t, notes[k % notes.length], k % 4 === 0 ? 0.075 : 0.05, k % 2 ? 0.35 : -0.35, t >= 19 ? 1 : 0.55);
      }
    }
  });
  // Drums.
  for (let b = T.drop; b < breakAt - 0.001; b += BEAT) {
    kick(b, b === T.drop ? 1.1 : 0.95);
    const step = Math.round((b - T.drop) / BEAT);
    if (step % 2 === 1) clap(b, 0.9);
    if (b >= 8) {
      for (let s = 0; s < 4; s++) {
        const t = b + (s * BEAT) / 4;
        hat(t, [0.2, 0.1, 0.27, 0.1][s], false, 0.25);
      }
      if (b >= 10) hat(b + BEAT / 2, 0.15, true, -0.2);
    }
  }
  // Fills into the big transitions.
  snareRoll(9.5, 10.0, 0.06, 0.28);
  snareRoll(16.5, 17.0, 0.05, 0.25);
  snareRoll(20.5, 21.0, 0.05, 0.22);
  snareRoll(25.1, T.mapOut, 0.05, 0.45, bus.sfx);

  // Finale: G major, open and bright.
  braam(T.cta, 3.2, [31, 38, 43], 0.34);
  pad(T.cta, 29.4, [62, 67, 69, 71, 74, 79], 0.022, 3600);
  bassNote(T.cta, 43, 3.2, 0.45);
  [[26.0, 79], [26.5, 83], [27.0, 86], [27.45, 91], [28.4, 86]].forEach(([t, n], i) => bell(t, n, 0.09, i % 2 ? 0.3 : -0.3));
}

// ---------------------------------------------------------------- the edit
function sfxTimeline() {
  // Act 1: the grid, the failure, the silence.
  roomTone(0, 6.0, 0.018);
  mainsHum(0, T.blackout);
  whoosh(0.15, 0.7, { from: -0.3, to: 0.3, f0: 800, f1: 5000, level: 0.07, verb: 0.2 });
  chatter(T.hudOn, 0.45, 0.03, 1);
  crackle(T.unstable, T.blackout, 0.3, 2);
  glitchSfx(1.62, 0.1, 0.07, 4);
  glitchSfx(1.86, 0.08, 0.08, 5);
  alarmBeep(T.alarm[0], 988);
  alarmBeep(T.alarm[0] + 0.2, 740);
  alarmBeep(T.alarm[1] + 0.05, 988);
  powerDown(T.blackout);
  impact(T.blackout, 0.55);
  clack(T.blackout + 0.01, 0.5);
  glitchSfx(T.blackout, 0.14, 0.16, 6);
  // Tension: a low drone climbs from the silence to the drop.
  drone(2.2, T.ats - 0.02, 28, 0.07);
  glitchSfx(T.line1, 0.12, 0.12, 7);
  impact(T.line1, 0.4);
  tick(2.5, 1800, 0.12);
  tick(3.0, 1800, 0.12);
  glitchSfx(T.line1Out - 0.1, 0.1, 0.1, 8);
  reverseSwell(T.line2, 0.5, 0.25);
  impact(T.line2, 0.95);
  // Generator control: the panel wakes up, the diesel cranks and runs up.
  whoosh(T.panel, 0.45, { from: 0, to: 0, f0: 400, f1: 3000, level: 0.12 });
  for (let k = 0; k < 14; k++) tick(T.panel + 0.05 + k * 0.035, 2600 + k * 60, 0.05, -0.4 + k * 0.06);
  LOG_TIMES.forEach((t, i) => { blip(t, 1400 + i * 120, 0.07, 0.5); chatter(t, 0.2, 0.025, 10 + i, 0.5); });
  const engine = engineBuffer(T.drop + 1.6 - T.crank, t => rpmCurve(t + T.crank), { fireAt: T.fire - T.crank, crankFrom: 0 });
  const eg = gainNode(0, bus.sfx);
  const elp = filter('lowpass', 7000, 0.6, eg);
  playBuffer(engine, T.crank, elp);
  eg.gain.setValueAtTime(0.42, T.crank);
  eg.gain.setValueAtTime(0.42, T.cutBlack - 0.01);
  eg.gain.linearRampToValueAtTime(0.12, T.cutBlack);
  eg.gain.setValueAtTime(0.18, T.drop);
  eg.gain.linearRampToValueAtTime(0, T.drop + 1.4);
  riser(4.9, T.ats - 0.01, 0.24);
  snareRoll(5.0, T.ats - 0.02, 0.03, 0.22, bus.sfx);
  clack(T.ats, 1);

  // The drop.
  impact(T.drop, 1.35);
  braam(T.drop, 2.2, [28, 35, 40], 0.3);
  crash(T.drop, 0.3);
  zap(T.drop, 0.35, 0.22, 1);
  whoosh(T.drop, 0.9, { from: 0, to: 0, f0: 1800, f1: 250, level: 0.25, peak: 0.1 });
  thunder(T.bolt, 0.5);
  zap(T.bolt, 0.3, 0.28, 2, 0.3);
  whoosh(T.lockup - 0.05, 0.4, { from: 0.2, to: -0.4, f0: 500, f1: 2400, level: 0.14 });
  whoosh(T.wordmark, 0.35, { from: -0.2, to: 0.5, f0: 900, f1: 4200, level: 0.09 });
  shimmer(T.shine, 0.45, 0.05, 1);
  // Zoom through the bolt.
  whoosh(T.zoom - 0.05, 0.36, { from: 0, to: 0, f0: 250, f1: 5200, level: 0.5, peak: 0.85 });
  impact(T.range, 0.7);

  // 8 → 3000 KVA: ticks follow the digits, then the lock.
  kvaTicks();
  lockClunk(T.rollB, 0.4);
  whoosh(T.rangeOut - 0.05, 0.3, { from: 0, to: 0, f0: 400, f1: 4000, level: 0.35, peak: 0.8 });

  // Brands.
  impact(T.brands, 0.45);
  T.brandRows.forEach((t, i) => {
    whoosh(t - 0.05, 0.32, { from: i % 2 ? 0.8 : -0.8, to: 0, f0: 350, f1: 2800, level: 0.26 });
    riser(t + 0.2, t + 0.6, 0.05);
    tick(t + 0.6, 3600, 0.06, i % 2 ? 0.4 : -0.4);
  });
  whoosh(T.brandsOut - 0.02, 0.3, { from: 0.8, to: -0.8, f0: 400, f1: 3600, level: 0.34, peak: 0.6 });
  whoosh(T.brandsOut + 0.04, 0.3, { from: -0.8, to: 0.8, f0: 350, f1: 3000, level: 0.24, peak: 0.6 });

  // Product hero shots.
  whoosh(11.85, 0.75, { from: 0.9, to: 0, f0: 120, f1: 900, level: 0.34, q: 0.8, peak: 0.55 });
  impact(12.42, 0.35, 0.1);
  shimmer(12.35, 0.5, 0.035, 2);
  [...T.heroCallouts, ...T.openCallouts].forEach((t, i) => { chirp(t, 0.07, i % 2 ? 0.4 : -0.4); chatter(t + 0.25, 0.25, 0.02, 20 + i, i % 2 ? 0.4 : -0.4); });
  whoosh(T.heroSwap - 0.05, 0.3, { from: 0.8, to: -0.8, f0: 350, f1: 4200, level: 0.42, peak: 0.55 });
  impact(T.heroSwap + 0.25, 0.3, 0.1);
  whoosh(T.heroOut - 0.1, 0.25, { from: 0, to: 0, f0: 300, f1: 3600, level: 0.3, peak: 0.9 });

  // Acoustic scene: an open set roars, then the canopy closes around it.
  impact(T.db, 0.6);
  const loud = engineBuffer(2.3, t => 1500 + 8 * Math.sin(t * 2.3), { fireAt: 0, seed: 21 });
  const lg = gainNode(0, bus.sfx);
  const llp = filter('lowpass', 9000, 0.7, lg);
  const grit = ctx.createWaveShaper();
  grit.curve = shaperCurve(4);
  grit.connect(llp);
  playBuffer(loud, T.db - 0.02, grit);
  lg.gain.setValueAtTime(0, T.db - 0.02);
  lg.gain.linearRampToValueAtTime(0.5, T.db + 0.03);
  lg.gain.setValueAtTime(0.5, T.dbFallA);
  lg.gain.exponentialRampToValueAtTime(0.07, T.dbFallB);
  lg.gain.setValueAtTime(0.07, T.dbOut);
  lg.gain.linearRampToValueAtTime(0, T.services);
  llp.frequency.setValueAtTime(9000, T.dbFallA);
  llp.frequency.exponentialRampToValueAtTime(260, T.dbFallB);
  for (let db = 100; db >= 65; db -= 5) {
    const k = (105 - db) / 40;
    tick(dbTime(db), lerp(2400, 900, k), lerp(0.1, 0.05, k));
  }
  bell(T.dbFallB, 88, 0.07);
  riser(T.dbOut - 0.15, T.services - 0.005, 0.22);

  // Services on the beat.
  const stabNotes = [[60, 64, 67], [60, 64, 67], [64, 67, 72], [64, 67, 72], [67, 71, 74], [67, 71, 74], [71, 74, 79], [71, 74, 79]];
  stabNotes.forEach((ns, i) => {
    const t = T.services + i * T.serviceStep;
    stab(t, ns, i % 2 ? 0.1 : 0.13);
    chatter(t + 0.02, 0.1, 0.018, 40 + i);
  });
  impact(T.services, 0.5);
  whoosh(18.78, 0.24, { from: -0.6, to: 0.6, f0: 600, f1: 5200, level: 0.2, peak: 0.8 });

  // Process: current travels node to node.
  impact(T.process, 0.4);
  T.processNodes.forEach((t, i) => {
    blip(t, midi([76, 79, 81, 83, 86][i]), 0.13, -0.6 + i * 0.3);
    if (i > 0) zap(t - 0.3, 0.3, 0.06, 30 + i, -0.6 + i * 0.3);
  });

  // Track record.
  whoosh(T.processOut - 0.02, 0.24, { from: -0.8, to: 0.8, f0: 500, f1: 5000, level: 0.34, peak: 0.7 });
  impact(T.stats, 0.35);
  statTicks();

  // Coverage map.
  whoosh(T.statsOut - 0.02, 0.24, { from: -0.8, to: 0.8, f0: 400, f1: 4200, level: 0.32, peak: 0.7 });
  scanner(T.map - 0.05, 24.15);
  ping(T.mapPins[0], 1318, 0.12);
  ping(T.mapPins[0] + 0.83, 1318, 0.06);
  ping(T.mapPins[0] + 1.66, 1318, 0.035);
  T.mapPins.slice(1).forEach((t, i) => { chirp(t, 0.04, -0.3 + i * 0.12); blip(t + 0.25, midi(83 + [0, 2, 4, 7, 9, 12][i]), 0.08, -0.3 + i * 0.12); });
  riser(T.riser, T.mapOut, 0.42);
  drone(T.riser, T.mapOut, 38, 0.06);

  // Call to action and end card.
  impact(T.cta, 1.45);
  crash(T.cta, 0.34);
  zap(T.cta, 0.4, 0.2, 5);
  impact(T.ctaWords[1], 0.35, 0.1);
  impact(T.ctaWords[2], 0.45, -0.1);
  shimmer(T.ctaArabic, 0.5, 0.045, 3);
  whoosh(T.endCard - 0.2, 0.35, { from: 0, to: 0, f0: 600, f1: 3000, level: 0.18, peak: 0.6 });
  impact(T.endCard + 0.17, 0.45);
  zap(T.endCard + 0.1, 0.18, 0.14, 7);
  blip(28.0, midi(86), 0.08, -0.2);
  blip(28.1, midi(91), 0.07, 0.2);
  shimmer(T.endShine, 0.6, 0.05, 4);
}

// Picture-side curves the sound needs to follow.
const LOG_TIMES = [T.panel + 0.02, T.crank, T.fire, T.rated, 5.66];

function rpmCurve(t) {
  if (t < T.crank) return 0;
  if (t < T.fire) return 150 + 45 * Math.abs(Math.sin((t - T.crank) * 38)) + (t - T.crank) * 100;
  if (t < T.rated) return lerp(240, 1548, ease.out3((t - T.fire) / (T.rated - T.fire)));
  const k = clamp((t - T.rated) / 0.35);
  return lerp(1548, 1500, ease.out3(k));
}

function dbTime(db) {
  // Invert the picture's io3 fall from 105 to 65.
  const target = (105 - db) / 40;
  let lo = 0, hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (ease.io3(mid) < target) lo = mid; else hi = mid;
  }
  return lerp(T.dbFallA, T.dbFallB, lo);
}

function kvaTicks() {
  const marks = [9, 10, 12, 15, 20, 25, 30, 40, 50, 65, 80, 100, 125, 160, 200, 250, 320, 400, 500, 650, 800, 1000, 1250, 1500, 1800, 2100, 2400, 2650, 2850, 2950, 2990];
  let i = 0;
  const L8 = Math.log(8), L3 = Math.log(3000);
  for (let t = T.rollA; t <= T.rollB && i < marks.length; t += 0.001) {
    const v = Math.exp(lerp(L8, L3, ease.io3((t - T.rollA) / (T.rollB - T.rollA))));
    while (i < marks.length && v >= marks[i]) {
      const k = (Math.log(marks[i]) - L8) / (L3 - L8);
      tick(t, lerp(1600, 4200, k), 0.075, lerp(-0.3, 0.3, k));
      i++;
    }
  }
}

function statTicks() {
  STATS.forEach((s, i) => {
    const t0 = T.statStarts[i];
    for (let k = 1; k <= 12; k++) {
      // Inverse of easeOutExpo over 0.8 s.
      const p = k / 12.5;
      const t = t0 + 0.8 * (-Math.log2(1 - p) / 10);
      tick(t, 2000 + i * 300 + k * 40, 0.05, -0.45 + i * 0.3);
    }
    blip(t0 + 0.42, midi([79, 83, 86, 91][i]), 0.1, -0.45 + i * 0.3);
  });
}

function stab(t, notes, amp) {
  const g = gainNode(0, bus.sfx, bus.verbIn);
  const lp = filter('lowpass', 4200, 2, g);
  notes.forEach(n => { for (const d of [-8, 8]) osc('sawtooth', midi(n), t, t + 0.3, lp, d); });
  lp.frequency.setValueAtTime(5200, t);
  lp.frequency.exponentialRampToValueAtTime(600, t + 0.18);
  perc(g.gain, t, amp, 0.22, 0.002);
  const th = gainNode(0, bus.sfx);
  const o = osc('sine', 120, t, t + 0.2, th);
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(60, t + 0.1);
  perc(th.gain, t, 0.35, 0.12);
}

function scanner(t0, t1) {
  const g = gainNode(0, bus.sfx, bus.verbIn);
  const o = osc('sine', 300, t0, t1, g);
  o.frequency.setValueAtTime(300, t0);
  o.frequency.exponentialRampToValueAtTime(1500, t1);
  const lfo = osc('square', 28, t0, t1, gainNode(0.035, g.gain));
  g.gain.setValueAtTime(0.035, t0);
  g.gain.setValueAtTime(0.035, t1 - 0.05);
  g.gain.linearRampToValueAtTime(0, t1);
  return lfo;
}

// ---------------------------------------------------------------- render
function musicAutomation() {
  const f = bus.musicLP.frequency, g = bus.musicOut.gain, M = MUSIC;
  // Silent until the drop, then the full band.
  g.setValueAtTime(0, 0);
  g.setValueAtTime(M, T.drop - 0.002);
  // Acoustic scene: the band sits behind the engine, then clears as the
  // canopy closes.
  f.setValueAtTime(20000, T.db - 0.01);
  f.exponentialRampToValueAtTime(700, T.db + 0.04);
  g.setValueAtTime(M, T.db - 0.01);
  g.linearRampToValueAtTime(M * 0.55, T.db + 0.04);
  f.setValueAtTime(700, T.dbFallA);
  f.exponentialRampToValueAtTime(20000, T.dbFallB + 0.2);
  g.setValueAtTime(M * 0.55, T.dbFallA);
  g.linearRampToValueAtTime(M, T.dbFallB + 0.2);
  // Break before the call to action: the band filters down under the riser.
  f.setValueAtTime(20000, 25.0);
  f.exponentialRampToValueAtTime(500, T.mapOut);
  g.setValueAtTime(M, T.mapOut - 0.01);
  g.linearRampToValueAtTime(0, T.mapOut);
  g.setValueAtTime(M, T.cta - 0.002);
  f.setValueAtTime(20000, T.cta - 0.002);
  // Fade out.
  g.setValueAtTime(M, T.fadeOut - 0.3);
  g.linearRampToValueAtTime(0, 30);
  bus.master.gain.setValueAtTime(MASTER, T.fadeOut - 0.2);
  bus.master.gain.linearRampToValueAtTime(0, 30);
}

export async function renderSoundtrack({ only = '' } = {}) {
  ctx = new OfflineAudioContext(2, SR * DURATION, SR);
  noiseSeed = 1;
  buildBuses();
  musicAutomation();
  if (only !== 'sfx') score();
  if (only !== 'music') sfxTimeline();
  return ctx.startRendering();
}

export function encodeWav(buffer) {
  const ch = buffer.numberOfChannels, n = buffer.length, sr = buffer.sampleRate;
  const bytes = 3;
  const out = new DataView(new ArrayBuffer(44 + n * ch * bytes));
  const str = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF');
  out.setUint32(4, 36 + n * ch * bytes, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  out.setUint32(16, 16, true);
  out.setUint16(20, 1, true);
  out.setUint16(22, ch, true);
  out.setUint32(24, sr, true);
  out.setUint32(28, sr * ch * bytes, true);
  out.setUint16(32, ch * bytes, true);
  out.setUint16(34, 24, true);
  str(36, 'data');
  out.setUint32(40, n * ch * bytes, true);
  const data = [];
  for (let c = 0; c < ch; c++) data.push(buffer.getChannelData(c));
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < ch; c++) {
      const v = Math.max(-1, Math.min(1, data[c][i]));
      const s = Math.round(v * 8388607);
      out.setUint8(o, s & 255);
      out.setUint8(o + 1, (s >> 8) & 255);
      out.setUint8(o + 2, (s >> 16) & 255);
      o += 3;
    }
  }
  return out.buffer;
}
