import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Eye, AlertCircle, CheckCircle, Clock, RefreshCw, Monitor, Wrench, MessageSquareText, Users, Lightbulb, TrendingUp, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PDFViewer } from '@/components/ui/pdf-viewer';
import { isFeatureEnabled } from '@/utils/featureFlags';
import { BetaFeedbackSurveyModal } from '../beta-testing/BetaFeedbackSurveyModal';
import { useCurrentUser } from '../../hooks/use-current-user';

interface HolisticReportViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

interface ReportStatus {
  reportId: string | null;
  status: 'not_generated' | 'pending' | 'generating' | 'completed' | 'failed';
  pdfUrl?: string;
  downloadUrl?: string;
  htmlUrl?: string;
  errorMessage?: string;
  generatedAt?: string;
}

interface GenerateReportResponse {
  success: boolean;
  reportId?: string;
  message: string;
  status: string;
}

export default function HolisticReportView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: HolisticReportViewProps) {
  // State declarations first
  const [selectedReportType, setSelectedReportType] = useState<'standard' | 'personal' | null>(null);
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean;
    pdfUrl: string;
    title: string;
    downloadUrl?: string;
  }>({
    isOpen: false,
    pdfUrl: '',
    title: '',
    downloadUrl: undefined
  });
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [hasViewedReport, setHasViewedReport] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [activeTimer, setActiveTimer] = useState<'standard' | 'personal' | null>(null);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

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
    if (countdown <= 0) {
      return "I'm collecting overtime now...";
    }

    // Create a pseudo-random but consistent message based on elapsed time
    // Changes every 6 seconds
    const elapsedTime = 75 - countdown;
    const changeInterval = 6;
    const seed = Math.floor(elapsedTime / changeInterval);

    // Filter out "Starting generation..." from rotation
    const rotatingMessages = loadingMessages.filter(msg => msg !== "Starting generation...");

    // Simple pseudo-random number generator for consistent randomness
    const pseudoRandom = (seed * 9301 + 49297) % 233280;
    const messageIndex = pseudoRandom % rotatingMessages.length;

    return rotatingMessages[messageIndex];
  };
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  // Fetch status for both report types
  const { data: standardStatus, isLoading: standardLoading } = useQuery<ReportStatus>({
    queryKey: ['/api/reports/holistic/standard/status'],
    refetchInterval: (data) => {
      // Poll every 2 seconds if generating
      return data?.status === 'generating' ? 2000 : false;
    },
  });

  const { data: personalStatus, isLoading: personalLoading } = useQuery<ReportStatus>({
    queryKey: ['/api/reports/holistic/personal/status'],
    refetchInterval: (data) => {
      // Poll every 2 seconds if generating
      return data?.status === 'generating' ? 2000 : false;
    },
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (reportType: 'standard' | 'personal') => {
      const response = await fetch('/api/reports/holistic/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reportType }),
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

      return data as GenerateReportResponse;
    },
    onSuccess: (data, variables) => {
      console.log(`✅ ${variables} report generation started:`, data);
      // Invalidate queries to refetch status
      queryClient.invalidateQueries({ queryKey: [`/api/reports/holistic/${variables}/status`] });
    },
    onError: (error) => {
      console.error('❌ Report generation failed:', error);
    },
  });

  const handleGenerateReport = (reportType: 'standard' | 'personal') => {
    console.log(`🚀 Generating ${reportType} report`);
    // Start countdown timer (75 seconds)
    setCountdown(75);
    setActiveTimer(reportType);
    generateReportMutation.mutate(reportType);
  };

  const handleViewReport = (reportType: 'standard' | 'personal') => {
    const status = reportType === 'standard' ? standardStatus : personalStatus;
    if (status?.pdfUrl) {
      const title = reportType === 'standard' ? 'Professional Report' : 'Personal Report';
      setPdfViewer({
        isOpen: true,
        pdfUrl: status.pdfUrl,
        title,
        downloadUrl: status.downloadUrl
      });
      
      // Track that user has viewed a report
      setHasViewedReport(true);
      
      // Dispatch event for beta tester feedback modal trigger
      window.dispatchEvent(new CustomEvent('holistic-report-viewed', {
        detail: { reportType, viewType: 'pdf' }
      }));
    }
  };


  const handleViewHtmlReport = (reportType: 'standard' | 'personal') => {
    const status = reportType === 'standard' ? standardStatus : personalStatus;
    if (status?.htmlUrl) {
      window.open(status.htmlUrl, '_blank');
      
      // Track that user has viewed a report
      setHasViewedReport(true);
      
      // Dispatch event for beta tester feedback modal trigger
      window.dispatchEvent(new CustomEvent('holistic-report-viewed', {
        detail: { reportType, viewType: 'html' }
      }));
    }
  };

  // Track report completion for user experience
  useEffect(() => {
    // Check each report individually to reset timer for specific report type
    if (standardStatus?.status === 'completed' || standardStatus?.htmlUrl) {
      if (activeTimer === 'standard') {
        setCountdown(0);
        setActiveTimer(null);
      }
    }

    if (personalStatus?.status === 'completed' || personalStatus?.htmlUrl) {
      if (activeTimer === 'personal') {
        setCountdown(0);
        setActiveTimer(null);
      }
    }

    // For beta testers, automatically mark as having viewed reports when they're completed and displayed
    const hasCompletedReport = standardStatus?.status === 'completed' || personalStatus?.status === 'completed';
    if ((user?.isBetaTester || user?.role === 'admin') && !hasViewedReport && hasCompletedReport) {
      setHasViewedReport(true);

      // Dispatch event for beta tester feedback system
      window.dispatchEvent(new CustomEvent('holistic-report-viewed', {
        detail: { reportType: 'auto', viewType: 'display' }
      }));
    }
  }, [standardStatus, personalStatus, activeTimer, markStepCompleted, user, hasViewedReport]);

  // Additional check: user can give feedback ONLY after BOTH reports are completed
  const canGiveFeedback = hasViewedReport || 
    (standardStatus?.status === 'completed' && personalStatus?.status === 'completed');

  // Check if holistic reports are working properly
  const reportsWorking = isFeatureEnabled('holisticReportsWorking');

  // System maintenance warning (but keep the normal interface)
  const showMaintenanceWarning = !reportsWorking;

  // Debug logging for beta tester detection
  console.log('🔍 HolisticReportView - User data:', {
    userId: user?.id,
    username: user?.username,
    isBetaTester: user?.isBetaTester,
    role: user?.role,
    hasViewedReport,
    canGiveFeedback,
    standardStatus: standardStatus?.status,
    personalStatus: personalStatus?.status,
    shouldShowButton: user?.isBetaTester || user?.role === 'admin'
  });

  const renderReportCard = (
    reportType: 'standard' | 'personal',
    title: string,
    description: string,
    status: ReportStatus | undefined,
    isLoading: boolean
  ) => {
    const isGenerating = generateReportMutation.isPending && generateReportMutation.variables === reportType;
    const canGenerate = (!status || status.status === 'not_generated' || status.status === 'failed') && reportsWorking;
    const isCompleted = status?.status === 'completed';
    const isFailed = status?.status === 'failed';
    const isDisabledDueToMaintenance = !reportsWorking;

    return (
      <Card className={`transition-all duration-200 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
            {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
            {isGenerating && <Clock className="h-5 w-5 text-blue-600 animate-spin" />}
            {isFailed && <AlertCircle className="h-5 w-5 text-red-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{description}</p>

          {/* Status Display */}
          {isLoading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">Loading status...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Countdown Timer Display - Show humorous messages during generation */}
              {(activeTimer === reportType || (status?.status === 'generating' && isGenerating)) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 transition-opacity duration-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                    <span className="text-blue-800 font-medium">
                      {activeTimer === reportType ? getLoadingMessage(countdown) : 'Generating report...'}
                    </span>
                  </div>
                  {activeTimer === reportType && (
                    <p className="text-blue-700 text-sm mt-1">
                      {countdown > 0 ? (
                        <>Estimated time: <span className="font-mono font-bold">{formatCountdown(countdown)}</span></>
                      ) : (
                        <>Overtime: <span className="font-mono font-bold">{formatCountdown(Math.abs(countdown))}</span></>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Generation Status - Fallback if timer not active */}
              {status?.status === 'generating' && !activeTimer && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                    <span className="text-blue-800 font-medium">Generating report...</span>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    This may take a few moments. Please wait.
                  </p>
                </div>
              )}

              {/* Error Status */}
              {isFailed && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-800 font-medium">Generation failed</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    {status?.errorMessage || 'An error occurred while generating the report.'}
                  </p>
                </div>
              )}

              {/* Client-side Mutation Error */}
              {generateReportMutation.isError &&
                generateReportMutation.variables === reportType && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-800 font-medium">Error</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    {(generateReportMutation.error as any)?.message}
                  </p>
                </div>
              )}

              {/* Success Status */}
              {isCompleted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-800 font-medium">Report ready!</span>
                  </div>
                  {status?.generatedAt && (
                    <p className="text-green-700 text-sm mt-1">
                      Generated on {new Date(status.generatedAt).toLocaleDateString('en-US', {
                        timeZone: 'America/Los_Angeles',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {new Date(status.generatedAt).toLocaleTimeString('en-US', { 
                        timeZone: 'America/Los_Angeles',
                        hour: '2-digit', 
                        minute: '2-digit', 
                        hour12: true,
                        timeZoneName: 'short'
                      })}
                    </p>
                  )}
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

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {(canGenerate || isDisabledDueToMaintenance) && (
                  <Button
                    onClick={() => handleGenerateReport(reportType)}
                    disabled={isGenerating || generateReportMutation.isPending || isDisabledDueToMaintenance}
                    className={`${isDisabledDueToMaintenance ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isDisabledDueToMaintenance ? (
                      <>
                        <Wrench className="h-4 w-4 mr-2" />
                        Temporarily Unavailable
                      </>
                    ) : isGenerating ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : isFailed ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Generation
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                )}

                {/* Show View button when completed OR when reportUrl exists */}
                {(isCompleted || (status?.htmlUrl && !isDisabledDueToMaintenance)) && (
                  <>
                    <Button
                      onClick={() => handleViewHtmlReport(reportType)}
                      variant="outline"
                      className="border-purple-200 hover:bg-purple-50 text-purple-700"
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const closePdfViewer = () => {
    setPdfViewer({
      isOpen: false,
      pdfUrl: '',
      title: '',
      downloadUrl: undefined
    });
  };

  // Auto health check every 30 seconds when reports are disabled
  const { data: healthStatus } = useQuery({
    queryKey: ['report-health-check'],
    queryFn: async () => {
      const response = await fetch('/api/admin/reports/health-check', {
        credentials: 'include'
      });
      if (!response.ok) return { isWorking: false, hasRealData: false };
      return response.json();
    },
    enabled: !reportsWorking, // Only run when reports are disabled
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 25000
  });

  // Auto-enable reports if health check passes
  React.useEffect(() => {
    if (!reportsWorking && healthStatus?.isWorking && healthStatus?.hasRealData) {
      console.log('🎉 Health check passed - reports should be working again!');
      // In a real app, this would trigger a feature flag update
      // For now, just refresh the page to pick up the change
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [reportsWorking, healthStatus]);

  // Force debug log every render
  console.log('🔍 HolisticReportView RENDERING - Beta button should show:', {
    userExists: !!user,
    userId: user?.id,
    isBetaTester: user?.isBetaTester,
    role: user?.role,
    shouldShowButton: user?.isBetaTester || user?.role === 'admin',
    hasViewedReport,
    canGiveFeedback,
    standardCompleted: standardStatus?.status === 'completed',
    personalCompleted: personalStatus?.status === 'completed'
  });

  return (
    <>
      <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Holistic Reports</h1>
        <p className="text-lg text-gray-700 mb-8">
          Congratulations on completing your AllStarTeams workshop! Your personalized development reports 
          are now available, synthesizing your journey into actionable insights for continued growth.
        </p>

        {/* About This Report Section */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-blue-900">
              <FileText className="h-6 w-6 text-blue-600" />
              About Your Holistic Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Introduction */}
            <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
              <p className="text-gray-800 leading-relaxed">
                This report is meant as a <strong>mirror</strong>, reflecting the patterns of your strengths, flow, and reflections. 
                It is not a fixed picture—any more than you are. Strengths show up differently depending on context: work, home, and relationships.
              </p>
            </div>

            <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
              <p className="text-gray-800 leading-relaxed mb-3">
                <strong>No assessment can tell you what you are.</strong> What it can do is surface a snapshot of patterns in your answers, 
                to spark awareness and conversation—with yourself, and with teammates who may see things differently.
              </p>
              
              <div className="text-sm text-gray-700">
                <p className="font-medium text-gray-800 mb-2">We describe this as a holistic report because it draws together multiple threads:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Your Star Strengths assessment results, mapping energy in Acting, Planning, Thinking, and Feeling modes</li>
                  <li>Your reflections about how and when you use those strengths</li>
                  <li>Your experiences of flow—moments when you feel deeply engaged, focused, and energized</li>
                  <li>Your well-being ladder, considering how you feel about your life today and future hopes</li>
                  <li>Your imagination and vision of a future self, giving shape to what lies ahead</li>
                </ul>
              </div>
            </div>

            {/* Key Principles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Patterns, Not Labels</h3>
                </div>
                <p className="text-sm text-gray-700">
                  This isn't a typing exercise. We look for patterns—how your strengths combine, shift with context, 
                  and interact with others. Patterns give you language for tendencies, not rules.
                </p>
              </div>

              <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Collaboration Lens</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Strengths are about how you fit into a team and complement others. 
                  Differences aren't deficits—they're invitations to collaborate.
                </p>
              </div>

              <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">The Role of Imagination</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Imagination runs throughout this report—your apex strength that's always on, 
                  underpinning all others through rehearsal, preparation, and exploration.
                </p>
              </div>

              <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">A Living Picture</h3>
                </div>
                <p className="text-sm text-gray-700">
                  This report is a snapshot in time. Your strengths can shift across seasons of life. 
                  Embrace this fluidity—your adaptability is part of your human design.
                </p>
              </div>
            </div>

            {/* How to Use Section */}
            <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
              <h3 className="flex items-center gap-2 font-semibold text-blue-900 mb-3">
                <MessageSquare className="h-5 w-5" />
                How to Use This Report
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Think of this report as a <strong>conversation starter</strong>. The most valuable conversations will be:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium text-gray-800 mb-1">With Yourself:</p>
                  <ul className="list-disc list-inside text-gray-700 ml-2 space-y-1">
                    <li>Journaling: Do I recognize myself here?</li>
                    <li>Reflection: When has this been true recently?</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-1">With Others:</p>
                  <ul className="list-disc list-inside text-gray-700 ml-2 space-y-1">
                    <li>1-on-1 conversations with trusted colleagues</li>
                    <li>Team workshops on strengths and flow</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Beta Tester Feedback Button - Before Report Generation */}
      {(user?.isBetaTester || user?.role === 'admin') && (
        <Card className="mb-6 bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <MessageSquareText className="w-5 h-5" />
                  Thank you {user?.name?.split(' ')[0] || 'participant'} for beta testing AllStarTeams!
                </h3>
                <p className="text-purple-800 text-sm">
                  {canGiveFeedback 
                    ? "Thank you for completing your workshop! We'd love to hear about your experience with AllStarTeams."
                    : "Final feedback will be enabled when you generate and view one or both of your reports below. After reviewing your Professional and/or Personal insights, you'll be able to share your complete workshop experience with us."
                  }
                </p>
              </div>
              <div className="ml-4">
                <Button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  disabled={!canGiveFeedback}
                  className={`px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition-all ${
                    canGiveFeedback
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <MessageSquareText className="w-4 h-4" />
                  {canGiveFeedback ? 'Give Feedback' : 'Generate Reports First'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}



      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderReportCard(
          'standard',
          'Professional Report',
          'This report is written for sharing and is scrubbed of direct reflection quotes and your future-looking statements. It is written about you, not to you.',
          standardStatus,
          standardLoading
        )}

        {renderReportCard(
          'personal',
          'Comprehensive Report',
          'This report uses your strengths and flow assessments plus your personal reflections, challenges, well-being factors, and private growth insights.',
          personalStatus,
          personalLoading
        )}
      </div>

      {/* Next Steps */}
      {(standardStatus?.status === 'completed' || personalStatus?.status === 'completed') && (
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">🎉 Congratulations!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 mb-4">
              Your holistic report is ready! This marks the completion of your AllStarTeams workshop journey. 
              Use these insights to guide your continued growth and collaboration.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-800">What's Next:</h4>
              <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
                <li>Review your report and identify key development priorities</li>
                <li>Share appropriate insights with your team and manager</li>
                <li>Set up regular check-ins to track your growth progress</li>
                <li>Continue applying your flow attributes in daily work</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

    </div>

      {/* PDF Viewer Modal */}
      {pdfViewer.isOpen && (
        <PDFViewer
          pdfUrl={pdfViewer.pdfUrl}
          title={pdfViewer.title}
          downloadUrl={pdfViewer.downloadUrl}
          onClose={closePdfViewer}
        />
      )}

      {/* Beta Feedback Survey Modal */}
      <BetaFeedbackSurveyModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </>
  );
}
