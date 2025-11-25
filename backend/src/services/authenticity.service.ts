import axios from 'axios';
import { ParsedResume } from './parser.service';

export interface AuthenticityReport {
  score: number; // 0-100
  checks: {
    githubProfile: {
      status: 'verified' | 'not_found' | 'not_provided' | 'error';
      profileUrl?: string;
      publicRepos?: number;
      followers?: number;
      accountAge?: string;
    };
    projectVerification: {
      claimedProjects: string[];
      verifiedProjects: string[];
      unverifiedProjects: string[];
    };
    consistencyChecks: {
      employmentGaps: Array<{ start: string; end: string; duration: string }>;
      experienceCalculation: {
        claimed?: string;
        calculated?: string;
        consistent: boolean;
      };
    };
    redFlags: string[];
  };
  recommendations: string[];
}

export async function analyzeAuthenticityScore(
  resumeData: ParsedResume,
  resumeId: string
): Promise<AuthenticityReport> {
  console.log('=== Starting Authenticity Analysis ===');
  
  const report: AuthenticityReport = {
    score: 100, // Start with perfect score, deduct for issues
    checks: {
      githubProfile: {
        status: 'not_provided',
      },
      projectVerification: {
        claimedProjects: [],
        verifiedProjects: [],
        unverifiedProjects: [],
      },
      consistencyChecks: {
        employmentGaps: [],
        experienceCalculation: {
          consistent: true,
        },
      },
      redFlags: [],
    },
    recommendations: [],
  };

  // 1. Check GitHub Profile (using profile_analysis if available)
  await checkGitHubProfileFromParsedData(resumeData, report);

  // 2. Verify Projects on GitHub
  await verifyProjects(resumeData, report);

  // 3. Detect Employment Gaps
  detectEmploymentGaps(resumeData, report);

  // 4. Verify Experience Claims
  verifyExperienceClaims(resumeData, report);

  // 5. Generate Recommendations
  generateRecommendations(report);

  console.log('Final Authenticity Score:', report.score);
  console.log('=== Authenticity Analysis Complete ===');

  return report;
}

async function checkGitHubProfileFromParsedData(
  resumeData: ParsedResume,
  report: AuthenticityReport
): Promise<void> {
  // Check if profile analysis data is available from parser
  if (resumeData.profile_analysis?.github) {
    const githubData = resumeData.profile_analysis.github;
    
    if (githubData.verified) {
      report.checks.githubProfile.status = 'verified';
      report.checks.githubProfile.profileUrl = githubData.url;
      report.checks.githubProfile.publicRepos = githubData.public_repos;
      report.checks.githubProfile.followers = githubData.followers;
      
      if (githubData.created_at) {
        const createdDate = new Date(githubData.created_at);
        const ageInYears = Math.floor(
          (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
        );
        report.checks.githubProfile.accountAge = `${ageInYears} years`;
      }
      
      // Bonus points for active, verified GitHub
      if (githubData.public_repos && githubData.public_repos > 5) {
        report.score += 10;
        console.log('✓ GitHub verified with significant activity (+10 points)');
      } else if (githubData.public_repos && githubData.public_repos > 0) {
        report.score += 5;
        console.log('✓ GitHub verified (+5 points)');
      }
      
      // Check for recent activity
      if (githubData.activity_level === 'high') {
        report.score += 5;
        console.log('✓ High GitHub activity (+5 points)');
      }
      
    } else {
      report.checks.githubProfile.status = 'not_found';
      report.checks.githubProfile.profileUrl = githubData.url;
      report.score -= 15;
      report.checks.redFlags.push('GitHub profile not found or private');
      console.log('✗ GitHub profile not verified (-15 points)');
    }
    
    return;
  }
  
  // Fallback to old text-based extraction if no profile analysis
  await checkGitHubProfile(resumeData, report);
}

async function checkGitHubProfile(
  resumeData: ParsedResume,
  report: AuthenticityReport
): Promise<void> {
  try {
    console.log('Checking GitHub profile...');
    
    // REALISTIC APPROACH: Since PDFs don't expose hyperlinks, we'll look for:
    // 1. Any github.com/username patterns
    // 2. Common username patterns near "GitHub" keyword
    // 3. Most importantly: Make this check OPTIONAL and informative, not penalizing
    
    let username: string | null = null;
    const text = resumeData.raw_text;
    
    // Pattern 1: Full URL (rare but possible)
    const urlMatch = text.match(/github\.com\/([a-zA-Z0-9-]+)/i);
    if (urlMatch) {
      username = urlMatch[1];
      console.log('✓ Found GitHub URL:', username);
    }
    
    // Pattern 2: GitHub Profile text followed by username
    if (!username) {
      const profileMatch = text.match(/github\s*(?:profile)?[:\s]+([a-zA-Z0-9-]{3,39})/i);
      if (profileMatch) {
        username = profileMatch[1];
        console.log('✓ Found GitHub from profile text:', username);
      }
    }
    
    // Pattern 3: Look for potential usernames in sections mentioning GitHub
    if (!username) {
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes('github')) {
          // Check this line and next few lines for potential username
          const context = lines.slice(i, i + 3).join(' ');
          const usernameMatch = context.match(/\b([a-zA-Z0-9-]{3,39})\b/);
          if (usernameMatch && usernameMatch[1].length >= 3) {
            username = usernameMatch[1];
            console.log('✓ Found potential GitHub username from context:', username);
            break;
          }
        }
      }
    }

    if (!username) {
      // Mark as not detectable - this is common and acceptable
      report.checks.githubProfile.status = 'not_provided';
      // Don't penalize - PDF links are often hidden
      console.log('ℹ️ GitHub profile not auto-detected from PDF (this is normal for LaTeX/PDF resumes)');
      report.recommendations.push(
        '💡 GitHub link not detected: Ask candidate to provide their GitHub username for manual verification'
      );
      return;
    }

    console.log('Attempting to verify GitHub username:', username);
    const profileUrl = `https://github.com/${username}`;
    report.checks.githubProfile.profileUrl = profileUrl;

    // Verify GitHub profile exists
    try {
      const response = await axios.get(`https://api.github.com/users/${username}`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'RAGfolio-Authenticity-Checker',
        },
      });

      if (response.status === 200) {
        const data = response.data;
        report.checks.githubProfile.status = 'verified';
        report.checks.githubProfile.publicRepos = data.public_repos;
        report.checks.githubProfile.followers = data.followers;
        
        // Calculate account age
        const createdAt = new Date(data.created_at);
        const ageYears = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365);
        report.checks.githubProfile.accountAge = `${ageYears.toFixed(1)} years`;

        console.log(`✓ GitHub profile verified: ${username}`);
        console.log(`  Repos: ${data.public_repos}, Followers: ${data.followers}`);

        // Analyze GitHub activity
        if (data.public_repos === 0) {
          report.score -= 15;
          report.checks.redFlags.push('GitHub profile exists but has no public repositories');
        } else if (data.public_repos < 3) {
          report.score -= 5;
          report.checks.redFlags.push('Very few public repositories on GitHub');
        }

        if (ageYears < 0.5) {
          report.score -= 10;
          report.checks.redFlags.push('GitHub account is very new (less than 6 months old)');
        }
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Profile doesn't exist - likely a false detection
        report.checks.githubProfile.status = 'not_provided';
        console.log('⚠️ Detected username not valid - likely false positive. Ignoring.');
        report.recommendations.push(
          '💡 GitHub link not reliably detected: Ask candidate to provide their GitHub username for verification'
        );
      } else {
        report.checks.githubProfile.status = 'error';
        console.log('Error checking GitHub:', error.message);
      }
    }
  } catch (error) {
    console.error('Error in GitHub check:', error);
  }
}

async function verifyProjects(
  resumeData: ParsedResume,
  report: AuthenticityReport
): Promise<void> {
  try {
    console.log('Verifying projects...');

    // Extract project names from resume
    const projectsSection = resumeData.sections.Projects || resumeData.sections.projects || '';
    if (!projectsSection) {
      console.log('No projects section found');
      return;
    }

    // Extract potential project names (simple heuristic)
    const projectLines = projectsSection.split('\n').filter(line => line.trim().length > 0);
    const projectNames: string[] = [];

    for (const line of projectLines) {
      // Look for project titles (usually bold or at start of line)
      const titleMatch = line.match(/^[\s•-]*([A-Z][a-zA-Z0-9\s-]+?)(?:\s*[-:|]|\s*$)/);
      if (titleMatch) {
        projectNames.push(titleMatch[1].trim());
      }
    }

    report.checks.projectVerification.claimedProjects = projectNames;
    console.log('Found claimed projects:', projectNames);

    // If GitHub profile exists, check for matching repos
    if (report.checks.githubProfile.status === 'verified' && report.checks.githubProfile.profileUrl) {
      let repoNames: string[] = [];
      
      // Try to use profile_analysis data first if available
      if (resumeData.profile_analysis?.github?.recent_repos) {
        repoNames = resumeData.profile_analysis.github.recent_repos.map(r => r.name.toLowerCase());
        console.log('Using cached GitHub repo data from profile analysis');
      } else {
        // Fallback to fetching from GitHub API
        const username = report.checks.githubProfile.profileUrl.split('/').pop();
        
        try {
          const reposResponse = await axios.get(
            `https://api.github.com/users/${username}/repos?per_page=100`,
            {
              timeout: 5000,
              headers: {
                'User-Agent': 'RAGfolio-Authenticity-Checker',
              },
            }
          );

          interface GitHubRepo {
            name: string;
          }
          const repos = reposResponse.data as GitHubRepo[];
          repoNames = repos.map(r => r.name.toLowerCase());
        } catch (error) {
          console.error('Error fetching repos:', error);
          return;
        }
      }
      
      // Check if claimed projects exist in GitHub repos
        for (const project of projectNames) {
          const normalized = project.toLowerCase().replace(/\s+/g, '-');
          const found = repoNames.some((repo: string) => 
            repo.includes(normalized) || normalized.includes(repo)
          );

          if (found) {
            report.checks.projectVerification.verifiedProjects.push(project);
            console.log(`✓ Project verified: ${project}`);
          } else {
            report.checks.projectVerification.unverifiedProjects.push(project);
          }
        }

        // Calculate score based on verification
        if (projectNames.length > 0) {
          const verificationRate = 
            report.checks.projectVerification.verifiedProjects.length / projectNames.length;
          
          if (verificationRate < 0.3) {
            report.score -= 20;
            report.checks.redFlags.push(
              'Most claimed projects cannot be verified on GitHub'
            );
          } else if (verificationRate < 0.6) {
            report.score -= 10;
            report.checks.redFlags.push(
              'Some claimed projects cannot be verified on GitHub'
            );
          }
        }
    }
  } catch (error) {
    console.error('Error in project verification:', error);
  }
}

function detectEmploymentGaps(
  resumeData: ParsedResume,
  report: AuthenticityReport
): void {
  try {
    console.log('Detecting employment gaps...');

    const experienceSection = resumeData.sections.Experience || 
                             resumeData.sections.experience || 
                             resumeData.sections['Work Experience'] || '';

    if (!experienceSection) {
      console.log('No experience section found');
      return;
    }

    // Extract dates (simple regex for common formats)
    const dateRegex = /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/gi;
    const matches = Array.from(experienceSection.matchAll(dateRegex));

    const periods: Array<{ start: number; end: number | null }> = [];

    for (const match of matches) {
      const start = parseInt(match[1]);
      const endStr = match[2].toLowerCase();
      const end = endStr === 'present' || endStr === 'current' ? null : parseInt(endStr);
      
      periods.push({ start, end });
    }

    // Sort by start date
    periods.sort((a, b) => a.start - b.start);

    // Detect gaps
    for (let i = 0; i < periods.length - 1; i++) {
      const currentEnd = periods[i].end;
      const nextStart = periods[i + 1].start;

      if (currentEnd && nextStart - currentEnd > 1) {
        const gapYears = nextStart - currentEnd;
        report.checks.consistencyChecks.employmentGaps.push({
          start: currentEnd.toString(),
          end: nextStart.toString(),
          duration: `${gapYears} year(s)`,
        });

        if (gapYears > 1) {
          report.score -= 5;
          report.checks.redFlags.push(
            `Employment gap detected: ${currentEnd} - ${nextStart} (${gapYears} years)`
          );
        }
      }
    }

    console.log('Found employment gaps:', report.checks.consistencyChecks.employmentGaps.length);
  } catch (error) {
    console.error('Error detecting gaps:', error);
  }
}

function verifyExperienceClaims(
  resumeData: ParsedResume,
  report: AuthenticityReport
): void {
  try {
    console.log('Verifying experience claims...');

    // Look for experience claims in summary or objective
    const summarySection = resumeData.sections.Summary || 
                          resumeData.sections.summary || 
                          resumeData.sections.Objective || '';

    const experienceRegex = /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i;
    const match = summarySection.match(experienceRegex);

    if (match) {
      const claimedYears = parseInt(match[1]);
      report.checks.consistencyChecks.experienceCalculation.claimed = `${claimedYears} years`;

      // Try to calculate actual experience from dates
      const experienceSection = resumeData.sections.Experience || 
                               resumeData.sections.experience || '';
      
      const dateRegex = /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/gi;
      const matches = Array.from(experienceSection.matchAll(dateRegex));

      let totalYears = 0;
      const currentYear = new Date().getFullYear();

      for (const m of matches) {
        const start = parseInt(m[1]);
        const endStr = m[2].toLowerCase();
        const end = endStr === 'present' || endStr === 'current' ? currentYear : parseInt(endStr);
        
        totalYears += end - start;
      }

      report.checks.consistencyChecks.experienceCalculation.calculated = 
        `${totalYears} years`;

      // Check consistency
      const difference = Math.abs(totalYears - claimedYears);
      
      if (difference > 2) {
        report.checks.consistencyChecks.experienceCalculation.consistent = false;
        report.score -= 15;
        report.checks.redFlags.push(
          `Experience mismatch: Claims ${claimedYears} years but dates show ${totalYears} years`
        );
        console.log('✗ Experience claim inconsistent');
      } else {
        console.log('✓ Experience claim verified');
      }
    }
  } catch (error) {
    console.error('Error verifying experience:', error);
  }
}

function generateRecommendations(report: AuthenticityReport): void {
  // Generate interview questions based on red flags
  if (report.checks.githubProfile.status === 'not_provided') {
    report.recommendations.push(
      'Ask: "Can you share your GitHub profile or code samples?"'
    );
  }

  if (report.checks.githubProfile.status === 'not_found') {
    report.recommendations.push(
      'Red Flag: Verify the GitHub URL provided in resume - it does not exist'
    );
  }

  if (report.checks.projectVerification.unverifiedProjects.length > 0) {
    report.recommendations.push(
      `Ask about these projects that couldn't be verified: ${report.checks.projectVerification.unverifiedProjects.join(', ')}`
    );
  }

  if (report.checks.consistencyChecks.employmentGaps.length > 0) {
    report.recommendations.push(
      `Ask about employment gaps: ${report.checks.consistencyChecks.employmentGaps.map(g => `${g.start}-${g.end}`).join(', ')}`
    );
  }

  if (!report.checks.consistencyChecks.experienceCalculation.consistent) {
    report.recommendations.push(
      'Verify experience claims - there is a mismatch between claimed years and date calculations'
    );
  }

  // General recommendations based on score
  if (report.score >= 80) {
    report.recommendations.push('High authenticity score - candidate appears credible');
  } else if (report.score >= 60) {
    report.recommendations.push('Moderate authenticity - recommend additional verification');
  } else {
    report.recommendations.push('Low authenticity score - thorough verification recommended before proceeding');
  }

  // Ensure score doesn't go below 0
  report.score = Math.max(0, report.score);
}
