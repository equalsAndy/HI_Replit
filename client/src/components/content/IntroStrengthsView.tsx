import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '@/shared/types';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const IntroStrengthsView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const { updateVideoProgress } = useNavigationProgress();
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const stepId = "2-1";
  const videoId = "ao04eaeDIFQ";

  // Load YouTube API
  useEffect(() => {
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
  }, [videoId]);

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
    setCurrentContent("strengths-assessment");
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Intro to Strengths</h1>
      
      <div className="prose max-w-none">
        <div className="aspect-w-16 aspect-h-9 mb-4">
          <div className="w-full h-80 rounded border border-gray-200 bg-black">
            <div 
              ref={playerRef}
              className="w-full h-full rounded-lg"
              style={{ pointerEvents: 'auto', position: 'relative' }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">The Four Quadrants of Strengths</h2>
        <p>
          The AllStarTeams framework identifies four key quadrants of strengths that every person possesses in different proportions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="text-green-700 font-medium mb-2">Thinking</h3>
            <p className="text-sm">The ability to analyze, strategize, and process information logically. People strong in this quadrant excel at problem-solving and critical thinking.</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="text-red-700 font-medium mb-2">Acting</h3>
            <p className="text-sm">The ability to take decisive action, implement plans, and get things done. People strong in this quadrant are proactive and results-oriented.</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-blue-700 font-medium mb-2">Feeling</h3>
            <p className="text-sm">The ability to connect with others, empathize, and build relationships. People strong in this quadrant excel in team environments and social settings.</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <h3 className="text-yellow-700 font-medium mb-2">Planning</h3>
            <p className="text-sm">The ability to organize, structure, and create systems. People strong in this quadrant excel at creating order and maintaining processes.</p>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4">Your Assessment Journey</h3>
        <p>
          In the upcoming assessment, you'll answer a series of questions designed to identify your natural strengths across these four quadrants. For each scenario, you'll rank options from "most like me" to "least like me."
        </p>
        <p>
          Remember: There are no right or wrong answers. The goal is to identify your authentic strengths so you can leverage them more effectively.
        </p>
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleNext}
            disabled={!hasReachedMinimum}
            className={`${
              hasReachedMinimum 
                ? "bg-indigo-700 hover:bg-indigo-800" 
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Take Assessment
          </Button>
        </div>
      </div>
    </>
  );
};

export default IntroStrengthsView;