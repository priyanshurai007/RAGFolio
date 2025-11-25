import { Shield, CheckCircle, XCircle, AlertTriangle, Github, Users, Calendar, TrendingUp } from 'lucide-react';

interface AuthenticityReportProps {
  report: {
    score: number;
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
  };
}

export default function AuthenticityReport({ report }: AuthenticityReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'High Authenticity';
    if (score >= 60) return 'Moderate Authenticity';
    return 'Low Authenticity';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'not_found':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'not_provided':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary-600" />
            <h2 className="text-2xl font-bold">Resume Authenticity Score</h2>
          </div>
          <div className={`px-6 py-3 rounded-lg ${getScoreColor(report.score)}`}>
            <div className="text-3xl font-bold">{report.score}/100</div>
            <div className="text-sm font-medium">{getScoreLabel(report.score)}</div>
          </div>
        </div>

        {/* Score Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div
            className={`h-3 rounded-full transition-all ${
              report.score >= 80 ? 'bg-green-600' : 
              report.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
            }`}
            style={{ width: `${report.score}%` }}
          />
        </div>

        {/* Red Flags */}
        {report.checks.redFlags.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Red Flags Detected</h3>
                <ul className="space-y-1 text-sm text-red-800">
                  {report.checks.redFlags.map((flag, idx) => (
                    <li key={idx}>• {flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GitHub Profile Check */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Github className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold">GitHub Profile</h3>
          </div>
          {getStatusIcon(report.checks.githubProfile.status)}
        </div>

        {report.checks.githubProfile.status === 'verified' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-green-900">
              ✓ Profile Verified: 
              <a 
                href={report.checks.githubProfile.profileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline ml-2"
              >
                {report.checks.githubProfile.profileUrl}
              </a>
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm text-green-800">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{report.checks.githubProfile.followers} followers</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>{report.checks.githubProfile.publicRepos} repos</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{report.checks.githubProfile.accountAge} old</span>
              </div>
            </div>
          </div>
        )}

        {report.checks.githubProfile.status === 'not_found' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              ✗ GitHub profile URL provided but account does not exist
            </p>
          </div>
        )}

        {report.checks.githubProfile.status === 'not_provided' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠ No GitHub profile provided in resume
            </p>
          </div>
        )}
      </div>

      {/* Project Verification */}
      {report.checks.projectVerification.claimedProjects.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Project Verification</h3>
          
          <div className="space-y-3">
            {report.checks.projectVerification.verifiedProjects.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-900 mb-2">
                  ✓ Verified Projects ({report.checks.projectVerification.verifiedProjects.length})
                </p>
                <ul className="text-sm text-green-800 space-y-1">
                  {report.checks.projectVerification.verifiedProjects.map((proj, idx) => (
                    <li key={idx}>• {proj}</li>
                  ))}
                </ul>
              </div>
            )}

            {report.checks.projectVerification.unverifiedProjects.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  ⚠ Unverified Projects ({report.checks.projectVerification.unverifiedProjects.length})
                </p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {report.checks.projectVerification.unverifiedProjects.map((proj, idx) => (
                    <li key={idx}>• {proj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Employment Gaps */}
      {report.checks.consistencyChecks.employmentGaps.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Employment Timeline</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-900 mb-2">
              ⚠ Employment Gaps Detected
            </p>
            <ul className="text-sm text-yellow-800 space-y-1">
              {report.checks.consistencyChecks.employmentGaps.map((gap, idx) => (
                <li key={idx}>
                  • Gap from {gap.start} to {gap.end} ({gap.duration})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Experience Verification */}
      {report.checks.consistencyChecks.experienceCalculation.claimed && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Experience Verification</h3>
          <div className={`border rounded-lg p-4 ${
            report.checks.consistencyChecks.experienceCalculation.consistent
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Claimed Experience:</p>
                <p className={report.checks.consistencyChecks.experienceCalculation.consistent ? 'text-green-800' : 'text-red-800'}>
                  {report.checks.consistencyChecks.experienceCalculation.claimed}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Calculated from Dates:</p>
                <p className={report.checks.consistencyChecks.experienceCalculation.consistent ? 'text-green-800' : 'text-red-800'}>
                  {report.checks.consistencyChecks.experienceCalculation.calculated}
                </p>
              </div>
            </div>
            <p className={`mt-3 text-sm font-medium ${
              report.checks.consistencyChecks.experienceCalculation.consistent
                ? 'text-green-900'
                : 'text-red-900'
            }`}>
              {report.checks.consistencyChecks.experienceCalculation.consistent
                ? '✓ Experience claim is consistent'
                : '✗ Experience claim does not match calculated dates'}
            </p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Interview Recommendations</h3>
          <ul className="space-y-2">
            {report.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-primary-600 font-bold mt-1">→</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
