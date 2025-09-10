import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Lock, AlertCircle } from 'lucide-react';

interface RequiresCompletionMessageProps {
  step: string;
  title: string;
  description?: string;
  missingData?: string[];
  onNavigateToStep?: (stepId: string) => void;
}

export const RequiresCompletionMessage: React.FC<RequiresCompletionMessageProps> = ({
  step,
  title,
  description,
  missingData = [],
  onNavigateToStep
}) => {
  const getStepTitle = (stepId: string): string => {
    const stepTitles: Record<string, string> = {
      '1-1': 'On Self-Awareness',
      '1-2': 'The Self-Awareness Opportunity', 
      '1-3': 'About this Course',
      '2-1': 'Star Strengths Assessment',
      '2-2': 'Flow Patterns',
      '2-3': 'Your Future Self',
      '2-4': 'Module 2 Recap',
      '3-1': 'Well-Being Ladder',
      '3-2': 'Rounding Out',
      '3-3': 'Final Reflections',
      '3-4': 'Finish Workshop'
    };
    return stepTitles[stepId] || stepId;
  };

  const getStepDescription = (stepId: string): string => {
    const descriptions: Record<string, string> = {
      '2-1': 'Complete the Star Strengths Self-Assessment to discover your unique strengths profile.',
      '2-2': 'Explore flow patterns and complete your flow assessment.',
      '2-3': 'Reflect on your future self using insights from your strengths and flow data.'
    };
    return descriptions[stepId] || 'Complete this step to continue.';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6 mx-auto">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Step Requires Completion
          </h1>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-amber-800 font-medium mb-2">
                  To access <strong>{title}</strong>, you need to complete:
                </p>
                <div className="space-y-2">
                  <div className="bg-white rounded-md p-3 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getStepTitle(step)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {description || getStepDescription(step)}
                        </p>
                      </div>
                      {onNavigateToStep && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigateToStep(step)}
                          className="ml-4 flex-shrink-0"
                        >
                          Go to Step
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {missingData.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-red-800 font-medium mb-2">
                    Missing Required Data:
                  </p>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {missingData.map((data, index) => (
                      <li key={index}>{data}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>
              This progression system ensures you have all the necessary insights and data 
              before moving to advanced steps that build on previous work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};