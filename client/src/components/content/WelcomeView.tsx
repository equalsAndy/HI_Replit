import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '@/shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';

interface WelcomeViewProps extends ContentViewProps {
  isImaginalAgility?: boolean;
}

// Declare YouTube API globally
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const WelcomeView: React.FC<WelcomeViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  isImaginalAgility = false
}) => {
  const { updateVideoProgress } = useNavigationProgress();
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // Different content based on which app is active
  const stepId = isImaginalAgility ? "1-1" : "1-1";
  const title = isImaginalAgility 
    ? "Welcome to Imaginal Agility Workshop" 
    : "Welcome to AllStarTeams Workshop";

  const description = isImaginalAgility
    ? "Welcome to the Imaginal Agility workshop! This program will help you develop strategic imagination and navigate the Triple Challenge facing organizations today."
    : `PART I: INDIVIDUAL MICRO COURSE (SELF-GUIDED)
This self-paced experience is an opportunity for reflection and self-expression. Through several guided exercises and self-assessments, you will:
• Discover your Star Strengths
• Identify your Flow State
• Visualize your Professional Growth

Your Takeaways:
• A personalized Digital Star Card
• A personalized AI Holistic Profile Report
• Readiness for High-Impact Teamwork Practice

PART II: TEAMWORK PRACTICE (FACILITATED)
Join your teammates in a guided session where you'll bring your insights to life.

Together, you'll align your strengths, deepen collaboration, and practice in real time using a shared digital whiteboard.`;

  const videoId = isImaginalAgility ? "JxdhWd8agmE" : "lcjao1ob55A";

  const videoTitle = isImaginalAgility
    ? "Imaginal Agility Workshop Introduction"
    : "AllStarTeams Workshop Introduction";

  const nextButton = isImaginalAgility
    ? "Next: The Triple Challenge →"
    : "Next: Intro to Strengths →";

  const nextContentId = isImaginalAgility
    ? "triple-challenge"
    : "intro-strengths";

  // Load YouTube API and initialize player
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      
      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
      
      document.body.appendChild(script);
    };

    const initializePlayer = () => {
      if (playerRef.current && window.YT) {
        const newPlayer = new window.YT.Player(playerRef.current, {
          videoId: videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            enablejsapi: 1,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onReady: (event: any) => {
              setPlayer(event.target);
              startProgressTracking(event.target);
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                startProgressTracking(event.target);
              }
            }
          }
        });
      }
    };

    loadYouTubeAPI();

    return () => {
      if (player) {
        player.destroy();
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

  // Handle completion and progression
  const handleNext = () => {
    markStepCompleted(stepId);
    setCurrentContent(nextContentId);
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>

      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          {description}
        </p>

        <div className="mb-8">
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm h-[500px]">
            <div className="p-0 h-full">
              <div 
                ref={playerRef}
                className="w-full h-full rounded-lg"
                style={{ pointerEvents: 'auto', position: 'relative' }}
              />
            </div>
          </div>
        </div>

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
            onClick={handleNext}
            disabled={!hasReachedMinimum}
            className={`${hasReachedMinimum 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            size="lg"
          >
            {hasReachedMinimum ? nextButton : "Watch video to continue"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default WelcomeView;