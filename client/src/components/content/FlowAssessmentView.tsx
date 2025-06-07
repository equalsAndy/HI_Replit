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
    if (hasMarkedCompleted) return;

    const checkExistingAssessment = async () => {
      try {
        const response = await fetch('/api/user/assessments', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.currentUser?.assessments?.flowAssessment?.formattedResults) {
            console.log('✅ Found existing flow assessment - marking step 3-2 as completed');
            markStepCompleted?.('3-2');
            setHasMarkedCompleted(true);
          }
        }
      } catch (error) {
        console.error('Error checking for existing assessment:', error);
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