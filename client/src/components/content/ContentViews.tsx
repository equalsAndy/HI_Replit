import React from 'react';
import { ContentViewProps } from '../../shared/types';
import { useApplication } from '@/hooks/use-application';
import AllStarTeamsContent from './allstarteams/AllStarTeamsContent';
import ImaginalAgilityContent from './imaginal-agility/ImaginalAgilityContent';

interface ContentViewsProps extends ContentViewProps {
  setIsAssessmentModalOpen: (isOpen: boolean) => void;
}

const ContentViews: React.FC<ContentViewsProps> = (props) => {
  const { currentApp } = useApplication();

  // Route to appropriate content based on current application
  if (currentApp === 'imaginal-agility') {
    return <ImaginalAgilityContent {...props} />;
  }

  // Default to AllStarTeams content
  return <AllStarTeamsContent {...props} />;
};

export default ContentViews;