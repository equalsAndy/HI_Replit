import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Slider } from '@/components/ui/slider';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight } from 'lucide-react';
import WellBeingLadderSvg from '../visualization/WellBeingLadderSvg';

const WellBeingView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [wellBeingLevel, setWellBeingLevel] = useState<number>(5);
  const [futureWellBeingLevel, setFutureWellBeingLevel] = useState<number>(7);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  
  // YouTube API state
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setAdjusting(false);
  };
  
  const handleAdjust = () => {
    setAdjusting(true);
    setSubmitted(false);
  };

  // YouTube API integration
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Load YouTube API
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      if (!document.querySelector('script[src*="youtube"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.body.appendChild(script);
      }

      window.onYouTubeIframeAPIReady = initializePlayer;
    };

    const initializePlayer = () => {
      const playerElement = document.getElementById('youtube-player-wellbeing');
      if (playerRef.current || !playerElement) return;

      try {
        playerRef.current = new window.YT.Player('youtube-player-wellbeing', {
          height: '100%',
          width: '100%',
          videoId: 'yidsMx8B678',
          playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
          },
          events: {
            onReady: (event: any) => {
              console.log('YouTube player ready');
              setIsPlayerReady(true);
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                startProgressTracking();
              }
            },
          },
        });
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
      }
    };

    const startProgressTracking = () => {
      const checkProgress = () => {
        if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
          try {
            const currentTime = playerRef.current.getCurrentTime();
            const duration = playerRef.current.getDuration();
            
            if (duration > 0) {
              const watchPercent = (currentTime / duration) * 100;
              
              if (watchPercent >= 1 && !hasReachedMinimum) {
                setHasReachedMinimum(true);
              }
            }
          } catch (error) {
            console.log('Error checking video progress:', error);
          }
        }
      };

      intervalId = setInterval(checkProgress, 1000);
    };

    loadYouTubeAPI();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      // Don't destroy the player on component re-render, only on unmount
    };
  }, []); // Empty dependency array to run only once

  const handleSave = async () => {
    setSaving(true);
    
    try {
      await apiRequest('/api/visualization', {
        method: 'POST',
        body: JSON.stringify({
          wellBeingLevel,
          futureWellBeingLevel,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/visualization'] });
      markStepCompleted('4-1');
      
      // Navigate to well-being reflections (cantril-ladder content)
      console.log('Navigating to well-being reflections (cantril-ladder)');
      setCurrentContent('cantril-ladder');
    } catch (error) {
      console.error('Error saving well-being data:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">The Cantril Ladder of Well-Being</h1>
      
      <div className="mb-8">
        {/* Video at the top, full width with proper aspect ratio */}
        <div className="mb-8">
          <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded border border-gray-200">
            <div 
              id="youtube-player-wellbeing"
              className="w-full h-full"
              style={{ minHeight: '360px' }}
            ></div>
          </div>
        </div>
        
        {/* Cantril Ladder description moved above ladder */}
        <div className="prose max-w-none mb-6">
          <p className="text-lg text-gray-700">
            Using the Cantril Ladder (0 = worst possible life, 10 = best possible life), you'll identify where you stand now, where you aim 
            to be in one year, and the steps you'll take each quarter to climb toward that vision.
          </p>
        </div>
        
        {/* Content below video */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* SVG Ladder - larger on bigger screens */}
          <div className="lg:col-span-5 xl:col-span-6 2xl:col-span-7 flex justify-center">
            <div className="w-full xl:w-11/12 2xl:w-full">
              <WellBeingLadderSvg 
                currentValue={wellBeingLevel}
                futureValue={futureWellBeingLevel}
              />
            </div>
          </div>
          
          {/* Sliders and controls - stacked */}
          <div className="lg:col-span-7 xl:col-span-6 2xl:col-span-5 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-md font-medium text-blue-800 mb-2">Where are you now?</h3>
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    On which step of the ladder would you say you stand today?
                  </p>
                  <div className="py-2">
                    <div className="flex justify-between mb-2 text-xs text-gray-600">
                      <span>Worst (0)</span>
                      <span>Best (10)</span>
                    </div>
                    <Slider
                      value={[wellBeingLevel]} 
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(values) => setWellBeingLevel(values[0])}
                      className="py-2"
                      disabled={submitted && !adjusting}
                    />
                    <div className="text-center mt-1">
                      <span className="font-medium text-lg text-blue-700">{wellBeingLevel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-md font-medium text-green-800 mb-2">Where do you want to be?</h3>
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    Where would you realistically like to be in one year?
                  </p>
                  <div className="py-2">
                    <div className="flex justify-between mb-2 text-xs text-gray-600">
                      <span>Worst (0)</span>
                      <span>Best (10)</span>
                    </div>
                    <Slider
                      value={[futureWellBeingLevel]} 
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(values) => setFutureWellBeingLevel(values[0])}
                      className="py-2"
                      disabled={submitted && !adjusting}
                    />
                    <div className="text-center mt-1">
                      <span className="font-medium text-lg text-green-700">{futureWellBeingLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Removed the Next button - users will use the bottom button instead */}
          </div>
        </div>
        
        {/* Interpretation section - as per provided content */}
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mb-8">
          <h3 className="text-amber-800 font-medium mb-3">Interpreting Your Position on the Ladder</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
              <h4 className="font-medium text-amber-800 mb-2">Steps 0-4: Struggling</h4>
              <p className="text-sm text-amber-700">
                People in this range typically report high levels of worry, sadness, stress, and pain.
                Daily challenges may feel overwhelming, and hope for the future may be limited.
              </p>
            </div>
            <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
              <h4 className="font-medium text-amber-800 mb-2">Steps 5-6: Getting By</h4>
              <p className="text-sm text-amber-700">
                This middle range represents moderate satisfaction with life. You likely have some 
                important needs met but still face significant challenges or unfulfilled aspirations.
              </p>
            </div>
            <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
              <h4 className="font-medium text-amber-800 mb-2">Steps 7-10: Thriving</h4>
              <p className="text-sm text-amber-700">
                People in this range report high life satisfaction, with most basic needs met. They typically
                experience a sense of purpose, strong social connections, and optimism.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving || !hasReachedMinimum}
          className={`${
            hasReachedMinimum && !saving
              ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
              : "bg-gray-300 cursor-not-allowed text-gray-500"
          }`}
        >
          {saving ? 'Saving...' : 'Next: Well-being Reflections'} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default WellBeingView;