import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import VideoPlayer from './VideoPlayer';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { useFloatingAI } from '@/components/ai/FloatingAIProvider';
import { AssessmentPieChart } from '@/components/assessment/AssessmentPieChart';
import { useStarCardData } from '@/hooks/useStarCardData';
import { CheckCircle, ArrowRight, ChevronRight } from 'lucide-react';

interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
  setIsAssessmentModalOpen?: (isOpen: boolean) => void;
}

const IntroStrengthsView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  setIsAssessmentModalOpen
}) => {
  const [hasReachedMinimum, setHasReachedMinimum] = useState(true); // Simplified: always true
  const stepId = "2-1";
  const { updateVideoProgress, progress, canProceedToNext } = useNavigationProgress();
  const { updateContext, setCurrentStep } = useFloatingAI();
  
  // Use the shared StarCard data hook to check assessment completion
  const { data: starCardData, isLoading: isLoadingAssessment, refetch } = useStarCardData();

  // Update floating AI context for this step
  useEffect(() => {
    setCurrentStep(stepId);
    updateContext({
      stepName: 'Intro to Star Strengths',
      aiEnabled: false, // AI disabled for video content
      questionText: undefined,
      strengthLabel: undefined
    });
  }, [stepId, updateContext, setCurrentStep]);

  // Listen for assessment completion events to refresh data
  const handleAssessmentComplete = React.useCallback(() => {
    setTimeout(() => refetch(), 500); // Small delay to ensure data is saved
  }, [refetch]);

  useEffect(() => {
    window.addEventListener('assessmentCompleted', handleAssessmentComplete);
    return () => window.removeEventListener('assessmentCompleted', handleAssessmentComplete);
  }, [handleAssessmentComplete]);

  // Check if assessment is completed
  const hasValidAssessmentData = React.useMemo(() => {
    return starCardData && starCardData.success !== false && (
      Number(starCardData.thinking) > 0 || 
      Number(starCardData.acting) > 0 || 
      Number(starCardData.feeling) > 0 || 
      Number(starCardData.planning) > 0
    );
  }, [starCardData]);

  const isAssessmentComplete = hasValidAssessmentData;

  // Simplified mode: Next button always active for video steps
  useEffect(() => {
    setHasReachedMinimum(true);
    console.log(`🔍 SIMPLIFIED VALIDATION: Step ${stepId}`);
    console.log(`✅ SIMPLIFIED MODE: Next button always active for ${stepId}`);
  }, [stepId]);

  // Handle video progress - still track but don't use for validation
  const handleVideoProgress = (percentage: number) => {
    console.log(`🎬 IntroStrengthsView calling updateVideoProgress(${stepId}, ${percentage})`);
    updateVideoProgress(stepId, percentage);
    console.log(`🎬 VIDEO PROGRESS TRACKED (SIMPLIFIED MODE - not used for unlocking): ${stepId} = ${percentage}%`);
  };

  // Handle completion and progression
  const handleNext = () => {
    markStepCompleted(stepId);
    if (isAssessmentComplete) {
      setCurrentContent("star-card-preview");
    } else {
      setCurrentContent("strengths-assessment");
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Intro to Strengths</h1>

      <div className="prose max-w-none">
        {/* Video Player */}
        <div className="mb-8">
          <VideoPlayer
            workshopType="allstarteams"
            stepId="2-1"
            fallbackUrl="https://youtu.be/TN5b8jx7KSI"
            title="Intro to Star Strengths"
            aspectRatio="16:9"
            autoplay={true}
            onProgress={handleVideoProgress}
          />
        </div>

        {!isAssessmentComplete ? (
          // Show simple assessment launch if not completed
          <div className="text-center">
            <h2 className="text-2xl font-bold mt-8 mb-4">Ready to discover your strengths?</h2>
            <p className="mb-6 text-gray-700">
              Take the AllStarTeams Strengths Assessment to discover your unique profile across the four core dimensions.
            </p>
            
            <div className="flex justify-center mb-8">
              <Button 
                onClick={() => setIsAssessmentModalOpen && setIsAssessmentModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
                size="lg"
              >
                Start Assessment <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          // Show assessment results inline if completed
          <div className="prose max-w-none">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Here is Your Strengths Profile</h2>

              <p className="mb-6">
                Your assessment reveals your natural tendencies across four key dimensions. This profile 
                shows how you naturally approach challenges, collaborate with others, and engage in 
                your work. The AllStarTeams workshop activities will help you explore these dimensions in depth.
              </p>

              {/* Yellow Star */}
              <div className="flex justify-center mb-2">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-400">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
              </div>

              <div className="flex justify-center items-center w-full px-4">
                <div className="w-full max-w-[800px] h-[350px] lg:h-[400px] mx-auto">
                  <AssessmentPieChart
                    thinking={starCardData?.thinking}
                    acting={starCardData?.acting}
                    feeling={starCardData?.feeling}
                    planning={starCardData?.planning}
                  />
                </div>
              </div>

              {/* Imagination Legend */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-2 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <span className="font-semibold">Imagination</span>
                  <span className="ml-3 text-gray-600 text-sm">Your limitless potential capacity that brings<br className="hidden sm:inline" /> the other core dimensions into focus.</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-3">
                  {(() => {
                    // Use the assessment results directly (they are already percentages)
                    const thinking = Number(starCardData?.thinking);
                    const planning = Number(starCardData?.planning);
                    const feeling = Number(starCardData?.feeling);
                    const acting = Number(starCardData?.acting);

                    // Create and sort data using the percentage values directly
                    return [
                      { name: 'Thinking', value: thinking, color: 'rgb(1,162,82)', desc: 'Analytical & logical approach' },
                      { name: 'Planning', value: planning, color: 'rgb(255,203,47)', desc: 'Organized & methodical' },
                      { name: 'Feeling', value: feeling, color: 'rgb(22,126,253)', desc: 'Empathetic & relationship-focused' },
                      { name: 'Acting', value: acting, color: 'rgb(241,64,64)', desc: 'Decisive & action-oriented' }
                    ]
                      .sort((a, b) => b.value - a.value)
                      .map(strength => (
                        <div key={strength.name} className="flex items-center">
                          <div className="w-5 h-5 rounded mr-3" style={{ backgroundColor: strength.color }}></div>
                          <span className="font-semibold">{strength.name}: {strength.value}%</span>
                          <span className="ml-3 text-gray-600 text-sm"> - {strength.desc}</span>
                        </div>
                      ));
                  })()
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleNext}
            disabled={!hasReachedMinimum}
            className={`${
              hasReachedMinimum 
                ? "bg-indigo-700 hover:bg-indigo-800 text-white" 
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }`}
          >
            {isAssessmentComplete
              ? "Next: Review Your Star Card" 
              : hasReachedMinimum 
                ? "Continue" 
                : "Watch video to continue (5% minimum)"
            }
          </Button>
        </div>
      </div>
    </>
  );
};

export default IntroStrengthsView;