
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ChevronRight, FileText, Loader2, CheckCircle, AlertCircle, ExternalLink, MessageSquareText, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { BetaFeedbackSurveyModal } from '../../beta-testing/BetaFeedbackSurveyModal';
import { useCurrentUser } from '../../../hooks/use-current-user';

interface HolisticReportViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function HolisticReportView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: HolisticReportViewProps) {
  const [generating, setGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [hasViewedReport, setHasViewedReport] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const { data: user } = useCurrentUser();

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
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

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Query to check if user has completed all required assessments
  const { data: userAssessments, isLoading } = useQuery({
    queryKey: ['user-assessments'],
    queryFn: async () => {
      const response = await fetch('/api/workshop-data/userAssessments', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch assessments');
      const result = await response.json();
      return result.currentUser?.assessments || {};
    },
    staleTime: 10000,
    retry: false
  });

  const requiredAssessments = ['starCard', 'flowAssessment', 'cantrilLadder', 'stepByStepReflection'];
  const completedAssessments = requiredAssessments.filter(type => userAssessments?.[type]);
  const allAssessmentsComplete = completedAssessments.length === requiredAssessments.length;
  const missingAssessments = requiredAssessments.filter(type => !userAssessments?.[type]);

  // Auto-mark step as completed when component loads
  useEffect(() => {
    markStepCompleted('5-2');
  }, [markStepCompleted]);

  // Inline thank-you handling is driven by the modal's onSubmitted callback

  const handleDownload = async () => {
    if (!allAssessmentsComplete) {
      alert('Please complete all workshop assessments before generating your report.');
      return;
    }

    try {
      setGenerating(true);
      setCountdown(60); // Start 60-second countdown

      // Generate and download report
      const response = await fetch('/api/reports/generate/me', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate report');
      }
      
      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `HI-Holistic-Report-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setReportGenerated(true);
      setHasViewedReport(true);
      markStepCompleted('5-2');
      
      // Dispatch event for beta tester feedback modal trigger
      window.dispatchEvent(new CustomEvent('holistic-report-viewed', {
        detail: { reportType: 'pdf', viewType: 'download' }
      }));
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert(`Report generation failed: ${error.message}`);
    } finally {
      setGenerating(false);
      setCountdown(0);
    }
  };

  const handleNext = () => {
    markStepCompleted('5-2');
    setCurrentContent('growth-plan');
  };

  const handleViewHtmlReport = () => {
    if (!allAssessmentsComplete) {
      alert('Please complete all workshop assessments before viewing your report.');
      return;
    }
    
    // Open HTML report in new tab
<<<<<<< HEAD:client/src/components/content/allstarteams/HolisticReportView.tsx
    window.open('/api/reports/html/me', '_blank');
=======
    window.open('/api/report/html/me', '_blank');
    
    // Track that user has viewed a report
    setHasViewedReport(true);
    
    // Dispatch event for beta tester feedback modal trigger
    window.dispatchEvent(new CustomEvent('holistic-report-viewed', {
      detail: { reportType: 'html', viewType: 'html' }
    }));
>>>>>>> development:client/src/components/content/allstarteams/archived/HolisticReportView.tsx
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading assessment data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine if user can give feedback (has completed assessments and viewed/generated reports)
  const canGiveFeedback = hasViewedReport || reportGenerated || allAssessmentsComplete;

  // Debug logging for beta tester detection
  console.log('🔍 AST HolisticReportView - User data:', {
    userId: user?.id,
    username: user?.username,
    isBetaTester: user?.isBetaTester,
    role: user?.role,
    hasViewedReport,
    reportGenerated,
    allAssessmentsComplete,
    canGiveFeedback,
    shouldShowButton: user?.isBetaTester || user?.role === 'admin'
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Beta Tester Feedback CTA or Thank You */}
      {(user?.isBetaTester || user?.role === 'admin') && (
        feedbackSubmitted ? (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-1">Thank you for your feedback!</h3>
                  <p className="text-green-800 text-sm">
                    We appreciate your help improving AllStarTeams. Your responses were recorded and are visible in the admin console.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <MessageSquareText className="w-5 h-5" />
                    Share Your Workshop Experience
                  </h3>
                  <p className="text-purple-800 text-sm">
                    {canGiveFeedback 
                      ? "Thank you for completing your workshop! We'd love to hear about your experience with AllStarTeams."
                      : "Please generate and view your reports below before providing feedback. Once you've reviewed your personalized insights, we'd appreciate hearing about your workshop experience."
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
        )
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-green-600" />
            Your Holistic Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Generate your comprehensive holistic report that combines all your assessment results and insights.
            </p>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">Your HI Holistic Report includes:</h3>
              <ul className="list-disc list-inside text-green-800 space-y-2">
                <li>Executive summary of your unique strength pattern</li>
                <li>Detailed core strengths profile with visual analysis</li>
                <li>Flow optimization insights and recommendations</li>
                <li>Well-being assessment and growth areas</li>
                <li>Future vision and personal development plan</li>
                <li>Personalized reflections and commitments</li>
              </ul>
            </div>

            {/* Assessment Completion Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Assessment Completion Status</h4>
              <div className="space-y-2">
                {requiredAssessments.map(assessment => (
                  <div key={assessment} className="flex items-center gap-2">
                    {userAssessments?.[assessment] ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                    <span className={`text-sm ${userAssessments?.[assessment] ? 'text-green-700' : 'text-orange-700'}`}>
                      {assessment === 'starCard' && 'Star Card Assessment'}
                      {assessment === 'flowAssessment' && 'Flow Assessment'}
                      {assessment === 'cantrilLadder' && 'Well-being Ladder'}
                      {assessment === 'stepByStepReflection' && 'Final Reflection'}
                    </span>
                  </div>
                ))}
              </div>
              
              {!allAssessmentsComplete && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                  <p className="text-sm text-orange-800">
                    Complete all assessments to generate your report. Missing: {missingAssessments.length} assessment(s).
                  </p>
                </div>
              )}
            </div>

            {/* Countdown Timer Display */}
            {generating && countdown > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Generating your report... Estimated time: <span className="font-mono font-bold">{formatCountdown(countdown)}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleDownload} 
                disabled={generating || !allAssessmentsComplete}
                className="flex items-center gap-2"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : reportGenerated ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {generating ? (countdown > 0 ? `Generating... ${formatCountdown(countdown)}` : 'Generating Report...') : reportGenerated ? 'Report Generated' : 'Download PDF Report'}
              </Button>

              <Button 
                onClick={handleViewHtmlReport} 
                disabled={!allAssessmentsComplete}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View HTML Report
              </Button>
            </div>

            {reportGenerated && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Your holistic report has been successfully generated and downloaded!
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Beta Feedback Survey Modal */}
      <BetaFeedbackSurveyModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmitted={() => setFeedbackSubmitted(true)}
      />
    </div>
  );
}
