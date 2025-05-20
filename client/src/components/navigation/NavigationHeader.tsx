import React from 'react';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { Progress } from '@/components/ui/progress';

interface NavigationHeaderProps {
  stepId: string;
}

const NavigationHeader = ({ stepId }: NavigationHeaderProps) => {
  const { getAllSteps } = useNavigationProgress();
  
  // Get all steps and calculate overall progress
  const allSteps = getAllSteps();
  const completedSteps = allSteps.filter(step => step.status === 'completed').length;
  const progressPercentage = Math.round((completedSteps / allSteps.length) * 100);
  
  // Find current step info
  const currentStep = allSteps.find(step => step.id === stepId);
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b z-10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-lg font-medium text-purple-800">
                All-Star Teams Workshop
              </h1>
            </div>
            
            <div className="text-sm text-gray-500">
              Progress: {completedSteps} of {allSteps.length} steps
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{currentStep?.title || 'Step'}</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-1" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;