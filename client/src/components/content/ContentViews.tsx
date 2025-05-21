import React from 'react';
import { ContentViewProps } from '../../shared/types';
import WelcomeView from './WelcomeView';
import IntroStrengthsView from './IntroStrengthsView';
import AssessmentView from './AssessmentView';
import StarCardPreviewView from './StarCardPreviewView';
import ReflectionView from './ReflectionView';
import FlowIntroView from './FlowIntroView';
import IntroToFlowView from './IntroToFlowView';
import FlowAssessmentView from './FlowAssessmentView';
import FlowRoundingOutView from './FlowRoundingOutView';
import FlowStarCardView from './FlowStarCardView';
import WellbeingView from './WellbeingView';
import CantrilLadderView from './CantrilLadderView';
import VisualizingYouView from './VisualizingYouView';
import FutureSelfView from './FutureSelfView';
import FinalReflectionView from './FinalReflectionView';
import StarCardResourceView from './StarCardResourceView';
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
  user,
  flowAttributesData,
  setIsAssessmentModalOpen
}) => {
  // Return the appropriate content based on currentContent
  switch (currentContent) {
    // AllStarTeams Introduction
    case 'welcome':
      return (
        <WelcomeView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    // Discover your Strengths
    case 'intro-strengths':
      return (
        <IntroStrengthsView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'strengths-assessment':
      return (
        <AssessmentView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          setIsAssessmentModalOpen={setIsAssessmentModalOpen}
        />
      );

    case 'star-card-preview':
      return (
        <StarCardPreviewView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'reflection':
      return (
        <ReflectionView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    // Find your Flow
    case 'intro-flow':
      return (
        <FlowIntroView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );
      
    case 'intro-to-flow':
      return (
        <FlowIntroView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'flow-assessment':
      return (
        <FlowAssessmentView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'flow-rounding-out':
      return (
        <FlowRoundingOutView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'flow-star-card':
      return (
        <FlowStarCardView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          user={user}
          flowAttributesData={flowAttributesData}
        />
      );

    // Visualize your Potential
    case 'wellbeing':
      return (
        <WellbeingView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'cantril-ladder':
      return (
        <CantrilLadderView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'visualizing-you':
      return (
        <VisualizingYouView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'future-self':
      return (
        <FutureSelfView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'your-statement':
      return (
        <FinalReflectionView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    // Imaginal Agility content views
    case 'imaginal-intro':
      return (
        <PlaceholderView 
          title="Introduction to Imaginal Agility"
          description="Welcome to the Imaginal Agility workshop! Through this journey, you'll discover your unique capabilities and learn how to leverage them to navigate complex challenges."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          nextContentKey="triple-challenge"
          nextLabel="Next: The Triple Challenge"
        />
      );
      
    case 'triple-challenge':
      return (
        <PlaceholderView 
          title="The Triple Challenge"
          description="Explore the three interconnected challenges of complexity, change, and connection that professionals face in today's rapidly evolving landscape."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          nextContentKey="imaginal-solution"
          nextLabel="Next: The Imaginal Agility Solution"
        />
      );
      
    case 'imaginal-solution':
      return (
        <PlaceholderView 
          title="The Imaginal Agility Solution"
          description="Discover how Imaginal Agility provides a framework for navigating complexity with creativity, adaptability, and purpose."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          nextContentKey="five-capabilities"
          nextLabel="Next: Your 5 Capabilities (5Cs)"
        />
      );
      
    case 'five-capabilities':
      return (
        <PlaceholderView 
          title="Your 5 Capabilities (5Cs)"
          description="Learn about the five core capabilities that form the foundation of Imaginal Agility: Clarity, Curiosity, Creativity, Courage, and Connection."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          nextContentKey="imagination-assessment"
          nextLabel="Next: Take the Imagination Assessment"
        />
      );
      
    case 'imagination-assessment':
      return (
        <PlaceholderView 
          title="Take the Imagination Assessment"
          description="Assess your imaginative capacities and discover your unique imagination profile."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          nextContentKey="five-c-assessment" 
          nextLabel="Next: Complete the 5Cs Assessment"
        />
      );
      
    case 'five-c-assessment':
      return (
        <PlaceholderView 
          title="Complete the 5Cs Assessment"
          description="Evaluate your proficiency in each of the five capabilities and identify areas for development."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          nextContentKey="insights-review"
          nextLabel="Next: Review Your Insights"
        />
      );
      
    case 'insights-review':
      return (
        <PlaceholderView 
          title="Review Your Insights"
          description="Explore the results of your assessments and gain valuable insights into your strengths and development opportunities."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          nextContentKey="team-workshop"
          nextLabel="Next: Team Workshop"
        />
      );
      
    case 'team-workshop':
      return (
        <PlaceholderView 
          title="Team Workshop"
          description="Access resources and guidance for conducting an Imaginal Agility workshop with your team to foster collective capabilities."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );
      
    // Handle placeholder content
    default:
      return (
        <PlaceholderView 
          title={`${currentContent}`}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );
  }
};

export default ContentViews;