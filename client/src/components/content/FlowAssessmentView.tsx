import React, { useEffect, useState } from 'react';
import { ContentViewProps } from '../../shared/types';
import FlowAssessment from '../flow/FlowAssessmentNew';

const FlowAssessmentView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
}) => {
  const [hasMarkedCompleted, setHasMarkedCompleted] = useState(false);

  // Check for existing assessment and mark step as completed
  useEffect(() => {
    console.log('🔍 FlowAssessmentView: useEffect triggered, hasMarkedCompleted:', hasMarkedCompleted);
    if (hasMarkedCompleted) return;

    const checkExistingAssessment = async () => {
      try {
        console.log('🔍 FlowAssessmentView: Checking for existing flow assessment...');
        const response = await fetch('/api/user/assessments', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 FlowAssessmentView: Assessment API response:', data);
          
          if (data.success && data.currentUser?.assessments?.flowAssessment?.formattedResults) {
            console.log('✅ FlowAssessmentView: Found existing flow assessment - marking step 3-2 as completed');
            markStepCompleted?.('3-2');
            setHasMarkedCompleted(true);
          } else {
            console.log('❌ FlowAssessmentView: No flow assessment found in API response');
          }
        } else {
          console.log('❌ FlowAssessmentView: Assessment API response not ok:', response.status);
        }
      } catch (error) {
        console.error('❌ FlowAssessmentView: Error checking for existing assessment:', error);
      }
    };

    checkExistingAssessment();
  }, [markStepCompleted, hasMarkedCompleted]);

  const handleTabChange = (tabId: string) => {
    if (tabId === "roundingout") {
      markStepCompleted?.('3-2');
      setCurrentContent?.("flow-rounding-out");
    }
  };

  return <FlowAssessment onTabChange={handleTabChange} />;
};

export default FlowAssessmentView;