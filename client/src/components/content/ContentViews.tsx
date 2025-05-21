
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, CheckCircle, ClipboardCheck, FileText } from 'lucide-react';
import StarCard from '@/components/starcard/StarCard';
import StepByStepReflection from '@/components/reflection/StepByStepReflection';
import FlowAssessment from '@/components/flow/FlowAssessment';

interface ContentViewsProps {
  currentContent: string;
  starCard?: any;
  onAssessmentStart: () => void;
  onStepComplete: (stepId: string) => void;
  onNavigate: (path: string) => void;
  setCurrentContent: (content: string) => void;
}

export function ContentViews({
  currentContent,
  starCard,
  onAssessmentStart,
  onStepComplete,
  onNavigate,
  setCurrentContent
}: ContentViewsProps) {
  const renderContent = () => {
    switch (currentContent) {
      case "welcome":
        return <WelcomeView onComplete={() => onStepComplete('1-1')} />;
      case "intro-strengths":
        return <IntroStrengthsView onComplete={() => onStepComplete('2-1')} />;
      case "strengths-assessment":
        return <StrengthsAssessmentView onStart={onAssessmentStart} />;
      case "star-card-preview":
        return <StarCardPreviewView starCard={starCard} onComplete={() => onStepComplete('2-3')} />;
      case "reflection":
        return <ReflectionView starCard={starCard} onComplete={() => onStepComplete('2-4')} />;
      case "intro-flow":
        return <IntroFlowView onComplete={() => onStepComplete('3-1')} />;
      default:
        return <WelcomeView onComplete={() => onStepComplete('1-1')} />;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {renderContent()}
    </div>
  );
}

// Individual content view components...
function WelcomeView({ onComplete }) {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to AllStarTeams Workshop</h1>
      {/* Welcome content */}
    </>
  );
}

function IntroStrengthsView({ onComplete }) {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Intro to Strengths</h1>
      {/* Intro to strengths content */}
    </>
  );
}

// Add other view components...
