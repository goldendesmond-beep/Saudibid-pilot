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
  {
    id: "hospitality_services",
    nameEn: "Hospitality, Catering & Commercial Services",
    nameAr: "خدمات الضيافة والإعاشة والتجهيزات الفندقية",
    cpvFallback: "55000000",
    descriptionEn: "Hotel operations, event management, corporate catering, and VIP camp services",
    descriptionAr: "تشغيل الفنادق وإدارة الفعاليات والإعاشة للشركات ومخيمات الضيافة الفاخرة",
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

export interface SectorTaxonomy {
  id: string;
  nameEn: string;
  nameAr: string;
}

export const SAUDI_SECTORS: SectorTaxonomy[] = [
  { id: "Hospitality", nameEn: "Hospitality & Hotels", nameAr: "الضيافة والفنادق" },
  { id: "Healthcare", nameEn: "Healthcare & Hospitals", nameAr: "الرعاية الصحية والمستشفيات" },
  { id: "Restaurants", nameEn: "Restaurants & Food Services", nameAr: "المطاعم والأغذية" },
  { id: "Retail/Malls", nameEn: "Retail & Shopping Malls", nameAr: "التجزئة والمراكز التجارية" },
  { id: "Schools/Universities", nameEn: "Schools & Universities", nameAr: "المدارس والجامعات والتعليم" },
  { id: "Factories", nameEn: "Factories & Industrial Plants", nameAr: "المصانع والمنشآت الصناعية" },
  { id: "Warehouses/Logistics", nameEn: "Warehouses & Logistics", nameAr: "المستودعات والخدمات اللوجستية" },
  { id: "Airports/Ports", nameEn: "Airports & Marine Ports", nameAr: "المطارات والموانئ البحرية" },
  { id: "Commercial/Residential", nameEn: "Commercial & Residential", nameAr: "المشاريع التجارية والسكنية" },
  { id: "Government", nameEn: "Government & Municipalities", nameAr: "الجهات الحكومية والبلديات" },
  { id: "Tourism", nameEn: "Tourism & Entertainment", nameAr: "السياحة والترفيه والوجهات" },
  { id: "Construction", nameEn: "General Construction & Civils", nameAr: "الإنشاءات والمقاولات العامة" },
  { id: "Energy/Oil & Gas", nameEn: "Energy & Oil / Gas", nameAr: "الطاقة والنفط والغاز" },
  { id: "Mining", nameEn: "Mining & Heavy Minerals", nameAr: "التعدين والمعادن الثقيلة" },
  { id: "Water", nameEn: "Water & Desalination", nameAr: "المياه والتحلية ومعالجة الصرف" },
  { id: "Telecom/IT", nameEn: "Telecom & Digital Technology", nameAr: "الاتصالات وتقنية المعلومات" },
];

export interface ServiceCategoryTaxonomy {
  id: string;
  nameEn: string;
  nameAr: string;
  matchedWorkCategoryId: string;
}

export const SAUDI_SERVICE_CATEGORIES: ServiceCategoryTaxonomy[] = [
  { id: "hotel_construction", nameEn: "Hotel Construction", nameAr: "إنشاء وتشييد الفنادق", matchedWorkCategoryId: "building_construction" },
  { id: "fitout", nameEn: "Fit-out & Interior", nameAr: "التشطيبات والديكور الداخلي", matchedWorkCategoryId: "building_construction" },
  { id: "renovation", nameEn: "Renovation & Refurbishment", nameAr: "الترميم والتجديد والتأهيل", matchedWorkCategoryId: "building_construction" },
  { id: "operation", nameEn: "Operation & Management (O&M)", nameAr: "التشغيل والإدارة الشاملة", matchedWorkCategoryId: "facility_management" },
  { id: "maintenance", nameEn: "Routine & Preventive Maintenance", nameAr: "الصيانة الدورية والوقائية", matchedWorkCategoryId: "facility_management" },
  { id: "facility_management", nameEn: "Facility Management", nameAr: "إدارة المرافق والأصول", matchedWorkCategoryId: "facility_management" },
  { id: "housekeeping", nameEn: "Housekeeping", nameAr: "خدمات التدبير الفندقي (Housekeeping)", matchedWorkCategoryId: "hospitality_services" },
  { id: "cleaning", nameEn: "Cleaning & Janitorial Services", nameAr: "النظافة الشاملة والتعقيم", matchedWorkCategoryId: "facility_management" },
  { id: "manpower", nameEn: "Manpower & Specialized Staffing", nameAr: "القوى العاملة والكوادر المتخصصة", matchedWorkCategoryId: "hospitality_services" },
  { id: "security", nameEn: "Security & Guarding Services", nameAr: "الحراسات الأمنية والسلامة", matchedWorkCategoryId: "facility_management" },
  { id: "catering", nameEn: "Catering & Meal Services", nameAr: "الإعاشة وتموين الأغذية والوجبات", matchedWorkCategoryId: "hospitality_services" },
  { id: "food_supply", nameEn: "Food & Beverage Supply", nameAr: "التوريدات الغذائية والمشروبات", matchedWorkCategoryId: "hospitality_services" },
  { id: "laundry", nameEn: "Commercial Laundry & Linen", nameAr: "المغاسل والغسيل المركزي للبياضات", matchedWorkCategoryId: "hospitality_services" },
  { id: "ffe_ose", nameEn: "FF&E / OS&E Furnishing", nameAr: "التأثيث والتجهيزات الفندقية (FF&E / OS&E)", matchedWorkCategoryId: "hospitality_services" },
  { id: "mep_hvac", nameEn: "MEP / HVAC / Plumbing", nameAr: "الأعمال الكهروميكانيكية والتكييف والسباكة", matchedWorkCategoryId: "mep_works" },
  { id: "it_cctv", nameEn: "IT / CCTV & Low Current", nameAr: "الأنظمة الذكية والدوائر التلفزيونية والاتصالات", matchedWorkCategoryId: "it_telecom" },
  { id: "landscaping", nameEn: "Landscaping & Irrigation", nameAr: "تنسيق الحدائق وشبكات الري", matchedWorkCategoryId: "roads_infrastructure" },
  { id: "transportation", nameEn: "Transportation & Shuttle Fleet", nameAr: "النقل وسيارات الخدمات والرحلات", matchedWorkCategoryId: "facility_management" },
  { id: "hotel_supplies", nameEn: "Hotel Amenities & Supplies", nameAr: "المستلزمات والمستهلكات الفندقية", matchedWorkCategoryId: "hospitality_services" },
];

export interface ManpowerIntelligence {
  role: string;
  quantity: number | "UNKNOWN";
  skills: string[] | "UNKNOWN";
  experience: string;
  duration: string;
  shift: string;
  accommodation: string;
  transportation: string;
  mobilization_date: string;
  location: string;
  client: string;
  main_contractor: string;
  deadline: string;
}

export const DEFAULT_UNKNOWN_MANPOWER: ManpowerIntelligence = {
  role: "UNKNOWN",
  quantity: "UNKNOWN",
  skills: "UNKNOWN",
  experience: "UNKNOWN",
  duration: "UNKNOWN",
  shift: "UNKNOWN",
  accommodation: "UNKNOWN",
  transportation: "UNKNOWN",
  mobilization_date: "UNKNOWN",
  location: "UNKNOWN",
  client: "UNKNOWN",
  main_contractor: "UNKNOWN",
  deadline: "UNKNOWN",
};

// ==========================================
// Building Renovation & Restoration Taxonomy
// ==========================================

export const RENOVATION_CATEGORIES = [
  "BUILDING_RENOVATION",
  "BUILDING_RESTORATION",
  "BUILDING_REHABILITATION",
  "BUILDING_REFURBISHMENT",
  "BUILDING_UPGRADE",
  "INTERIOR_RENOVATION",
  "EXTERIOR_RENOVATION",
  "STRUCTURAL_REPAIR",
  "CONCRETE_REPAIR",
  "FACADE_REPAIR",
  "ROOF_REPAIR",
  "WATERPROOFING",
  "MEP_RENOVATION",
  "ELECTRICAL_REHABILITATION",
  "PLUMBING_REHABILITATION",
  "HVAC_REPLACEMENT",
  "FIRE_SAFETY_UPGRADE",
  "FACILITY_REHABILITATION",
  "SCHOOL_RENOVATION",
  "HOSPITAL_RENOVATION",
  "HOTEL_RENOVATION",
  "OFFICE_RENOVATION",
  "MOSQUE_RENOVATION",
  "GOVERNMENT_BUILDING_RENOVATION",
  "RESIDENTIAL_RENOVATION",
  "COMMERCIAL_RENOVATION",
  "INDUSTRIAL_REHABILITATION",
  "HERITAGE_RESTORATION",
  "GENERAL_RENOVATION",
] as const;

export type RenovationCategory = typeof RENOVATION_CATEGORIES[number];

export const RENOVATION_KEYWORDS_AR = [
  "ترميم",
  "ترميم مباني",
  "إعادة تأهيل",
  "تأهيل مبنى",
  "إعادة تأهيل المباني",
  "تجديد",
  "تجديد مبنى",
  "إصلاح مبنى",
  "إصلاحات إنشائية",
  "صيانة وترميم",
  "أعمال ترميم",
  "أعمال إعادة تأهيل",
  "تطوير مبنى",
  "رفع كفاءة مبنى",
  "ترميم واجهات",
  "إصلاح خرسانة",
  "عزل أسطح",
  "إعادة تأهيل كهرباء",
  "إعادة تأهيل ميكانيكا",
  "ترميم تراثي",
  "تأهيل مرافق",
];

export const RENOVATION_KEYWORDS_EN = [
  "renovation",
  "restoration",
  "rehabilitation",
  "refurbishment",
  "building upgrade",
  "structural repair",
  "concrete repair",
  "facility rehabilitation",
  "facade repair",
  "roof repair",
  "waterproofing",
  "interior renovation",
  "exterior renovation",
  "mep renovation",
  "heritage restoration",
  "hotel renovation",
  "hospital renovation",
  "school renovation",
  "mosque renovation",
];

export function classifyRenovationCategory(text: string): { isRenovation: boolean; category?: RenovationCategory } {
  if (!text) return { isRenovation: false };
  const lower = text.toLowerCase();

  const hasArabicKeyword = RENOVATION_KEYWORDS_AR.some((kw) => lower.includes(kw.toLowerCase()));
  const hasEnglishKeyword = RENOVATION_KEYWORDS_EN.some((kw) => lower.includes(kw));

  if (!hasArabicKeyword && !hasEnglishKeyword) {
    return { isRenovation: false };
  }

  // Specific subcategory classification
  if (lower.includes("heritage") || lower.includes("تراثي") || lower.includes("آثار")) {
    return { isRenovation: true, category: "HERITAGE_RESTORATION" };
  }
  if (lower.includes("facade") || lower.includes("واجهات") || lower.includes("واجهة")) {
    return { isRenovation: true, category: "FACADE_REPAIR" };
  }
  if (lower.includes("concrete") || lower.includes("خرسانة") || lower.includes("إنشائية") || lower.includes("structural")) {
    return { isRenovation: true, category: lower.includes("concrete") || lower.includes("خرسانة") ? "CONCRETE_REPAIR" : "STRUCTURAL_REPAIR" };
  }
  if (lower.includes("roof") || lower.includes("waterproof") || lower.includes("عزل") || lower.includes("أسطح")) {
    return { isRenovation: true, category: lower.includes("waterproof") || lower.includes("عزل") ? "WATERPROOFING" : "ROOF_REPAIR" };
  }
  if (lower.includes("mep") || lower.includes("كهرباء") || lower.includes("ميكانيكا") || lower.includes("تكييف") || lower.includes("hvac")) {
    if (lower.includes("hvac") || lower.includes("تكييف")) return { isRenovation: true, category: "HVAC_REPLACEMENT" };
    if (lower.includes("كهرباء") || lower.includes("electrical")) return { isRenovation: true, category: "ELECTRICAL_REHABILITATION" };
    return { isRenovation: true, category: "MEP_RENOVATION" };
  }
  if (lower.includes("hotel") || lower.includes("فندق") || lower.includes("فندقي")) {
    return { isRenovation: true, category: "HOTEL_RENOVATION" };
  }
  if (lower.includes("hospital") || lower.includes("مستشفى") || lower.includes("صحي")) {
    return { isRenovation: true, category: "HOSPITAL_RENOVATION" };
  }
  if (lower.includes("school") || lower.includes("مدرسة") || lower.includes("تعليم")) {
    return { isRenovation: true, category: "SCHOOL_RENOVATION" };
  }
  if (lower.includes("mosque") || lower.includes("مسجد") || lower.includes("جامع")) {
    return { isRenovation: true, category: "MOSQUE_RENOVATION" };
  }
  if (lower.includes("facility") || lower.includes("مرافق") || lower.includes("مرفق")) {
    return { isRenovation: true, category: "FACILITY_REHABILITATION" };
  }
  if (lower.includes("restoration") || lower.includes("ترميم")) {
    return { isRenovation: true, category: "BUILDING_RESTORATION" };
  }
  if (lower.includes("rehabilitation") || lower.includes("تأهيل")) {
    return { isRenovation: true, category: "BUILDING_REHABILITATION" };
  }
  if (lower.includes("refurbishment") || lower.includes("تجديد")) {
    return { isRenovation: true, category: "BUILDING_REFURBISHMENT" };
  }

  return { isRenovation: true, category: "BUILDING_RENOVATION" };
}

