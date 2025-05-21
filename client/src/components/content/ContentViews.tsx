import React from 'react';
import { ContentViewProps } from '../../shared/types';
import WelcomeView from './WelcomeView';
import IntroStrengthsView from './IntroStrengthsView';
import AssessmentView from './AssessmentView';
import StarCardPreviewView from './StarCardPreviewView';
import ReflectionView from './ReflectionView';
import FlowIntroView from './FlowIntroView';
import PlaceholderView from './PlaceholderView';

interface ContentViewsProps extends ContentViewProps {
  currentContent: string;
  setIsAssessmentModalOpen: (isOpen: boolean) => void;
}

const ContentViews: React.FC<ContentViewsProps> = ({
  currentContent,
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard,
  setIsAssessmentModalOpen
}) => {
  // Return the appropriate view based on the current content
  switch (currentContent) {
    case "welcome":
      return <WelcomeView navigate={navigate} markStepCompleted={markStepCompleted} setCurrentContent={setCurrentContent} />;
    
    case "intro-strengths":
      return <IntroStrengthsView navigate={navigate} markStepCompleted={markStepCompleted} setCurrentContent={setCurrentContent} />;
    
    case "strengths-assessment":
      return <AssessmentView navigate={navigate} markStepCompleted={markStepCompleted} setCurrentContent={setCurrentContent} setIsAssessmentModalOpen={setIsAssessmentModalOpen} />;
    
    case "star-card-preview":
      return <StarCardPreviewView navigate={navigate} markStepCompleted={markStepCompleted} setCurrentContent={setCurrentContent} starCard={starCard} />;
    
    case "reflection":
      return <ReflectionView navigate={navigate} markStepCompleted={markStepCompleted} setCurrentContent={setCurrentContent} starCard={starCard} />;
    
    case "intro-flow":
      return <FlowIntroView navigate={navigate} markStepCompleted={markStepCompleted} setCurrentContent={setCurrentContent} />;
    
    case "flow-assessment":
    case "flow-card":
    case "rounding-out":
    case "well-being":
    case "cantril-ladder":
    case "visualizing-you":
    case "future-self":
    case "your-statement":
      return (
        <PlaceholderView 
          title={currentContent.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          navigate={navigate} 
          markStepCompleted={markStepCompleted} 
          setCurrentContent={setCurrentContent} 
        />
      );
    
    default:
      return <WelcomeView navigate={navigate} markStepCompleted={markStepCompleted} setCurrentContent={setCurrentContent} />;
  }
};

export default ContentViews;