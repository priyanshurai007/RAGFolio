from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import tempfile
import os

from app.parser import parse_document
from app.section_detector import detect_sections

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


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "RAGfolio Parser",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "parse": "/parse (POST)"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "parser"}


@app.post("/parse", response_model=ParseResponse)
async def parse_resume(file: UploadFile = File(...)):
    """
    Parse a resume file (PDF or DOCX) and extract structured information.
    
    Args:
        file: Uploaded file (PDF or DOCX)
        
    Returns:
        ParseResponse with raw_text, sections, and metadata
    """
    temp_path = None
    try:
        # Save uploaded file to temporary location
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        logger.info(f"Processing uploaded file: {file.filename} (temp: {temp_path})")
        
        # Extract raw text from document
        raw_text, metadata = parse_document(temp_path)
        
        if not raw_text:
            raise HTTPException(status_code=400, detail="Could not extract text from document")
        
        # Detect and extract sections
        sections = detect_sections(raw_text)
        
        logger.info(f"Successfully parsed document. Found {len(sections)} sections.")
        
        return ParseResponse(
            raw_text=raw_text,
            sections=sections,
            metadata=metadata
        )
    
    except Exception as e:
        logger.error(f"Error parsing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error parsing document: {str(e)}")
    
    finally:
        # Clean up temporary file
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except Exception as e:
                logger.warning(f"Could not delete temp file: {e}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    logger.info(f"Starting parser service on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
