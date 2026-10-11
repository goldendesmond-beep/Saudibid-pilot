/**
 * POST-STAGE-10C2: Source Browser Launcher & Manual Source Navigation Service.
 *
 * Provides production-grade manual navigation to official Saudi procurement portals,
 * supplier gateways, and tender search interfaces when automatic ingestion is gated
 * by WAF, MFA, Nafath, or authentication.
 *
 * ARCHITECTURE BOUNDARY:
 * This service lives strictly ABOVE the protected core:
 * SOURCE REGISTRY -> SOURCE NAVIGATION SERVICE -> BIDPILOT UI -> USER DEVICE BROWSER
 * Zero modifications to src/engine/procurement.ts.
 */

export type SourceNavigationStatus =
  | "DIRECT_TENDER_SEARCH_AVAILABLE"
  | "PROCUREMENT_PAGE_AVAILABLE"
  | "SUPPLIER_PORTAL_AVAILABLE"
  | "VENDOR_REGISTRATION_AVAILABLE"
  | "OFFICIAL_HOMEPAGE_ONLY"
  | "AUTH_REQUIRED"
  | "NAFATH_REQUIRED"
  | "BROKEN_DESTINATION"
  | "NO_VERIFIED_NAVIGATION_URL"
  | "UNKNOWN";

export interface SourceNavigationRecord {
  source_id: string;
  source_name: string;
  source_name_ar: string;
  authority_type: string;
  official_domain: string;
  official_home_url: string;
  official_tenders_url: string | null;
  official_procurement_url: string | null;
  official_search_url: string | null;
  official_supplier_portal_url: string | null;
  official_vendor_registration_url: string | null;
  source_status: string;
  diagnostic_reason: string;
  access_requirement: string;
  navigation_status: SourceNavigationStatus;
  manual_search_available: boolean;
  last_url_verified_at: string;
  suggested_search_terms: string[];
  sectors: string[];
  description_en: string;
  description_ar: string;
}

export const SOURCE_NAVIGATION_REGISTRY: Record<string, SourceNavigationRecord> = {
  // 1. Etimad (Monafasat)
  "src-etimad": {
    source_id: "src-etimad",
    source_name: "Etimad (Monafasat)",
    source_name_ar: "منصة اعتماد (المنافسات الحكومية)",
    authority_type: "GOVERNMENT_PORTAL",
    official_domain: "https://monafasat.etimad.sa",
    official_home_url: "https://etimad.sa",
    official_tenders_url: "https://monafasat.etimad.sa",
    official_procurement_url: "https://monafasat.etimad.sa",
    official_search_url: "https://monafasat.etimad.sa/tender/alltenders",
    official_supplier_portal_url: "https://login.etimad.sa",
    official_vendor_registration_url: "https://login.etimad.sa",
    source_status: "ASSISTED_IMPORT",
    diagnostic_reason: "NAFATH_REQUIRED",
    access_requirement: "Corporate Nafath 2FA & SCA Muqawil CR",
    navigation_status: "NAFATH_REQUIRED",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["إنشاء وتشييد", "ترميم مباني", "إعادة تأهيل", "تشغيل وصيانة", "نظافة وضيافة", "أعمال خرسانية", "توريد مواد"],
    sectors: ["Construction", "Maintenance", "Renovation", "Hospitality", "Manpower", "Supply"],
    description_en: "Unified Saudi Government Tender & Procurement Portal (GTPL). Manual browsing allows tender search; bid purchase requires Nafath login.",
    description_ar: "بوابة المشتريات والمنافسات الحكومية الموحدة (نظام المنافسات). البحث متاح، وشراء الكراسة يتطلب نفاذ أعمال.",
  },

  // 2. Saudi Press Agency (SPA) Contract Disclosures
  "src-spa": {
    source_id: "src-spa",
    source_name: "Saudi Press Agency (SPA) Contract Disclosures",
    source_name_ar: "وكالة الأنباء السعودية (واس) - إعلانات العقود والمشاريع",
    authority_type: "PUBLIC_DISCLOSURE",
    official_domain: "https://www.spa.gov.sa",
    official_home_url: "https://www.spa.gov.sa",
    official_tenders_url: "https://www.spa.gov.sa/news/economy",
    official_procurement_url: null,
    official_search_url: "https://www.spa.gov.sa/search",
    official_supplier_portal_url: null,
    official_vendor_registration_url: null,
    source_status: "WORKING_LIVE",
    diagnostic_reason: "NONE",
    access_requirement: "PUBLIC_UNAUTHENTICATED",
    navigation_status: "DIRECT_TENDER_SEARCH_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["توقيع عقد", "مشروع فندقي", "ترسية منافسة", "صيانة وتشغيل", "أمانة منطقة الرياض"],
    sectors: ["Public Sector", "Infrastructure", "Hospitality"],
    description_en: "Official government news agency publishing formal ministerial contract signings and major municipal tender announcements.",
    description_ar: "وكالة الأنباء الرسمية للدولة؛ تنشر توقيع عقود الوزارات والبلديات وإعلانات الترسية الكبرى.",
  },

  // 3. Saudi Aramco
  "src-aramco": {
    source_id: "src-aramco",
    source_name: "Saudi Aramco (e-Marketplace & IKTVA)",
    source_name_ar: "أرامكو السعودية (بوابة التوريد واكتفاء)",
    authority_type: "SEMI_GOVERNMENT_SOE",
    official_domain: "https://supplier.aramco.com",
    official_home_url: "https://www.aramco.com",
    official_tenders_url: null,
    official_procurement_url: "https://www.aramco.com/en/working-with-us/suppliers",
    official_search_url: null,
    official_supplier_portal_url: "https://supplier.aramco.com",
    official_vendor_registration_url: "https://supplier.aramco.com/registration",
    source_status: "AUTHENTICATED_CONNECTOR_AVAILABLE",
    diagnostic_reason: "AUTH_REQUIRED",
    access_requirement: "SAP Ariba Supplier Gateway & IKTVA Certification",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["IKTVA", "Civil Contracting", "Piping", "Site Preparation", "Camp Catering", "Industrial Maintenance"],
    sectors: ["Energy & Oil", "Industrial", "Subcontracting", "Facility Management"],
    description_en: "Global energy leader. Direct tenders require SAP Ariba contractor registration and minimum 40% IKTVA local content score.",
    description_ar: "بوابة الموردين العالمية لأرامكو. المناقصات مقصورة على الموردين المسجلين عبر أريبا مع برنامج اكتفاء.",
  },

  // 4. Tadawul Listed Company Award Disclosures
  "src-tadawul": {
    source_id: "src-tadawul",
    source_name: "Tadawul Listed Company Award Disclosures",
    source_name_ar: "تداول السعودية (إفصاحات ترسية العقود)",
    authority_type: "FINANCIAL_MARKET",
    official_domain: "https://www.saudiexchange.sa",
    official_home_url: "https://www.saudiexchange.sa",
    official_tenders_url: null,
    official_procurement_url: "https://www.saudiexchange.sa/wps/portal/saudiexchange/newsandreports/issuer-news",
    official_search_url: "https://www.saudiexchange.sa/wps/portal/saudiexchange/search",
    official_supplier_portal_url: null,
    official_vendor_registration_url: null,
    source_status: "ASSISTED_IMPORT",
    diagnostic_reason: "WAF_BLOCKED",
    access_requirement: "Public Market Disclosures (Assisted Import & Manual Search)",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["ترسية عقد", "توقيع اتفاقية", "عقد مقاولات", "إفصاح مشروع", "أعمال كهروميكانيكية"],
    sectors: ["Subcontracting", "Private Sector", "Corporate Awards"],
    description_en: "Saudi Stock Exchange market disclosures for major corporate contract awards. Prime hunting ground for Tier-2 subcontract opportunities.",
    description_ar: "إفصاحات السوق المالية السعودية لترسيات العقود؛ المصدر الأهم لفرص مقاولات الباطن مع الشركات المدرجة.",
  },

  // 5. NEOM Supplier Portal
  "src-neom": {
    source_id: "src-neom",
    source_name: "NEOM Supplier Portal",
    source_name_ar: "نيوم (بوابة الموردين والمقاولين)",
    authority_type: "PIF_GIGA_PROJECT",
    official_domain: "https://www.neom.com",
    official_home_url: "https://www.neom.com",
    official_tenders_url: null,
    official_procurement_url: "https://www.neom.com/en-us/our-business/suppliers",
    official_search_url: null,
    official_supplier_portal_url: "https://supplier.neom.com",
    official_vendor_registration_url: "https://supplier.neom.com/sap/bc/webdynpro/sapsrm/wda_l_fpm_oif",
    source_status: "AUTHENTICATED_CONNECTOR_AVAILABLE",
    diagnostic_reason: "AUTH_REQUIRED",
    access_requirement: "NEOM SAP SRM Contractor Registration",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["The Line", "Oxagon", "Trojena", "Sindalah", "Hospitality Fit-Out", "Catering & Camp Facility", "Staffing"],
    sectors: ["Giga-Projects", "Construction", "Hospitality", "Manpower", "Subcontracting"],
    description_en: "Flagship PIF giga-project. Vendor prequalification through SAP SRM portal enables bidding on direct civil and hospitality packages.",
    description_ar: "مشروع نيوم العملاق. التسجيل المسبق عبر بوابة ساب يمكن المقاولين من تلقي دعوات المناقصات وحزم الضيافة.",
  },

  // 6. Red Sea Global (RSG)
  "src-redsea": {
    source_id: "src-redsea",
    source_name: "Red Sea Global (RSG Supplier Portal)",
    source_name_ar: "البحر الأحمر الدولية (بوابة المشتريات والضيافة)",
    authority_type: "PIF_GIGA_PROJECT",
    official_domain: "https://www.redseaglobal.com",
    official_home_url: "https://www.redseaglobal.com",
    official_tenders_url: null,
    official_procurement_url: "https://www.redseaglobal.com/en/our-partners",
    official_search_url: null,
    official_supplier_portal_url: "https://www.redseaglobal.com/en/our-partners/suppliers",
    official_vendor_registration_url: "https://www.redseaglobal.com/en/our-partners/suppliers",
    source_status: "BLOCKED",
    diagnostic_reason: "WAF_BLOCKED",
    access_requirement: "Enterprise WAF Protected / Partner Onboarding",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Resort Fit-Out", "Hotel Interior Refurbishment", "Housekeeping", "Facility Management", "Hotel Landscaping"],
    sectors: ["Hospitality & Hotels", "Tourism", "Construction", "Renovation"],
    description_en: "Leading regenerative tourism developer (The Red Sea & Amaala). Primary Saudi destination for luxury hotel fit-out and hospitality FM tenders.",
    description_ar: "مطور السياحة المتجددة (البحر الأحمر وأمالا)؛ الوجهة الكبرى لمناقصات تجهيز الفنادق الفاخرة وتشغيل مرافق الضيافة.",
  },

  // 7. ROSHN Real Estate
  "src-roshn": {
    source_id: "src-roshn",
    source_name: "ROSHN Real Estate (PIF Giga Developer)",
    source_name_ar: "مجموعة روشن (المطور العقاري لصندوق الاستثمارات العامة)",
    authority_type: "PIF_GIGA_PROJECT",
    official_domain: "https://www.roshn.sa",
    official_home_url: "https://www.roshn.sa",
    official_tenders_url: null,
    official_procurement_url: "https://www.roshn.sa/en/partners",
    official_search_url: null,
    official_supplier_portal_url: "https://suppliers.roshn.sa",
    official_vendor_registration_url: "https://suppliers.roshn.sa",
    source_status: "AUTHENTICATED_CONNECTOR_AVAILABLE",
    diagnostic_reason: "AUTH_REQUIRED",
    access_requirement: "ROSHN Supplier Portal Prequalification",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["SEDRA", "WAREFA", "ALURUS", "Residential Contracting", "Subcontract Packages", "Landscaping"],
    sectors: ["Residential Construction", "Real Estate", "Subcontracting"],
    description_en: "PIF community developer building nationwide megaprojects. Supplier portal manages vendor approval and commercial packages.",
    description_ar: "المطور العقاري الوطني لمشاريع سدرة ووارفة. بوابة الموردين تدير التأهيل واعتماد المقاولين وحزم الباطن.",
  },

  // 8. Diriyah Company (DGDA)
  "src-diriyah": {
    source_id: "src-diriyah",
    source_name: "Diriyah Company (DGDA Procurement)",
    source_name_ar: "شركة الدرعية (بوابة مشتريات وتطوير الدرعية)",
    authority_type: "PIF_GIGA_PROJECT",
    official_domain: "https://www.diriyah.sa",
    official_home_url: "https://www.diriyah.sa",
    official_tenders_url: null,
    official_procurement_url: "https://www.diriyah.sa/en/business",
    official_search_url: null,
    official_supplier_portal_url: "https://suppliers.diriyah.sa",
    official_vendor_registration_url: "https://suppliers.diriyah.sa",
    source_status: "BLOCKED",
    diagnostic_reason: "WAF_BLOCKED",
    access_requirement: "Akamai Cloud Defender & Supplier Prequalification",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Wadi Hanifah", "Bujairi", "Heritage Restoration", "Mud Brick Masonry", "Luxury Hospitality", "Boutique Hotels"],
    sectors: ["Heritage Restoration", "Renovation", "Hospitality", "Civil Contracting"],
    description_en: "Historic capital transformation giga-project. Key client for Najdi mud architecture, heritage restoration, and luxury hotel packages.",
    description_ar: "مشروع تطوير الدرعية التاريخية. العميل الأبرز لمشاريع الترميم التراثي والعمارة النجدية وتطوير الفنادق الفاخرة.",
  },

  // 9. Qiddiya Investment Company (QIC)
  "src-qiddiya": {
    source_id: "src-qiddiya",
    source_name: "Qiddiya Investment Company (QIC)",
    source_name_ar: "شركة القدية للاستثمار",
    authority_type: "PIF_GIGA_PROJECT",
    official_domain: "https://qiddiya.com",
    official_home_url: "https://qiddiya.com",
    official_tenders_url: null,
    official_procurement_url: "https://qiddiya.com/en/business/suppliers/",
    official_search_url: null,
    official_supplier_portal_url: "https://qiddiya.com/en/business/suppliers/",
    official_vendor_registration_url: "https://qiddiya.com/en/business/suppliers/",
    source_status: "BLOCKED",
    diagnostic_reason: "WAF_BLOCKED",
    access_requirement: "Perimeter Firewall Protected",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Entertainment Theme Parks", "Speed Park Track", "Six Flags Civil", "Stadium Infrastructure", "Manpower"],
    sectors: ["Entertainment", "Sports Infrastructure", "Civil Construction", "Subcontracting"],
    description_en: "Global capital of entertainment, sports and arts. Supplier onboarding manages major theme park, stadium and auxiliary contracting.",
    description_ar: "عاصمة الترفيه والرياضة والفنون. صفحة الموردين تتيح تسجيل الشركات المتخصصة لمشاريع المدن الترفيهية والملاعب.",
  },

  // 10. Boutique Group (PIF Palaces)
  "src-boutique-group": {
    source_id: "src-boutique-group",
    source_name: "Boutique Group (PIF Palaces)",
    source_name_ar: "مجموعة بوتيك (قصور الضيافة التراثية الفاخرة)",
    authority_type: "PIF_PORTFOLIO",
    official_domain: "https://boutiquegroup.com",
    official_home_url: "https://boutiquegroup.com",
    official_tenders_url: null,
    official_procurement_url: "https://boutiquegroup.com",
    official_search_url: null,
    official_supplier_portal_url: null,
    official_vendor_registration_url: null,
    source_status: "AUTHENTICATED_CONNECTOR_NOT_CONFIGURED",
    diagnostic_reason: "AUTH_REQUIRED",
    access_requirement: "Private PIF Hospitality Procurement & Assisted Import",
    navigation_status: "OFFICIAL_HOMEPAGE_ONLY",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Palace Restoration", "Al Hamra Palace", "Tuwaiq Palace", "Red Palace", "Ultra Luxury Hotel Fit-Out", "Fine Dining Catering"],
    sectors: ["Hospitality & Hotels", "Palace Renovation", "Luxury Restoration", "Interior Fit-Out"],
    description_en: "Ultra-luxury hospitality company transforming historic palaces into ultra-luxury hotels. Subcontractors must submit credentials via assisted import.",
    description_ar: "شركة الضيافة الفاخرة المملوكة لصندوق الاستثمارات العامة؛ تحول القصور التاريخية لفنادق فائقة الفخامة (قصر الحمراء، قصر طويق، القصر الأحمر).",
  },

  // 11. ASFAR (Saudi Tourism Investment Company)
  "src-asfar": {
    source_id: "src-asfar",
    source_name: "ASFAR (Saudi Tourism Investment Company)",
    source_name_ar: "شركة أسفار (الشركة السعودية للاستثمار السياحي)",
    authority_type: "PIF_PORTFOLIO",
    official_domain: "https://asfar.sa",
    official_home_url: "https://asfar.sa",
    official_tenders_url: null,
    official_procurement_url: "https://asfar.sa",
    official_search_url: null,
    official_supplier_portal_url: null,
    official_vendor_registration_url: null,
    source_status: "AUTHENTICATED_CONNECTOR_NOT_CONFIGURED",
    diagnostic_reason: "AUTH_REQUIRED",
    access_requirement: "Direct Institutional Procurement / Assisted Import",
    navigation_status: "OFFICIAL_HOMEPAGE_ONLY",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Secondary Cities Hospitality", "Boutique Eco-Lodges", "Tourism Destination Development", "Hotel Operation"],
    sectors: ["Hospitality & Hotels", "Tourism Development", "Renovation"],
    description_en: "PIF company investing in tourism and hospitality across promising Saudi secondary cities (Taif, Al Baha, Yanbu, Al Ahsa).",
    description_ar: "شركة الاستثمار السياحي لصندوق الاستثمارات لتطوير وجهات الضيافة والفنادق في مدن المملكة الواعدة.",
  },

  // 12. Cruise Saudi
  "src-cruise-saudi": {
    source_id: "src-cruise-saudi",
    source_name: "Cruise Saudi",
    source_name_ar: "كروز السعودية",
    authority_type: "PIF_PORTFOLIO",
    official_domain: "https://cruisesaudi.com",
    official_home_url: "https://cruisesaudi.com",
    official_tenders_url: null,
    official_procurement_url: "https://cruisesaudi.com/business",
    official_search_url: null,
    official_supplier_portal_url: null,
    official_vendor_registration_url: null,
    source_status: "AUTHENTICATED_CONNECTOR_NOT_CONFIGURED",
    diagnostic_reason: "AUTH_REQUIRED",
    access_requirement: "Marine Tourism Procurement",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Port Passenger Terminals", "Marine Hospitality", "Passenger Transport", "Terminal Catering", "Cleaning Services"],
    sectors: ["Marine & Cruise", "Hospitality", "Logistics", "Services"],
    description_en: "PIF company developing Saudi Arabia's cruise sector. Procures cruise terminal fit-outs, shore excursion logistics, and port hospitality.",
    description_ar: "شركة تطوير قطاع الرحلات البحرية السياحية؛ تشمل مناقصاتها صالات الركاب البحرية وخدمات الضيافة بالموانئ.",
  },

  // 13. Royal Commission for Jubail and Yanbu (RCJY)
  "src-rcjy": {
    source_id: "src-rcjy",
    source_name: "Royal Commission for Jubail and Yanbu (RCJY)",
    source_name_ar: "الهيئة الملكية للجبيل وينبع",
    authority_type: "GOVERNMENT_AUTHORITY",
    official_domain: "https://www.rcjy.gov.sa",
    official_home_url: "https://www.rcjy.gov.sa",
    official_tenders_url: "https://www.rcjy.gov.sa/en/Business/Tenders",
    official_procurement_url: "https://www.rcjy.gov.sa/en/Business",
    official_search_url: "https://www.rcjy.gov.sa/en/Business/Tenders",
    official_supplier_portal_url: "https://www.rcjy.gov.sa/en/Business/Suppliers",
    official_vendor_registration_url: "https://www.rcjy.gov.sa/en/Business/Suppliers",
    source_status: "RUNTIME_ENVIRONMENT_BLOCKED",
    diagnostic_reason: "RUNTIME_ENVIRONMENT_LIMITATION",
    access_requirement: "In-Kingdom Network Egress / RCJY Supplier Portal",
    navigation_status: "DIRECT_TENDER_SEARCH_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Industrial City Civil Works", "Water & Sewage Networks", "Power Substations", "Road Maintenance", "Port Operations"],
    sectors: ["Infrastructure", "Industrial Contracting", "Utilities", "Maintenance"],
    description_en: "Premier industrial infrastructure authority. Tenders require valid Water/Sewage contractor classification and local portal submission.",
    description_ar: "الهيئة الملكية للبنية التحتية الصناعية. كراسات الشروط تشترط تصنيف المقاولين وتتاح عبر بوابتها الرسمية.",
  },

  // 14. National Housing Company (NHC)
  "src-nhc": {
    source_id: "src-nhc",
    source_name: "National Housing Company (NHC)",
    source_name_ar: "الشركة الوطنية للإسكان",
    authority_type: "SEMI_GOVERNMENT_SOE",
    official_domain: "https://nhc.sa",
    official_home_url: "https://nhc.sa",
    official_tenders_url: "https://nhc.sa/en/suppliers",
    official_procurement_url: "https://nhc.sa/en/suppliers",
    official_search_url: null,
    official_supplier_portal_url: "https://nhc.sa/en/suppliers",
    official_vendor_registration_url: "https://nhc.sa/en/suppliers",
    source_status: "BLOCKED",
    diagnostic_reason: "WAF_BLOCKED",
    access_requirement: "Cloudflare Managed Challenge & Contractor Accreditation",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Khuzam Suburb", "Al Fursan", "Precast Concrete Contracting", "Subcontract Packages", "Landscaping"],
    sectors: ["Residential Mega-Suburbs", "Civil Construction", "Subcontracting"],
    description_en: "Largest residential developer in the Middle East. Vendor portal manages prequalification for thousands of housing units across Kingdom suburbs.",
    description_ar: "أكبر مطور للضواحي السكنية (ضاحية خزام، ضاحية الفرسان). بوابة الموردين تتيح الاعتماد لحزم مقاولات الإسكان.",
  },

  // 15. Saudi Electricity Company (SEC)
  "src-sec": {
    source_id: "src-sec",
    source_name: "Saudi Electricity Company (SEC AL-Atheer)",
    source_name_ar: "الشركة السعودية للكهرباء (بوابة الأثير للموردين)",
    authority_type: "SEMI_GOVERNMENT_SOE",
    official_domain: "https://www.se.com.sa",
    official_home_url: "https://www.se.com.sa",
    official_tenders_url: "https://www.se.com.sa/en/Suppliers",
    official_procurement_url: "https://www.se.com.sa/en/Suppliers",
    official_search_url: null,
    official_supplier_portal_url: "https://www.se.com.sa/en/Suppliers",
    official_vendor_registration_url: "https://www.se.com.sa/en/Suppliers/Registration",
    source_status: "BLOCKED",
    diagnostic_reason: "BAD_URL",
    access_requirement: "SEC AL-Atheer Supplier System",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Transmission Lines", "Substation 132kV", "Cabling Trenching", "Transformer Maintenance", "Subcontract Electromechanical"],
    sectors: ["Energy & Power", "Electrical Contracting", "Subcontracting"],
    description_en: "National power utility. AL-Atheer portal handles vendor qualification and high-voltage transmission/distribution packages.",
    description_ar: "الشركة الوطنية للكهرباء؛ بوابة الأثير هي الممر الرسمي لاعتماد المقاولين وحزم المحطات وخطوط النقل.",
  },

  // 16. National Water Company (NWC)
  "src-nwc": {
    source_id: "src-nwc",
    source_name: "National Water Company (NWC Tawreed)",
    source_name_ar: "شركة المياه الوطنية (منصة توريد)",
    authority_type: "SEMI_GOVERNMENT_SOE",
    official_domain: "https://www.nwc.com.sa",
    official_home_url: "https://www.nwc.com.sa",
    official_tenders_url: "https://www.nwc.com.sa/en/Business/Tawreed",
    official_procurement_url: "https://www.nwc.com.sa/en/Business",
    official_search_url: null,
    official_supplier_portal_url: "https://www.nwc.com.sa/en/Business/Tawreed",
    official_vendor_registration_url: "https://www.nwc.com.sa/en/Business/Tawreed",
    source_status: "BLOCKED",
    diagnostic_reason: "WAF_BLOCKED",
    access_requirement: "Tawreed Portal Login",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Water Distribution Network", "Sewage Treatment Plant", "Pipe Jacking", "Leak Detection", "Pump Maintenance"],
    sectors: ["Water & Utilities", "Civil Infrastructure", "Maintenance"],
    description_en: "Kingdom-wide water and environmental sanitation operator. Tawreed gateway manages pipeline installation and treatment plant tenders.",
    description_ar: "مشغل خدمات المياه والصرف الصحي بالمملكة؛ منصة توريد تدير منافسات شبكات المياه ومحطات المعالجة.",
  },

  // 17. Saudi Ports Authority (Mawani)
  "src-mawani": {
    source_id: "src-mawani",
    source_name: "Saudi Ports Authority (Mawani)",
    source_name_ar: "الهيئة العامة للموانئ (موانئ)",
    authority_type: "GOVERNMENT_AUTHORITY",
    official_domain: "https://mawani.gov.sa",
    official_home_url: "https://mawani.gov.sa",
    official_tenders_url: "https://mawani.gov.sa/en/Business/Tenders/Pages/default.aspx",
    official_procurement_url: "https://mawani.gov.sa/en/Business/Pages/default.aspx",
    official_search_url: null,
    official_supplier_portal_url: "https://mawani.gov.sa/en/Services/Pages/SupplierRegistration.aspx",
    official_vendor_registration_url: "https://mawani.gov.sa/en/Services/Pages/SupplierRegistration.aspx",
    source_status: "BLOCKED",
    diagnostic_reason: "BAD_CONNECTOR",
    access_requirement: "Mawani Government Portal Registration",
    navigation_status: "DIRECT_TENDER_SEARCH_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Quay Wall Berth Construction", "Marine Dredging", "Port Logistics Park", "Crane Maintenance", "Security Staffing"],
    sectors: ["Maritime & Ports", "Marine Construction", "Logistics", "Security"],
    description_en: "Regulates 10 Saudi commercial and industrial ports. Tenders cover berth construction, dredging, logistics parks, and maintenance.",
    description_ar: "تنظم 10 موانئ سعودية تجارية وصناعية. منافساتها تشمل الأرصفة البحرية والتعميق اللوجستي والصيانة.",
  },

  // 18. Furas (Balady / MOMRAH)
  "src-furas": {
    source_id: "src-furas",
    source_name: "Furas (Balady / MOMRAH)",
    source_name_ar: "منصة فرص (وزارة البلديات والإسكان)",
    authority_type: "MUNICIPAL_INVESTMENT",
    official_domain: "https://furas.balady.gov.sa",
    official_home_url: "https://furas.balady.gov.sa",
    official_tenders_url: "https://furas.balady.gov.sa/ar/opportunities",
    official_procurement_url: "https://balady.gov.sa",
    official_search_url: "https://furas.balady.gov.sa/ar/opportunities",
    official_supplier_portal_url: "https://balady.gov.sa/ar/services/contractor-classification",
    official_vendor_registration_url: "https://balady.gov.sa",
    source_status: "RUNTIME_ENVIRONMENT_BLOCKED",
    diagnostic_reason: "RUNTIME_ENVIRONMENT_LIMITATION",
    access_requirement: "Balady Municipal Login / Nafath",
    navigation_status: "DIRECT_TENDER_SEARCH_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["فرص استثمارية", "تطوير واجهات بحرية", "تشغيل حدائق", "عقود نظافة مدن", "لوحات إعلانية"],
    sectors: ["Municipal Investment", "Commercial Real Estate", "Cleaning & FM", "Urban Development"],
    description_en: "Unified municipal investment platform for all 17 Saudi Regional Mayorates. Covers commercial leases, BOT urban projects, and city cleaning.",
    description_ar: "المنصة الاستثمارية الموحدة لجميع أمانات وبلديات المملكة الـ 17 لمشاريع الاستثمار والتأجير والنظافة.",
  },

  // 19. Public Investment Fund (PIF)
  "src-pif": {
    source_id: "src-pif",
    source_name: "Public Investment Fund (PIF Procurement)",
    source_name_ar: "صندوق الاستثمارات العامة",
    authority_type: "SOVEREIGN_WEALTH_FUND",
    official_domain: "https://www.pif.gov.sa",
    official_home_url: "https://www.pif.gov.sa",
    official_tenders_url: null,
    official_procurement_url: "https://www.pif.gov.sa/en/business/procurement",
    official_search_url: null,
    official_supplier_portal_url: "https://www.pif.gov.sa/en/business/procurement",
    official_vendor_registration_url: "https://www.pif.gov.sa/en/business/procurement",
    source_status: "BLOCKED",
    diagnostic_reason: "WAF_BLOCKED",
    access_requirement: "PIF Supplier Registration Gateway",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Corporate Advisory", "Real Estate PMC", "FM Services", "IT Infrastructure", "Hospitality Advisory"],
    sectors: ["Sovereign Fund", "Corporate Procurement", "Services", "Real Estate"],
    description_en: "Saudi sovereign wealth fund. Manages central procurement and vendor rosters feeding into the giga-project developer ecosystem.",
    description_ar: "صندوق الاستثمارات العامة؛ يدير قوائم الموردين الاستراتيجيين لمنظومة المشاريع الكبرى والشركات التابعة.",
  },

  // 20. King Salman Park Foundation
  "src-king-salman-park": {
    source_id: "src-king-salman-park",
    source_name: "King Salman Park Foundation",
    source_name_ar: "مؤسسة حديقة الملك سلمان",
    authority_type: "RIYADH_MEGAPROJECT",
    official_domain: "https://kingsalmanpark.sa",
    official_home_url: "https://kingsalmanpark.sa",
    official_tenders_url: null,
    official_procurement_url: "https://kingsalmanpark.sa/en/partners",
    official_search_url: null,
    official_supplier_portal_url: "https://kingsalmanpark.sa/en/partners",
    official_vendor_registration_url: "https://kingsalmanpark.sa/en/partners",
    source_status: "RUNTIME_ENVIRONMENT_BLOCKED",
    diagnostic_reason: "RUNTIME_ENVIRONMENT_LIMITATION",
    access_requirement: "Foundation Contractor Portal",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Royal Arts Complex", "Park Landscaping", "Underground Tunnels", "Water Features", "Catering & Hospitality"],
    sectors: ["Megaprojects", "Urban Greenery", "Civil Engineering", "Hospitality"],
    description_en: "World's largest urban park project in Riyadh. Procures extensive civil, landscaping, cultural venue and hospitality packages.",
    description_ar: "أكبر حديقة مدنية في العالم بالرياض؛ تشمل عقودها المجمع الملكي للفنون والأعمال المائية والتشجير ومرافق الضيافة.",
  },

  // 21. Sports Boulevard Foundation
  "src-sports-boulevard": {
    source_id: "src-sports-boulevard",
    source_name: "Sports Boulevard Foundation",
    source_name_ar: "مؤسسة المسار الرياضي",
    authority_type: "RIYADH_MEGAPROJECT",
    official_domain: "https://sportsboulevard.sa",
    official_home_url: "https://sportsboulevard.sa",
    official_tenders_url: null,
    official_procurement_url: "https://sportsboulevard.sa/en/partners",
    official_search_url: null,
    official_supplier_portal_url: "https://sportsboulevard.sa/en/partners",
    official_vendor_registration_url: "https://sportsboulevard.sa/en/partners",
    source_status: "AUTH_REQUIRED",
    diagnostic_reason: "AUTH_REQUIRED",
    access_requirement: "Sports Boulevard Vendor Gateway",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Promenade Civil Works", "Cycling Viaducts", "Urban Planting", "Lighting & Smart City", "Sports Facilities"],
    sectors: ["Riyadh Megaprojects", "Civil Infrastructure", "Sports & Parks"],
    description_en: "135km linear sports park connecting Hanifah and Sulai valleys in Riyadh. Key packages: bridges, cycle tracks, and landscaping.",
    description_ar: "مشروع المسار الرياضي بطول 135 كم بالرياض؛ يشمل جسور الدراجات وممرات المشاة والتشجير وتطوير الواجهات.",
  },

  // 22. New Murabba Development Company (The Mukaab)
  "src-new-murabba": {
    source_id: "src-new-murabba",
    source_name: "New Murabba Development Company (The Mukaab)",
    source_name_ar: "شركة تطوير المربع الجديد (المكعب)",
    authority_type: "PIF_GIGA_PROJECT",
    official_domain: "https://newmurabba.com",
    official_home_url: "https://newmurabba.com",
    official_tenders_url: null,
    official_procurement_url: "https://newmurabba.com/en/suppliers",
    official_search_url: null,
    official_supplier_portal_url: "https://newmurabba.com/en/suppliers",
    official_vendor_registration_url: "https://newmurabba.com/en/suppliers",
    source_status: "BLOCKED",
    diagnostic_reason: "SITE_CHANGED",
    access_requirement: "New Murabba Supplier Registration",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["The Mukaab", "Deep Excavation & Shoring", "Mega Piling", "Hospitality & Retail Fit-Out", "Subcontract Packages"],
    sectors: ["Giga-Projects", "Deep Foundations", "Commercial & Retail", "Hospitality"],
    description_en: "Downtown Riyadh transformation featuring the 400m cubic landmark 'The Mukaab'. Major civil, deep foundation and hotel packages.",
    description_ar: "أكبر داون تاون حديث في الرياض يضم أيقونة 'المكعب'. مناقصات الحفر العميق والأساسات والفنادق والمرافق.",
  },

  // 23. Soudah Development
  "src-soudah": {
    source_id: "src-soudah",
    source_name: "Soudah Development",
    source_name_ar: "شركة السودة للتطوير",
    authority_type: "PIF_PORTFOLIO",
    official_domain: "https://soudah.sa",
    official_home_url: "https://soudah.sa",
    official_tenders_url: null,
    official_procurement_url: "https://soudah.sa/en/business",
    official_search_url: null,
    official_supplier_portal_url: "https://soudah.sa/en/business",
    official_vendor_registration_url: "https://soudah.sa/en/business",
    source_status: "BLOCKED",
    diagnostic_reason: "SITE_CHANGED",
    access_requirement: "Mountain Tourism Procurement",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Mountain Eco-Resort", "Cable Car Stations", "Alpine Hospitality", "Heritage Stone Restoration", "Environmental Contracting"],
    sectors: ["Hospitality & Hotels", "Mountain Tourism", "Heritage Renovation"],
    description_en: "PIF mountain tourism destination in Asir (3,015m above sea level). Procures luxury mountain resorts, cable car stations, and eco-lodges.",
    description_ar: "تطوير وجهة سياحة جبلية فاخرة في عسير؛ عقود المنتجعات البيئية والضيافة الجبلية وترميم القرى التراثية.",
  },

  // 24. Rua Al Madinah Holding
  "src-rua-almadinah": {
    source_id: "src-rua-almadinah",
    source_name: "Rua Al Madinah Holding",
    source_name_ar: "شركة رؤى المدينة القابضة",
    authority_type: "PIF_PORTFOLIO",
    official_domain: "https://ruaalmadinah.com",
    official_home_url: "https://ruaalmadinah.com",
    official_tenders_url: null,
    official_procurement_url: "https://ruaalmadinah.com/en/vendors",
    official_search_url: null,
    official_supplier_portal_url: "https://ruaalmadinah.com/en/vendors",
    official_vendor_registration_url: "https://ruaalmadinah.com/en/vendors",
    source_status: "BLOCKED",
    diagnostic_reason: "SITE_CHANGED",
    access_requirement: "Rua Al Madinah Supplier Portal",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Mega Hotel Towers", "Hospitality Fit-Out 47000 Rooms", "Underground Infrastructure", "MEP Contracting", "Housekeeping & Facility Management"],
    sectors: ["Hospitality & Hotels", "Mega Hotels", "Facility Management", "Subcontracting"],
    description_en: "Developing 47,000 hotel rooms east of the Prophet's Mosque in Madinah. Massive demand for hotel MEP, interior fit-out, and FM.",
    description_ar: "مشروع تطوير 47 ألف غرفة فندقية شرق المسجد النبوي؛ أضخم محفظة لعقود الفنادق والتشغيل والصيانة بالمملكة.",
  },

  // 25. Saudi Entertainment Ventures (SEVEN)
  "src-seven": {
    source_id: "src-seven",
    source_name: "Saudi Entertainment Ventures (SEVEN)",
    source_name_ar: "مشاريع الترفيه السعودية (سڤن)",
    authority_type: "PIF_PORTFOLIO",
    official_domain: "https://seven.sa",
    official_home_url: "https://seven.sa",
    official_tenders_url: null,
    official_procurement_url: "https://seven.sa/en/partners",
    official_search_url: null,
    official_supplier_portal_url: "https://seven.sa/en/partners",
    official_vendor_registration_url: "https://seven.sa/en/partners",
    source_status: "BLOCKED",
    diagnostic_reason: "WAF_BLOCKED",
    access_requirement: "Entertainment Complex Vendor System",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Entertainment Complex Civil", "Cinema Fit-Out", "Indoor Water Park", "F&B Fit-Out", "Acoustic Engineering"],
    sectors: ["Entertainment", "Commercial Contracting", "Fit-Out", "Hospitality"],
    description_en: "Building 21 entertainment complexes across 14 Saudi cities. Major civil construction, audio-visual, cinema and theme attraction packages.",
    description_ar: "تطوير 21 مجمعاً ترفيهياً في 14 مدينة بالمملكة؛ تشمل أعمال المقاولات وتجهيز صالات العرض والمطاعم.",
  },

  // 26. King Abdullah Economic City (KAEC)
  "src-kaec": {
    source_id: "src-kaec",
    source_name: "King Abdullah Economic City (KAEC)",
    source_name_ar: "مدينة الملك عبدالله الاقتصادية",
    authority_type: "PRIVATE_DEVELOPER",
    official_domain: "https://www.kaec.net",
    official_home_url: "https://www.kaec.net",
    official_tenders_url: null,
    official_procurement_url: "https://www.kaec.net/business",
    official_search_url: null,
    official_supplier_portal_url: "https://www.kaec.net/business/suppliers",
    official_vendor_registration_url: "https://www.kaec.net/business/suppliers",
    source_status: "BLOCKED",
    diagnostic_reason: "WAF_BLOCKED",
    access_requirement: "KAEC Supplier Relations",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Industrial Valley Contracting", "Coastal Community Residential", "Hotel Facility Management", "Logistics Warehouses"],
    sectors: ["Industrial", "Hospitality", "Logistics", "Facility Management"],
    description_en: "Modern city on the Red Sea coast featuring King Abdullah Port and Industrial Valley. Active hotel and industrial maintenance tenders.",
    description_ar: "مدينة عصرية متكاملة على ساحل البحر الأحمر تضم الوادي الصناعي ومنتجعات فندقية ومرافق سكنية.",
  },

  // 27. King Abdullah Port (KAP)
  "src-kap": {
    source_id: "src-kap",
    source_name: "King Abdullah Port & Terminal Operators",
    source_name_ar: "ميناء الملك عبدالله ومشغلو المحطات",
    authority_type: "PRIVATE_PORT",
    official_domain: "https://www.kingabdullahport.com.sa",
    official_home_url: "https://www.kingabdullahport.com.sa",
    official_tenders_url: null,
    official_procurement_url: "https://www.kingabdullahport.com.sa/business",
    official_search_url: null,
    official_supplier_portal_url: null,
    official_vendor_registration_url: null,
    source_status: "AUTHENTICATED_CONNECTOR_NOT_CONFIGURED",
    diagnostic_reason: "AUTH_REQUIRED",
    access_requirement: "Port Terminal Procurement",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Container Terminal Civil", "Bulk Cargo Warehouses", "Dredging Services", "Equipment Maintenance"],
    sectors: ["Maritime & Ports", "Logistics", "Civil Works"],
    description_en: "First privately owned and developed port in the Middle East. Contracts for marine logistics, terminal civil expansion and maintenance.",
    description_ar: "أول ميناء مطور ومملوك للقطاع الخاص بالمنطقة؛ عقود التوسعة البحرية والساحات اللوجستية.",
  },

  // 28. Jeddah Central Development Company (JCDC)
  "src-jeddah-central": {
    source_id: "src-jeddah-central",
    source_name: "Jeddah Central Development Company (JCDC)",
    source_name_ar: "شركة وسط جدة للتطوير",
    authority_type: "PIF_GIGA_PROJECT",
    official_domain: "https://jeddahcentral.com",
    official_home_url: "https://jeddahcentral.com",
    official_tenders_url: null,
    official_procurement_url: "https://jeddahcentral.com/en/partners",
    official_search_url: null,
    official_supplier_portal_url: "https://jeddahcentral.com/en/partners",
    official_vendor_registration_url: "https://jeddahcentral.com/en/partners",
    source_status: "RUNTIME_ENVIRONMENT_BLOCKED",
    diagnostic_reason: "RUNTIME_ENVIRONMENT_LIMITATION",
    access_requirement: "JCDC Partner Portal",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Opera House", "Oceanarium", "Stadium Contracting", "Marina & Yacht Club", "Waterfront Hospitality"],
    sectors: ["Megaprojects", "Civil Construction", "Hospitality & Marina", "Sports"],
    description_en: "Transforming historic Jeddah waterfront. 4 major landmarks: Opera House, Museum, Sports Stadium, and Oceanarium.",
    description_ar: "مشروع تطوير كورنيش وسط جدة؛ يضم دار الأوبرا والمتحف والاستاد الرياضي والأكواريوم ومراسي اليخوت.",
  },

  // 29. King Salman Energy City (SPARK)
  "src-spark": {
    source_id: "src-spark",
    source_name: "King Salman Energy City (SPARK)",
    source_name_ar: "مدينة الملك سلمان للطاقة (سبارك)",
    authority_type: "INDUSTRIAL_CITY",
    official_domain: "https://spark.sa",
    official_home_url: "https://spark.sa",
    official_tenders_url: null,
    official_procurement_url: "https://spark.sa/suppliers",
    official_search_url: null,
    official_supplier_portal_url: "https://spark.sa/suppliers",
    official_vendor_registration_url: "https://spark.sa/suppliers",
    source_status: "BLOCKED",
    diagnostic_reason: "SITE_CHANGED",
    access_requirement: "SPARK Supplier Relations",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Dry Port Logistics", "Industrial Factory Civil", "Road Infrastructure", "Substation 380kV", "FM Services"],
    sectors: ["Energy Infrastructure", "Industrial Construction", "Logistics", "Facility Management"],
    description_en: "Energy hub city in Eastern Province between Dammam and Al Ahsa. Industrial civil construction and dry port facilities.",
    description_ar: "المركز الإقليمي للطاقة بالمنطقة الشرقية؛ عقود الإنشاءات الصناعية والميناء الجاف والبنية التحتية.",
  },

  // 30. MODON (Industrial Cities Authority)
  "src-modon": {
    source_id: "src-modon",
    source_name: "MODON (Industrial Cities Authority)",
    source_name_ar: "الهيئة السعودية للمدن الصناعية (مدن)",
    authority_type: "GOVERNMENT_AUTHORITY",
    official_domain: "https://modon.gov.sa",
    official_home_url: "https://modon.gov.sa",
    official_tenders_url: "https://modon.gov.sa/en/Business/Tenders",
    official_procurement_url: "https://modon.gov.sa/en/Business",
    official_search_url: "https://modon.gov.sa/en/Business/Tenders",
    official_supplier_portal_url: "https://modon.gov.sa/en/eservices",
    official_vendor_registration_url: "https://modon.gov.sa/en/eservices",
    source_status: "AUTH_REQUIRED",
    diagnostic_reason: "AUTH_REQUIRED",
    access_requirement: "MODON Partner Gateway & GTPL",
    navigation_status: "DIRECT_TENDER_SEARCH_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Ready Factories Civil", "Industrial City Roads", "Wastewater Treatment", "Security Guarding", "Operation & Maintenance"],
    sectors: ["Industrial Cities", "Ready Factories", "Infrastructure", "Maintenance"],
    description_en: "Oversees 36 industrial cities across Saudi Arabia. Tenders include ready-built factory construction and utility networks.",
    description_ar: "تشرف على 36 مدينة صناعية بالمملكة؛ منافسات إنشاء المصانع الجاهزة ومحطات المعالجة وشبكات الخدمات.",
  },

  // 31. National Center for Privatization & PPP (NCP)
  "src-ncp": {
    source_id: "src-ncp",
    source_name: "National Center for Privatization & PPP (NCP)",
    source_name_ar: "المركز الوطني للتخصيص والشراكة بين القطاعين",
    authority_type: "PPP_PRIVATIZATION",
    official_domain: "https://www.ncp.gov.sa",
    official_home_url: "https://www.ncp.gov.sa",
    official_tenders_url: "https://www.ncp.gov.sa/en/pages/opportunities.aspx",
    official_procurement_url: "https://www.ncp.gov.sa/en/pages/opportunities.aspx",
    official_search_url: "https://www.ncp.gov.sa/en/pages/opportunities.aspx",
    official_supplier_portal_url: null,
    official_vendor_registration_url: null,
    source_status: "RUNTIME_ENVIRONMENT_BLOCKED",
    diagnostic_reason: "RUNTIME_ENVIRONMENT_LIMITATION",
    access_requirement: "Public PPP Pipeline Disclosures",
    navigation_status: "DIRECT_TENDER_SEARCH_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Desalination BOT", "School Infrastructure PPP", "Hospital Operations", "Highway Toll Concessions"],
    sectors: ["PPP Concessions", "Privatization", "Healthcare", "Education", "Water"],
    description_en: "Manages Saudi Arabia's privatization program. High-value BOT concessions in water, transport, health and education.",
    description_ar: "الجهة المشرفة على التخصيص والشراكة (PPP)؛ تشمل مشاريع الامتياز الكبرى كالمستشفيات والمدارس ومحطات التحلية.",
  },

  // 32. Saudi Water Authority (SWA)
  "src-swa": {
    source_id: "src-swa",
    source_name: "Saudi Water Authority (SWA)",
    source_name_ar: "الهيئة السعودية للمياه",
    authority_type: "GOVERNMENT_AUTHORITY",
    official_domain: "https://swa.gov.sa",
    official_home_url: "https://swa.gov.sa",
    official_tenders_url: "https://swa.gov.sa/tenders",
    official_procurement_url: "https://swa.gov.sa",
    official_search_url: null,
    official_supplier_portal_url: null,
    official_vendor_registration_url: null,
    source_status: "BLOCKED",
    diagnostic_reason: "SITE_CHANGED",
    access_requirement: "GTPL & Water Regulatory Gateway",
    navigation_status: "DIRECT_TENDER_SEARCH_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Desalination Plants Maintenance", "Transmission Pipeline Rehabilitation", "Pumping Stations", "Chemical Supplies"],
    sectors: ["Water & Desalination", "Heavy Engineering", "Utilities"],
    description_en: "Regulates Saudi water sector and mega-desalination infrastructure. Major plant rehabilitation and transmission tenders.",
    description_ar: "الهيئة المنظمة لقطاع المياه ومنظومات التحلية والنقل؛ تشمل عقود صيانة المحطات وخطوط الأنابيب.",
  },

  // 33. Water Transmission and Technologies Company (WTTCO)
  "src-wttco": {
    source_id: "src-wttco",
    source_name: "Water Transmission and Technologies Company (WTTCO)",
    source_name_ar: "شركة نقل وتقنيات المياه",
    authority_type: "SEMI_GOVERNMENT_SOE",
    official_domain: "https://wttco.com",
    official_home_url: "https://wttco.com",
    official_tenders_url: "https://wttco.com/en/suppliers",
    official_procurement_url: "https://wttco.com/en/suppliers",
    official_search_url: null,
    official_supplier_portal_url: "https://wttco.com/en/suppliers",
    official_vendor_registration_url: "https://wttco.com/en/suppliers",
    source_status: "BLOCKED",
    diagnostic_reason: "WAF_BLOCKED",
    access_requirement: "WTTCO Vendor Registration",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Water Transmission Lines", "Steel Pipe Supply", "Pumping Stations Civil", "Pipeline Cathodic Protection"],
    sectors: ["Water Transmission", "Heavy Civil", "Pipelines", "Pumping Systems"],
    description_en: "Operates 9,000+ km of water transmission pipelines across the Kingdom. Procures large-diameter steel piping and pumping systems.",
    description_ar: "المشغل لشبكات نقل المياه المحلاة بطول يتجاوز 9,000 كم؛ تشمل عقود الأنابيب ومحطات الضخ والحماية الكاثودية.",
  },

  // 34. Saudi Arabia Railways (SAR)
  "src-sar": {
    source_id: "src-sar",
    source_name: "Saudi Arabia Railways (SAR)",
    source_name_ar: "الخطوط الحديدية السعودية (سار)",
    authority_type: "SEMI_GOVERNMENT_SOE",
    official_domain: "https://www.sar.com.sa",
    official_home_url: "https://www.sar.com.sa",
    official_tenders_url: "https://www.sar.com.sa/en/Suppliers",
    official_procurement_url: "https://www.sar.com.sa/en/Suppliers",
    official_search_url: null,
    official_supplier_portal_url: "https://www.sar.com.sa/en/Suppliers",
    official_vendor_registration_url: "https://www.sar.com.sa/en/Suppliers/Registration",
    source_status: "AUTHENTICATED_CONNECTOR_AVAILABLE",
    diagnostic_reason: "AUTH_REQUIRED",
    access_requirement: "SAR Vendor Portal Login",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Railway Track Maintenance", "Passenger Station FM", "Signaling & Telecom", "Locomotive Spares", "Station Cleaning"],
    sectors: ["Rail & Transport", "Civil Infrastructure", "Facility Management", "Cleaning"],
    description_en: "Kingdom's national railway operator (North-South, East, and Haramain lines). Track construction, station FM and cleaning tenders.",
    description_ar: "المشغل الوطني لشبكات السكك الحديدية (قطار الحرمين، قطار الشمال والشرق)؛ عقود صيانة الخطوط ومحطات الركاب والنظافة.",
  },

  // 35. Riyadh Airports Company (RAC)
  "src-rac": {
    source_id: "src-rac",
    source_name: "Riyadh Airports Company (RAC)",
    source_name_ar: "شركة مطارات الرياض (مطار الملك خالد)",
    authority_type: "SEMI_GOVERNMENT_SOE",
    official_domain: "https://riyadhairports.com",
    official_home_url: "https://riyadhairports.com",
    official_tenders_url: "https://riyadhairports.com/en/business/procurement",
    official_procurement_url: "https://riyadhairports.com/en/business",
    official_search_url: null,
    official_supplier_portal_url: "https://riyadhairports.com/en/business/procurement",
    official_vendor_registration_url: "https://riyadhairports.com/en/business/procurement",
    source_status: "BLOCKED",
    diagnostic_reason: "SITE_CHANGED",
    access_requirement: "RAC Supplier Gateway",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Terminal 1-2 Renovation", "Airfield Runway Asphalt", "Baggage Handling System", "Airport Housekeeping", "Retail Fit-Out"],
    sectors: ["Aviation & Airports", "Renovation", "Facility Management", "Housekeeping", "Civil Contracting"],
    description_en: "Operator of King Khalid International Airport (RUH) in Riyadh. Major terminal refurbishment, apron pavement and FM contracts.",
    description_ar: "مشغل مطار الملك خالد الدولي بالرياض؛ تشمل عقود تأهيل الصالات وتعبيد المدارج وخدمات النظافة والتشغيل.",
  },

  // 36. Jeddah Airports Company (JEDCO)
  "src-jeddah-airports": {
    source_id: "src-jeddah-airports",
    source_name: "Jeddah Airports Company (JEDCO)",
    source_name_ar: "شركة مطارات جدة (مطار الملك عبدالعزيز)",
    authority_type: "SEMI_GOVERNMENT_SOE",
    official_domain: "https://jeddahairports.com.sa",
    official_home_url: "https://jeddahairports.com.sa",
    official_tenders_url: "https://jeddahairports.com.sa/en/business/procurement",
    official_procurement_url: "https://jeddahairports.com.sa/en/business",
    official_search_url: null,
    official_supplier_portal_url: "https://jeddahairports.com.sa/en/business/procurement",
    official_vendor_registration_url: "https://jeddahairports.com.sa/en/business/procurement",
    source_status: "BLOCKED",
    diagnostic_reason: "BAD_URL",
    access_requirement: "JEDCO Vendor Portal",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Hajj Terminal Upgrades", "Terminal 1 Operations", "Baggage Handling", "Janitorial Services", "Passenger Transport"],
    sectors: ["Aviation & Airports", "Facility Management", "Cleaning", "Operations"],
    description_en: "Operates King Abdulaziz International Airport (JED) including Hajj Terminal. Regular janitorial, maintenance and facility packages.",
    description_ar: "مشغل مطار الملك عبدالعزيز الدولي بجدة وصالة الحجاج؛ مناقصات التشغيل والصيانة والنظافة وخدمات الركاب.",
  },

  // 37. Dammam Airports Company (DACO)
  "src-dammam-airports": {
    source_id: "src-dammam-airports",
    source_name: "Dammam Airports Company (DACO)",
    source_name_ar: "شركة مطارات الدمام (مطار الملك فهد)",
    authority_type: "SEMI_GOVERNMENT_SOE",
    official_domain: "https://daco.sa",
    official_home_url: "https://daco.sa",
    official_tenders_url: "https://daco.sa/en/tenders",
    official_procurement_url: "https://daco.sa/en/business",
    official_search_url: null,
    official_supplier_portal_url: "https://daco.sa/en/suppliers",
    official_vendor_registration_url: "https://daco.sa/en/suppliers",
    source_status: "BLOCKED",
    diagnostic_reason: "SITE_CHANGED",
    access_requirement: "DACO Procurement System",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Terminal Facilities", "Air Cargo Village Expansion", "Airport Landscaping", "Pavement Maintenance"],
    sectors: ["Aviation & Airports", "Logistics", "Facility Management"],
    description_en: "Operates King Fahd International Airport (DMM) in Eastern Province. Terminal upgrades and cargo village expansion tenders.",
    description_ar: "مشغل مطار الملك فهد الدولي بالدمام؛ تشمل عقود قرية الشحن الجوي وتطوير الصالات والخدمات الأرضية.",
  },

  // 38. MATARAT Holding
  "src-matarat": {
    source_id: "src-matarat",
    source_name: "MATARAT Holding",
    source_name_ar: "شركة مطارات القابضة",
    authority_type: "SEMI_GOVERNMENT_SOE",
    official_domain: "https://matarat.com.sa",
    official_home_url: "https://matarat.com.sa",
    official_tenders_url: "https://matarat.com.sa/en/business/procurement",
    official_procurement_url: "https://matarat.com.sa/en/business",
    official_search_url: null,
    official_supplier_portal_url: "https://matarat.com.sa/en/business/procurement",
    official_vendor_registration_url: "https://matarat.com.sa/en/business/procurement",
    source_status: "RUNTIME_ENVIRONMENT_BLOCKED",
    diagnostic_reason: "RUNTIME_ENVIRONMENT_LIMITATION",
    access_requirement: "MATARAT Holding Portal",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Regional Airports Upgrades", "Abha Airport Project", "Taif Airport Expansion", "Airport Master Planning"],
    sectors: ["Aviation Holding", "Airport Infrastructure", "Construction"],
    description_en: "Manages 27 Saudi regional and international airports. Oversees new Abha, Taif, and Al-Ahsa airport development programs.",
    description_ar: "القابضة المشرفة على 27 مطاراً بالمملكة؛ تدير مشاريع تطوير مطار أبها الجديد ومطارات الطائف والأحساء وجيزان.",
  },

  // 39. Ma'aden (Saudi Arabian Mining Company)
  "src-maaden": {
    source_id: "src-maaden",
    source_name: "Ma'aden (Saudi Arabian Mining Company)",
    source_name_ar: "شركة التعدين العربية السعودية (معادن)",
    authority_type: "SEMI_GOVERNMENT_SOE",
    official_domain: "https://www.maaden.com.sa",
    official_home_url: "https://www.maaden.com.sa",
    official_tenders_url: "https://www.maaden.com.sa/en/investor/suppliers",
    official_procurement_url: "https://www.maaden.com.sa/en/procurement",
    official_search_url: null,
    official_supplier_portal_url: "https://www.maaden.com.sa/en/investor/suppliers",
    official_vendor_registration_url: "https://www.maaden.com.sa/en/investor/suppliers",
    source_status: "BLOCKED",
    diagnostic_reason: "SITE_CHANGED",
    access_requirement: "Ma'aden Ariba Portal",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Phosphate 3 Civil", "Gold Mine Infrastructure", "Heavy Earthmoving", "Remote Camp Catering & Housekeeping", "Industrial Maintenance"],
    sectors: ["Mining & Metals", "Heavy Civil", "Industrial Maintenance", "Camp Catering & FM"],
    description_en: "National mining champion. Major heavy civil earthmoving, remote camp accommodation, catering, and processing plant contracts.",
    description_ar: "العملاق الوطني للتعدين؛ عقود الأعمال الترابية الثقيلة وإنشاء مخيمات الإعاشة والضيافة وصيانة المصانع.",
  },

  // 40. SABIC Global Procurement
  "src-sabic": {
    source_id: "src-sabic",
    source_name: "SABIC Global Procurement",
    source_name_ar: "سابك (الشركة السعودية للصناعات الأساسية)",
    authority_type: "SEMI_GOVERNMENT_SOE",
    official_domain: "https://www.sabic.com",
    official_home_url: "https://www.sabic.com",
    official_tenders_url: null,
    official_procurement_url: "https://www.sabic.com/en/about/suppliers",
    official_search_url: null,
    official_supplier_portal_url: "https://www.sabic.com/en/about/suppliers",
    official_vendor_registration_url: "https://www.sabic.com/en/about/suppliers",
    source_status: "BLOCKED",
    diagnostic_reason: "UNKNOWN",
    access_requirement: "SABIC SAP Ariba Supplier Network",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Petrochemical Plant Turnaround", "Industrial Scaffolding", "Heat Exchanger Maintenance", "Safety Equipment", "Facility Services"],
    sectors: ["Petrochemicals", "Industrial Scaffolding", "Maintenance & Turnaround"],
    description_en: "World petrochemical leader. Contracts for plant turnaround maintenance, industrial insulation, scaffolding, and site logistics.",
    description_ar: "رائد البتروكيماويات العالمي؛ مناقصات العمرات الدورية للمصانع، السقالات الصناعية، والعزل والتشغيل.",
  },

  // 41. Jazan City for Primary and Downstream Industries (JCPDI)
  "src-jazan-city": {
    source_id: "src-jazan-city",
    source_name: "Jazan City for Primary and Downstream Industries (JCPDI)",
    source_name_ar: "مدينة جازان للصناعات الأساسية والتحويلية",
    authority_type: "GOVERNMENT_AUTHORITY",
    official_domain: "https://www.rcjy.gov.sa",
    official_home_url: "https://www.rcjy.gov.sa",
    official_tenders_url: "https://www.rcjy.gov.sa/en/jazan",
    official_procurement_url: "https://www.rcjy.gov.sa/en/jazan",
    official_search_url: null,
    official_supplier_portal_url: "https://www.rcjy.gov.sa/en/Business/Suppliers",
    official_vendor_registration_url: "https://www.rcjy.gov.sa/en/Business/Suppliers",
    source_status: "BLOCKED",
    diagnostic_reason: "SITE_CHANGED",
    access_requirement: "RCJY Jubail & Jazan Portal",
    navigation_status: "PROCUREMENT_PAGE_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["JCPDI Seaport Terminal", "Industrial Seawater Cooling", "Housing Community Phase 2", "Road Grading"],
    sectors: ["Industrial Cities", "Heavy Marine", "Civil Contracting"],
    description_en: "Royal Commission industrial mega-city on the southern Red Sea. Primary seaport, cooling canal, and industrial park tenders.",
    description_ar: "مدينة الهيئة الملكية الصناعية بالساحل الجنوبي؛ تشمل ميناء جازان وقنوات التبريد بمياه البحر والمدن السكنية.",
  },

  // 42. MUSAHAMA / PIF Supplier Ecosystem
  "src-musahama": {
    source_id: "src-musahama",
    source_name: "MUSAHAMA / PIF Supplier Ecosystem",
    source_name_ar: "برنامج مساهمة (برنامج تنمية المحتوى المحلي لصندوق الاستثمارات)",
    authority_type: "LOCAL_CONTENT_INITIATIVE",
    official_domain: "https://www.pif.gov.sa",
    official_home_url: "https://www.pif.gov.sa",
    official_tenders_url: null,
    official_procurement_url: "https://www.pif.gov.sa/en/musahama",
    official_search_url: null,
    official_supplier_portal_url: "https://www.pif.gov.sa/en/musahama",
    official_vendor_registration_url: "https://www.pif.gov.sa/en/musahama",
    source_status: "BLOCKED",
    diagnostic_reason: "WAF_BLOCKED",
    access_requirement: "Musahama Local Content Registration",
    navigation_status: "SUPPLIER_PORTAL_AVAILABLE",
    manual_search_available: true,
    last_url_verified_at: "2026-10-11T04:00:00Z",
    suggested_search_terms: ["Local Content Registration", "SME Supplier Matchmaking", "Tier-1 Contractor Subcontracting", "National Champion Suppliers"],
    sectors: ["Local Content", "SME Matchmaking", "Subcontracting"],
    description_en: "PIF's local content program connecting verified Saudi contractors and suppliers directly to giga-project procurement offices.",
    description_ar: "برنامج المحتوى المحلي لصندوق الاستثمارات العامة؛ يربط المقاولين والموردين الوطنيين بمشاريع الصندوق الكبرى.",
  },
};

/**
 * Returns navigation record for a specific source ID.
 */
export function getSourceNavigation(sourceId: string): SourceNavigationRecord | null {
  return SOURCE_NAVIGATION_REGISTRY[sourceId] || null;
}

/**
 * Returns all 42 navigation records.
 */
export function getAllSourceNavigations(): SourceNavigationRecord[] {
  return Object.values(SOURCE_NAVIGATION_REGISTRY);
}

/**
 * Filters source navigations matching sector or keywords.
 */
export function getSourceNavigationsBySector(keyword: string): SourceNavigationRecord[] {
  const q = keyword.toLowerCase();
  return Object.values(SOURCE_NAVIGATION_REGISTRY).filter((s) => {
    return (
      s.sectors.some((sec) => sec.toLowerCase().includes(q)) ||
      s.suggested_search_terms.some((term) => term.toLowerCase().includes(q)) ||
      s.source_name.toLowerCase().includes(q) ||
      s.source_name_ar.includes(keyword)
    );
  });
}

/**
 * Specialized filter for Hospitality & Hotel sources.
 */
export function getHospitalityAndHotelSources(): SourceNavigationRecord[] {
  return Object.values(SOURCE_NAVIGATION_REGISTRY).filter((s) =>
    s.sectors.some((sec) => sec.toLowerCase().includes("hosp") || sec.toLowerCase().includes("hotel") || sec.toLowerCase().includes("tourism"))
  );
}

/**
 * Specialized filter for Construction & Subcontracting sources.
 */
export function getConstructionAndSubcontractSources(): SourceNavigationRecord[] {
  return Object.values(SOURCE_NAVIGATION_REGISTRY).filter((s) =>
    s.sectors.some((sec) => sec.toLowerCase().includes("construct") || sec.toLowerCase().includes("subcontract") || sec.toLowerCase().includes("infra"))
  );
}

/**
 * Specialized filter for Facility Management, Cleaning, and Manpower sources.
 */
export function getFacilityAndManpowerSources(): SourceNavigationRecord[] {
  return Object.values(SOURCE_NAVIGATION_REGISTRY).filter((s) =>
    s.sectors.some((sec) => sec.toLowerCase().includes("manpower") || sec.toLowerCase().includes("facility") || sec.toLowerCase().includes("clean") || sec.toLowerCase().includes("service"))
  );
}

/**
 * Specialized filter for Renovation and Restoration sources.
 */
export function getRenovationAndRestorationSources(): SourceNavigationRecord[] {
  return Object.values(SOURCE_NAVIGATION_REGISTRY).filter((s) =>
    s.sectors.some((sec) => sec.toLowerCase().includes("renov") || sec.toLowerCase().includes("restor") || sec.toLowerCase().includes("heritage"))
  );
}

/**
 * Human-readable badge metadata for navigation status.
 */
export function getNavigationStatusBadge(status: SourceNavigationStatus): {
  labelEn: string;
  labelAr: string;
  color: string;
  descriptionEn: string;
  descriptionAr: string;
} {
  switch (status) {
    case "DIRECT_TENDER_SEARCH_AVAILABLE":
      return {
        labelEn: "DIRECT TENDER SEARCH",
        labelAr: "البحث في المناقصات متاح",
        color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        descriptionEn: "Official public tenders page accessible for manual browsing.",
        descriptionAr: "صفحة المنافسات العامة متاحة للبحث والتصفح اليدوي المباشر.",
      };
    case "SUPPLIER_PORTAL_AVAILABLE":
      return {
        labelEn: "SUPPLIER PORTAL",
        labelAr: "بوابة الموردين متاحة",
        color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        descriptionEn: "Official supplier/contractor portal available for registration and EOI.",
        descriptionAr: "بوابة الموردين والمقاولين متاحة للتسجيل وإبداء الرغبة.",
      };
    case "PROCUREMENT_PAGE_AVAILABLE":
      return {
        labelEn: "PROCUREMENT PAGE",
        labelAr: "صفحة المشتريات متاحة",
        color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        descriptionEn: "Official business and procurement overview page available.",
        descriptionAr: "صفحة مشتريات وشراكات الأعمال الرسمية متاحة للمراجعة.",
      };
    case "NAFATH_REQUIRED":
      return {
        labelEn: "NAFATH REQUIRED",
        labelAr: "يتطلب نفاذ أعمال",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        descriptionEn: "Government procurement requires personal Corporate Nafath 2FA login.",
        descriptionAr: "المشتريات الحكومية تتطلب تسجيل دخول بمصادقة نفاذ أعمال الوطني.",
      };
    case "AUTH_REQUIRED":
      return {
        labelEn: "LOGIN REQUIRED",
        labelAr: "يتطلب تسجيل دخول",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        descriptionEn: "Access to detailed packages requires enterprise credentials.",
        descriptionAr: "الاطلاع على تفاصيل الحزم يتطلب حساب مورد معتمد لدى الجهة.",
      };
    case "OFFICIAL_HOMEPAGE_ONLY":
      return {
        labelEn: "HOMEPAGE ONLY",
        labelAr: "الموقع الرئيسي فقط",
        color: "bg-slate-500/10 text-slate-300 border-slate-500/30",
        descriptionEn: "Only general marketing homepage is public; procurement is private/direct.",
        descriptionAr: "الموقع العام متاح؛ عمليات الشراء تتم عبر لجان خاصة أو استيراد معتمد.",
      };
    case "BROKEN_DESTINATION":
      return {
        labelEn: "BROKEN DESTINATION",
        labelAr: "رابط معطل / غير متاح",
        color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        descriptionEn: "Historical endpoint returned 404/DNS error; manual fallback to homepage.",
        descriptionAr: "الرابط القديم غير موجود؛ يمكن الرجوع للموقع العام للجهة.",
      };
    case "NO_VERIFIED_NAVIGATION_URL":
    default:
      return {
        labelEn: "UNKNOWN",
        labelAr: "غير محدد",
        color: "bg-slate-800 text-slate-400 border-slate-700",
        descriptionEn: "No verified official destination url found.",
        descriptionAr: "لا يتوفر رابط رسمي موثق حالياً.",
      };
  }
}

/**
 * Safely opens an external URL in the user's default browser outside BidPilot's frame.
 * Enforces security headers (noopener, noreferrer).
 */
export function openExternalUrl(url: string): boolean {
  if (!url || typeof window === "undefined") return false;
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w || w.closed || typeof w.closed === "undefined") {
      // Pop-up blocker encountered: fallback to window.location or return false
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies a destination URL or suggested search keyword to the clipboard with fallback.
 */
export async function copyUrlToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers / iframes
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
