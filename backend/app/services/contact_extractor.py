import re
from typing import Dict, Any, Optional

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_REGEX = re.compile(r"(?:\+966|00966|0)(?:1[1-9]|5[0-9]|800|9200)\d{6,7}")

# Prohibited personal prefixes
PERSONAL_INDICATORS = ["personal", "gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]

# Legitimate procurement indicators
PROCUREMENT_EMAIL_PREFIXES = ["tender", "procurement", "vendor", "supplier", "purchasing", "contracts", "info", "contact", "support", "sales", "iktva"]

class PublicContactExtractor:
    """Safe extraction of official business and procurement contacts."""

    @staticmethod
    def extract_public_contact(text: str, default_portal_url: Optional[str] = None) -> Dict[str, Any]:
        """Extract public business contact details while rejecting private/personal email domains."""
        if not text:
            return {"supplier_portal": default_portal_url or "UNKNOWN"}

        found_emails = EMAIL_REGEX.findall(text)
        filtered_emails = []
        for e in found_emails:
            e_lower = e.lower()
            # Reject free personal email providers
            if any(p in e_lower for p in PERSONAL_INDICATORS):
                continue
            # Keep corporate/official emails
            filtered_emails.append(e)

        found_phones = PHONE_REGEX.findall(text)

        result: Dict[str, Any] = {}
        if filtered_emails:
            result["procurement_email"] = filtered_emails[0]
        if found_phones:
            result["business_phone"] = found_phones[0]
        if default_portal_url:
            result["supplier_portal"] = default_portal_url

        return result
