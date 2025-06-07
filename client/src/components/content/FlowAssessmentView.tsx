import React from 'react';
import { ContentViewProps } from '../../shared/types';
import FlowAssessment from '../flow/FlowAssessmentNew';

const FlowAssessmentView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
}) => {
  const handleTabChange = (tabId: string) => {
    if (tabId === "roundingout") {
      markStepCompleted?.('3-2');
      setCurrentContent?.("flow-rounding-out");
    }
  };

  return <FlowAssessment onTabChange={handleTabChange} />;
};

export default FlowAssessmentView;