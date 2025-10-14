import React from 'react';
import { ContentViewProps } from '../../../shared/types';
import WelcomeView from '../WelcomeView';
import StrengthsView from '../StrengthsView';
import AssessmentView from '../AssessmentView';
import StarCardPreviewView from '../StarCardPreviewView';
import ReflectionView from '../ReflectionView';
import FlowIntroView from '../FlowIntroView';
import IntroToFlowView from '../IntroToFlowView';
import FlowStarCardView from '../FlowStarCardView';
import { ProtectedFlowPatternsView } from '../ProtectedFlowPatternsView';
import { ProtectedFutureSelfView } from '../ProtectedFutureSelfView';

import FlowRoundingOutView from '../FlowRoundingOutView';
import WellBeingView from '../WellBeingView';
import CantrilLadderView from '../CantrilLadderView';
import VisualizingYouView from '../VisualizingYouView';
import FutureSelfView from '../FutureSelfView';
import FinalReflectionView from '../FinalReflectionView';
import FinishWorkshopView from '../FinishWorkshopView';
import YourStarCardView from '../YourStarCardView';
import StarCardResourceView from '../StarCardResourceView';
import IntroIAView from './IntroIAView';
import PlaceholderView from '../PlaceholderView';
import Mod2RecapView from '../Mod2RecapView';
import DownloadStarCardView from './DownloadStarCardView';
import GeneralHolisticReportView from '../HolisticReportView';
import GrowthPlanView from './GrowthPlanView';
import QuarterlyReportView from './QuarterlyReportView';
import TeamWorkshopPrepView from './TeamWorkshopPrepView';
import MethodologyView from './MethodologyView';
import NeuroscienceView from './NeuroscienceView';
import CompendiumView from './CompendiumView';
import BackgroundView from './BackgroundView';
import WorkshopResourcesView from './WorkshopResourcesView';
import WorkshopRecap from '../WorkshopRecap';
import AstLessonContent from '@/components/ast/AstLessonContentPilot';
import SelfAwarenessOpportunityView from '../SelfAwarenessOpportunityView';
import AboutCourseView from '../AboutCourseView';
import ComprehensiveAssessmentsView from '../ComprehensiveAssessmentsView';
import PersonalProfileContainer from './PersonalProfileContainer';
import BeyondASTView from './BeyondASTView';

interface AllStarTeamsContentProps extends ContentViewProps {
  currentContent: string;
  setIsAssessmentModalOpen: (isOpen: boolean) => void;

  // Use any type to avoid compatibility issues temporarily
  starCard?: any;
  user?: any;
  flowAttributesData?: any;
  triggerWelcomeVideo?: () => void;
}

const AllStarTeamsContent: React.FC<AllStarTeamsContentProps> = ({
  currentContent,
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard,
  user,
  flowAttributesData,
  setIsAssessmentModalOpen,
  triggerWelcomeVideo
}) => {
  // Phase 0: guard V2 layout on AST 1‑1
  const AST_V2_LAYOUT = process.env.NEXT_PUBLIC_AST_V2_LAYOUT === '1';
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const optIn = AST_V2_LAYOUT || urlParams?.get('v2') === '1';
  const isAst1_1 = currentContent === 'welcome';
  if (optIn && isAst1_1) {
    return <AstLessonContent />;
  }

  console.log('🔍 AllStarTeamsContent: currentContent =', currentContent);
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
          triggerWelcomeVideo={triggerWelcomeVideo}
        />
      );  

    case 'self-awareness-opp':
      return (
        <SelfAwarenessOpportunityView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'star-strengths-assessment':
      return (
        <StrengthsView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          setIsAssessmentModalOpen={setIsAssessmentModalOpen}
        />
      );

    case 'flow-patterns':
      return (
        <ProtectedFlowPatternsView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'wellbeing-ladder':
      return (
        <WellBeingView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'rounding-out':
      return (
        <FlowRoundingOutView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'about-course':
      return (
        <AboutCourseView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'module-2-recap':
      return (
        <Mod2RecapView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );


    // Discover your Strengths
    case 'intro-strengths':
      return (
        <StrengthsView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          setIsAssessmentModalOpen={setIsAssessmentModalOpen}
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
        <ProtectedFutureSelfView 
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

    case 'workshop-recap':
      return (
        <WorkshopRecap 
          setCurrentContent={setCurrentContent}
          markStepCompleted={markStepCompleted}
        />
      );

    case 'finish-workshop':
    case '3-4':
      return (
        <FinishWorkshopView 
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
        <GeneralHolisticReportView 
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

    case 'module-3-recap':
      return (
        <PlaceholderView 
          title="Module 3 Recap"
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'extra-stuff':
    case 'more-fun-stuff':
    case 'personal-profile':
      // Show PersonalProfileContainer for admins, BeyondASTView for non-admins
      if (user?.role === 'admin') {
        return (
          <PersonalProfileContainer
            navigate={navigate}
            markStepCompleted={markStepCompleted}
            setCurrentContent={setCurrentContent}
          />
        );
      } else {
        return (
          <BeyondASTView
            navigate={navigate}
            markStepCompleted={markStepCompleted}
            setCurrentContent={setCurrentContent}
          />
        );
      }

    case 'more-imaginal-agility':
      return (
        <IntroIAView
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
