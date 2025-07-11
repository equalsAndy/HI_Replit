import React from 'react';
import { ContentViewProps } from '../../../shared/types';
import WelcomeView from '../WelcomeView';
import IntroStrengthsView from '../IntroStrengthsView';
import AssessmentView from '../AssessmentView';
import StarCardPreviewView from '../StarCardPreviewView';
import ReflectionView from '../ReflectionView';
import FlowIntroView from '../FlowIntroView';
import IntroToFlowView from '../IntroToFlowView';
import FlowAssessmentView from '../FlowAssessmentView';
import FlowRoundingOutView from '../FlowRoundingOutView';
import FlowStarCardView from '../FlowStarCardView';
import WellBeingView from '../WellBeingView';
import CantrilLadderView from '../CantrilLadderView';
import VisualizingYouView from '../VisualizingYouView';
import FutureSelfView from '../FutureSelfView';
import FinalReflectionView from '../FinalReflectionView';
import YourStarCardView from '../YourStarCardView';
import StarCardResourceView from '../StarCardResourceView';
import PlaceholderView from '../PlaceholderView';
import DownloadStarCardView from './DownloadStarCardView';
import HolisticReportView from './HolisticReportView';
import GrowthPlanView from './GrowthPlanView';
import QuarterlyReportView from './QuarterlyReportView';
import TeamWorkshopPrepView from './TeamWorkshopPrepView';
import MethodologyView from './MethodologyView';
import NeuroscienceView from './NeuroscienceView';
import CompendiumView from './CompendiumView';
import BackgroundView from './BackgroundView';
import WorkshopResourcesView from './WorkshopResourcesView';

interface AllStarTeamsContentProps extends ContentViewProps {
  currentContent: string;
  setIsAssessmentModalOpen: (isOpen: boolean) => void;

  // Use any type to avoid compatibility issues temporarily
  starCard?: any;
  user?: any;
  flowAttributesData?: any;
}

const AllStarTeamsContent: React.FC<AllStarTeamsContentProps> = ({
  currentContent,
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard,
  user,
  flowAttributesData,
  setIsAssessmentModalOpen
}) => {
  switch (currentContent) {
    // Introduction View
    case 'welcome':
      return (
        <WelcomeView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          isImaginalAgility={false}
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
        <IntroToFlowView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'intro-to-flow':
      return (
        <IntroToFlowView 
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
        <WellBeingView 
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

    case 'final-reflection':
    case 'final-reflection-4-5':
    case '4-5':
    case 'your-statement':
      console.log(`🔍 AllStarTeamsContent: Rendering FinalReflectionView for content: ${currentContent}`);
      return (
        <FinalReflectionView 
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'star-card-resource':
      return (
        <StarCardResourceView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'your-star-card':
      return (
        <YourStarCardView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    // NEXT STEPS section
    case 'download-star-card':
      return (
        <DownloadStarCardView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'holistic-report':
      return (
        <HolisticReportView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'growth-plan':
      return (
        <GrowthPlanView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'quarterly-report':
      return (
        <QuarterlyReportView 
          navigate={navigate}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'team-workshop-prep':
      return (
        <TeamWorkshopPrepView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    // MORE INFORMATION section
    case 'methodology':
      return (
        <MethodologyView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'neuroscience':
      return (
        <NeuroscienceView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'compendium':
      return (
        <CompendiumView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'background':
      return (
        <BackgroundView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'workshop-resources':
      return (
        <WorkshopResourcesView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
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
        />
      );
  }
};

export default AllStarTeamsContent;