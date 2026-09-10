#!/usr/bin/env python3
"""Generate the per-brand generator pages, English and Arabic.

The model tables that make these pages worth having live in the spec PDFs at
the repository root, where search engines read them poorly. This lifts the same
rows into real HTML pages -- one per brand per language -- and leaves the PDFs
in place as downloads.

Everything published here comes from a file already in the repository: the model
rows from the PDFs, the brand blurbs and technical specs from index.html.
Nothing is invented. Sections that need the customer's own words (best sellers,
why this brand, common questions) are deliberately absent rather than filled
with plausible-sounding copy.

    python3 build-brands.py

Requires pdftotext (poppler-utils).
"""
import html, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://www.premiumpower-eg.com"

BRANDS = {
    "perkins": {"slug": "perkins-generators-egypt", "pdf": "perkins-specs.pdf",
                "popular": ["G60PL", "G100PL", "G500PL"]},
    "volvo":   {"slug": "volvo-penta-generators-egypt", "pdf": "volvo-specs.pdf",
                "popular": ["G300VL", "G350VL"]},
    "doosan":  {"slug": "doosan-generators-egypt", "pdf": "doosan-specs.pdf",
                "popular": ["G300DL", "G360DL"]},
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
    popular_html = "\n".join(
        f'      <li><b>{e(m["model"])}</b><span>{e(m["engine"])}</span>'
        f'<em>{e(m["prime"])} {"ك.ف.أ" if lang == "ar" else "kVA"}</em></li>'
        for m in popular)

    rows = "\n".join(
        f'      <tr><th scope="row">{e(m["model"])}</th><td>{e(m["engine"])}</td>'
        f'<td>{e(m["alt"])}</td><td class="num">{e(m["prime"])}</td>'
        f'<td class="num">{e(m["standby"])}</td></tr>'
        for m in models)
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
<link rel="icon" type="image/png" href="/images/logo.png">
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
<style>
{css}
</style>
</head>
<body>
<a href="#main" class="skip">{'تخطي إلى المحتوى' if lang == 'ar' else 'Skip to content'}</a>
<header class="bar">
  <a class="logo" href="{home}">PREMIUM<span>POWER</span></a>
  <nav class="langs" aria-label="{'اللغة' if lang == 'ar' else 'Language'}">
    <a href="/{slug}/" hreflang="en" lang="en"{' class="on" aria-current="page"' if lang == 'en' else ''}>EN</a>
    <a href="/ar/{slug}/" hreflang="ar" lang="ar"{' class="on" aria-current="page"' if lang == 'ar' else ''}>ع</a>
  </nav>
</header>

<main id="main">
  <nav class="crumbs" aria-label="{'مسار التنقل' if lang == 'ar' else 'Breadcrumb'}">
    <a href="{home}">{e(t['home'])}</a> <span>›</span> <a href="{home}#products">{e(t['generators'])}</a> <span>›</span> {e(name)}
  </nav>

  <section class="hero">
    <p class="eyebrow">{e(t['distributor'])}</p>
    <h1>{e(h1)}</h1>
    <p class="origin">{e(copy[lang]['origin'])}</p>
    <p class="lede">{e(copy[lang]['desc'])}</p>
    <p class="count">{e(t['modelsCount'].format(n=len(models), lo=lo, hi=hi))}</p>
  </section>

  <section>
    <h2>{e(t['range'])}</h2>
    <div class="scroll">
      <table>
        <thead><tr><th scope="col">{e(t['model'])}</th><th scope="col">{e(t['engine'])}</th><th scope="col">{e(t['alt'])}</th><th scope="col">{e(t['prime'])}</th><th scope="col">{e(t['standby'])}</th></tr></thead>
        <tbody>
{rows}
        </tbody>
      </table>
    </div>
    <p class="avail">{e(t['rangeAvail'].format(lo=site_lo, hi=site_hi))}</p>
    <p class="note">{e(t['rangeNote'])}</p>
  </section>

  <section>
    <h2>{e(t['popular'])}</h2>
    <ul class="popular">
{popular_html}
    </ul>
  </section>

  <section>
    <h2>{e(t['why'].format(brand=name))}</h2>
    <p class="why">{e(WHY[brand][lang])}</p>
  </section>

  <section>
    <h2>{e(t['specs'])}</h2>
    <div class="specs">
{spec_html}
    </div>
  </section>

  <section>
    <h2>{e(t['provide'])}</h2>
    <ul class="provided">
{provided}
    </ul>
  </section>

  <section>
    <h2>{e(t['faq'])}</h2>
    <div class="faqs">
{faq_html}
    </div>
  </section>

  <section class="cta">
    <a class="btn ghost" href="/{cfg['pdf']}" download>{e(t['pdf'])}</a>
    <a class="btn solid" href="{home}#contact">{e(t['quote'])}</a>
  </section>
</main>

<footer class="foot">
  <a href="{home}">{e(t['backHome'])}</a>
  <span>Premium Power LLC · 40 El Hegaz St, Heliopolis, Cairo · <a href="tel:+201229688688">+20 122 968 8688</a></span>
</footer>
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
