import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { useVideoByStep } from '@/hooks/use-video-by-step';

interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const FlowIntroView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const { updateVideoProgress } = useNavigationProgress();
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const stepId = "3-1";

  // Fetch video data from database based on step ID
  const { data: videoData, isLoading } = useVideoByStep(stepId);
  const videoId = videoData?.editableId;

  // Load YouTube API
  useEffect(() => {
    if (!videoId || isLoading) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (player) {
        try {
          player.destroy();
        } catch (error) {
          console.log('Error destroying player:', error);
        }
      }
    };
  }, [videoId, isLoading]);

  // Track video progress
  const startProgressTracking = (playerInstance: any) => {
    let interval: NodeJS.Timeout;

    const trackProgress = () => {
      if (playerInstance && playerInstance.getCurrentTime && playerInstance.getDuration) {
        try {
          const currentTime = playerInstance.getCurrentTime();
          const duration = playerInstance.getDuration();

          if (duration > 0) {
            const percentage = (currentTime / duration) * 100;
            handleVideoProgress(percentage);
          }
        } catch (error) {
          console.log('Video progress tracking error:', error);
        }
      }
    };

    // Track progress every second
    interval = setInterval(trackProgress, 1000);

    // Clean up interval when component unmounts
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  };

  // Handle video progress updates
  const handleVideoProgress = (percentage: number) => {
    setVideoProgress(percentage);
    updateVideoProgress(stepId, percentage);

    // Check if minimum watch requirement is met (1%)
    if (percentage >= 1 && !hasReachedMinimum) {
      setHasReachedMinimum(true);
    }
  };

  // Initialize YouTube player
  const initializePlayer = () => {
    if (window.YT && window.YT.Player && playerRef.current) {
      const newPlayer = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target);
            startProgressTracking(event.target);
          },
          onStateChange: (event: any) => {
            // Handle player state changes if needed
          }
        }
      });
    }
  };

  // Handle completion and progression
  const handleNext = () => {
    markStepCompleted(stepId);
    setCurrentContent("flow-assessment");
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Understanding Flow State</h1>

      <div className="aspect-w-16 aspect-h-9 mb-4">
        <div className="w-full h-80 rounded border border-gray-200 bg-black">
          <div 
            ref={playerRef}
            className="w-full h-full rounded-lg"
            style={{ pointerEvents: 'auto', position: 'relative' }}
          />
        </div>
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
    </>
  );
};

export default FlowIntroView;