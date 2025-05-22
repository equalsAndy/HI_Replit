import React from 'react';
import { ContentViewProps } from '../../shared/types';
import AllStarTeamsContent from './allstarteams/AllStarTeamsContent';
import ImaginalAgilityContent from './imaginal-agility/ImaginalAgilityContent';

interface ContentViewsProps extends ContentViewProps {
  currentContent: string;
  setIsAssessmentModalOpen: (isOpen: boolean) => void;
  isImaginalAgility?: boolean;
}

const ContentViews: React.FC<ContentViewsProps> = (props) => {
  // Check if isImaginalAgility prop is passed, otherwise use AllStarTeams
  const { isImaginalAgility = false } = props;
  
  // Return the appropriate content based on the isImaginalAgility prop
  if (isImaginalAgility) {
    return <ImaginalAgilityContent {...props} />;
  } else {
    return <AllStarTeamsContent {...props} />;
  }
};

export default ContentViews;