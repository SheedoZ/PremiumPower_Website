#!/usr/bin/env python3
"""Generate homepage SEO/FAQ markup and the sitemap before localized pages."""
import json
import re
from seo import ROOT, HOME, homepage, sitemap
from site_markup import copy_tables


def main():
    source = (ROOT / "index.html").read_text(encoding="utf-8")
    # Keep the runtime page title in sync with the static title.
    for lang in ("en", "ar"):
        title = json.dumps(HOME[lang]["title"], ensure_ascii=False).replace("<", "\\u003c")
        source, count = re.subn(rf"(^{lang}:\{{\n)(?:  pageTitle:[^\n]*\n)?",
                               lambda m: m[1] + "  pageTitle:" + title + ",\n",
                               source, count=1, flags=re.M)
        if count != 1:
            raise ValueError(f"Missing {lang} translation table")
    source = homepage(source, "en", copy_tables(source))
    (ROOT / "index.html").write_text(source, encoding="utf-8")
    (ROOT / "sitemap.xml").write_text(sitemap(), encoding="utf-8")
    print("wrote homepage SEO, static FAQ and sitemap.xml")


if __name__ == "__main__":
    main()
