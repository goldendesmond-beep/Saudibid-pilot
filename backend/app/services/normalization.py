import re
from typing import Dict, Any, Tuple, Optional, List

# Normalization maps
ARABIC_CHAR_MAP = {
    'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا',
    'ة': 'ه', 'ى': 'ي', 'ؤ': 'و', 'ئ': 'ي',
}

COMMON_TITLE_PREFIXES = [
    r"^مشروع\s+", r"^منافسة\s+", r"^عقد\s+", r"^طرح\s+", r"^تأهيل\s+",
    r"^عملية\s+", r"^توريد\s+", r"^تنفيذ\s+", r"^إنشاء\s+",
    r"^project\s+for\s+", r"^tender\s+for\s+", r"^contract\s+for\s+",
    r"^construction\s+of\s+", r"^supply\s+and\s+installation\s+of\s+",
    r"^procurement\s+of\s+",
]

ENTITY_CANONICAL_MAP = {
    "أمانة منطقة الرياض": "Riyadh Municipality",
    "امانة منطقة الرياض": "Riyadh Municipality",
    "بلدية الرياض": "Riyadh Municipality",
    "riyadh municipality": "Riyadh Municipality",
    "الهيئة الملكية للجبيل وينبع": "Royal Commission for Jubail and Yanbu (RCJY)",
    "الهيئة الملكية": "Royal Commission for Jubail and Yanbu (RCJY)",
    "rcjy": "Royal Commission for Jubail and Yanbu (RCJY)",
    "أرامكو السعودية": "Saudi Aramco",
    "ارامكو": "Saudi Aramco",
    "saudi aramco": "Saudi Aramco",
    "aramco": "Saudi Aramco",
    "شركة المياه الوطنية": "National Water Company (NWC)",
    "المياه الوطنية": "National Water Company (NWC)",
    "nwc": "National Water Company (NWC)",
    "الشركة السعودية للكهرباء": "Saudi Electricity Company (SEC)",
    "كهرباء السعودية": "Saudi Electricity Company (SEC)",
    "sec": "Saudi Electricity Company (SEC)",
    "شركة نيوم": "NEOM Company",
    "نيوم": "NEOM Company",
    "neom": "NEOM Company",
    "شركة روشن": "ROSHN Real Estate",
    "روشن": "ROSHN Real Estate",
    "roshn": "ROSHN Real Estate",
    "وزارة البلديات والإسكان": "Ministry of Municipal and Rural Affairs & Housing (MOMRAH)",
    "وزارة الشؤون البلدية والقروية والإسكان": "Ministry of Municipal and Rural Affairs & Housing (MOMRAH)",
    "momrah": "Ministry of Municipal and Rural Affairs & Housing (MOMRAH)",
}

WORK_CATEGORY_MAP = {
    "مباني": "Building Construction & Commercial Contracting",
    "إنشاء مباني": "Building Construction & Commercial Contracting",
    "building": "Building Construction & Commercial Contracting",
    "construction": "Building Construction & Commercial Contracting",
    "طرق": "Roads, Bridges & Civil Infrastructure",
    "طرق وجسور": "Roads, Bridges & Civil Infrastructure",
    "roads": "Roads, Bridges & Civil Infrastructure",
    "infrastructure": "Roads, Bridges & Civil Infrastructure",
    "مياه": "Water & Sewage Infrastructure",
    "صرف صحي": "Water & Sewage Infrastructure",
    "water": "Water & Sewage Infrastructure",
    "sewage": "Water & Sewage Infrastructure",
    "كهرباء": "Electrical Power & Substation EPC",
    "طاقة": "Electrical Power & Substation EPC",
    "electrical": "Electrical Power & Substation EPC",
    "power": "Electrical Power & Substation EPC",
    "كهروميكانيك": "Electromechanical (MEP) Works",
    "ميكانيكا": "Electromechanical (MEP) Works",
    "mep": "Electromechanical (MEP) Works",
    "اتصالات": "Telecommunications & Digital Infrastructure",
    "تقنية معلومات": "Telecommunications & Digital Infrastructure",
    "telecom": "Telecommunications & Digital Infrastructure",
    "تشغيل وصيانة": "Facility Management & Operations (O&M)",
    "صيانة": "Facility Management & Operations (O&M)",
    "o&m": "Facility Management & Operations (O&M)",
    "industrial": "Industrial & Petrochemical Facilities",
    "بتروكيماويات": "Industrial & Petrochemical Facilities",
    "صناعي": "Industrial & Petrochemical Facilities",
}

class SaudiNormalizationService:
    """Robust bidirectional Saudi procurement normalization."""

    @staticmethod
    def normalize_arabic_text(text: str) -> str:
        """Strip diacritics and normalize character variations."""
        if not text:
            return ""
        # Remove Arabic tashkeel / harakat
        tashkeel = re.compile(r'[\u0617-\u061A\u064B-\u0652]')
        text = re.sub(tashkeel, '', text)
        # Normalize letters
        for src, target in ARABIC_CHAR_MAP.items():
            text = text.replace(src, target)
        # Collapse whitespace
        return re.sub(r'\s+', ' ', text).strip()

    @classmethod
    def normalize_title(cls, title: str) -> Tuple[str, str]:
        """Normalize title while stripping generic procurement prefixes. Returns (normalized, original)."""
        if not title:
            return ("UNKNOWN", "")
        cleaned = title.strip()
        original = cleaned

        # Lowercase for prefix check on English
        for prefix in COMMON_TITLE_PREFIXES:
            cleaned = re.sub(prefix, '', cleaned, flags=re.IGNORECASE)

        cleaned = cls.normalize_arabic_text(cleaned)
        return (cleaned.strip() or original, original)

    @classmethod
    def normalize_entity(cls, entity_name: str) -> Tuple[str, str]:
        """Normalize Saudi public/private entity to canonical name. Returns (canonical, original)."""
        if not entity_name:
            return ("UNKNOWN", "")
        original = entity_name.strip()
        cleaned_key = cls.normalize_arabic_text(original).lower()

        for key, canonical in ENTITY_CANONICAL_MAP.items():
            norm_key = cls.normalize_arabic_text(key).lower()
            if norm_key == cleaned_key or norm_key in cleaned_key or cleaned_key in norm_key:
                return (canonical, original)

        return (original, original)

    @classmethod
    def normalize_work_category(cls, category_raw: str) -> Tuple[str, str]:
        """Normalize tender work category to 8 Saudi official classifications."""
        if not category_raw:
            return ("UNKNOWN", "")
        original = category_raw.strip()
        cleaned = cls.normalize_arabic_text(original).lower()

        for key, canonical in WORK_CATEGORY_MAP.items():
            if key in cleaned:
                return (canonical, original)

        return (original, original)

    @staticmethod
    def normalize_sar_currency(raw_val: Any) -> Optional[float]:
        """Normalize string or numeric SAR values (handling 'SAR', 'M', 'مليون', etc.)."""
        if raw_val is None:
            return None
        if isinstance(raw_val, (int, float)):
            return float(raw_val)

        text = str(raw_val).strip().replace(',', '')
        # Check millions
        is_million = False
        if any(m in text.lower() for m in ["m", "million", "مليون"]):
            is_million = True

        # Extract digits and decimal
        numbers = re.findall(r"[-+]?(?:\d*\.\d+|\d+)", text)
        if not numbers:
            return None

        val = float(numbers[0])
        if is_million and val < 10000:
            val *= 1_000_000.0

        return val
