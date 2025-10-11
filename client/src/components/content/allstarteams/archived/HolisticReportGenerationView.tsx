import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Users,
  Lock,
  Clock,
  Wrench
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isFeatureEnabled } from '@/utils/featureFlags';

interface HolisticReportGenerationViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

type ReportType = 'standard' | 'personal';
type GenerationStatus = 'not_generated' | 'generating' | 'completed' | 'failed';

interface ReportStatus {
  reportId: string | null;
  status: GenerationStatus;
  reportUrl?: string; // Changed from pdfUrl to reportUrl
  downloadUrl?: string;
  htmlUrl?: string;
  errorMessage?: string;
  generatedAt?: string;
}

export default function HolisticReportGenerationView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: HolisticReportGenerationViewProps) {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('standard');
  const [countdown, setCountdown] = useState<number>(0);
  const [activeTimer, setActiveTimer] = useState<ReportType | null>(null);
  const queryClient = useQueryClient();

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setActiveTimer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

  // Query to check report status for both types
  const { data: standardStatus, isLoading: standardLoading } = useQuery<ReportStatus>({
    queryKey: ['holistic-report-status', 'standard'],
    queryFn: async () => {
      const response = await fetch('/api/reports/holistic/standard/status', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch standard report status');
      return response.json();
    },
    refetchInterval: (data) => data?.status === 'generating' ? 2000 : false,
    staleTime: 30000
  });

  const { data: personalStatus, isLoading: personalLoading } = useQuery<ReportStatus>({
    queryKey: ['holistic-report-status', 'personal'],
    queryFn: async () => {
      const response = await fetch('/api/reports/holistic/personal/status', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch personal report status');
      return response.json();
    },
    refetchInterval: (data) => data?.status === 'generating' ? 2000 : false,
    staleTime: 30000
  });

  // Separate mutations for each report type to prevent simultaneous loading states
  const generateStandardReportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/reports/holistic/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reportType: 'standard' })
      });
      
      // Handle HTML error pages (504 timeouts return HTML instead of JSON)
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Uh oh, something went wrong');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Uh oh, something went wrong');
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Standard report generation started:', data);
      // Start polling immediately for status updates
      queryClient.invalidateQueries({ queryKey: ['holistic-report-status', 'standard'] });
    },
    onError: (error) => {
      console.error('❌ Standard report generation failed:', error);
      // Error is already user-friendly from backend
    }
  });

  const generatePersonalReportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/reports/holistic/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reportType: 'personal' })
      });
      
      // Handle HTML error pages (504 timeouts return HTML instead of JSON)
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Uh oh, something went wrong');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Uh oh, something went wrong');
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Personal report generation started:', data);
      // Start polling immediately for status updates
      queryClient.invalidateQueries({ queryKey: ['holistic-report-status', 'personal'] });
    },
    onError: (error) => {
      console.error('❌ Personal report generation failed:', error);
      // Error is already user-friendly from backend
    }
  });

  // Auto-mark step as completed when component loads
  useEffect(() => {
    markStepCompleted('5-2');
  }, [markStepCompleted]);

  const handleGenerateReport = (reportType: ReportType) => {
    // Start countdown timer (75 seconds)
    setCountdown(75);
    setActiveTimer(reportType);

    if (reportType === 'standard') {
      generateStandardReportMutation.mutate();
    } else {
      generatePersonalReportMutation.mutate();
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fun loading messages that cycle every few seconds in random order
  const loadingMessages = [
    "Starting generation...",
    "Checking my watch...",
    "Tapping foot impatiently...",
    "Thinking about you...",
    "Reading my illegible notes...",
    "Consulting the coffee oracle...",
    "Adjusting my imaginary tie...",
    "Pretending to be busy...",
    "Counting backwards from 100...",
    "Wondering what's for lunch...",
    "Organizing my digital desk...",
    "Channeling productivity vibes...",
    "Practicing my typing skills...",
    "Warming up the algorithms...",
    "Dusting off the neural networks...",
    "Polishing the insights...",
    "Making it look effortless...",
    "Hoping to finish early...",
    "Phoning a friend...",
    "Pleading with AI to hurry up..."
  ];

  const getLoadingMessage = (countdown: number) => {
    // Special message if we go over time
    if (countdown < 0) {
      return "I'm collecting overtime now...";
    }

    // Create a pseudo-random but consistent message based on elapsed time
    // Changes every 8 seconds
    const elapsedTime = 75 - countdown;
    const changeInterval = 8;
    const seed = Math.floor(elapsedTime / changeInterval);

    // Simple pseudo-random number generator for consistent randomness
    const pseudoRandom = (seed * 9301 + 49297) % 233280;
    const messageIndex = pseudoRandom % loadingMessages.length;

    return loadingMessages[messageIndex];
  };

  // Check if holistic reports are working properly
  const reportsWorking = isFeatureEnabled('holisticReportsWorking');

  // System maintenance warning (but keep the normal interface)
  const showMaintenanceWarning = !reportsWorking;

  const handleViewReport = (reportType: ReportType) => {
    const status = reportType === 'standard' ? standardStatus : personalStatus;
    if (status?.reportUrl) {
      window.open(status.reportUrl, '_blank');
    }
  };

  const handleDownloadReport = (reportType: ReportType) => {
    const status = reportType === 'standard' ? standardStatus : personalStatus;
    if (status?.downloadUrl) {
      window.open(status.downloadUrl, '_blank');
    }
  };

  const getStatusIcon = (status: GenerationStatus) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: GenerationStatus) => {
    switch (status) {
      case 'generating':
        return 'Generating...';
      case 'completed':
        return 'Ready';
      case 'failed':
        return 'Failed';
      default:
        return 'Not Generated';
    }
  };

  const ReportCard = ({ 
    type, 
    title, 
    description, 
    icon, 
    status, 
    isLoading 
  }: {
    type: ReportType;
    title: string;
    description: string;
    icon: React.ReactNode;
    status: ReportStatus | undefined;
    isLoading: boolean;
  }) => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {icon}
          <div>
            <div className="flex items-center gap-2">
              {title}
              {getStatusIcon(status?.status || 'not_generated')}
            </div>
            <p className="text-sm font-normal text-gray-600 mt-1">
              {getStatusText(status?.status || 'not_generated')}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{description}</p>
        
        {status?.status === 'failed' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">Uh oh, something went wrong</p>
          </div>
        )}
        
        {/* Show mutation error if failed during generation */}
        {(type === 'standard' ? generateStandardReportMutation.isError : generatePersonalReportMutation.isError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">
              {(type === 'standard' ? generateStandardReportMutation.error?.message : generatePersonalReportMutation.error?.message) || 'Uh oh, something went wrong'}
            </p>
          </div>
        )}

        {status?.status === 'completed' && status.generatedAt && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              Generated on {new Date(status.generatedAt).toLocaleDateString('en-US', {
                timeZone: 'America/Los_Angeles',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} at {new Date(status.generatedAt).toLocaleTimeString('en-US', {
                timeZone: 'America/Los_Angeles',
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
              })}
            </p>
          </div>
        )}

        {/* Countdown Timer Display */}
        {activeTimer === type && countdown > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800 font-medium">{getLoadingMessage(countdown)}</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Estimated time: <span className="font-mono font-bold">{formatCountdown(countdown)}</span>
            </p>
          </div>
        )}

        {/* Maintenance Message */}
        {showMaintenanceWarning && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
            <span className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              Report generation temporarily unavailable - system upgrade in progress
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {/* Debug logging for status */}
          {console.log(`Debug ${type} report status:`, {
            status: status?.status,
            reportUrl: status?.reportUrl,
            hasReportUrl: !!status?.reportUrl,
            showMaintenanceWarning
          })}
          
          {/* Always show Generate button */}
          <Button
            onClick={() => handleGenerateReport(type)}
            disabled={isLoading || status?.status === 'generating' || 
              (type === 'standard' ? generateStandardReportMutation.isPending : generatePersonalReportMutation.isPending) || showMaintenanceWarning}
            size="sm"
            className={`flex items-center gap-2 ${showMaintenanceWarning ? 'bg-gray-400 cursor-not-allowed' : ''}`}
          >
            {showMaintenanceWarning ? (
              <Wrench className="h-4 w-4" />
            ) : status?.status === 'generating' || 
             (type === 'standard' ? generateStandardReportMutation.isPending : generatePersonalReportMutation.isPending) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {showMaintenanceWarning ? 'Temporarily Unavailable' :
             status?.status === 'generating' ||
             (type === 'standard' ? generateStandardReportMutation.isPending : generatePersonalReportMutation.isPending)
             ? 'Generating...' : 'Generate Report'}
          </Button>
          
          {/* Show View button when completed - more permissive conditions */}
          {(status?.status === 'completed' || (status?.reportUrl && !showMaintenanceWarning)) && (
            <>
              <Button
                onClick={() => handleViewReport(type)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Report
              </Button>
              {/* PDF button temporarily hidden */}
              {false && (
                <Button
                  onClick={() => handleDownloadReport(type)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Your Holistic Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-700 mb-4">
            Generate comprehensive reports that synthesize your entire AllStarTeams workshop journey.
          </p>
          
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <ReportCard
          type="standard"
          title="Professional Report"
          description="A shareable report perfect for workplace discussions, team collaboration, and professional development conversations. Focuses on strengths, flow states, and professional growth opportunities."
          icon={<Users className="h-5 w-5 text-blue-600" />}
          status={standardStatus}
          isLoading={standardLoading}
        />

        <ReportCard
          type="personal"
          title="Personal Report"
          description="A comprehensive private report including personal reflections, well-being insights, and detailed coaching guidance. Contains sensitive personal insights for your private use only."
          icon={<Lock className="h-5 w-5 text-purple-600" />}
          status={personalStatus}
          isLoading={personalLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            What's Included in Your Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Both Reports Include:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Your complete Star Card with flow attributes</li>
                <li>Personalized strengths analysis</li>
                <li>Flow state optimization insights</li>
                <li>Future vision and development plan</li>
                <li>AI-generated coaching recommendations</li>
                <li>Professional profile summary</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Personal Report Also Includes:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Private reflection insights and quotes</li>
                <li>Well-being assessment analysis</li>
                <li>Personal challenges and growth areas</li>
                <li>Detailed coaching conversation insights</li>
                <li>Sensitive personal development guidance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}