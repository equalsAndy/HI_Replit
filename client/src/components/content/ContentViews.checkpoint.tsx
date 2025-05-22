
// Create checkpoint copy of ContentViews.tsx before splitting into AST and IA views
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/shared/types';
import WelcomeView from './WelcomeView';
import IntroStrengthsView from './IntroStrengthsView';
import StarCardPreviewView from './StarCardPreviewView';
import ReflectionView from './ReflectionView';
import IntroToFlowView from './IntroToFlowView';
import FlowAssessmentView from './FlowAssessmentView';
import FlowRoundingOutView from './FlowRoundingOutView';
import FlowStarCardView from './FlowStarCardView';
import WellbeingView from './WellbeingView';
import CantrilLadderView from './CantrilLadderView';
import VisualizingYouView from './VisualizingYouView';
import FutureSelfView from './FutureSelfView';
import YourStatementView from './YourStatementView';
import RecapView from './RecapView';
import ImaginationAssessmentContent from './ImaginationAssessmentContent';
import FiveCSAssessmentContent from './FiveCSAssessmentContent';

interface ContentViewsProps {
  currentContent: string;
  navigate: (to: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
  user?: User;
  setIsAssessmentModalOpen: (isOpen: boolean) => void;
}

// Original ContentViews implementation...
// Full content of existing ContentViews.tsx
