import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import VideoPlayer from './VideoPlayer';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';

interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

const IntroStrengthsView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [hasReachedMinimum, setHasReachedMinimum] = useState(true); // Simplified: always true
  const stepId = "2-1";
  const { updateVideoProgress, progress, canProceedToNext } = useNavigationProgress();

  // Simplified mode: Next button always active for video steps
  useEffect(() => {
    setHasReachedMinimum(true);
    console.log(`🔍 SIMPLIFIED VALIDATION: Step ${stepId}`);
    console.log(`✅ SIMPLIFIED MODE: Next button always active for ${stepId}`);
  }, [stepId]);

  // Handle video progress - still track but don't use for validation
  const handleVideoProgress = (percentage: number) => {
    console.log(`🎬 IntroStrengthsView calling updateVideoProgress(${stepId}, ${percentage})`);
    updateVideoProgress(stepId, percentage);
    console.log(`🎬 VIDEO PROGRESS TRACKED (SIMPLIFIED MODE - not used for unlocking): ${stepId} = ${percentage}%`);
  };

  // Handle completion and progression
  const handleNext = () => {
    markStepCompleted(stepId);
    setCurrentContent("strengths-assessment");
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Intro to Strengths</h1>

      <div className="prose max-w-none">
        {/* Video Player */}
        <div className="mb-8">
          <VideoPlayer
            workshopType="allstarteams"
            stepId="2-1"
            fallbackUrl="https://youtu.be/TN5b8jx7KSI"
            title="Intro to Star Strengths"
            aspectRatio="16:9"
            autoplay={true}
            onProgress={handleVideoProgress}
          />
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">About this assessment</h2>
        <p className="mb-6">
          The AllStarTeams Strengths Assessment helps you discover your unique strengths profile across five key dimensions:
          Thinking, Acting, Feeling, Planning, and Imagining.
        </p>

        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-sm">22 short questions about how you approach work and collaboration</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-sm">Takes approximately 10–15 minutes to complete</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-sm">You'll order your responses from most like you (1) to least like you (4)</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-sm">Generates your personal Star Card—a visual snapshot of your strengths</span>
            </li>
          </ul>
        </div>

        <h3 className="text-xl font-bold mb-4">Instructions</h3>
        <p className="mb-4">
          For each scenario, drag and drop the four options to rank them from most like you (1) to least like you (4).
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-sm">There are no right or wrong answers—just be honest about what feels true to you.</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-sm">The four core strengths are quantified, color-coded, and placed on your Star Card based on your responses.</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-sm">Your fifth strength, Imagination, is not ranked or measured here. It appears at the top of your Star Card—blank like a canvas, symbolizing your unique potential.</span>
            </li>
          </ul>
        </div>

        <h3 className="text-xl font-bold mb-4">What you'll get</h3>
        <p className="mb-4">
          Your personal Star Card, showing how your four core strengths are distributed and ordered.
        </p>
        <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-sm">Think, Act, Feel, and Plan are placed on the card based on how you use them.</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-sm">Imagination appears at the apex, as your limitless fifth strength.</span>
            </li>
          </ul>
        </div>

        <p className="text-gray-700 mb-6">
          Later in the course, you'll complete your Star Card by adding your Flow State Qualities, making it a powerful tool for personal and team development.
        </p>

        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleNext}
            disabled={!hasReachedMinimum}
            className={`${
              hasReachedMinimum 
                ? "bg-indigo-700 hover:bg-indigo-800 text-white" 
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }`}
          >
            {hasReachedMinimum 
              ? "Next: Star Strengths Self-Assessment" 
              : "Watch video to continue (5% minimum)"
            }
          </Button>
        </div>
      </div>
    </>
  );
};

export default IntroStrengthsView;