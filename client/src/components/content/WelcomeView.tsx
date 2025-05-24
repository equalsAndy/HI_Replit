import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeViewProps extends ContentViewProps {
  isImaginalAgility?: boolean;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  isImaginalAgility = false
}) => {
  // Different content based on which app is active
  const title = isImaginalAgility 
    ? "Welcome to Imaginal Agility Workshop" 
    : "Welcome to AllStarTeams Workshop";

  const description = isImaginalAgility
    ? "Welcome to the Imaginal Agility workshop! This program will help you develop strategic imagination and navigate the Triple Challenge facing organizations today."
    : "Welcome to the AllStarTeams workshop! Through this journey, you'll discover your unique strengths profile and learn how to leverage it in your professional life.";

  const videoSrc = isImaginalAgility
    ? "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1" // Placeholder - replace with actual Imaginal Agility video
    : "https://www.youtube.com/embed/lcjao1ob55A?enablejsapi=1";

  const videoTitle = isImaginalAgility
    ? "Imaginal Agility Workshop Introduction"
    : "AllStarTeams Workshop Introduction";

  const nextButton = isImaginalAgility
    ? "Next: The Triple Challenge →"
    : "Next: Intro to Strengths →";

  const nextContentId = isImaginalAgility
    ? "triple-challenge"
    : "intro-strengths";

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>

      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          {description}
        </p>

        <Card className="mb-8">
          <CardContent className="p-0 overflow-hidden">
            <div className="w-full aspect-video md:w-4/5 mx-auto">
              <iframe 
                src={videoSrc}
                title={videoTitle}
                className="w-full h-full rounded-lg border-0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                style={{ pointerEvents: 'auto', position: 'relative' }}
              ></iframe>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">The workshop has these main components:</h2>

        {isImaginalAgility ? (
          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
              <span>Understand the Triple Challenge facing organizations</span>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
              <span>Explore the solution: Strategic Imagination</span>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
              <span>Discover your 5Cs Profile</span>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
              <span>Take the 5Cs Assessment</span>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
              <span>Review your insights and apply them to your work</span>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
              <span>Prepare for the team workshop</span>
            </li>
          </ul>
        ) : (
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
        )}

        <div className="flex justify-end">
          <Button 
            onClick={() => {
              markStepCompleted('1-1');
              setCurrentContent(nextContentId);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {nextButton}
          </Button>
        </div>
      </div>
    </>
  );
};

export default WelcomeView;