
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle } from 'lucide-react';

interface BackgroundViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function BackgroundView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: BackgroundViewProps) {
  const handleComplete = () => {
    markStepCompleted('6-4');
    // Could navigate to a completion page or back to main menu
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-gray-600" />
            Background
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Learn about the origins and development of the AllStarTeams approach, and the team behind this innovative methodology.
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Origins</h3>
                <p className="text-gray-800">
                  The AllStarTeams methodology was developed over several years of research and practical application 
                  in organizational settings. It emerged from the need for a more nuanced understanding of how 
                  individual strengths combine to create high-performing teams.
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Development Process</h3>
                <p className="text-blue-800">
                  Our approach was refined through extensive field testing with diverse teams across various industries, 
                  incorporating feedback from participants and measuring real-world performance improvements.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">Ongoing Evolution</h3>
                <p className="text-green-800">
                  We continue to evolve our methodology based on new research findings, technological advances, 
                  and insights from the thousands of individuals and teams who have participated in our programs.
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                <h3 className="font-semibold text-emerald-900">Congratulations!</h3>
              </div>
              <p className="text-emerald-800">
                You've completed the AllStarTeams workshop. You now have all the tools and insights needed 
                to leverage your strengths and optimize your performance, both individually and as part of a team.
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleComplete} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Complete Workshop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
