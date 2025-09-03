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
import { ChevronRight, FileText } from "lucide-react";
import { useCallback } from "react";
import { debounce } from '@/lib/utils';
import { useTestUser } from '@/hooks/useTestUser';
import { validateAtLeastOneField } from '@/lib/validation';
import { ValidationMessage } from '@/components/ui/validation-message';
import WellBeingLadderSvg from "../visualization/WellBeingLadderSvg";
import VideoPlayer from "./VideoPlayer";

// Cantril Ladder reflection questions interfaces
interface CantrilQuestion {
  id: number;
  key: keyof CantrilFormData;
  title: string;
  question: string;
  description: string;
  placeholder: string;
  section: 'current' | 'future' | 'quarterly';
}

interface CantrilFormData {
  currentFactors: string;
  futureImprovements: string;
  specificChanges: string;
  quarterlyProgress: string;
  quarterlyActions: string;
}

// Cantril Ladder Questions
const cantrilQuestions: CantrilQuestion[] = [
  {
    id: 1,
    key: 'currentFactors',
    title: 'Current Well-being Factors',
    question: 'What factors shape your current rating?',
    description: 'What are the main elements contributing to your current well-being?',
    placeholder: 'Consider your work, relationships, health, finances, and personal growth...',
    section: 'current'
  },
  {
    id: 2,
    key: 'futureImprovements', 
    title: 'Future Vision',
    question: 'What improvements do you envision?',
    description: 'What achievements or changes would make your life better in one year?',
    placeholder: 'Describe specific improvements you hope to see in your life...',
    section: 'future'
  },
  {
    id: 3,
    key: 'specificChanges',
    title: 'Tangible Differences',
    question: 'What will be different?',
    description: 'How will your experience be noticeably different in tangible ways?',
    placeholder: 'Describe concrete changes you\'ll experience...',
    section: 'future'
  },
  {
    id: 4,
    key: 'quarterlyProgress',
    title: 'Quarterly Milestones',
    question: 'What progress would you expect in 3 months?',
    description: 'Name one specific indicator that you\'re moving up the ladder.',
    placeholder: 'Describe a measurable sign of progress...',
    section: 'quarterly'
  },
  {
    id: 5,
    key: 'quarterlyActions',
    title: 'Quarterly Commitments',
    question: 'What actions will you commit to this quarter?',
    description: 'Name 1-2 concrete steps you\'ll take before your first quarterly check-in.',
    placeholder: 'Describe specific actions you\'ll take...',
    section: 'quarterly'
  }
];

const WellBeingView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
}) => {
  const [wellBeingLevel, setWellBeingLevel] = useState<number>(5);
  const [futureWellBeingLevel, setFutureWellBeingLevel] = useState<number>(7);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Reflection questions state
  const [formData, setFormData] = useState<CantrilFormData>({
    currentFactors: '',
    futureImprovements: '',
    specificChanges: '',
    quarterlyProgress: '',
    quarterlyActions: ''
  });
  const [validationError, setValidationError] = useState<string>('');
  const { shouldShowDemoButtons } = useTestUser();
  
  // Workshop status - use AST completion for locking
  const { astCompleted: workshopCompleted, loading: workshopLoading } = useWorkshopStatus();

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
    if (workshopCompleted) return;

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
  }, [wellBeingLevel, futureWellBeingLevel, isInitialized, workshopCompleted]);

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

  // Load existing Cantril reflection data when component mounts
  useEffect(() => {
    const loadExistingReflectionData = async () => {
      try {
        const response = await fetch('/api/workshop-data/cantril-ladder', {
          credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success && result.data) {
          setFormData(result.data);
        }
      } catch (error) {
        console.error('Error loading reflection data:', error);
      }
    };
    
    loadExistingReflectionData();
  }, []);

  // Debounced save function for reflection text inputs
  const debouncedReflectionSave = useCallback(
    debounce(async (dataToSave) => {
      try {
        const response = await fetch('/api/workshop-data/cantril-ladder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(dataToSave)
        });
        
        const result = await response.json();
        if (result.success) {
          // console.log('Reflection data auto-saved successfully');
        }
      } catch (error) {
        console.error('Reflection auto-save failed:', error);
      }
    }, 1000),
    []
  );

  // Trigger reflection save when form data changes
  useEffect(() => {
    // Don't auto-save if workshop is locked
    if (workshopCompleted) {
      return;
    }
    
    if (Object.values(formData).some(value => value && typeof value === 'string' && value.trim().length > 0)) {
      debouncedReflectionSave(formData);
    }
  }, [formData, debouncedReflectionSave, workshopCompleted]);

  // Handle reflection text input changes
  const handleReflectionInputChange = (field: keyof CantrilFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationError && value.trim().length >= 10) {
      setValidationError('');
    }
  };

  // Function to populate with meaningful demo data for reflections
  const fillReflectionWithDemoData = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    const demoData = {
      currentFactors: "My current well-being is shaped by meaningful work that aligns with my strengths, supportive relationships with colleagues and family, good physical health through regular exercise, and financial stability. I feel energized when I can use my planning and analytical skills to solve complex problems.",
      futureImprovements: "In one year, I envision having greater autonomy in my role, leading a high-performing team that leverages everyone's strengths effectively, maintaining excellent work-life balance, and feeling confident about my career trajectory. I want to be recognized as a go-to person for strategic thinking and team development.",
      specificChanges: "I'll have more flexible work arrangements, be managing or mentoring team members, have completed a leadership development program, improved my public speaking skills, and established better boundaries between work and personal time. My stress levels will be lower and my sense of purpose higher.",
      quarterlyProgress: "I'll have initiated at least two process improvements using my analytical skills, received positive feedback on a leadership opportunity I've taken on, and established a consistent routine for professional development. I'll notice feeling more confident in meetings and decision-making.",
      quarterlyActions: "I will schedule monthly one-on-ones with my manager to discuss growth opportunities, sign up for a leadership workshop or online course, volunteer to lead a cross-functional project, and implement a weekly planning routine that aligns my daily work with my long-term goals."
    };
    
    setFormData(demoData);
  };

  const handleSave = async () => {
    // Validate that at least one reflection field is filled (minimum 10 characters)
    const validation = validateAtLeastOneField(formData, 10);
    
    if (!validation.isValid) {
      const errorMessage = validation.errors[0]?.message || 'Please complete at least one reflection to continue';
      setValidationError(errorMessage);
      return;
    }
    
    // Clear any validation error
    setValidationError('');
    setSaving(true);

    try {
      // Save wellbeing data
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

      // Also save reflection data
      await fetch('/api/workshop-data/cantril-ladder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      queryClient.invalidateQueries({ queryKey: ["/api/visualization"] });
      markStepCompleted("4-1");
      markStepCompleted("4-2"); // Also mark 4-2 as completed since we're combining both steps

      // Navigate to step 4-3 (Visualizing You) 
      setCurrentContent("visualizing-you");
    } catch (error) {
      console.error("Error saving well-being data:", error);
      // Navigate anyway even if save fails
      markStepCompleted("4-1");
      markStepCompleted("4-2");
      setCurrentContent("visualizing-you");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>


      {/* Workshop Completion Banner */}
      {workshopCompleted && (
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
                  {workshopCompleted && <span className="text-blue-600">🔒</span>}
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
                      onValueChange={workshopCompleted ? undefined : (values) => setWellBeingLevel(values[0])}
                      className={`py-2 ${workshopCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={workshopCompleted}
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
                  {workshopCompleted && <span className="text-green-600">🔒</span>}
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
                      onValueChange={workshopCompleted ? undefined : (values) =>
                        setFutureWellBeingLevel(values[0])
                      }
                      className={`py-2 ${workshopCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={workshopCompleted}
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

      {/* Well-being Reflection Questions Section */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Well-being Reflection Questions
        </h2>
        
        <p className="text-gray-700 mb-6">
          Now that you've set your well-being levels, take a few moments to reflect on the factors that 
          contribute to your current state and your vision for the future.
        </p>

        {/* Display all questions serially */}
        <div className="space-y-8">
          {cantrilQuestions.map((question, index) => (
            <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {/* Question header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {index + 1}. {question.question}
                </h3>
                <p className="text-gray-600 text-sm">
                  {question.description}
                </p>
              </div>

              {/* Text area */}
              <div className="mb-4">
                <textarea
                  value={formData[question.key]}
                  onChange={(e) => handleReflectionInputChange(question.key, e.target.value)}
                  disabled={workshopCompleted}
                  readOnly={workshopCompleted}
                  className={`w-full h-32 p-4 border border-gray-300 rounded-md resize-none ${
                    workshopCompleted ? 'opacity-60 cursor-not-allowed bg-gray-100' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder={question.placeholder}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Write 2-3 sentences about this reflection</span>
                  <span>{formData[question.key].length} characters</span>
                </div>
              </div>

              {/* Completion indicator */}
              {formData[question.key].trim().length > 0 && (
                <div className="flex items-center text-green-600 text-sm">
                  <span className="mr-1">✓</span>
                  Completed
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Demo button for test users */}
        {shouldShowDemoButtons && (
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fillReflectionWithDemoData}
              disabled={workshopCompleted}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <FileText className="w-4 h-4 mr-1" />
              Fill with Demo Data
            </Button>
          </div>
        )}

        {/* Progress summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Reflection Progress:</h4>
          <div className="flex flex-wrap gap-2">
            {cantrilQuestions.map((q, index) => (
              <span 
                key={q.id} 
                className={`text-xs px-2 py-1 rounded ${
                  formData[q.key].trim().length > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}. {q.title} {formData[q.key].trim().length > 0 ? '✓' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Validation error display */}
      {validationError && (
        <div className="mb-4">
          <ValidationMessage 
            message={validationError} 
            type="error" 
            show={!!validationError}
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || workshopCompleted}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {workshopCompleted 
            ? "Continue to Visualizing You"
            : saving 
              ? "Saving..." 
              : "Next: Visualizing You"
          } <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default WellBeingView;
