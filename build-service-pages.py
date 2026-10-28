#!/usr/bin/env python3
"""Build maintenance and enquiry-privacy pages from shared site identity and forms."""
import re
from html import escape
from seo import ROOT, SITE, metadata_html, metadata, schema_html, structured_data
from site_markup import copy_tables, translate

COPY = {
    "en": {
        "home": "Home", "maintenance": "Generator maintenance", "privacy": "Enquiry privacy",
        "hero": "Generator maintenance and service in Egypt",
        "intro": "Plan maintenance for an existing generator or ask our team to assess a service issue. Tell us about your equipment and site so we can confirm the next step.",
        "contract": "Plan a maintenance contract", "service": "Service an existing generator",
        "contractText": "Discuss a planned visit schedule for one generator or several sites. The quotation will identify the checks, reports and support included.",
        "serviceText": "Share the generator make, capacity or current issue if known. Our team will review the request and confirm the assessment and work required.",
        "contractCTA": "Request a contract assessment", "serviceCTA": "Request a service assessment",
        "scopeTitle": "Agree the scope before work begins",
        "scopeIntro": "The assessment helps identify which checks and work are appropriate for the equipment. The agreed scope may cover:",
        "scope": [("Engine and fluids", "Condition checks, fluid levels and service requirements."),
                  ("Cooling and starting", "Cooling system, battery condition and starting-system checks."),
                  ("Controls and operation", "Control-panel indications, operating conditions and reported faults."),
                  ("Testing and reports", "Confirm whether operational or load testing and a service report are required.")],
        "termsTitle": "Compare the contract terms",
        "terms": "Ask for the visit schedule, covered equipment, consumables and parts, exclusions, reporting, and emergency-response arrangements in writing. Response times and availability are confirmed for your location and agreement; submitting a form does not book a visit.",
        "stepsTitle": "From enquiry to agreed work",
        "steps": [("Describe the equipment", "Share the site and the equipment details you have."),
                  ("Confirm the assessment", "We review the request and clarify the scope and access requirements."),
                  ("Review the quotation", "Check the work, parts, schedule and terms before accepting."),
                  ("Agree the visit", "Coordinate site access and the agreed service and reporting.")],
        "faqTitle": "Maintenance questions",
        "faqs": [("Can I enquire without knowing the model?", "Yes. Share what you know about the equipment and site. The team can ask for additional details before confirming the scope."),
                 ("Are parts and consumables included?", "The quotation or maintenance agreement defines which parts, consumables and labour are included and which are priced separately."),
                 ("Does a request guarantee an emergency visit?", "No visit or response time is booked by this form. For a current fault, call the team to discuss availability, your location and the next step."),
                 ("Can I request a contract for several generators?", "Yes. Include the number of generators and sites if known so the team can assess the scope.")],
        "contactTitle": "Request a maintenance assessment",
        "contactText": "The basic contact fields are enough to start. Equipment details are optional and help us prepare the follow-up.",
        "fallback": "Prefer to speak to the team?", "call": "Call 012 2968 8688",
        "formNotice": "Your enquiry is sent through Formspree to help us assess and respond to your request.",
        "readPrivacy": "How enquiry data is handled", "nojs": "Online enquiries require JavaScript. Please call or use WhatsApp.",
        "privacyIntro": "This page explains the information submitted through Premium Power's website enquiry forms.",
        "privacySections": [
            ("What you provide", "The form asks for your name, phone number, project location, enquiry type and message. It can include the selected generator and rating or maintenance plan, the page language, and any optional project or equipment details you choose to add."),
            ("How an enquiry is received", "When you submit the form, these details are sent to Formspree, the service used to receive and store submissions and send notifications. Premium Power uses the enquiry to assess your request and contact you."),
            ("Other website services", "Pages are hosted on GitHub Pages. Some pages load Google Fonts, Google Maps or illustrative images from Unsplash. These providers receive the technical information needed to serve their content. Following phone, WhatsApp or other external links uses the selected provider's service."),
            ("Questions about your information", "Contact info@premiumpower-eg.com for questions about information you have submitted, including retention, correction or deletion. This page does not specify a company-wide retention period."),
        ],
        "formspree": "Read Formspree's privacy policy", "back": "Back to the website",
        "address": "40 El Hegaz St, Heliopolis, Cairo", "sales": "Explore generator models",
    },
    "ar": {
        "home": "الرئيسية", "maintenance": "صيانة المولدات", "privacy": "خصوصية الاستفسارات",
        "hero": "صيانة المولدات وخدماتها في مصر",
        "intro": "خطط لصيانة مولدك الحالي أو اطلب تقييمًا لمشكلة تشغيل. أخبرنا بالمعلومات المتاحة عن المعدات والموقع لنحدد معك الخطوة المناسبة.",
        "contract": "تخطيط عقد صيانة", "service": "صيانة مولد قائم",
        "contractText": "ناقش جدول زيارات لمولد واحد أو عدة مواقع. يحدد عرض السعر الفحوص والتقارير والدعم المشمول.",
        "serviceText": "اذكر الماركة والقدرة أو المشكلة الحالية إن كانت معروفة. يراجع الفريق الطلب ويؤكد التقييم والعمل المطلوب.",
        "contractCTA": "اطلب تقييمًا لعقد صيانة", "serviceCTA": "اطلب تقييمًا لصيانة مولد",
        "scopeTitle": "اتفاق واضح على نطاق العمل",
        "scopeIntro": "يساعد التقييم في تحديد الفحوص والأعمال المناسبة للمعدات. قد يشمل النطاق المتفق عليه:",
        "scope": [("المحرك والسوائل", "فحص الحالة ومستويات السوائل ومتطلبات الخدمة."),
                  ("التبريد وبدء التشغيل", "فحص نظام التبريد وحالة البطارية ونظام بدء التشغيل."),
                  ("التحكم والتشغيل", "مؤشرات لوحة التحكم وظروف التشغيل والأعطال المبلغ عنها."),
                  ("الاختبارات والتقارير", "تحديد الحاجة لاختبار التشغيل أو الحمل وتقرير الخدمة.")],
        "termsTitle": "راجع بنود عقد الصيانة",
        "terms": "اطلب توضيح جدول الزيارات والمعدات المشمولة والمستهلكات وقطع الغيار والاستثناءات والتقارير وترتيبات الاستجابة للطوارئ كتابةً. يُؤكد زمن الاستجابة والتوافر وفق الموقع والاتفاق؛ إرسال النموذج لا يحجز زيارة.",
        "stepsTitle": "من الاستفسار إلى العمل المتفق عليه",
        "steps": [("وصف المعدات", "شارك بيانات الموقع والمعدات المتاحة لديك."),
                  ("تأكيد التقييم", "نراجع الطلب ونوضح نطاقه ومتطلبات الوصول للموقع."),
                  ("مراجعة عرض السعر", "راجع العمل والقطع والجدول والشروط قبل القبول."),
                  ("تنسيق الزيارة", "نتفق على دخول الموقع والخدمة والتقرير المطلوبين.")],
        "faqTitle": "أسئلة عن الصيانة",
        "faqs": [("هل يمكنني الاستفسار دون معرفة الموديل؟", "نعم. شارك ما تعرفه عن المعدات والموقع، ويمكن للفريق طلب بيانات إضافية قبل تأكيد نطاق العمل."),
                 ("هل يشمل العقد قطع الغيار والمستهلكات؟", "يحدد عرض السعر أو عقد الصيانة القطع والمستهلكات وأعمال الصيانة المشمولة والبنود التي تُسعّر منفصلة."),
                 ("هل يضمن إرسال الطلب زيارة طارئة؟", "إرسال النموذج لا يحجز زيارة أو زمن استجابة. إذا كان لديك عطل قائم، اتصل بالفريق لمناقشة التوافر والموقع والخطوة المناسبة."),
                 ("هل يمكن طلب عقد لعدة مولدات؟", "نعم. أضف عدد المولدات والمواقع إن كان معروفًا ليساعد الفريق في تقييم النطاق.")],
        "contactTitle": "اطلب تقييمًا للصيانة",
        "contactText": "تكفي بيانات التواصل الأساسية لبدء الطلب. تفاصيل المعدات اختيارية وتساعدنا في تجهيز المتابعة.",
        "fallback": "تفضل التحدث مع الفريق؟", "call": "اتصل على 012 2968 8688",
        "formNotice": "يُرسل استفسارك عبر Formspree لمساعدتنا في تقييم الطلب والرد عليك.",
        "readPrivacy": "كيفية التعامل مع بيانات الاستفسار", "nojs": "الاستفسار عبر النموذج يحتاج JavaScript. يرجى الاتصال أو استخدام واتساب.",
        "privacyIntro": "توضح هذه الصفحة المعلومات التي تُرسل عبر نماذج الاستفسار في موقع بريميوم باور.",
        "privacySections": [
            ("البيانات التي تقدمها", "يطلب النموذج اسمك ورقم هاتفك وموقع المشروع ونوع الاستفسار ورسالتك. وقد يشمل المولد المختار وتصنيف قدرته أو باقة الصيانة ولغة الصفحة، وأي تفاصيل اختيارية تضيفها عن المشروع أو المعدات."),
            ("كيفية استقبال الاستفسار", "عند إرسال النموذج، تنتقل هذه البيانات إلى Formspree، وهي الخدمة المستخدمة لاستقبال الاستفسارات وتخزينها وإرسال الإشعارات. تستخدم بريميوم باور الاستفسار لتقييم طلبك والتواصل معك."),
            ("الخدمات الأخرى في الموقع", "تُستضاف الصفحات على GitHub Pages. تحمل بعض الصفحات خطوط Google Fonts أو خرائط Google Maps أو صورًا توضيحية من Unsplash. يستقبل مقدمو هذه الخدمات المعلومات التقنية اللازمة لعرض محتواهم. وتستخدم روابط الاتصال وواتساب والروابط الخارجية خدمة الجهة التي تختارها."),
            ("الاستفسار عن معلوماتك", "تواصل عبر info@premiumpower-eg.com للسؤال عن المعلومات التي قدمتها، بما في ذلك الاحتفاظ بها أو تصحيحها أو حذفها. لا تحدد هذه الصفحة مدة احتفاظ موحدة للشركة."),
        ],
        "formspree": "اقرأ سياسة خصوصية Formspree", "back": "العودة إلى الموقع",
        "address": "٤٠ شارع الحجاز، مصر الجديدة، القاهرة", "sales": "تصفح موديلات المولدات",
    },
}

def form_markup(lang):
    source = (ROOT / "_src/home.html").read_text(encoding="utf-8")
    form = re.search(r'<form id="contact-form".*?</form>', source, re.S).group(0)
    form = form.replace('event.preventDefault(); app.submitForm(event)', 'window.PremiumPowerEnquiry.submitForm(event)')
    form = translate(form, copy_tables(source)["T"][lang])
    form = re.sub(r'(<option value="sales")[^>]*>', r'\1>', form)
    form = re.sub(r'(<option value="maintenance"[^>]*)(>)', r'\1 selected\2', form)
    return form

def page(key, lang):
    t = COPY[lang]
    home = "/ar/" if lang == "ar" else "/"
    e = escape
    call_label = e(t["call"]).replace("012 2968 8688", '<bdi dir="ltr">012 2968 8688</bdi>')
    faqs = t["faqs"] if key == "maintenance" else []
    schema = structured_data(key, lang, faqs)
    if key == "maintenance":
        schema["@graph"].append({"@type": "Service", "@id": SITE + home + "maintenance/#service",
            "name": t["maintenance"], "serviceType": t["maintenance"],
            "provider": {"@id": SITE + "/#organization"}})
        for node in schema["@graph"]:
            if node.get("@type") == "WebPage":
                node["about"] = {"@id": SITE + home + "maintenance/#service"}
        cards = "".join(f'<article class="scope-card"><h3>{e(title)}</h3><p>{e(text)}</p></article>' for title, text in t["scope"])
        steps = "".join(f'<li><h3>{e(title)}</h3><p>{e(text)}</p></li>' for title, text in t["steps"])
        faq = "".join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in faqs)
        content = f'''
<section class="service-hero"><p class="eyebrow">Premium Power · {e(t["maintenance"])}</p><h1>{e(t["hero"])}</h1><p class="lead">{e(t["intro"])}</p>
<div class="hero-actions"><a class="btn solid" href="#request">{e(t["contactTitle"])}</a><a class="btn ghost" href="{home}#products">{e(t["sales"])}</a></div></section>
<section class="service-paths" aria-label="{e(t["maintenance"])}">
<article><h2>{e(t["contract"])}</h2><p>{e(t["contractText"])}</p><a class="btn solid" href="#request" data-service-purpose="contract">{e(t["contractCTA"])}</a></article>
<article><h2>{e(t["service"])}</h2><p>{e(t["serviceText"])}</p><a class="btn solid" href="#request" data-service-purpose="service">{e(t["serviceCTA"])}</a></article></section>
<section><h2>{e(t["scopeTitle"])}</h2><p>{e(t["scopeIntro"])}</p><div class="scope-grid">{cards}</div></section>
<section class="terms"><h2>{e(t["termsTitle"])}</h2><p>{e(t["terms"])}</p></section>
<section><h2>{e(t["stepsTitle"])}</h2><ol class="service-steps">{steps}</ol></section>
<section><h2>{e(t["faqTitle"])}</h2><div class="faqs">{faq}</div></section>
<section id="request"><div id="contact" class="enquiry"><div><h2>{e(t["contactTitle"])}</h2><p>{e(t["contactText"])}</p><p>{e(t["fallback"])}</p><p><a href="tel:+201229688688">{call_label}</a></p><a href="https://wa.me/201229688688" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></div>
<div class="contact-form-wrap">{form_markup(lang)}<p class="note">{e(t["formNotice"])} <a href="{home}privacy/">{e(t["readPrivacy"])}</a></p><noscript><p>{e(t["nojs"])}</p></noscript></div></div></section>'''
        scripts = '<script src="/enquiry-config.js?v=20260908-1" defer></script><script src="/enquiry.js?v=20261028-2" defer></script><script src="/assets/service-page.js?v=20261028" defer></script>'
    else:
        sections = "".join(f'<section><h2>{e(title)}</h2><p>{e(text)}</p></section>' for title, text in t["privacySections"])
        content = f'<section class="service-hero"><p class="eyebrow">Premium Power</p><h1>{e(t["privacy"])}</h1><p class="lead">{e(t["privacyIntro"])}</p></section>{sections}<p><a href="https://formspree.io/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">{e(t["formspree"])}</a></p><p><a href="mailto:info@premiumpower-eg.com">info@premiumpower-eg.com</a></p>'
        scripts = ""
    return f'''<!DOCTYPE html>
<html lang="{lang}" dir="{"rtl" if lang == "ar" else "ltr"}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
{metadata_html(key, lang)}<meta name="theme-color" content="#003087"><link rel="icon" type="image/png" href="/images/favicon.png">
<link rel="stylesheet" href="/assets/company-logo.css?v=20261028-2">
<link rel="stylesheet" href="/assets/brand-page.css?v=20261028-2"><link rel="stylesheet" href="/assets/service-page.css?v=20261028-2"><link rel="stylesheet" href="/assets/enquiry.css?v=20261028">
{schema_html(schema)}</head>
<body class="service-page"><a class="skip" href="#main">{e("انتقل إلى المحتوى" if lang == "ar" else "Skip to content")}</a>
<header class="bar"><a class="logo pp-brand" href="{home}" aria-label="Premium Power"><img class="pp-brand-mark pp-logo-color" src="/images/premium-power-logo-color.webp" width="720" height="223" alt="Premium Power" fetchpriority="high" decoding="async"></a><nav class="langs" aria-label="{e("اللغة" if lang == "ar" else "Language")}"><a href="/{key}/" lang="en" hreflang="en" {"aria-current='page'" if lang == "en" else ""}>English</a><a href="/ar/{key}/" lang="ar" hreflang="ar" {"aria-current='page'" if lang == "ar" else ""}>العربية</a></nav></header>
<main id="main" class="wrap"><nav class="service-nav" aria-label="{e("التنقل" if lang == "ar" else "Navigation")}"><a href="{home}">{e(t["home"])}</a><a href="{home}#products">{e(t["sales"])}</a><a href="{home}maintenance/">{e(t["maintenance"])}</a></nav>{content}</main>
<footer class="foot"><a href="{home}">{e(t["back"])}</a><span>Premium Power LLC · {e(t["address"])}</span><a href="tel:+201229688688" dir="ltr">+20 122 968 8688</a><a href="{home}privacy/">{e(t["privacy"])}</a></footer>{scripts}</body></html>
'''

def main():
    for key in ("maintenance", "privacy"):
        for lang in ("en", "ar"):
            folder = ROOT / ("ar" if lang == "ar" else "") / key
            folder.mkdir(parents=True, exist_ok=True)
            (folder / "index.html").write_text(page(key, lang), encoding="utf-8")
            print(f"wrote {folder.relative_to(ROOT)}/index.html")

if __name__ == "__main__":
    main()
