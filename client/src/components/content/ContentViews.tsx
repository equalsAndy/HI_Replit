
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
        return renderWelcomeView();
      case "intro-strengths":
        return renderIntroStrengthsView();
      case "strengths-assessment":
        return renderStrengthsAssessment();
      case "star-card-preview":
        return renderStarCardPreview();
      case "reflection":
        return renderReflectionView();
      case "intro-flow":
        return renderIntroFlowView();
      default:
        return renderWelcomeView();
    }
  };

  const renderWelcomeView = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to AllStarTeams Workshop</h1>
      
      <p className="text-lg text-gray-700 mb-6">
        Welcome to the AllStarTeams workshop! Through this journey, you'll discover your unique 
        strengths profile and learn how to leverage it in your professional life.
      </p>
      
      <Card className="mb-8">
        <CardContent className="p-0 overflow-hidden">
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src="https://www.youtube.com/embed/lcjao1ob55A?enablejsapi=1"
              title="AllStarTeams Workshop Introduction"
              className="w-full h-full" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">The workshop has these main components:</h2>
      
      <ul className="space-y-3 mb-8">
        <li className="flex items-start">
          <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
          <span>Complete your profile information</span>
        </li>
        <li className="flex items-start">
          <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
          <span>Take the Star Strengths Assessment (10-15 minutes)</span>
        </li>
        <li className="flex items-start">
          <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
          <span>Review your Star Profile and strengths</span>
        </li>
        <li className="flex items-start">
          <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
          <span>Explore your flow attributes</span>
        </li>
        <li className="flex items-start">
          <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
          <span>Visualize your future potential</span>
        </li>
        <li className="flex items-start">
          <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
          <span>Integrate insights into your professional life</span>
        </li>
      </ul>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => onStepComplete('1-1')}
          className="bg-purple-600 hover:bg-purple-700 text-white"
          size="lg"
        >
          Begin Your Learning Journey
        </Button>
      </div>
    </div>
  );

  const renderIntroStrengthsView = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Introduction to Strengths</h1>
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          Before we begin the assessment, let's understand what we mean by strengths and how they shape our professional effectiveness.
        </p>
        {/* Add more content specific to strengths introduction */}
        <Button 
          onClick={() => onStepComplete('2-1')} 
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Continue to Assessment
        </Button>
      </div>
    </div>
  );

  const renderStrengthsAssessment = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Strengths Assessment</h1>
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          This assessment will help you identify your natural strengths across four key dimensions:
          Thinking, Acting, Feeling, and Planning.
        </p>
        <Button 
          onClick={onAssessmentStart}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Start Assessment
        </Button>
      </div>
    </div>
  );

  const renderStarCardPreview = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Star Card</h1>
      {starCard && <StarCard data={starCard} />}
      <div className="mt-6">
        <Button 
          onClick={() => onStepComplete('2-3')}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Continue to Reflection
        </Button>
      </div>
    </div>
  );

  const renderReflectionView = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reflect on Your Strengths</h1>
      <StepByStepReflection onComplete={() => onStepComplete('2-4')} />
    </div>
  );

  const renderIntroFlowView = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Introduction to Flow</h1>
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          Now that you understand your strengths, let's explore how they connect to your state of flow -
          those moments when you're fully engaged and performing at your best.
        </p>
        <Button 
          onClick={() => onStepComplete('3-1')}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Continue to Flow Assessment
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-8">
      {renderContent()}
    </div>
  );
}
