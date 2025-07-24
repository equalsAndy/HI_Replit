import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Target, Lightbulb, Users } from 'lucide-react';

interface IA_2_2_ContentProps {
  onNext?: (stepId: string) => void;
}

function IA_2_2_Content({ onNext }: IA_2_2_ContentProps) {
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  const handleStartAssessment = () => {
    setShowAssessmentModal(true);
  };

  const dimensions = [
    {
      icon: Lightbulb,
      label: 'Imagination',
      description: 'Your ability to envision new possibilities and think beyond current constraints',
      color: 'text-purple-600'
    },
    {
      icon: Brain,
      label: 'Innovation', 
      description: 'Your capacity to create novel solutions and approaches to challenges',
      color: 'text-blue-600'
    },
    {
      icon: Target,
      label: 'Insight',
      description: 'Your skill in understanding deep patterns and gaining clarity from complexity',
      color: 'text-green-600'
    },
    {
      icon: Users,
      label: 'Intuition',
      description: 'Your ability to sense and trust inner wisdom and gut feelings',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-purple-800">I4C Self-Assessment</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Before we dive deeper into developing your imaginal agility, let's establish your current baseline 
          across the four core dimensions of the I4C Model.
        </p>
      </div>

      {/* Overview Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl text-purple-800 text-center">
            What You'll Assess
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {dimensions.map((dimension, index) => {
              const IconComponent = dimension.icon;
              
              return (
                <div key={index} className="flex items-start gap-3">
                  <IconComponent className={`w-8 h-8 ${dimension.color} mt-1 flex-shrink-0`} />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{dimension.label}</h3>
                    <p className="text-sm text-gray-600">{dimension.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Info */}
      <Card className="border-2 border-purple-200">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                How the Assessment Works
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                You'll evaluate yourself on a scale of 1-10 across each dimension, then see your results 
                displayed in an interactive radar chart. This becomes your baseline for growth and development.
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-3">Assessment Features:</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Interactive radar chart visualization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Personalized insights based on your profile
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Development recommendations for each dimension
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Save and track your progress over time
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Section */}
      <div className="text-center space-y-4">
        <p className="text-gray-600">
          Ready to discover your current I4C profile? The assessment takes about 5-10 minutes to complete.
        </p>
        
        <Button 
          onClick={handleStartAssessment}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
          size="lg"
        >
          Start Assessment
        </Button>
      </div>

      {/* Assessment Modal - Fixed JSX */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assessment Modal</h3>
            <p className="text-gray-600 mb-4">
              This is where the existing assessment modal with radar chart would open.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowAssessmentModal(false)}
                variant="outline"
              >
                Close
              </Button>
              <Button 
                onClick={async () => {
                  // Mark this step as completed
                  try {
                    await fetch('/api/workshop-data/complete-step', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ 
                        appType: 'imaginal-agility',
                        stepId: 'ia-2-2' 
                      })
                    });
                  } catch (error) {
                    console.log('Step completion API not available, continuing anyway');
                  }
                  
                  // Close modal and continue to next step
                  setShowAssessmentModal(false);
                  onNext?.('ia-3-1');
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Continue to Next Step
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IA_2_2_Content;
