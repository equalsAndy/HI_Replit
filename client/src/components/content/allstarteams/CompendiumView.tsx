
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ChevronRight, Download } from 'lucide-react';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface CompendiumViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function CompendiumView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: CompendiumViewProps) {
  const handleNext = () => {
    markStepCompleted('6-3');
    setCurrentContent('background');
  };

  const handleDownload = () => {
    // TODO: Implement actual download functionality
    console.log('Downloading Compendium...');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="blue"
      />
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-teal-600" />
            Compendium
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Access our comprehensive compendium of resources, tools, and additional materials to support your ongoing development.
            </p>
            
            <div className="bg-teal-50 p-6 rounded-lg">
              <h3 className="font-semibold text-teal-900 mb-4">What's included in the compendium:</h3>
              <ul className="list-disc list-inside text-teal-800 space-y-2">
                <li>Detailed strength descriptions and development strategies</li>
                <li>Flow triggers and optimization techniques</li>
                <li>Team collaboration frameworks and tools</li>
                <li>Research papers and scientific background</li>
                <li>Practical exercises and reflection prompts</li>
                <li>Additional assessment tools and resources</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> The full compendium is available as a downloadable PDF resource 
                for continued learning and reference.
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Compendium
              </Button>
              
              <Button onClick={handleNext} className="flex items-center gap-2">
                Continue to Background
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
