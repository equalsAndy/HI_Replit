
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ClipboardCheck, CheckCircle, FileText } from 'lucide-react';
import { AssessmentModal } from '@/components/assessment/AssessmentModal';
import StarCard from '@/components/starcard/StarCard';
import StepByStepReflection from '@/components/reflection/StepByStepReflection';

interface ContentViewsProps {
  currentContent: string;
  user: any;
  starCard: any;
  isAssessmentModalOpen: boolean;
  setIsAssessmentModalOpen: (open: boolean) => void;
  handleAssessmentComplete: (result: any) => void;
  markStepCompleted: (stepId: string) => void;
  navigate: (path: string) => void;
}

export default function ContentViews({
  currentContent,
  user,
  starCard,
  isAssessmentModalOpen,
  setIsAssessmentModalOpen,
  handleAssessmentComplete,
  markStepCompleted,
  navigate
}: ContentViewsProps) {
  const renderWelcomeView = () => (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to AllStarTeams Workshop</h1>
      {/* Welcome content */}
      <div className="prose max-w-none">
        {/* ... Welcome content JSX ... */}
      </div>
    </>
  );

  const renderStrengthsAssessment = () => (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Strengths Assessment</h1>
      {/* Strengths assessment content */}
      <div className="prose max-w-none">
        {/* ... Assessment content JSX ... */}
      </div>
    </>
  );

  const renderStarCardPreview = () => (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Star Profile + Star Card</h1>
      {/* Star card preview content */}
      <div className="prose max-w-none">
        {/* ... Star card preview JSX ... */}
      </div>
    </>
  );

  const renderReflection = () => (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reflect on Your Strengths</h1>
      <StepByStepReflection starCard={starCard} />
    </>
  );

  switch (currentContent) {
    case 'welcome':
      return renderWelcomeView();
    case 'strengths-assessment':
      return renderStrengthsAssessment();
    case 'star-card-preview':
      return renderStarCardPreview();
    case 'reflection':
      return renderReflection();
    default:
      return null;
  }
}
