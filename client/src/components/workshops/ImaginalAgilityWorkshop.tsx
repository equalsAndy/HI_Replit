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
import LogoutButton from '@/components/auth/LogoutButton';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { ImaginalAgilityAssessment } from '@/components/assessment/ImaginalAgilityAssessment';
import ProfileEditor from '@/components/profile/ProfileEditor';
import { NavBar } from '@/components/layout/NavBar';
import { useApplication } from '@/hooks/use-application';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import DiscernmentModal from '@/components/imaginal-agility/DiscernmentModal';

// Constants
const PROGRESS_STORAGE_KEY = 'imaginal-agility-navigation-progress';

export default function ImaginalAgilityWorkshop() {
  const [location, navigate] = useLocation();
  const [currentContent, setCurrentContent] = useState("ia-1-1");
  const [currentStep, setCurrentStepState] = useState("ia-1-1");
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [showDiscernmentModal, setShowDiscernmentModal] = useState(false);
  const { toast } = useToast();
  const { setCurrentApp } = useApplication();

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

  // Auto-navigate to current step based on progress
  useEffect(() => {
    if (!navProgress) return;

    const completedSteps = navProgress.completedSteps || [];
    const iaStepOrder = [
      // Welcome & Orientation
      'ia-1-1', 'ia-1-2',
      // The I4C Model
      'ia-2-1', 'ia-2-2', 
      // Ladder of Imagination (Basics)
      'ia-3-1', 'ia-3-2', 'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6',
      // Advanced Ladder of Imagination
      'ia-4-1', 'ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5', 'ia-4-6',
      // Outcomes & Benefits
      'ia-5-1'
      // Note: ia-6-1 is always accessible, ia-7-1 unlocks after ia-4-6, others locked
    ];

    // Find the next step after the last completed step
    let nextStepId = 'ia-1-1'; // Default to first step
    
    if (completedSteps.length > 0) {
      // Find the last completed step in the order
      let lastCompletedIndex = -1;
      for (let i = iaStepOrder.length - 1; i >= 0; i--) {
        if (completedSteps.includes(iaStepOrder[i])) {
          lastCompletedIndex = i;
          break;
        }
      }
      
      // Set next step (or stay on last step if all completed)
      if (lastCompletedIndex >= 0 && lastCompletedIndex < iaStepOrder.length - 1) {
        nextStepId = iaStepOrder[lastCompletedIndex + 1];
      } else if (lastCompletedIndex >= 0) {
        nextStepId = iaStepOrder[lastCompletedIndex]; // Stay on last completed step
      }
    }

    // Only navigate if current step is different from calculated next step
    if (currentStep !== nextStepId) {
      console.log(`Auto-navigating from ${currentStep} to ${nextStepId} based on progress`);
      setCurrentStep(nextStepId);
      setCurrentStepState(nextStepId);
      setCurrentContent(nextStepId);
    }
  }, [navProgress, currentStep]);

  // Mark a step as completed (using navigation progress)
  const markStepCompleted = async (stepId: string) => {
    console.log(`🎯 IA markStepCompleted: ${stepId}`);
    
    try {
      const result = await markNavStepCompleted(stepId);
      console.log(`🎯 IA markNavStepCompleted result: ${result}`);
      
      // For IA, immediately sync the navigation state
      if (result && result !== stepId) {
        console.log(`🧭 IA advancing from ${stepId} to ${result}`);
        // Force update the current step state immediately
        setCurrentStep(result);
        setCurrentStepState(result);
        setCurrentContent(result);
      }
      
      // Force re-render by invalidating navigation progress query
      queryClient.invalidateQueries({ queryKey: ['user-assessments'] });
      
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
      // Welcome & Orientation
      'ia-1-1', 'ia-1-2',
      // The I4C Model
      'ia-2-1', 'ia-2-2', 
      // Ladder of Imagination (Basics)
      'ia-3-1', 'ia-3-2', 'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6',
      // Advanced Ladder of Imagination
      'ia-4-1', 'ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5', 'ia-4-6',
      // Outcomes & Benefits
      'ia-5-1'
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

  // Handle step click
  const handleStepClick = (sectionId: string, stepId: string) => {
    // For IA workshop, navigate directly to step IDs
    if (isStepAccessible(sectionId, stepId)) {
      console.log(`🧭 IA Menu Click: ${stepId}`);
      
      // Set both content and navigation step atomically to prevent desync
      setCurrentContent(stepId);
      setCurrentStep(stepId); // This should update the navigation highlight
      
      // Scroll to content top anchor
      document.getElementById('content-top')?.scrollIntoView({ behavior: 'smooth' });
      // Note: Don't auto-complete steps on navigation - only when user explicitly progresses
    }
  };

  // Listen for step progression events to ensure proper navigation
  useEffect(() => {
    const handleStepProgression = (event: CustomEvent) => {
      const { fromStep, toStep } = event.detail;
      console.log(`🔄 IA Step Progression Event: ${fromStep} → ${toStep}`);
      
      // Ensure the next step is properly set as current for navigation unlocking
      if (setCurrentStep) {
        setCurrentStep(toStep);
      }
      
      // Force component re-render to update navigation UI
      setCurrentStepState(toStep);
      
      // Invalidate navigation queries to force fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/navigation-progress/ia'] });
    };

    window.addEventListener('iaStepProgression', handleStepProgression as EventListener);
    
    return () => {
      window.removeEventListener('iaStepProgression', handleStepProgression as EventListener);
    };
  }, [setCurrentStep, queryClient]);

  // Scroll to top when currentContent changes (including programmatic navigation)
  useEffect(() => {
    document.getElementById('content-top')?.scrollIntoView({ behavior: 'smooth' });
  }, [currentContent]);

  // Sync navigation with content changes to prevent desync
  useEffect(() => {
    if (currentContent && currentContent.startsWith('ia-')) {
      // Ensure navigation step matches content
      if (navProgress?.currentStepId !== currentContent) {
        console.log(`🔄 IA Sync: Content is ${currentContent}, navigation is ${navProgress?.currentStepId}`);
        setCurrentStep(currentContent);
      }
    }
  }, [currentContent, navProgress?.currentStepId]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navigation */}
      <NavBar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Drawer */}
        <UserHomeNavigation
          key={`ia-nav-${navProgress?.currentStepId}-${completedSteps.length}`}
          drawerOpen={true}
          toggleDrawer={() => {}}
          navigationSections={imaginalAgilityNavigationSections}
          completedSteps={completedSteps}
          isStepAccessible={(sectionId, stepId) => isStepAccessible(sectionId, stepId)}
          handleStepClick={(sectionId, stepId) => handleStepClick(sectionId, stepId)}
          currentContent={currentContent}
          isImaginalAgility={true}
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
                // Save assessment results to database
                const response = await fetch('/api/assessments', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  credentials: 'include',
                  body: JSON.stringify({
                    assessmentType: 'imaginal_agility',
                    results: results
                  })
                });

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/ia-assessment'] });
                setIsAssessmentModalOpen(false);
                markStepCompleted('ia-4-1'); // Mark assessment step as completed
                setCurrentContent("ia-5-1"); // Navigate to Assessment Results
                
                toast({
                  title: "Assessment Complete!",
                  description: "Your Imaginal Agility profile has been saved.",
                });
              } catch (error) {
                console.error('Error saving assessment:', error);
                toast({
                  title: "Assessment Saved Locally",
                  description: "Your results are saved but couldn't sync to the server.",
                });
                queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/ia-assessment'] });
                setIsAssessmentModalOpen(false);
                markStepCompleted('ia-4-1');
                setCurrentContent("ia-5-1");
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
      <LogoutButton />
    </div>
  );
}