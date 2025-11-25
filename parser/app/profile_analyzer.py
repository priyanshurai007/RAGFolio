"""
Profile Analyzer - Visits and analyzes links from resumes
Extracts meaningful data from GitHub, LeetCode, LinkedIn, etc.
"""

import requests
import re
import logging
from typing import Dict, List, Optional, Any
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import time

logger = logging.getLogger(__name__)


class ProfileAnalyzer:
    """Analyzes coding profiles and links from resumes"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
    def analyze_links(self, links: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze all extracted links and return comprehensive profile data
        
        Args:
            links: List of dicts with 'url', 'category', 'text'
            
        Returns:
            Dict with analysis results for each category
        """
        results = {
            'github': None,
            'leetcode': None,
            'linkedin': None,
            'portfolio': [],
            'other_profiles': [],
            'email': [],
            'phone': [],
            'summary': {
                'total_links': len(links),
                'verified_profiles': 0,
                'coding_activity_found': False
            }
        }
        
        for link in links:
            category = link.get('category', 'other')
            url = link.get('url', '')
            
            try:
                # Skip analysis for email and phone (they're just contact info)
                if category == 'email':
                    results['email'].append(url.replace('mailto:', ''))
                    continue
                    
                elif category == 'phone':
                    results['phone'].append(url.replace('tel:', ''))
                    continue
                
                # Analyze actual web profiles
                if category == 'github':
                    results['github'] = self.analyze_github(url)
                    if results['github'] and results['github'].get('verified'):
                        results['summary']['verified_profiles'] += 1
                        results['summary']['coding_activity_found'] = True
                        
                elif category == 'leetcode':
                    results['leetcode'] = self.analyze_leetcode(url)
                    if results['leetcode'] and results['leetcode'].get('verified'):
                        results['summary']['verified_profiles'] += 1
                        results['summary']['coding_activity_found'] = True
                        
                elif category == 'linkedin':
                    results['linkedin'] = self.analyze_linkedin(url)
                    if results['linkedin'] and results['linkedin'].get('verified'):
                        results['summary']['verified_profiles'] += 1
                        
                elif category == 'portfolio':
                    portfolio_data = self.analyze_portfolio(url)
                    if portfolio_data:
                        results['portfolio'].append(portfolio_data)
                        
                elif category in ['hackerrank', 'codeforces', 'codechef', 'other']:
                    profile_data = self.analyze_generic_profile(url, category)
                    if profile_data:
                        results['other_profiles'].append(profile_data)
                    
            except Exception as e:
                logger.error(f"Error analyzing {category} profile {url}: {str(e)}")
                
            # Rate limiting
            time.sleep(0.5)
            
        return results
    
    def analyze_github(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Analyze GitHub profile and extract meaningful data
        
        Args:
            url: GitHub profile or repo URL
            
        Returns:
            Dict with GitHub analysis or None
        """
        try:
            # Extract username from URL
            match = re.search(r'github\.com/([^/]+)/?', url)
            if not match:
                return None
                
            username = match.group(1)
            
            # Try GitHub API (no auth needed for public data)
            api_url = f'https://api.github.com/users/{username}'
            response = self.session.get(api_url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Get repositories
                repos_url = f'https://api.github.com/users/{username}/repos?sort=updated&per_page=10'
                repos_response = self.session.get(repos_url, timeout=10)
                repos = repos_response.json() if repos_response.status_code == 200 else []
                
                # Get events (recent activity)
                events_url = f'https://api.github.com/users/{username}/events/public?per_page=10'
                events_response = self.session.get(events_url, timeout=10)
                events = events_response.json() if events_response.status_code == 200 else []
                
                # Calculate total commits (approximate from recent events)
                commit_count = sum(1 for event in events if event.get('type') == 'PushEvent')
                
                # Extract languages from repos
                languages = set()
                total_stars = 0
                for repo in repos[:10]:  # Top 10 repos
                    if repo.get('language'):
                        languages.add(repo['language'])
                    total_stars += repo.get('stargazers_count', 0)
                
                return {
                    'verified': True,
                    'username': username,
                    'url': url,
                    'name': data.get('name'),
                    'bio': data.get('bio'),
                    'public_repos': data.get('public_repos', 0),
                    'followers': data.get('followers', 0),
                    'following': data.get('following', 0),
                    'created_at': data.get('created_at'),
                    'recent_repos': [
                        {
                            'name': repo.get('name'),
                            'description': repo.get('description'),
                            'language': repo.get('language'),
                            'stars': repo.get('stargazers_count', 0),
                            'forks': repo.get('forks_count', 0),
                            'updated': repo.get('updated_at')
                        }
                        for repo in repos[:5]
                    ],
                    'languages': list(languages),
                    'total_stars': total_stars,
                    'recent_commits': commit_count,
                    'activity_level': 'high' if commit_count >= 5 else 'medium' if commit_count >= 2 else 'low'
                }
            else:
                return {
                    'verified': False,
                    'username': username,
                    'url': url,
                    'error': f'Profile not found or private (HTTP {response.status_code})'
                }
                
        except Exception as e:
            logger.error(f"Error analyzing GitHub {url}: {str(e)}")
            return {
                'verified': False,
                'url': url,
                'error': str(e)
            }
    
    def analyze_leetcode(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Analyze LeetCode profile
        
        Args:
            url: LeetCode profile URL
            
        Returns:
            Dict with LeetCode analysis or None
        """
        try:
            # Extract username
            match = re.search(r'leetcode\.com/([^/]+)/?', url)
            if not match:
                return None
                
            username = match.group(1)
            
            # Try to fetch profile page
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Try to extract stats (LeetCode's structure may vary)
                # This is a basic scraping approach
                result = {
                    'verified': True,
                    'username': username,
                    'url': url,
                    'accessible': True
                }
                
                # Try to find problem counts in the page
                # Note: LeetCode may require JavaScript, so this might not always work
                text = soup.get_text()
                
                # Look for common patterns
                solved_match = re.search(r'(\d+)\s*Solved', text, re.IGNORECASE)
                if solved_match:
                    result['problems_solved'] = int(solved_match.group(1))
                    
                easy_match = re.search(r'Easy[:\s]*(\d+)', text, re.IGNORECASE)
                if easy_match:
                    result['easy_solved'] = int(easy_match.group(1))
                    
                medium_match = re.search(r'Medium[:\s]*(\d+)', text, re.IGNORECASE)
                if medium_match:
                    result['medium_solved'] = int(medium_match.group(1))
                    
                hard_match = re.search(r'Hard[:\s]*(\d+)', text, re.IGNORECASE)
                if hard_match:
                    result['hard_solved'] = int(hard_match.group(1))
                
                return result
            else:
                return {
                    'verified': False,
                    'username': username,
                    'url': url,
                    'accessible': False
                }
                
        except Exception as e:
            logger.error(f"Error analyzing LeetCode {url}: {str(e)}")
            return {
                'verified': False,
                'url': url,
                'error': str(e)
            }
    
    def analyze_linkedin(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Analyze LinkedIn profile (limited due to login requirements)
        
        Args:
            url: LinkedIn profile URL
            
        Returns:
            Dict with LinkedIn analysis or None
        """
        try:
            # LinkedIn requires login for most data, so we just verify the URL is valid
            response = self.session.get(url, timeout=10, allow_redirects=True)
            
            return {
                'verified': response.status_code == 200,
                'url': url,
                'accessible': response.status_code == 200,
                'note': 'LinkedIn requires authentication for detailed profile data'
            }
            
        except Exception as e:
            logger.error(f"Error analyzing LinkedIn {url}: {str(e)}")
            return {
                'verified': False,
                'url': url,
                'error': str(e)
            }
    
    def analyze_portfolio(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Analyze portfolio website
        
        Args:
            url: Portfolio URL
            
        Returns:
            Dict with portfolio analysis or None
        """
        try:
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract title
                title = soup.find('title')
                title_text = title.get_text() if title else 'Unknown'
                
                # Extract meta description
                meta_desc = soup.find('meta', attrs={'name': 'description'})
                description = meta_desc.get('content') if meta_desc else None
                
                # Look for technology keywords
                text = soup.get_text().lower()
                technologies = []
                tech_keywords = [
                    'react', 'angular', 'vue', 'node', 'python', 'java', 'javascript',
                    'typescript', 'docker', 'kubernetes', 'aws', 'azure', 'mongodb',
                    'postgresql', 'mysql', 'django', 'flask', 'spring', 'tensorflow'
                ]
                
                for tech in tech_keywords:
                    if tech in text:
                        technologies.append(tech)
                
                return {
                    'url': url,
                    'accessible': True,
                    'title': title_text,
                    'description': description,
                    'technologies_mentioned': technologies[:10]  # Top 10
                }
            else:
                return {
                    'url': url,
                    'accessible': False,
                    'status_code': response.status_code
                }
                
        except Exception as e:
            logger.error(f"Error analyzing portfolio {url}: {str(e)}")
            return {
                'url': url,
                'accessible': False,
                'error': str(e)
            }
    
    def analyze_generic_profile(self, url: str, category: str) -> Optional[Dict[str, Any]]:
        """
        Analyze generic coding profile (HackerRank, Codeforces, etc.)
        
        Args:
            url: Profile URL
            category: Category of the profile
            
        Returns:
            Dict with profile analysis or None
        """
        try:
            response = self.session.get(url, timeout=10)
            
            return {
                'category': category,
                'url': url,
                'accessible': response.status_code == 200,
                'verified': response.status_code == 200
            }
            
        except Exception as e:
            logger.error(f"Error analyzing {category} profile {url}: {str(e)}")
            return {
                'category': category,
                'url': url,
                'accessible': False,
                'error': str(e)
            }


def analyze_all_links(links: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Convenience function to analyze all links
    
    Args:
        links: List of link dicts from link_extractor
        
    Returns:
        Complete analysis results
    """
    analyzer = ProfileAnalyzer()
    return analyzer.analyze_links(links)
