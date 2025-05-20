import React from 'react';
import MainContainer from '@/components/layout/MainContainer';
import { ContentSection } from '@/components/navigation';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'wouter';

export default function Welcome() {
  const { markStepCompleted } = useNavigationProgress();
  
  const handleCompleteStep = () => {
    markStepCompleted('intro-welcome');
  };
  
  return (
    <MainContainer 
      stepId="intro-welcome" 
      useModernNavigation={true}
      showStepNavigation={true}
    >
      <div className="max-w-3xl mx-auto">
        <ContentSection
          title="Welcome to All-Star Teams Workshop"
          description="Your journey to personal effectiveness and team excellence begins here"
          stepId="intro-welcome"
          estimatedTime={5}
          onNextClick={handleCompleteStep}
        >
          <div className="space-y-6">
            <div className="rounded-lg overflow-hidden mb-6">
              <img 
                src="/assets/workshop-header.jpg" 
                alt="All-Star Teams Workshop" 
                className="w-full h-48 object-cover"
              />
            </div>
            
            <h3 className="text-xl font-semibold">About This Workshop</h3>
            <p>
              Welcome to the All-Star Teams Workshop! This interactive learning journey 
              will help you discover your unique strengths pattern, understand how you 
              enter flow states, and visualize your future potential.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
              <Card className="p-5 border-l-4 border-l-blue-500">
                <h4 className="font-medium mb-2">Discover Your Strengths</h4>
                <p className="text-sm text-gray-600">
                  Identify your unique pattern of natural strengths that energize you
                </p>
              </Card>
              
              <Card className="p-5 border-l-4 border-l-green-500">
                <h4 className="font-medium mb-2">Find Your Flow</h4>
                <p className="text-sm text-gray-600">
                  Learn what conditions help you achieve peak performance states
                </p>
              </Card>
              
              <Card className="p-5 border-l-4 border-l-purple-500">
                <h4 className="font-medium mb-2">Visualize Your Potential</h4>
                <p className="text-sm text-gray-600">
                  Create a vision of your future self and the impact you can make
                </p>
              </Card>
            </div>
            
            <h3 className="text-xl font-semibold">How It Works</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Work through each module in sequence</li>
              <li>Complete assessments to reveal your personal insights</li>
              <li>Apply what you learn in reflective exercises</li>
              <li>Create your personalized Star Card to summarize your insights</li>
            </ul>
            
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mt-6">
              <h4 className="font-medium text-blue-800 mb-2">Get Ready</h4>
              <p className="text-blue-700 mb-4">
                Find a quiet space where you can focus without interruption. The full 
                workshop takes about 45-60 minutes to complete, but you can pause and 
                resume anytime. Your progress will be saved automatically.
              </p>
              <Button 
                onClick={handleCompleteStep}
                asChild
                className="mt-2"
              >
                <Link to="/intro/video">
                  Start Workshop <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </ContentSection>
      </div>
    </MainContainer>
  );
}