
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ChevronRight } from 'lucide-react';

interface DownloadStarCardViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function DownloadStarCardView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: DownloadStarCardViewProps) {
  const handleDownload = () => {
    // TODO: Implement actual download functionality
    console.log('Downloading Star Card...');
    markStepCompleted('5-1');
  };

  const handleNext = () => {
    markStepCompleted('5-1');
    setCurrentContent('holistic-report');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-6 w-6 text-blue-600" />
            Download Your Star Card
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Your personalized Star Card is ready! Download it to keep a record of your strengths and flow attributes.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What's included in your Star Card:</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Your top strength categories</li>
                <li>Flow attributes and preferences</li>
                <li>Personalized insights and recommendations</li>
                <li>Action steps for development</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleDownload} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Star Card
              </Button>
              
              <Button variant="outline" onClick={handleNext} className="flex items-center gap-2">
                Next: Team Workshop Prep
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
