
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ChevronRight, FileText, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

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

  const handleDownload = async () => {
    if (!allAssessmentsComplete) {
      alert('Please complete all workshop assessments before generating your report.');
      return;
    }

    try {
      setGenerating(true);
      
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
      link.download = `HI-Holistic-Development-Report-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setReportGenerated(true);
      markStepCompleted('5-2');
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert(`Report generation failed: ${error.message}`);
    } finally {
      setGenerating(false);
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
    window.open('/api/reports/html/me', '_blank');
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-green-600" />
            Your Holistic Development Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Generate your comprehensive holistic development report that combines all your assessment results and insights.
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
                {generating ? 'Generating Report...' : reportGenerated ? 'Report Generated' : 'Download PDF Report'}
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
                    Your holistic development report has been successfully generated and downloaded!
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
