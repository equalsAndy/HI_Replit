import React, { useState, useEffect } from 'react';
import { RequiresCompletionMessage } from './RequiresCompletionMessage';
import IntroToFlowView from './IntroToFlowView';
import { ContentViewProps } from '../../shared/types';
import { useStepProgression } from '@/hooks/use-step-progression';

interface ProtectedFlowPatternsViewProps extends ContentViewProps {
  starCard?: any;
}

export const ProtectedFlowPatternsView: React.FC<ProtectedFlowPatternsViewProps> = (props) => {
  const [dataValidation, setDataValidation] = useState<{
    hasData: boolean;
    missingData?: string[];
    loading: boolean;
    checked: boolean;
  }>({ hasData: false, missingData: [], loading: true, checked: false });

  const { navigateToStep } = useStepProgression('ast');

  useEffect(() => {
    // Only run once to prevent infinite loops
    if (dataValidation.checked) return;

    const checkDataDependencies = async () => {
      setDataValidation(prev => ({ ...prev, loading: true }));
      
      try {
        // Direct API call instead of using validateStepData to avoid dependency issues
        const starCardResponse = await fetch('/api/workshop-data/starcard', { 
          credentials: 'include',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (starCardResponse.ok) {
          const starCardData = await starCardResponse.json();
          const hasValidStarCard = starCardData && (
            (starCardData.thinking && starCardData.thinking > 0) ||
            (starCardData.acting && starCardData.acting > 0) ||
            (starCardData.feeling && starCardData.feeling > 0) ||
            (starCardData.planning && starCardData.planning > 0)
          );
          
          setDataValidation({
            hasData: hasValidStarCard,
            missingData: hasValidStarCard ? undefined : ['Star Strengths Assessment'],
            loading: false,
            checked: true
          });
        } else {
          setDataValidation({
            hasData: false,
            missingData: ['Star Strengths Assessment'],
            loading: false,
            checked: true
          });
        }
      } catch (error) {
        console.error('Error validating Flow Patterns data:', error);
        setDataValidation({
          hasData: false,
          missingData: ['Data validation failed - please try refreshing'],
          loading: false,
          checked: true
        });
      }
    };

    checkDataDependencies();
  }, [dataValidation.checked]);

  const handleNavigateToStep = async (stepId: string) => {
    const result = await navigateToStep(stepId);
    if (result.success && props.setCurrentContent) {
      // Map step IDs to content keys
      const stepContentMap: Record<string, string> = {
        '2-1': 'star-strengths-assessment'
      };
      
      const contentKey = stepContentMap[stepId];
      if (contentKey) {
        props.setCurrentContent(contentKey);
      }
    }
  };

  if (dataValidation.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Checking prerequisites...</p>
        </div>
      </div>
    );
  }

  // If data validation fails, show the completion message
  if (!dataValidation.hasData) {
    return (
      <RequiresCompletionMessage
        step="2-1"
        title="Flow Patterns"
        description="Complete the Star Strengths Assessment to access flow patterns analysis."
        missingData={dataValidation.missingData}
        onNavigateToStep={handleNavigateToStep}
      />
    );
  }

  // If validation passes, render the actual component
  return <IntroToFlowView {...props} />;
};