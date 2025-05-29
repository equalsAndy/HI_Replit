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
    : "Welcome to the AllStarTeams workshop! Through this journey, you'll discover your unique strengths profile and learn how to leverage it in your professional life.";

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

        {isImaginalAgility ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">The workshop has these main components:</h2>
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
          </>
        ) : (
          <>
            {/* Part I Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4">
                  I
                </div>
                <h2 className="text-2xl font-bold text-gray-800">INDIVIDUAL MICRO COURSE</h2>
              </div>
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
                SELF-GUIDED
              </div>
              
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                This self-paced experience is an opportunity for reflection and self-expression. Through several guided exercises and self-assessments, you will:
              </p>
              
              <div className="grid gap-3 mb-8">
                <div className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">
                    ⭐
                  </div>
                  <span className="text-gray-800 font-medium">Discover your Star Strengths</span>
                </div>
                <div className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">
                    🌊
                  </div>
                  <span className="text-gray-800 font-medium">Identify your Flow State</span>
                </div>
                <div className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">
                    📈
                  </div>
                  <span className="text-gray-800 font-medium">Visualize your Professional Growth</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border-l-4 border-green-500">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    🎁
                  </div>
                  Your Takeaways:
                </h3>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 text-sm">
                      ✓
                    </div>
                    <span className="text-gray-700">A personalized Digital Star Card</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 text-sm">
                      ✓
                    </div>
                    <span className="text-gray-700">A personalized AI Holistic Profile Report</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 text-sm">
                      ✓
                    </div>
                    <span className="text-gray-700">Readiness for High-Impact Teamwork Practice</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Part II Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 mb-8 border border-purple-100">
              <div className="flex items-center mb-6">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4">
                  II
                </div>
                <h2 className="text-2xl font-bold text-gray-800">TEAMWORK PRACTICE</h2>
              </div>
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-6">
                FACILITATED
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start mb-4">
                  <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 text-xl">
                    👥
                  </div>
                  <div>
                    <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                      Join your teammates in a guided session where you'll bring your insights to life.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Together, you'll align your strengths, deepen collaboration, and practice in real time using a shared digital whiteboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
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