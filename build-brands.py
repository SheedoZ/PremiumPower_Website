#!/usr/bin/env python3
"""Generate English and Arabic model catalogues with filtering and inline enquiries.
Ratings come from the repository PDFs. Shared form text comes from index.html.
Run python3 build-brands.py after editing source data, template or form copy.
Requires Python 3, Node.js and pdftotext (poppler-utils).
"""
import html, os, re, subprocess, sys
from site_markup import copy_tables, translate
from seo import metadata_html, schema_html, structured_data

ROOT = os.path.dirname(os.path.abspath(__file__))

BRANDS = {
    "perkins": {"slug": "perkins-generators-egypt", "pdf": "perkins-specs.pdf",
                "popular": ["G60PL", "G100PL", "G500PL"], "marque": "Perkins"},
    "volvo":   {"slug": "volvo-penta-generators-egypt", "pdf": "volvo-specs.pdf",
                "popular": ["G300VL", "G350VL"], "marque": "Volvo Penta"},
    "doosan":  {"slug": "doosan-generators-egypt", "pdf": "doosan-specs.pdf",
                "popular": ["G300DL", "G360DL"], "marque": "Doosan"},
}

# Guidance based on the published catalogue; no unsupported engine-wide claims.
WHY = {
    "perkins": {
        "en": "Perkins has the widest Prime rating span in these three catalogues, from 20 to 1000 kVA across 18 models. Compare the engine and alternator codes as well as the kVA rating: different models suit different load requirements. Confirm starting loads, running hours and site conditions with our team before choosing a set.",
        "ar": "تضم بيركنز أوسع نطاق للقدرة المستمرة في الكتالوجات الثلاثة: 18 موديلًا من 20 إلى 1000 ك.ف.أ. قارن كود المحرك والألترنيتور، ثم راجع أحمال بدء التشغيل وساعات العمل وظروف الموقع مع فريقنا قبل الاختيار.",
    },
    "volvo": {
        "en": "The Volvo Penta catalogue lists 13 models from 100 to 700 kVA Prime. Use the table to compare the engine codes and the separate Prime and Standby ratings. For applications with sensitive equipment or large starting loads, ask our team to assess the load profile and control requirements before specifying the generator.",
        "ar": "يعرض كتالوج فولفو بنتا 13 موديلًا من 100 إلى 700 ك.ف.أ لتصنيف Prime. قارن أكواد المحركات وقدرتي Prime وStandby في الجدول. عند وجود معدات حساسة أو أحمال بدء كبيرة، ناقش طبيعة الأحمال ومتطلبات التحكم مع فريقنا قبل تحديد الموديل.",
    },
    "doosan": {
        "en": "The Doosan catalogue covers nine models from 165 to 804 kVA Prime. Each row identifies the engine, alternator and both operating ratings so you can compare a shortlist for your project. If the generator will run for long periods, confirm the duty rating and maintenance schedule against the selected engine documentation.",
        "ar": "يغطي كتالوج دوسان تسعة موديلات من 165 إلى 804 ك.ف.أ لتصنيف Prime. يوضح كل صف كود المحرك والألترنيتور وقدرتي Prime وStandby. إذا كان المولد سيعمل لساعات طويلة، راجع تصنيف التشغيل وجدول الصيانة في وثائق المحرك المختار.",
    },
}

# Copy that has no source in index.html or the PDFs.
UI = {'en': {'dir': 'ltr',
        'home': 'Home',
        'generators': 'Generators',
        'range': 'Model Range',
        'rangeNote': 'Ratings at 50 Hz, 400/230 V, 0.8 power factor. Prime (PRP) is continuous supply at '
                     'variable load for unlimited hours, with 10% overload available for one hour in every '
                     'twelve. Standby (ESP) covers the duration of a utility outage and permits no overload.',
        'model': 'Model',
        'engine': 'Engine',
        'alt': 'Alternator',
        'prime': 'Prime kVA',
        'standby': 'Standby kVA',
        'primeShort': 'Prime (PRP)',
        'standbyShort': 'Standby (ESP)',
        'ratingHelp': 'Prime (PRP): continuous variable-load operation. Standby (ESP): backup power during a '
                      'utility outage.',
        'specs': 'Technical Specifications',
        'provide': 'Supplied With Every Set',
        'pdf': 'Download the full catalogue (PDF)',
        'quote': 'Request a Quote',
        'backHome': 'Back to the main site',
        'distributor': 'Authorized Distributor in Egypt',
        'modelsCount': '{n} models · {lo}–{hi} kVA',
        'why': 'Why {brand}',
        'popular': 'Most Requested',
        'faq': 'Common Questions',
        'rangeAvail': 'The table lists the main models. Ratings from {lo} to {hi} kVA are available; models '
                      'outside the table are supplied to order.',
        'q1': 'What is the difference between the Prime and Standby ratings?',
        'a1': 'Prime (PRP) is continuous supply at variable load for unlimited hours, with a 10% overload '
              'available for one hour in every twelve. Standby (ESP) covers only the duration of a utility '
              'outage and permits no overload. Both figures are listed against every model in the table '
              'above.',
        'q2': 'Which engines are used across the {brand} range?',
        'a2': 'The range is built on these {brand} engines: {engines}. Each one is listed against the rating '
              'it drives in the table above.',
        'q3': 'Which alternator is fitted?',
        'a3': '{alt}, with {ins} insulation and {exc} excitation.',
        'q4': 'Which control panel is supplied?',
        'a4': '{ctrl}. The panel is configured for the application, whether that is a single set, an '
              'automatic transfer scheme or a synchronised installation.'},
 'ar': {'dir': 'rtl',
        'home': 'الرئيسية',
        'generators': 'المولدات',
        'range': 'نطاق الموديلات',
        'rangeNote': 'قيم الكتالوج عند تردد 50 هرتز، وجهد 400/230 فولت، ومعامل قدرة 0.8. تصنيف Prime (PRP) '
                     'للتشغيل المستمر بحمل متغير، مع زيادة حمل 10% لمدة ساعة واحدة خلال كل 12 ساعة. تصنيف '
                     'Standby (ESP) للطوارئ أثناء انقطاع الكهرباء، ولا يسمح بزيادة الحمل.',
        'model': 'الموديل',
        'engine': 'المحرك',
        'alt': 'الألترنيتور',
        'prime': 'قدرة Prime (PRP) (ك.ف.أ)',
        'standby': 'قدرة Standby (ESP) (ك.ف.أ)',
        'primeShort': 'Prime (PRP)',
        'standbyShort': 'Standby (ESP)',
        'ratingHelp': 'Prime (PRP): تشغيل مستمر بأحمال متغيرة. Standby (ESP): قدرة احتياطية أثناء انقطاع '
                      'الكهرباء.',
        'specs': 'المواصفات الفنية',
        'provide': 'يُورَّد مع كل وحدة',
        'pdf': 'تحميل الكتالوج الكامل (PDF)',
        'quote': 'اطلب عرض سعر',
        'backHome': 'العودة للموقع الرئيسي',
        'distributor': 'موزّع معتمد في مصر',
        'modelsCount': '{n} موديل · {lo}–{hi} ك.ف.أ',
        'why': 'لماذا {brand}؟',
        'popular': 'موديلات مختارة',
        'faq': 'أسئلة شائعة',
        'rangeAvail': 'الجدول يعرض الموديلات الأساسية. القدرات من {lo} إلى {hi} ك.ف.أ متاحة، والموديلات خارج '
                      'الجدول تُورَّد حسب الطلب.',
        'q1': 'ما الفرق بين تصنيف Prime (PRP) وتصنيف Standby (ESP)؟',
        'a1': 'Prime (PRP) تصنيف للتشغيل المستمر بحمل متغير، ويسمح بزيادة حمل 10% لمدة ساعة واحدة خلال كل 12 '
              'ساعة. أما Standby (ESP) فيغطي فترة انقطاع الكهرباء ولا يسمح بزيادة الحمل. القيمتان مذكورتان '
              'أمام كل موديل في الجدول أعلاه.',
        'q2': 'ما أكواد المحركات الواردة في كتالوج {brand}؟',
        'a2': 'أكواد المحركات المدرجة هي: {engines}. يظهر كود المحرك أمام كل موديل في الجدول.',
        'q3': 'ما المولد الكهربائي (الألترنيتور) المركّب؟',
        'a3': '{alt}، بعزل {ins} وإثارة {exc}.',
        'q4': 'ما لوحة التحكم المورَّدة؟',
        'a4': '{ctrl}. وتُضبط اللوحة حسب التطبيق، سواء كانت وحدة مفردة أو نظام تحويل أوتوماتيكي أو تركيبة '
              'متزامنة.'}}

# Services already described on the home page, linked back rather than restated.
PROVIDED = {
    "en": [("Turnkey Installation", "#services"), ("Genuine OEM Spare Parts", "#services"),
           ("Maintenance Contracts", "maintenance/"), ("Load Bank Testing", "#services")],
    "ar": [("تركيب متكامل", "#services"), ("قطع غيار أصلية", "#services"),
           ("عقود الصيانة", "maintenance/"), ("اختبار الحمل", "#services")],
}

AR_BRAND_DESCRIPTIONS = {
    "perkins": "تشتهر محركات بيركنز بالموثوقية وكفاءة استهلاك الوقود، وتغطي تطبيقات متنوعة من الطاقة الاحتياطية للمباني إلى تشغيل الأحمال الصناعية الشاقة.",
    "volvo": "تجمع فولفو بنتا بين الدقة الهندسية وأداء موثوق في ظروف التشغيل الشاقة. وتُعرف بسرعة قبولها للأحمال؛ ويعتمد الاختيار على ملف الحمل ومتطلبات التحكم في المشروع.",
    "doosan": "تُستخدم محركات دوسان في تطبيقات التشغيل المستمر، ومنها الإنشاء والتصنيع والمرافق. راجع تصنيف التشغيل وجدول الصيانة في وثائق المحرك المختار.",
}

# Translate descriptive terms while preserving maker names, model codes, and standards.
AR_SPEC_LABELS = {
    "Cylinders": "عدد الأسطوانات",
    "Governor": "منظّم السرعة",
    "Aspiration": "نظام الشحن الهوائي",
    "Cooling": "التبريد",
    "Emissions": "الانبعاثات",
    "Alternator": "الألترنيتور",
    "Insulation": "فئة العزل",
    "Excitation": "طريقة الإثارة",
    "Control": "لوحة التحكم",
}
AR_SPEC_VALUES = {
    "3 – 16 In-Line / V-Type": "3–16 أسطوانة خطية أو على شكل V",
    "6 In-Line": "6 أسطوانات خطية",
    "6 – 12 V-Type": "6–12 أسطوانة على شكل V",
    "Mechanical / Electronic": "ميكانيكي / إلكتروني",
    "Electronic (ECU)": "إلكتروني (ECU)",
    "Turbocharged / Air-to-Air": "شاحن توربيني / تبريد هواء إلى هواء",
    "Turbo + Intercooler": "شاحن توربيني + مبرد هواء الشحن",
    "Turbo + Aftercooler": "شاحن توربيني + مبرد لاحق للهواء",
    "Water Cooled": "مبرد بالماء",
    "Brushless / PMG": "دون فُرش / PMG",
}


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return f.read()


def models_from_pdf(pdf):
    """Pull the rating table out of a spec sheet."""
    out = subprocess.run(["pdftotext", "-enc", "UTF-8", "-layout", os.path.join(ROOT, pdf), "-"],
                         capture_output=True, text=True, encoding="utf-8")
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
    """Read evaluated shared copy, supporting either JS string quote style."""
    tables = copy_tables(index)["T"]
    return {lang: {field.lower(): tables[lang][brand + field]
                   for field in ("Name", "Origin", "Desc")}
            for lang in ("en", "ar")}


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
            if lang == "ar":
                k = AR_SPEC_LABELS.get(key_txt, k)
                v = AR_SPEC_VALUES.get(val_txt, v)
            rows[lang].append((k, v))
    if not rows["en"]:
        sys.exit(f"no spec rows parsed for {brand}")
    return rows


def translations(index):
    """Read the same translation objects used by the homepage builder."""
    return copy_tables(index)["T"]


def text_html(value, lang):
    """Escape page copy and isolate Latin terms/codes inside Arabic text."""
    parts = re.split(r"([A-Za-z0-9][A-Za-z0-9._+-]*)", str(value))
    return "".join(
        f'<bdi dir="ltr">{html.escape(part)}</bdi>' if lang == "ar" and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._+-]*", part)
        else html.escape(part)
        for part in parts
    )


def page(brand, lang, cfg, copy, models, specs, css):
    t, e = UI[lang], html.escape
    # "Perkins Series" / "سلسلة بيركنز" reads as a product line on the home page, but
    # the term buyers actually search is the bare marque.
    name = re.sub(r"^\s*سلسلة\s+|\s+Series\s*$", "", copy[lang]["name"]).strip()
    primes = [float(m["prime"]) for m in models]
    standbys = [float(m["standby"]) for m in models]
    lo, hi = f"{min(primes):g}", f"{max(primes):g}"
    standby_lo, standby_hi = f"{min(standbys):g}", f"{max(standbys):g}"
    slug = cfg["slug"]
    home = "/ar/" if lang == "ar" else "/"
    maintenance_url = f"{home}maintenance/"
    privacy_url = f"{home}privacy/"

    if lang == "ar":
        h1 = f"مولدات {name} الديزل في مصر"
    else:
        h1 = f"{name} Diesel Generators in Egypt"

    # This general size span is separate from the catalogue's Prime and Standby tables.
    span = re.findall(r"([\d,]+)\s*(?:KVA|ك\.ف\.أ)", copy[lang]["origin"])
    supply_lo, supply_hi = (span + [lo, hi])[:2] if len(span) >= 2 else (lo, hi)

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
        (t["q3"], t["a3"].format(alt=spec_val("Alternator", "الألترنيتور"), ins=spec_val("Insulation", "فئة العزل"), exc=spec_val("Excitation", "طريقة الإثارة"))),
        (t["q4"], t["a4"].format(ctrl=spec_val("Control", "لوحة التحكم"))),
    ]
    faq_html = "\n".join(
        f'      <details><summary>{text_html(q, lang)}</summary><p>{text_html(a, lang)}</p></details>'
        for q, a in faqs)

    by_model = {m["model"]: m for m in models}
    popular = [by_model[c] for c in cfg.get("popular", []) if c in by_model]
    ar = lang == 'ar'
    def label(en, ar_text): return ar_text if ar else en
    popular_html = "\n".join(
        f'<li><span class="eyebrow">{e(cfg["marque"])}</span><b><a dir="ltr" href="#model-{e(m["model"])}">{e(m["model"])}</a></b>'
        f'<span dir="ltr">{e(m["engine"])}</span><em>{e(m["prime"])} {label("kVA", "ك.ف.أ")} <small>{text_html(t["primeShort"], lang)}</small></em>'
        f'<span>{e(m["standby"])} {text_html(t["standbyShort"], lang)} {label("kVA", "ك.ف.أ")}</span>'
        f'<button type="button" class="btn ghost" data-quote="{e(m["model"])}">{e(t["quote"])}</button></li>'
        for m in popular)
    rows = "\n".join(
        f'<tr id="model-{e(m["model"])}" data-model="{e(m["model"])}" data-engine="{e(m["engine"])}" data-alt="{e(m["alt"])}" data-prime="{e(m["prime"])}" data-standby="{e(m["standby"])}">'
        f'<th scope="row" dir="ltr">{e(m["model"])}</th><td data-label="{e(t["engine"])}"><bdi>{e(m["engine"])}</bdi></td>'
        f'<td data-label="{e(t["alt"])}"><bdi>{e(m["alt"])}</bdi></td><td data-label="{e(t["prime"])}">{e(m["prime"])}</td>'
        f'<td data-label="{e(t["standby"])}">{e(m["standby"])}</td><td class="model-actions">'
        f'<button type="button" class="btn solid" data-quote="{e(m["model"])}">{e(t["quote"])}</button>'
        f'<label><input type="checkbox" class="compare-check" value="{e(m["model"])}"> {label("Compare","قارن")} <span class="sr-only">{e(m["model"])}</span></label></td></tr>'
        for m in models)
    source=read('_src/home.html')
    form=re.search(r'<form id="contact-form".*?</form>',source,re.S).group(0)
    form=form.replace('event.preventDefault(); app.submitForm(event)','window.PremiumPowerEnquiry.submitForm(event)')
    form=translate(form,copy_tables(source)['T'][lang])
    brand_nav=''.join(f'<a href="{home}{v["slug"]}/"'+(' aria-current="page"' if k==brand else '')+f'>{e(v["marque"])}</a>' for k,v in BRANDS.items())
    spec_html = "\n".join(f'      <div class="spec-row"><span>{text_html(k, lang)}</span><b>{text_html(v, lang)}</b></div>'
                          for k, v in specs[lang])
    provided = "\n".join(f'      <li><a href="{home}{href}">{e(label)}</a></li>'
                         for label, href in PROVIDED[lang])

    return f"""<!DOCTYPE html>
<html lang="{lang}" dir="{t['dir']}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
{metadata_html(brand, lang, models)}
<meta name="theme-color" content="#003087">
<link rel="icon" type="image/png" href="/images/favicon.png">
<link rel="stylesheet" href="/assets/company-logo.css?v=20261029-1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
{schema_html(structured_data(brand, lang, faqs, models))}
<link rel="stylesheet" href="/assets/brand-page.css?v=20261028-2">
<link rel="stylesheet" href="/assets/enquiry.css?v=20261028">
</head>
<body data-brand="{e(cfg['marque'])}">
<a href="#main" class="skip">{label('Skip to content','تخطي إلى المحتوى')}</a>
<header class="bar">
  <a class="logo pp-brand" href="{home}" aria-label="Premium Power"><img class="pp-brand-mark pp-logo-color" src="/images/premium-power-logo-color.webp" width="720" height="223" alt="Premium Power" fetchpriority="high" decoding="async"></a>
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
      <div class="hero-facts"><span><b>{len(models)}</b>{label('catalogue models','موديل في الكتالوج')}</span><span><b dir="ltr">{lo}–{hi}</b><small class="hero-rating">{text_html(label('kVA · Prime','ك.ف.أ · Prime'), lang)} · <bdi dir="ltr">50 Hz</bdi></small></span></div>
      <div class="cta"><a href="#models" class="btn solid">{label('Find your model','اختر الموديل المناسب')}</a><a class="btn ghost" href="#contact" data-general-quote>{e(t['quote'])}</a><a class="btn ghost" href="{maintenance_url}">{label('Maintenance support','خدمات الصيانة والعقود')}</a></div>
      <a class="download" href="/{cfg['pdf']}" download>{e(t['pdf'])} ↓</a>
    </div>
    <figure class="hero-photo"><img src="/images/gallery/gen_1.webp" width="1000" height="671" fetchpriority="high" alt="{label('Enclosed generator from the Premium Power gallery','مولد بكابينة من معرض بريميوم باور')}"><figcaption>{label('From our generator gallery. Configuration depends on the selected model.','من معرض مولداتنا — التجهيز النهائي حسب الموديل المختار.')}</figcaption></figure>
  </section>
  <nav class="brand-nav" aria-label="{label('Generator brands','ماركات المولدات')}">{brand_nav}</nav>
  <p class="avail">{text_html(t['rangeAvail'].format(lo=supply_lo, hi=supply_hi), lang)}</p>
  <section>
    <p class="eyebrow">{label('A place to start','نقطة بداية')}</p>
    <h2>{label('Explore the range','استكشف الموديلات')}</h2>
    <ul class="popular">{popular_html}</ul>
  </section>
  <section id="models">
    <div class="section-heading"><div><p class="eyebrow">{label('Compare. Choose. Enquire.','قارن. اختر. استفسر.')}</p><h2>{e(t['range'])}</h2></div><a href="#contact" data-general-quote>{label('Not sure which size? Ask our team →','لست متأكدًا من القدرة المناسبة؟ تواصل مع فريقنا ←')}</a></div>
    <div id="model-tools" class="filters" hidden>
      <label for="model-search">{label('Search model or engine','ابحث بالموديل أو المحرك')}<input id="model-search" type="search" placeholder="{label('Model / engine code','كود الموديل / المحرك')}"></label>
      <label for="rating">{text_html(label('Prime / Standby rating','تصنيف Prime / Standby'), lang)}<select id="rating" aria-describedby="rating-help"><option value="prime">{text_html(t['primeShort'], lang)}</option><option value="standby">{text_html(t['standbyShort'], lang)}</option></select></label>
      <label for="min-kva">{label('From kVA','من ك.ف.أ')}<input id="min-kva" type="number" min="0" step="any" placeholder="0"></label>
      <label for="max-kva">{label('Up to kVA','حتى ك.ف.أ')}<input id="max-kva" type="number" min="0" step="any" placeholder="{max(float(m['standby']) for m in models):g}"></label>
      <label for="model-sort">{label('Sort capacity','ترتيب القدرة')}<select id="model-sort"><option value="asc">{label('Low to high','من الأقل للأعلى')}</option><option value="desc">{label('High to low','من الأعلى للأقل')}</option></select></label>
      <button type="button" id="reset-filters" class="btn ghost">{label('Reset','إعادة ضبط')}</button>
      <p id="rating-help" class="rating-help">{text_html(t['ratingHelp'], lang)}</p>
    </div>
    <p id="result-count" class="note" role="status" aria-live="polite">{len(models)} {label('models','موديل')}</p>
    <div class="scroll"><table id="model-table"><caption class="sr-only">{e(name)} — {e(t['range'])}</caption>
    <thead><tr><th scope="col">{e(t['model'])}</th><th scope="col">{e(t['engine'])}</th><th scope="col">{e(t['alt'])}</th><th scope="col">{text_html(t['prime'], lang)}</th><th scope="col">{text_html(t['standby'], lang)}</th><th scope="col">{label('Choose','اختر')}</th></tr></thead>
    <tbody>{rows}</tbody></table></div>
    <p id="no-results" class="avail" hidden>{label('No matching models. Adjust the filters or ask us about a different capacity.','لا توجد موديلات مطابقة. عدّل الفلاتر أو اسألنا عن القدرة المطلوبة.')}</p>
    <p class="note">{text_html(t['rangeNote'], lang)}</p>
    <div id="comparison" class="comparison" hidden><h3>{label('Your comparison','الموديلات المختارة للمقارنة')}</h3><p id="compare-status" role="status" aria-live="polite"></p><div id="compare-cards" class="compare-cards"></div><button id="clear-compare" class="btn ghost" type="button">{label('Clear comparison','مسح المقارنة')}</button></div>
  </section>
  <section class="detail-grid">
    <div><h2>{label("Choosing a " + name + " generator", "اختيار مولد " + name)}</h2><p class="why">{text_html(WHY[brand][lang], lang)}</p></div>
    <div><h2>{e(t['specs'])}</h2><div class="specs">{spec_html}</div></div>
  </section>
  <section><h2>{label('Services & support','الخدمات والدعم')}</h2><ul class="provided">{provided}</ul><p class="note"><a href="{home}#calculator">{label('Estimate your required generator capacity','احسب قدرة المولد المطلوبة مبدئيًا')}</a> · <a href="{home}#contact">{label('Discuss installation and site requirements','ناقش متطلبات الموقع والتركيب')}</a> · <a href="{maintenance_url}">{label('Maintenance services and contracts','خدمات وعقود الصيانة')}</a></p></section>
  <section><h2>{e(t['faq'])}</h2><div class="faqs">{faq_html}</div></section>
  <section id="contact" class="enquiry">
    <div><p class="eyebrow">{label('Let’s plan your power','لنحدد احتياجك من الطاقة')}</p><h2>{e(t['quote'])}</h2><p>{label('Choose a model above, or tell us about your project. Our team will help confirm the capacity and configuration.','اختر موديلًا من الجدول أو أخبرنا عن مشروعك. يساعدك فريقنا على تأكيد القدرة والتجهيز المناسبين.')}</p><p><a href="tel:+201229688688" dir="ltr">01229 688 688</a></p><a href="https://wa.me/201229688688" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></div>
    <div class="contact-form-wrap">{form}<p class="note">{label('We use your details to respond to this enquiry.','نستخدم البيانات التي تقدمها للرد على استفسارك.')} <a href="{privacy_url}">{label('Privacy notice','إشعار الخصوصية')}</a></p><noscript><p>{label('Please call or use WhatsApp to enquire. Online enquiries require JavaScript.','يرجى الاتصال أو مراسلتنا عبر واتساب. الاستفسار عبر النموذج يحتاج JavaScript.')}</p></noscript></div>
  </section>
</main>
<div class="mobile-quote" id="mobile-quote"><a class="btn solid" href="#contact">{e(t['quote'])}</a><a class="btn ghost" href="#models">{label('Models','الموديلات')}</a><a class="btn ghost" id="view-comparison" href="#comparison" hidden>{label('View comparison','عرض المقارنة')}</a></div>
<footer class="foot"><a href="{home}">{e(t['backHome'])}</a><a href="{maintenance_url}">{label('Maintenance support','خدمات الصيانة والعقود')}</a><a href="{privacy_url}">{label('Privacy notice','إشعار الخصوصية')}</a><span>Premium Power LLC · {label('40 El Hegaz St, Heliopolis, Cairo','٤٠ شارع الحجاز، مصر الجديدة، القاهرة')}</span><a href="/{cfg['pdf']}" download>{e(t['pdf'])}</a></footer>
<script src="/enquiry-config.js?v=20260908-1" defer></script><script src="/enquiry.js?v=20261029-1" defer></script><script src="/assets/brand-page.js?v=20261028-2" defer></script>
</body>
</html>
"""


def main():
    index = read("_src/home.html")
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
