
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ChevronRight } from 'lucide-react';

interface NeuroscienceViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function NeuroscienceView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: NeuroscienceViewProps) {
  const handleNext = () => {
    markStepCompleted('6-2');
    setCurrentContent('compendium');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Neuroscience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Discover the neuroscientific principles that underpin the AllStarTeams approach to strength development and team performance.
            </p>
            
            <div className="space-y-4">
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-3">Brain-Based Strengths</h3>
                <p className="text-purple-800">
                  Recent neuroscience research shows that our brains are naturally wired with certain cognitive preferences 
                  and processing patterns. Understanding these neural pathways helps explain why certain activities 
                  feel energizing while others feel draining.
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Flow States and Performance</h3>
                <p className="text-blue-800">
                  Neuroscientific studies of flow states reveal specific brainwave patterns and neurochemical 
                  changes that occur during peak performance. Our assessments identify the conditions that 
                  most readily trigger these optimal states for each individual.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">Neuroplasticity and Development</h3>
                <p className="text-green-800">
                  The brain's capacity for change (neuroplasticity) means that while we have natural strengths, 
                  we can also develop new neural pathways through targeted practice and development activities.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleNext} className="flex items-center gap-2">
                Continue to Compendium
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
