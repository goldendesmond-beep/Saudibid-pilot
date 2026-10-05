export interface LocalizedOption {
  value: string;
  labelEn: string;
  labelAr: string;
}

export interface RegionTaxonomy {
  id: string;
  nameEn: string;
  nameAr: string;
  nutsFallback: string; // for internal backwards compatibility with legacy matching
  cities: { nameEn: string; nameAr: string }[];
}

export const SAUDI_REGIONS: RegionTaxonomy[] = [
  {
    id: "riyadh",
    nameEn: "Riyadh Region",
    nameAr: "منطقة الرياض",
    nutsFallback: "EL30",
    cities: [
      { nameEn: "Riyadh", nameAr: "الرياض" },
      { nameEn: "Diriyah", nameAr: "الدرعية" },
      { nameEn: "Al-Kharj", nameAr: "الخرج" },
      { nameEn: "Al-Majma'ah", nameAr: "المجمعة" },
      { nameEn: "Al-Duwadimi", nameAr: "الدوادمي" },
    ],
  },
  {
    id: "makkah",
    nameEn: "Makkah Region",
    nameAr: "منطقة مكة المكرمة",
    nutsFallback: "EL41",
    cities: [
      { nameEn: "Jeddah", nameAr: "جدة" },
      { nameEn: "Mecca", nameAr: "مكة المكرمة" },
      { nameEn: "Taif", nameAr: "الطائف" },
      { nameEn: "Rabigh", nameAr: "رابغ" },
      { nameEn: "Al Qunfudhah", nameAr: "القنفذة" },
    ],
  },
  {
    id: "eastern",
    nameEn: "Eastern Province",
    nameAr: "المنطقة الشرقية",
    nutsFallback: "EL52",
    cities: [
      { nameEn: "Dammam", nameAr: "الدمام" },
      { nameEn: "Khobar", nameAr: "الخبر" },
      { nameEn: "Dhahran", nameAr: "الظهران" },
      { nameEn: "Jubail", nameAr: "الجبيل" },
      { nameEn: "Al-Ahsa", nameAr: "الأحساء" },
      { nameEn: "Qatif", nameAr: "القطيف" },
      { nameEn: "Ras Tanura", nameAr: "رأس تنورة" },
      { nameEn: "Hafr Al-Batin", nameAr: "حفر الباطن" },
    ],
  },
  {
    id: "madinah",
    nameEn: "Madinah Region",
    nameAr: "منطقة المدينة المنورة",
    nutsFallback: "EL30",
    cities: [
      { nameEn: "Medina", nameAr: "المدينة المنورة" },
      { nameEn: "Yanbu", nameAr: "ينبع" },
      { nameEn: "Al-Ula", nameAr: "العلا" },
      { nameEn: "Badr", nameAr: "بدر" },
    ],
  },
  {
    id: "tabuk",
    nameEn: "Tabuk Region",
    nameAr: "منطقة تبوك",
    nutsFallback: "EL41",
    cities: [
      { nameEn: "Tabuk", nameAr: "تبوك" },
      { nameEn: "NEOM", nameAr: "نيوم" },
      { nameEn: "Sharma", nameAr: "شرما" },
      { nameEn: "Duba", nameAr: "ضباء" },
      { nameEn: "Al Wajh", nameAr: "الوجه" },
    ],
  },
  {
    id: "asir",
    nameEn: "Asir Region",
    nameAr: "منطقة عسير",
    nutsFallback: "EL52",
    cities: [
      { nameEn: "Abha", nameAr: "أبها" },
      { nameEn: "Khamis Mushait", nameAr: "خميس مشيط" },
      { nameEn: "Bisha", nameAr: "بيشة" },
      { nameEn: "Mahayil", nameAr: "محايل عسير" },
    ],
  },
  {
    id: "qassim",
    nameEn: "Qassim Region",
    nameAr: "منطقة القصيم",
    nutsFallback: "EL30",
    cities: [
      { nameEn: "Buraidah", nameAr: "بريدة" },
      { nameEn: "Unaizah", nameAr: "عنيزة" },
      { nameEn: "Ar Rass", nameAr: "الرس" },
    ],
  },
  {
    id: "hail",
    nameEn: "Hail Region",
    nameAr: "منطقة حائل",
    nutsFallback: "EL30",
    cities: [
      { nameEn: "Hail", nameAr: "حائل" },
      { nameEn: "Baqaa", nameAr: "بقعاء" },
    ],
  },
  {
    id: "jazan",
    nameEn: "Jazan Region",
    nameAr: "منطقة جازان",
    nutsFallback: "EL41",
    cities: [
      { nameEn: "Jazan", nameAr: "جازان" },
      { nameEn: "Sabya", nameAr: "صبيا" },
      { nameEn: "Abu Arish", nameAr: "أبو عريش" },
    ],
  },
  {
    id: "najran",
    nameEn: "Najran Region",
    nameAr: "منطقة نجران",
    nutsFallback: "EL52",
    cities: [
      { nameEn: "Najran", nameAr: "نجران" },
      { nameEn: "Sharurah", nameAr: "شرورة" },
    ],
  },
  {
    id: "northern_borders",
    nameEn: "Northern Borders Region",
    nameAr: "منطقة الحدود الشمالية",
    nutsFallback: "EL30",
    cities: [
      { nameEn: "Arar", nameAr: "عرعر" },
      { nameEn: "Rafha", nameAr: "رفحاء" },
      { nameEn: "Turaif", nameAr: "طريف" },
    ],
  },
  {
    id: "al_jouf",
    nameEn: "Al-Jouf Region",
    nameAr: "منطقة الجوف",
    nutsFallback: "EL41",
    cities: [
      { nameEn: "Sakaka", nameAr: "سكاكا" },
      { nameEn: "Dumat Al-Jandal", nameAr: "دومة الجندل" },
      { nameEn: "Qurayyat", nameAr: "القريات" },
    ],
  },
  {
    id: "al_baha",
    nameEn: "Al-Baha Region",
    nameAr: "منطقة الباحة",
    nutsFallback: "EL52",
    cities: [
      { nameEn: "Al-Baha", nameAr: "الباحة" },
      { nameEn: "Baljurashi", nameAr: "بلجرشي" },
      { nameEn: "Al-Mikhwah", nameAr: "المخواة" },
    ],
  },
];

export interface WorkCategoryTaxonomy {
  id: string;
  nameEn: string;
  nameAr: string;
  cpvFallback: string; // for internal algorithm compatibility
  descriptionEn: string;
  descriptionAr: string;
}

export const SAUDI_WORK_CATEGORIES: WorkCategoryTaxonomy[] = [
  {
    id: "building_construction",
    nameEn: "Building Construction",
    nameAr: "إنشاء وتشييد المباني",
    cpvFallback: "45000000",
    descriptionEn: "Residential, commercial, educational, and healthcare structural facilities",
    descriptionAr: "المشاريع السكنية والتجارية والتعليمية والمستشفيات",
  },
  {
    id: "roads_infrastructure",
    nameEn: "Roads, Bridges & Civil Infrastructure",
    nameAr: "الطرق والجسور والبنية التحتية",
    cpvFallback: "45233000",
    descriptionEn: "Highways, arterial roads, earthworks, paving, bridges, and tunnels",
    descriptionAr: "الطرق السريعة والجسور والأنفاق وأعمال التسوية والرصف",
  },
  {
    id: "mep_works",
    nameEn: "Electromechanical (MEP) Works",
    nameAr: "الأعمال الكهروميكانيكية (MEP)",
    cpvFallback: "45310000",
    descriptionEn: "HVAC systems, plumbing, firefighting, and building automated controls",
    descriptionAr: "أنظمة التكييف والتهوية والسباكة ومكافحة الحريق والأنظمة الذكية",
  },
  {
    id: "electrical_power",
    nameEn: "Electrical & Power Transmission",
    nameAr: "الأعمال الكهربائية وشبكات الطاقة",
    cpvFallback: "45315000",
    descriptionEn: "Substations, transmission lines, transformers, and renewable solar microgrids",
    descriptionAr: "محطات التحويل وخطوط النقل ومحطات الطاقة المتجددة والشمسية",
  },
  {
    id: "water_sewage",
    nameEn: "Water, Sanitation & Dams",
    nameAr: "المياه والصرف الصحي والسدود",
    cpvFallback: "45232000",
    descriptionEn: "Potable water networks, sewage plants, stormwater drainage, and reservoirs",
    descriptionAr: "شبكات المياه ومحطات الصرف وتصريف السيول والخزانات الاستراتيجية",
  },
  {
    id: "it_telecom",
    nameEn: "Telecommunications & IT Systems",
    nameAr: "الاتصالات وتقنية المعلومات والأنظمة الذكية",
    cpvFallback: "72000000",
    descriptionEn: "Fiber optics, data centers, smart city telemetry, and cloud infrastructure",
    descriptionAr: "الألياف الضوئية ومراكز البيانات وحلول المدن الذكية والبنية السحابية",
  },
  {
    id: "industrial_marine",
    nameEn: "Industrial, Oil & Gas & Marine Works",
    nameAr: "الأعمال الصناعية والنفط والغاز والموانئ",
    cpvFallback: "45213250",
    descriptionEn: "Refinery structures, pipelines, factory warehouses, docking berths, and dredging",
    descriptionAr: "منشآت التكرير والأنابيب والمستودعات الصناعية وأرصفة الموانئ",
  },
  {
    id: "facility_management",
    nameEn: "Facility Management & O&M",
    nameAr: "التشغيل والصيانة وإدارة المرافق",
    cpvFallback: "50000000",
    descriptionEn: "Comprehensive operation, routine maintenance, cleaning, and security services",
    descriptionAr: "الصيانة الوقائية والتشغيل الشامل وإدارة الأصول والمرافق",
  },
];

export const CONTRACTOR_CLASSIFICATIONS: LocalizedOption[] = [
  { value: "Buildings", labelEn: "Buildings", labelAr: "المباني" },
  { value: "Roads", labelEn: "Roads", labelAr: "الطرق" },
  { value: "Water & Wastewater", labelEn: "Water & Sanitation", labelAr: "المياه والصرف الصحي" },
  { value: "Electrical", labelEn: "Electrical Works", labelAr: "الأعمال الكهربائية" },
  { value: "Mechanical", labelEn: "Mechanical Works", labelAr: "الأعمال الميكانيكية" },
  { value: "Industrial", labelEn: "Industrial Works", labelAr: "الأعمال الصناعية" },
  { value: "Telecommunication", labelEn: "Telecommunication & Technology", labelAr: "الاتصالات وتقنية المعلومات" },
  { value: "Dams", labelEn: "Dams & Water Structures", labelAr: "السدود والمنشآت المائية" },
];

export const CLASSIFICATION_GRADES = [
  {
    grade: 1 as const,
    labelEn: "Grade 1 (Unlimited / Over 100M SAR)",
    labelAr: "الدرجة الأولى (مفتوح / أكثر من 100 مليون ر.س)",
    maxProjectValueSar: 500000000,
  },
  {
    grade: 2 as const,
    labelEn: "Grade 2 (Up to 100M SAR)",
    labelAr: "الدرجة الثانية (حتى 100 مليون ر.س)",
    maxProjectValueSar: 100000000,
  },
  {
    grade: 3 as const,
    labelEn: "Grade 3 (Up to 50M SAR)",
    labelAr: "الدرجة الثالثة (حتى 50 مليون ر.س)",
    maxProjectValueSar: 50000000,
  },
  {
    grade: 4 as const,
    labelEn: "Grade 4 (Up to 20M SAR)",
    labelAr: "الدرجة الرابعة (حتى 20 مليون ر.س)",
    maxProjectValueSar: 20000000,
  },
  {
    grade: 5 as const,
    labelEn: "Grade 5 (Up to 7M SAR)",
    labelAr: "الدرجة الخامسة (حتى 7 مليون ر.س)",
    maxProjectValueSar: 7000000,
  },
  {
    grade: "Unclassified" as const,
    labelEn: "Unclassified (Up to 2M SAR / Direct Purchase)",
    labelAr: "غير مصنف (حتى 2 مليون ر.س / الشراء المباشر)",
    maxProjectValueSar: 2000000,
  },
];

export const COMPANY_SIZES = [
  {
    value: "Small" as const,
    labelEn: "Small Enterprise (6-49 staff, < 40M SAR)",
    labelAr: "منشأة صغيرة (6-49 موظف، أقل من 40 مليون ر.س)",
    tag: "Small",
  },
  {
    value: "Medium" as const,
    labelEn: "Medium Enterprise (50-249 staff, 40M - 200M SAR)",
    labelAr: "منشأة متوسطة (50-249 موظف، 40 - 200 مليون ر.س)",
    tag: "Medium",
  },
  {
    value: "Large" as const,
    labelEn: "Large Enterprise (250+ staff, > 200M SAR)",
    labelAr: "منشأة كبيرة (250+ موظف، أكثر من 200 مليون ر.س)",
    tag: "Large",
  },
];

export const COMMON_EQUIPMENT_TAGS: LocalizedOption[] = [
  { value: "Heavy Excavators", labelEn: "Heavy Excavators", labelAr: "حفارات ثقيلة" },
  { value: "Bulldozers & Graders", labelEn: "Bulldozers & Graders", labelAr: "بلدوزرات وممهدات" },
  { value: "Asphalt Pavers & Rollers", labelEn: "Asphalt Pavers & Rollers", labelAr: "فرادات ومداحل أسفلت" },
  { value: "Mobile & Tower Cranes", labelEn: "Mobile & Tower Cranes", labelAr: "رافعات برجية ومتحركة" },
  { value: "Concrete Batching & Pumps", labelEn: "Concrete Batching & Pumps", labelAr: "محطات ومضخات خرسانة" },
  { value: "Drilling & Shoring Rigs", labelEn: "Drilling & Shoring Rigs", labelAr: "معدات الحفر وسند الجوانب" },
  { value: "Surveying & Drone LiDAR", labelEn: "Surveying & Drone LiDAR", labelAr: "أجهزة مساحة وطائرات درون" },
  { value: "Generators & Substation Testers", labelEn: "Generators & Substation Testers", labelAr: "مولدات وأجهزة فحص محطات" },
  { value: "Trenchless Horizontal Boring", labelEn: "Trenchless Horizontal Boring", labelAr: "معدات حفر أفقي موجه (HDD)" },
];

export const COMMON_CERTIFICATIONS: LocalizedOption[] = [
  { value: "SCA_MUQAWIL", labelEn: "SCA Muqawil Classified", labelAr: "شهادة تصنيف المقاولين (مقاول / بلدي)" },
  { value: "ARAMCO_APPROVED", labelEn: "Saudi Aramco Approved Vendor", labelAr: "مورد معتمد لدى أرامكو السعودية" },
  { value: "SEC_PREQUALIFIED", labelEn: "SEC Prequalified Contractor", labelAr: "مقاول مؤهل لدى الشركة السعودية للكهرباء" },
  { value: "NEOM_REGISTERED", labelEn: "NEOM Approved Supplier", labelAr: "مورد مسجل لدى شركة نيوم" },
  { value: "ROSHN_REGISTERED", labelEn: "ROSHN Approved Contractor", labelAr: "مقاول مؤهل لدى مجموعة روشن" },
  { value: "RED_SEA_GLOBAL", labelEn: "Red Sea Global Approved", labelAr: "مورد معتمد لدى البحر الأحمر الدولية" },
  { value: "ISO_9001", labelEn: "ISO 9001:2015 Quality", labelAr: "شهادة إدارة الجودة ISO 9001" },
  { value: "ISO_14001", labelEn: "ISO 14001:2015 Environment", labelAr: "شهادة الإدارة البيئية ISO 14001" },
  { value: "ISO_45001", labelEn: "ISO 45001:2018 Safety", labelAr: "شهادة السلامة والصحة المهنية ISO 45001" },
  { value: "ZATCA_CLEARANCE", labelEn: "ZATCA Tax Clearance", labelAr: "شهادة الزكاة والضريبة والجمارك سارية" },
  { value: "GOSI_CLEARANCE", labelEn: "GOSI Compliance Certificate", labelAr: "شهادة التأمينات الاجتماعية سارية" },
];
