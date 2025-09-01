import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import VideoPlayer from './VideoPlayer';
import AstLessonContent from '@/components/ast/AstLessonContentPilot';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { useFloatingAI } from '@/components/ai/FloatingAIProvider';
import { AssessmentPieChart } from '@/components/assessment/AssessmentPieChart';
import StarCardWithFetch from '@/components/starcard/StarCardWithFetch';
import { CARD_WIDTH } from '@/components/starcard/starCardConstants';
import { useStarCardData } from '@/hooks/useStarCardData';
import ReflectionView from '@/components/content/ReflectionView';
import { CheckCircle, ArrowRight, ChevronRight } from 'lucide-react';

interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
  setIsAssessmentModalOpen?: (isOpen: boolean) => void;
  starCard?: any;
}

const IntroStrengthsView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  setIsAssessmentModalOpen,
  starCard
}) => {
  const [showStarCardSection, setShowStarCardSection] = useState(false);
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



  // Handle video progress - still track but don't use for validation
  const handleVideoProgress = (percentage: number) => {
    console.log(`🎬 IntroStrengthsView calling updateVideoProgress(${stepId}, ${percentage})`);
    updateVideoProgress(stepId, percentage);
    console.log(`🎬 VIDEO PROGRESS TRACKED (SIMPLIFIED MODE - not used for unlocking): ${stepId} = ${percentage}%`);
  };

  // Handle completion and progression
  const handleNext = () => {
    markStepCompleted(stepId);
    // Always go to strengths-assessment (2-2) since we show Star Card inline now
    setCurrentContent("strengths-assessment");
  };

  // Build strengths array in descending order for reflections
  const strengthsOrdered = [
    { key: 'thinking', label: 'Thinking', color: 'rgb(1,162,82)', score: Number(starCardData?.thinking) || 0 },
    { key: 'acting', label: 'Acting', color: 'rgb(241,64,64)', score: Number(starCardData?.acting) || 0 },
    { key: 'feeling', label: 'Feeling', color: 'rgb(22,126,253)', score: Number(starCardData?.feeling) || 0 },
    { key: 'planning', label: 'Planning', color: 'rgb(255,203,47)', score: Number(starCardData?.planning) || 0 }
  ].sort((a, b) => b.score - a.score);

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Intro to Strengths</h1>

      <div className="prose max-w-none">
        {/* Video Player */}
        <div className="mb-8">
          <AstLessonContent stepId={stepId} />
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

              {/* Let's see your Star Card button */}
              {!showStarCardSection && (
              <div className="flex justify-center mb-8">
                <Button 
                  onClick={() => {
                    setShowStarCardSection(true);
                    // Scroll to the star card section after a brief delay
                    setTimeout(() => {
                      document.getElementById('star-card-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
                >
                  Let's see your Star Card
                </Button>
              </div>
              )}
            </div>
          </div>
        )}

        {/* Star Card Section - Only show if assessment is complete and user clicked to see it */}
        {isAssessmentComplete && showStarCardSection && (
          <div id="star-card-section" className="mt-8 bg-gray-50 rounded-lg p-6">
            {console.log('🎯 DEBUGGING: Star Card section is rendering with updated structure')}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left side - Star Card exactly like AST 2-3 */}
              <div className="border border-gray-200 rounded-md overflow-hidden bg-white h-full">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-xl font-bold text-center">Your Star Card</h3>
                </div>
                <div className="flex justify-center" style={{ width: CARD_WIDTH, minWidth: CARD_WIDTH }}>
                  <StarCardWithFetch
                    fallbackData={{
                      thinking: starCardData?.thinking || starCard?.thinking || 0,
                      acting: starCardData?.acting || starCard?.acting || 0,
                      feeling: starCardData?.feeling || starCard?.feeling || 0,
                      planning: starCardData?.planning || starCard?.planning || 0,
                      imageUrl: starCardData?.imageUrl || starCard?.imageUrl || null
                    }}
                  />
                </div>
              </div>

              {/* Right side - What This Means explanation */}
              <div className="border border-gray-200 rounded-md overflow-hidden bg-white h-full p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What This Means</h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Your Star Card is a visual representation of your unique strengths profile. Each color and position on the card represents how you naturally approach different aspects of work and life.
                  </p>
                  <p><strong>The Four Core Dimensions:</strong></p>
                  <ul className="space-y-2 ml-4">
                    <li>• <span className="font-semibold" style={{ color: 'rgb(1,162,82)' }}>Thinking</span> - Your analytical and logical approach</li>
                    <li>• <span className="font-semibold" style={{ color: 'rgb(241,64,64)' }}>Acting</span> - Your decisive and action-oriented nature</li>
                    <li>• <span className="font-semibold" style={{ color: 'rgb(22,126,253)' }}>Feeling</span> - Your empathetic and relationship-focused tendencies</li>
                    <li>• <span className="font-semibold" style={{ color: 'rgb(255,203,47)' }}>Planning</span> - Your organized and methodical qualities</li>
                  </ul>
                  <p>
                    The size and position of each section show your relative strength in that dimension. This profile helps you understand your natural preferences and how you can leverage these strengths in your personal and professional development.
                  </p>
                  <p className="text-sm text-gray-500 italic">
                    In the next steps of the workshop, you'll explore how to apply these insights and add your Flow State Qualities to complete your Star Card.
                  </p>
                </div>
              </div>
            </div>

            {/* Full reflection flow */}
            <ReflectionView
              navigate={navigate}
              markStepCompleted={markStepCompleted}
              setCurrentContent={setCurrentContent}
              starCard={starCardData}
            />
          </div>
        )}


        <div className="flex justify-end mt-6">
          <Button
            onClick={handleNext}
            disabled={!showStarCardSection}
            className={`${
              showStarCardSection
                ? "bg-indigo-700 hover:bg-indigo-800 text-white"
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }`}
          >
            Continue
          </Button>
        </div>
      </div>
    </>
  );
};

export default IntroStrengthsView;
