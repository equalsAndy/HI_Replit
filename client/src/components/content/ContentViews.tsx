
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
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          This assessment will help you identify your natural strengths across four key dimensions:
          Thinking, Acting, Feeling, and Planning.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-green-700">THINKING</h3>
              <p className="text-sm">Analytical and strategic capabilities</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-red-700">ACTING</h3>
              <p className="text-sm">Implementation and execution skills</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-700">FEELING</h3>
              <p className="text-sm">Emotional intelligence and intuition</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-yellow-700">PLANNING</h3>
              <p className="text-sm">Organization and future orientation</p>
            </CardContent>
          </Card>
        </div>

        <Button 
          onClick={() => setIsAssessmentModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Start Assessment
        </Button>
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
