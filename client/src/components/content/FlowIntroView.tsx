import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import VideoPlayer from './VideoPlayer';

interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

const FlowIntroView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const { updateVideoProgress } = useNavigationProgress();
  const [hasReachedMinimum, setHasReachedMinimum] = useState(true); // SIMPLIFIED MODE: Always true

  const stepId = "3-1";

  // Handle video progress updates (for tracking only, not for unlocking)
  const handleVideoProgress = (percentage: number) => {
    console.log(`🎬 FlowIntroView calling updateVideoProgress(${stepId}, ${percentage})`);
    updateVideoProgress(stepId, percentage);
    console.log(`🎬 SIMPLIFIED MODE: Video progress tracked but Next button already active`);
  };

  // Handle completion and progression
  const handleNext = () => {
    markStepCompleted(stepId);
    setCurrentContent("flow-assessment");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Introduction to Flow</h1>

      {/* YouTube Video Player */}
      <div className="mb-8 max-w-4xl mx-auto">
        <VideoPlayer
          workshopType="allstarteams"
          stepId="3-1"
          fallbackUrl="https://youtu.be/6szJ9q_g87E"
          title="Introduction to Flow State"
          aspectRatio="16:9"
          autoplay={true}
          onProgress={handleVideoProgress}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-4">
        <div className="md:w-1/2">
          <div className="prose">
            <p className="mb-3">
              Flow is a state of complete immersion in an activity, characterized by energized focus, full involvement, 
              and enjoyment in the process. It's often described as being "in the zone" - when time seems to disappear 
              and you're completely absorbed in what you're doing.
            </p>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Benefits of Flow State</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Higher productivity and performance</li>
              <li>Increased creativity and innovation</li>
              <li>Greater work satisfaction and well-being</li>
              <li>Reduced stress and burnout</li>
              <li>More meaningful and engaging experiences</li>
            </ul>
          </div>
        </div>

        <div className="md:w-1/2">
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
          <h3 className="text-indigo-700 font-medium mb-1 text-sm">Clear Goals</h3>
          <p className="text-xs">You know exactly what you need to accomplish and can measure your progress.</p>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
          <h3 className="text-purple-700 font-medium mb-1 text-sm">Challenge & Skill Balance</h3>
          <p className="text-xs">The task is challenging enough to engage you but not so difficult that it causes anxiety.</p>
        </div>

        <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
          <h3 className="text-teal-700 font-medium mb-1 text-sm">Immediate Feedback</h3>
          <p className="text-xs">You can quickly tell how well you're doing, allowing for adjustment in real-time.</p>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
          <h3 className="text-amber-700 font-medium mb-1 text-sm">Deep Concentration</h3>
          <p className="text-xs">Your attention is completely focused on the task at hand, with no distractions.</p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
        <p className="text-blue-800 text-sm">
          In the upcoming assessment, you'll answer questions to determine your flow profile - how often you experience flow, 
          what triggers it for you, and how to create more flow experiences in your work.
        </p>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleNext}
          disabled={!hasReachedMinimum}
          className={`${
            hasReachedMinimum 
              ? "bg-indigo-700 hover:bg-indigo-800" 
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Next: Flow Assessment
        </Button>
      </div>
    </div>
  );
};

export default FlowIntroView;