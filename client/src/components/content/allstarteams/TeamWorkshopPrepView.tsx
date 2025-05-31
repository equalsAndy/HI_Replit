import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ChevronRight, CheckCircle } from 'lucide-react';

interface TeamWorkshopPrepViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function TeamWorkshopPrepView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: TeamWorkshopPrepViewProps) {
  const handleNext = () => {
    markStepCompleted('5-4');
    setCurrentContent('methodology');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-orange-600" />
            Team Workshop Preparation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Prepare for the next phase: collaborating with your team to maximize collective strengths.
            </p>

            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-4">What to expect in the team workshop:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <strong className="text-orange-800">Strength Mapping:</strong>
                    <p className="text-orange-700">Discover how individual strengths complement each other</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <strong className="text-orange-800">Team Flow States:</strong>
                    <p className="text-orange-700">Learn to create optimal performance conditions together</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <strong className="text-orange-800">Collaborative Planning:</strong>
                    <p className="text-orange-700">Build strategies for leveraging collective potential</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Make sure to bring your downloaded Star Card to the team workshop session.
              </p>
            </div>

            <iframe 
            src="https://www.youtube.com/embed/SxMKHZWn4JA?enablejsapi=1"
            title="Team Workshop Preparation"
            className="w-full h-[400px] rounded-lg" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>

            <div className="flex gap-4">
              <Button onClick={handleNext} className="flex items-center gap-2">
                Continue to More Information
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}