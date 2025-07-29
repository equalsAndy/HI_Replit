import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Eye, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  const [selectedReportType, setSelectedReportType] = useState<'standard' | 'personal' | null>(null);
  const queryClient = useQueryClient();

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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate report');
      }

      return response.json() as Promise<GenerateReportResponse>;
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
    generateReportMutation.mutate(reportType);
  };

  const handleViewReport = (reportType: 'standard' | 'personal') => {
    const status = reportType === 'standard' ? standardStatus : personalStatus;
    if (status?.pdfUrl) {
      window.open(status.pdfUrl, '_blank');
    }
  };

  const handleDownloadReport = (reportType: 'standard' | 'personal') => {
    const status = reportType === 'standard' ? standardStatus : personalStatus;
    if (status?.downloadUrl) {
      window.open(status.downloadUrl, '_blank');
    }
  };

  // Mark step as completed when user has generated at least one report
  useEffect(() => {
    const hasCompletedReport = standardStatus?.status === 'completed' || personalStatus?.status === 'completed';
    if (hasCompletedReport) {
      markStepCompleted('5-2');
    }
  }, [standardStatus, personalStatus, markStepCompleted]);

  const renderReportCard = (
    reportType: 'standard' | 'personal',
    title: string,
    description: string,
    status: ReportStatus | undefined,
    isLoading: boolean
  ) => {
    const isGenerating = generateReportMutation.isPending && generateReportMutation.variables === reportType;
    const canGenerate = !status || status.status === 'not_generated' || status.status === 'failed';
    const isCompleted = status?.status === 'completed';
    const isFailed = status?.status === 'failed';

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
              {/* Generation Status */}
              {status?.status === 'generating' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                    <span className="text-blue-800 font-medium">Generating report...</span>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">This may take a few moments. Please wait.</p>
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

              {/* Success Status */}
              {isCompleted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-800 font-medium">Report ready!</span>
                  </div>
                  {status?.generatedAt && (
                    <p className="text-green-700 text-sm mt-1">
                      Generated on {new Date(status.generatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {canGenerate && (
                  <Button
                    onClick={() => handleGenerateReport(reportType)}
                    disabled={isGenerating || generateReportMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? (
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

                {isCompleted && (
                  <>
                    <Button
                      onClick={() => handleViewReport(reportType)}
                      variant="outline"
                      className="border-blue-200 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View PDF
                    </Button>
                    <Button
                      onClick={() => handleDownloadReport(reportType)}
                      variant="outline"
                      className="border-green-200 hover:bg-green-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Holistic Development Reports</h1>
        <p className="text-lg text-gray-700">
          Congratulations on completing your AllStarTeams workshop! Your personalized development reports 
          are now available, synthesizing your journey into actionable insights for continued growth.
        </p>
      </div>

      {/* Report Type Explanation */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Understanding Your Report Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Professional Report</h3>
              <p className="text-blue-700 text-sm">
                Perfect for workplace sharing, team discussions, and professional development conversations. 
                Includes your strengths analysis, flow attributes, and development recommendations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Personal Report</h3>
              <p className="text-blue-700 text-sm">
                Your private development companion including personal reflections, challenges, and 
                well-being insights. This comprehensive version is for your personal growth journey.
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm font-medium">
              📝 Important: You can only generate each report type once. Choose wisely!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderReportCard(
          'standard',
          'Professional Development Report',
          'Share-ready insights including your Star Card, strengths analysis, flow attributes, and professional development goals. Perfect for team collaboration and workplace conversations.',
          standardStatus,
          standardLoading
        )}

        {renderReportCard(
          'personal',
          'Personal Development Report',
          'A comprehensive private report including everything from the professional version plus your personal reflections, challenges, well-being factors, and private growth insights.',
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
              Your holistic development report is ready! This marks the completion of your AllStarTeams workshop journey. 
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
  );
}