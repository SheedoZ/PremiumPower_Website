(function(){
'use strict';

// ── State ────────────────────────────────────────────────────────
let lang = 'en';
let scrollTick = false;

// ── Translations ─────────────────────────────────────────────────
const T = {
en:{
  pageTitle:"Diesel Generators in Egypt | Premium Power",
  regionName8:"Nationwide",
  regionName7:"North Coast",
  regionName6:"Menoufia",
  regionName5:"New Capital",
  regionName4:"Minia Desert",
  regionName3:"Alexandria",
  regionName2:"Giza",
  regionName1:"Cairo",
  heroWarrantyValue:"1 Year",
  heroMaxOutput:"KVA MAX OUTPUT",
  pageTitle:"Diesel Generators in Egypt | Premium Power",
  perkinsModels:"Perkins models & ratings",
  volvoModels:"Volvo Penta models & ratings",
  doosanModels:"Doosan models & ratings",
  skipNav:"Skip to main content",
  heroTag:"Authorized Dealer — Egypt",
  heroLine1:"DIESEL",heroLine2:"GENERATORS",heroLine3:"EGYPT",
  heroSub:"Engineering-grade generator solutions from 8 KVA to 3000 KVA. Perkins, Volvo Penta & Doosan — with professional installation and 24/7 support.",
  heroCardTitle:"Power Range",engine:"Engine",alternator:"Alternator",heroSupport:"Support",heroWarranty:"Warranty",
  scrollHint:"Scroll",
  btnFindGen:"Find Your Generator",btnContact:"Get in Touch",btnQuote:"Get Quote",btnGeneratorQuote:"Request a Generator Quote",btnMaintenanceAssessment:"Explore maintenance services",
  navClients:"Clients",navProducts:"Generators",navCalc:"Calculator",navProjects:"Projects",navContact:"Contact",navHome:"Home",navServices:"Services",navPortfolio:"Portfolio",navLocations:"Locations",navVision:"About Us",navAMC:"Maintenance",navSpecs:"Tech Specs",navFuel:"Fuel Systems",navCerts:"Certifications",navCert:"Certifications",
  stat1:"Projects Completed",stat2:"Years Experience",stat3:"Active Contracts",stat4:"Uptime Guarantee",
  stat1Desc:"Compare models and request a quotation for your project.",
  stat2Desc:"Explore maintenance options and request an assessment for your site.",
  navMainLabel:"Main navigation",
  navLogoLabel:"Premium Power home",
  navToggleLabel:"Open navigation menu",
  mobileNavLabel:"Navigation menu",
  mobileCloseLabel:"Close navigation menu",
  contactOptionsLabel:"Contact options",
  ctaGroupLabel:"Sales and maintenance enquiry options",
  soundCompareLabel:"Generator enclosure configuration",
  pdfCloseLabel:"Close specification preview",
  pdfPreviewLabel:"PDF specification preview",
  pdfOpenNewTab:"Open PDF in new tab",
  privacyLink:"Read the privacy notice",
  maintenanceLink:"Maintenance services",
  gallerySub:"Reference images show generator equipment; model appearance and configuration may vary.",
  projectsSub:"Illustrative application types only; these cards do not describe completed projects.",
  scopeNote:"Requested documents, tests, site access and safety requirements should be listed in the written scope.",
  client9:"Concord EC",
  client10:"Metito",
  client11:"Pearls",
  client12:"SODIC",
  client13:"UpWyde",
  client14:"Major for Decoration",
  client15:"SCZone",
  client16:"Menoufia University",
  client17:"NOWPASD",
  client18:"Olive Land",
  client19:"Gnena for Agriculture",
  client20:"Mudon for Agriculture",
  client21:"HA Trading",
  client22:"Sumuo",
  client23:"Gama Works",
  client24:"Ceramica Cleopatra",
  client25:"Defacto",
  sec1D:"Brand, model or part number if known.",
  sec2D:"Location, access and connection details.",
  sec3D:"Load, running pattern or the issue to be addressed.",
  fuelTag1:"500 L – 30,000 L",
  fuelTag2:"Single & Double Wall",
  fuelTag3:"Anti-corrosion coating",
  fuelTag4:"Schedule 40 / 80",
  fuelTag5:"Seamless steel",
  fuelTag6:"Full valve set",
  fuelTag7:"Auto transfer",
  fuelTag8:"Float switches",
  fuelTag9:"Level indicators",
  specCooling:"Cooling",
  specWaterCooled:"Water cooled",
  specEmissions:"Emissions",
  specStage:"Stage II / IIIA",
  specAlternator:"Alternator",
  specInsulation:"Insulation",
  specExcitation:"Excitation",
  specBrushlessPmg:"Brushless / PMG",
  specControl:"Control",
  spec4Stroke:"4-stroke diesel",
  certBadge1:"Model",
  certBadge2:"Scope",
  certBadge3:"Testing",
  certBadge4:"Site",
  footerAMC:"Maintenance services",
  privacyFooter:"Privacy notice",
  soundConfigNote:"Illustrative configuration comparison only; no measured sound levels are shown.",
  specPerkinsLabel:"Perkins specifications",
  specVolvoPentaLabel:"Volvo Penta specifications",
  specDoosanLabel:"Doosan specifications",
  serviceDirect:'Direct call',
  clientsLabel:"Our Clients",clientsTitle:"TRUSTED BY\nEGYPT'S LEADERS",clientsSub:"Powering critical operations across healthcare, manufacturing, infrastructure, and real estate.",
  client1:"Egyptian Ambulance Organization",client2:"Canal For Sugar",client3:"Upwyde — Cinco Mall",client4:"SODIC — Ogami North Coast",
  client5:"Concord — New Mansoura",client6:"OliveLand Agriculture",client7:"Salah Eldin Int'l School",client8:"New Urban Communities Authority",
  productsLabel:"Generator range",productsTitle:"THREE BRANDS.\nONE STANDARD.",productsSub:"We partner exclusively with the world's most reliable diesel engine manufacturers.",
  perkinsName:"Perkins Series",perkinsOrigin:"United Kingdom · 9 KVA – 2500 KVA",perkinsDesc:"The industry benchmark for reliability and fuel efficiency. Engineered for every climate and load profile — from residential backup to heavy industrial prime power.",
  volvoName:"Volvo Penta",volvoOrigin:"Sweden · 85 KVA – 700 KVA",volvoDesc:"Swedish precision meets extreme-duty performance. Renowned for rapid load acceptance and minimal transient response — the preferred choice for data centers and critical infrastructure.",
  doosanName:"Doosan",doosanOrigin:"South Korea · 150 KVA – 825 KVA",doosanDesc:"Robust Korean engineering built for continuous prime power. Outstanding durability in construction, manufacturing, and utility applications with exceptional value for money.",
  btnSpecs:"Technical Specifications",btnViewSpec:"View Spec Sheet",btnAllModels:"All Models & Ratings",btnRequestQuote:"Request Quote",btnDownloadPdf:"Download PDF",
  specCyl:"Cylinders",specGov:"Governor",specAsp:"Aspiration",specMechElec:"Mechanical / Electronic",specTurbo:"Turbocharged",specTurboInt:"Turbo + Intercooler",specEcu:"Electronic (ECU)",specTurboAfter:"Turbo + Aftercooler",
  servicesLabel:"What We Offer",servicesTitle:"COMPLETE\nPOWER SOLUTIONS",
  svc1:"Open-Type Generators",svc1Desc:"Robust industrial frames with full weather protection for outdoor and factory deployments.",
  svc2:"Soundproof Canopies",svc2Desc:"Custom acoustic enclosures engineered to 65 dB — suitable for hospitals, hotels, and residential zones.",
  svc3:"LV Panels & ATS",svc3Desc:"Automatic transfer switch panels, synchronization boards, and full distribution systems to spec.",
  svc4:"External Fuel Tanks",svc4Desc:"Single and double-wall storage from 500 L to 30,000 L with integrated leak detection systems.",
  svc5:"OEM Spare Parts",svc5Desc:"100% genuine factory parts for Perkins, Volvo Penta, and Doosan — held in local inventory.",
  svc6:"Turnkey Installation",svc6Desc:"Full site works: civil foundation, fuel lines, cabling, commissioning, and load testing.",
  svc7:"Maintenance Contracts",svc7Desc:"Scheduled preventive and corrective maintenance programs with 24/7 emergency call-out.",
  svcCta:"Custom Solution?",svcCtaDesc:"Talk to our engineers for a tailored power package.",svcCtaLink:"Contact Us →",
  tsLabel:"Engineering Standards",tsTitle:"BUILT TO\nSPECIFICATION",tsDesc:"Every generator we supply meets rigorous international engineering standards — from the engine block to the control panel.",
  tsEngineLabel:"Engine Standards",tsEngineTitle:"Perkins · Volvo · Doosan",tsCycle:"Cycle",tsCooling:"Cooling",tsInduction:"Induction",tsGovernor:"Governor",tsEmissions:"Emissions",tsFreq:"Frequency",tsVoltage:"Voltage",
  tsAltLabel:"Alternator Standards",tsAltTitle:"LeroySomer · Stamford",tsInsul:"Insulation",tsProtect:"Protection",tsExcit:"Excitation",tsWinding:"Winding",tsAVR:"AVR",tsVoltReg:"Voltage regulation",
  tsCtrlLabel:"Control Systems",tsCtrlTitle:"DSE · ComAp",tsDSEDesc:"UK-made industry standard controllers",tsComApDesc:"Advanced synchronization & parallel solutions",
  fuelInfraLabel:"Supply & Storage",fuelInfraTitle:"FUEL\nINFRASTRUCTURE",fuelInfraDesc:"Complete fuel supply systems designed for extended generator autonomy — from 24-hour standby to 7-day critical reserves.",
  fuelTank1:"External Bulk Tanks",fuelTank1Desc:"Custom-fabricated cylindrical or rectangular steel tanks for extended generator autonomy (24h – 7 days). Designed in accordance with international safety standards.",
  fuelPiping:"Fuel Piping Networks",fuelPipingDesc:"Complete seamless black steel piping networks (Schedule 40/80) with necessary strainers, check valves, solenoid valves, and pressure gauges.",
  fuelPump:"Transfer Pump Systems",fuelPumpDesc:"Automatic fuel transfer systems with float switches and control panels to manage daily service tanks from main bulk storage without manual intervention.",
  amcLabel:"Support & Care",amcTitle:"MAINTENANCE\nCONTRACTS",amcDesc:"Annual Maintenance Contracts (AMC) designed to keep your generator at peak performance year-round — with guaranteed response times and genuine OEM parts.",
  amcStdTier:"Standard AMC",amcStdName:"Standard",amcStdF1:"4 Routine Visits / Year",amcStdF2:"24h Emergency Response Time",amcStdF3:"5% Spare Parts Discount",amcStdF4:"Genuine OEM Parts Only",amcStdF5:"Technical Report After Each Visit",amcStdCta:"Ask About Standard AMC",
  amcPremTier:"Premium AMC+",amcPremName:"Premium",amcPremF1:"12 Routine Visits / Year",amcPremF2:"4h Emergency Response Time",amcPremF3:"15% Spare Parts Discount",amcPremF4:"Genuine OEM Parts Only",amcPremF5:"Priority Scheduling — 24/7",amcPremCta:"Ask About Premium AMC+",
  amcPopular:"Most Popular",amcScopeLabel:"WHAT EVERY VISIT COVERS",
  amcS1:"Engine Health Check",amcS1D:"Oil level, belts, filters, and all mechanical wear points inspected.",
  amcS2:"Coolant & Oil Analysis",amcS2D:"Fluid condition, concentration levels, and contamination checks.",
  amcS3:"Battery System Test",amcS3D:"Charge capacity, terminal condition, and starting circuit verification.",
  amcS4:"24/7 Emergency Support",amcS4D:"Direct line to certified field engineers — day, night, and public holidays.",
  certLabel:"Standards & Compliance",certTitle:"QUALITY &\nCERTIFICATIONS",certDesc:"Every project is executed under certified quality management systems and strict HSE protocols — fully compliant with Egyptian and international regulations.",
  cert1Name:"Quality Management",cert1Desc:"Certified for consistent service delivery and customer satisfaction across all project types and sizes.",
  cert2Name:"Generating Sets",cert2Desc:"Full compliance with reciprocating internal combustion engine driven AC generating sets standards.",
  cert3Name:"Rotating Machinery",cert3Desc:"Rotating electrical machines standard — all alternators supplied meet IEC 60034 requirements.",
  cert4Name:"Environmental Compliance",cert4Desc:"Full adherence to Egyptian Environmental Affairs Agency noise and emission limits on every installation.",
  hseLabel:"HSE PROTOCOLS",hse1:"Zero Accident Policy",hse1D:"Strict site safety enforcement — no exceptions for any project scale.",
  hse2:"Mandatory PPE",hse2D:"Full personal protective equipment required for all technicians on site.",
  hse3:"Pre-Installation Risk Assessment",hse3D:"Written risk assessment completed and signed off before every installation begins.",
  svc8:"Load Bank Testing",svc8Desc:"Professional on-site load bank testing and full performance validation per IEC standards.",
  svc9:"Engineering Consult",svc9Desc:"Expert load analysis, sizing calculations, single-line diagrams, and full technical design packages.",
  visionLabel:"Corporate Identity",visionTitle:"WHO WE\nARE",visionDesc:"Premium Power occupies a distinct niche in the Egyptian power generation market — we don't just sell equipment; we deliver energy security.",
  visionCardLabel:"Vision",visionStatement:"\"To become the undisputed leader in backup power solutions across the Middle East, setting the benchmark for reliability.\"",
  missionCardLabel:"Mission",missionStatement:"\"Engineering robust power systems that guarantee safety, efficiency, and zero downtime for our partners' critical operations.\"",
  val1:"Quality",val1Sub:"ISO Standards Compliance",val2:"Safety",val2Sub:"Zero Harm Policy",val3:"Integrity",val3Sub:"Transparent Dealing",val4:"Speed",val4Sub:"Rapid Response Time",
  portfolioLabel:"Reference List",portfolioTitle:"250+ PROJECTS\nBY SECTOR",portfolioDesc:"Trusted partners across every critical industry in Egypt.",
  sec1:"Water & Sewage",sec2:"Real Estate",sec3:"Governmental",sec4:"Agriculture",sec5:"Contractors",sec6:"Industry & Retail",
  locLabel:"Operational Network",locTitle:"OUR REACH\nACROSS EGYPT",
  locFacilities:"Strategic Facilities",locRegions:"Active Market Regions",
  locHQTag:"Central Management",locHQ:"Cairo HQ",locWHTag:"Logistics Center",locWH:"Main Warehouse",
  locDeltaTag:"Regional Support",locDelta:"Delta Branch",locWSTag:"Fabrication Unit",locWS:"Sheet Metal Workshop",
  locCoverage:"Nationwide Coverage",locCoverageDesc:"From our Cairo headquarters and 3 regional facilities, we deploy certified engineers and genuine OEM parts to any governorate within Egypt's boundaries.",
  soundOpenEquiv:"≈ Industrial Machinery",tier1Label:"Open Set",tier1Desc:"No enclosure",tier2Label:"Standard",tier2Desc:"−20 dBA",tier3Label:"Super Silent",tier3Desc:"Premium canopy",
  soundMaterialNote:"Enclosure materials and construction are confirmed for the selected model.",
  workflowLabel:"Our Process",workflowTitle:"HOW WE\nDELIVER",
  step1:"Site Survey",step1D:"Full load analysis, location assessment, and ventilation planning by our engineering team.",
  step2:"Civil Works",step2D:"Foundation casting, cable trenching, and generator room preparation to specification.",
  step3:"Delivery",step3D:"Safe transport and precision positioning using specialized lifting equipment.",
  step4:"Installation",step4D:"Power cabling, exhaust ducting, fuel piping, and full control panel termination.",
  step5:"Commissioning",step5D:"Load testing, safety verification, and full handover training for your operations team.",
  calcLabel:"Interactive Tool",calcTitle:"POWER SIZE\nCALCULATOR",calcSub:"Enter your equipment below to get an instant KVA estimate with fuel consumption and daily cost.",
  calcEquipment:"YOUR EQUIPMENT",calcHours:"Operating Hours / Day",calcHoursSub:"How long the generator runs each day",calcHint:"Enter your appliances to see the recommended generator size.",calcEstimate:"ESTIMATED REQUIREMENT",
  ac1:"AC Unit (1.5 HP)",ac1W:"≈ 1,200 W each",ac3:"AC Unit (3.0 HP)",ac3W:"≈ 2,400 W each",
  pump:"Water Pump (1 HP)",pumpW:"≈ 750 W each",pc:"PC / Workstation",pcW:"≈ 200 W each",light:"Lighting (Room)",lightW:"≈ 100 W each",
  fuelLabel:"Fuel Consumption",fuelUnit:"L/hr",costLabel:"Daily Fuel Cost",
  fuelPrice:"Diesel price (EGP/L)",
  calcNote:"Preliminary sizing only: 25% allowance at 0.8 PF. Starting loads require an engineering assessment. Fuel uses an indicative 0.15 L/h per kVA at 75% load, not a model-specific measurement. Update the diesel price above.",
  calcCta:"Get Free Quote — 24 Hours",
  soundLabel:"Acoustic Engineering",soundTitle:"HEAR THE\nDIFFERENCE",
  soundOpen:"Standard (Open)",soundSilent:"Soundproof Canopy",soundTraffic:"≈ Heavy Traffic",soundOffice:"≈ Library Quiet",
  soundDesc:"Our custom-fabricated soundproof canopies dramatically reduce generator noise, making them deployable in environments where standard units are impractical.",
  soundB1:"Suitable for residential zones and hospitals",soundB2:"Engineered to ≤ 65 dB at 1 meter",soundB3:"Custom dimensions for any generator model",soundB4:"Maintenance access panels included",
  projectsLabel:"Recent Work",projectsTitle:"INSTALLATIONS\nACROSS EGYPT",
  proj1Loc:"New Cairo",proj1Title:"Medical Center Backup",proj1Desc:"2 × 500 KVA Perkins units with full ATS synchronization panel and UPS integration.",
  proj2Loc:"New Capital",proj2Title:"Construction Power",proj2Desc:"4 × 250 KVA Volvo Penta generators powering a major residential development site.",
  proj3Loc:"Maadi",proj3Title:"Bank HQ Data Center",proj3Desc:"1000 KVA Doosan in soundproof canopy (65 dB) for a tier-3 bank data center.",
  galleryLabel:"Our Work",galleryTitle:"GENERATOR\nGALLERY",
  compLabel:"Why Choose Us",compTitle:"THE PREMIUM\nDIFFERENCE",
  compFeature:"Feature",compUs:"Premium Power ✦",compThem:"Standard Competitor",compUsSub:"What You Get",compThemSub:"What You Settle For",compRecommended:"Recommended",
  compR1:"Emergency Response",compR1Us:"Within 24 Hours",compR1Them:"3–5 Days (Often Longer)",
  compR2:"Spare Parts",compR2Us:"100% Genuine OEM",compR2Them:"Aftermarket / Generic",
  compR3:"Warranty",compR3Us:"1 Year / 1,000 Hours",compR3Them:"6 Months or Less",
  compR4:"Technicians",compR4Us:"Certified Engineers",compR4Them:"Contracted Labour",
  compR5:"Load Testing",compR5Us:"Always Included",compR5Them:"Optional / Extra Charge",
  faqLabel:"Common Questions",faqTitle:"FREQUENTLY\nASKED",
  contactLabel:"Get in Touch",contactTitle:"LET'S POWER\nYOUR PROJECT",
  contactSub:"Contact our team for a generator quote or a maintenance assessment. Share your site needs and we will help you choose the next step.",
  ctPhone:"Phone",ctEmail:"Email",ctAddress:"Address",ctHours:"Office Hours",ctHoursVal:"Sun – Thu, 9:00 AM – 5:00 PM",
  formTitle:"SEND AN INQUIRY",fName:"Your Name",fNamePlaceholder:"Mohamed Ahmed",fPhone:"Phone Number",fPhonePlaceholder:"01XXXXXXXXX",fLocation:"Project Location",fLocationPlaceholder:"Cairo / governorate",fType:"Enquiry Type",fTypeSales:"Generator quote",fTypeMaintenance:"Maintenance assessment",fPlan:"Maintenance Plan",fPlanAssessment:"Assessment first",fPlanStandard:"Standard AMC",fPlanPremium:"Premium AMC+",fMessage:"Message",fMessagePlaceholder:"Tell us what you know: load, brand, or running hours (optional).",fNote:"Share the details you have — load, preferred brand, running hours, or site needs — and our team will guide the next step.",fSubmit:"Send Enquiry →",
  fDataUse:"We use the details you submit to respond to your enquiry.",fFallbackLabel:"If the form is unavailable,",fFallbackCall:"call 012 2968 8688",fFallbackOr:"or",fFallbackWhatsapp:"message us on WhatsApp",
  pdfMobile:"If the preview is unavailable, open the PDF in a new tab or download it.",
  footerTagline:"Delivering engineering-grade generator solutions with trusted performance and professional support since 2006.",
  footerProducts:"Products",footerCompany:"Company",footerSoundproof:"Soundproof Canopies",footerParts:"OEM Spare Parts",
  footerProcess:"Our Process",footerProjects:"Projects",footerWhy:"Why Us",footerContact:"Contact",footerCalc:"Power Calculator",
  notifTitle:"Enquiry submitted",notifClose:"Close",
  formSuccess:"Your enquiry has been submitted. The team will review the details provided for follow-up.",
  formInvalidPhone:"Please enter a valid Egyptian phone number (e.g. 01XXXXXXXXX)",
  chatSales:"Sales Inquiry",chatEmergency:"24/7 Emergency",
},
ar:{
  pageTitle:"مولدات ديزل في مصر | بريميوم باور",
  regionName8:"جميع أنحاء مصر",
  regionName7:"الساحل الشمالي",
  regionName6:"المنوفية",
  regionName5:"العاصمة الإدارية",
  regionName4:"صحراء المنيا",
  regionName3:"الإسكندرية",
  regionName2:"الجيزة",
  regionName1:"القاهرة",
  heroWarrantyValue:"عام واحد",
  heroMaxOutput:"ك.ف.أ كحد أقصى",
  pageTitle:"مولدات ديزل في مصر | بريميوم باور",
  perkinsModels:"موديلات بيركنز وقدراتها",
  volvoModels:"موديلات فولفو بنتا وقدراتها",
  doosanModels:"موديلات دوسان وقدراتها",
  skipNav:"انتقل إلى المحتوى الرئيسي",
  heroTag:"وكيل معتمد — مصر",
  heroLine1:"مولدات",heroLine2:"ديزل",heroLine3:"مصر",
  heroSub:"حلول مولدات ديزل هندسية من 8 ك.ف.أ إلى 3000 ك.ف.أ. بيركنز وفولفو بنتا ودوسان — مع تركيب احترافي ودعم على مدار الساعة.",
  heroCardTitle:"نطاق القدرة",engine:"المحرك",alternator:"المولد",heroSupport:"الدعم",heroWarranty:"الضمان",
  scrollHint:"تمرير",
  btnFindGen:"ابحث عن مولدك",btnContact:"تواصل معنا",btnQuote:"اطلب عرضاً",btnGeneratorQuote:"اطلب عرض سعر لمولد",btnMaintenanceAssessment:"استعرض خدمات الصيانة",
  navClients:"العملاء",navProducts:"المولدات",navCalc:"الحاسبة",navProjects:"المشاريع",navContact:"اتصل بنا",navHome:"الرئيسية",navServices:"الخدمات",navPortfolio:"سابقة أعمال",navLocations:"مواقعنا",navVision:"عن الشركة",navAMC:"الصيانة",navSpecs:"المواصفات",navFuel:"أنظمة الوقود",navCerts:"الشهادات",navCert:"الشهادات",
  stat1:"مشروع مكتمل",stat2:"سنة خبرة",stat3:"عقد نشط",stat4:"ضمان وقت التشغيل",
  stat1Desc:"قارن الموديلات واطلب عرض سعر يناسب مشروعك.",
  stat2Desc:"استعرض خيارات الصيانة واطلب تقييماً لموقعك.",
  navMainLabel:"التنقل الرئيسي",
  navLogoLabel:"الصفحة الرئيسية لبريميوم باور",
  navToggleLabel:"فتح قائمة التنقل",
  mobileNavLabel:"قائمة التنقل",
  mobileCloseLabel:"إغلاق قائمة التنقل",
  contactOptionsLabel:"خيارات التواصل",
  ctaGroupLabel:"خيارات استفسارات التوريد والصيانة",
  soundCompareLabel:"تكوينات كابينة المولد",
  pdfCloseLabel:"إغلاق معاينة المواصفات",
  pdfPreviewLabel:"معاينة مستند المواصفات بصيغة PDF",
  pdfOpenNewTab:"فتح PDF في تبويب جديد",
  privacyLink:"اقرأ إشعار الخصوصية",
  maintenanceLink:"خدمات الصيانة",
  gallerySub:"صور مرجعية لمعدات مولدات؛ قد يختلف شكل الموديل وتكوينه.",
  projectsSub:"أنواع استخدام توضيحية فقط؛ لا تصف هذه البطاقات مشروعات مكتملة.",
  scopeNote:"اذكر المستندات والاختبارات والدخول إلى الموقع ومتطلبات السلامة في النطاق المكتوب.",
  client9:"كونكورد إي سي",
  client10:"ميتيتو",
  client11:"بيرلز",
  client12:"سوديك",
  client13:"أب وايد",
  client14:"ميجور للديكور",
  client15:"SCZone",
  client16:"جامعة المنوفية",
  client17:"NOWPASD",
  client18:"أوليف لاند",
  client19:"جنينة للزراعة",
  client20:"مدن للزراعة",
  client21:"إتش إيه تريدينغ",
  client22:"سمو",
  client23:"جاما ووركس",
  client24:"سيراميكا كليوباترا",
  client25:"ديفاكتو",
  sec1D:"الماركة أو الموديل أو رقم القطعة إن كان معروفاً.",
  sec2D:"المكان وإمكانية الدخول والتوصيلات.",
  sec3D:"الحمل ونمط التشغيل أو المشكلة المطلوب معالجتها.",
  fuelTag1:"500 إلى 30,000 لتر",
  fuelTag2:"جدار مفرد أو مزدوج",
  fuelTag3:"طلاء مقاوم للتآكل",
  fuelTag4:"جدول 40 / 80",
  fuelTag5:"فولاذ غير ملحوم",
  fuelTag6:"مجموعة صمامات كاملة",
  fuelTag7:"نقل أوتوماتيكي",
  fuelTag8:"مفاتيح عوامة",
  fuelTag9:"مؤشرات المستوى",
  specCooling:"التبريد",
  specWaterCooled:"تبريد بالماء",
  specEmissions:"الانبعاثات",
  specStage:"المرحلة II / IIIA",
  specAlternator:"المولد الكهربائي",
  specInsulation:"العزل",
  specExcitation:"الإثارة",
  specBrushlessPmg:"من دون فُرش / PMG",
  specControl:"نظام التحكم",
  spec4Stroke:"ديزل رباعي الأشواط",
  certBadge1:"الموديل",
  certBadge2:"النطاق",
  certBadge3:"الاختبار",
  certBadge4:"الموقع",
  footerAMC:"خدمات الصيانة",
  privacyFooter:"إشعار الخصوصية",
  soundConfigNote:"مقارنة توضيحية للتكوينات فقط؛ لا تُعرض مستويات صوت مقاسة.",
  specPerkinsLabel:"مواصفات بيركنز",
  specVolvoPentaLabel:"مواصفات فولفو بنتا",
  specDoosanLabel:"مواصفات دوسان",
  serviceDirect:'اتصال مباشر',
  clientsLabel:"عملاؤنا",clientsTitle:"موثوق بنا من قبل\nكبرى المؤسسات",clientsSub:"تشغيل العمليات الحيوية في قطاعات الرعاية الصحية والتصنيع والبنية التحتية والعقارات.",
  client1:"هيئة الإسعاف المصرية",client2:"القناة للسكر",client3:"أب وايد — سينكو مول",client4:"سوديك — عجيمي الساحل الشمالي",
  client5:"كونكورد — المنصورة الجديدة",client6:"أوليف لاند للزراعة",client7:"مجمع مدارس صلاح الدين",client8:"هيئة المجتمعات العمرانية الجديدة",
  productsLabel:"نطاق المولدات",productsTitle:"ثلاث ماركات\nمعيار واحد.",productsSub:"نتعاون حصرياً مع أكثر الشركات المصنعة لمحركات الديزل موثوقية في العالم.",
  perkinsName:"سلسلة بيركنز",perkinsOrigin:"المملكة المتحدة · 9 ك.ف.أ – 2500 ك.ف.أ",perkinsDesc:"المعيار الصناعي للموثوقية وكفاءة استهلاك الوقود. مصممة لكل المناخات وأنماط الأحمال.",
  volvoName:"فولفو بنتا",volvoOrigin:"السويد · 85 ك.ف.أ – 700 ك.ف.أ",volvoDesc:"دقة سويدية مع أداء للأحمال الشاقة. مشهورة بالاستجابة السريعة للأحمال — الخيار المفضل لمراكز البيانات والبنية التحتية الحيوية.",
  doosanName:"دوسان",doosanOrigin:"كوريا الجنوبية · 150 ك.ف.أ – 825 ك.ف.أ",doosanDesc:"هندسة كورية متينة مبنية للطاقة الأولية المستمرة. متانة استثنائية في مواقع البناء والتصنيع والمرافق.",
  btnSpecs:"المواصفات الفنية",btnViewSpec:"عرض الكتيب",btnAllModels:"كل الموديلات والقدرات",btnRequestQuote:"طلب عرض سعر",btnDownloadPdf:"تحميل PDF",
  specCyl:"عدد الأسطوانات",specGov:"منظم السرعة",specAsp:"السحب والشحن",specMechElec:'ميكانيكي / إلكتروني',specTurbo:"شاحن توربيني",specTurboInt:"شاحن توربيني + مبرد بيني",specEcu:'إلكتروني (ECU)',specTurboAfter:"شاحن توربيني + مبرد لاحق",
  servicesLabel:"خدماتنا",servicesTitle:"حلول طاقة\nكاملة",
  svc1:"مولدات مفتوحة",svc1Desc:"هياكل صناعية متينة مع حماية كاملة من الطقس للبيئات الخارجية والمصانع.",
  svc2:"كبائن عازلة للصوت",svc2Desc:"هياكل صوتية مخصصة بتصنيع 65 ديسيبل — مناسبة للمستشفيات والفنادق والمناطق السكنية.",
  svc3:"لوحات الجهد المنخفض و ATS",svc3Desc:"لوحات تحويل تلقائي ولوحات مزامنة وأنظمة توزيع كاملة حسب المواصفات.",
  svc4:"خزانات وقود خارجية",svc4Desc:"تخزين بجدار أو جدار مزدوج من 500 لتر إلى 30,000 لتر مع أنظمة كشف التسرب.",
  svc5:"قطع غيار أصلية OEM",svc5Desc:"قطع غيار أصلية 100% لبيركنز وفولفو بنتا ودوسان — متوفرة في المخزون المحلي.",
  svc6:"تركيب شامل",svc6Desc:"أعمال موقع كاملة: أساسات مدنية وخطوط وقود وكابلات وتشغيل واختبار أحمال.",
  svc7:"عقود الصيانة",svc7Desc:"برامج صيانة وقائية وتصحيحية مجدولة مع استجابة طوارئ 24/7.",
  svcCta:"تحتاج حلاً مخصصاً؟",svcCtaDesc:"تحدث مع مهندسينا للحصول على باقة طاقة مصممة خصيصاً.",svcCtaLink:"اتصل بنا ←",
  tsLabel:"المعايير الهندسية",tsTitle:"مبني وفق\nالمواصفات",tsDesc:"كل مولد نوفره يلتزم بمعايير هندسية دولية صارمة — من كتلة المحرك حتى لوحة التحكم.",
  tsEngineLabel:"معايير المحرك",tsEngineTitle:"بيركنز · فولفو · دوسان",tsCycle:"الدورة",tsCooling:"التبريد",tsInduction:"الشحن",tsGovernor:"الحاكم",tsEmissions:"الانبعاثات",tsFreq:"التردد",tsVoltage:"الجهد",
  tsAltLabel:"معايير المولد الكهربائي",tsAltTitle:"ليروي سومر · ستامفورد",tsInsul:"العزل",tsProtect:"الحماية",tsExcit:"الإثارة",tsWinding:"اللفائف",tsAVR:"منظم الجهد",tsVoltReg:"تنظيم الجهد",
  tsCtrlLabel:"أنظمة التحكم",tsCtrlTitle:"DSE · ComAp",tsDSEDesc:'وحدات تحكم قياسية صناعية من بريطانيا',tsComApDesc:'حلول متقدمة للتزامن والتشغيل المتوازي',
  fuelInfraLabel:"التوريد والتخزين",fuelInfraTitle:"البنية التحتية\nللوقود",fuelInfraDesc:"أنظمة وقود متكاملة مصممة لضمان استمرارية تشغيل المولدات — من الاحتياطي لمدة 24 ساعة حتى 7 أيام.",
  fuelTank1:"خزانات الوقود الخارجية",fuelTank1Desc:"خزانات فولاذية أسطوانية أو مستطيلة مصنعة خصيصاً لتشغيل المولدات (24 ساعة – 7 أيام). مصممة وفق معايير السلامة الدولية.",
  fuelPiping:"شبكات أنابيب الوقود",fuelPipingDesc:"شبكات أنابيب فولاذية غير ملحومة كاملة (جدول 40/80) مع مصافي وصمامات عدم رجوع وصمامات سولينويد (كهرومغناطيسية) ومقاييس ضغط.",
  fuelPump:"أنظمة مضخات النقل",fuelPumpDesc:"أنظمة نقل وقود أوتوماتيكية مع عوامات وألواح تحكم لإدارة خزانات الخدمة اليومية من التخزين الرئيسي دون تدخل يدوي.",
  amcLabel:"الدعم والرعاية",amcTitle:"عقود\nالصيانة",amcDesc:"عقود صيانة سنوية (AMC) مصممة للحفاظ على مولدك عند أعلى مستويات الأداء طوال العام — مع أوقات استجابة مضمونة وقطع غيار OEM أصلية.",
  amcStdTier:"عقد صيانة قياسي",amcStdName:"القياسي",amcStdF1:"4 زيارات دورية / السنة",amcStdF2:"وقت استجابة للطوارئ 24 ساعة",amcStdF3:"خصم 5% على قطع الغيار",amcStdF4:"قطع غيار OEM أصلية فقط",amcStdF5:"تقرير فني بعد كل زيارة",amcStdCta:"استفسر عن عقد الصيانة القياسي",
  amcPremTier:"عقد صيانة بريميوم+",amcPremName:"البريميوم",amcPremF1:"12 زيارة دورية / السنة",amcPremF2:"وقت استجابة للطوارئ 4 ساعات",amcPremF3:"خصم 15% على قطع الغيار",amcPremF4:"قطع غيار OEM أصلية فقط",amcPremF5:"جدولة أولوية — 24/7",amcPremCta:"استفسر عن عقد الصيانة بريميوم+",
  amcPopular:"الأكثر طلباً",amcScopeLabel:"ما يشمله كل زيارة",
  amcS1:"فحص صحة المحرك",amcS1D:'فحص مستوى الزيت والأحزمة والفلاتر وجميع نقاط التآكل الميكانيكي.',
  amcS2:"تحليل سائل التبريد والزيت",amcS2D:'فحص حالة السوائل ومستويات التركيز واختبار التلوث.',
  amcS3:'اختبار منظومة البطارية',amcS3D:'قدرة الشحن وحالة الأطراف والتحقق من دائرة التشغيل.',
  amcS4:"دعم طوارئ 24/7",amcS4D:"خط مباشر لمهندسين ميدانيين معتمدين — ليلاً ونهاراً وفي العطلات.",
  certLabel:"المعايير والامتثال",certTitle:"الجودة\nوالشهادات",certDesc:"كل مشروع يُنفَّذ وفق أنظمة إدارة جودة معتمدة وبروتوكولات HSE صارمة — متوافقة تماماً مع اللوائح المصرية والدولية.",
  cert1Name:"إدارة الجودة",cert1Desc:"معتمدة لتقديم خدمة متسقة ورضا عملاء عالٍ في جميع أنواع المشاريع.",
  cert2Name:"مجموعات التوليد",cert2Desc:"امتثال كامل لمعايير مجموعات توليد التيار المتردد ذات المحرك الداخلي ذات الحركة الترددية.",
  cert3Name:"الآلات الدوارة",cert3Desc:"معيار الآلات الكهربائية الدوارة — جميع المولدات الكهربائية المقدمة تلتزم بمتطلبات IEC 60034.",
  cert4Name:"الامتثال البيئي",cert4Desc:"التزام كامل بحدود الضوضاء والانبعاثات الصادرة عن جهاز شئون البيئة المصري في كل تركيب.",
  hseLabel:'بروتوكولات السلامة والصحة المهنية',hse1:"سياسة الصفر حوادث",hse1D:'تطبيق صارم لسلامة الموقع — لا استثناءات بصرف النظر عن حجم المشروع.',
  hse2:"معدات الحماية الشخصية إلزامية",hse2D:'معدات الحماية الشخصية الكاملة مطلوبة لجميع التقنيين في الموقع.',
  hse3:"تقييم المخاطر قبل التركيب",hse3D:'تقييم مخاطر مكتوب يُكتمل ويُوقَّع عليه قبل بدء كل عملية تركيب.',
  svc8:"اختبار الحمل",svc8Desc:"اختبار احترافي بالحمل الوهمي في الموقع مع التحقق الكامل من الأداء وفق معايير IEC.",
  svc9:"استشارة هندسية",svc9Desc:"تحليل أحمال متخصص وحسابات تحجيم ومخططات خط أحادي وحزم تصميم فني كاملة.",
  visionLabel:"هوية الشركة",visionTitle:"من\nنحن",visionDesc:"تحتل بريميوم باور مكانة متميزة في سوق توليد الطاقة المصري — نحن لا نبيع معدات فحسب؛ بل نوفر أمان الطاقة.",
  visionCardLabel:"الرؤية",visionStatement:"\"أن نصبح الرائد الذي لا يُنازَع في حلول الطاقة الاحتياطية عبر الشرق الأوسط، ونضع معيار الموثوقية.\"",
  missionCardLabel:"الرسالة",missionStatement:"\"هندسة أنظمة طاقة متينة تضمن السلامة والكفاءة وصفر وقت تعطل لعمليات شركائنا الحيوية.\"",
  val1:"الجودة",val1Sub:"الامتثال لمعايير ISO",val2:"السلامة",val2Sub:"سياسة الصفر أضرار",val3:"النزاهة",val3Sub:"التعامل الشفاف",val4:"السرعة",val4Sub:"وقت استجابة سريع",
  portfolioLabel:"قائمة المراجع",portfolioTitle:"250+ مشروع\nحسب القطاع",portfolioDesc:"شركاء موثوقون في كل قطاع حيوي في مصر.",
  sec1:"المياه والصرف الصحي",sec2:"العقارات",sec3:"الحكومي",sec4:"الزراعة",sec5:"المقاولون",sec6:"الصناعة والتجزئة",
  locLabel:"الشبكة التشغيلية",locTitle:"نطاق تغطيتنا\nعبر مصر",
  locFacilities:"المنشآت الاستراتيجية",locRegions:"مناطق السوق النشطة",
  locHQTag:"الإدارة المركزية",locHQ:"المقر الرئيسي بالقاهرة",locWHTag:"مركز اللوجستيات",locWH:"المخزن الرئيسي",
  locDeltaTag:"الدعم الإقليمي",locDelta:"فرع الدلتا",locWSTag:"وحدة التصنيع",locWS:"ورشة الأعمال المعدنية",
  locCoverage:"تغطية وطنية",locCoverageDesc:"من مقرنا الرئيسي في القاهرة و3 منشآت إقليمية، نوفد مهندسين معتمدين وقطع غيار أصلية إلى أي محافظة داخل حدود مصر.",
  soundOpenEquiv:"≈ آلات صناعية",tier1Label:"مفتوح",tier1Desc:"بدون كابينة",tier2Label:"قياسي",tier2Desc:"−20 ديسيبل",tier3Label:"صامت للغاية",tier3Desc:"كابينة بريميوم",
  soundMaterialNote:"تُحدد مواد الكابينة وطريقة تصنيعها للموديل المختار.",
  workflowLabel:"منهجيتنا",workflowTitle:"كيف نُنجز\nعملنا",
  step1:"المسح الميداني",step1D:"تحليل أحمال كامل وتقييم الموقع وتخطيط التهوية من قِبَل فريق هندستنا.",
  step2:"الأعمال المدنية",step2D:"صب الأساسات وحفر قنوات الكابلات وتجهيز غرفة المولد وفق المواصفات.",
  step3:"التسليم",step3D:"نقل آمن ووضع دقيق للمولد باستخدام معدات رفع متخصصة.",
  step4:"التركيب",step4D:"كابلات القوى وقنوات العادم وأنابيب الوقود وتوصيل لوحة التحكم الكاملة.",
  step5:"التشغيل",step5D:"اختبار الحمل والتحقق من السلامة والتسليم مع تدريب كامل لفريق تشغيلكم.",
  calcLabel:"أداة تفاعلية",calcTitle:"حاسبة\nقدرة المولد",calcSub:"أدخل معداتك أدناه للحصول على تقدير فوري للـ KVA مع استهلاك الوقود والتكلفة اليومية.",
  calcEquipment:"معداتك",calcHours:"ساعات التشغيل / يوم",calcHoursSub:"كم ساعة يعمل المولد يومياً",calcHint:"أدخل أجهزتك لرؤية حجم المولد الموصى به.",calcEstimate:"المتطلبات المقدرة",
  ac1:"مكيف (1.5 حصان)",ac1W:"≈ 1,200 واط لكل وحدة",ac3:"مكيف (3.0 حصان)",ac3W:"≈ 2,400 واط لكل وحدة",
  pump:"مضخة مياه (1 حصان)",pumpW:"≈ 750 واط لكل وحدة",pc:"كمبيوتر / محطة عمل",pcW:"≈ 200 واط لكل وحدة",light:"إضاءة (غرفة)",lightW:"≈ 100 واط لكل غرفة",
  fuelLabel:"استهلاك الوقود",fuelUnit:"لتر/ساعة",costLabel:"تكلفة الوقود اليومية",
  fuelPrice:"سعر السولار (جنيه/لتر)",
  calcNote:"تقدير أولي: هامش 25٪ ومعامل قدرة 0.8. أحمال البدء تحتاج مراجعة هندسية. الوقود محسوب بمعامل تقريبي 0.15 لتر/ساعة لكل ك.ف.أ عند حمل 75٪، وليس قياساً لموديل محدد. عدّل سعر السولار أعلاه.",
  calcCta:"احصل على عرض مجاني — 24 ساعة",
  soundLabel:"الهندسة الصوتية",soundTitle:"اسمع\nالفرق",
  soundOpen:"قياسي (مفتوح)",soundSilent:"كابينة عازلة للصوت",soundTraffic:"≈ ازدحام مروري",soundOffice:"≈ هدوء مكتبة",
  soundDesc:"تعمل كبائننا الكاتمة للصوت المصنعة خصيصاً على تقليل ضوضاء المولد بشكل كبير، مما يجعلها قابلة للنشر في البيئات التي تكون فيها الوحدات القياسية غير عملية.",
  soundB1:"مناسبة للمناطق السكنية والمستشفيات",soundB2:"مصممة للوصول إلى ≤ 65 ديسيبل على مسافة 1 متر",soundB3:"أبعاد مخصصة لأي موديل مولد",soundB4:"تشمل أبواب وصول للصيانة",
  projectsLabel:"أعمالنا الأخيرة",projectsTitle:"تركيبات\nعبر مصر",
  proj1Loc:"القاهرة الجديدة",proj1Title:"دعم مركز طبي",proj1Desc:"2 × 500 ك.ف.أ بيركنز مع لوحة تزامن ATS كاملة وتكامل UPS.",
  proj2Loc:"العاصمة الإدارية",proj2Title:"طاقة مواقع البناء",proj2Desc:"4 × 250 ك.ف.أ فولفو بنتا لتشغيل مشروع سكني ضخم.",
  proj3Loc:"المعادي",proj3Title:"مركز بيانات البنك",proj3Desc:"1000 ك.ف.أ دوسان في كابينة عازلة للصوت (65 ديسيبل) لمركز بيانات بنكي.",
  galleryLabel:"معرض أعمالنا",galleryTitle:"معرض\nالمولدات",
  compLabel:"لماذا تختارنا",compTitle:"الفرق\nالمميز",
  compFeature:"الميزة",compUs:"بريميوم باور ✦",compThem:"المنافس العادي",compUsSub:"ما تحصل عليه",compThemSub:"ما تقبل به",compRecommended:"الأفضل",
  compR1:"وقت الاستجابة للطوارئ",compR1Us:"خلال 24 ساعة",compR1Them:"3–5 أيام (غالباً أطول)",
  compR2:"أصالة قطع الغيار",compR2Us:"أصلية 100% (OEM)",compR2Them:"ما بعد البيع / عامة",
  compR3:"الضمان",compR3Us:"سنة واحدة / 1,000 ساعة",compR3Them:"6 أشهر أو أقل",
  compR4:"الفنيون",compR4Us:"مهندسون معتمدون",compR4Them:"عمالة متعاقدة",
  compR5:"اختبار الحمل",compR5Us:"مضمن دائماً",compR5Them:"اختياري / رسوم إضافية",
  faqLabel:"أسئلة شائعة",faqTitle:"الأسئلة\nالمتكررة",
  contactLabel:"تواصل معنا",contactTitle:"لنشغّل\nمشروعك",
  contactSub:"تواصل مع فريقنا لطلب عرض سعر لمولد أو تقييم للصيانة. شارك احتياجات موقعك وسنساعدك في تحديد الخطوة التالية.",
  ctPhone:"الهاتف",ctEmail:"البريد الإلكتروني",ctAddress:"العنوان",ctHours:"ساعات العمل",ctHoursVal:"الأحد – الخميس، 9:00 صباحاً – 5:00 مساءً",
  formTitle:"إرسال استفسار",fName:"اسمك",fNamePlaceholder:"محمد أحمد",fPhone:"رقم الهاتف",fPhonePlaceholder:"01XXXXXXXXX",fLocation:"موقع المشروع",fLocationPlaceholder:"القاهرة / المحافظة",fType:"نوع الاستفسار",fTypeSales:"عرض سعر لمولد",fTypeMaintenance:"تقييم للصيانة",fPlan:"خطة الصيانة",fPlanAssessment:"التقييم أولاً",fPlanStandard:"عقد الصيانة القياسي",fPlanPremium:"عقد الصيانة بريميوم+",fMessage:"الرسالة",fMessagePlaceholder:"اذكر ما تعرفه: الحمل أو الماركة أو ساعات التشغيل (اختياري).",fNote:"شارك التفاصيل المتاحة — الحمل أو الماركة المفضلة أو ساعات التشغيل أو احتياجات الموقع — وسيرشدك فريقنا إلى الخطوة التالية.",fSubmit:"إرسال الاستفسار ←",
  fDataUse:"نستخدم البيانات التي تقدمها للرد على استفسارك.",fFallbackLabel:"إذا تعذر إرسال النموذج،",fFallbackCall:"اتصل على 012 2968 8688",fFallbackOr:"أو",fFallbackWhatsapp:"راسلنا عبر واتساب",
  pdfMobile:"إذا تعذرت المعاينة، افتح ملف PDF في تبويب جديد أو نزّله.",
  footerTagline:"تقديم حلول مولدات هندسية بأداء موثوق ودعم احترافي منذ 2006.",
  footerProducts:"المنتجات",footerCompany:"الشركة",footerSoundproof:"كبائن عازلة للصوت",footerParts:"قطع غيار OEM",
  footerProcess:"منهجيتنا",footerProjects:"المشاريع",footerWhy:"لماذا نحن",footerContact:"اتصل بنا",footerCalc:"حاسبة القدرة",
  notifTitle:"تم تقديم الاستفسار",notifClose:"إغلاق",
  formSuccess:"تم تقديم استفسارك. سيراجع الفريق التفاصيل المقدمة للمتابعة.",
  formInvalidPhone:"الرجاء إدخال رقم هاتف مصري صحيح (مثال: 01XXXXXXXXX)",
  chatSales:"استفسار توريد مولد",chatEmergency:"طوارئ 24/7",
}};

// ── FAQ data ─────────────────────────────────────────────────────
const FAQS=[
  {
    "q_en": "How long does delivery and installation take?",
    "a_en": "Standard delivery and installation is completed within 7–15 working days depending on the generator model and site logistics. Larger projects requiring civil works may take 3–4 weeks.",
    "q_ar": "كم تستغرق عملية التوصيل والتركيب؟",
    "a_ar": "يتراوح وقت التسليم والتركيب القياسي من 7 إلى 15 يوم عمل حسب طراز المولد ولوجستيات الموقع. المشاريع الأكبر التي تتطلب أعمالاً مدنية قد تستغرق 3–4 أسابيع."
  },
  {
    "q_en": "Do you provide ATS panels and full turnkey installation?",
    "a_en": "Yes — we offer complete turnkey installation including site assessment, civil foundation, cabling, ATS panels, fuel piping, and commissioning. Civil works is included as a standard part of our service, not an optional extra.",
    "q_ar": "هل تقدمون لوحات ATS والتركيب المتكامل؟",
    "a_ar": "نعم، نقدم تركيباً كاملاً يشمل تقييم الموقع والأساسات المدنية والكابلات ولوحات ATS وأنابيب الوقود والتشغيل. الأعمال المدنية مدرجة كجزء قياسي من خدمتنا وليست إضافية."
  },
  {
    "q_en": "What is the warranty on your generators?",
    "a_en": "We provide a standard warranty of 1 year or 1,000 operating hours covering manufacturing defects in the engine and alternator. An extended warranty with unlimited operating hours is available as an upgrade.",
    "q_ar": "ما هي فترة ضمان المولدات؟",
    "a_ar": "نقدم ضماناً قياسياً لمدة عام أو 1,000 ساعة تشغيل يغطي عيوب التصنيع في المحرك والمولد الكهربائي. ضمان ممتد بساعات تشغيل غير محدودة متاح كترقية."
  },
  {
    "q_en": "Are your spare parts 100% genuine OEM?",
    "a_en": "Yes — we guarantee 100% genuine OEM spare parts for Perkins, Volvo Penta, and Doosan. Every part comes with a Certificate of Origin. We do not use aftermarket or generic alternatives.",
    "q_ar": "هل قطع الغيار أصلية 100% من الشركة الأم؟",
    "a_ar": "نعم، نضمن قطع غيار OEM أصلية 100% لبيركنز وفولفو بنتا ودوسان. كل قطعة تأتي بشهادة منشأ. لا نستخدم بدائل من الطرف الثالث أو قطعاً عامة."
  },
  {
    "q_en": "What maintenance contract options are available?",
    "a_en": "We offer two AMC tiers. Standard: 4 visits/year, 24h emergency response, 5% parts discount. Premium+: 12 visits/year, 4h emergency response, 15% parts discount, and priority scheduling. Both include genuine OEM parts and a technical report after every visit.",
    "q_ar": "ما خيارات عقود الصيانة السنوية المتاحة؟",
    "a_ar": "نقدم مستويين من عقود AMC. القياسي: 4 زيارات/سنة، استجابة طوارئ 24 ساعة، خصم 5% على القطع. البريميوم+: 12 زيارة/سنة، استجابة طوارئ 4 ساعات، خصم 15% على القطع وجدولة أولوية. كلاهما يشمل قطع OEM أصلية وتقريراً فنياً بعد كل زيارة."
  },
  {
    "q_en": "Can you supply soundproof canopies for residential or hospital use?",
    "a_en": "Yes — we fabricate custom soundproof canopies locally using 2mm ST.37 steel with high-density Rockwool insulation (>70 kg/m³). Our Super Silent canopy reduces noise to 65 dB at 1 meter, making it fully suitable for hospitals, hotels, and residential compounds.",
    "q_ar": "هل يمكنكم توريد كبائن عازلة للصوت للاستخدام السكني أو في المستشفيات؟",
    "a_ar": "نعم، نصنع كبائن عازلة للصوت مخصصة محلياً باستخدام فولاذ ST.37 سمك 2 مم مع عزل صوف صخري عالي الكثافة (>70 كجم/م³). تقلل كابينتنا فائقة الصمت الضوضاء إلى 65 ديسيبل على مسافة متر واحد."
  },
  {
    "q_en": "Do you offer synchronization for multiple generators?",
    "a_en": "Yes — we design and install advanced synchronization panels for multi-generator setups, including load sharing, totalizing panels, and Grid-Sync for peak looping applications. We use ComAp InteliGen controllers for parallel operation.",
    "q_ar": "هل تقدمون خدمات المزامنة بين عدة مولدات؟",
    "a_ar": "نعم، نصمم وننصب لوحات مزامنة متقدمة لإعدادات متعددة المولدات، تشمل مشاركة الأحمال ولوحات التجميع وـGrid-Sync لتطبيقات قطع الذروة، باستخدام وحدات تحكم ComAp InteliGen."
  },
  {
    "q_en": "What fuel storage solutions do you provide?",
    "a_en": "We supply custom cylindrical and rectangular steel fuel tanks from 500L to 30,000L (single and double-wall). We also install complete Schedule 40/80 fuel piping networks and automatic transfer pump systems with float switches for unattended operation.",
    "q_ar": "ما حلول تخزين الوقود التي تقدمونها؟",
    "a_ar": "نوفر خزانات وقود فولاذية أسطوانية ومستطيلة مخصصة من 500 لتر إلى 30,000 لتر (جدار مفرد ومزدوج). كما نركب شبكات أنابيب وقود كاملة بتصنيف Schedule 40/80 وأنظمة مضخات نقل أوتوماتيكية."
  },
  {
    "q_en": "Which areas of Egypt do you cover?",
    "a_en": "We operate nationwide from our Cairo HQ in Heliopolis, with a main warehouse in 6th of October City, a Delta branch in Shebin El-Kom (Menoufia), and a fabrication workshop in Giza. We actively serve Cairo, Giza, Alexandria, New Capital, North Coast, Minia Desert, and surrounding governorates.",
    "q_ar": "ما المناطق التي تغطونها في مصر؟",
    "a_ar": "نعمل على المستوى الوطني من مقرنا الرئيسي في هليوبوليس بالقاهرة، مع مخزن رئيسي في مدينة 6 أكتوبر وفرع بالدلتا في شبين الكوم وورشة تصنيع في الجيزة. نخدم بنشاط القاهرة والجيزة والإسكندرية والعاصمة الإدارية والساحل الشمالي وصحراء المنيا."
  },
  {
    "q_en": "Can you handle SCADA integration and remote monitoring?",
    "a_en": "Yes — we design and install SCADA and remote monitoring systems using GSM/Ethernet modules linked to BMS infrastructure. Features include cloud-based logging, SMS alerts, and real-time asset monitoring accessible from any device.",
    "q_ar": "هل يمكنكم التعامل مع تكامل SCADA والمراقبة عن بُعد؟",
    "a_ar": "نعم، نصمم وننصب أنظمة SCADA ومراقبة عن بُعد باستخدام وحدات GSM/Ethernet مرتبطة بأنظمة BMS. تشمل الميزات التسجيل السحابي والتنبيهات عبر SMS والمراقبة الفورية للأصول من أي جهاز."
  }
];

// ── PDF config ───────────────────────────────────────────────────
const PDFS={
  perkins:{file:'/perkins-specs.pdf',title:'Perkins Series — Technical Specification Sheet',title_ar:'بيركنز — كتيب المواصفات الفنية'},
  volvo:  {file:'/volvo-specs.pdf',  title:'Volvo Penta — Technical Specification Sheet',  title_ar:'فولفو بنتا — كتيب المواصفات الفنية'},
  doosan: {file:'/doosan-specs.pdf', title:'Doosan — Technical Specification Sheet',        title_ar:'دوسان — كتيب المواصفات الفنية'},
};

// ── Reveal on scroll ─────────────────────────────────────────────
const revealObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revealObs.observe(el));

// ── Counter animation ────────────────────────────────────────────
const counterObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const el=e.target, target=parseInt(el.dataset.target,10);
    const suffix=el.textContent.replace(/[0-9]/g,'');
    let t0=null;
    (function step(ts){
      if(!t0)t0=ts;
      const p=Math.min((ts-t0)/1800,1), ease=1-Math.pow(1-p,3);
      el.textContent=Math.floor(ease*target)+suffix;
      if(p<1) requestAnimationFrame(step);
    })(performance.now());
    counterObs.unobserve(el);
  });
},{threshold:.5});
document.querySelectorAll('.counter').forEach(el=>counterObs.observe(el));

// ── Hero bar animation ───────────────────────────────────────────
setTimeout(()=>{
  const b=document.getElementById('hero-bar-fill');
  if(b) b.style.width='87%';
},600);

// ── Navbar scroll ────────────────────────────────────────────────
const nav=document.getElementById('navbar');
window.addEventListener('scroll',()=>{
  if(!scrollTick){
    requestAnimationFrame(()=>{
      nav.classList.toggle('scrolled',window.scrollY>30);
      scrollTick=false;
    });
    scrollTick=true;
  }
},{passive:true});

// ── Mobile menu ──────────────────────────────────────────────────
function toggleMenu(){
  const m=document.getElementById('mobile-menu');
  const open=m.classList.toggle('open');
  document.getElementById('hamburger-btn').setAttribute('aria-expanded',open);
  document.body.style.overflow=open?'hidden':'';
  if(open){const a=m.querySelector('a');if(a)a.focus();}
  else document.getElementById('hamburger-btn').focus();
}

// ── FAB ──────────────────────────────────────────────────────────
function toggleFab(){
  const o=document.getElementById('fab-options');
  const btn=document.querySelector('.fab-trigger');
  const open=o.classList.toggle('open');
  btn.setAttribute('aria-expanded',open);
}

// ── Spec accordion ───────────────────────────────────────────────
function toggleSpec(id){
  const body=document.getElementById(id);
  const arrow=document.getElementById('sarrow-'+id.replace('spec-',''));
  const btn=body.previousElementSibling;
  const isOpen=body.classList.contains('open');
  document.querySelectorAll('.spec-body').forEach(b=>{
    if(b.id!==id){b.classList.remove('open');const a=b.previousElementSibling;if(a)a.setAttribute('aria-expanded','false');}
  });
  document.querySelectorAll('.spec-arrow').forEach(a=>{
    if(a.id!=='sarrow-'+id.replace('spec-','')) a.textContent='▼';
  });
  body.classList.toggle('open',!isOpen);
  if(arrow) arrow.textContent=isOpen?'▼':'▲';
  btn.setAttribute('aria-expanded',!isOpen);
}

// ── Sound visualizer ─────────────────────────────────────────────
function setSound(mode){
  const selected=['open','standard','silent'].includes(mode)?mode:'open';
  const values={open:[105,'100%','#D94444','soundOpenEquiv'],standard:[85,'70%','#E09020','soundTraffic'],silent:[65,'45%','#3A9060','soundOffice']};
  const [number,width,color,label]=values[selected];
  document.querySelectorAll('input[name="sound-level"]').forEach(input=>{input.checked=input.value===selected;const card=input.closest('.sound-tier');card.classList.toggle('active',input.checked);card.style.borderTopColor=input.checked?color:'transparent';});
  const fill=document.getElementById('sound-fill');fill.style.width=width;fill.style.background=color;
  const db=document.getElementById('sound-db');db.textContent=number+' dB';db.style.color=color;
  document.getElementById('sound-equiv').textContent=T[lang][label];
}

// ── PDF modal ────────────────────────────────────────────────────
let pdfOpener=null;
let pdfPreviousOverflow='';
function openPdf(brand){
  const c=PDFS[brand]; if(!c) return;
  const modal=document.getElementById('pdf-modal');
  if(!modal.classList.contains('open')){
    pdfOpener=document.activeElement;
    pdfPreviousOverflow=document.body.style.overflow;
  }
  document.getElementById('pdf-modal-title').textContent=lang==='ar'?c.title_ar:c.title;
  const frame=document.getElementById('pdf-iframe');
  frame.title=T[lang].pdfPreviewLabel||'PDF specification preview';
  frame.src=c.file;
  document.getElementById('pdf-open-btn').href=c.file;
  document.getElementById('pdf-dl-btn').href=c.file;
  document.getElementById('pdf-dl-btn').download=c.file;
  document.getElementById('pdf-mobile-open').href=c.file;
  document.getElementById('pdf-mobile-dl').href=c.file;
  document.getElementById('pdf-mobile-dl').download=c.file;
  modal.classList.add('open');
  document.body.style.overflow='hidden';
  requestAnimationFrame(()=>document.getElementById('pdf-close-btn').focus());
}
function closePdf(){
  const modal=document.getElementById('pdf-modal');
  if(!modal.classList.contains('open')) return;
  modal.classList.remove('open');
  document.body.style.overflow=pdfPreviousOverflow;
  setTimeout(()=>{if(!modal.classList.contains('open')) document.getElementById('pdf-iframe').src='';},300);
  const opener=pdfOpener; pdfOpener=null;
  if(opener && typeof opener.focus==='function') opener.focus();
}

// ── Calculator ───────────────────────────────────────────────────
function calcKVA(){
  const v=(id,max,decimal=false)=>{
    const input=document.getElementById(id);
    const number=Number(input.value);
    const value=Number.isFinite(number)?Math.max(0,Math.min(max,decimal?number:Math.floor(number))):0;
    if(input.value!=='' && String(value)!==input.value) input.value=String(value);
    return value;
  };
  const watts=v('c-ac1',50)*1200+v('c-ac3',50)*2400+v('c-pump',50)*750+v('c-pc',50)*200+v('c-light',50)*100;
  const kva=Math.ceil(watts/1000/0.8*1.25);
  const fuel=Math.round(kva*.15*10)/10;
  const hours=v('c-hours',24), price=v('c-price',1000,true);
  document.getElementById('r-kva').textContent=kva;
  document.getElementById('r-fuel').textContent=fuel;
  document.getElementById('r-cost').textContent=hours>0?Math.round(fuel*hours*price).toLocaleString(lang==='ar'?'ar-EG':'en-GB'):'—';
  document.getElementById('calc-placeholder').style.display=kva>0?'none':'block';
  document.getElementById('calc-result').style.display=kva>0?'flex':'none';
  return kva;
}

// Keep product context separate from the customer's own message.
function requestQuote(brand){
  const kva=calcKVA();
  if(!window.PremiumPowerEnquiry.open('sales')) return;
  window.PremiumPowerEnquiry.setProduct({brand:brand||'',capacity:kva||''});
}

// ── Contact form ─────────────────────────────────────────────────
function submitForm(e){
  return window.PremiumPowerEnquiry.submitForm(e);
}

// ── Enquiry path entry point ─────────────────────────────────────
function openEnquiry(type,plan){
  return window.PremiumPowerEnquiry.open(type,plan);
}

// ── Notification ─────────────────────────────────────────────────
function showNotif(msg){
  document.getElementById('notif-msg').textContent=msg;
  document.getElementById('notif').classList.add('open');
}
function closeNotif(){ document.getElementById('notif').classList.remove('open'); }

// ── FAQ render ───────────────────────────────────────────────────
function renderFAQs(){
  const c=document.getElementById('faq-list'); c.replaceChildren();
  FAQS.forEach(item=>{
    const details=document.createElement('details');
    details.className='faq-item'; details.name='home-faq';
    const question=document.createElement('summary'); question.className='faq-q';
    question.textContent=item['q_'+lang];
    const answer=document.createElement('p'); answer.textContent=item['a_'+lang];
    details.append(question,answer); c.appendChild(details);
  });
}

// ── Language switch ──────────────────────────────────────────────
function switchLanguage(l){
  lang=l;
  const t=T[l];
  document.documentElement.lang=l;
  document.title=t.pageTitle;
  if(l==='ar'){ document.body.dir='rtl'; document.body.classList.add('rtl'); }
  else { document.body.dir='ltr'; document.body.classList.remove('rtl'); }
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.getAttribute('data-i18n');
    if(t[k]===undefined) return;
    // Section titles carry a \n line break; the part after it takes the accent colour.
    el.innerHTML = el.classList.contains('sec-title')
      ? t[k].split('\n').map((part,i)=> i ? '<span class="accent">'+part+'</span>' : part).join('<br>')
      : t[k];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const k=el.getAttribute('data-i18n-placeholder');
    if(t[k]!==undefined) el.setAttribute('placeholder',t[k]);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el=>{
    const k=el.getAttribute('data-i18n-aria-label');
    if(t[k]!==undefined) el.setAttribute('aria-label',t[k]);
  });
  if(window.PremiumPowerEnquiry&&typeof window.PremiumPowerEnquiry.refreshLanguage==='function'){
    window.PremiumPowerEnquiry.refreshLanguage();
  }
  renderFAQs();
  // refresh sound
  const selectedSound=document.querySelector('input[name="sound-level"]:checked');
  setSound(selectedSound?selectedSound.value:'open');
}

// ── ESC key ──────────────────────────────────────────────────────
document.addEventListener('keydown',e=>{
  const menu=document.getElementById('mobile-menu');
  if(e.key==='Tab' && menu.classList.contains('open')){
    const items=Array.from(menu.querySelectorAll('a, button')).filter(el=>el.getClientRects().length);
    const first=items[0],last=items[items.length-1];
    if(first && e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
    else if(last && !e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
  }
  const modal=document.getElementById('pdf-modal');
  if(e.key==='Tab' && modal.classList.contains('open')){
    const items=Array.from(modal.querySelectorAll('a[href],button:not(:disabled),iframe,[tabindex]:not([tabindex="-1"])')).filter(el=>el.getClientRects().length);
    const first=items[0],last=items[items.length-1];
    if(first && e.shiftKey && (document.activeElement===first || !modal.contains(document.activeElement))){e.preventDefault();last.focus();}
    else if(last && !e.shiftKey && (document.activeElement===last || !modal.contains(document.activeElement))){e.preventDefault();first.focus();}
  }
  if(e.key==='Escape'){
    if(modal.classList.contains('open')){e.preventDefault();closePdf();}
    closeNotif();
    if(menu.classList.contains('open'))toggleMenu();
  }
});

// ── Click outside FAB ────────────────────────────────────────────
document.addEventListener('click',e=>{
  const fab=document.getElementById('fab-menu');
  if(!fab.contains(e.target)) { document.getElementById('fab-options').classList.remove('open'); document.querySelector('.fab-trigger').setAttribute('aria-expanded','false'); }
});

// ── Init ─────────────────────────────────────────────────────────
switchLanguage(document.documentElement.lang === 'ar' ? 'ar' : 'en');

// A brand page hands the form its context through /?brand=Perkins#contact.
// Matched against the known marques rather than used as given, so the query
// string cannot put arbitrary text into the enquiry.
const wantedBrand=new URLSearchParams(location.search).get('brand');
if(wantedBrand){
  const known=['Perkins','Volvo Penta','Doosan']
    .find(b=>b.toLowerCase()===wantedBrand.trim().toLowerCase());
  if(known){
    window.PremiumPowerEnquiry.open('sales');
    window.PremiumPowerEnquiry.setProduct({brand:known});
  }
}

// ── Expose ─────────────────────────────────────────────────────
window.app={
  toggleMenu,toggleFab,toggleSpec,setSound,
  openPdf,closePdf,calcKVA,requestQuote,openEnquiry,
  submitForm,closeNotif,switchLanguage
};

})();
