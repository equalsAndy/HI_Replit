import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ChevronRight, BookOpen } from 'lucide-react';

interface MethodologyViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function MethodologyView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: MethodologyViewProps) {
  const handleNext = () => {
    markStepCompleted('6-1');
    setCurrentContent('neuroscience');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-600" />
            Methodology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Learn about the scientific methodology behind the AllStarTeams assessment and development approach.
            </p>

            {/* Added video iframe here */}
            <div className="mb-4">
              <iframe 
                src="https://www.youtube.com/embed/kKarUFyDsf8?enablejsapi=1"
                title="Workshop Methodology"
                className="w-full h-[400px] rounded-lg" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>

            <div className="space-y-4">
              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-3">Research Foundation</h3>
                <p className="text-indigo-800">
                  Our methodology is grounded in decades of research in positive psychology, strengths science, 
                  and team dynamics. We combine evidence-based assessments with practical application frameworks.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Assessment Approach</h3>
                <p className="text-gray-800">
                  The AllStarTeams assessment uses a multi-dimensional approach that examines cognitive preferences, 
                  behavioral tendencies, and motivational drivers to create a comprehensive strength profile.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">Development Framework</h3>
                <p className="text-green-800">
                  Our development framework focuses on strength amplification rather than deficit correction, 
                  helping individuals and teams optimize their natural talents for peak performance.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleNext} className="flex items-center gap-2">
                Continue to Neuroscience
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}