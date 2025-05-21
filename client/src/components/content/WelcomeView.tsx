import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Card, CardContent } from '@/components/ui/card';

const WelcomeView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to AllStarTeams Workshop</h1>
      
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          Welcome to the AllStarTeams workshop! Through this journey, you'll 
          discover your unique strengths profile and learn how to leverage it in your 
          professional life.
        </p>
        
        <Card className="mb-8">
          <CardContent className="p-0 overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <iframe 
                src="https://www.youtube.com/embed/lcjao1ob55A?enablejsapi=1"
                title="AllStarTeams Workshop Introduction"
                className="w-full h-[400px]" 
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
        
        <div className="flex justify-between items-center">
          <Button 
            onClick={() => {
              markStepCompleted('1-1');
              setCurrentContent("intro-strengths");
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
          >
            Begin Your Learning Journey
          </Button>
          
          <Button 
            onClick={() => {
              markStepCompleted('1-1');
              setCurrentContent("intro-strengths");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            Next: Intro to Strengths →
          </Button>
        </div>
      </div>
    </>
  );
};

export default WelcomeView;