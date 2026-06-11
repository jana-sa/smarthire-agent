from __future__ import annotations

from io import BytesIO
from pathlib import Path

import docx
import pdfplumber
from fastapi import HTTPException, UploadFile


ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


def _validate_extension(filename: str) -> str:
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type for '{filename}'. Allowed: PDF, DOCX, TXT.",
        )
    return extension


def parse_pdf_bytes(content: bytes) -> str:
    text_parts: list[str] = []
    with pdfplumber.open(BytesIO(content)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                text_parts.append(page_text)
    return "\n".join(text_parts).strip()


def parse_docx_bytes(content: bytes) -> str:
    document = docx.Document(BytesIO(content))
    lines = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
    return "\n".join(lines).strip()


def parse_txt_bytes(content: bytes) -> str:
    return content.decode("utf-8", errors="ignore").strip()


async def extract_text_from_upload(upload: UploadFile, max_file_size_mb: int = 10) -> str:
    _validate_extension(upload.filename or "uploaded-file")
    content = await upload.read()

    if len(content) > max_file_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File '{upload.filename}' exceeds {max_file_size_mb}MB limit.",
        )

    extension = Path(upload.filename or "").suffix.lower()
    if extension == ".pdf":
        text = parse_pdf_bytes(content)
    elif extension == ".docx":
        text = parse_docx_bytes(content)
    else:
        text = parse_txt_bytes(content)

    if not text:
        raise HTTPException(
            status_code=400, detail=f"No readable text found in '{upload.filename}'."
        )
    return text
