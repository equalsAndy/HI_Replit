import React from 'react';
import MainContainer from '@/components/layout/MainContainer';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';

export default function IntroductionVideo() {
  const [_, navigate] = useLocation();
  const { markStepCompleted } = useNavigationProgress();
  
  const handleComplete = () => {
    markStepCompleted('1-1');
    navigate('/ast-user-home');
  };
  
  // Mark as completed on mount
  React.useEffect(() => {
    markStepCompleted('1-1');
  }, []);
  
  return (
    <MainContainer stepId="1-1">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-800 mb-4">All-Star Teams Workshop Introduction</h1>
        
        <p className="text-lg text-gray-700 mb-6">
          Welcome to the All-Star Teams workshop! Through this journey, you'll 
          discover your unique strengths profile and learn how to leverage it in your 
          professional life.
        </p>
        
        <Card className="mb-8">
          <CardContent className="p-0 overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <iframe 
                src="https://www.youtube.com/embed/ao04eaeDIFQ"
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
            onClick={handleComplete}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
          >
            Continue to Strengths Introduction
          </Button>
        </div>
      </div>
    </MainContainer>
  );
}