import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AstLessonContent from '@/components/ast/AstLessonContentPilot';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { useFloatingAI } from '@/components/ai/FloatingAIProvider';
import { AssessmentPieChart } from '@/components/assessment/AssessmentPieChart';
import StarCardWithFetch from '@/components/starcard/StarCardWithFetch';
import { CARD_WIDTH } from '@/components/starcard/starCardConstants';
import { useStarCardData } from '@/hooks/useStarCardData';
import StrengthReflections from './StrengthReflections';
import { ChevronRight } from 'lucide-react';

interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
  setIsAssessmentModalOpen?: (isOpen: boolean) => void;
  starCard?: any;
}

const StrengthsView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  setIsAssessmentModalOpen,
  starCard
}) => {
  // Persistent state for UI sections - but reset for fresh assessments
  const [showStarCardSection, setShowStarCardSection] = useState(false);
  
  // NEW: State for progressive revelation after star card
  const [showStrengthsButton, setShowStrengthsButton] = useState(false);
  const [showReflections, setShowReflections] = useState(false);
  
  // NEW: Pre-load reflection component invisibly
  const [preloadReflections, setPreloadReflections] = useState(false);
  
  // Track if we've loaded the saved state yet
  const [hasLoadedSavedState, setHasLoadedSavedState] = useState(false);
  
  const stepId = "2-1";
  const { updateVideoProgress } = useNavigationProgress();
  const { updateContext, setCurrentStep } = useFloatingAI();
  
  // Use the shared StarCard data hook
  const { data: starCardData, isLoading: isLoadingAssessment, refetch } = useStarCardData();

  // Check if assessment is completed - MOVED UP before useEffect that uses it
  const hasValidAssessmentData = React.useMemo(() => {
    return starCardData && starCardData.success !== false && (
      Number(starCardData.thinking) > 0 || 
      Number(starCardData.acting) > 0 || 
      Number(starCardData.feeling) > 0 || 
      Number(starCardData.planning) > 0
    );
  }, [starCardData]);

  const isAssessmentComplete = hasValidAssessmentData;

  // Load saved state only if assessment is already complete
  useEffect(() => {
    if (isAssessmentComplete && !hasLoadedSavedState) {
      const saved = localStorage.getItem('ast-star-card-visible');
      if (saved === 'true') {
        setShowStarCardSection(true);
      }
      setHasLoadedSavedState(true);
    }
  }, [isAssessmentComplete, hasLoadedSavedState]);

  // Save Star Card visibility to localStorage and trigger progressive loading
  useEffect(() => {
    if (hasLoadedSavedState) {
      localStorage.setItem('ast-star-card-visible', showStarCardSection.toString());
    }
    
    // NEW: Show "Let's talk about your strengths" button after star card is visible
    if (showStarCardSection) {
      setTimeout(() => {
        setShowStrengthsButton(true);
        // Pre-load reflections invisibly for faster display
        setPreloadReflections(true);
      }, 500); // Small delay for smooth transition
    }
  }, [showStarCardSection, hasLoadedSavedState]);

  // Update floating AI context
  useEffect(() => {
    setCurrentStep(stepId);
    updateContext({
      stepName: 'Intro to Star Strengths',
      aiEnabled: false,
      questionText: undefined,
      strengthLabel: undefined
    });
  }, [stepId, updateContext, setCurrentStep]);

  // Listen for assessment completion and reset progressive state
  const handleAssessmentComplete = React.useCallback(() => {
    // Reset progressive states for fresh flow
    setShowStarCardSection(false);
    setShowStrengthsButton(false);
    setShowReflections(false);
    setPreloadReflections(false);
    
    setTimeout(() => refetch(), 500);
  }, [refetch]);

  useEffect(() => {
    window.addEventListener('assessmentCompleted', handleAssessmentComplete);
    return () => window.removeEventListener('assessmentCompleted', handleAssessmentComplete);
  }, [handleAssessmentComplete]);



  // Handle video progress tracking
  const handleVideoProgress = (percentage: number) => {
    console.log(`🎬 StrengthsView calling updateVideoProgress(${stepId}, ${percentage})`);
    updateVideoProgress(stepId, percentage);
  };

  // Build strengths array for reflections
  const strengthsOrdered = React.useMemo(() => {
    if (!starCardData) return [];
    
    return [
      { key: 'thinking', label: 'Thinking', color: 'rgb(1,162,82)', score: Number(starCardData.thinking) || 0 },
      { key: 'acting', label: 'Acting', color: 'rgb(241,64,64)', score: Number(starCardData.acting) || 0 },
      { key: 'feeling', label: 'Feeling', color: 'rgb(22,126,253)', score: Number(starCardData.feeling) || 0 },
      { key: 'planning', label: 'Planning', color: 'rgb(255,203,47)', score: Number(starCardData.planning) || 0 }
    ].sort((a, b) => b.score - a.score);
  }, [starCardData]);

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Strengths</h1>

      <div className="prose max-w-none">
        {/* 1. Video at the top */}
        <div className="mb-8">
          <AstLessonContent stepId={stepId} />
        </div>

        {isLoadingAssessment ? (
          <div className="text-center py-12 text-gray-500">
            Loading assessment...
          </div>
        ) : !isAssessmentComplete ? (
          /* 2. Star Strengths Assessment (if not completed) */
          <div className="text-center">
            <h2 className="text-2xl font-bold mt-8 mb-4">Star Strengths Assessment</h2>
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
          <>
            {/* 3. Assessment Results with Pie Chart (when completed) */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Strengths Profile</h2>

              <p className="mb-6">
                Your assessment reveals your natural tendencies across four key dimensions. This profile 
                shows how you naturally approach challenges, collaborate with others, and engage in 
                your work.
              </p>

              {/* Pie Chart */}
              <div className="flex justify-center items-center w-full px-4 mb-6">
                <div className="w-full max-w-[800px] h-[350px] lg:h-[400px] mx-auto">
                  <AssessmentPieChart
                    thinking={starCardData?.thinking}
                    acting={starCardData?.acting}
                    feeling={starCardData?.feeling}
                    planning={starCardData?.planning}
                  />
                </div>
              </div>

              {/* Let's see your Star Card! button (only show if not already expanded) */}
              {!showStarCardSection && (
                <div className="flex justify-center">
                  <Button 
                    onClick={() => {
                      setShowStarCardSection(true);
                      setTimeout(() => {
                        document.getElementById('star-card-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
                  >
                    Let's see your Star Card!
                  </Button>
                </div>
              )}
            </div>

            {/* 4. Star Card and What It Means (when user clicks to see it) */}
            {showStarCardSection && (
              <div id="star-card-section" className="mt-8 bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Star Card */}
                  <div className="border border-gray-200 rounded-md overflow-hidden bg-white h-full">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-xl font-bold text-center">Your Star Card</h3>
                    </div>
                    <div className="flex justify-center" style={{ width: CARD_WIDTH, minWidth: CARD_WIDTH }}>
                      <StarCardWithFetch
                        fallbackData={{
                          thinking: starCardData?.thinking || 0,
                          acting: starCardData?.acting || 0,
                          feeling: starCardData?.feeling || 0,
                          planning: starCardData?.planning || 0,
                          imageUrl: starCardData?.imageUrl || null
                        }}
                      />
                    </div>
                  </div>

                  {/* What This Means */}
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
                    </div>
                  </div>
                </div>

                {/* NEW: Progressive Button: "Let's talk about your strengths" */}
                {showStrengthsButton && !showReflections && (
                  <div className="flex justify-center border-t border-gray-200 pt-8">
                    <Button 
                      onClick={() => {
                        setShowReflections(true);
                        setTimeout(() => {
                          document.getElementById('reflections-section')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
                    >
                      Let's talk about your strengths
                    </Button>
                  </div>
                )}

                {/* 5. Reflect on Your Strengths Component - Now with progressive revelation */}
                {showReflections && (
                  <div id="reflections-section" className="border-t border-gray-200 pt-8">
                    {/* Reflections Header */}
                    <div className="section-headers-tabs-60 mb-4">
                      <div className="section-headers-pill-60 section-headers-pill-60--reflection">
                        <div className="section-headers-pill-60__strip" aria-hidden="true" />
                        <div className="section-headers-pill-60__box">🤔 Reflections</div>
                      </div>
                    </div>

                    <StrengthReflections
                      strengths={strengthsOrdered.map((s, i) => ({ 
                        label: s.label, 
                        score: s.score, 
                        position: i + 1 
                      }))}
                      onComplete={() => {
                        // This will be handled by the StrengthReflections component
                        // It saves all data and navigates to flow-patterns
                      }}
                      setCurrentContent={setCurrentContent}
                      markStepCompleted={markStepCompleted}
                    />
                  </div>
                )}
                
                {/* NEW: Pre-load reflections invisibly for faster loading */}
                {preloadReflections && !showReflections && (
                  <div style={{ position: 'absolute', left: '-9999px', visibility: 'hidden', height: 0, overflow: 'hidden' }}>
                    <StrengthReflections
                      strengths={strengthsOrdered.map((s, i) => ({ 
                        label: s.label, 
                        score: s.score, 
                        position: i + 1 
                      }))}
                      onComplete={() => {}}
                      setCurrentContent={() => {}}
                      markStepCompleted={() => {}}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default StrengthsView;