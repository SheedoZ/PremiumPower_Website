#!/usr/bin/env python3
"""Extract the generated homepages' shared CSS and application into cacheable assets."""
import hashlib
import re
from seo import ROOT

def main():
    en = (ROOT / "index.html").read_text(encoding="utf-8")
    styles = re.findall(r"<style>(.*?)</style>", en, re.S)
    scripts = re.findall(r"<script>(.*?)</script>", en, re.S)
    if len(styles) != 1 or len(scripts) != 1:
        raise ValueError("Expected one homepage style and one application script")
    css = styles[0].strip() + "\n"
    js = scripts[0].strip() + "\n"
    js = js.replace("switchLanguage('en');\n", "switchLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en');\n", 1)
    js = re.sub(r"file:'([a-z-]+\.pdf)'", r"file:'/\1'", js)
    css_version = hashlib.sha256(css.encode()).hexdigest()[:12]
    js_version = hashlib.sha256(js.encode()).hexdigest()[:12]
    (ROOT / "assets/home.css").write_text(css, encoding="utf-8")
    (ROOT / "assets/home.js").write_text(js, encoding="utf-8")
    for file in ("index.html", "ar/index.html"):
        path = ROOT / file
        source = path.read_text(encoding="utf-8")
        source = re.sub(r"<style>.*?</style>", f'<link rel="stylesheet" href="/assets/home.css?v={css_version}">', source, count=1, flags=re.S)
        source = re.sub(r"<script>.*?</script>", f'<script src="/assets/home.js?v={js_version}" defer></script>', source, count=1, flags=re.S)
        source = re.sub(r'(<script src="/enquiry[^"]*")\s*>', r'\1 defer>', source)
        path.write_text(source, encoding="utf-8")
    print("wrote shared home assets and both homepage references")

if __name__ == "__main__":
    main()
