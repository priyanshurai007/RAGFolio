import pdfplumber
import re
from typing import List, Dict
from urllib.parse import urlparse

def extract_links_from_pdf(file_path: str) -> List[Dict[str, str]]:
    """
    Extract all hyperlinks and URLs from a PDF file.
    Returns a list of dictionaries with link text and URL.
    """
    links = []
    
    try:
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                # Extract annotations (hyperlinks)
                if page.annots:
                    for annot in page.annots:
                        if annot.get('uri'):
                            url = annot['uri']
                            # Try to get the text near this link
                            text = annot.get('contents', '')
                            links.append({
                                'url': url,
                                'text': text,
                                'page': page_num,
                                'type': 'hyperlink'
                            })
                
                # Also extract URLs from plain text using regex
                text = page.extract_text()
                if text:
                    # Find URLs in text
                    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
                    found_urls = re.findall(url_pattern, text)
                    
                    for url in found_urls:
                        # Clean up URL
                        url = url.rstrip('.,;:)')
                        if url not in [link['url'] for link in links]:
                            links.append({
                                'url': url,
                                'text': '',
                                'page': page_num,
                                'type': 'plain_text'
                            })
    
    except Exception as e:
        print(f"Error extracting links: {str(e)}")
    
    return links

def categorize_links(links: List[Dict[str, str]]) -> Dict[str, List[Dict[str, str]]]:
    """
    Categorize links by platform (GitHub, LinkedIn, LeetCode, etc.)
    """
    categories = {
        'github': [],
        'linkedin': [],
        'leetcode': [],
        'codeforces': [],
        'hackerrank': [],
        'portfolio': [],
        'other': []
    }
    
    for link in links:
        url = link['url'].lower()
        domain = urlparse(link['url']).netloc.lower()
        
        if 'github.com' in domain:
            categories['github'].append(link)
        elif 'linkedin.com' in domain:
            categories['linkedin'].append(link)
        elif 'leetcode.com' in domain:
            categories['leetcode'].append(link)
        elif 'codeforces.com' in domain:
            categories['codeforces'].append(link)
        elif 'hackerrank.com' in domain:
            categories['hackerrank'].append(link)
        elif any(portfolio_keyword in domain for portfolio_keyword in ['portfolio', 'personal', 'blog', 'dev.to', 'medium.com']):
            categories['portfolio'].append(link)
        else:
            categories['other'].append(link)
    
    return categories
