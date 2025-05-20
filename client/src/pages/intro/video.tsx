import React from 'react';
import MainContainer from '@/components/layout/MainContainer';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';

export default function IntroVideo() {
  const [_, navigate] = useLocation();
  const { markStepCompleted } = useNavigationProgress();
  
  const handleComplete = () => {
    markStepCompleted('1-1');
    navigate('/discover-strengths/intro');
  };
  
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
        
        <ul className="space-y-3 mb-8 list-disc pl-5">
          <li className="text-gray-700">
            <span className="font-medium">Complete your profile information</span>
          </li>
          <li className="text-gray-700">
            <span className="font-medium">Take the Star Strengths Assessment</span> (10-15 minutes)
          </li>
          <li className="text-gray-700">
            <span className="font-medium">Review your Star Profile</span> and strengths
          </li>
          <li className="text-gray-700">
            <span className="font-medium">Explore your flow attributes</span>
          </li>
          <li className="text-gray-700">
            <span className="font-medium">Visualize your future potential</span>
          </li>
          <li className="text-gray-700">
            <span className="font-medium">Integrate insights</span> into your professional life
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