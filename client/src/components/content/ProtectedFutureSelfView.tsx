import React, { useState, useEffect } from 'react';
import { RequiresCompletionMessage } from './RequiresCompletionMessage';
import FutureSelfView from './FutureSelfView';
import { ContentViewProps } from '../../shared/types';
import { useStepProgression } from '@/hooks/use-step-progression';

interface ProtectedFutureSelfViewProps extends ContentViewProps {
  starCard?: any;
}

export const ProtectedFutureSelfView: React.FC<ProtectedFutureSelfViewProps> = (props) => {
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
        // Direct API calls with timeout to avoid dependency issues
        const [starCardRes, flowRes] = await Promise.all([
          fetch('/api/workshop-data/starcard', { 
            credentials: 'include',
            signal: AbortSignal.timeout(5000)
          }),
          fetch('/api/workshop-data/flow-attributes', { 
            credentials: 'include',
            signal: AbortSignal.timeout(5000)
          })
        ]);

        const missingData: string[] = [];
        
        if (starCardRes.ok) {
          const starCardData = await starCardRes.json();
          const hasValidStarCard = starCardData && (
            (starCardData.thinking && starCardData.thinking > 0) ||
            (starCardData.acting && starCardData.acting > 0) ||
            (starCardData.feeling && starCardData.feeling > 0) ||
            (starCardData.planning && starCardData.planning > 0)
          );
          if (!hasValidStarCard) {
            missingData.push('Star Strengths Assessment');
          }
        } else {
          missingData.push('Star Strengths Assessment');
        }

        if (flowRes.ok) {
          const flowData = await flowRes.json();
          const hasFlowData = flowData?.success && flowData?.attributes && Array.isArray(flowData.attributes) && flowData.attributes.length > 0;
          if (!hasFlowData) {
            missingData.push('Flow Assessment');
          }
        } else {
          missingData.push('Flow Assessment');
        }

        setDataValidation({
          hasData: missingData.length === 0,
          missingData: missingData.length > 0 ? missingData : undefined,
          loading: false,
          checked: true
        });
      } catch (error) {
        console.error('Error validating Future Self data:', error);
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
        '2-1': 'star-strengths-assessment',
        '2-2': 'flow-patterns'
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
    // Determine which step to recommend based on missing data
    const recommendedStep = dataValidation.missingData?.includes('Star Strengths Assessment') ? '2-1' : '2-2';
    const stepTitles = {
      '2-1': 'Star Strengths Assessment',
      '2-2': 'Flow Patterns'
    };
    
    return (
      <RequiresCompletionMessage
        step={recommendedStep}
        title="Your Future Self"
        description="Complete your strengths assessment and flow patterns analysis to access future self reflection."
        missingData={dataValidation.missingData}
        onNavigateToStep={handleNavigateToStep}
      />
    );
  }

  // If validation passes, render the actual component
  return <FutureSelfView {...props} />;
};