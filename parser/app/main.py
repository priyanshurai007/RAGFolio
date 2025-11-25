from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

from app.parser import parse_document
from app.section_detector import detect_sections
from app.link_extractor import extract_links_from_pdf
from app.profile_analyzer import analyze_all_links

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="RAGfolio Parser Service",
    description="Resume parsing microservice for extracting text and detecting sections",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ParseRequest(BaseModel):
    file_path: str


class ParseResponse(BaseModel):
    raw_text: str
    sections: dict[str, str]
    metadata: dict
    links: list[dict] = []
    profile_analysis: dict = {}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "parser"}


@app.post("/parse", response_model=ParseResponse)
async def parse_resume(request: ParseRequest):
    """
    Parse a resume file (PDF or DOCX) and extract structured information.
    
    Args:
        request: ParseRequest containing file_path
        
    Returns:
        ParseResponse with raw_text, sections, and metadata
    """
    try:
        import os
        # Normalize path for Windows
        file_path = os.path.normpath(request.file_path)
        logger.info(f"Parsing file: {file_path}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            logger.error(f"File not found at path: {file_path}")
            raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
        
        # Extract raw text from document
        raw_text, metadata = parse_document(file_path)
        
        if not raw_text:
            raise HTTPException(status_code=400, detail="Could not extract text from document")
        
        # Detect and extract sections
        sections = detect_sections(raw_text)
        
        # Extract links if PDF
        links = []
        profile_analysis = {}
        
        if file_path.lower().endswith('.pdf'):
            try:
                links = extract_links_from_pdf(file_path)
                logger.info(f"Extracted {len(links)} links from PDF")
                
                # Analyze the extracted links
                if links:
                    logger.info(f"Analyzing {len(links)} links...")
                    profile_analysis = analyze_all_links(links)
                    logger.info(f"Profile analysis complete. Found {profile_analysis['summary']['verified_profiles']} verified profiles")
                    
            except Exception as e:
                logger.warning(f"Could not extract/analyze links: {str(e)}")
        
        logger.info(f"Successfully parsed document. Found {len(sections)} sections.")
        
        return ParseResponse(
            raw_text=raw_text,
            sections=sections,
            metadata=metadata,
            links=links,
            profile_analysis=profile_analysis
        )
        
    except FileNotFoundError:
        logger.error(f"File not found: {request.file_path}")
        raise HTTPException(status_code=404, detail="File not found")
    
    except Exception as e:
        logger.error(f"Error parsing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error parsing document: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
