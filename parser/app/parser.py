import os
from pathlib import Path
import pdfplumber
from docx import Document


def parse_pdf(file_path: str) -> tuple[str, dict]:
    """
    Extract text from a PDF file.
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        Tuple of (extracted_text, metadata)
    """
    text_content = []
    total_pages = 0
    
    with pdfplumber.open(file_path) as pdf:
        total_pages = len(pdf.pages)
        
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_content.append(text)
    
    full_text = "\n\n".join(text_content)
    
    metadata = {
        "total_pages": total_pages,
        "word_count": len(full_text.split()),
        "file_type": "pdf"
    }
    
    return full_text, metadata


def parse_docx(file_path: str) -> tuple[str, dict]:
    """
    Extract text from a DOCX file.
    
    Args:
        file_path: Path to the DOCX file
        
    Returns:
        Tuple of (extracted_text, metadata)
    """
    doc = Document(file_path)
    
    paragraphs = []
    for para in doc.paragraphs:
        if para.text.strip():
            paragraphs.append(para.text)
    
    full_text = "\n\n".join(paragraphs)
    
    metadata = {
        "total_pages": None,  # DOCX doesn't have explicit page count
        "word_count": len(full_text.split()),
        "paragraph_count": len(paragraphs),
        "file_type": "docx"
    }
    
    return full_text, metadata


def parse_document(file_path: str) -> tuple[str, dict]:
    """
    Parse a document (PDF or DOCX) and extract text.
    
    Args:
        file_path: Path to the document
        
    Returns:
        Tuple of (extracted_text, metadata)
        
    Raises:
        FileNotFoundError: If file doesn't exist
        ValueError: If file type is not supported
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    file_extension = Path(file_path).suffix.lower()
    
    if file_extension == '.pdf':
        return parse_pdf(file_path)
    elif file_extension in ['.docx', '.doc']:
        return parse_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")
