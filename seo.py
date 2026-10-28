"""Shared metadata and structured data for public website pages.

Catalogue ratings come from the PDFs through build-brands.py. No prices,
availability, reviews or manufacturer relationships are inferred here.
"""
from html import escape
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SITE = "https://www.premiumpower-eg.com"
ROUTES = {
    "home": "",
    "perkins": "perkins-generators-egypt/",
    "volvo": "volvo-penta-generators-egypt/",
    "doosan": "doosan-generators-egypt/",
    "maintenance": "maintenance/",
    "privacy": "privacy/",
}
NAMES = {
    "perkins": {"en": "Perkins", "ar": "بيركنز"},
    "volvo": {"en": "Volvo Penta", "ar": "فولفو بنتا"},
    "doosan": {"en": "Doosan", "ar": "دوسان"},
}
HOME = {
    "en": {
        "title": "Diesel Generators in Egypt | Premium Power",
        "description": "Compare Perkins, Volvo Penta and Doosan diesel generators in Egypt. Explore model ratings, installation, spare parts and maintenance. Request a quote.",
    },
    "ar": {
        "title": "مولدات ديزل في مصر | بريميوم باور",
        "description": "قارن مولدات بيركنز وفولفو بنتا ودوسان في مصر. تعرّف على قدرات الموديلات وخدمات التركيب وقطع الغيار والصيانة، واطلب عرض سعر يناسب احتياج مشروعك.",
    },
}


INFO = {
    "maintenance": {
        "en": {"title": "Generator Maintenance in Egypt | Premium Power", "description": "Request a generator maintenance assessment in Egypt. Discuss periodic contracts, service needs, equipment checks and the scope for your site."},
        "ar": {"title": "صيانة المولدات في مصر | بريميوم باور", "description": "اطلب تقييمًا لصيانة المولدات في مصر. ناقش العقود الدورية واحتياجات الخدمة وفحوص المعدات ونطاق العمل المناسب لموقعك."},
    },
    "privacy": {
        "en": {"title": "Enquiry Privacy | Premium Power", "description": "How Premium Power website enquiries are collected through Formspree and used to assess and respond to generator and maintenance requests."},
        "ar": {"title": "خصوصية الاستفسارات | بريميوم باور", "description": "تعرف على بيانات الاستفسارات التي يرسلها موقع بريميوم باور عبر Formspree وكيف تُستخدم لتقييم طلبات المولدات والصيانة والرد عليها."},
    },
}


def urls(key):
    return {"en": SITE + "/" + ROUTES[key], "ar": SITE + "/ar/" + ROUTES[key]}


def metadata(key, lang, models=None):
    if key == "home":
        return HOME[lang]
    if key in INFO:
        return INFO[key][lang]
    name = NAMES[key][lang]
    ratings = [float(model["prime"]) for model in models]
    lo, hi = f"{min(ratings):g}", f"{max(ratings):g}"
    if lang == "ar":
        return {
            "title": f"مولدات {name} في مصر | بريميوم باور",
            "description": f"قارن {len(models)} موديل من مولدات {name} بقدرة مستمرة {lo}–{hi} ك.ف.أ في مصر. راجع قدرات الطوارئ وأكواد المحركات، وحمّل الكتالوج واطلب عرض سعر.",
        }
    return {
        "title": f"{name} Generators in Egypt | Premium Power",
        "description": f"Compare {len(models)} {name} generator models in Egypt, rated {lo}–{hi} kVA Prime. Check Standby ratings and engine codes, download the catalogue and request a quote.",
    }


def metadata_html(key, lang, models=None):
    meta, links = metadata(key, lang, models), urls(key)
    title, desc = escape(meta["title"], quote=True), escape(meta["description"], quote=True)
    return f'''<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{links[lang]}">
<link rel="alternate" hreflang="en" href="{links['en']}">
<link rel="alternate" hreflang="ar" href="{links['ar']}">
<link rel="alternate" hreflang="x-default" href="{links['en']}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{links[lang]}">
<meta property="og:type" content="website">
<meta property="og:image" content="{SITE}/images/BC.jpg">
<meta property="og:site_name" content="Premium Power">
<meta property="og:locale" content="{'ar_EG' if lang == 'ar' else 'en_US'}">
<meta property="og:locale:alternate" content="{'en_US' if lang == 'ar' else 'ar_EG'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{SITE}/images/BC.jpg">'''


def business():
    # Published company identity, address, contact and office hours from index.html.
    return {
        "@type": "LocalBusiness", "@id": SITE + "/#organization",
        "name": "Premium Power LLC", "url": SITE + "/",
        "image": SITE + "/images/logo.png", "telephone": "+201229688688",
        "address": {"@type": "PostalAddress", "streetAddress": "40 El Hegaz St., Heliopolis",
                    "addressLocality": "Cairo", "addressCountry": "EG"},
        "openingHoursSpecification": [{"@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
            "opens": "09:00", "closes": "17:00"}],
        "sameAs": ["https://www.facebook.com/profile.php?id=61583941521978",
                   "https://www.linkedin.com/in/premium-power-4430a3399"],
    }


def structured_data(key, lang, faqs, models=None):
    url = urls(key)[lang]
    meta = metadata(key, lang, models)
    page = {"@type": "CollectionPage" if models is not None else "WebPage",
            "@id": url + "#webpage", "url": url, "name": meta["title"],
            "description": meta["description"], "inLanguage": lang,
            "isPartOf": {"@id": SITE + "/#website"},
            "publisher": {"@id": SITE + "/#organization"}}
    graph = [business(),
        {"@type": "WebSite", "@id": SITE + "/#website", "url": SITE + "/",
         "name": "Premium Power", "inLanguage": ["en", "ar"],
         "publisher": {"@id": SITE + "/#organization"}}, page,
        {"@type": "FAQPage", "@id": url + "#faq", "inLanguage": lang,
         "isPartOf": {"@id": page["@id"]},
         "mainEntity": [{"@type": "Question", "name": q,
                         "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]},
    ]
    if not faqs:
        graph = [node for node in graph if node.get("@type") != "FAQPage"]
    if models is not None:
        page["mainEntity"] = {"@id": url + "#catalogue"}
        page["breadcrumb"] = {"@id": url + "#breadcrumb"}
        graph.append({"@type": "BreadcrumbList", "@id": url + "#breadcrumb",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "الرئيسية" if lang == "ar" else "Home", "item": urls("home")[lang]},
                {"@type": "ListItem", "position": 2, "name": meta["title"], "item": url}]})
        items = []
        for position, model in enumerate(models, 1):
            model_url = url + "#model-" + model["model"]
            product = {"@type": "Product", "@id": model_url, "url": model_url,
                "name": (f"مولد بمحرك {NAMES[key][lang]} — {model['model']}" if lang == "ar"
                         else f"Generator with {NAMES[key][lang]} engine — {model['model']}"),
                "model": model["model"], "additionalProperty": []}
            for field, label in [("prime", "Prime (PRP)"), ("standby", "Standby (ESP)"),
                                 ("engine", "Engine"), ("alt", "Alternator")]:
                prop = {"@type": "PropertyValue", "propertyID": field, "name": label,
                        "value": float(model[field]) if field in ("prime", "standby") else model[field]}
                if field in ("prime", "standby"):
                    prop["unitText"] = "kVA"
                product["additionalProperty"].append(prop)
            items.append({"@type": "ListItem", "position": position, "item": product})
        graph.append({"@type": "ItemList", "@id": url + "#catalogue", "numberOfItems": len(items),
                      "itemListElement": items})
    return {"@context": "https://schema.org", "@graph": graph}


def schema_html(data):
    # Prevent content containing an HTML closing tag from ending the script element.
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    return '<script type="application/ld+json">' + payload + '</script>'


def faq_pairs(data, lang):
    return [(item["q_" + lang], item["a_" + lang]) for item in data["FAQS"]]


def homepage(source, lang, data):
    """Refresh only managed head fields and FAQ content; leave scripts/CSS intact."""
    faqs = faq_pairs(data, lang)
    start, end = source.index("<head>") + len("<head>"), source.index("</head>")
    head = source[start:end]
    head = re.sub(r'<title>.*?</title>\s*', '', head, flags=re.S)
    head = re.sub(r'<meta (?:name="(?:description|keywords|twitter:[^"]+)"|property="og:[^"]+")[^>]*>\s*', '', head)
    head = re.sub(r'<link rel="(?:canonical|alternate)"[^>]*>\s*', '', head)
    head = re.sub(r'<script type="application/ld\+json">.*?</script>\s*', '', head, flags=re.S)
    head, count = re.subn(r'(<meta name="viewport"[^>]*>\n)',
                         lambda m: m[1] + metadata_html("home", lang) + "\n",
                         head, count=1)
    if count != 1:
        raise ValueError("Homepage viewport metadata is missing")
    head = head.rstrip() + "\n" + schema_html(structured_data("home", lang, faqs)) + "\n"
    source = source[:start] + head + source[end:]
    faq_html = "".join(f'<details class="faq-item" name="home-faq"><summary class="faq-q">{escape(q)}</summary><p>{escape(a)}</p></details>' for q, a in faqs)
    source, count = re.subn(r'(<div class="faq-list reveal" id="faq-list">).*?(</div>)',
                            lambda m: m[1] + faq_html + m[2], source, count=1, flags=re.S)
    if count != 1:
        raise ValueError("Homepage FAQ container is missing")
    return source


def sitemap():
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for key in ROUTES:
        links = urls(key)
        for url in links.values():
            lines.extend(["  <url>", f"    <loc>{url}</loc>"])
            for lang, href in {**links, "x-default": links["en"]}.items():
                lines.append(f'    <xhtml:link rel="alternate" hreflang="{lang}" href="{href}"/>')
            lines.append("  </url>")
    return "\n".join(lines + ["</urlset>", ""])
