import re
from typing import Dict


# Common section headers found in resumes
SECTION_PATTERNS = {
    "Education": [
        r"(?i)^education$",
        r"(?i)^academic background$",
        r"(?i)^educational background$",
        r"(?i)^academic qualifications$"
    ],
    "Experience": [
        r"(?i)^(work )?experience$",
        r"(?i)^professional experience$",
        r"(?i)^employment history$",
        r"(?i)^work history$",
        r"(?i)^career history$"
    ],
    "Projects": [
        r"(?i)^projects?$",
        r"(?i)^key projects$",
        r"(?i)^notable projects$",
        r"(?i)^academic projects$"
    ],
    "Skills": [
        r"(?i)^skills?$",
        r"(?i)^technical skills$",
        r"(?i)^core competencies$",
        r"(?i)^expertise$",
        r"(?i)^technologies$"
    ],
    "Achievements": [
        r"(?i)^achievements?$",
        r"(?i)^accomplishments?$",
        r"(?i)^awards?( and honors?)?$",
        r"(?i)^honors?( and awards?)?$",
        r"(?i)^recognition$"
    ],
    "Certifications": [
        r"(?i)^certifications?$",
        r"(?i)^licenses?( and certifications?)?$",
        r"(?i)^professional certifications$"
    ],
    "Summary": [
        r"(?i)^(professional )?summary$",
        r"(?i)^objective$",
        r"(?i)^career objective$",
        r"(?i)^profile$",
        r"(?i)^about me$"
    ],
    "Publications": [
        r"(?i)^publications?$",
        r"(?i)^research$",
        r"(?i)^papers$"
    ],
}


def detect_section_header(line: str):
    """
    Detect if a line is a section header.
    
    Args:
        line: A line of text from the resume
        
    Returns:
        Section name if detected, None otherwise
    """
    line = line.strip()
    
    # Check if line looks like a header (short, possibly all caps or title case)
    if len(line) > 50 or len(line) < 3:
        return None
    
    # Check against known patterns
    for section_name, patterns in SECTION_PATTERNS.items():
        for pattern in patterns:
            if re.match(pattern, line):
                return section_name
    
    return None


def detect_sections(text: str) -> Dict[str, str]:
    """
    Detect and extract sections from resume text.
    
    Args:
        text: Full text of the resume
        
    Returns:
        Dictionary mapping section names to their content
    """
    lines = text.split('\n')
    sections = {}
    current_section = "Summary"  # Default section for content before any header
    current_content = []
    
    for line in lines:
        stripped_line = line.strip()
        
        # Skip empty lines
        if not stripped_line:
            continue
        
        # Check if this is a section header
        detected_section = detect_section_header(stripped_line)
        
        if detected_section:
            # Save previous section content
            if current_content:
                sections[current_section] = '\n'.join(current_content).strip()
            
            # Start new section
            current_section = detected_section
            current_content = []
        else:
            # Add to current section
            current_content.append(stripped_line)
    
    # Don't forget the last section
    if current_content:
        sections[current_section] = '\n'.join(current_content).strip()
    
    # If no sections were detected, return all as "Other"
    if not sections:
        sections["Other"] = text.strip()
    
    return sections


def merge_similar_sections(sections: Dict[str, str]) -> Dict[str, str]:
    """
    Merge sections that are duplicates or very similar.
    
    Args:
        sections: Dictionary of section name to content
        
    Returns:
        Merged sections dictionary
    """
    # If there are duplicate section names, merge them
    merged = {}
    
    for section_name, content in sections.items():
        if section_name in merged:
            merged[section_name] += "\n\n" + content
        else:
            merged[section_name] = content
    
    return merged
