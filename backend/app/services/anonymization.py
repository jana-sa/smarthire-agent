from __future__ import annotations

import re

EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
PHONE_RE = re.compile(r"(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?){2}\d{4}\b")
NAME_LABEL_RE = re.compile(r"(?im)^\s*(name|candidate)\s*[:\-]\s*.+$")


def anonymize_resume_text(text: str) -> str:
    anonymized = EMAIL_RE.sub("[EMAIL_REDACTED]", text)
    anonymized = PHONE_RE.sub("[PHONE_REDACTED]", anonymized)
    anonymized = NAME_LABEL_RE.sub("Name: [NAME_REDACTED]", anonymized)
    lines = anonymized.splitlines()
    if lines and len(lines[0].split()) <= 4 and not any(char.isdigit() for char in lines[0]):
        lines[0] = "[NAME_REDACTED]"
    return "\n".join(lines)
