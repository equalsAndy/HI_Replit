import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { trpc } from "@/utils/trpc";
import '@/styles/section-headers.css';

interface SelfAwarenessOpportunityViewProps {
  navigate?: any;
  markStepCompleted?: (stepId: string) => void;
  setCurrentContent?: (content: string) => void;
}

const SelfAwarenessOpportunityView: React.FC<SelfAwarenessOpportunityViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const stepId = "1-2";
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  
  // Fetch video from database using tRPC
  const { data: videoData, isLoading: videoLoading, error } = trpc.lesson.byStep.useQuery({
    workshop: 'allstarteams',
    stepId,
  });
  
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

  const title = "The Self-Awareness Opportunity";
  const description = "Discover the science behind human flourishing and how it applies to understanding your strengths and potential.";
  
  // Video will be loaded from database using stepId 1-2
  const fallbackUrl = "https://youtu.be/7__r4FVj-EI";
  const videoTitle = "The Self-Awareness Opportunity";
  const nextButton = "Next: About this Course";
  const nextContentId = "about-course";

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
      console.log(`🎬 SelfAwarenessOpportunityView: Resuming from ${progressNumber}% = ${startTimeSeconds} seconds`);
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
      console.log(`🎬 SelfAwarenessOpportunityView video progress: ${percentage.toFixed(2)}%`);
      lastLoggedProgressRef.current = percentage;
    }
    
    // Update navigation progress tracking with actual percentage
    console.log(`🎬 SelfAwarenessOpportunityView calling updateVideoProgress(${stepId}, ${percentage})`);
    updateVideoProgress(stepId, percentage);
    
    // Check if minimum watch requirement is met (5%)
    if (percentage >= 5 && !hasReachedMinimum) {
      console.log(`🎬 SelfAwarenessOpportunityView: Minimum threshold reached at ${percentage.toFixed(2)}%`);
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

        {/* YouTube Video with Read/Transcript tabs */}
        <div className="mb-8 max-w-4xl mx-auto">
          {videoLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading video...</span>
            </div>
          ) : error ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
              Error loading video. Using fallback.
            </div>
          ) : videoData ? (
            <VideoTranscriptGlossary
              youtubeId={videoData.youtubeId}
              title={videoData.title}
              transcriptMd={videoData.transcriptMd}
              glossary={videoData.glossary ?? []}
            />
          ) : (
            <VideoTranscriptGlossary
              youtubeId={fallbackUrl}
              title={videoTitle}
            />
          )}
        </div>

        {/* AST 1-2 sections: Content, Reflection */}
        <div className="section-headers-tabs-60 mt-16 mb-4">
          <div className="section-headers-pill-60 section-headers-pill-60--content">
            <div className="section-headers-pill-60__strip" aria-hidden="true" />
            <div className="section-headers-pill-60__box">📚 Some Things to Know</div>
          </div>
        </div>
        <div className="section-content-card-60 section-content-card-60--content relative">
          <div
            className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 z-10"
            style={{ marginLeft: '-8px' }}
          >
            <div
              className="text-xs font-bold text-purple-600 bg-purple-50 px-0.5 py-1 rounded text-center"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', letterSpacing: '0.1em' }}
            >
              📚 Some Things to Know
            </div>
          </div>
          <div className="section-content-card-60__strip" aria-hidden="true" />
          <div className="section-content-card-60__box">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Concepts in Self-Awareness</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                <span className="text-base text-gray-700"><strong>Strengths-based approach:</strong> Focus on what you do well naturally</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                <span className="text-base text-gray-700"><strong>Flow state:</strong> When you're fully engaged and performing at your best</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                <span className="text-base text-gray-700"><strong>Growth mindset:</strong> Believing abilities can be developed through effort</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                <span className="text-base text-gray-700"><strong>Well-being:</strong> More than happiness - includes meaning and accomplishment</span>
              </li>
            </ul>
          </div>
        </div>


        <div className="flex justify-end items-center space-x-4">
          <Button
            onClick={handleNext}
            disabled={!isStepComplete()}
            className={`${isStepComplete()
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {nextButton}
          </Button>
        </div>
      </div>
    </>
  );
};

export default SelfAwarenessOpportunityView;