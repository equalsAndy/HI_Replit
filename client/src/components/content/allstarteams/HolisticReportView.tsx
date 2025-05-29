
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ChevronRight, FileText } from 'lucide-react';

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
  const handleDownload = () => {
    // TODO: Implement actual download functionality
    console.log('Downloading Holistic Report...');
    markStepCompleted('5-2');
  };

  const handleNext = () => {
    markStepCompleted('5-2');
    setCurrentContent('growth-plan');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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
              Get your comprehensive holistic report that combines all your assessment results and insights.
            </p>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Your Holistic Report includes:</h3>
              <ul className="list-disc list-inside text-green-800 space-y-1">
                <li>Detailed strength analysis and breakdown</li>
                <li>Flow state recommendations</li>
                <li>Well-being ladder insights</li>
                <li>Future self visualization summary</li>
                <li>Personalized development roadmap</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleDownload} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
              
              <Button variant="outline" onClick={handleNext} className="flex items-center gap-2">
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
