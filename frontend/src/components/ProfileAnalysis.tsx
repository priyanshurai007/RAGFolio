import React from 'react';
import { 
  FaGithub, 
  FaLinkedin, 
  FaCode, 
  FaGlobe, 
  FaCheckCircle, 
  FaTimesCircle,
  FaStar,
  FaCodeBranch 
} from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';

interface ProfileAnalysisProps {
  analysis: {
    github?: {
      verified: boolean;
      username?: string;
      url: string;
      name?: string;
      bio?: string;
      public_repos?: number;
      followers?: number;
      following?: number;
      created_at?: string;
      recent_repos?: Array<{
        name: string;
        description?: string;
        language?: string;
        stars: number;
        forks: number;
        updated: string;
      }>;
      languages?: string[];
      total_stars?: number;
      recent_commits?: number;
      activity_level?: string;
      error?: string;
    };
    leetcode?: {
      verified: boolean;
      username?: string;
      url: string;
      accessible?: boolean;
      problems_solved?: number;
      easy_solved?: number;
      medium_solved?: number;
      hard_solved?: number;
      error?: string;
    };
    linkedin?: {
      verified: boolean;
      url: string;
      accessible: boolean;
      note?: string;
      error?: string;
    };
    portfolio?: Array<{
      url: string;
      accessible: boolean;
      title?: string;
      description?: string;
      technologies_mentioned?: string[];
      status_code?: number;
      error?: string;
    }>;
    other_profiles?: Array<{
      category: string;
      url: string;
      accessible: boolean;
      verified: boolean;
      error?: string;
    }>;
    email?: string[];
    phone?: string[];
    summary?: {
      total_links: number;
      verified_profiles: number;
      coding_activity_found: boolean;
    };
  };
}

const ProfileAnalysis: React.FC<ProfileAnalysisProps> = ({ analysis }) => {
  const getActivityLevelColor = (level?: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityLevelBadge = (level?: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {analysis.summary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaCheckCircle className="mr-2 text-blue-600" />
            Profile Analysis Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.summary.total_links}
              </div>
              <div className="text-sm text-gray-600">Total Links Found</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {analysis.summary.verified_profiles}
              </div>
              <div className="text-sm text-gray-600">Verified Profiles</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className={`text-2xl font-bold ${analysis.summary.coding_activity_found ? 'text-green-600' : 'text-gray-400'}`}>
                {analysis.summary.coding_activity_found ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">Coding Activity</div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Profile */}
      {analysis.github && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <FaGithub className="text-3xl mr-3 text-gray-800" />
              <div>
                <h3 className="text-lg font-semibold">GitHub Profile</h3>
                {analysis.github.username && (
                  <a 
                    href={analysis.github.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    @{analysis.github.username}
                  </a>
                )}
              </div>
            </div>
            {analysis.github.verified ? (
              <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                <FaCheckCircle className="mr-1" /> Verified
              </span>
            ) : (
              <span className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm">
                <FaTimesCircle className="mr-1" /> Not Found
              </span>
            )}
          </div>

          {analysis.github.verified && (
            <>
              {analysis.github.bio && (
                <p className="text-gray-600 mb-4 italic">{analysis.github.bio}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xl font-bold text-gray-800">
                    {analysis.github.public_repos}
                  </div>
                  <div className="text-xs text-gray-600">Repositories</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xl font-bold text-gray-800">
                    {analysis.github.followers}
                  </div>
                  <div className="text-xs text-gray-600">Followers</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xl font-bold text-gray-800">
                    <FaStar className="inline mr-1 text-yellow-500" />
                    {analysis.github.total_stars}
                  </div>
                  <div className="text-xs text-gray-600">Total Stars</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className={`text-xl font-bold ${getActivityLevelColor(analysis.github.activity_level)}`}>
                    {analysis.github.recent_commits || 0}
                  </div>
                  <div className="text-xs text-gray-600">Recent Commits</div>
                </div>
              </div>

              {analysis.github.activity_level && (
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getActivityLevelBadge(analysis.github.activity_level)}`}>
                    {analysis.github.activity_level.charAt(0).toUpperCase() + analysis.github.activity_level.slice(1)} Activity
                  </span>
                </div>
              )}

              {analysis.github.languages && analysis.github.languages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2 text-gray-700">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.github.languages.map((lang, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.github.recent_repos && analysis.github.recent_repos.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-700">Recent Repositories</h4>
                  <div className="space-y-2">
                    {analysis.github.recent_repos.slice(0, 3).map((repo, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{repo.name}</div>
                            {repo.description && (
                              <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              {repo.language && (
                                <span className="flex items-center">
                                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                                  {repo.language}
                                </span>
                              )}
                              <span className="flex items-center">
                                <FaStar className="mr-1" /> {repo.stars}
                              </span>
                              <span className="flex items-center">
                                <FaCodeBranch className="mr-1" /> {repo.forks}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {analysis.github.error && (
            <div className="text-sm text-red-600 mt-2">
              Error: {analysis.github.error}
            </div>
          )}
        </div>
      )}

      {/* LeetCode Profile */}
      {analysis.leetcode && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <SiLeetcode className="text-3xl mr-3 text-orange-500" />
              <div>
                <h3 className="text-lg font-semibold">LeetCode Profile</h3>
                {analysis.leetcode.username && (
                  <a 
                    href={analysis.leetcode.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    @{analysis.leetcode.username}
                  </a>
                )}
              </div>
            </div>
            {analysis.leetcode.verified ? (
              <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                <FaCheckCircle className="mr-1" /> Accessible
              </span>
            ) : (
              <span className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-sm">
                <FaTimesCircle className="mr-1" /> Not Found
              </span>
            )}
          </div>

          {analysis.leetcode.problems_solved !== undefined && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-xl font-bold text-gray-800">
                  {analysis.leetcode.problems_solved}
                </div>
                <div className="text-xs text-gray-600">Total Solved</div>
              </div>
              {analysis.leetcode.easy_solved !== undefined && (
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-xl font-bold text-green-700">
                    {analysis.leetcode.easy_solved}
                  </div>
                  <div className="text-xs text-gray-600">Easy</div>
                </div>
              )}
              {analysis.leetcode.medium_solved !== undefined && (
                <div className="text-center p-3 bg-yellow-50 rounded">
                  <div className="text-xl font-bold text-yellow-700">
                    {analysis.leetcode.medium_solved}
                  </div>
                  <div className="text-xs text-gray-600">Medium</div>
                </div>
              )}
              {analysis.leetcode.hard_solved !== undefined && (
                <div className="text-center p-3 bg-red-50 rounded">
                  <div className="text-xl font-bold text-red-700">
                    {analysis.leetcode.hard_solved}
                  </div>
                  <div className="text-xs text-gray-600">Hard</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LinkedIn Profile */}
      {analysis.linkedin && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <FaLinkedin className="text-3xl mr-3 text-blue-700" />
              <div>
                <h3 className="text-lg font-semibold">LinkedIn Profile</h3>
                <a 
                  href={analysis.linkedin.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Profile
                </a>
              </div>
            </div>
            {analysis.linkedin.accessible ? (
              <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                <FaCheckCircle className="mr-1" /> Accessible
              </span>
            ) : (
              <span className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-sm">
                <FaTimesCircle className="mr-1" /> Not Accessible
              </span>
            )}
          </div>
          {analysis.linkedin.note && (
            <p className="text-sm text-gray-600 italic">{analysis.linkedin.note}</p>
          )}
        </div>
      )}

      {/* Portfolio Sites */}
      {analysis.portfolio && analysis.portfolio.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <FaGlobe className="text-2xl mr-3 text-indigo-600" />
            <h3 className="text-lg font-semibold">Portfolio Websites</h3>
          </div>
          <div className="space-y-3">
            {analysis.portfolio.map((site, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <a 
                    href={site.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium flex-1"
                  >
                    {site.title || site.url}
                  </a>
                  {site.accessible ? (
                    <FaCheckCircle className="text-green-600 ml-2" />
                  ) : (
                    <FaTimesCircle className="text-red-600 ml-2" />
                  )}
                </div>
                {site.description && (
                  <p className="text-sm text-gray-600 mb-2">{site.description}</p>
                )}
                {site.technologies_mentioned && site.technologies_mentioned.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {site.technologies_mentioned.slice(0, 8).map((tech, techIdx) => (
                      <span 
                        key={techIdx}
                        className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Coding Profiles */}
      {analysis.other_profiles && analysis.other_profiles.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <FaCode className="text-2xl mr-3 text-purple-600" />
            <h3 className="text-lg font-semibold">Other Coding Profiles</h3>
          </div>
          <div className="space-y-2">
            {analysis.other_profiles.map((profile, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium capitalize">{profile.category}</span>
                  <a 
                    href={profile.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm ml-2"
                  >
                    View Profile
                  </a>
                </div>
                {profile.verified ? (
                  <FaCheckCircle className="text-green-600" />
                ) : (
                  <FaTimesCircle className="text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAnalysis;
