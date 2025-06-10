import React from 'react';
import { Button } from '@/components/ui/button';
import VideoPlayer from './VideoPlayer';
import WelcomeView from './WelcomeView';
import IntroStrengthsView from './IntroStrengthsView';
import AssessmentView from './AssessmentView';
import StarCardPreviewView from './StarCardPreviewView';
import ReflectionView from './ReflectionView';
import IntroToFlowView from './IntroToFlowView';
import FlowAssessmentView from './FlowAssessmentView';
import FlowRoundingOutView from './FlowRoundingOutView';
import FlowStarCardView from './FlowStarCardView';
import WellBeingView from './WellBeingView';
import CantrilLadderView from './CantrilLadderView';
import VisualizingYouView from './VisualizingYouView';
import FutureSelfView from './FutureSelfView';
import YourStatementView from './YourStatementView';
import RecapView from './RecapView';
import AllStarTeamsContent from './allstarteams/AllStarTeamsContent';
import ImaginalAgilityContent from './imaginal-agility/ImaginalAgilityContent';
import { ContentViewProps } from '@/shared/types';

interface AssessmentViewProps extends ContentViewProps {
  setIsAssessmentModalOpen: (open: boolean) => void;
}

interface PlaceholderViewProps {
  title: string;
  currentContent: string;
  navigate?: any;
  markStepCompleted?: (stepId: string) => void;
  setCurrentContent?: (content: string) => void;
}

interface ContentViewsProps extends ContentViewProps {
  starCard?: any;
}

export default function ContentViews({ 
  currentContent, 
  navigate, 
  markStepCompleted = () => {}, 
  setCurrentContent = () => {}, 
  user,
  flowAttributesData,
  setIsAssessmentModalOpen = () => {},
  isImaginalAgility = false,
  starCard 
}: ContentViewsProps) {
  console.log('🎯 IA CONTENTVIEWS: Component rendering with currentContent =', currentContent);
  console.log('🎯 IA CONTENTVIEWS: Type of currentContent =', typeof currentContent);

  // Handle content routing
  switch (currentContent) {
    case 'welcome':
      return (
        <WelcomeView 
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'intro-strengths':
      return (
        <IntroStrengthsView 
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'strengths-assessment':
      return (
        <AssessmentView 
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          setIsAssessmentModalOpen={setIsAssessmentModalOpen}
          starCard={starCard}
        />
      );

    case 'star-card-preview':
      return (
        <StarCardPreviewView 
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    // AllStarTeams content
    case '1-1':
    case '2-1':
    case '2-2':
    case '2-3':
    case '2-4':
    case '3-1':
    case '3-2':
    case '3-3':
    case '3-4':
    case '4-1':
    case '4-2':
    case '4-3':
    case '4-4':
    case '4-5':
    case '5-1':
    case '5-2':
    case '5-3':
    case '5-4':
    case '6-1':
      return (
        <AllStarTeamsContent
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          user={user}
          flowAttributesData={flowAttributesData}
          setIsAssessmentModalOpen={setIsAssessmentModalOpen}
          isImaginalAgility={isImaginalAgility}
          starCard={starCard}
        />
      );

    // Imaginal Agility Workshop Steps
    case 'ia-1-1':
      console.log('🔍 ContentViews: Rendering ia-1-1 case');
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Introduction to Imaginal Agility</h1>
          
          <div className="mb-8 rounded-lg overflow-hidden">
            <VideoPlayer
              workshopType="imaginal-agility"
              stepId="ia-1-1"
              title="Introduction to Imaginal Agility"
              fallbackUrl="https://www.youtube.com/embed/k3mDEAbUwZ4"
            />
          </div>
          
          <div className="space-y-4 text-lg text-gray-700">
            <p>Welcome.</p>
            <p>Einstein said imagination is more important than knowledge. This workshop shows you why — and how to use yours more intentionally.</p>
            <p>As AI reshapes the workplace, the ability to imagine clearly and purposefully is your edge. It's the one human capability AI can't replace or optimize.</p>
            <p>This Micro Course is your starting point.</p>
            <p>You'll move at your own pace: watch short videos, follow simple prompts, and complete structured exercises.</p>
            <p>It's the first step in building Imaginal Agility — a skillset for navigating change, solving problems, and creating value.</p>
            <p>Next, you'll meet with your team to turn fresh insight into shared breakthroughs.</p>
            <p className="font-semibold">You're not just learning about imagination. You're harnessing it — together.</p>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('ia-1-1');
                setCurrentContent("ia-2-1");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: The Triple Challenge
            </Button>
          </div>
        </div>
      );

    case 'ia-2-1':
    case 'ia-3-1':
    case 'ia-4-1':
    case 'ia-4-2':
    case 'ia-5-1':
    case 'ia-6-1':
    case 'ia-7-1':
    case 'ia-8-1':
      return (
        <ImaginalAgilityContent
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          user={user}
          flowAttributesData={flowAttributesData}
          setIsAssessmentModalOpen={setIsAssessmentModalOpen}
          isImaginalAgility={isImaginalAgility}
          starCard={starCard}
        />
      );

    default:
      return (
        <div className="prose max-w-none">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Content Not Found</h1>
          <p className="text-gray-600">The requested content "{currentContent}" could not be found.</p>
        </div>
      );
  }
}