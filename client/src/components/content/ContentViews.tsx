import React from 'react';
import { ContentViewProps } from '../../shared/types';
import AllStarTeamsContent from './allstarteams/AllStarTeamsContent';
import ImaginalAgilityContent from './imaginal-agility/ImaginalAgilityContent';
import { useApplication } from '../../hooks/use-application';

interface ContentViewsProps extends ContentViewProps {
  currentContent: string;
  setIsAssessmentModalOpen: (isOpen: boolean) => void;
}

const ContentViews: React.FC<ContentViewsProps> = (props) => {
  // Get the current application context
  const { currentApp } = useApplication();
  const isImaginalAgility = currentApp === 'imaginal-agility';
  
  // Return the appropriate content based on the current application
  if (isImaginalAgility) {
    return <ImaginalAgilityContent {...props} />;
  } else {
    return <AllStarTeamsContent {...props} />;
  }
};

export default ContentViews;