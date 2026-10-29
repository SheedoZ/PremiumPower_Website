"""Shared site navigation/footer rendered from the canonical homepage source."""
from functools import lru_cache
import re
from seo import ROOT
from site_markup import copy_tables, translate

VERSION = "20261029-2"

@lru_cache(maxsize=1)
def source_and_copy():
    source = (ROOT / "_src/home.html").read_text(encoding="utf-8")
    return source, copy_tables(source)["T"]

def local_links(markup, lang):
    home = "/ar/" if lang == "ar" else "/"
    markup = re.sub(r'href="#([^"]*)"', lambda m: f'href="{home}#{m[1]}"', markup)
    for slug in ("maintenance", "privacy"):
        markup = markup.replace(f'href="/{slug}/"', f'href="{home}{slug}/"')
    return markup

def header(lang, slug, quote_target=None):
    source, tables = source_and_copy()
    markup = source[source.index("<!-- Navbar -->"):source.index('<main id="main-content">')]
    markup = local_links(translate(markup, tables[lang]), lang)
    home = "/ar/" if lang == "ar" else "/"
    target = quote_target or home + "#contact"
    markup = re.sub(r'<button class="nav-cta"[^>]*>(.*?)</button>',
                    lambda m: f'<a class="nav-cta" href="{target}">{m[1]}</a>', markup, flags=re.S)
    markup = markup.replace('onclick="app.toggleMenu()"', 'data-shell-toggle')
    markup = markup.replace('id="hamburger-btn"', 'id="hamburger-btn" aria-controls="mobile-menu"')
    def locale(match):
        tag, choice = match[0], match[1]
        path = ("/ar/" if choice == "ar" else "/") + slug + "/"
        tag = re.sub(r'href="[^"]*"', f'href="{path}"', tag)
        tag = re.sub(r'\saria-current="[^"]*"', "", tag).replace("lang-btn active", "lang-btn")
        if choice == lang:
            tag = tag.replace('class="lang-btn"', 'class="lang-btn active" aria-current="page"')
        return tag
    markup = re.sub(r'<a\b[^>]*\blang="(en|ar)"[^>]*>', locale, markup)
    return markup

def footer(lang):
    source, tables = source_and_copy()
    markup = re.search(r"<footer>.*?</footer>", source, re.S).group(0)
    return local_links(translate(markup, tables[lang]), lang)

def styles():
    return f'<link rel="stylesheet" href="/assets/site-chrome.css?v={VERSION}">'

def scripts():
    return f'<script src="/assets/site-chrome.js?v={VERSION}" defer></script>'

def fonts():
    return '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">'
