import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { trpc } from "@/utils/trpc";

interface AboutCourseViewProps {
  navigate?: any;
  markStepCompleted?: (stepId: string) => void;
  setCurrentContent?: (content: string) => void;
}

const AboutCourseView: React.FC<AboutCourseViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const stepId = "1-3";
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  
  // Fetch all videos for this step from database using tRPC
  const { data: allVideosData, isLoading: videosLoading, error: videosError } = trpc.lesson.allByStep.useQuery({
    workshop: 'allstarteams',
    stepId,
  });

  // Extract first and second videos from the array
  const firstVideoData = allVideosData?.[0];
  const secondVideoData = allVideosData?.[1];
  
  // Get navigation progress using the main hook
  const { 
    progress: navigationProgress, 
    updateVideoProgress,
    markStepCompleted: navMarkStepCompleted
  } = useNavigationProgress();

  // Simplified mode: Next button always active for video steps
  useEffect(() => {
    setHasReachedMinimum(true);
    console.log(`🎬 SIMPLIFIED MODE: Next button always active for video step ${stepId}`);
  }, [stepId]);

  const title = "About this Course";
  const description = "Learn about the AllStarTeams approach and what you can expect from this comprehensive program.";
  
  // Video will be loaded from database using stepId 1-3
  const fallbackUrl = "https://youtu.be/sampleVideoId123";
  const videoTitle = "About the AllStarTeams Course";
  const nextButton = "Next: Star Strengths Assessment";
  const nextContentId = "star-strengths-assessment";

  // Track last logged progress to prevent spam
  const lastLoggedProgressRef = useRef(0);

  // Calculate start time for video resume based on current progress
  const calculateStartTime = (): number => {
    const videoProgress = navigationProgress?.videoProgress?.[stepId] || 0;
    
    // Convert percentage to seconds (assuming average video duration of 150 seconds)
    // Only resume if progress is between 5% and 95% to avoid edge cases
    const progressNumber = typeof videoProgress === 'number' ? videoProgress : 0;
    if (progressNumber >= 5 && progressNumber < 95) {
      const startTimeSeconds = (progressNumber / 100) * 150;
      console.log(`🎬 AboutCourseView: Resuming from ${progressNumber}% = ${startTimeSeconds} seconds`);
      return startTimeSeconds;
    }
    
    return 0; // Start from beginning
  };

  // Simplified linear progression: Next button always active for video steps
  const isStepComplete = (): boolean => {
    console.log(`🔍 SIMPLIFIED VALIDATION: Step ${stepId}`);
    console.log(`✅ SIMPLIFIED MODE: Next button always active for ${stepId}`);
    return true;
  };
  
  // Handle video progress updates
  const handleVideoProgress = (percentage: number) => {
    // Only log significant progress changes (every 10% or initial threshold)
    if (Math.abs(percentage - lastLoggedProgressRef.current) >= 10 || 
        (percentage >= 1 && !hasReachedMinimum)) {
      console.log(`🎬 AboutCourseView video progress: ${percentage.toFixed(2)}%`);
      lastLoggedProgressRef.current = percentage;
    }
    
    // Update navigation progress tracking with actual percentage
    console.log(`🎬 AboutCourseView calling updateVideoProgress(${stepId}, ${percentage})`);
    updateVideoProgress(stepId, percentage);
    
    // Check if minimum watch requirement is met (5%)
    if (percentage >= 5 && !hasReachedMinimum) {
      console.log(`🎬 AboutCourseView: Minimum threshold reached at ${percentage.toFixed(2)}%`);
      setHasReachedMinimum(true);
    }
  };

  // Handle completion and progression
  const handleNext = async () => {
    try {
      console.log(`🚀 Next button clicked for step: ${stepId}`);
      
      // Try both markStepCompleted functions - props first, then navigation hook
      if (markStepCompleted) {
        await markStepCompleted(stepId);
        console.log(`✅ Step ${stepId} marked complete via props, navigating to ${nextContentId}`);
      } else if (navMarkStepCompleted) {
        await navMarkStepCompleted(stepId);
        console.log(`✅ Step ${stepId} marked complete via navigation hook, navigating to ${nextContentId}`);
      } else {
        console.log(`⚠️ No markStepCompleted function available`);
      }
      
      if (setCurrentContent) {
        setCurrentContent(nextContentId);
        // Scroll to content title anchor when navigating to next content
        setTimeout(() => {
          const anchor = document.getElementById('content-title');
          if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } catch (error) {
      console.error(`❌ Error completing step ${stepId}:`, error);
    }
  };

  return (
    <>
      <h1 id="content-title" className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>

      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          {description}
        </p>

        {/* First YouTube Video with Read/Transcript tabs */}
        <div className="mb-8 max-w-4xl mx-auto">
          {videosLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading videos...</span>
            </div>
          ) : videosError ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
              Error loading videos. Using fallback.
            </div>
          ) : firstVideoData ? (
            <VideoTranscriptGlossary
              youtubeId={firstVideoData.youtubeId}
              title={firstVideoData.title}
              transcriptMd={firstVideoData.transcriptMd}
              glossary={firstVideoData.glossary ?? []}
            />
          ) : (
            <VideoTranscriptGlossary
              youtubeId={fallbackUrl}
              title={videoTitle}
            />
          )}
        </div>

        <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">What Makes AllStarTeams Different</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
              <span className="text-base text-gray-700"><strong>Strengths-focused:</strong> We focus on what you do best, not what you need to fix</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
              <span className="text-base text-gray-700"><strong>Science-backed:</strong> Based on positive psychology and flow research</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
              <span className="text-base text-gray-700"><strong>Practical application:</strong> Tools you can use immediately in work and life</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
              <span className="text-base text-gray-700"><strong>Team-oriented:</strong> Designed to improve collaboration and teamwork</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">Your Learning Journey</h2>
          <p className="text-base text-gray-700 mb-4">
            This course is designed as a progressive journey. Each module builds on the previous one, creating a comprehensive understanding of your strengths, flow states, and potential.
          </p>
          <p className="text-base text-gray-700 mb-4">
            <strong>Module 1:</strong> Foundation and mindset (where you are now)
          </p>
          <p className="text-base text-gray-700 mb-4">
            <strong>Module 2:</strong> Discovery of your unique strengths and flow patterns
          </p>
          <p className="text-base text-gray-700 mb-4">
            <strong>Module 3:</strong> Integration and future visioning
          </p>
          <p className="text-base text-gray-700">
            <strong>Modules 4 & 5:</strong> Application and continued growth resources
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">What You'll Create</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
              <span className="text-base text-gray-700">Your personalized Digital Star Card</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
              <span className="text-base text-gray-700">A comprehensive understanding of your flow states</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
              <span className="text-base text-gray-700">A clear vision of your future self and goals</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
              <span className="text-base text-gray-700">AI-generated holistic report of your profile</span>
            </li>
          </ul>
        </div>

        {/* Second Video */}
        <div className="mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Course Deep Dive</h2>
          {videosLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading second video...</span>
            </div>
          ) : videosError && !secondVideoData ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900 mb-4">
              <p className="font-semibold mb-2">⚠️ Error loading second video from database:</p>
              <p className="text-sm mb-4">{videosError?.message || 'Unknown error'}</p>
              <p className="text-sm">Using fallback video with YouTube ID: bnHjo3hJCsM</p>
            </div>
          ) : null}

          {/* Show the second video from database or fallback */}
          {secondVideoData ? (
            <VideoTranscriptGlossary
              youtubeId={secondVideoData.youtubeId}
              title={secondVideoData.title}
              transcriptMd={secondVideoData.transcriptMd}
              glossary={secondVideoData.glossary ?? []}
            />
          ) : !videosLoading ? (
            <VideoTranscriptGlossary
              youtubeId="bnHjo3hJCsM"
              title="Course Deep Dive"
            />
          ) : null}
        </div>

        <div className="flex justify-end items-center space-x-4">
          <Button
            onClick={handleNext}
            disabled={!isStepComplete()}
            className={`${isStepComplete()
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            size="lg"
          >
            {isStepComplete() ? nextButton : "Watch video to continue (5% minimum)"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AboutCourseView;
