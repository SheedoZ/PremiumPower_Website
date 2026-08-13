/* Stage runtime — runs inside the 1080x1920 stage page.
 *
 * Contract: every visual property is a pure function of `t`. There are no CSS
 * transitions and no requestAnimationFrame anywhere in here. The capture driver
 * calls STAGE.setT(t) once per frame and then screenshots.
 *
 * The stage is same-origin with the app, so setT also owns the app's scrollTop.
 */
(function () {
  const CFG = window.__CFG__;

  // Device geometry on the 1080x1920 canvas (see README).
  const S = 1.7674419;          // iframe scale: 430*S = 760, 800*S = 1414
  const DX = 160, DY = 300;     // device frame origin
  const DW = 760, DH = 1414;    // device frame size
  const APPW = 430, APPH = 800; // app viewport in CSS px

  /* ── math ─────────────────────────────────────────────────────────────── */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const inv = (t, a, b) => (b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a), 0, 1));
  const easeOut = (u) => 1 - Math.pow(1 - u, 3);
  const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

  // fade in a→b, hold b→c, fade out c→d
  const win = (t, a, b, c, d) => {
    if (t <= a || t >= d) return 0;
    if (t < b) return easeOut(inv(t, a, b));
    if (t <= c) return 1;
    return 1 - easeOut(inv(t, c, d));
  };

  const BEATS = CFG.beatSheet;

  /* ── markup ───────────────────────────────────────────────────────────── */
  // *emphasis* -> accent span
  const rich = (s) =>
    String(s).replace(/\*([^*]+)\*/g, '<span class="ac">$1</span>');

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  const root = document.getElementById('root');

  // Device frame + app iframe
  const device = el('div', 'device');
  const zoomer = el('div', 'zoomer');
  const iframe = document.createElement('iframe');
  iframe.id = 'app';
  // NB: no scrolling="no" — that forces overflow:hidden on the iframe viewport
  // and silently breaks window.scrollTo. Scrollbars are hidden in CSS instead.
  iframe.src = CFG.appUrl;
  zoomer.appendChild(iframe);
  device.appendChild(zoomer);
  root.appendChild(device);

  // Caption stack
  const capWrap = el('div', 'caps');
  const capNodes = CFG.captions.map((c) => {
    const n = el('div', 'cap');
    n.appendChild(el('div', 'cap-eyebrow', rich(c.eyebrow)));
    n.appendChild(el('div', 'cap-head', rich(c.headline)));
    n.appendChild(el('div', 'cap-sub', rich(c.subline)));
    capWrap.appendChild(n);
    return n;
  });
  root.appendChild(capWrap);

  // Footer
  const footer = el('div', 'footer');
  footer.innerHTML =
    '<div class="foot-lock">' +
    '<img class="foot-mark" src="' + CFG.footer.logo + '" alt="">' +
    '<div class="foot-word">' + rich(CFG.footer.wordmark) + '</div>' +
    '</div>' +
    '<div class="foot-url">' + CFG.footer.url + '</div>';
  root.appendChild(footer);

  // Cursor + click ring (drawn by the stage, never by the app)
  const ring = el('div', 'ring');
  root.appendChild(ring);
  const cursor = el('div', 'cursor');
  cursor.innerHTML =
    '<svg width="34" height="50" viewBox="0 0 15 22" fill="none">' +
    '<path d="M0.6,0.4 L0.6,19.1 L5.2,15.0 L8.2,21.6 L11.2,20.2 L8.2,13.8 L14.4,13.6 Z"' +
    ' fill="#fff" stroke="#11243E" stroke-width="1.1" stroke-linejoin="round"/></svg>';
  root.appendChild(cursor);

  // Title card
  const title = el('div', 'card title-card');
  title.innerHTML =
    '<div class="t-eyebrow">' + rich(CFG.title.eyebrow) + '</div>' +
    '<div class="t-head">' + rich(CFG.title.headline) + '</div>' +
    '<div class="t-sub">' + rich(CFG.title.subline) + '</div>' +
    '<div class="t-rule"></div>';
  root.appendChild(title);

  // Optional full-bleed cut card (hides off-camera setup)
  const cut = el('div', 'card cut-card');
  cut.innerHTML = '<div class="cut-head">' + rich(CFG.cut ? CFG.cut.headline : '') + '</div>';
  root.appendChild(cut);

  // End card
  const end = el('div', 'card end-card');
  end.innerHTML =
    '<img class="e-mark" src="' + CFG.footer.logo + '" alt="">' +
    '<div class="e-head">' + rich(CFG.end.headline) + '</div>' +
    '<div class="e-cta">' + rich(CFG.end.cta) + '</div>' +
    '<div class="e-url">' + CFG.end.url + '</div>';
  root.appendChild(end);

  const $ = (s, r) => (r || end).querySelector(s);
  const eMark = $('.e-mark'), eHead = $('.e-head'), eCta = $('.e-cta'), eUrl = $('.e-url');
  const tEyebrow = $('.t-eyebrow', title), tHead = $('.t-head', title),
    tSub = $('.t-sub', title), tRule = $('.t-rule', title);

  /* ── app access (same-origin) ─────────────────────────────────────────── */
  const appWin = () => iframe.contentWindow;
  const appDoc = () => iframe.contentDocument;

  /* ── lazily resolved scroll anchors ───────────────────────────────────── */
  // Anchors are resolved one keyframe early so they read the DOM of the view
  // actually on screen (the app reflows as the result panel appears).
  const anchorCache = new Map();
  function resolveAnchor(i) {
    if (anchorCache.has(i)) return anchorCache.get(i);
    const k = CFG.scroll[i];
    const d = appDoc(), w = appWin();
    const node = d.querySelector(k.sel);
    let v = 0;
    if (node) {
      const top = node.getBoundingClientRect().top + w.scrollY;
      const max = d.documentElement.scrollHeight - w.innerHeight;
      v = clamp(top - k.off, 0, max);
    }
    anchorCache.set(i, v);
    return v;
  }

  function scrollAt(t) {
    const K = CFG.scroll;
    if (t <= K[0].t) return resolveAnchor(0);
    for (let i = 0; i < K.length - 1; i++) {
      if (t >= K[i].t && t <= K[i + 1].t) {
        const a = resolveAnchor(i), b = resolveAnchor(i + 1);
        return lerp(a, b, easeInOut(inv(t, K[i].t, K[i + 1].t)));
      }
    }
    return resolveAnchor(K.length - 1);
  }

  /* ── zoom (gentle push-ins only) ──────────────────────────────────────── */
  function zoomAt(t) {
    const K = CFG.zoom;
    if (!K || !K.length) return 1;
    if (t <= K[0].t) return K[0].z;
    for (let i = 0; i < K.length - 1; i++) {
      if (t >= K[i].t && t <= K[i + 1].t) {
        return lerp(K[i].z, K[i + 1].z, easeInOut(inv(t, K[i].t, K[i + 1].t)));
      }
    }
    return K[K.length - 1].z;
  }

  /* ── cursor waypoints, resolved at the moment each move begins ────────── */
  const ptCache = new Map();
  function resolvePoint(i) {
    if (ptCache.has(i)) return ptCache.get(i);
    const m = CFG.cursor.moves[i];
    const d = appDoc();
    const node = d.querySelector(m.sel);
    let p = { x: APPW / 2, y: APPH / 2 };
    if (node) {
      const r = node.getBoundingClientRect(); // viewport coords: scroll already applied
      p = { x: r.left + r.width * (m.fx == null ? 0.5 : m.fx) + (m.dx || 0),
            y: r.top + r.height * (m.fy == null ? 0.5 : m.fy) + (m.dy || 0) };
    }
    ptCache.set(i, p);
    return p;
  }

  function cursorAt(t) {
    const M = CFG.cursor.moves;
    let from = CFG.cursor.start, pos = CFG.cursor.start;
    for (let i = 0; i < M.length; i++) {
      const m = M[i];
      if (t < m.t0) break;
      const to = resolvePoint(i);
      pos = t >= m.t1 ? to : {
        x: lerp(from.x, to.x, easeInOut(inv(t, m.t0, m.t1))),
        y: lerp(from.y, to.y, easeInOut(inv(t, m.t0, m.t1))),
      };
      from = to;
    }
    return pos;
  }

  // Click feedback: press to 0.80 over the 160ms before the click, release after.
  function cursorScale(t) {
    let s = 1;
    for (const tc of CFG.cursor.clicks) {
      if (t >= tc - 0.16 && t < tc) s = Math.min(s, lerp(1, 0.8, easeOut(inv(t, tc - 0.16, tc))));
      else if (t >= tc && t < tc + 0.16) s = Math.min(s, lerp(0.8, 1, easeOut(inv(t, tc, tc + 0.16))));
    }
    return s;
  }

  // Ring expands to 4.4x and fades over 550ms.
  function ringAt(t) {
    for (const tc of CFG.cursor.clicks) {
      if (t >= tc && t <= tc + 0.55) {
        const u = easeOut(inv(t, tc, tc + 0.55));
        return { on: 1, scale: lerp(1, 4.4, u), op: 1 - u };
      }
    }
    return { on: 0, scale: 1, op: 0 };
  }

  // app CSS px -> stage px, following the device's translate and scale
  function mapPoint(ax, ay, z, ty) {
    const lx = ax * S, ly = ay * S;
    return {
      x: DX + DW / 2 + (lx - DW / 2) * z,
      y: DY + DH / 2 + (ly - DH / 2) * z + ty,
    };
  }

  /* ── the one function that draws a frame ──────────────────────────────── */
  function setT(t) {
    const B = BEATS;

    // App scroll (same-origin: the stage drives it directly)
    const w = appWin();
    if (w) w.scrollTo(0, Math.round(scrollAt(t)));

    // Device: fade + rise + inner settle scale, then the beat push-in
    const devOp = win(t, B.device.in[0], B.device.in[1], 1e6, 1e6 + 1);
    const u = easeOut(inv(t, B.device.in[0], B.device.settleEnd));
    const ty = lerp(B.device.rise, 0, u);
    const settle = lerp(B.device.scaleFrom, 1, u);
    const z = settle * zoomAt(t);
    device.style.opacity = devOp;
    device.style.transform = 'translateY(' + ty.toFixed(3) + 'px)';
    zoomer.style.transform = 'scale(' + z.toFixed(5) + ')';

    // Captions
    for (let i = 0; i < capNodes.length; i++) {
      const c = CFG.captions[i], W = c.win;
      const op = win(t, W[0], W[1], W[2], W[3]);
      capNodes[i].style.opacity = op;
      capNodes[i].style.transform =
        'translateY(' + ((1 - easeOut(inv(t, W[0], W[1]))) * 26).toFixed(2) + 'px)';
      capNodes[i].style.visibility = op > 0.001 ? 'visible' : 'hidden';
    }

    // Footer
    footer.style.opacity = win(t, B.footer[0], B.footer[1], B.footer[2], B.footer[3]);

    // Cursor + ring
    const cf = CFG.cursor.fade;
    const cOp = win(t, cf[0], cf[1], cf[2], cf[3]);
    const p = cursorAt(t);
    const sp = mapPoint(p.x, p.y, z, ty);
    cursor.style.opacity = cOp;
    cursor.style.transform =
      'translate(' + sp.x.toFixed(2) + 'px,' + sp.y.toFixed(2) + 'px) scale(' + cursorScale(t).toFixed(3) + ')';
    const r = ringAt(t);
    ring.style.opacity = (r.op * cOp).toFixed(3);
    ring.style.transform =
      'translate(' + sp.x.toFixed(2) + 'px,' + sp.y.toFixed(2) + 'px) translate(-50%,-50%) scale(' + r.scale.toFixed(3) + ')';

    // Title card
    const tc = B.title;
    title.style.opacity = 1 - easeOut(inv(t, tc.out[0], tc.out[1]));
    title.style.visibility = t < tc.out[1] ? 'visible' : 'hidden';
    tEyebrow.style.opacity = easeOut(inv(t, tc.eyebrow[0], tc.eyebrow[1]));
    const hu = easeOut(inv(t, tc.head[0], tc.head[1]));
    tHead.style.opacity = hu;
    tHead.style.transform = 'translateY(' + ((1 - hu) * 46).toFixed(2) + 'px)';
    tSub.style.opacity = easeOut(inv(t, tc.sub[0], tc.sub[1]));
    tRule.style.width = (160 * easeInOut(inv(t, tc.rule[0], tc.rule[1]))).toFixed(1) + 'px';

    // Optional cut card
    if (CFG.cut) {
      const cc = CFG.cut.win;
      const o = win(t, cc[0], cc[1], cc[2], cc[3]);
      cut.style.opacity = o;
      cut.style.visibility = o > 0.001 ? 'visible' : 'hidden';
    } else {
      cut.style.opacity = 0; cut.style.visibility = 'hidden';
    }

    // End card
    const ec = B.end;
    const eo = easeOut(inv(t, ec.card[0], ec.card[1]));
    end.style.opacity = eo;
    end.style.visibility = t >= ec.card[0] ? 'visible' : 'hidden';
    const rise = (a, b, px) => {
      const v = easeOut(inv(t, a, b));
      return { o: v, y: (1 - v) * px };
    };
    let m = rise(ec.logo[0], ec.logo[1], 22);
    eMark.style.opacity = m.o; eMark.style.transform = 'translateY(' + m.y.toFixed(2) + 'px)';
    m = rise(ec.head[0], ec.head[1], 34);
    eHead.style.opacity = m.o; eHead.style.transform = 'translateY(' + m.y.toFixed(2) + 'px)';
    m = rise(ec.cta[0], ec.cta[1], 24);
    eCta.style.opacity = m.o; eCta.style.transform = 'translateY(' + m.y.toFixed(2) + 'px)';
    m = rise(ec.url[0], ec.url[1], 16);
    eUrl.style.opacity = m.o; eUrl.style.transform = 'translateY(' + m.y.toFixed(2) + 'px)';

    return { scrollTop: Math.round(scrollAt(t)), zoom: z };
  }

  window.STAGE = {
    setT,
    scrollAt,
    appReady: () =>
      new Promise((res) => {
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') return res();
        iframe.addEventListener('load', () => res(), { once: true });
      }),
    // Injected into the app: the app must snap between states; the stage owns motion.
    freezeApp: () => {
      const d = appDoc();
      const s = d.createElement('style');
      s.textContent =
        '*,*::before,*::after{transition:none!important;animation:none!important}' +
        'html{scroll-behavior:auto!important;scrollbar-width:none!important}' +
        '::-webkit-scrollbar{width:0!important;height:0!important;display:none!important}' +
        '.reveal{opacity:1!important;transform:none!important}';
      d.head.appendChild(s);
      d.documentElement.classList.remove('scroll-smooth');
    },
    resetCaches: () => { anchorCache.clear(); ptCache.clear(); },
  };
})();
