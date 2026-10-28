(function(){
'use strict';

// ── State ────────────────────────────────────────────────────────
let lang = 'en';
let scrollTick = false;

// ── Translations ─────────────────────────────────────────────────
const T = {
en:{
  pageTitle:"Diesel Generators in Egypt | Premium Power",
  perkinsModels:'Perkins models & ratings',
  volvoModels:'Volvo Penta models & ratings',
  doosanModels:'Doosan models & ratings',
  skipNav:'Skip to main content',
  heroTag:"Generators & maintenance — Egypt",
  heroLine1:'DIESEL',heroLine2:'GENERATORS',heroLine3:'EGYPT',
  heroSub:"Compare Perkins, Volvo Penta and Doosan generators for your project, or discuss maintenance for your existing equipment.",
  heroCardTitle:'Power Range',engine:'Engine',alternator:'Alternator',heroSupport:'Support',heroWarranty:'Warranty',
  scrollHint:'Scroll',
  btnFindGen:'Find Your Generator',btnContact:'Get in Touch',btnQuote:'Get Quote',btnGeneratorQuote:'Request a Generator Quote',btnMaintenanceAssessment:"Explore maintenance services",
  navClients:'Clients',navProducts:'Generators',navCalc:'Calculator',navProjects:"Applications",navContact:'Contact',navHome:'Home',navServices:'Services',navPortfolio:"What to prepare",navLocations:'Locations',navVision:'About Us',navAMC:'Maintenance',navSpecs:'Tech Specs',navFuel:'Fuel Systems',navCerts:'Certifications',navCert:'Certifications',
  stat1:"Generator sales",stat2:"Generator maintenance",stat3:"Technical information",stat4:"Contact the team",
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
  fuelTag1:"500 L to 30,000 L",
  fuelTag2:"Single or double wall",
  fuelTag3:"Coating requirement",
  fuelTag4:"Schedule 40 / 80",
  fuelTag5:"Seamless steel",
  fuelTag6:"Valve set",
  fuelTag7:"Automatic transfer",
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
  clientsLabel:"Our clients",clientsTitle:"CLIENTS &\nSECTORS",clientsSub:"Explore the sectors represented by our client portfolio and discuss your project requirements.",
  client1:'Egyptian Ambulance Organization',client2:'Canal For Sugar',client3:'Upwyde — Cinco Mall',client4:'SODIC — Ogami North Coast',
  client5:'Concord — New Mansoura',client6:'OliveLand Agriculture',client7:"Salah Eldin Int'l School",client8:'New Urban Communities Authority',
  productsLabel:"Generator range",productsTitle:'THREE BRANDS.\nONE STANDARD.',productsSub:"Browse published model ranges and specifications for Perkins, Volvo Penta and Doosan. Confirm current availability and project scope in a written offer.",
  perkinsName:'Perkins Series',perkinsOrigin:'United Kingdom · 9 kVA – 2500 kVA',perkinsDesc:"Perkins engine models listed for generator applications. Confirm the selected model, rating basis and availability in the written offer.",
  volvoName:'Volvo Penta',volvoOrigin:'Sweden · 85 kVA – 700 kVA',volvoDesc:"Volvo Penta engine models listed for generator applications. Confirm the selected model, rating basis and availability in the written offer.",
  doosanName:'Doosan',doosanOrigin:'South Korea · 150 kVA – 825 kVA',doosanDesc:"Doosan engine models listed for generator applications. Confirm the selected model, rating basis and availability in the written offer.",
  btnSpecs:'Technical Specifications',btnViewSpec:'View Spec Sheet',btnAllModels:'All Models & Ratings',btnRequestQuote:'Request Quote',btnDownloadPdf:'Download PDF',
  specCyl:'Cylinders',specGov:'Governor',specAsp:'Aspiration',specMechElec:'Mechanical / Electronic',specTurbo:'Turbocharged',specTurboInt:'Turbo + Intercooler',specEcu:'Electronic (ECU)',specTurboAfter:'Turbo + Aftercooler',
  servicesLabel:'What We Offer',servicesTitle:'COMPLETE\nPOWER SOLUTIONS',
  svc1:'Open-Type Generators',svc1Desc:"Generator configuration and rating are selected against operating conditions and confirmed in the offer.",
  svc2:'Soundproof Canopies',svc2Desc:"Discuss enclosure options and noise criteria for the selected generator. Confirm performance and measurement conditions in the offer.",
  svc3:'LV Panels & ATS',svc3Desc:"List transfer, control and distribution requirements so the included panel scope can be confirmed in writing.",
  svc4:'External Fuel Tanks',svc4Desc:"Confirm tank capacity, construction and accessories against the site and operating requirement.",
  svc5:"Parts Enquiries",svc5Desc:"Share the part number or equipment details. Source, specification, availability and price are confirmed before quotation.",
  svc6:'Turnkey Installation',svc6Desc:"The written scope identifies which site works, connections and commissioning activities are included.",
  svc7:'Maintenance Contracts',svc7Desc:"Discuss preventive or corrective maintenance for your generator. See the maintenance service page for the request path.",
  svcCta:'Custom Solution?',svcCtaDesc:'Talk to our engineers for a tailored power package.',svcCtaLink:'Contact Us →',
  tsLabel:"Published Technical Data",tsTitle:"MODEL\nINFORMATION",tsDesc:"Model and component details are shown where source information is available. Check the selected model sheet and written offer.",
  tsEngineLabel:'Engine Standards',tsEngineTitle:'Perkins · Volvo · Doosan',tsCycle:'Cycle',tsCooling:'Cooling',tsInduction:'Induction',tsGovernor:'Governor',tsEmissions:'Emissions',tsFreq:'Frequency',tsVoltage:'Voltage',
  tsAltLabel:'Alternator Standards',tsAltTitle:'LeroySomer · Stamford',tsInsul:'Insulation',tsProtect:'Protection',tsExcit:'Excitation',tsWinding:'Winding',tsAVR:'AVR',tsVoltReg:"Voltage regulation",
  tsCtrlLabel:'Control Systems',tsCtrlTitle:'DSE · ComAp',tsDSEDesc:'UK-made industry standard controllers',tsComApDesc:'Advanced synchronization & parallel solutions',
  fuelInfraLabel:'Supply & Storage',fuelInfraTitle:'FUEL\nINFRASTRUCTURE',fuelInfraDesc:"Fuel storage and transfer requirements depend on the generator, load, site layout and operating duration. Confirm capacity and controls for each project.",
  fuelTank1:'External Bulk Tanks',fuelTank1Desc:"Tank type, capacity, construction and requested safety provisions are confirmed against the site requirement.",
  fuelPiping:'Fuel Piping Networks',fuelPipingDesc:"Piping class, valves and instrumentation are listed in the project scope for confirmation.",
  fuelPump:'Transfer Pump Systems',fuelPumpDesc:"Pump and control requirements depend on tank layout and the requested operating sequence.",
  amcLabel:'Support & Care',amcTitle:'MAINTENANCE\nCONTRACTS',amcDesc:"Maintenance scope depends on the generator and site. The written proposal confirms visits, included tasks, response terms, parts and pricing.",
  amcStdTier:'Standard AMC',amcStdName:'Standard',amcStdF1:"Request a visit schedule for your site",amcStdF2:"Confirm included tasks in the proposal",amcStdF3:"Parts, response terms and pricing confirmed in writing",amcStdF4:"Scope stated in the written offer",amcStdF5:"Ask which visit records are included",amcStdCta:'Ask About Standard AMC',
  amcPremTier:'Premium AMC+',amcPremName:'Premium',amcPremF1:"Discuss planned service intervals",amcPremF2:"Confirm equipment and site scope",amcPremF3:"Parts, response terms and pricing confirmed in writing",amcPremF4:"Scope stated in the written offer",amcPremF5:"Ask which visit records are included",amcPremCta:'Ask About Premium AMC+',
  amcPopular:"Plan option",amcScopeLabel:'WHAT EVERY VISIT COVERS',
  amcS1:'Engine Health Check',amcS1D:'Oil level, belts, filters, and all mechanical wear points inspected.',
  amcS2:'Coolant & Oil Analysis',amcS2D:'Fluid condition, concentration levels, and contamination checks.',
  amcS3:'Battery System Test',amcS3D:'Charge capacity, terminal condition, and starting circuit verification.',
  amcS4:"Response terms",amcS4D:"Ask for response arrangements to be stated in the written proposal.",
  certLabel:"Project Scope",certTitle:"DOCUMENTS &\nREQUIREMENTS",certDesc:"Generator and installation requirements vary by model and site. List requested documents, work, tests and access conditions so the offer can define its scope.",
  cert1Name:"Model documents",cert1Desc:"Request the current model data sheet and clarify its rating basis in the offer.",
  cert2Name:"Installation scope",cert2Desc:"Confirm which site works, connections and commissioning activities are included.",
  cert3Name:"Testing requirements",cert3Desc:"List requested tests and the conditions under which they should be performed.",
  cert4Name:"Site access",cert4Desc:"Share access limits, permits and coordination requirements for review.",
  hseLabel:'HSE PROTOCOLS',hse1:'Zero Accident Policy',hse1D:'Strict site safety enforcement — no exceptions for any project scale.',
  hse2:'Mandatory PPE',hse2D:'Full personal protective equipment required for all technicians on site.',
  hse3:'Pre-Installation Risk Assessment',hse3D:'Written risk assessment completed and signed off before every installation begins.',
  svc8:'Load Bank Testing',svc8Desc:'Professional on-site load bank testing and full performance validation per IEC standards.',
  svc9:'Engineering Consult',svc9Desc:'Expert load analysis, sizing calculations, single-line diagrams, and full technical design packages.',
  visionLabel:'Corporate Identity',visionTitle:'WHO WE\nARE',visionDesc:"We discuss generator supply, installation and maintenance requirements for sites in Egypt.",
  visionCardLabel:'Vision',visionStatement:"Our focus is helping customers define generator and maintenance requirements for review.",
  missionCardLabel:'Mission',missionStatement:"We work with customers to clarify equipment, site and service scope in a written proposal.",
  val1:"Clear scope",val1Sub:"Requirements stated in writing",val2:"Site awareness",val2Sub:"Access and operating conditions reviewed",val3:"Communication",val3Sub:"Details confirmed before work is agreed",val4:"Technical fit",val4Sub:"Model suitability reviewed against the request",
  portfolioLabel:"Enquiry preparation",portfolioTitle:"DETAILS TO\nPREPARE",portfolioDesc:"For generator sales or maintenance, share what you know. The team can clarify remaining questions.",
  sec1:"Equipment",sec2:"Site",sec3:"Operating needs",sec4:'Agriculture',sec5:'Contractors',sec6:'Industry & Retail',
  locLabel:'Operational Network',locTitle:'OUR REACH\nACROSS EGYPT',
  locFacilities:'Strategic Facilities',locRegions:'Active Market Regions',
  locHQTag:'Central Management',locHQ:'Cairo HQ',locWHTag:'Logistics Center',locWH:'Main Warehouse',
  locDeltaTag:'Regional Support',locDelta:'Delta Branch',locWSTag:'Fabrication Unit',locWS:'Sheet Metal Workshop',
  locCoverage:'Nationwide Coverage',locCoverageDesc:"Service availability, travel arrangements and site requirements are confirmed for each enquiry.",
  soundOpenEquiv:"No enclosure",tier1Label:"Open set",tier1Desc:"No enclosure",tier2Label:"Enclosed set",tier2Desc:"Configuration to be confirmed",tier3Label:"Acoustic enclosure",tier3Desc:"Configuration to be confirmed",
  soundMaterialNote:"Enclosure materials and construction are confirmed for the selected model.",
  workflowLabel:'Our Process',workflowTitle:'HOW WE\nDELIVER',
  step1:"Share site details",step1D:"Provide the location and operating conditions available for review.",
  step2:"Define the requirement",step2D:"Clarify the generator, installation or maintenance scope requested.",
  step3:"Review the proposal",step3D:"Check equipment, included work, documentation and terms in writing.",
  step4:"Plan the work",step4D:"Confirm site access, schedule and responsibilities before work begins.",
  step5:"Close out",step5D:"Confirm requested records and handover items in the agreed scope.",
  calcLabel:'Interactive Tool',calcTitle:'POWER SIZE\nCALCULATOR',calcSub:'Enter your equipment below to get an instant kVA estimate with fuel consumption and daily cost.',
  calcEquipment:'YOUR EQUIPMENT',calcHours:'Operating Hours / Day',calcHoursSub:'How long the generator runs each day',calcHint:'Enter your appliances to see the recommended generator size.',calcEstimate:'ESTIMATED REQUIREMENT',
  ac1:'AC Unit (1.5 HP)',ac1W:'≈ 1,200 W each',ac3:'AC Unit (3.0 HP)',ac3W:'≈ 2,400 W each',
  pump:'Water Pump (1 HP)',pumpW:'≈ 750 W each',pc:'PC / Workstation',pcW:'≈ 200 W each',light:'Lighting (Room)',lightW:'≈ 100 W each',
  fuelLabel:'Fuel Consumption',fuelUnit:'L/hr',costLabel:'Daily Fuel Cost',
  fuelPrice:'Diesel price (EGP/L)',
  calcNote:"Preliminary estimate only. Starting loads, motor loads, load profile and selected model require technical review. Fuel use and daily cost are indicative inputs, not a model-specific measurement or quote.",
  calcCta:"Request a generator quote",
  soundLabel:'Acoustic Engineering',soundTitle:"VISUAL\nCOMPARISON",
  soundOpen:'Standard (Open)',soundSilent:'Soundproof Canopy',soundTraffic:"Enclosure configuration",soundOffice:"Acoustic enclosure configuration",
  soundDesc:"Compare enclosure configurations visually. Noise outcomes depend on the generator, enclosure, load, installation and measurement conditions; request model-specific data when required.",
  soundB1:"Ask which enclosure options suit the selected model",soundB2:"Confirm any noise target and measurement distance",soundB3:"Check dimensions and site clearances",soundB4:"Confirm maintenance access requirements",
  projectsLabel:"Illustrative examples",projectsTitle:"APPLICATION\nSCENARIOS",
  proj1Loc:"Illustrative use case",proj1Title:"Healthcare backup power",proj1Desc:"Illustrative application only; confirm site requirements and scope for each enquiry.",
  proj2Loc:"Illustrative use case",proj2Title:"Construction-site power",proj2Desc:"Illustrative application only; confirm site requirements and scope for each enquiry.",
  proj3Loc:"Illustrative use case",proj3Title:"Data-centre backup power",proj3Desc:"Illustrative application only; confirm site requirements and scope for each enquiry.",
  galleryLabel:"Equipment gallery",galleryTitle:"GENERATOR\nIMAGES",
  compLabel:"Offer review",compTitle:"WHAT TO CONFIRM\nIN WRITING",
  compFeature:"Topic",compUs:"Confirm in the offer",compThem:"Questions to ask",compUsSub:"Included scope",compThemSub:"Before you decide",compRecommended:"Review",
  compR1:"Equipment",compR1Us:"Brand, model and rating",compR1Them:"Which load and operating conditions does the rating cover?",
  compR2:"Installation",compR2Us:"Site works and connections included",compR2Them:"What must be arranged by the site owner?",
  compR3:"Maintenance",compR3Us:"Visit schedule and included tasks",compR3Them:"How are breakdowns and response terms described?",
  compR4:"Parts",compR4Us:"References, source and availability",compR4Them:"Are alternatives acceptable, and what documentation is supplied?",
  compR5:"Documentation",compR5Us:"Datasheets, test scope and warranty terms",compR5Them:"Which documents are included with this offer?",
  faqLabel:'Common Questions',faqTitle:'FREQUENTLY\nASKED',
  contactLabel:'Get in Touch',contactTitle:"LET'S POWER\nYOUR PROJECT",
  contactSub:'Contact our team for a generator quote or a maintenance assessment. Share your site needs and we will help you choose the next step.',
  ctPhone:'Phone',ctEmail:'Email',ctAddress:'Address',ctHours:'Office Hours',ctHoursVal:'Sun – Thu, 9:00 AM – 5:00 PM',
  formTitle:'SEND AN ENQUIRY',fName:'Your Name',fNamePlaceholder:'Mohamed Ahmed',fPhone:'Phone Number',fPhonePlaceholder:'01XXXXXXXXX',fLocation:'Project Location',fLocationPlaceholder:'Cairo / governorate',fType:'Enquiry Type',fTypeSales:'Generator quote',fTypeMaintenance:'Maintenance assessment',fPlan:'Maintenance Plan',fPlanAssessment:'Assessment first',fPlanStandard:'Standard AMC',fPlanPremium:'Premium AMC+',fMessage:'Message',fMessagePlaceholder:'Tell us what you know: load, brand, or running hours (optional).',fNote:'Share the details you have — load, preferred brand, running hours, or site needs — and our team will guide the next step.',fSubmit:'Send Enquiry →',
  fDataUse:'We use the details you submit to respond to your enquiry.',fFallbackLabel:'If the form is unavailable,',fFallbackCall:'call 012 2968 8688',fFallbackOr:'or',fFallbackWhatsapp:'message us on WhatsApp',
  pdfMobile:"If the preview is unavailable, open the PDF in a new tab or download it.",
  footerTagline:"Generator sales, installation enquiries and maintenance services for sites in Egypt.",
  footerProducts:'Products',footerCompany:'Company',footerSoundproof:"Acoustic Enclosures",footerParts:"Parts Enquiries",
  footerProcess:'Our Process',footerProjects:"Applications",footerWhy:"Offer Review",footerContact:'Contact',footerCalc:'Power Calculator',
  notifTitle:"Enquiry submitted",notifClose:'Close',
  formSuccess:"Your enquiry has been submitted. The team will review the details provided for follow-up.",
  formInvalidPhone:'Please enter a valid Egyptian phone number (e.g. 01XXXXXXXXX)',
  chatSales:"Generator sales enquiry",chatEmergency:"Call our team",
},
ar:{
  pageTitle:"مولدات ديزل في مصر | بريميوم باور",
  perkinsModels:'موديلات بيركنز وقدراتها',
  volvoModels:'موديلات فولفو بنتا وقدراتها',
  doosanModels:'موديلات دوسان وقدراتها',
  skipNav:'انتقل إلى المحتوى الرئيسي',
  heroTag:"مولدات ديزل وصيانة في مصر",
  heroLine1:'مولدات',heroLine2:'ديزل',heroLine3:'مصر',
  heroSub:"قارن مولدات بيركنز وفولفو بنتا ودوسان لمشروعك، أو ناقش احتياجات صيانة معداتك الحالية.",
  heroCardTitle:'نطاق القدرة',engine:'المحرك',alternator:'المولد',heroSupport:'الدعم',heroWarranty:'الضمان',
  scrollHint:'تمرير',
  btnFindGen:'ابحث عن مولدك',btnContact:'تواصل معنا',btnQuote:'اطلب عرضاً',btnGeneratorQuote:'اطلب عرض سعر لمولد',btnMaintenanceAssessment:"استعرض خدمات الصيانة",
  navClients:'العملاء',navProducts:'المولدات',navCalc:'الحاسبة',navProjects:"الاستخدامات",navContact:'اتصل بنا',navHome:'الرئيسية',navServices:'الخدمات',navPortfolio:"معلومات للطلب",navLocations:'مواقعنا',navVision:'عن الشركة',navAMC:'الصيانة',navSpecs:'المواصفات',navFuel:'أنظمة الوقود',navCerts:'الشهادات',navCert:'الشهادات',
  stat1:"توريد المولدات",stat2:"صيانة المولدات",stat3:"المعلومات الفنية",stat4:"تواصل مع الفريق",
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
  fuelTag3:"متطلبات الطلاء",
  fuelTag4:"جدول 40 / 80",
  fuelTag5:"فولاذ غير ملحوم",
  fuelTag6:"مجموعة صمامات",
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
  clientsLabel:"عملاؤنا",clientsTitle:"عملاؤنا\nوالقطاعات",clientsSub:"تعرّف على القطاعات التي تضمها قائمة عملائنا وناقش متطلبات مشروعك.",
  client1:'هيئة الإسعاف المصرية',client2:'القناة للسكر',client3:'أب وايد — سينكو مول',client4:'سوديك — عجيمي الساحل الشمالي',
  client5:'كونكورد — المنصورة الجديدة',client6:'أوليف لاند للزراعة',client7:'مجمع مدارس صلاح الدين',client8:'هيئة المجتمعات العمرانية الجديدة',
  productsLabel:"نطاق المولدات",productsTitle:'ثلاث ماركات\nمعيار واحد.',productsSub:"استعرض بيانات الموديلات والمواصفات المنشورة لبيركنز وفولفو بنتا ودوسان. يُؤكد التوافر الحالي ونطاق المشروع في عرض مكتوب.",
  perkinsName:'سلسلة بيركنز',perkinsOrigin:'المملكة المتحدة · 9 ك.ف.أ – 2500 ك.ف.أ',perkinsDesc:"موديلات محركات بيركنز المدرجة لتطبيقات المولدات. يُؤكد الموديل المختار وأساس القدرة والتوافر في العرض المكتوب.",
  volvoName:'فولفو بنتا',volvoOrigin:'السويد · 85 ك.ف.أ – 700 ك.ف.أ',volvoDesc:"موديلات محركات فولفو بنتا المدرجة لتطبيقات المولدات. يُؤكد الموديل المختار وأساس القدرة والتوافر في العرض المكتوب.",
  doosanName:'دوسان',doosanOrigin:'كوريا الجنوبية · 150 ك.ف.أ – 825 ك.ف.أ',doosanDesc:"موديلات محركات دوسان المدرجة لتطبيقات المولدات. يُؤكد الموديل المختار وأساس القدرة والتوافر في العرض المكتوب.",
  btnSpecs:'المواصفات الفنية',btnViewSpec:'عرض الكتيب',btnAllModels:'كل الموديلات والقدرات',btnRequestQuote:'طلب عرض سعر',btnDownloadPdf:'تحميل PDF',
  specCyl:"عدد الأسطوانات",specGov:"منظم السرعة",specAsp:"السحب والشحن",specMechElec:'ميكانيكي / إلكتروني',specTurbo:"شاحن توربيني",specTurboInt:"شاحن توربيني + مبرد بيني",specEcu:'إلكتروني (ECU)',specTurboAfter:"شاحن توربيني + مبرد لاحق",
  servicesLabel:'خدماتنا',servicesTitle:'حلول طاقة\nكاملة',
  svc1:'مولدات مفتوحة',svc1Desc:"يُحدد التكوين والقدرة وفق ظروف التشغيل، ويُؤكدان في العرض.",
  svc2:'كبائن عازلة للصوت',svc2Desc:"ناقش خيارات الكابينة ومتطلبات الضوضاء للمولد المختار. يُؤكد الأداء وظروف القياس في العرض.",
  svc3:'لوحات الجهد المنخفض و ATS',svc3Desc:"اذكر متطلبات التحويل والتحكم والتوزيع لتحديد نطاق اللوحات المشمول كتابةً.",
  svc4:'خزانات وقود خارجية',svc4Desc:"تُحدد سعة الخزان وتصنيعه وملحقاته وفق متطلبات الموقع والتشغيل.",
  svc5:"استفسارات قطع الغيار",svc5Desc:"أرسل رقم القطعة أو بيانات المعدات. يُؤكد المصدر والمواصفات والتوافر والسعر قبل تقديم العرض.",
  svc6:'تركيب شامل',svc6Desc:"يوضح النطاق المكتوب أعمال الموقع والتوصيلات والتشغيل المشمولة.",
  svc7:'عقود الصيانة',svc7Desc:"استفسر عن الصيانة الوقائية أو التصحيحية لمولدك. راجع صفحة الصيانة لمعرفة مسار الطلب.",
  svcCta:'تحتاج حلاً مخصصاً؟',svcCtaDesc:'تحدث مع مهندسينا للحصول على باقة طاقة مصممة خصيصاً.',svcCtaLink:'اتصل بنا ←',
  tsLabel:"بيانات فنية منشورة",tsTitle:"معلومات\nالموديلات",tsDesc:"تظهر بيانات الموديل والمكونات عند توفر معلومات منشورة من المصدر. راجع ورقة الموديل المختار والعرض المكتوب.",
  tsEngineLabel:'معايير المحرك',tsEngineTitle:'بيركنز · فولفو · دوسان',tsCycle:'الدورة',tsCooling:'التبريد',tsInduction:'الشحن',tsGovernor:'المنظم',tsEmissions:'الانبعاثات',tsFreq:'التردد',tsVoltage:'الجهد',
  tsAltLabel:'معايير المولد الكهربائي',tsAltTitle:'ليروي سومر · ستامفورد',tsInsul:'العزل',tsProtect:'الحماية',tsExcit:'الإثارة',tsWinding:'اللفائف',tsAVR:'منظم الجهد',tsVoltReg:"تنظيم الجهد",
  tsCtrlLabel:'أنظمة التحكم',tsCtrlTitle:'DSE · ComAp',tsDSEDesc:'وحدات تحكم قياسية صناعية من بريطانيا',tsComApDesc:'حلول متقدمة للتزامن والتشغيل المتوازي',
  fuelInfraLabel:'التوريد والتخزين',fuelInfraTitle:'البنية التحتية\nللوقود',fuelInfraDesc:"تعتمد متطلبات تخزين الوقود ونقله على المولد والحمل وتخطيط الموقع ومدة التشغيل المطلوبة. تُحدد السعة وأنظمة التحكم لكل مشروع.",
  fuelTank1:'خزانات وقود خارجية',fuelTank1Desc:"يُحدد نوع الخزان وسعته وتصنيعه واحتياطات السلامة المطلوبة وفق متطلبات الموقع.",
  fuelPiping:'شبكات أنابيب الوقود',fuelPipingDesc:"تُذكر مواصفات الأنابيب والصمامات وأجهزة القياس ضمن نطاق المشروع للمراجعة.",
  fuelPump:'أنظمة مضخات النقل',fuelPumpDesc:"تعتمد متطلبات المضخة والتحكم على تخطيط الخزانات وتسلسل التشغيل المطلوب.",
  amcLabel:'الدعم والرعاية',amcTitle:'عقود\nالصيانة',amcDesc:"يعتمد نطاق الصيانة على المولد والموقع. يحدد العرض المكتوب الزيارات والمهام وشروط الاستجابة والقطع والأسعار.",
  amcStdTier:'عقد صيانة قياسي',amcStdName:'قياسي',amcStdF1:"اطلب جدول الزيارات المقترح للموقع",amcStdF2:"تأكد من المهام المشمولة في العرض",amcStdF3:"تُحدد القطع وشروط الاستجابة والأسعار كتابةً",amcStdF4:"يُذكر النطاق في العرض المكتوب",amcStdF5:"استفسر عن سجلات الزيارات المشمولة",amcStdCta:'استفسر عن عقد الصيانة القياسي',
  amcPremTier:'عقد صيانة بريميوم+',amcPremName:'بريميوم',amcPremF1:"ناقش الفواصل المقترحة بين الزيارات",amcPremF2:"تأكد من نطاق المعدات والموقع",amcPremF3:"تُحدد القطع وشروط الاستجابة والأسعار كتابةً",amcPremF4:"يُذكر النطاق في العرض المكتوب",amcPremF5:"استفسر عن سجلات الزيارات المشمولة",amcPremCta:'استفسر عن عقد الصيانة بريميوم+',
  amcPopular:"خيار ضمن الخطط",amcScopeLabel:'ما يشمله كل زيارة',
  amcS1:'فحص صحة المحرك',amcS1D:'فحص مستوى الزيت والأحزمة والفلاتر وجميع نقاط التآكل الميكانيكي.',
  amcS2:'تحليل سائل التبريد والزيت',amcS2D:'فحص حالة السوائل ومستويات التركيز واختبار التلوث.',
  amcS3:'اختبار منظومة البطارية',amcS3D:'قدرة الشحن وحالة الأطراف والتحقق من دائرة التشغيل.',
  amcS4:"شروط الاستجابة",amcS4D:"اطلب توضيح ترتيبات الاستجابة في العرض المكتوب.",
  certLabel:"نطاق المشروع",certTitle:"المستندات\nوالمتطلبات",certDesc:"تختلف متطلبات المولد والتركيب حسب الموديل والموقع. اذكر المستندات والأعمال والاختبارات وشروط الدخول المطلوبة ليحدد العرض نطاقه.",
  cert1Name:"مستندات الموديل",cert1Desc:"اطلب ورقة بيانات الموديل الحالية، وتأكد من أساس القدرة في العرض.",
  cert2Name:"نطاق التركيب",cert2Desc:"تأكد من أعمال الموقع والتوصيلات والتشغيل المشمولة.",
  cert3Name:"متطلبات الاختبار",cert3Desc:"اذكر الاختبارات المطلوبة وظروف تنفيذها.",
  cert4Name:"الدخول إلى الموقع",cert4Desc:"شارك قيود الدخول والتصاريح ومتطلبات التنسيق للمراجعة.",
  hseLabel:'بروتوكولات السلامة والصحة المهنية',hse1:'سياسة الصفر حوادث',hse1D:'تطبيق صارم لسلامة الموقع — لا استثناءات بصرف النظر عن حجم المشروع.',
  hse2:'معدات الحماية الشخصية إلزامية',hse2D:'معدات الحماية الشخصية الكاملة مطلوبة لجميع التقنيين في الموقع.',
  hse3:'تقييم المخاطر قبل التركيب',hse3D:'تقييم مخاطر مكتوب يُكتمل ويُوقَّع عليه قبل بدء كل عملية تركيب.',
  svc8:'اختبار الحمل',svc8Desc:'اختبار احترافي بالحمل الوهمي في الموقع مع التحقق الكامل من الأداء وفق معايير IEC.',
  svc9:'استشارة هندسية',svc9Desc:'تحليل أحمال متخصص وحسابات تحجيم ومخططات خط أحادي وحزم تصميم فني كاملة.',
  visionLabel:'هوية الشركة',visionTitle:'من\nنحن',visionDesc:"نناقش متطلبات توريد المولدات وتركيبها وصيانتها للمواقع في مصر.",
  visionCardLabel:'الرؤية',visionStatement:"ينصب اهتمامنا على توضيح متطلبات المولد والصيانة للمراجعة.",
  missionCardLabel:'الرسالة',missionStatement:"نعمل مع العملاء على توضيح المعدات والموقع ونطاق الخدمة في عرض مكتوب.",
  val1:"نطاق واضح",val1Sub:"توضيح المتطلبات كتابةً",val2:"مراعاة الموقع",val2Sub:"مراجعة ظروف الدخول والتشغيل",val3:"التواصل",val3Sub:"تأكيد التفاصيل قبل الاتفاق",val4:"الملاءمة الفنية",val4Sub:"مراجعة الموديل وفق الطلب",
  portfolioLabel:"تجهيز الاستفسار",portfolioTitle:"معلومات\nيمكن تجهيزها",portfolioDesc:"لطلب مولد أو صيانة، شارك ما تعرفه؛ ويمكن للفريق توضيح أي تفاصيل أخرى.",
  sec1:"المعدات",sec2:"الموقع",sec3:"احتياجات التشغيل",sec4:'الزراعة',sec5:'المقاولون',sec6:'الصناعة والتجزئة',
  locLabel:'الشبكة التشغيلية',locTitle:'نطاق تغطيتنا\nعبر مصر',
  locFacilities:'المنشآت الاستراتيجية',locRegions:'مناطق السوق النشطة',
  locHQTag:'الإدارة المركزية',locHQ:'المقر الرئيسي بالقاهرة',locWHTag:'مركز اللوجستيات',locWH:'المخزن الرئيسي',
  locDeltaTag:'الدعم الإقليمي',locDelta:'فرع الدلتا',locWSTag:'وحدة التصنيع',locWS:'ورشة الأعمال المعدنية',
  locCoverage:'تغطية وطنية',locCoverageDesc:"يُؤكد توافر الخدمة وترتيبات الانتقال ومتطلبات الموقع لكل استفسار.",
  soundOpenEquiv:"من دون كابينة",tier1Label:"مجموعة مفتوحة",tier1Desc:"من دون كابينة",tier2Label:"مجموعة مغلقة",tier2Desc:"يُحدد التكوين حسب الطلب",tier3Label:"كابينة عازلة للصوت",tier3Desc:"يُحدد التكوين حسب الطلب",
  soundMaterialNote:"تُحدد مواد الكابينة وطريقة تصنيعها للموديل المختار.",
  workflowLabel:'منهجيتنا',workflowTitle:'كيف نُنجز\nعملنا',
  step1:"شارك بيانات الموقع",step1D:"اذكر الموقع وظروف التشغيل المتاحة للمراجعة.",
  step2:"حدد الاحتياج",step2D:"وضح نطاق المولد أو التركيب أو الصيانة المطلوبة.",
  step3:"راجع العرض",step3D:"راجع المعدات والأعمال والمستندات والشروط كتابةً.",
  step4:"خطط للعمل",step4D:"أكد الدخول إلى الموقع والجدول والمسؤوليات قبل بدء العمل.",
  step5:"استكمال العمل",step5D:"أكد السجلات وبنود التسليم المطلوبة ضمن النطاق المتفق عليه.",
  calcLabel:'أداة تفاعلية',calcTitle:'حاسبة\nقدرة المولد',calcSub:'أدخل معداتك أدناه للحصول على تقدير فوري للـ kVA مع استهلاك الوقود والتكلفة اليومية.',
  calcEquipment:'معداتك',calcHours:'ساعات التشغيل / يوم',calcHoursSub:'كم ساعة يعمل المولد يومياً',calcHint:'أدخل أجهزتك لرؤية حجم المولد الموصى به.',calcEstimate:'المتطلبات المقدرة',
  ac1:'مكيف (1.5 حصان)',ac1W:'≈ 1,200 واط لكل وحدة',ac3:'مكيف (3.0 حصان)',ac3W:'≈ 2,400 واط لكل وحدة',
  pump:'مضخة مياه (1 حصان)',pumpW:'≈ 750 واط لكل وحدة',pc:'كمبيوتر / محطة عمل',pcW:'≈ 200 واط لكل وحدة',light:'إضاءة (غرفة)',lightW:'≈ 100 واط لكل غرفة',
  fuelLabel:'استهلاك الوقود',fuelUnit:'لتر/ساعة',costLabel:'تكلفة الوقود اليومية',
  fuelPrice:'سعر السولار (جنيه/لتر)',
  calcNote:"تقدير أولي فقط. تحتاج أحمال البدء والمحركات ونمط الحمل والموديل المختار إلى مراجعة فنية. استهلاك الوقود والتكلفة اليومية مدخلات تقديرية وليسا قياساً لموديل محدد أو عرض سعر.",
  calcCta:"اطلب عرض سعر لمولد",
  soundLabel:'الهندسة الصوتية',soundTitle:"مقارنة\nمرئية",
  soundOpen:'قياسي (مفتوح)',soundSilent:'كابينة عازلة للصوت',soundTraffic:"تكوين بكابينة",soundOffice:"تكوين بكابينة عازلة للصوت",
  soundDesc:"قارن التكوينات بصرياً. تعتمد نتيجة الضوضاء على المولد والكابينة والحمل والتركيب وظروف القياس؛ اطلب بيانات الموديل المحدد عند الحاجة.",
  soundB1:"استفسر عن خيارات الكابينة المناسبة للموديل",soundB2:"حدد مستوى الضوضاء المطلوب ومسافة القياس",soundB3:"تحقق من الأبعاد والمساحات المتاحة بالموقع",soundB4:"تأكد من متطلبات الوصول للصيانة",
  projectsLabel:"أمثلة توضيحية",projectsTitle:"سيناريوهات\nاستخدام",
  proj1Loc:"استخدام توضيحي",proj1Title:"طاقة احتياطية لمنشأة صحية",proj1Desc:"مثال توضيحي فقط؛ تُحدد متطلبات الموقع والنطاق لكل استفسار.",
  proj2Loc:"استخدام توضيحي",proj2Title:"طاقة لموقع إنشاء",proj2Desc:"مثال توضيحي فقط؛ تُحدد متطلبات الموقع والنطاق لكل استفسار.",
  proj3Loc:"استخدام توضيحي",proj3Title:"طاقة احتياطية لمركز بيانات",proj3Desc:"مثال توضيحي فقط؛ تُحدد متطلبات الموقع والنطاق لكل استفسار.",
  galleryLabel:"صور للمعدات",galleryTitle:"صور\nالمولدات",
  compLabel:"مراجعة العرض",compTitle:"ما يجب تأكيده\nكتابةً",
  compFeature:"البند",compUs:"يُحدد في العرض",compThem:"أسئلة للمراجعة",compUsSub:"نطاق العمل",compThemSub:"قبل القرار",compRecommended:"مراجعة",
  compR1:"المعدات",compR1Us:"الماركة والموديل والقدرة",compR1Them:"ما الأحمال وظروف التشغيل التي تغطيها القدرة؟",
  compR2:"التركيب",compR2Us:"أعمال الموقع والتوصيلات المشمولة",compR2Them:"ما الذي يحتاج مالك الموقع إلى ترتيبه؟",
  compR3:"الصيانة",compR3Us:"جدول الزيارات والمهام المشمولة",compR3Them:"كيف وُضحت الأعطال وشروط الاستجابة؟",
  compR4:"القطع",compR4Us:"الأرقام المرجعية والمصدر والتوافر",compR4Them:"هل البدائل مقبولة، وما المستندات المقدمة؟",
  compR5:"المستندات",compR5Us:"بيانات الموديل ونطاق الاختبار وشروط الضمان",compR5Them:"ما المستندات التي يشملها هذا العرض؟",
  faqLabel:'أسئلة شائعة',faqTitle:'الأسئلة\nالمتكررة',
  contactLabel:'تواصل معنا',contactTitle:'لنشغّل\nمشروعك',
  contactSub:'تواصل مع فريقنا لطلب عرض سعر لمولد أو تقييم للصيانة. شارك احتياجات موقعك وسنساعدك في تحديد الخطوة التالية.',
  ctPhone:'الهاتف',ctEmail:'البريد الإلكتروني',ctAddress:'العنوان',ctHours:'ساعات العمل',ctHoursVal:'الأحد – الخميس، 9:00 صباحاً – 5:00 مساءً',
  formTitle:'إرسال استفسار',fName:'اسمك',fNamePlaceholder:'محمد أحمد',fPhone:'رقم الهاتف',fPhonePlaceholder:'01XXXXXXXXX',fLocation:'موقع المشروع',fLocationPlaceholder:'القاهرة / المحافظة',fType:'نوع الاستفسار',fTypeSales:'عرض سعر لمولد',fTypeMaintenance:'تقييم للصيانة',fPlan:'خطة الصيانة',fPlanAssessment:'التقييم أولاً',fPlanStandard:'عقد الصيانة القياسي',fPlanPremium:'عقد الصيانة بريميوم+',fMessage:'الرسالة',fMessagePlaceholder:'اذكر ما تعرفه: الحمل أو الماركة أو ساعات التشغيل (اختياري).',fNote:'شارك التفاصيل المتاحة — الحمل أو الماركة المفضلة أو ساعات التشغيل أو احتياجات الموقع — وسيرشدك فريقنا إلى الخطوة التالية.',fSubmit:'إرسال الاستفسار ←',
  fDataUse:'نستخدم البيانات التي تقدمها للرد على استفسارك.',fFallbackLabel:'إذا تعذر إرسال النموذج،',fFallbackCall:'اتصل على 012 2968 8688',fFallbackOr:'أو',fFallbackWhatsapp:'راسلنا عبر واتساب',
  pdfMobile:"إذا تعذرت المعاينة، افتح ملف PDF في تبويب جديد أو نزّله.",
  footerTagline:"استفسارات توريد المولدات وتركيبها وصيانتها للمواقع في مصر.",
  footerProducts:'المنتجات',footerCompany:'الشركة',footerSoundproof:"كبائن عازلة للصوت",footerParts:"استفسارات قطع الغيار",
  footerProcess:'منهجيتنا',footerProjects:"الاستخدامات",footerWhy:"مراجعة العرض",footerContact:'اتصل بنا',footerCalc:'حاسبة القدرة',
  notifTitle:"تم تقديم الاستفسار",notifClose:'إغلاق',
  formSuccess:"تم تقديم استفسارك. سيراجع الفريق التفاصيل المقدمة للمتابعة.",
  formInvalidPhone:'الرجاء إدخال رقم هاتف مصري صحيح (مثال: 01XXXXXXXXX)',
  chatSales:"استفسار توريد مولد",chatEmergency:"اتصل بفريقنا",
}};

// ── FAQ data ─────────────────────────────────────────────────────
const FAQS=[
  {
    q_en:'How long does delivery and installation take?',
    a_en:'The schedule depends on the selected model, agreed scope, site readiness and logistics. Request a project schedule in the written offer.',
    q_ar:'كم تستغرق عملية التوصيل والتركيب؟',
    a_ar:'يعتمد الجدول على الموديل ونطاق العمل وجاهزية الموقع واللوجستيات. اطلب تحديد جدول المشروع في العرض المكتوب.'
  },
  {
    q_en:'Do you provide ATS panels and full turnkey installation?',
    a_en:'The written offer should list whether site assessment, civil works, cabling, ATS panels, fuel piping and commissioning are included. Confirm exclusions before accepting.',
    q_ar:'هل تقدمون لوحات ATS والتركيب المتكامل؟',
    a_ar:'يوضح العرض المكتوب ما إذا كان يشمل تقييم الموقع والأعمال المدنية والكابلات ولوحات ATS وأنابيب الوقود والتشغيل. تأكد من الاستثناءات قبل القبول.'
  },
  {
    q_en:'What is the warranty on your generators?',
    a_en:'Warranty coverage and duration depend on the exact model and offer. Request the written warranty terms before placing an order.',
    q_ar:'ما هي فترة ضمان المولدات؟',
    a_ar:'تختلف شروط الضمان ومدته حسب الموديل والعرض. اطلب شروط الضمان المكتوبة قبل إصدار الطلب.'
  },
  {
    q_en:'Are your spare parts 100% genuine OEM?',
    a_en:'Share the equipment details or part number. The offer should identify the part specification, source, availability, price and supporting documents.',
    q_ar:'هل قطع الغيار أصلية 100% من الشركة الأم؟',
    a_ar:'أرسل بيانات المعدات أو رقم القطعة. يوضح العرض مواصفات القطعة ومصدرها وتوافرها وسعرها وأي مستندات داعمة.'
  },
  {
    q_en:'What maintenance contract options are available?',
    a_en:'Maintenance options are discussed per generator and site. The written proposal should state visits, tasks, response terms, parts and pricing.',
    q_ar:'ما خيارات عقود الصيانة السنوية المتاحة؟',
    a_ar:'تُناقش خيارات الصيانة وفق المولد والموقع. ينبغي أن يوضح العرض المكتوب الزيارات والمهام وشروط الاستجابة والقطع والأسعار.'
  },
  {
    q_en:'Can you supply soundproof canopies for residential or hospital use?',
    a_en:'Ask which enclosure options are available for the selected model. Any noise target, measurement distance and site suitability should be stated for that configuration.',
    q_ar:'هل يمكنكم توريد كبائن عازلة للصوت للاستخدام السكني أو في المستشفيات؟',
    a_ar:'استفسر عن خيارات الكابينة المتاحة للموديل المختار. ينبغي تحديد مستوى الضوضاء ومسافة القياس وملاءمة الموقع للتكوين المحدد.'
  },
  {
    q_en:'Do you offer synchronization for multiple generators?',
    a_en:'Share the generator count, controls and requested operating sequence. Confirm compatible equipment and the included panel scope in the written proposal.',
    q_ar:'هل تقدمون خدمات المزامنة بين عدة مولدات؟',
    a_ar:'شارك عدد المولدات ووحدات التحكم وتسلسل التشغيل المطلوب. تأكد من توافق المعدات ونطاق اللوحات المشمول في العرض المكتوب.'
  },
  {
    q_en:'What fuel storage solutions do you provide?',
    a_en:'Tank capacity, construction, piping class, controls and operating sequence should be specified against the site requirement in the offer.',
    q_ar:'ما حلول تخزين الوقود التي تقدمونها؟',
    a_ar:'تُحدد سعة الخزان وتصنيعه وتصنيف الأنابيب وأنظمة التحكم وتسلسل التشغيل وفق متطلبات الموقع في العرض.'
  },
  {
    q_en:'Which areas of Egypt do you cover?',
    a_en:'The published Cairo address is listed in Contact. Confirm service availability and travel arrangements for your site when enquiring.',
    q_ar:'ما المناطق التي تغطونها في مصر؟',
    a_ar:'العنوان المنشور بالقاهرة موجود في قسم التواصل. استفسر عن توافر الخدمة وترتيبات الانتقال إلى موقعك.'
  },
  {
    q_en:'Can you handle SCADA integration and remote monitoring?',
    a_en:'Share the equipment, communication and monitoring requirements. Confirm available interfaces, data handling and included scope for the specific system in the offer.',
    q_ar:'هل يمكنكم التعامل مع تكامل SCADA والمراقبة عن بُعد؟',
    a_ar:'شارك متطلبات المعدات والاتصالات والمراقبة. تأكد من الواجهات المتاحة ومعالجة البيانات والنطاق المشمول للنظام المحدد في العرض.'
  },
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
  const t=T[lang];
  const selected=['open','standard','silent'].includes(mode)?mode:'open';
  document.querySelectorAll('input[name="sound-level"]').forEach(input=>{
    input.checked=input.value===selected;
    const card=input.closest('.sound-tier');
    if(card) card.classList.toggle('active',input.checked);
  });
  const labelKey=selected==='open'?'tier1Label':selected==='standard'?'tier2Label':'tier3Label';
  document.getElementById('sound-db').textContent=t[labelKey];
  document.getElementById('sound-equiv').textContent=t.soundConfigNote;
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
