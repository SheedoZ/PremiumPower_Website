/* Builds the standalone 1080x1920 stage page.
 *
 * The stage draws everything around the app: background, captions, device
 * frame, cursor, title and end cards. The app itself is a live <iframe>.
 * Geometry here is the spec, not a suggestion.
 */

export const CANVAS = { w: 1080, h: 1920, fps: 30, seconds: 36.0 };

/** Beat sheet — identical for every reel in the series. */
export const BEAT_SHEET = {
  title: {
    eyebrow: [0.0, 0.5],
    head: [0.45, 1.35],
    sub: [1.25, 2.0],
    rule: [1.7, 2.6],
    out: [2.95, 3.55],
  },
  device: { in: [3.15, 4.0], settleEnd: 4.7, rise: 70, scaleFrom: 1.05 },
  footer: [4.2, 5.0, 29.9, 30.4],
  end: {
    card: [30.2, 30.8],
    logo: [30.4, 31.4],
    head: [31.1, 32.1],
    cta: [32.0, 32.8],
    url: [32.7, 33.4],
  },
};

const css = (p) => `
:root{
  --bg:${p.bg}; --paper:${p.paper}; --ink:${p.ink}; --muted:${p.muted};
  --accent:${p.accent}; --dark:${p.dark}; --line:${p.line};
}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${CANVAS.w}px;height:${CANVAS.h}px;overflow:hidden;background:var(--bg)}
body{font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
#root{position:relative;width:${CANVAS.w}px;height:${CANVAS.h}px;overflow:hidden;background:var(--bg)}
/* soft brand wash so the light card has depth */
#root::before{content:'';position:absolute;inset:0;
  background:radial-gradient(1200px 900px at 50% -8%, ${p.accent}14 0%, transparent 62%),
             radial-gradient(900px 700px at 50% 108%, ${p.dark}0F 0%, transparent 60%);}
.ac{color:var(--accent)}

/* ── device ─────────────────────────────────────────────────────────────── */
.device{position:absolute;left:160px;top:300px;width:760px;height:1414px;
  border-radius:54px;overflow:hidden;background:var(--paper);
  box-shadow:0 4px 0 rgba(17,36,62,.10),
             0 44px 96px -30px ${p.shadow}66,
             0 10px 28px -14px ${p.shadow}38;
  outline:3px solid ${p.ink}17;outline-offset:-3px;}
.zoomer{position:absolute;inset:0;transform-origin:50% 50%}
#app{position:absolute;left:0;top:0;width:430px;height:800px;border:0;
  transform:scale(1.7674419);transform-origin:0 0;}

/* ── captions ───────────────────────────────────────────────────────────── */
.caps{position:absolute;left:80px;top:78px;width:920px;height:230px}
.cap{position:absolute;left:0;top:0;width:920px;text-align:center}
.cap-eyebrow{font-size:26px;font-weight:700;letter-spacing:.34em;
  text-transform:uppercase;color:var(--accent)}
.cap-head{font-size:66px;font-weight:900;line-height:1.22;color:var(--ink);margin-top:12px;
  letter-spacing:-.015em}
.cap-sub{font-size:29px;font-weight:600;color:var(--muted);margin-top:10px}

/* ── footer ─────────────────────────────────────────────────────────────── */
.footer{position:absolute;left:0;bottom:56px;width:${CANVAS.w}px;
  display:flex;flex-direction:column;align-items:center;gap:9px}
.foot-lock{display:flex;align-items:center;gap:14px}
.foot-mark{width:42px;height:42px;object-fit:contain}
.foot-word{font-size:32px;font-weight:800;letter-spacing:.06em;color:var(--ink)}
.foot-url{font-size:22px;font-weight:600;letter-spacing:.05em;color:var(--muted)}

/* ── cursor ─────────────────────────────────────────────────────────────── */
.cursor{position:absolute;left:0;top:0;transform-origin:2px 2px;
  filter:drop-shadow(0 5px 10px rgba(17,36,62,.42));pointer-events:none}
.ring{position:absolute;left:0;top:0;width:34px;height:34px;margin:0;
  border-radius:50%;border:3px solid var(--accent);pointer-events:none}

/* ── cards ──────────────────────────────────────────────────────────────── */
.card{position:absolute;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;padding:0 90px}
.title-card{background:var(--bg)}
.title-card::before{content:'';position:absolute;inset:0;
  background:radial-gradient(1000px 780px at 50% 36%, ${p.accent}1A 0%, transparent 64%)}
.t-eyebrow,.t-head,.t-sub,.t-rule{position:relative}
.t-eyebrow{font-size:26px;font-weight:700;letter-spacing:.34em;
  text-transform:uppercase;color:var(--accent)}
.t-head{font-size:104px;font-weight:900;line-height:1.06;color:var(--ink);
  margin-top:26px;letter-spacing:-.025em}
.t-sub{font-size:29px;font-weight:600;color:var(--muted);margin-top:26px;
  line-height:1.45;max-width:760px}
.t-rule{height:6px;background:var(--accent);border-radius:3px;margin-top:44px;width:0}

.cut-card{background:var(--dark)}
.cut-head{font-size:66px;font-weight:900;color:#fff;line-height:1.2}

.end-card{background:var(--dark)}
.end-card::before{content:'';position:absolute;inset:0;
  background:radial-gradient(900px 700px at 50% 30%, ${p.accent}26 0%, transparent 62%)}
.e-mark,.e-head,.e-cta,.e-url{position:relative}
.e-mark{width:132px;height:132px;object-fit:contain;background:#fff;border-radius:30px;
  padding:14px;box-shadow:0 18px 44px -18px rgba(0,0,0,.55)}
.e-head{font-size:72px;font-weight:900;line-height:1.16;color:#fff;margin-top:38px;
  letter-spacing:-.02em}
.e-cta{margin-top:44px;background:var(--accent);color:#fff;font-size:31px;font-weight:800;
  letter-spacing:.02em;padding:24px 54px;border-radius:999px;
  box-shadow:0 16px 40px -14px ${p.accent}CC}
.e-url{margin-top:30px;font-size:24px;font-weight:600;letter-spacing:.06em;color:#ffffffB8}
`;

export function buildStageHTML(cfg) {
  const full = { ...cfg, beatSheet: BEAT_SHEET };
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<title>reel stage — ${cfg.id}</title>
<style>${css(cfg.palette)}</style>
</head>
<body dir="ltr">
<div id="root"></div>
<script>window.__CFG__ = ${JSON.stringify(full)};</script>
<script src="/reel/lib/runtime.js"></script>
</body>
</html>`;
}
