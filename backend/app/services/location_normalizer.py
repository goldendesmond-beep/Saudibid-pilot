from typing import Tuple, Dict

LOCATION_SYNONYMS: Dict[str, Tuple[str, str]] = {
    # Eastern Province / المنطقة الشرقية
    "jubail": ("Eastern Province", "Jubail"),
    "al jubail": ("Eastern Province", "Jubail"),
    "al-jubail": ("Eastern Province", "Jubail"),
    "الجبيل": ("Eastern Province", "Jubail"),
    "jubail industrial city": ("Eastern Province", "Jubail Industrial City"),
    "مدينة الجبيل الصناعية": ("Eastern Province", "Jubail Industrial City"),
    "الجبيل الصناعية": ("Eastern Province", "Jubail Industrial City"),
    "dammam": ("Eastern Province", "Dammam"),
    "الدمام": ("Eastern Province", "Dammam"),
    "khobar": ("Eastern Province", "Khobar"),
    "al khobar": ("Eastern Province", "Khobar"),
    "al-khobar": ("Eastern Province", "Khobar"),
    "الخبر": ("Eastern Province", "Khobar"),
    "ras al khair": ("Eastern Province", "Ras Al Khair"),
    "ras al-khair": ("Eastern Province", "Ras Al Khair"),
    "رأس الخير": ("Eastern Province", "Ras Al Khair"),
    "ras al khair industrial city": ("Eastern Province", "Ras Al Khair"),
    "مدينة رأس الخير الصناعية": ("Eastern Province", "Ras Al Khair"),
    "hofuf": ("Eastern Province", "Al-Ahsa"),
    "al ahsa": ("Eastern Province", "Al-Ahsa"),
    "الأحساء": ("Eastern Province", "Al-Ahsa"),
    "الهفوف": ("Eastern Province", "Al-Ahsa"),
    "dhahran": ("Eastern Province", "Dhahran"),
    "الظهران": ("Eastern Province", "Dhahran"),

    # Riyadh Region / منطقة الرياض
    "riyadh": ("Riyadh Region", "Riyadh"),
    "ar riyadh": ("Riyadh Region", "Riyadh"),
    "الرياض": ("Riyadh Region", "Riyadh"),
    "diriyah": ("Riyadh Region", "Diriyah"),
    "ad diriyah": ("Riyadh Region", "Diriyah"),
    "الدرعية": ("Riyadh Region", "Diriyah"),
    "kharj": ("Riyadh Region", "Al-Kharj"),
    "al kharj": ("Riyadh Region", "Al-Kharj"),
    "الخرج": ("Riyadh Region", "Al-Kharj"),

    # Makkah Region / منطقة مكة المكرمة
    "jeddah": ("Makkah Region", "Jeddah"),
    "jiddah": ("Makkah Region", "Jeddah"),
    "جدة": ("Makkah Region", "Jeddah"),
    "makkah": ("Makkah Region", "Makkah"),
    "mecca": ("Makkah Region", "Makkah"),
    "مكة": ("Makkah Region", "Makkah"),
    "مكة المكرمة": ("Makkah Region", "Makkah"),
    "taif": ("Makkah Region", "Taif"),
    "الطائف": ("Makkah Region", "Taif"),
    "rabigh": ("Makkah Region", "Rabigh"),
    "رابغ": ("Makkah Region", "Rabigh"),
    "king abdullah economic city": ("Makkah Region", "KAEC"),
    "مدينة الملك عبدالله الاقتصادية": ("Makkah Region", "KAEC"),

    # Medina Region / منطقة المدينة المنورة
    "medina": ("Medina Region", "Medina"),
    "madinah": ("Medina Region", "Medina"),
    "al madinah": ("Medina Region", "Medina"),
    "المدينة": ("Medina Region", "Medina"),
    "المدينة المنورة": ("Medina Region", "Medina"),
    "yanbu": ("Medina Region", "Yanbu"),
    "ينبع": ("Medina Region", "Yanbu"),
    "yanbu industrial city": ("Medina Region", "Yanbu Industrial City"),
    "مدينة ينبع الصناعية": ("Medina Region", "Yanbu Industrial City"),
    "ينبع الصناعية": ("Medina Region", "Yanbu Industrial City"),
    "al ula": ("Medina Region", "AlUla"),
    "alula": ("Medina Region", "AlUla"),
    "العلا": ("Medina Region", "AlUla"),

    # Tabuk Region & NEOM / منطقة تبوك
    "tabuk": ("Tabuk Region", "Tabuk"),
    "تبوك": ("Tabuk Region", "Tabuk"),
    "neom": ("Tabuk Region", "NEOM"),
    "نيوم": ("Tabuk Region", "NEOM"),
    "the line": ("Tabuk Region", "NEOM - The Line"),
    "oxagon": ("Tabuk Region", "NEOM - Oxagon"),
    "trojena": ("Tabuk Region", "NEOM - Trojena"),
    "sindalah": ("Tabuk Region", "NEOM - Sindalah"),
    "duba": ("Tabuk Region", "Duba"),
    "ضباء": ("Tabuk Region", "Duba"),

    # Asir Region / منطقة عسير
    "abha": ("Asir Region", "Abha"),
    "أبها": ("Asir Region", "Abha"),
    "khamis mushait": ("Asir Region", "Khamis Mushait"),
    "خميس مشيط": ("Asir Region", "Khamis Mushait"),
    "soudah": ("Asir Region", "Soudah"),
    "السودة": ("Asir Region", "Soudah"),

    # Jazan Region / منطقة جازان
    "jazan": ("Jazan Region", "Jazan"),
    "jizan": ("Jazan Region", "Jazan"),
    "جازان": ("Jazan Region", "Jazan"),
    "jcpdi": ("Jazan Region", "JCPDI"),
    "مدينة جازان للصناعات الأساسية والتحويلية": ("Jazan Region", "JCPDI"),

    # Qassim / منطقة القصيم
    "buraidah": ("Qassim Region", "Buraidah"),
    "بريدة": ("Qassim Region", "Buraidah"),
    "onaizah": ("Qassim Region", "Onaizah"),
    "عنيزة": ("Qassim Region", "Onaizah"),

    # Northern Borders, Hail, Najran, Al-Jouf, Al-Baha
    "arar": ("Northern Borders", "Arar"),
    "عرعر": ("Northern Borders", "Arar"),
    "waad al shamaal": ("Northern Borders", "Waad Al-Shamaal"),
    "وعد الشمال": ("Northern Borders", "Waad Al-Shamaal"),
    "hail": ("Hail Region", "Hail"),
    "حائل": ("Hail Region", "Hail"),
    "najran": ("Najran Region", "Najran"),
    "نجران": ("Najran Region", "Najran"),
    "sakaka": ("Al-Jouf Region", "Sakaka"),
    "سكاكا": ("Al-Jouf Region", "Sakaka"),
    "al baha": ("Al-Baha Region", "Al-Baha"),
    "الباحة": ("Al-Baha Region", "Al-Baha"),
}

def normalize_saudi_location(raw_text: str) -> Tuple[str, str]:
    """Normalize a raw Arabic or English location string into canonical (region, city).
    
    If unmapped, returns ('UNKNOWN', 'UNKNOWN').
    """
    if not raw_text or not isinstance(raw_text, str):
        return ("UNKNOWN", "UNKNOWN")

    cleaned = raw_text.strip().lower()

    # Direct match
    if cleaned in LOCATION_SYNONYMS:
        return LOCATION_SYNONYMS[cleaned]

    # Substring search
    for key, val in LOCATION_SYNONYMS.items():
        if key in cleaned:
            return val

    return ("UNKNOWN", "UNKNOWN")
