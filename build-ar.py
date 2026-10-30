#!/usr/bin/env python3
"""Generate ar/index.html from shared translations. Run: python3 build-ar.py.
Requires Python 3 and Node.js; no browser or network access is needed.
"""
import os, re
from seo import homepage
ROOT = os.path.dirname(os.path.abspath(__file__))


def render_arabic():
    """Translate source markup deterministically, including the static FAQ."""
    from site_markup import copy_tables, translate
    source=open(os.path.join(ROOT,'index.html'),encoding='utf-8').read()
    data=copy_tables(source)
    source=translate(source,data['T']['ar'])
    source=homepage(source,'ar',data)
    source=source.replace('<html lang="en"','<html lang="ar"').replace('<body>','<body dir="rtl" class="rtl">',1)
    return source.replace('<!DOCTYPE html>','').lstrip()


def rewrite(html):
    """Make the rendered DOM standalone and correct for /ar/."""
    # Assets resolve against /ar/ otherwise, so anchor them at the site root.
    html = re.sub(r'(src|href)="(?:\./)?images/', r'\1="/images/', html)
    html = re.sub(r"file:'([a-z-]+\.pdf)'", r"file:'/\1'", html)

    # Keep the complete model journey in the selected language.
    html = re.sub(r'href="/(perkins-generators-egypt|volvo-penta-generators-egypt|doosan-generators-egypt|maintenance|privacy)/', r'href="/ar/\1/', html)

    # Arabic renders entirely in Cairo, so preload its Arabic subset instead.
    from site_chrome import fonts
    if html.count(fonts("en")) != 1:
        raise ValueError("Homepage font preloads are missing")
    html = html.replace(fonts("en"), fonts("ar"))

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
    return "<!DOCTYPE html>\n" + html.rstrip() + "\n"


def main():
    html = rewrite(render_arabic())

    out_dir = os.path.join(ROOT, "ar")
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, "index.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)

    arabic = len(re.findall(r"[؀-ۿ]+", re.sub(r"<script.*?</script>", "", html, flags=re.S)))
    print(f"wrote {os.path.relpath(out, ROOT)}  ({len(html)//1024} KB, {arabic} Arabic words in markup)")


if __name__ == "__main__":
    main()
