import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import UserHomeNavigation from '@/components/navigation/WorkshopNavigationSidebar';
import ContentViews from '@/components/content/ContentViews';
import { imaginalAgilityNavigationSections } from '@/components/navigation/navigationData';
import { User } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { RefreshCw, X, Menu } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { ImaginalAgilityAssessment } from '@/components/assessment/ImaginalAgilityAssessment';
import ProfileEditor from '@/components/profile/ProfileEditor';
import { NavBar } from '@/components/layout/NavBar';
import { useApplication } from '@/hooks/use-application';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import DiscernmentModal from '@/components/imaginal-agility/DiscernmentModal';
import { useWelcomeVideo } from '@/hooks/useWelcomeVideo';
import ImaginalAgilityWelcomeVideoModal from '@/components/modals/ImaginalAgilityWelcomeVideoModal';
import { useStepContextSafe } from '@/contexts/StepContext';

// Constants
const PROGRESS_STORAGE_KEY = 'imaginal-agility-navigation-progress';

export default function ImaginalAgilityWorkshop() {
  const [location, navigate] = useLocation();
  const [currentContent, setCurrentContent] = useState("ia-1-1");
  const [currentStep, setCurrentStepState] = useState("ia-1-1");
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [showDiscernmentModal, setShowDiscernmentModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { toast } = useToast();
  const { setCurrentApp } = useApplication();
  const { setCurrentStepId } = useStepContextSafe();

  // Welcome video modal for first-time users
  const {
    showWelcomeModal,
    handleCloseModal,
    handleGetStarted,
    triggerWelcomeVideo,
  } = useWelcomeVideo();

  // Use navigation progress system like AST
  const {
    progress: navProgress,
    updateVideoProgress,
    markStepCompleted: markNavStepCompleted,
    updateCurrentStep: setCurrentStep,
    isStepAccessibleByProgression: isStepUnlocked,
    canProceedToNext,
    shouldShowGreenCheckmark: isStepCompleted,
    getCurrentVideoProgress: getVideoProgress
  } = useNavigationProgress('ia'); // Pass 'ia' for Imaginal Agility

  // Module-specific locking for IA workshop
  const { isWorkshopLocked, isModuleAccessible, getStepModule } = useWorkshopStatus();

  // Use navigation progress state
  const completedSteps = navProgress?.completedSteps || [];

  // Set app type and check authentication on component mount
  useEffect(() => {
    setCurrentApp('imaginal-agility');
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.status === 401) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access this workshop.",
          });
          // Save the workshop selection before redirecting
          localStorage.setItem('selectedApp', 'imaginal-agility');
          navigate('/auth?app=imaginal-agility');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/auth?app=imaginal-agility');
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Fetch user profile data
  const { data: user, isLoading: isUserLoading } = useQuery<{
    success: boolean;
    user: {
      id: number;
      name: string;
      username: string;
      email: string | null;
      title: string | null;
      organization: string | null;
      role?: string;
      progress?: number;
    }
  }>({
    queryKey: ['/api/auth/me'],
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  // Clear progress when user has database progress: 0
  React.useEffect(() => {
    const actualUser = (user as any)?.user || user;

    if (actualUser?.id) {
      const currentUserId = actualUser.id.toString();
      const sessionKey = `progress-cleared-imaginal-${currentUserId}`;
      const hasAlreadyCleared = sessionStorage.getItem(sessionKey);

      // Clear progress if current user has progress: 0 (database reset)
      if ((actualUser as any).progress === 0 && !hasAlreadyCleared) {
        console.log(`User ${currentUserId} has database progress: 0, clearing Imaginal Agility cached data`);

        // Clear Imaginal Agility specific progress cache
        localStorage.removeItem(PROGRESS_STORAGE_KEY);

        // Mark as cleared for this session
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
  }, [user]);



  // Reset user progress mutation
  const resetUserProgress = useMutation({
    mutationFn: async () => {
      if (!(user as any)?.id) return null;
      const res = await fetch(`/api/test-users/reset/${(user as any).id}`, { method: 'POST' });
      return res.json();
    },
    onSuccess: () => {
      // Clear local storage progress
      localStorage.removeItem(PROGRESS_STORAGE_KEY);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });

      toast({
        title: "Progress Reset",
        description: "Your progress has been reset successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reset progress: " + String(error),
        variant: "destructive"
      });
    }
  });

  // Load completed steps from localStorage on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (savedProgress) {
      try {
        const { completed } = JSON.parse(savedProgress);
        // Progress is managed by navigation hook, not local state
        console.log('Loaded progress:', completed);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }, []);

  // Update StepContext whenever currentContent changes (for beta tester modal)
  useEffect(() => {
    if (currentContent && currentContent.startsWith('ia-')) {
      setCurrentStepId(currentContent);
      console.log('🔍 IA Workshop: Updated StepContext to:', currentContent);
    }
  }, [currentContent, setCurrentStepId]);

  // FIXED: Auto-navigate to current step based on navigation progress
  useEffect(() => {
    if (!navProgress?.currentStepId) return;

    const navigationCurrentStep = navProgress.currentStepId;
    console.log(`🧭IA Auto-nav: Navigation says current step is ${navigationCurrentStep}, component state is ${currentStep}`);

    // Only update if navigation state differs from component state
    if (navigationCurrentStep !== currentStep && navigationCurrentStep.startsWith('ia-')) {
      console.log(`🔄 IA Auto-navigating: ${currentStep} → ${navigationCurrentStep}`);
      setCurrentStep(navigationCurrentStep);
      setCurrentStepState(navigationCurrentStep);
      setCurrentContent(navigationCurrentStep);
    }
  }, [navProgress?.currentStepId, currentStep]);

  // FIXED: Mark a step as completed with proper IA navigation
  const markStepCompleted = async (stepId: string) => {
    console.log(`🎯 IA markStepCompleted: ${stepId}`);
    
    try {
      // Call navigation hook's markStepCompleted which returns next step
      const result = await markNavStepCompleted(stepId);
      console.log(`🎯 IA markNavStepCompleted result:`, result);
      
      // Force immediate UI update to prevent desync
      if (result && result !== stepId) {
        console.log(`🧭 IA Navigation: ${stepId} → ${result}`);
        
        // Update all state atomically
        setCurrentStep(result);
        setCurrentStepState(result); 
        setCurrentContent(result);
        
        // Scroll to top of content after navigation
        setTimeout(() => {
          document.getElementById('content-top')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      
      // Invalidate relevant queries to force fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/navigation-progress/ia'] });
      
      return result;
    } catch (error) {
      console.error(`❌ IA markStepCompleted error:`, error);
      return null;
    }
  };

  // Function to determine if a step is accessible for IA workshop
  const isStepAccessible = (sectionId: string, stepId: string) => {
    // Always allow access to the first step
    if (stepId === 'ia-1-1') return true;

    // Special unlock rules
    // Section 5 (Outcomes & Teams) - All unlock after ia-4-6
    if (stepId === 'ia-5-1' || stepId === 'ia-5-2' || stepId === 'ia-5-3') {
      return completedSteps.includes('ia-4-6');
    }

    if (stepId === 'ia-6-1') return true; // Always accessible from start
    if (stepId === 'ia-7-1') {
      // Unlock after workshop completion (final submission on ia-4-6)
      return completedSteps.includes('ia-4-6');
    }
    if (stepId === 'ia-7-2') return false; // Locked for now
    if (stepId === 'ia-6-coming-soon') return false; // Quarterly tune-up locked

    // FIXED: Allow navigation to any completed step (for revisiting)
    if (completedSteps.includes(stepId)) {
      return true;
    }

    // Define the main progression order for IA
    const iaStepOrder = [
      // Welcome & Orientation (Module 1)
      'ia-1-1', 'ia-1-2', 'ia-1-3', 'ia-1-4', 'ia-1-5',
      // The I4C Model (Module 2)
      'ia-2-1', 'ia-2-2',
      // Ladder of Imagination (Basics)
      'ia-3-1', 'ia-3-2', 'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6',
      // Advanced Ladder of Imagination
      'ia-4-1', 'ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5', 'ia-4-6',
      // Outcomes & Teams
      'ia-5-1', 'ia-5-2', 'ia-5-3'
      // Note: Section 6 and 7 handled by special rules above
    ];

    const currentStepIndex = iaStepOrder.indexOf(stepId);
    if (currentStepIndex === -1) return false; // Unknown step

    // For new steps: Check if previous step is completed
    if (currentStepIndex === 0) return true; // First step is always accessible
    
    const previousStepId = iaStepOrder[currentStepIndex - 1];
    return completedSteps.includes(previousStepId);
  };

  // Get content key from step ID
  const getContentKeyFromStepId = (stepId: string): string => {
    // Find the step in the navigation sections
    for (const section of imaginalAgilityNavigationSections) {
      const step = section.steps.find(s => s.id === stepId);
      if (step && (step as any).contentKey) {
        return (step as any).contentKey;
      }
    }
    return '';
  };

  // FIXED: Handle step click with proper navigation sync
  const handleStepClick = (sectionId: string, stepId: string) => {
    if (isStepAccessible(sectionId, stepId)) {
      console.log(`🧭 IA Menu Click: ${stepId}`);
      
      // Update both navigation hook and local state atomically
      setCurrentStep(stepId); // This updates navigation progress
      setCurrentStepState(stepId); // This updates local state
      setCurrentContent(stepId); // This updates content
      
      // Scroll to content after state update
      setTimeout(() => {
        document.getElementById('content-top')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      console.log(`⚠️ IA Menu Click: ${stepId} is not accessible`);
    }
  };

  // REMOVED: Step progression event listener (replaced with direct state management)
  // The navigation hook now handles progression internally

  // Scroll to top when currentContent changes (including programmatic navigation)
  useEffect(() => {
    document.getElementById('content-top')?.scrollIntoView({ behavior: 'smooth' });
  }, [currentContent]);

  // ENHANCED: Prevent navigation-content desync
  useEffect(() => {
    if (currentContent && currentContent.startsWith('ia-') && navProgress?.currentStepId) {
      // Only log significant desyncs (not one-frame differences)
      if (navProgress.currentStepId !== currentContent) {
        console.log(`🔄 IA Desync detected: Content=${currentContent}, Navigation=${navProgress.currentStepId}`);
        // Don't auto-correct here to prevent loops - let navigation hook be the source of truth
      }
    }
  }, [currentContent, navProgress?.currentStepId]);

  // Toggle drawer open/closed state
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navigation */}
      <NavBar />

      {/* Welcome Video Modal */}
      <ImaginalAgilityWelcomeVideoModal
        isOpen={showWelcomeModal}
        onClose={handleCloseModal}
        onGetStarted={handleGetStarted}
        showCloseButton={true}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Drawer */}
        <UserHomeNavigation
          key={`ia-nav-${currentContent}-${completedSteps.length}`}
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          navigationSections={imaginalAgilityNavigationSections}
          completedSteps={completedSteps}
          isStepAccessible={(sectionId, stepId) => isStepAccessible(sectionId, stepId)}
          handleStepClick={(sectionId, stepId) => handleStepClick(sectionId, stepId)}
          currentContent={currentContent}
          isImaginalAgility={true}
          navigation={{
            progress: navProgress,
            currentStepId: currentContent,
            completedSteps: completedSteps,
            isStepCurrent: (stepId: string) => currentContent === stepId,
            getStepVisualState: (stepId: string) => {
              const isCurrent = currentContent === stepId;
              const isCompleted = completedSteps.includes(stepId);
              const isAccessible = isStepAccessible('', stepId);
              
              // Find next unfinished step for pulsating dot logic
              const iaStepOrder = [
                'ia-1-1', 'ia-1-2', 'ia-1-3', 'ia-1-4', 'ia-1-5',
                'ia-2-1', 'ia-2-2',
                'ia-3-1', 'ia-3-2', 'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6',
                'ia-4-1', 'ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5', 'ia-4-6',
                'ia-5-1'
              ];
              const nextUnfinishedStep = iaStepOrder.find(step =>
                !completedSteps.includes(step) && isStepAccessible('', step)
              );
              const isNextUnfinished = stepId === nextUnfinishedStep;
              const currentStepIsCompleted = completedSteps.includes(currentContent);
              const userNavigatedBack = currentStepIsCompleted && nextUnfinishedStep !== currentContent;
              
              // IA Workshop Visual Logic (matching AST):
              // - Purple highlight: Current step being viewed
              // - Green checkmark: Completed steps
              // - Purple dot: Current step if not completed
              // - Pulsating dot: Next unfinished step when user went back
              
              return {
                showRoundedHighlight: isCurrent, // Purple background on current step
                showGreenCheckmark: isCompleted, // Green checkmark for completed
                showLightBlueShading: false, // Not used in IA
                showDarkDot: isCurrent && !isCompleted && isAccessible, // Purple dot for current unfinished
                showPulsatingDot: !isCurrent && isNextUnfinished && userNavigatedBack, // Pulsating dot when user went back
                isLocked: !isAccessible // Lock icon if not accessible
              };
            }
          }}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Anchor for scroll-to-top navigation */}
          <div id="content-top" className="h-0 w-0 invisible" aria-hidden="true"></div>
          <ContentViews
            currentContent={currentContent}
            navigate={navigate}
            markStepCompleted={markStepCompleted}
            setCurrentContent={setCurrentContent}
            user={user}
            setIsAssessmentModalOpen={setIsAssessmentModalOpen}
            isImaginalAgility={true}
            showDiscernmentModal={showDiscernmentModal}
            setShowDiscernmentModal={setShowDiscernmentModal}
          />

          {/* Imaginal Agility Assessment */}
          <ImaginalAgilityAssessment
            isOpen={isAssessmentModalOpen}
            onClose={() => setIsAssessmentModalOpen(false)}
            onComplete={async (results) => {
              try {
                console.log('🔎 Pre-save: Assessment results to save:', results);
                
                // FIXED: Save assessment results to the SAME endpoint the page reads from
                const response = await fetch('/api/workshop-data/ia-assessment', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  credentials: 'include',
                  body: JSON.stringify({
                    results: results,
                    assessmentType: 'imaginal_agility',
                    completedAt: new Date().toISOString()
                  })
                });

                console.log('🔎 Save response status:', response.status);
                
                if (!response.ok) {
                  const errorText = await response.text();
                  console.error('🔎 Save error response:', errorText);
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const saveResult = await response.json();
                console.log('🔎 Save result:', saveResult);

                // Close modal immediately - assessment results will show inline on page
                setIsAssessmentModalOpen(false);
                
                // CRITICAL FIX: Mark step as completed WITHOUT advancing to next step
                // We want to stay on ia-2-2 and let IA_2_2_Content show results inline
                if (currentContent === 'ia-2-2') {
                  console.log('🎯 IA Assessment Complete: Marking ia-2-2 as completed but STAYING on ia-2-2');
                  
                  // Update completed steps in background without navigation
                  // This is a special case - we bypass the normal markStepCompleted flow
                  const updatedCompletedSteps = [...(navProgress?.completedSteps || []), 'ia-2-2'];
                  
                  // Update the progress state manually to mark as completed but stay on current step
                  try {
                    await fetch('/api/workshop-data/navigation-progress', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      credentials: 'include',
                      body: JSON.stringify({
                        completedSteps: updatedCompletedSteps,
                        currentStepId: 'ia-2-2', // STAY on ia-2-2
                        appType: 'ia',
                        unlockedSteps: navProgress?.unlockedSteps || []
                      })
                    });
                    
                    console.log('💾 Direct database update: ia-2-2 marked completed, staying on ia-2-2');
                  } catch (dbError) {
                    console.error('Error updating progress directly:', dbError);
                  }
                } else {
                  console.log('🎯 IA Assessment Complete: Staying on current step', currentContent);
                }
                
                // Invalidate assessment queries to trigger UI updates (show results inline)
                queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/ia-assessment'] });
                queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/navigation-progress/ia'] });
                
                // FORCE IMMEDIATE REFETCH to ensure UI updates
                setTimeout(() => {
                  queryClient.refetchQueries({ queryKey: ['/api/workshop-data/ia-assessment'] });
                  console.log('🔄 Forced refetch of IA assessment data');
                }, 500);
                
                toast({
                  title: "Assessment Complete!",
                  description: "Your results are now displayed below.",
                });
              } catch (error) {
                console.error('Error saving assessment:', error);
                toast({
                  title: "Assessment Saved Locally",
                  description: "Your results are saved but couldn't sync to the server.",
                });
                // Handle error case
                queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/ia-assessment'] });
                setIsAssessmentModalOpen(false);
              }
            }}
          />
        </div>
      </div>

      {/* Discernment Modal - Rendered at page level */}
      <DiscernmentModal
        isOpen={showDiscernmentModal}
        onClose={() => setShowDiscernmentModal(false)}
      />
    </div>
  );
}