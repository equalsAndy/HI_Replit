import React, { useEffect, useState } from 'react';
import { useStepProgression } from '@/hooks/use-step-progression';
import { RequiresCompletionMessage } from '../content/RequiresCompletionMessage';

interface RouteProtectionProps {
  stepId: string;
  children: React.ReactNode;
  appType?: 'ast' | 'ia';
  redirectToContent?: (contentKey: string) => void;
}

export const RouteProtection: React.FC<RouteProtectionProps> = ({
  stepId,
  children,
  appType = 'ast',
  redirectToContent
}) => {
  const { isStepUnlocked, getStepDependencies, navigateToStep } = useStepProgression(appType);
  const [isChecking, setIsChecking] = useState(true);
  const [isAccessible, setIsAccessible] = useState(false);
  const [missingDependencies, setMissingDependencies] = useState<string[]>([]);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);
      
      const unlocked = isStepUnlocked(stepId);
      
      if (!unlocked) {
        const dependencies = getStepDependencies(stepId);
        setMissingDependencies(dependencies);
        setIsAccessible(false);
      } else {
        setIsAccessible(true);
        setMissingDependencies([]);
      }
      
      setIsChecking(false);
    };

    checkAccess();
  }, [stepId, isStepUnlocked, getStepDependencies]);

  const handleNavigateToStep = async (targetStepId: string) => {
    const result = await navigateToStep(targetStepId);
    if (result.success && redirectToContent) {
      // Map step IDs to content keys - you may need to customize this
      const stepContentMap: Record<string, string> = {
        '1-1': 'welcome',
        '1-2': 'positive-psychology',
        '1-3': 'about-course',
        '2-1': 'star-strengths-assessment',
        '2-2': 'flow-patterns',
        '2-3': 'future-self',
        '2-4': 'module-2-recap',
        '3-1': 'wellbeing-ladder',
        '3-2': 'rounding-out',
        '3-3': 'final-reflection',
        '3-4': 'finish-workshop'
      };
      
      const contentKey = stepContentMap[targetStepId];
      if (contentKey) {
        redirectToContent(contentKey);
      }
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAccessible) {
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

    // Find the first missing dependency to recommend
    const recommendedStep = missingDependencies[0];
    
    return (
      <RequiresCompletionMessage
        step={recommendedStep}
        title={getStepTitle(stepId)}
        description={`Complete the required prerequisites to access ${getStepTitle(stepId)}.`}
        missingData={missingDependencies.map(dep => getStepTitle(dep))}
        onNavigateToStep={handleNavigateToStep}
      />
    );
  }

  return <>{children}</>;
};