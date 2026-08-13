/* Reel: the Power Size Calculator (#calculator on the Premium Power site).
 *
 * Every figure that appears on screen is produced by the running app — the
 * capture types into the real inputs and the app's own calcKVA() computes the
 * KVA, the fuel rate and the daily cost. verify() re-derives them independently.
 */

const APP = 'http://127.0.0.1:8099/index.html';

/** The load we enter on camera. */
export const LOAD = { 'c-ac1': '6', 'c-ac3': '2', 'c-pump': '1', 'c-pc': '4', 'c-light': '10' };

/** The app's documented formula, recomputed here so the reel can't lie. */
export function expected(load) {
  const w = +load['c-ac1'] * 1200 + +load['c-ac3'] * 2400 + +load['c-pump'] * 750 +
            +load['c-pc'] * 200 + +load['c-light'] * 100;
  const kva = Math.ceil((w / 1000 / 0.8) * 1.25);
  const fuel = kva > 0 ? Math.ceil(kva * 0.21) : 0;
  return { watts: w, kva: String(kva), fuel: String(fuel), cost: (fuel * 24 * 12).toLocaleString('en-US') };
}

const EXP = expected(LOAD); // { kva: '23', fuel: '5', cost: '1,440' }

export default {
  id: 'kva-calculator',
  appUrl: APP,

  // Pulled from the product's own stylesheet (:root in index.html).
  palette: {
    bg: '#F5F7FA',      // --bg3
    paper: '#FFFFFF',   // --card
    ink: '#2C2E2F',     // --off
    muted: '#5A6A7A',   // --muted
    accent: '#009CDE',  // --copper
    dark: '#003087',    // --copper3
    line: '#DDE1E6',    // --border
    shadow: '#003087',
  },

  title: {
    eyebrow: 'Interactive tool',
    headline: 'POWER SIZE<br>*CALCULATOR*',
    subline: 'Enter your equipment and get the generator size, the fuel burn and the daily cost.',
  },

  captions: [
    { win: [5.10, 5.60, 9.60, 10.10],
      eyebrow: 'Step 01', headline: 'List your load',
      subline: 'Air conditioning, pumps, workstations, lighting.' },
    { win: [10.10, 10.60, 14.90, 15.40],
      eyebrow: 'Step 02', headline: 'Real wattage applied',
      subline: 'Every item carries its own rated draw.' },
    { win: [15.40, 15.90, 20.20, 20.70],
      eyebrow: 'Step 03', headline: 'PCs and lighting',
      subline: 'Four workstations, ten rooms of lights.' },
    { win: [21.30, 21.80, 25.10, 25.60],
      eyebrow: 'Result', headline: `*${EXP.kva} KVA*, instantly`,
      subline: 'Includes a 25% safety margin at 0.8 PF.' },
    { win: [25.60, 26.10, 29.40, 29.90],
      eyebrow: 'Result', headline: 'Fuel and daily cost',
      subline: `${EXP.fuel} L/hr — *${EXP.cost} EGP* a day at 12 EGP/L.` },
  ],

  footer: { logo: '/images/logo.png', wordmark: 'PREMIUM*POWER*', url: 'premiumpower-eg.com' },

  end: {
    headline: 'Size yours<br>in *seconds*.',
    cta: 'Try the calculator',
    url: 'premiumpower-eg.com',
  },

  // Anchored to real elements, resolved lazily against the live DOM.
  scroll: [
    { t: 0.00,  sel: '#calculator .sec-header', off: 140 },
    { t: 5.70,  sel: '#calculator .sec-header', off: 140 },
    { t: 7.80,  sel: '.calc-inputs',            off: 100 },
    { t: 19.60, sel: '.calc-inputs',            off: 100 },
    // 290 keeps the filled input rows on screen above the panel, so the frame
    // shows cause and effect together — and leaves the CTA clear of the 1.06 push-in.
    { t: 21.20, sel: '#calc-result',            off: 290 },
    { t: 36.00, sel: '#calc-result',            off: 290 },
  ],

  // Gentle push-in only, focal x at 0.5.
  zoom: [
    { t: 0.00, z: 1.00 },
    { t: 25.60, z: 1.00 },
    { t: 29.40, z: 1.06 },
    { t: 36.00, z: 1.06 },
  ],

  cursor: {
    start: { x: 232, y: 726 },
    fade: [7.30, 7.80, 19.30, 19.90],
    moves: [
      { t0: 7.90,  t1: 8.70,  sel: '#c-ac1' },
      { t0: 10.40, t1: 11.10, sel: '#c-ac3' },
      { t0: 12.30, t1: 13.00, sel: '#c-pump' },
      { t0: 15.70, t1: 16.40, sel: '#c-pc' },
      { t0: 17.60, t1: 18.30, sel: '#c-light' },
    ],
    clicks: [8.75, 11.15, 13.05, 16.45, 18.35],
  },

  actions: [
    { t: 8.75,  run: (c) => c.focus('#c-ac1') },
    { t0: 8.80, t1: 9.20, perFrame: (u, c) => c.type('#c-ac1', LOAD['c-ac1'], u) },
    { t: 9.30,  run: (c) => c.settle() },

    { t: 11.15, run: (c) => c.focus('#c-ac3') },
    { t0: 11.20, t1: 11.55, perFrame: (u, c) => c.type('#c-ac3', LOAD['c-ac3'], u) },
    { t: 11.65, run: (c) => c.settle() },

    { t: 13.05, run: (c) => c.focus('#c-pump') },
    { t0: 13.10, t1: 13.45, perFrame: (u, c) => c.type('#c-pump', LOAD['c-pump'], u) },
    { t: 13.55, run: (c) => c.settle() },

    { t: 16.45, run: (c) => c.focus('#c-pc') },
    { t0: 16.50, t1: 16.85, perFrame: (u, c) => c.type('#c-pc', LOAD['c-pc'], u) },
    { t: 16.95, run: (c) => c.settle() },

    { t: 18.35, run: (c) => c.focus('#c-light') },
    { t0: 18.40, t1: 18.95, perFrame: (u, c) => c.type('#c-light', LOAD['c-light'], u) },
    { t: 19.10, run: (c) => c.settle(500) },
    { t: 19.25, run: (c) => c.blur() },
  ],

  spotTimes: [1.20, 2.80, 4.30, 6.40, 9.00, 11.30, 13.20, 17.00, 20.60, 22.40, 26.20, 29.60, 31.30, 32.40, 34.60],
  spotGrid: [5, 3],

  /** Confirm the numbers on camera are the app's, not ours. */
  async verify(c) {
    const got = {
      inputs: await c.app((d) => ['c-ac1', 'c-ac3', 'c-pump', 'c-pc', 'c-light']
        .map((i) => i + '=' + d.getElementById(i).value).join(' ')),
      kva: await c.read('#r-kva'),
      fuel: await c.read('#r-fuel'),
      cost: await c.read('#r-cost'),
    };
    const ok = got.kva === EXP.kva && got.fuel === EXP.fuel && got.cost === EXP.cost;
    return { ok, got, expected: EXP };
  },
};
