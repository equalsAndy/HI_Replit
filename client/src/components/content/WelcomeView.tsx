import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '@/shared/types';
import { useSimpleNavigation } from '@/hooks/use-simple-navigation';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import VideoPlayer from './VideoPlayer';

interface WelcomeViewProps extends ContentViewProps {
  isImaginalAgility?: boolean;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  isImaginalAgility = false
}) => {
  // Different content based on which app is active
  const stepId = "1-1"; // Both workshops use 1-1 for the introduction step
  
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  const { updateVideoProgress, progress } = useSimpleNavigation();

  // Check if video progress already meets the NEW 5% threshold on component mount
  useEffect(() => {
    const currentProgress = progress?.videoProgress?.[stepId] || 0;
    if (currentProgress >= 5) { // Updated to 5% threshold
      setHasReachedMinimum(true);
      console.log(`🎬 WelcomeView: Found existing progress ${currentProgress.toFixed(2)}% >= 5%, enabling button`);
    }
  }, [progress?.videoProgress]);
  const title = isImaginalAgility 
    ? "Welcome to Imaginal Agility Workshop" 
    : "Welcome to AllStarTeams Workshop";

  const description = isImaginalAgility
    ? "Welcome to the Imaginal Agility workshop! This program will help you develop strategic imagination and navigate the Triple Challenge facing organizations today."
    : "Welcome to the AllStarTeams workshop! Through this journey, you'll discover your unique strengths profile and learn how to leverage it in your professional life.";

  const fallbackUrl = isImaginalAgility 
    ? "https://youtu.be/JxdhWd8agmE" 
    : "https://youtu.be/pp2wrqE8r2o";

  const videoTitle = isImaginalAgility
    ? "Imaginal Agility Workshop Introduction"
    : "AllStarTeams Workshop Introduction";

  const nextButton = isImaginalAgility
    ? "Next: The Triple Challenge"
    : "Next: Intro to Star Strengths";

  const nextContentId = isImaginalAgility
    ? "triple-challenge"
    : "intro-strengths";

  // Track last logged progress to prevent spam
  const lastLoggedProgressRef = useRef(0);
  
  // Testing bypass disabled - use proper video completion validation
  const [allowTestingBypass, setAllowTestingBypass] = useState(false);
  
  // Get navigation progress at component level
  const { progress: navigationProgress } = useNavigationProgress();
  
  // Calculate start time for video resume based on current position
  const calculateStartTime = (): number => {
    const videoPosition = getCurrentVideoPosition(stepId);
    
    // Convert percentage to seconds (assuming average video duration of 150 seconds)
    // Only resume if position is between 5% and 95% to avoid edge cases
    if (videoPosition >= 5 && videoPosition < 95) {
      const startTimeSeconds = (videoPosition / 100) * 150;
      console.log(`🎬 WelcomeView: Resuming from position ${videoPosition}% = ${startTimeSeconds} seconds`);
      return startTimeSeconds;
    }
    
    return 0; // Start from beginning
  };

  // Check if step meets completion criteria using dual-threshold system
  const isStepComplete = (): boolean => {
    return canProceedToNext(stepId);
  };
  
  // Handle video progress updates
  const handleVideoProgress = (percentage: number) => {
    // Correct interpretation: if value is between 0-1, it's a decimal that represents percentage
    let correctedPercentage = percentage;
    if (percentage > 0 && percentage <= 1) {
      correctedPercentage = percentage * 100;
      console.log(`🎬 Corrected video progress from ${percentage} to ${correctedPercentage}%`);
    }
    
    // Only log significant progress changes (every 10% or initial threshold)
    if (Math.abs(correctedPercentage - lastLoggedProgressRef.current) >= 10 || 
        (correctedPercentage >= 1 && !hasReachedMinimum)) {
      console.log(`🎬 WelcomeView video progress: ${correctedPercentage.toFixed(2)}%`);
      lastLoggedProgressRef.current = correctedPercentage;
    }
    
    // Update navigation progress tracking with corrected percentage
    console.log(`🎬 WelcomeView calling updateVideoProgress(${stepId}, ${correctedPercentage})`);
    updateVideoProgress(stepId, correctedPercentage);
    
    // Check if minimum watch requirement is met (5%)
    if (correctedPercentage >= 5 && !hasReachedMinimum) {
      console.log(`🎬 WelcomeView: Minimum threshold reached at ${correctedPercentage.toFixed(2)}%`);
      setHasReachedMinimum(true);
    }
  };

  // Handle completion and progression
  const handleNext = async () => {
    try {
      console.log(`🚀 Next button clicked for step: ${stepId}`);
      await markStepCompleted(stepId);
      console.log(`✅ Step ${stepId} marked complete, navigating to ${nextContentId}`);
      setCurrentContent(nextContentId);
    } catch (error) {
      console.error(`❌ Error completing step ${stepId}:`, error);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>

      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          {description}
        </p>

        {/* YouTube Video Player */}
        <div className="mb-8 max-w-4xl mx-auto">
          <VideoPlayer
            workshopType={isImaginalAgility ? "imaginal-agility" : "allstarteams"}
            stepId={stepId}
            fallbackUrl={fallbackUrl}
            title={videoTitle}
            aspectRatio="16:9"
            autoplay={true}
            onProgress={handleVideoProgress}
            startTime={calculateStartTime()}
          />
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">PART I: INDIVIDUAL MICRO COURSE (SELF-GUIDED)</h2>
            <p className="text-lg text-gray-700 mb-4">
              This self-paced experience is an opportunity for reflection and self-expression. Through several guided exercises and self-assessments, you will:
            </p>
            <ul className="space-y-2 mb-6 ml-6">
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-600 mr-3 mt-2"></div>
                <span>Discover your Star Strengths</span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-600 mr-3 mt-2"></div>
                <span>Identify your Flow State</span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-blue-600 mr-3 mt-2"></div>
                <span>Visualize your Professional Growth</span>
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Your Takeaways:</h3>
            <ul className="space-y-2 mb-8 ml-6">
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-green-600 mr-3 mt-2"></div>
                <span>A personalized Digital Star Card</span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-green-600 mr-3 mt-2"></div>
                <span>A personalized AI Holistic Profile Report</span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-green-600 mr-3 mt-2"></div>
                <span>Readiness for High-Impact Teamwork Practice</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">PART II: TEAMWORK PRACTICE (FACILITATED)</h2>
            <p className="text-lg text-gray-700 mb-6">
              Join your teammates in a guided session where you'll bring your insights to life.
            </p>
            <p className="text-lg text-gray-700 mb-8">
              Together, you'll align your strengths, deepen collaboration, and practice in real time using a shared digital whiteboard.
            </p>
          </>
        )}



        <div className="flex justify-end">
          <Button 
            onClick={handleNext}
            disabled={!isStepComplete() && !allowTestingBypass}
            className={`${(isStepComplete() || allowTestingBypass)
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            size="lg"
          >
            {(isStepComplete() || allowTestingBypass) ? nextButton : "Watch video to continue (5% minimum)"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default WelcomeView;