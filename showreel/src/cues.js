// One timeline for picture and sound. Scenes and the soundtrack both read
// these times, so a cut and its hit can never drift apart.
export const DURATION = 30;
export const BPM = 120;
export const BEAT = 60 / BPM;

export const T = {
  // Act 1: the grid fails.
  hudOn: 0.2,
  unstable: 1.2,
  alarm: [1.5, 1.75],
  blackout: 2.0,
  line1: 2.35, // THE GRID GOES DOWN.
  line1Out: 3.32,
  line2: 3.5, // YOUR BUSINESS DOESN'T.
  panel: 4.1,
  crank: 4.3,
  fire: 4.7,
  rated: 5.45,
  ats: 5.9,
  cutBlack: 5.955,

  // Act 2: power returns.
  drop: 6.0,
  bolt: 6.28,
  lockup: 6.85,
  wordmark: 7.08,
  tagline: 7.28,
  shine: 7.36,
  zoom: 7.72,

  range: 8.0,
  rollA: 8.12,
  rollB: 9.2,
  rangeOut: 9.8,

  brands: 10.0,
  brandRows: [10.08, 10.2, 10.32],
  brandsOut: 11.72,

  hero: 12.0,
  heroCallouts: [12.55, 12.75, 12.95],
  heroSwap: 13.45,
  openCallouts: [13.9, 14.1, 14.3],
  heroOut: 14.85,

  db: 15.0,
  dbFallA: 15.2,
  dbFallB: 16.35,
  dbHeadline: 15.95,
  dbOut: 16.85,

  services: 17.0,
  serviceStep: 0.25,

  process: 19.0,
  processNodes: [19.15, 19.47, 19.79, 20.11, 20.43],
  processOut: 20.85,

  stats: 21.0,
  statStarts: [21.1, 21.32, 21.54, 21.76],
  statsOut: 23.35,

  map: 23.5,
  mapPins: [24.1, 24.22, 24.32, 24.42, 24.52, 24.62, 24.72],
  riser: 25.1,
  mapOut: 25.94,

  cta: 26.0,
  ctaWords: [26.0, 26.12, 26.26],
  ctaArabic: 26.45,
  endCard: 27.45,
  endShine: 28.4,
  fadeOut: 29.55,
};

export const SERVICES = [
  ['GENERATORS', 'OPEN & CANOPY SETS · 8 – 3000 KVA'],
  ['CANOPIES', 'SUPER-SILENT · ≤ 65 dB @ 1 m'],
  ['ATS PANELS', 'AUTOMATIC TRANSFER · SYNCHRONISATION'],
  ['FUEL TANKS', '500 – 30,000 L · SINGLE & DOUBLE WALL'],
  ['SPARE PARTS', '100% GENUINE OEM · LOCAL STOCK'],
  ['INSTALLATION', 'TURNKEY SITE WORKS'],
  ['MAINTENANCE', 'AMC CONTRACTS · 24/7 CALL-OUT'],
  ['LOAD TESTING', 'ON-SITE LOAD BANK · IEC'],
];

export const PROCESS = [
  ['SITE SURVEY', 'Load analysis & sizing'],
  ['CIVIL WORKS', 'Foundation & trenching'],
  ['DELIVERY', 'Specialised lifting'],
  ['INSTALLATION', 'Cabling · exhaust · fuel'],
  ['COMMISSIONING', 'Load test & handover'],
];

export const STATS = [
  { value: 250, suffix: '+', label: 'PROJECTS COMPLETED' },
  { value: 18, suffix: '+', label: 'YEARS EXPERIENCE' },
  { value: 99.2, suffix: '%', label: 'UPTIME GUARANTEE', decimals: 1 },
  { value: 24, suffix: '/7', label: 'EMERGENCY SUPPORT' },
];
