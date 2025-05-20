import React from 'react';
import MainContainer from '@/components/layout/MainContainer';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';

export default function StrengthsIntro() {
  const [_, navigate] = useLocation();
  const { markStepCompleted } = useNavigationProgress();
  
  const handleComplete = () => {
    markStepCompleted('2-1');
    navigate('/assessment');
  };
  
  return (
    <MainContainer stepId="2-1">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-800 mb-4">Introduction to Strengths</h1>
        
        <p className="text-lg text-gray-700 mb-6">
          Everyone has natural talents and abilities that, when identified and developed, 
          can become powerful strengths. Understanding your unique strengths profile is the 
          foundation for personal and professional growth.
        </p>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">The Four Quadrants of Strengths</h2>
            <p className="mb-6">
              The All-Star Teams model identifies four key quadrants of strengths that every person 
              possesses in different proportions:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-green-700 font-medium mb-2">THINKING</h3>
                <p className="text-sm">The ability to analyze, strategize, and process information logically. People strong in this quadrant excel at problem-solving and critical thinking.</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="text-red-700 font-medium mb-2">ACTING</h3>
                <p className="text-sm">The ability to take initiative, execute plans, and drive for results. People strong in this quadrant excel at getting things done and leading action.</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-blue-700 font-medium mb-2">FEELING</h3>
                <p className="text-sm">The ability to connect with others, build relationships, and understand emotions. People strong in this quadrant excel at teamwork and empathy.</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <h3 className="text-yellow-700 font-medium mb-2">PLANNING</h3>
                <p className="text-sm">The ability to organize, structure, and create systems. People strong in this quadrant excel at creating order and managing details.</p>
              </div>
            </div>
            
            <p>
              Everyone has all four quadrants, but most people tend to have natural strengths in one or two areas. 
              The Star Strengths Assessment will help you identify your unique profile.
            </p>
          </CardContent>
        </Card>
        
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-purple-800 mb-3">What to Expect in the Assessment</h2>
          <p className="mb-4">
            The assessment contains questions that will measure your tendencies across the four quadrants. 
            There are no right or wrong answers - just answer honestly about your natural preferences.
          </p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5 text-xs">✓</div>
              <span>Takes approximately 10-15 minutes</span>
            </li>
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5 text-xs">✓</div>
              <span>40 questions about your preferences and tendencies</span>
            </li>
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5 text-xs">✓</div>
              <span>Provides a personalized Star Card profile</span>
            </li>
          </ul>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleComplete}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
          >
            Begin Strengths Assessment
          </Button>
        </div>
      </div>
    </MainContainer>
  );
}