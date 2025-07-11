import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
// Props interface
interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import WellBeingLadderSvg from "../visualization/WellBeingLadderSvg";
import VideoPlayer from "./VideoPlayer";

const WellBeingView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
}) => {
  const [wellBeingLevel, setWellBeingLevel] = useState<number>(5);
  const [futureWellBeingLevel, setFutureWellBeingLevel] = useState<number>(7);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Workshop status
  const { completed, loading, isWorkshopLocked } = useWorkshopStatus();
  const testWorkshopLocked = isWorkshopLocked();

  // Fetch user's existing wellbeing data to initialize sliders
  const { data: visualizationData } = useQuery({
    queryKey: ["/api/visualization"],
    staleTime: 0,
  });

  // Initialize slider values when data loads or from localStorage
  useEffect(() => {
    // First try to load from API
    if (visualizationData) {
      const data = visualizationData as any;
      if (data.wellBeingLevel !== undefined) {
        setWellBeingLevel(data.wellBeingLevel);
      }
      if (data.futureWellBeingLevel !== undefined) {
        setFutureWellBeingLevel(data.futureWellBeingLevel);
      }
      setIsInitialized(true);
    } else {
      // Fallback to localStorage if API data not available
      const savedWellBeing = localStorage.getItem("wellbeingData");
      if (savedWellBeing) {
        try {
          const parsed = JSON.parse(savedWellBeing);
          setWellBeingLevel(parsed.wellBeingLevel || 5);
          setFutureWellBeingLevel(parsed.futureWellBeingLevel || 7);
        } catch (error) {
          console.log("Error parsing saved wellbeing data");
        }
      }
      setIsInitialized(true);
    }
  }, [visualizationData]);

  // Save to localStorage and database whenever values change (but not during initialization)
  useEffect(() => {
    if (!isInitialized) return;
    
    // Prevent auto-save when workshop is completed
    if (completed) return;

    const wellbeingData = {
      wellBeingLevel,
      futureWellBeingLevel,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("wellbeingData", JSON.stringify(wellbeingData));

    // Auto-save to database with debouncing
    const timeoutId = setTimeout(async () => {
      try {
        await fetch("/api/visualization", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            wellBeingLevel,
            futureWellBeingLevel,
          }),
        });
        console.log("Auto-saved wellbeing data:", {
          wellBeingLevel,
          futureWellBeingLevel,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/visualization"] });
      } catch (error) {
        console.error("Error auto-saving well-being data:", error);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [wellBeingLevel, futureWellBeingLevel, isInitialized, completed]);

  // YouTube API state
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

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
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
      }

      window.onYouTubeIframeAPIReady = initializePlayer;
    };

    const initializePlayer = () => {
      const playerElement = document.getElementById("youtube-player-wellbeing");
      if (playerRef.current || !playerElement) return;

      try {
        playerRef.current = new window.YT.Player("youtube-player-wellbeing", {
          height: "100%",
          width: "100%",
          videoId: "SjEfwPEl65U",
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
              console.log("YouTube player ready");
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
        console.error("Error initializing YouTube player:", error);
      }
    };

    const startProgressTracking = () => {
      const checkProgress = () => {
        if (
          playerRef.current &&
          playerRef.current.getCurrentTime &&
          playerRef.current.getDuration
        ) {
          try {
            const currentTime = playerRef.current.getCurrentTime();
            const duration = playerRef.current.getDuration();

            if (duration > 0) {
              const watchPercent = (currentTime / duration) * 100;

              if (watchPercent >= 0.5 && !hasReachedMinimum) {
                setHasReachedMinimum(true);
              }
            }
          } catch (error) {
            console.log("Error checking video progress:", error);
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
      await fetch("/api/visualization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          wellBeingLevel,
          futureWellBeingLevel,
        }),
      });

      queryClient.invalidateQueries({ queryKey: ["/api/visualization"] });
      markStepCompleted("4-1");

      // Navigate to well-being reflections (cantril-ladder content)
      console.log("Navigating to cantril-ladder content view");
      setCurrentContent("cantril-ladder");
    } catch (error) {
      console.error("Error saving well-being data:", error);
      // Navigate anyway even if save fails
      console.log("Navigating to cantril-ladder despite save error");
      markStepCompleted("4-1");
      setCurrentContent("cantril-ladder");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>


      {/* Workshop Completion Banner */}
      {completed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <ChevronRight className="text-green-600" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-green-800">
                Workshop complete. Your responses are locked, but you can watch videos and read your answers.
              </h3>
            </div>
            <div className="text-green-600">
              🔒
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        The Cantril Ladder of Well-Being
      </h1>

      <div className="mb-8">
        {/* Video at the top, full width with proper aspect ratio */}
        <div className="mb-8 max-w-4xl mx-auto">
          <VideoPlayer
            workshopType="allstarteams"
            stepId="4-1"
            fallbackUrl="https://youtu.be/SjEfwPEl65U"
            title="The Cantril Ladder of Well-Being"
            aspectRatio="16:9"
            autoplay={true}
            onProgress={(progress) => console.log("Video progress:", progress)}
            startTime={0}
          />
        </div>

        {/* Cantril Ladder description moved above ladder */}
        <div className="prose max-w-none mb-6">
          <p className="text-lg text-gray-700">
            Using the Cantril Ladder (0 = worst possible life, 10 = best
            possible life), you'll identify where you stand now, where you aim
            to be in one year, and the steps you'll take each quarter to climb
            toward that vision.
          </p>
        </div>

        {/* Content below video */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
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
                <h3 className="text-md font-medium text-blue-800 mb-2 flex items-center gap-2">
                  Where are you now?
                  {completed && <span className="text-blue-600">🔒</span>}
                </h3>
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
                      onValueChange={completed ? undefined : (values) => setWellBeingLevel(values[0])}
                      className={`py-2 ${completed ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={completed}
                    />
                    <div className="text-center mt-1">
                      <span className="font-medium text-lg text-blue-700">
                        {wellBeingLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-md font-medium text-green-800 mb-2 flex items-center gap-2">
                  Where do you want to be?
                  {completed && <span className="text-green-600">🔒</span>}
                </h3>
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
                      onValueChange={completed ? undefined : (values) =>
                        setFutureWellBeingLevel(values[0])
                      }
                      className={`py-2 ${completed ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={completed}
                    />
                    <div className="text-center mt-1">
                      <span className="font-medium text-lg text-green-700">
                        {futureWellBeingLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interpretation section - as per provided content */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-6">
          <h3 className="text-amber-800 font-medium mb-3">
            Interpreting Your Position on the Ladder
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white bg-opacity-60 p-3 rounded-md border border-amber-100">
              <h4 className="font-medium text-amber-800 mb-2 text-sm">
                Steps 0-4: Struggling
              </h4>
              <p className="text-xs text-amber-700">
                People in this range typically report high levels of worry,
                sadness, stress, and pain. Daily challenges may feel
                overwhelming, and hope for the future may be limited.
              </p>
            </div>
            <div className="bg-white bg-opacity-60 p-3 rounded-md border border-amber-100">
              <h4 className="font-medium text-amber-800 mb-2 text-sm">
                Steps 5-6: Getting By
              </h4>
              <p className="text-xs text-amber-700">
                This middle range represents moderate satisfaction with life.
                You likely have some important needs met but still face
                significant challenges or unfulfilled aspirations.
              </p>
            </div>
            <div className="bg-white bg-opacity-60 p-3 rounded-md border border-amber-100">
              <h4 className="font-medium text-amber-800 mb-2 text-sm">
                Steps 7-10: Thriving
              </h4>
              <p className="text-xs text-amber-700">
                People in this range report high life satisfaction, with most
                basic needs met. They typically experience a sense of purpose,
                strong social connections, and optimism.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || completed}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {completed 
            ? "Continue to Well-being Reflections"
            : saving 
              ? "Saving..." 
              : "Next: Well-being Reflections"
          } <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default WellBeingView;
