import React from 'react';
import { useNavigationProgress } from '../../../hooks/use-navigation-progress';
import { NextPrevButtons } from '../../navigation/NextPrevButtons';

interface IAWorkshopContentProps {
  currentStep: string;
  onComplete?: () => void;
}

export const IAWorkshopContent: React.FC<IAWorkshopContentProps> = ({
  currentStep,
  onComplete
}) => {
  const navigation = useNavigationProgress();
  const isCompleted = navigation.progress.completedSteps.includes(currentStep);

  const handleNext = async () => {
    if (isCompleted) {
      await navigation.markStepCompleted(currentStep);
      // Update progress in navigation system
      // This will trigger a re-render with the new step
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'ia-1-1':
        return <h2>Introduction to Imaginal Agility</h2>;
      case 'ia-1-2':
        return <h2>AI's 4X Mental Challenge</h2>;
      // Add more step content cases
      default:
        return <div>Step content not found</div>;
    }
  };

  return (
    <div className="ia-workshop-content">
      {renderStepContent()}
      
      <div className="mt-8">
        <NextPrevButtons 
          onNext={handleNext}
          showNext={isCompleted}
          showPrev={true}
          className="mt-4"
        />
      </div>
    </div>
  );
};
