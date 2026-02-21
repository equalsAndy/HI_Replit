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
import WellBeingReflections from './WellBeingReflections';
import WellBeingLadderSvg from "../visualization/WellBeingLadderSvg";
import VideoPlayer from "./VideoPlayer";
import ScrollIndicator from '@/components/ui/ScrollIndicator';

const WellBeingView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
}) => {
  const [wellBeingLevel, setWellBeingLevel] = useState<number>(5);
  const [futureWellBeingLevel, setFutureWellBeingLevel] = useState<number>(7);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Workshop status - use step-specific locking for step 3-1
  const stepId = "3-1";
  const { astCompleted: workshopCompleted, loading: workshopLoading, isWorkshopLocked } = useWorkshopStatus();
  const isStepLocked = isWorkshopLocked('ast', stepId);

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
    
    // Prevent auto-save when step is locked
    if (isStepLocked) return;

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
        // console.log("Auto-saved wellbeing data:", {
        //   wellBeingLevel,
        //   futureWellBeingLevel,
        // });
        queryClient.invalidateQueries({ queryKey: ["/api/visualization"] });
      } catch (error) {
        console.error("Error auto-saving well-being data:", error);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [wellBeingLevel, futureWellBeingLevel, isInitialized, isStepLocked]);

  // YouTube API state
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  return (
    <>
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="blue"
      />

      {/* Step Completion Banner */}
      {isStepLocked && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <ChevronRight className="text-green-600" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-green-800">
                Step 3-1 complete. Your responses are locked, but you can watch videos and review your answers.
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
            stepId="3-1"
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
                  {isStepLocked && <span className="text-blue-600">🔒</span>}
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
                      onValueChange={isStepLocked ? undefined : (values) => setWellBeingLevel(values[0])}
                      className={`py-2 ${isStepLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={isStepLocked}
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
                  {isStepLocked && <span className="text-green-600">🔒</span>}
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
                      onValueChange={isStepLocked ? undefined : (values) =>
                        setFutureWellBeingLevel(values[0])
                      }
                      className={`py-2 ${isStepLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={isStepLocked}
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

      {/* Reflections Header */}
      {!isStepLocked && (
        <div className="section-headers-tabs-60 mb-4">
          <div className="section-headers-pill-60 section-headers-pill-60--reflection">
            <div className="section-headers-pill-60__strip" aria-hidden="true" />
            <div className="section-headers-pill-60__box">🤔 Reflections</div>
          </div>
        </div>
      )}

      {/* Progressive Well-being Reflections */}
      {!isStepLocked && (
        <WellBeingReflections
          onComplete={() => {
            // Navigate to future self step
            markStepCompleted('3-1');
            setCurrentContent('future-self');
          }}
          setCurrentContent={setCurrentContent}
          markStepCompleted={markStepCompleted}
        />
      )}

      {/* Show completed message if step is locked */}
      {isStepLocked && (
        <div className="text-center py-12">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <ChevronRight className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Well-being Reflections Complete
            </h3>
            <p className="text-green-700">
              Your well-being reflections have been completed and saved. 
              You can review your responses in your holistic report.
            </p>
            <div className="text-center mt-6">
              <Button
                onClick={() => setCurrentContent('future-self')}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-lg px-8 py-3"
                data-continue-button="true"
              >
                Continue to Future Self <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WellBeingView;
