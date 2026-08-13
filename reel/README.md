# Product feature reels

Vertical (9:16) promo videos built by **recording the real running site**, one
deliberately-rendered frame at a time. No mock-ups, no screenshots of a design
file, no real-time screen capture.

Output spec (every reel in the series):

| | |
|---|---|
| Resolution | 1080 × 1920 (9:16) |
| Duration | 36.00 s, 30 fps constant |
| Video | H.264 High @ L4.1, yuv420p, CRF 19, `+faststart` |
| Audio | silent AAC 128 kbps stereo (platforms reject audioless uploads) |

## Why frame-by-frame

Real-time capture drops frames, and a capture that takes 15 minutes of wall
clock cannot produce 36 seconds of smooth motion. Instead:

1. The site is served locally on `127.0.0.1:8099`.
2. A **stage** — a standalone 1080×1920 page — embeds the running site in an
   `<iframe>` sized to a phone viewport (430 × 800 CSS px) and scaled up by
   1.7674419. The stage draws everything around the app: background, captions,
   device frame, cursor, title and end cards.
3. The app's own motion is disabled by injecting
   `*,*::before,*::after{transition:none!important;animation:none!important}`
   into the iframe. The app snaps between states; **the stage owns all motion.**
4. `window.STAGE.setT(t)` computes every visual property — opacity, position,
   scale, cursor coordinates, and the app's `scrollTop` — as a pure function of
   `t`. No CSS transitions, no `requestAnimationFrame`.
5. Frame `i` is captured by running any interaction scheduled at `t = i/30`,
   calling `setT(i/30)`, then taking one screenshot. 1080 times.
6. `ffmpeg` encodes the numbered JPEGs.

Because every frame is rendered deliberately, the motion is perfect regardless
of how slow the capture is.

## Layout — exact geometry on the 1080×1920 canvas

| Element | Value |
|---|---|
| App iframe | 430 × 800 CSS px, `scale(1.7674419)`, origin `0 0` |
| Device frame | 760 × 1414 at x=160, y=300; radius 54px; `overflow:hidden` |
| Caption block | x=80, y=78, width 920, centred |
| Eyebrow | 26px / 700 / `.34em` / uppercase / accent |
| Headline | 66px / 900 / line-height 1.22 / ink |
| Subline | 29px / 600 / muted |
| Footer | bottom 56px: logo mark + wordmark 32px/800, URL 22px/600 |
| Title card headline | 104px / 900 |
| End card headline | 72px / 900 |

The stage is `dir="ltr"` and the iframe is `position:absolute; left:0; top:0`.
(A block-level fixed-width iframe inside an RTL stage gets pushed to the start
edge and the scale does not apply as expected.)

## Beat sheet — identical for every reel

Defined once in `lib/stage.js` as `BEAT_SHEET`.

| Time | Beat |
|---|---|
| 0.00–3.55 | Title card. Eyebrow at 0; headline rises 46px and fades 0.45→1.35; subline 1.25→2.00; a 160px accent rule draws 1.70→2.60; card out 2.95→3.55 |
| 3.15–4.70 | Device fades in and settles: opacity 3.15→4.00, rises 70px→0, inner scale 1.05→1.00 |
| 4.20–5.00 | Footer fades in (out again 29.90→30.40) |
| ~5.1–29.9 | The feature: 4–5 caption beats, each ~4–6 s, over scripted interaction |
| optional | A full-bleed cut card to hide off-camera setup |
| 30.20–36.00 | End card: logo 30.4→31.4, headline 31.1→32.1, CTA pill 32.0→32.8, URL 32.7→33.4 |

Captions cross-fade with `win(t,a,b,c,d)` and rise 26px on entry.

## Motion

- **Scroll** — eased between keyframes anchored to *real elements*
  (`{ sel: '.calc-inputs', off: 100 }` = "scroll so `.calc-inputs` sits 100px
  down the viewport"), never magic pixel numbers. Each anchor is resolved
  lazily one keyframe early so it reads the DOM of the view actually on screen
  — the page reflows when the result panel appears. Clamped to
  `scrollHeight - innerHeight`.
- **Zoom** — gentle push-ins only, max 1.10, focal x at 0.5. Anything stronger
  crops text and looks broken rather than cinematic.
- **Cursor** — arrow SVG with a drop shadow, eased between waypoints, scaled to
  0.80 for 160ms before each click, emitting a ring that expands to 4.4× and
  fades over 550ms. Each target's bounding box is resolved at the moment the
  move begins, after that element's scroll has settled.

## Colour

Pulled from the product's own `:root` in `index.html`:
`--bg3` page, `--card` paper, `--off` ink, `--muted`, `--copper` accent,
`--copper3` for the inverted cut/end cards.

## Fonts

The app requests **Bebas Neue** and **Outfit**; Arabic UI (the `ع` language
toggle) falls back through **Tahoma**. A headless container has none of these
and silently substitutes, so install them system-wide *before* capturing:

```bash
sudo install -d /usr/share/fonts/truetype/reel
B=https://raw.githubusercontent.com/google/fonts/main
curl -sSL -o /usr/share/fonts/truetype/reel/BebasNeue-Regular.ttf "$B/ofl/bebasneue/BebasNeue-Regular.ttf"
curl -sSL -o /usr/share/fonts/truetype/reel/Outfit-Variable.ttf   "$B/ofl/outfit/Outfit%5Bwght%5D.ttf"
curl -sSL -o /usr/share/fonts/truetype/reel/NotoSansArabic-Variable.ttf "$B/ofl/notosansarabic/NotoSansArabic%5Bwdth,wght%5D.ttf"
sudo cp fontconfig/99-reel-aliases.conf /etc/fonts/conf.d/ && sudo fc-cache -f
```

`fontconfig/99-reel-aliases.conf` maps the app's requested `Tahoma` onto the
Arabic face and prefers `Outfit` for generic `sans-serif`. Verify with
`fc-match 'Bebas Neue'` — a fallback to DejaVu means the recording will not
match the product.

## Running

```bash
python3 -m http.server 8099 --bind 127.0.0.1   # serve the site (repo root)
cd reel
node render.mjs --spot     # ~15 timestamps -> out/<reel>-spot/contact-sheet.jpg
node render.mjs            # full 1080-frame capture + encode
```

**Always run the spot pass and actually look at the sheet before committing to
the full capture.** Check: nothing cropped by a zoom, no caption describing a
screen that is not visible, no two consecutive beats showing an identical
screen, and the interaction landing on the element the cursor points at.

## Adding a reel

The stage and beat sheet are shared; a reel is a small config in `reels/`
supplying only palette, copy, scroll/zoom/cursor timelines, the scripted
interaction, and a `verify()`. See `reels/kva-calculator.js`.

## Traps worth not rediscovering

- **Freeze in-app timers.** `setInterval` is stubbed before the app boots
  (`context.addInitScript`). `setTimeout` is deliberately left alone — the
  calculator's `calcKVA()` debounces by 300ms, and the reel needs it to fire.
- **`scrolling="no"` on the iframe silently breaks `window.scrollTo`.** It
  forces `overflow:hidden` on the iframe viewport. Scrollbars are hidden with
  CSS instead.
- **`el.focus()` scrolls the page.** Always `focus({preventScroll:true})`.
- **Resolve anchors against the live DOM, late.** Entering a value makes the
  result panel appear, which reflows everything below it.
- **Type via the native value setter** plus a bubbling `input` event, not
  `el.value = x`, so the app's handlers actually run.
- **Verify computed results.** `verify()` re-derives the on-screen figures from
  the app's documented formula and the render aborts on a mismatch. Fabricated
  numbers in a product video are a lie.
- **No external network in the capture container.** The site's Unsplash imagery
  (in `#clients` and `#projects`) and the unpkg `lucide` bundle do not load
  here. The reel's scroll range is confined to `#calculator`, which uses no
  remote assets, so nothing broken is ever on camera. If you build a reel that
  crosses those sections, vendor the assets first.
