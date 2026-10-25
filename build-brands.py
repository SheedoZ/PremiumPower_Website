#!/usr/bin/env python3
"""Generate English and Arabic model catalogues with filtering and inline enquiries.
Ratings come from the repository PDFs. Shared form text comes from index.html.
Run python3 build-brands.py after editing source data, template or form copy.
Requires Python 3, Node.js and pdftotext (poppler-utils).
"""
import html, json, os, re, subprocess, sys
from site_markup import copy_tables, translate

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://www.premiumpower-eg.com"

BRANDS = {
    "perkins": {"slug": "perkins-generators-egypt", "pdf": "perkins-specs.pdf",
                "popular": ["G60PL", "G100PL", "G500PL"], "marque": "Perkins"},
    "volvo":   {"slug": "volvo-penta-generators-egypt", "pdf": "volvo-specs.pdf",
                "popular": ["G300VL", "G350VL"], "marque": "Volvo Penta"},
    "doosan":  {"slug": "doosan-generators-egypt", "pdf": "doosan-specs.pdf",
                "popular": ["G300DL", "G360DL"], "marque": "Doosan"},
}

# Why a buyer picks this marque. Each claim traces to the spec table in
# index.html, the catalogue PDFs, or the manufacturer's own published material --
# nothing here is inferred from a model the catalogues do not list.
WHY = {
    "perkins": {
        "en": "The widest span in our catalogue: 18 standard models from 20 to 1000 kVA, with "
              "ratings either side supplied to order. Perkins is also offered with a mechanical "
              "or an electronic governor. A mechanical set runs without an engine control unit, "
              "which means it can be serviced in the field with ordinary tools and is less "
              "sensitive to fuel quality — a real advantage on sites far from a service centre. "
              "Perkins ElectropaK engines with electronic governing conform to ISO 8528-5 "
              "class G3, and the larger models to class G2.",
        "ar": "أوسع مدى في كتالوجنا: 18 موديلاً قياسياً من 20 إلى 1000 ك.ف.أ، والقدرات خارج هذا "
              "النطاق تُورَّد حسب الطلب. وتتوفر بيركنز بمنظّم ميكانيكي أو إلكتروني. الوحدة "
              "الميكانيكية تعمل دون وحدة تحكم إلكترونية، أي يمكن صيانتها في الموقع بأدوات عادية "
              "وهي أقل حساسية لجودة الوقود — ميزة حقيقية في المواقع البعيدة عن مراكز الخدمة. "
              "ومحركات بيركنز ElectropaK ذات التحكم الإلكتروني مطابقة للفئة G3 من معيار "
              "ISO 8528-5، والموديلات الأكبر للفئة G2.",
    },
    "volvo": {
        "en": "Fully electronic EMS 2.0 engine management, with turbocharging and an "
              "intercooler across the range. Volvo Penta genset engines comply with ISO 8528 "
              "class G3, the strictest load-acceptance class in the standard: the set reaches "
              "stable voltage and frequency faster after the mains drop. That recovery time is "
              "what makes this the range to specify for data centres, hospitals and any load "
              "that will not tolerate a long transient.",
        "ar": "نظام إدارة محرك إلكتروني بالكامل EMS 2.0، مع شحن توربيني ومبرّد بيني في كامل "
              "النطاق. ومحركات فولفو بنتا للمولدات مطابقة للفئة G3 من معيار ISO 8528، وهي أعلى "
              "فئات استجابة الحمل في المعيار: تصل الوحدة إلى جهد وتردد مستقرين أسرع بعد انقطاع "
              "الشبكة. زمن الاستقرار هذا هو ما يجعلها الخيار المحدَّد لمراكز البيانات والمستشفيات "
              "وأي حمل لا يحتمل اضطراباً طويلاً.",
    },
    "doosan": {
        "en": "V-configuration engines from 6 to 12 cylinders, turbocharged with an aftercooler "
              "and managed by an electronic ECU. The range is built for continuous prime duty at "
              "the strongest value in our catalogue — the practical choice for contracting and "
              "manufacturing sites where the set runs for long hours rather than sitting on "
              "standby. The engines are built by HD Hyundai Infracore, formerly Doosan Infracore.",
        "ar": "محركات بتكوين V من 6 إلى 12 أسطوانة، بشحن توربيني ومبرّد لاحق وإدارة عبر وحدة "
              "تحكم إلكترونية ECU. النطاق مبني للتشغيل المستمر بأعلى قيمة مقابل السعر في "
              "كتالوجنا — الخيار العملي لمواقع المقاولات والمصانع حيث تعمل الوحدة ساعات طويلة "
              "بدلاً من انتظارها كاحتياطي. وتُصنَّع المحركات لدى HD Hyundai Infracore، "
              "المعروفة سابقاً باسم Doosan Infracore.",
    },
}

# Copy that has no source in index.html or the PDFs.
UI = {
    "en": {
        "dir": "ltr", "home": "Home", "generators": "Generators",
        "range": "Model Range", "rangeNote":
            "Ratings at 50 Hz, 400/230 V, 0.8 power factor. Prime (PRP) is continuous "
            "supply at variable load for unlimited hours, with 10% overload available for "
            "one hour in every twelve. Standby (ESP) covers the duration of a utility "
            "outage and permits no overload.",
        "model": "Model", "engine": "Engine", "alt": "Alternator",
        "prime": "Prime kVA", "standby": "Standby kVA",
        "specs": "Technical Specifications",
        "provide": "Supplied With Every Set",
        "pdf": "Download the full catalogue (PDF)",
        "quote": "Request a Quote",
        "backHome": "Back to the main site",
        "distributor": "Authorized Distributor in Egypt",
        "modelsCount": "{n} models · {lo}–{hi} kVA",
        "why": "Why {brand}", "popular": "Most Requested",
        "faq": "Common Questions",
        "rangeAvail": "The table lists the main models. Ratings from {lo} to {hi} kVA are "
                      "available; models outside the table are supplied to order.",
        "q1": "What is the difference between the Prime and Standby ratings?",
        "a1": "Prime (PRP) is continuous supply at variable load for unlimited hours, with a 10% "
              "overload available for one hour in every twelve. Standby (ESP) covers only the "
              "duration of a utility outage and permits no overload. Both figures are listed "
              "against every model in the table above.",
        "q2": "Which engines are used across the {brand} range?",
        "a2": "The range is built on these {brand} engines: {engines}. Each one is listed "
              "against the rating it drives in the table above.",
        "q3": "Which alternator is fitted?",
        "a3": "{alt}, with {ins} insulation and {exc} excitation.",
        "q4": "Which control panel is supplied?",
        "a4": "{ctrl}. The panel is configured for the application, whether that is a single set, "
              "an automatic transfer scheme or a synchronised installation.",
    },
    "ar": {
        "dir": "rtl", "home": "الرئيسية", "generators": "المولدات",
        "range": "نطاق الموديلات", "rangeNote":
            "القدرات على تردد 50 هرتز، جهد 400/230 فولت، معامل قدرة 0.8. القدرة المستمرة (PRP) "
            "هي التغذية المستمرة بحمل متغير لساعات غير محدودة، مع تحمّل زيادة 10% لمدة ساعة كل "
            "اثنتي عشرة ساعة. قدرة الطوارئ (ESP) تغطي مدة انقطاع الشبكة ولا تسمح بأي زيادة حمل.",
        "model": "الموديل", "engine": "الموتور", "alt": "المولد",
        "prime": "القدرة المستمرة (ك.ف.أ)", "standby": "قدرة الطوارئ (ك.ف.أ)",
        "specs": "المواصفات الفنية",
        "provide": "يُورَّد مع كل وحدة",
        "pdf": "تحميل الكتالوج الكامل (PDF)",
        "quote": "اطلب عرض سعر",
        "backHome": "العودة للموقع الرئيسي",
        "distributor": "موزّع معتمد في مصر",
        "modelsCount": "{n} موديل · {lo}–{hi} ك.ف.أ",
        "why": "لماذا {brand}؟", "popular": "الأكثر طلباً",
        "faq": "أسئلة شائعة",
        "rangeAvail": "الجدول يعرض الموديلات الأساسية. القدرات من {lo} إلى {hi} ك.ف.أ متاحة، "
                      "والموديلات خارج الجدول تُورَّد حسب الطلب.",
        "q1": "ما الفرق بين القدرة المستمرة وقدرة الطوارئ؟",
        "a1": "القدرة المستمرة (PRP) هي التغذية المستمرة بحمل متغير لساعات غير محدودة، مع تحمّل "
              "زيادة 10% لمدة ساعة كل اثنتي عشرة ساعة. أما قدرة الطوارئ (ESP) فتغطي مدة انقطاع "
              "الشبكة فقط ولا تسمح بأي زيادة في الحمل. والقيمتان مذكورتان أمام كل موديل في "
              "الجدول أعلاه.",
        "q2": "ما المحركات المستخدمة في نطاق {brand}؟",
        "a2": "يقوم النطاق على محركات {brand} التالية: {engines}. وكل محرك مذكور أمام القدرة "
              "التي يشغّلها في الجدول أعلاه.",
        "q3": "ما المولد (الألترنيتور) المركّب؟",
        "a3": "{alt}، بعزل {ins} وإثارة {exc}.",
        "q4": "ما لوحة التحكم المورَّدة؟",
        "a4": "{ctrl}. وتُضبط اللوحة حسب التطبيق، سواء كانت وحدة مفردة أو نظام تحويل أوتوماتيكي "
              "أو تركيبة متزامنة.",
    },
}

# Services already described on the home page, linked back rather than restated.
PROVIDED = {
    "en": [("Turnkey Installation", "#services"), ("Genuine OEM Spare Parts", "#services"),
           ("Maintenance Contracts", "#amc"), ("Load Bank Testing", "#services")],
    "ar": [("تركيب متكامل", "#services"), ("قطع غيار أصلية", "#services"),
           ("عقود صيانة", "#amc"), ("اختبار الحمل", "#services")],
}


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return f.read()


def models_from_pdf(pdf):
    """Pull the rating table out of a spec sheet."""
    out = subprocess.run(["pdftotext", "-layout", os.path.join(ROOT, pdf), "-"],
                         capture_output=True, text=True)
    if out.returncode:
        sys.exit(f"pdftotext failed on {pdf}: {out.stderr.strip()}")
    rows = []
    for line in out.stdout.splitlines():
        m = re.match(r"\s+(G\d+[A-Z]{2})\s+(\S+)\s+(\S+)\s+([\d.]+)\s+([\d.]+)\s*$", line)
        if m:
            rows.append(dict(zip(("model", "engine", "alt", "prime", "standby"), m.groups())))
    if not rows:
        sys.exit(f"no model rows found in {pdf}")
    return rows


def brand_copy(index, brand):
    """Brand name, origin line and blurb, in both languages, from index.html."""
    copy = {}
    for lang in ("en", "ar"):
        block = re.search(rf"^{lang}:\{{.*?^\}},", index, re.S | re.M).group(0)
        copy[lang] = {}
        for field in ("Name", "Origin", "Desc"):
            m = re.search(rf"{brand}{field}:'((?:[^'\\]|\\.)*)'", block)
            if not m:
                sys.exit(f"missing {brand}{field} in {lang}")
            copy[lang][field.lower()] = m.group(1).replace("\\'", "'")
    return copy


def spec_rows(index, brand, translations):
    """The technical spec accordion for one brand, with data-i18n resolved per language."""
    block = re.search(rf'id="spec-{brand}".*?\n\s*</div>', index, re.S).group(0)
    rows = {"en": [], "ar": []}
    for key_attr, key_txt, val_attr, val_txt in re.findall(
            r'<span class="spec-key"(?:\s+data-i18n="([^"]*)")?>([^<]*)</span>'
            r'<span class="spec-val"(?:\s+data-i18n="([^"]*)")?>([^<]*)</span>', block):
        for lang in ("en", "ar"):
            k = translations[lang].get(key_attr, key_txt) if key_attr else key_txt
            v = translations[lang].get(val_attr, val_txt) if val_attr else val_txt
            rows[lang].append((k, v))
    if not rows["en"]:
        sys.exit(f"no spec rows parsed for {brand}")
    return rows


def translations(index):
    """The whole T table, so spec labels can be resolved in either language."""
    out = {}
    for lang in ("en", "ar"):
        block = re.search(rf"^{lang}:\{{.*?^\}},", index, re.S | re.M).group(0)
        out[lang] = {k: v.replace("\\'", "'")
                     for k, v in re.findall(r"([A-Za-z0-9_]+):'((?:[^'\\]|\\.)*)'", block)}
    return out


def page(brand, lang, cfg, copy, models, specs, css):
    t, e = UI[lang], html.escape
    # "Perkins Series" / "سلسلة بيركنز" reads as a product line on the home page, but
    # the term buyers actually search is the bare marque.
    name = re.sub(r"^\s*سلسلة\s+|\s+Series\s*$", "", copy[lang]["name"]).strip()
    primes = [float(m["prime"]) for m in models]
    lo, hi = f"{min(primes):g}", f"{max(primes):g}"
    slug = cfg["slug"]
    url_en, url_ar = f"{SITE}/{slug}/", f"{SITE}/ar/{slug}/"
    self_url = url_ar if lang == "ar" else url_en
    home = "/ar/" if lang == "ar" else "/"

    if lang == "ar":
        title = f"مولدات {name} في مصر | {lo}–{hi} ك.ف.أ — بريميوم باور"
        h1 = f"مولدات {name} الديزل في مصر"
        desc = (f"{len(models)} موديل من مولدات {name} الديزل من {lo} إلى {hi} ك.ف.أ. "
                f"المواصفات الفنية وأكواد المواتير والمولدات، مع التركيب وقطع الغيار الأصلية "
                f"والصيانة من بريميوم باور، الموزّع المعتمد في مصر.")
    else:
        title = f"{name} Generators Egypt | {lo}–{hi} kVA — Premium Power"
        h1 = f"{name} Diesel Generators in Egypt"
        desc = (f"{len(models)} {name} diesel generator models from {lo} to {hi} kVA. "
                f"Full ratings, engine and alternator codes, with installation, genuine OEM "
                f"parts and maintenance from Premium Power, authorized distributor in Egypt.")

    # Site-stated span, which reaches past the catalogue: the extra ratings are built to order.
    span = re.findall(r"([\d,]+)\s*(?:KVA|ك\.ف\.أ)", copy[lang]["origin"])
    site_lo, site_hi = (span + [lo, hi])[:2] if len(span) >= 2 else (lo, hi)

    spec = dict(specs[lang])
    def spec_val(*names):
        for n in names:
            if n in spec:
                return spec[n]
        return ""

    # Listed verbatim from the catalogue. Deriving a "family" name from these codes
    # guesses at each maker's naming scheme and gets it wrong; the codes are also what
    # a buyer who already knows the engine actually searches for.
    seen, families = set(), []
    for m in models:
        if m["engine"] not in seen:
            seen.add(m["engine"])
            families.append(m["engine"])
    faqs = [
        (t["q1"], t["a1"]),
        (t["q2"].format(brand=name), t["a2"].format(brand=name, engines="، ".join(families) if lang == "ar" else ", ".join(families))),
        (t["q3"], t["a3"].format(alt=spec_val("Alternator", "المولد"), ins=spec_val("Insulation", "العزل"), exc=spec_val("Excitation", "الإثارة"))),
        (t["q4"], t["a4"].format(ctrl=spec_val("Control", "التحكم"))),
    ]
    faq_html = "\n".join(
        f'      <details><summary>{e(q)}</summary><p>{e(a)}</p></details>'
        for q, a in faqs)

    by_model = {m["model"]: m for m in models}
    popular = [by_model[c] for c in cfg.get("popular", []) if c in by_model]
    ar = lang == 'ar'
    def label(en, ar_text): return ar_text if ar else en
    popular_html = "\n".join(
        f'<li><span class="eyebrow">{e(cfg["marque"])}</span><b>{e(m["model"])}</b>'
        f'<span dir="ltr">{e(m["engine"])}</span><em>{e(m["prime"])} kVA <small>Prime</small></em>'
        f'<span>{e(m["standby"])} kVA Standby</span>'
        f'<button type="button" class="btn ghost" data-quote="{e(m["model"])}">{e(t["quote"])}</button></li>'
        for m in popular)
    rows = "\n".join(
        f'<tr data-model="{e(m["model"])}" data-engine="{e(m["engine"])}" data-alt="{e(m["alt"])}" data-prime="{e(m["prime"])}" data-standby="{e(m["standby"])}">'
        f'<th scope="row" dir="ltr">{e(m["model"])}</th><td data-label="{e(t["engine"])}"><bdi>{e(m["engine"])}</bdi></td>'
        f'<td data-label="{e(t["alt"])}"><bdi>{e(m["alt"])}</bdi></td><td data-label="{e(t["prime"])}">{e(m["prime"])}</td>'
        f'<td data-label="{e(t["standby"])}">{e(m["standby"])}</td><td class="model-actions">'
        f'<button type="button" class="btn solid" data-quote="{e(m["model"])}">{e(t["quote"])}</button>'
        f'<label><input type="checkbox" class="compare-check" value="{e(m["model"])}"> {label("Compare","قارن")} <span class="sr-only">{e(m["model"])}</span></label></td></tr>'
        for m in models)
    source=read('index.html')
    form=re.search(r'<form id="contact-form".*?</form>',source,re.S).group(0)
    form=form.replace('event.preventDefault(); app.submitForm(event)','window.PremiumPowerEnquiry.submitForm(event)')
    form=translate(form,copy_tables(source)['T'][lang])
    brand_nav=''.join(f'<a href="{home}{v["slug"]}/"'+(' aria-current="page"' if k==brand else '')+f'>{e(v["marque"])}</a>' for k,v in BRANDS.items())
    spec_html = "\n".join(f'      <div class="spec-row"><span>{e(k)}</span><b>{e(v)}</b></div>'
                          for k, v in specs[lang])
    provided = "\n".join(f'      <li><a href="{home}{href}">{e(label)}</a></li>'
                         for label, href in PROVIDED[lang])

    ld = json.dumps([
        {"@context": "https://schema.org", "@type": "BreadcrumbList",
         "itemListElement": [
             {"@type": "ListItem", "position": 1, "name": t["home"], "item": SITE + home},
             {"@type": "ListItem", "position": 2, "name": h1, "item": self_url}]},
        {"@context": "https://schema.org", "@type": "FAQPage",
         "mainEntity": [{"@type": "Question", "name": q,
                         "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]},
    ], ensure_ascii=False)

    return f"""<!DOCTYPE html>
<html lang="{lang}" dir="{t['dir']}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="theme-color" content="#003087">
<link rel="canonical" href="{self_url}">
<link rel="alternate" hreflang="en" href="{url_en}">
<link rel="alternate" hreflang="ar" href="{url_ar}">
<link rel="alternate" hreflang="x-default" href="{url_en}">
<link rel="icon" type="image/png" href="/images/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{self_url}">
<meta property="og:image" content="{SITE}/images/BC.jpg">
<meta property="og:type" content="website">
<meta property="og:locale" content="{'ar_EG' if lang == 'ar' else 'en_US'}">
<script type="application/ld+json">{ld}</script>
<link rel="stylesheet" href="/assets/brand-page.css?v=20261025">
</head>
<body data-brand="{e(cfg['marque'])}">
<a href="#main" class="skip">{label('Skip to content','تخطي إلى المحتوى')}</a>
<header class="bar">
  <a class="logo" href="{home}">PREMIUM<span>POWER</span></a>
  <nav class="langs" aria-label="{label('Language','اللغة')}">
    <a href="/{slug}/" hreflang="en" lang="en"{' aria-current="page"' if not ar else ''}>EN</a>
    <a href="/ar/{slug}/" hreflang="ar" lang="ar"{' aria-current="page"' if ar else ''}>عربي</a>
  </nav>
</header>
<main id="main">
  <nav class="crumbs" aria-label="{label('Breadcrumb','مسار التنقل')}"><a href="{home}">{e(t['home'])}</a> / <a href="{home}#products">{e(t['generators'])}</a> / {e(name)}</nav>
  <section class="hero">
    <div class="hero-copy">
      <img class="marque" src="/images/brands/{brand}.svg" alt="{e(cfg['marque'])}" width="180" height="64">
      <p class="eyebrow">PREMIUM POWER · {label('EGYPT','مصر')}</p>
      <h1>{e(h1)}</h1>
      <p class="lede">{e(copy[lang]['desc'])}</p>
      <div class="hero-facts"><span><b>{len(models)}</b>{label('catalogue models','موديل في الكتالوج')}</span><span><b dir="ltr">{lo}–{hi}</b>kVA · Prime · 50 Hz</span></div>
      <div class="cta"><a href="#models" class="btn solid">{label('Find your model','اختار الموديل المناسب')}</a><a class="btn ghost" href="#contact" data-general-quote>{e(t['quote'])}</a></div>
      <a class="download" href="/{cfg['pdf']}" download>{e(t['pdf'])} ↓</a>
    </div>
    <figure class="hero-photo"><img src="/images/gallery/gen_1.webp" width="1000" height="671" fetchpriority="high" alt="{label('Enclosed generator from the Premium Power gallery','مولد بكابينة من معرض بريميوم باور')}"><figcaption>{label('From our generator gallery. Configuration depends on the selected model.','من معرض مولداتنا — التجهيز النهائي حسب الموديل المختار.')}</figcaption></figure>
  </section>
  <nav class="brand-nav" aria-label="{label('Generator brands','ماركات المولدات')}">{brand_nav}</nav>
  <p class="avail">{e(t['rangeAvail'].format(lo=site_lo, hi=site_hi))}</p>
  <section>
    <p class="eyebrow">{label('A place to start','ابدأ من هنا')}</p>
    <h2>{label('Explore the range','اختيارات من المجموعة')}</h2>
    <ul class="popular">{popular_html}</ul>
  </section>
  <section id="models">
    <div class="section-heading"><div><p class="eyebrow">{label('Compare. Choose. Enquire.','قارن. اختار. استفسر.')}</p><h2>{e(t['range'])}</h2></div><a href="#contact" data-general-quote>{label('Not sure which size? Ask our team →','مش متأكد من القدرة؟ اسأل فريقنا ←')}</a></div>
    <div id="model-tools" class="filters" hidden>
      <label for="model-search">{label('Search model or engine','ابحث بالموديل أو المحرك')}<input id="model-search" type="search" placeholder="{label('Model / engine code','كود الموديل / المحرك')}"></label>
      <label for="rating">{label('Rating for filter & quote','القدرة للفلترة وطلب السعر')}<select id="rating"><option value="prime">Prime — {label('variable load','حمل متغير')}</option><option value="standby">Standby — {label('backup','طوارئ')}</option></select></label>
      <label for="min-kva">{label('From kVA','من ك.ف.أ')}<input id="min-kva" type="number" min="0" step="any" placeholder="0"></label>
      <label for="max-kva">{label('Up to kVA','حتى ك.ف.أ')}<input id="max-kva" type="number" min="0" step="any" placeholder="{max(float(m['standby']) for m in models):g}"></label>
      <label for="model-sort">{label('Sort capacity','ترتيب القدرة')}<select id="model-sort"><option value="asc">{label('Low to high','من الأقل للأعلى')}</option><option value="desc">{label('High to low','من الأعلى للأقل')}</option></select></label>
      <button type="button" id="reset-filters" class="btn ghost">{label('Reset','إعادة ضبط')}</button>
    </div>
    <p id="result-count" class="note" role="status" aria-live="polite">{len(models)} {label('models','موديل')}</p>
    <div class="scroll"><table id="model-table"><caption class="sr-only">{e(name)} — {e(t['range'])}</caption>
    <thead><tr><th scope="col">{e(t['model'])}</th><th scope="col">{e(t['engine'])}</th><th scope="col">{e(t['alt'])}</th><th scope="col">{e(t['prime'])}</th><th scope="col">{e(t['standby'])}</th><th scope="col">{label('Choose','اختار')}</th></tr></thead>
    <tbody>{rows}</tbody></table></div>
    <p id="no-results" class="avail" hidden>{label('No matching models. Adjust the filters or ask us about a different capacity.','لا توجد موديلات مطابقة. عدّل الفلاتر أو اسألنا عن القدرة المطلوبة.')}</p>
    <p class="note">{e(t['rangeNote'])}</p>
    <div id="comparison" class="comparison" hidden><h3>{label('Your comparison','الموديلات المختارة للمقارنة')}</h3><p id="compare-status" role="status" aria-live="polite"></p><div id="compare-cards" class="compare-cards"></div><button id="clear-compare" class="btn ghost" type="button">{label('Clear comparison','مسح المقارنة')}</button></div>
  </section>
  <section class="detail-grid">
    <div><h2>{e(t['why'].format(brand=name))}</h2><p class="why">{e(WHY[brand][lang])}</p></div>
    <div><h2>{e(t['specs'])}</h2><div class="specs">{spec_html}</div></div>
  </section>
  <section><h2>{label('Services & support','الخدمات والدعم')}</h2><ul class="provided">{provided}</ul></section>
  <section><h2>{e(t['faq'])}</h2><div class="faqs">{faq_html}</div></section>
  <section id="contact" class="enquiry">
    <div><p class="eyebrow">{label('Let’s plan your power','خلينا نجهز احتياجك')}</p><h2>{e(t['quote'])}</h2><p>{label('Choose a model above, or tell us about your project. Our team will help confirm the capacity and configuration.','اختار موديل من فوق أو احكيلنا عن مشروعك. فريقنا يساعدك في تأكيد القدرة والتجهيز المناسب.')}</p><p><a href="tel:+201229688688">+20 122 968 8688</a></p><a href="https://wa.me/201229688688" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></div>
    <div class="contact-form-wrap">{form}<p class="note">{label('We use your details to respond to this enquiry.','نستخدم بياناتك للرد على الاستفسار.')}</p><noscript><p>{label('Please call or use WhatsApp to enquire. Online enquiries require JavaScript.','يرجى الاتصال أو استخدام واتساب. الاستفسار عبر النموذج يحتاج JavaScript.')}</p></noscript></div>
  </section>
</main>
<div class="mobile-quote" id="mobile-quote"><a class="btn solid" href="#contact">{e(t['quote'])}</a><a class="btn ghost" href="#models">{label('Models','الموديلات')}</a></div>
<footer class="foot"><a href="{home}">{e(t['backHome'])}</a><span>Premium Power LLC · {label('40 El Hegaz St, Heliopolis, Cairo','٤٠ شارع الحجاز، مصر الجديدة، القاهرة')}</span><a href="/{cfg['pdf']}" download>{e(t['pdf'])}</a></footer>
<script src="/enquiry-config.js?v=20260908-1" defer></script><script src="/enquiry.js?v=20261025" defer></script><script src="/assets/brand-page.js?v=20261025" defer></script>
</body>
</html>
"""


def main():
    index = read("index.html")
    css = read("assets/brand-page.css")
    trans = translations(index)
    written = []
    for brand, cfg in BRANDS.items():
        models = models_from_pdf(cfg["pdf"])
        copy = brand_copy(index, brand)
        specs = spec_rows(index, brand, trans)
        for lang in ("en", "ar"):
            d = os.path.join(ROOT, cfg["slug"]) if lang == "en" else os.path.join(ROOT, "ar", cfg["slug"])
            os.makedirs(d, exist_ok=True)
            path = os.path.join(d, "index.html")
            with open(path, "w", encoding="utf-8") as f:
                f.write(page(brand, lang, cfg, copy, models, specs, css))
            written.append((os.path.relpath(path, ROOT), len(models)))
    for path, n in written:
        print(f"wrote {path}  ({n} models)")


if __name__ == "__main__":
    main()
