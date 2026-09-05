#!/usr/bin/env python3
"""Generate ar/index.html from index.html.

The Arabic copy lives in the T.ar table inside index.html and is only applied
by switchLanguage() at runtime, so a crawler that reads the served HTML sees
the English page and nothing else. This renders index.html in a real browser,
switches it to Arabic, and writes the resulting DOM out as a static page with
its own URL, so the Arabic content is in the markup before any script runs.

Run after any edit to index.html:

    python3 build-ar.py

Requires playwright-core and a Chromium build. Point PW_NODE_PATH at the
node_modules holding playwright-core and PW_CHROMIUM at the browser binary if
they are not where the defaults expect them.
"""
import os, re, shutil, subprocess, sys, tempfile, textwrap
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8571
SITE = "https://www.premiumpower-eg.com"
CHROMIUM = os.environ.get("PW_CHROMIUM", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
# Node resolves modules from the script's own directory, and the renderer script
# is written to a temp dir, so point it at an install of playwright-core.
NODE_PATH = os.environ.get("PW_NODE_PATH", "")


def serve():
    handler = lambda *a, **k: SimpleHTTPRequestHandler(*a, directory=ROOT, **k)
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def render_arabic():
    """Load index.html, switch it to Arabic, return the serialised DOM."""
    script = textwrap.dedent(f"""
        const {{ chromium }} = require('playwright-core');
        (async () => {{
          const b = await chromium.launch({{ executablePath: {CHROMIUM!r}, args: ['--no-sandbox'] }});
          const p = await b.newPage();
          await p.goto('http://127.0.0.1:{PORT}/index.html', {{ waitUntil: 'domcontentloaded' }});
          await p.waitForTimeout(1500);
          await p.evaluate(() => window.app.switchLanguage('ar'));
          await p.waitForTimeout(800);
          process.stdout.write(await p.evaluate(() => document.documentElement.outerHTML));
          await b.close();
        }})();
    """)
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as f:
        f.write(script)
        path = f.name
    try:
        env = dict(os.environ)
        if NODE_PATH:
            env["NODE_PATH"] = NODE_PATH
        out = subprocess.run(["node", path], capture_output=True, text=True,
                             cwd=ROOT, timeout=120, env=env)
        if out.returncode:
            sys.exit("render failed:\n" + out.stderr)
        return out.stdout
    finally:
        os.unlink(path)


def rewrite(html):
    """Make the rendered DOM standalone and correct for /ar/."""
    # Assets resolve against /ar/ otherwise, so anchor them at the site root.
    html = re.sub(r'(src|href)="(?:\./)?images/', r'\1="/images/', html)
    html = re.sub(r"file:'([a-z-]+\.pdf)'", r"file:'/\1'", html)

    # Arabic head. The rendered DOM still carries the English one.
    # switchLanguage() already swapped the title during the render, so match loosely.
    html = re.sub(r"<title>.*?</title>",
                  "<title>مولدات ديزل في مصر | بريميوم باور — بيركنز وفولفو ودوسان</title>",
                  html, count=1, flags=re.S)

    head_swaps = [
        (f'<link rel="canonical" href="{SITE}/">',
         f'<link rel="canonical" href="{SITE}/ar/">'),
        ('<meta property="og:locale" content="en_US">',
         '<meta property="og:locale" content="ar_EG">'),
        ('<meta property="og:locale:alternate" content="ar_EG">',
         '<meta property="og:locale:alternate" content="en_US">'),
        (f'<meta property="og:url" content="{SITE}/">',
         f'<meta property="og:url" content="{SITE}/ar/">'),
    ]
    for old, new in head_swaps:
        if old not in html:
            sys.exit(f"head swap missed: {old[:60]}")
        html = html.replace(old, new, 1)

    for name, ar in [
        ("description", "مورّد معتمد لمولدات الديزل في مصر. مولدات بيركنز وفولفو بنتا ودوسان من 9 إلى 3000 ك.ف.أ، "
                        "مع التركيب وقطع الغيار الأصلية وصيانة على مدار الساعة في القاهرة وجميع المحافظات."),
        ("og:title", "مولدات ديزل في مصر | بريميوم باور"),
        ("og:description", "مولدات بيركنز وفولفو بنتا ودوسان مع دعم فني على مدار الساعة في كل أنحاء مصر."),
        ("twitter:title", "مولدات ديزل في مصر | بريميوم باور"),
    ]:
        attr = "property" if name.startswith("og:") else "name"
        html = re.sub(rf'({attr}="{re.escape(name)}" content=")[^"]*(")', lambda m: m.group(1) + ar + m.group(2), html, count=1)

    # The page must come up in Arabic without a click.
    html = html.replace("switchLanguage('en');\n", "switchLanguage('ar');\n", 1)

    # Flip which language chip reads as current.
    html = html.replace('<a class="lang-btn active" href="/" hreflang="en" lang="en" aria-current="page">',
                        '<a class="lang-btn" href="/" hreflang="en" lang="en">')
    html = html.replace('<a class="lang-btn" href="/ar/" hreflang="ar" lang="ar" aria-label="النسخة العربية">',
                        '<a class="lang-btn active" href="/ar/" hreflang="ar" lang="ar" aria-current="page">')
    html = html.replace('<a class="lang-btn active" href="/" hreflang="en" lang="en" aria-current="page">English</a>',
                        '<a class="lang-btn" href="/" hreflang="en" lang="en">English</a>')
    html = html.replace('<a class="lang-btn" href="/ar/" hreflang="ar" lang="ar">العربية</a>',
                        '<a class="lang-btn active" href="/ar/" hreflang="ar" lang="ar" aria-current="page">العربية</a>')

    # Scroll-reveal classes the render happened to trigger; let them animate again.
    html = re.sub(r'(class="[^"]*?\breveal\b[^"]*?)\s+visible\b', r"\1", html)
    html = html.replace(' class="visible"', "")
    return "<!DOCTYPE html>\n" + html + "\n"


def main():
    httpd = serve()
    try:
        html = rewrite(render_arabic())
    finally:
        httpd.shutdown()

    out_dir = os.path.join(ROOT, "ar")
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, "index.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)

    arabic = len(re.findall(r"[؀-ۿ]+", re.sub(r"<script.*?</script>", "", html, flags=re.S)))
    print(f"wrote {os.path.relpath(out, ROOT)}  ({len(html)//1024} KB, {arabic} Arabic words in markup)")


if __name__ == "__main__":
    main()
