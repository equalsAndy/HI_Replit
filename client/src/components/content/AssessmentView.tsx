import React from 'react';
import { Button } from '@/components/ui/button';
// import { StarCard } from '@/shared/types';
import { ChevronRight, ClipboardCheck, CheckCircle, ArrowRight } from 'lucide-react';
import { AssessmentPieChart } from '@/components/assessment/AssessmentPieChart';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { useStarCardData } from '@/hooks/useStarCardData';
import { useFloatingAI } from '@/components/ai/FloatingAIProvider';

interface AssessmentViewProps {
  navigate: (to: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
  setIsAssessmentModalOpen: (isOpen: boolean) => void;
}

interface StarCard {
  state?: string;
  thinking?: number;
  acting?: number;
  feeling?: number;
  planning?: number;
}

const AssessmentView: React.FC<AssessmentViewProps & { starCard?: StarCard }> = React.memo(({
  navigate,
  markStepCompleted,
  setCurrentContent,
  setIsAssessmentModalOpen,
  starCard
}) => {
  // console.log('🔄 AssessmentView: Component rendered');

  // Use the shared StarCard data hook instead of custom fetching
  const { data: starCardData, isLoading: isLoadingAssessment, refetch } = useStarCardData();

  // console.log('🔄 AssessmentView: StarCard data from hook:', { starCardData, isLoadingAssessment });

  // REMOVED: All the custom refreshAssessmentData logic that was causing infinite loops

  // Listen for assessment completion events - stabilize with useCallback
  const handleAssessmentComplete = React.useCallback(() => {
    // console.log("Assessment completion event detected, refetching data...");
    setTimeout(() => refetch(), 500); // Small delay to ensure data is saved
  }, [refetch]);

  React.useEffect(() => {
    window.addEventListener('assessmentCompleted', handleAssessmentComplete);
    return () => window.removeEventListener('assessmentCompleted', handleAssessmentComplete);
  }, [handleAssessmentComplete]);

  // Use the starCardData directly to determine completion status - memoized to prevent loops
  const hasValidAssessmentData = React.useMemo(() => {
    return starCardData && starCardData.success !== false && (
      Number(starCardData.thinking) > 0 || 
      Number(starCardData.acting) > 0 || 
      Number(starCardData.feeling) > 0 || 
      Number(starCardData.planning) > 0
    );
  }, [starCardData]);

  // Use the fresh API data to determine completion status
  const isAssessmentComplete = hasValidAssessmentData;

  // Debug log to check assessment completion status (disabled to prevent spam)                              
  // console.log("Assessment completion check:", {
  //   hasStarCard: !!starCard,
  //   hasStarCardData: !!starCardData,
  //   hasValidAssessmentData,
  //   isComplete: isAssessmentComplete
  // });

  // Use the navigation hook for reliable navigation
  const { setCurrentStep, handleNextButtonClick, progress } = useNavigationProgress();
  
  // Get current step from progress state
  const currentStepId = progress.currentStepId || '1-1';

  // Use FloatingAI context to properly set step and disable AI for assessment step
  const { updateContext, setCurrentStep: setFloatingAIStep } = useFloatingAI();

  // Set FloatingAI context for step 1-1 (assessment) with AI disabled
  React.useEffect(() => {
    setFloatingAIStep('1-1');
    updateContext({
      stepName: 'Initial Assessment',
      strengthLabel: undefined,
      questionText: 'Complete your strengths assessment to discover your top strengths.',
      aiEnabled: false // Explicitly disable AI for assessment step
    });
  }, []); // Empty dependency array - only run once on mount
  
  const continueToNextStep = async () => {
    // console.log(`🎯 AssessmentView: Assessment complete, advancing from step ${currentStepId}`);
    // console.log(`🎯 AssessmentView: Current step is 2-2, should navigate to 2-3`);
    
    // Use the navigation hook's handleNextButtonClick for proper navigation
    const result = await handleNextButtonClick(currentStepId);
    if (result.success) {
      // console.log("✅ Successfully navigated to next step:", result.nextStepId);
      // Also manually set the current step to ensure navigation
      if (result.nextStepId) {
        setCurrentStep(result.nextStepId);
      }
    } else {
      console.error("❌ Navigation failed:", result.error);
    }
  };
  
  // Simple hardcoded button text for star card assessment
  const nextButtonText = "Next: Review Your Star Card";

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Strengths Assessment</h1>

      {!isAssessmentComplete ? (
        // Show introduction and start button if assessment is not complete
        <div className="prose max-w-none">
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm mb-6">
            <h3 className="font-medium text-blue-800 mb-3 text-lg">About this assessment</h3>
            <p className="text-blue-700 mb-3 text-sm">
              The AllStarTeams Strengths Assessment helps you discover your unique strengths profile across five key dimensions:
              Thinking, Acting, Feeling, Planning, and Imagining.
            </p>
            <div className="space-y-1 text-blue-700 text-sm">
              <div>• 22 short questions about how you approach work and collaboration</div>
              <div>• Takes approximately 10–15 minutes to complete</div>
              <div>• You'll order your responses from most like you (1) to least like you (4)</div>
              <div>• Generates your personal Star Card—a visual snapshot of your strengths</div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 shadow-sm mb-6">
            <h3 className="font-medium text-amber-800 mb-3 text-lg">Instructions</h3>
            <p className="text-amber-700 text-sm mb-3">
              For each scenario, drag and drop the four options to rank them from most like you (1) to least like you (4).
            </p>
            <div className="space-y-1 text-amber-700 text-sm">
              <div>• There are no right or wrong answers—just be honest about what feels true to you.</div>
              <div>• The four core strengths are quantified, color-coded, and placed on your Star Card based on your responses.</div>
              <div>• Your fifth strength, Imagination, is not ranked or measured here. It appears at the top of your Star Card—blank like a canvas, symbolizing your unique potential.</div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 shadow-sm mb-6">
            <h3 className="font-medium text-green-800 mb-2 text-lg flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> What you'll get
            </h3>
            <p className="text-green-700 text-sm mb-3">
              Your personal Star Card, showing how your four core strengths are distributed and ordered.
            </p>
            <div className="space-y-1 text-green-700 text-sm">
              <div>• Think, Act, Feel, and Plan are placed on the card based on how you use them.</div>
              <div>• Imagination appears at the apex, as your limitless fifth strength.</div>
            </div>
            <p className="text-green-700 text-sm mt-3">
              Later in the course, you'll complete your Star Card by adding your Flow State Qualities, making it a powerful tool for personal and team development.
            </p>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={() => setIsAssessmentModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
              size="lg"
            >
              {starCard?.state === 'partial' ? 'Continue Assessment' : 'Start Assessment'} <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : (
        // Show assessment results directly in the content view if completed
        <div className="prose max-w-none">
          <div className="bg-green-50 rounded-lg p-5 shadow-sm mb-8">
            <h3 className="font-medium text-green-800 mb-3 text-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" /> Assessment Complete
            </h3>
            <p className="text-green-700">
              Congratulations! You've completed the AllStarTeams Strengths Assessment. Here's your unique strengths profile.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Strengths Profile</h2>

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

            <div className="flex justify-end">
              <Button 
                onClick={async () => {
                  // console.log("🔥 NAVIGATION BUTTON CLICKED!");
                  // console.log("🔥 Current step ID:", currentStepId);
                  
                  try {
                    // Mark step 2-2 as completed first
                    // console.log("📝 Marking step 2-2 as completed...");
                    await markStepCompleted('2-2');
                    // console.log("✅ Step 2-2 marked as completed");
                    
                    // Wait a moment for the state to update
                    setTimeout(() => {
                      // console.log("🎯 Setting content to star-card-preview");
                      setCurrentContent('star-card-preview');
                      // console.log("✅ Navigation complete");
                    }, 100);
                  } catch (error) {
                    console.error("❌ Error in navigation:", error);
                    // Still navigate even if marking completion fails
                    setCurrentContent('star-card-preview');
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
                type="button"
              >
                {nextButtonText} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default AssessmentView;