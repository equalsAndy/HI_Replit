
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ChevronRight, Clock } from 'lucide-react';

interface GrowthPlanViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function GrowthPlanView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: GrowthPlanViewProps) {
  const handleNext = () => {
    markStepCompleted('5-3');
    setCurrentContent('team-workshop-prep');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-purple-600" />
            Growth Plan (Coming Soon)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
                <h3 className="text-xl font-semibold text-purple-900">Feature in Development</h3>
              </div>
              
              <p className="text-purple-800 mb-4">
                We're working on a personalized growth plan feature that will provide you with:
              </p>
              
              <ul className="list-disc list-inside text-purple-700 space-y-2 mb-6">
                <li>Step-by-step development milestones</li>
                <li>Customized learning resources</li>
                <li>Progress tracking tools</li>
                <li>Team collaboration opportunities</li>
                <li>Regular check-in reminders</li>
              </ul>
              
              <p className="text-sm text-purple-600">
                This feature will be available soon. For now, continue to the team workshop preparation.
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleNext} className="flex items-center gap-2">
                Continue to Team Prep
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
