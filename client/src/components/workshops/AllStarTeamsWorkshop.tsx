import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AssessmentModal } from '@/components/assessment/AssessmentModal';
import WorkshopNavigationSidebar from '@/components/navigation/WorkshopNavigationSidebar';
import AllStarTeamsContent from '@/components/content/allstarteams/AllStarTeamsContent';
import CoachingModalProvider from '@/components/modals/CoachingModalProvider';
import { navigationSections, imaginalAgilityNavigationSections } from '@/components/navigation/navigationData';
// import { StarCard, User, FlowAttributesResponse } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useApplication } from '@/hooks/use-application';
import { NavBar } from '@/components/layout/NavBar';
import { TestUserBanner } from '@/components/test-users/TestUserBanner';
import { useUnifiedWorkshopNavigation } from '@/hooks/useUnifiedWorkshopNavigation';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import '@/utils/clearAssessmentData'; // Load admin functions
import { forceAssessmentCacheDump } from '@/utils/forceRefresh';
import { useStarCardData } from '@/hooks/useStarCardData';
import { useWelcomeVideo } from '@/hooks/useWelcomeVideo';
import WelcomeVideoModal from '@/components/modals/WelcomeVideoModal';
import { useStepContextSafe } from '@/contexts/StepContext';

export default function AllStarTeamsWorkshop() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentApp, setCurrentApp } = useApplication();
  const { shouldShowDemoButtons } = useTestUser();

  // Welcome video modal for first-time users
  const {
    showWelcomeModal,
    handleCloseModal,
    handleGetStarted,
    triggerWelcomeVideo,
  } = useWelcomeVideo();
  // Updated to use unified navigation system
  const navigation = useUnifiedWorkshopNavigation('ast');
  const { isWorkshopLocked, isModuleAccessible, getStepModule, astCompleted } = useWorkshopStatus();
  const { setCurrentStepId } = useStepContextSafe();
  const {
    progress: navProgress,
    updateVideoProgress,
    markStepCompleted: markNavStepCompleted,
    navigateToStep: setCurrentStep,
    isStepAccessible: isStepUnlocked,
    canProceedToNext,
    isStepCompleted: shouldShowGreenCheckmark,
    getVideoProgress,
    saveProgress, // NEW: Manual save function
    isLoading // NEW: Loading state to prevent premature auto-navigation
  } = navigation;

  // Use navigation progress state instead of separate completedSteps state
  const completedSteps = navigation.completedSteps || [];

  // Set app type for navigation and listen for auto-navigation events
  useEffect(() => {
    // Listen for auto-navigation events from the navigation hook
    const handleAutoNavigation = (event: CustomEvent) => {
      const { content, stepId } = event.detail;
      console.log(`🧭 AUTO-NAVIGATION: Received navigation event - content: ${content}, step: ${stepId}`);

      // Set current content and step
      setCurrentContent(content);
      setCurrentStep(stepId);
    };

    window.addEventListener('autoNavigateToContent', handleAutoNavigation as EventListener);

    return () => {
      window.removeEventListener('autoNavigateToContent', handleAutoNavigation as EventListener);
    };
  }, [setCurrentContent, setCurrentStep]);

  // Separate effect for app type detection to prevent setState during render
  useEffect(() => {
    // Detect current route and set app accordingly - be more specific about IA routes
    // IMPORTANT: 'more-imaginal-agility' is an AST resource step (5-3), not IA workshop
    const isIARoute = location.includes('/imaginal-agility') ||
                      location.includes('/ia-') ||
                      (currentContent?.includes('imaginal') && currentContent !== 'more-imaginal-agility');

    const currentAppType = isIARoute ? 'imaginal-agility' : 'allstarteams';

    // Only update if the app type actually changed
    if (currentApp !== currentAppType) {
      console.log('🔄 App type changed from', currentApp, 'to', currentAppType);
      setCurrentApp(currentAppType);
    }
  }, [location, currentContent, currentApp, setCurrentApp]);

  // Sync navigation step with StepContext for feedback/notes modals
  useEffect(() => {
    if (navProgress?.currentStepId) {
      console.log('🔄 Syncing step context:', navProgress.currentStepId);
      setCurrentStepId(navProgress.currentStepId);
    }
  }, [navProgress?.currentStepId, setCurrentStepId]);

  // Determine which navigation sections to use based on the selected app AND user role/content access
  // Get user role for navigation customization (using existing user query below)
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 0, // Force fresh data for interface switching
    gcTime: 0, // Don't cache the data
    refetchOnWindowFocus: true, // Refetch when user returns to browser tab
  });

  const userRole = (userData as any)?.user?.role || (userData as any)?.role;
  // Check contentAccess preference first (for admin/facilitator toggles), then fall back to user role
  const isStudentContent = userData?.user?.contentAccess === 'student' || userData?.user?.role === 'student';

  // Debug logging for interface switching (disabled to reduce console spam)
  // console.log('🎯 AllStarTeams Interface Debug:', {
  //   userData: userData,
  //   userDataUser: (userData as any)?.user,
  //   contentAccess: (userData as any)?.user?.contentAccess,
  //   userRole: (userData as any)?.user?.role,
  //   isStudentContent: isStudentContent,
  //   timestamp: new Date().toISOString()
  // });

  // Function to get role-based navigation sections
  const getRoleBasedNavigationSections = () => {
    if (currentApp === 'imaginal-agility') {
      return imaginalAgilityNavigationSections;
    }

    if (isStudentContent) {
      // Student/Facilitator week-based structure
      return [
        {
          id: '1',
          title: 'Introduction',
          steps: [
            { id: '1-1', title: 'Introduction', type: 'video' }
          ]
        },
        {
          id: '2',
          title: 'DISCOVER YOUR STAR STRENGTHS',
          weekNumber: 1,
          steps: [
            { id: '2-1', title: 'Intro to Star Strengths', type: 'video' },
            { id: '2-2', title: 'Star Strengths Self-Assessment', type: 'assessment' },
            { id: '2-3', title: 'Review Your Star Card', type: 'viewing' },
            { id: '2-4', title: 'Strength Reflection', type: 'reflection' }
          ]
        },
        {
          id: '3',
          title: 'IDENTIFY YOUR FLOW',
          weekNumber: 2,
          steps: [
            { id: '3-1', title: 'Intro to Flow', type: 'video' },
            { id: '3-2', title: 'Flow Assessment', type: 'assessment' },
            { id: '3-3', title: 'Rounding Out', type: 'video' },
            { id: '3-4', title: 'Add Flow to Star Card', type: 'adding' }
          ]
        },
        {
          id: '4',
          title: 'VISUALIZE YOUR POTENTIAL Part 1',
          weekNumber: 3,
          steps: [
            { id: '4-1', title: 'Ladder of Well-being', type: 'interactive' },
            { id: '4-2', title: 'Well-being Reflections', type: 'video' }
          ]
        },
        {
          id: '5',
          title: 'VISUALIZE YOUR POTENTIAL Part 2',
          weekNumber: 4,
          steps: [
            { id: '4-3', title: 'Visualizing You', type: 'visual' },
            { id: '4-4', title: 'Your Future Self', type: 'reflection' },
            { id: '4-5', title: 'Final Reflection', type: 'reflection' }
          ]
        },
        {
          id: '6',
          title: 'NEXT STEPS',
          weekNumber: 5,
          steps: [
            { id: '5-1', title: 'Download your Star Card', type: 'download' },
            { id: '5-2', title: 'Your Holistic Report', type: 'download' },
            { id: '5-3', title: 'Growth Plan', type: 'planning' },
            { id: '5-4', title: 'Team Workshop Prep', type: 'collaboration' }
          ]
        }
      ];
    } else {
      // Original structure for other user types
      return navigationSections;
    }
  };

  const activeNavigationSections = getRoleBasedNavigationSections();

  // Simplified linear progression - no need for app-specific storage keys

  // Check for Star Card Preview navigation flag
  useEffect(() => {
    const navigateFlag = sessionStorage.getItem('navigateToStarCardPreview');
    if (navigateFlag === 'true') {
      // Clear the flag
      sessionStorage.removeItem('navigateToStarCardPreview');

      // Navigate to Star Card Preview
      setCurrentContent('star-card-preview');

      // Mark the assessment step as completed
      markStepCompleted('2-2');
    }
  }, []);

  // Reset detection DISABLED - was causing continuous auto-reset loops
  // This prevents video progress from being captured and stored properly

  // Add user session tracking to refresh data when user changes
  useEffect(() => {
    let lastUserId: number | null = null;

    const checkUserAndRefresh = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          const currentUserId = userData.user?.id;

          // If user changed, clear all cached data and refresh
          if (lastUserId !== null && lastUserId !== currentUserId) {
            queryClient.clear();
            queryClient.invalidateQueries();
            // Navigation progress will be reloaded from database automatically
            // No localStorage keys needed in simplified mode
          }
          lastUserId = currentUserId;
        }
      } catch (error) {
        // Silently handle errors
      }
    };

    checkUserAndRefresh();
    // Only check user on initial mount, not every 1.5 seconds
    checkUserAndRefresh();
    
    // Removed aggressive polling to prevent auth loop
    // const interval = setInterval(checkUserAndRefresh, 1500);
    // return () => clearInterval(interval);
  }, []);

  // Navigation progress is now loaded from database via useNavigationProgress hook
  // No need for localStorage-based completed steps loading

  // Navigation progress is now automatically persisted to database
  // No need for localStorage-based saving

  // Auto-navigate to current step on page load
  React.useEffect(() => {
    // Clear any stale manual navigation flag from previous sessions when component mounts
    sessionStorage.removeItem('hasNavigatedManually');

    console.log(`🔍 AUTO-NAVIGATION DEBUG: Effect triggered`, {
      currentContent,
      'navProgress': navProgress,
      'navProgress?.currentStepId': navProgress?.currentStepId,
      'navProgress loaded': !!navProgress,
      'navigationSequence keys': Object.keys(navigationSequence),
      'isLoading': isLoading
    });

    // Don't auto-navigate while data is still loading
    if (isLoading) {
      console.log(`🔍 AUTO-NAVIGATION DEBUG: Still loading navigation data, waiting...`);
      return;
    }

    // Only set content if it hasn't been set yet (null) to avoid overriding manual navigation
    if (currentContent === null) {
      console.log(`🔍 AUTO-NAVIGATION DEBUG: currentContent is null, checking navigation progress...`);

      // Auto-navigate if we have navigation progress
      if (navProgress?.currentStepId) {
        const currentStepId = navProgress.currentStepId;
        console.log(`🧭 INITIAL AUTO-NAVIGATION: Current step from database: ${currentStepId}`);
        console.log(`🧭 INITIAL AUTO-NAVIGATION: Available navigation sequence:`, Object.keys(navigationSequence));

        // Map step ID to content key and navigate there
        const navInfo = navigationSequence[currentStepId];
        if (navInfo) {
          console.log(`🧭 INITIAL AUTO-NAVIGATION: Navigating to content: ${navInfo.contentKey}`);
          setCurrentContent(navInfo.contentKey);
          // Also update the navigation hook to match
          navigation.navigateToStep(currentStepId);
        } else {
          console.log(`🧭 INITIAL AUTO-NAVIGATION: No navigation mapping for ${currentStepId}, staying on welcome`);
          setCurrentContent("welcome");
        }
      } else {
        // If no progress, start at welcome
        console.log(`🧭 INITIAL AUTO-NAVIGATION: No current step, starting at welcome. NavProgress:`, navProgress);
        setCurrentContent("welcome");
      }
    } else {
      console.log(`🔍 AUTO-NAVIGATION DEBUG: currentContent already set to:`, currentContent);
    }
  }, [navProgress?.currentStepId, currentContent, isLoading]); // Depend on navProgress, currentContent, and loading state

  const { data: userProfile, isLoading: userProfileLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 0, // Force fresh data for interface switching
    gcTime: 0, // Don't cache the data
    refetchOnWindowFocus: true, // Refetch when user returns to browser tab
  });

    // Use the shared StarCard hook to prevent multiple simultaneous fetches
  const { data: starCardData, isLoading: starCardLoading, error: starCardError } = useStarCardData();

  // Clear workshop progress when user changes OR when any user has progress: 0
  React.useEffect(() => {
    // Extract actual user data from the response wrapper
    const actualUser = (userProfile as any)?.user || (userProfile as any);
    
    // Clear all local storage data when user changes
    sessionStorage.removeItem('workshopProgress');
    sessionStorage.removeItem('currentSection');
    sessionStorage.removeItem('currentSubSection');
    sessionStorage.removeItem('currentStepIndex');
    sessionStorage.removeItem('currentContent');
    sessionStorage.removeItem('workshopAssessmentData');
    sessionStorage.removeItem('adminAssessmentData');
    
    // New: Clear the participant results as well
    sessionStorage.removeItem('participantAssessmentData');
    
    // Clear any navigation flags
    sessionStorage.removeItem('navigateToStarCardPreview');
    sessionStorage.removeItem('navigateToAssessmentComplete');
    sessionStorage.removeItem('navigateToVideos');
    sessionStorage.removeItem('navigateToDownloads');
    sessionStorage.removeItem('navigateToDiscernment');
    sessionStorage.removeItem('navigateToWorkshop');
    sessionStorage.removeItem('navigateToAdmin');
    sessionStorage.removeItem('navigateToLogin');
    sessionStorage.removeItem('navigateToRegister');
    sessionStorage.removeItem('navigateToForgotPassword');
    sessionStorage.removeItem('navigateToResetPassword');
    sessionStorage.removeItem('navigateToProfile');
    sessionStorage.removeItem('navigateToSettings');
    sessionStorage.removeItem('navigateToHelp');
    sessionStorage.removeItem('navigateToAbout');
    sessionStorage.removeItem('navigateToContact');
    sessionStorage.removeItem('navigateToPrivacy');
    sessionStorage.removeItem('navigateToTerms');
    sessionStorage.removeItem('navigateToSupport');
    sessionStorage.removeItem('navigateToFeedback');
    sessionStorage.removeItem('navigateToChangePassword');
    sessionStorage.removeItem('navigateToDeleteAccount');
    sessionStorage.removeItem('navigateToLogout');
    sessionStorage.removeItem('navigateToHome');
    sessionStorage.removeItem('navigateToAllStarTeams');
    
    // Clear all localStorage data when user changes
    localStorage.removeItem('workshopProgress');
    localStorage.removeItem('currentSection');
    localStorage.removeItem('currentSubSection');
    localStorage.removeItem('currentStepIndex');
    localStorage.removeItem('currentContent');
    localStorage.removeItem('workshopAssessmentData');
    localStorage.removeItem('adminAssessmentData');
    
    // New: Clear the participant results as well
    localStorage.removeItem('participantAssessmentData');
    
    // Clear any navigation flags
    localStorage.removeItem('navigateToStarCardPreview');
    localStorage.removeItem('navigateToAssessmentComplete');
    localStorage.removeItem('navigateToVideos');
    localStorage.removeItem('navigateToDownloads');
    localStorage.removeItem('navigateToDiscernment');
    localStorage.removeItem('navigateToWorkshop');
    localStorage.removeItem('navigateToAdmin');
    localStorage.removeItem('navigateToLogin');
    localStorage.removeItem('navigateToRegister');
    localStorage.removeItem('navigateToForgotPassword');
    localStorage.removeItem('navigateToResetPassword');
    localStorage.removeItem('navigateToProfile');
    localStorage.removeItem('navigateToSettings');
    localStorage.removeItem('navigateToHelp');
    localStorage.removeItem('navigateToAbout');
    localStorage.removeItem('navigateToContact');
    localStorage.removeItem('navigateToPrivacy');
    localStorage.removeItem('navigateToTerms');
    localStorage.removeItem('navigateToSupport');
    localStorage.removeItem('navigateToFeedback');
    localStorage.removeItem('navigateToChangePassword');
    localStorage.removeItem('navigateToDeleteAccount');
    localStorage.removeItem('navigateToLogout');
    localStorage.removeItem('navigateToHome');
    localStorage.removeItem('navigateToAllStarTeams');
    
    console.log('🧹 Cleared all workshop data for user:', actualUser);
  }, [userProfile]);

  // Log what we're receiving
  React.useEffect(() => {
    if (userProfile) {
      console.log('AllStarTeams - User data:', userProfile);
    }
    if (starCardData) {
      console.log('AllStarTeams - Star card data:', starCardData);
    }
    if (starCardError) {
      console.log('AllStarTeams - Star card error:', starCardError);
    }
  }, [userProfile, starCardData, starCardError]);

  // Clear workshop progress when user changes OR when any user has progress: 0
  React.useEffect(() => {
    // Extract actual user data from the response wrapper
    const actualUser = (userProfile as any)?.user || (userProfile as any);

    if (actualUser?.id) {
      const lastUserId = localStorage.getItem('last-user-id');
      const currentUserId = actualUser.id.toString();

      // Check if we've already cleared progress for this user in this session
      const sessionKey = `progress-cleared-${currentUserId}`;
      const hasAlreadyCleared = sessionStorage.getItem(sessionKey);

      // Clear progress if:
      // 1. User changed (different user logged in)
      // 2. Current user has progress: 0 (database reset) AND hasn't been cleared in this session
      // 3. Current user has undefined/null progress (fresh user)
      const userChanged = lastUserId && lastUserId !== currentUserId;
      const hasZeroProgress = actualUser.progress === 0 && !hasAlreadyCleared;
      const hasNoProgress = (actualUser.progress === undefined || actualUser.progress === null) && !hasAlreadyCleared;

      const shouldClearProgress = userChanged || hasZeroProgress || hasNoProgress;

      if (shouldClearProgress) {
        let reason;
        if (userChanged) {
          reason = `User changed from ${lastUserId} to ${currentUserId}`;
        } else if (hasZeroProgress) {
          reason = `User ${currentUserId} has database progress: 0, clearing cached data`;
        } else {
          reason = `User ${currentUserId} has no progress data, clearing cached data`;
        }

        console.log(`${reason}, clearing workshop progress`);

        // Clear AllStarTeams specific progress and navigation cache
        const keysToRemove = [
          'allstarteams-navigation-progress',
          'allstar_navigation_progress', 
          'allstarteams_progress',
          'allstarteams_completedActivities',
          'allstarteams_starCard',
          'allstarteams_flowAttributes'
        ];

        // Also clear navigation progress cache for this user
        const navigationKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('app_navigation_progress_') || 
          key.startsWith('navigation_last_sync_')
        );

        keysToRemove.concat(navigationKeys).forEach(key => {
          localStorage.removeItem(key);
        });

        // Navigation progress will be reset through the hook

        // Force refresh of all cached data by invalidating queries
        queryClient.invalidateQueries({ queryKey: ['/api/user/assessments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/starcard'] });
        queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/flow-attributes'] });

        // Mark progress as cleared for this session to avoid repeated clearing
        const sessionKey = `progress-cleared-${currentUserId}`;
        sessionStorage.setItem(sessionKey, 'true');
      }

      // Update stored user ID
      localStorage.setItem('last-user-id', currentUserId);
    }

    // Debug logging
    if (userProfile) {
      console.log('AllStarTeams - User data:', userProfile);
    }
    if (starCardData) {
      console.log('AllStarTeams - Star card data:', starCardData);
    }
    if (starCardError) {
      console.log('AllStarTeams - Star card error:', starCardError);
    }
  }, [userProfile, starCardData, starCardError]);

  // Fetch flow attributes data
  const { data: flowAttributesData, isLoading: flowLoading } = useQuery({
    queryKey: ['/api/workshop-data/flow-attributes'],
    staleTime: 0, // Always fetch fresh data from database
    gcTime: 0, // Don't cache the data
    refetchOnWindowFocus: true, // Refetch when user returns to browser tab
  });

  // Reset user progress mutation
  const resetUserProgress = useMutation({
    mutationFn: async () => {
      if (!(userProfile as any)?.id) {
        throw new Error("User ID is required to reset progress");
      }

      const response = await fetch(`/api/test-users/reset/${(userProfile as any).id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // Try to get JSON error if available
          const errorData = await response.json();
          throw new Error(errorData.message || 'Server error');
        } else {
          // Handle non-JSON error responses
          const text = await response.text();
          throw new Error(`Server error: ${response.status}`);
        }
      }

      // Try to parse response as JSON (if possible)
      try {
        return await response.json();
      } catch (e) {
        // If JSON parsing fails but response was OK, consider it a success
        return { success: true };
      }
    },
    onSuccess: () => {
      // Use comprehensive cache dump utility
      forceAssessmentCacheDump(queryClient);

      toast({
        title: "Progress Reset",
        description: "Your progress has been reset successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Reset Failed",
        description: "There was an error resetting your progress: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
      console.error("Reset error:", error);
    }
  });

  // Function to mark a step as completed - FIXED: Proper async state synchronization
  const markStepCompleted = async (stepId: string, options?: { autoAdvance?: boolean }) => {
    console.log(`🎯 markStepCompleted called with: ${stepId}`);
    console.log(`🎯 Current navigation state BEFORE:`, {
      currentStepId: navProgress?.currentStepId,
      completedSteps: navProgress?.completedSteps || []
    });

    try {
      // CRITICAL FIX 1: Call the navigation hook's method and wait for the result
      const result = await markNavStepCompleted(stepId, options);
      console.log(`🎯 markNavStepCompleted result:`, result);

      // CRITICAL FIX 2: Get the updated navigation progress directly from the hook
      // Use a small delay to ensure React state has updated
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Get the current progress after the update
      const updatedProgress = navigation.progress;
      const updatedCurrentStep = updatedProgress?.currentStepId;
      const updatedCompletedSteps = updatedProgress?.completedSteps || [];
      
      console.log(`🎯 Navigation state AFTER update:`, {
        currentStepId: updatedCurrentStep,
        completedSteps: updatedCompletedSteps,
        stepJustCompleted: updatedCompletedSteps.includes(stepId)
      });

      // CRITICAL FIX 3: Update content based on the actual current step from navigation
      // SPECIAL CASE: For step 3-4 completion, don't auto-navigate to different content
      if (stepId === '3-4') {
        console.log(`🏆 WORKSHOP COMPLETION: Step 3-4 completed, staying on workshop-recap content`);
        console.log(`🔓 Modules 4 & 5 should now be unlocked in navigation sidebar`);
        // Stay on current content (workshop-recap) - don't auto-navigate away
      } else if (updatedCurrentStep && updatedCurrentStep !== stepId) {
        const navInfo = navigationSequence[updatedCurrentStep];
        if (navInfo) {
          console.log(`🎯 Updating content from ${currentContent} to: ${navInfo.contentKey}`);
          setCurrentContent(navInfo.contentKey);
        } else {
          console.log(`🔍 No navigation mapping found for step: ${updatedCurrentStep}`);
        }
      }

      // CRITICAL FIX 4: The navigation hook now handles database saving internally
      console.log(`✅ Navigation hook handles database persistence automatically`);

      // Clear manual navigation flag to allow auto-navigation
      sessionStorage.removeItem('hasNavigatedManually');
      console.log(`🎯 Cleared manual navigation flag after step completion`);

      console.log(`✅ Step ${stepId} completion successful. Current step: ${updatedCurrentStep}`);
      return updatedCurrentStep;

    } catch (error) {
      console.error(`❌ Error completing step ${stepId}:`, error);
      toast({
        title: "Navigation Error", 
        description: "There was an error progressing to the next step. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Enhanced function to determine step accessibility using module-specific locking
  const isStepAccessible = (sectionId: string, stepId: string) => {
    // Use the new module-specific locking logic
    const module = getStepModule(stepId);

    if (module) {
      // Check if the entire module is accessible
      const moduleAccessible = isModuleAccessible('ast', module);

      // console.log(`🔓 Step ${stepId} (Module ${module}) accessibility check: moduleAccessible=${moduleAccessible}`);

      if (!moduleAccessible) {
        return false;
      }
    }

    // If module is accessible (or no module determined), check step-level progression
    return navigation.isStepAccessible(stepId);
  };

  // Handle assessment completion
  const handleAssessmentComplete = (result: any) => {
    console.log("Assessment completed with result:", result);

    // DON'T mark step as completed - assessment completion only saves assessment data
    // Step 2-1 will be marked complete when user finishes the entire step content and clicks Next
    console.log("Assessment complete. Assessment data saved, but step 2-1 remains incomplete until user finishes full step.");

    // Refresh the star card data to ensure it's available for the next step
    queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/starcard'] });

    // Force refresh the assessment view to show results instead of intro
    queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/starcard'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/assessments'] });
  };

  // Define a structure to map stepIds to navigation sequence for automatic progress
  // Updated for 5-Module Structure (RENUMBERED)
  const getNavigationSequence = () => {
    const baseSequence: Record<string, { prev: string | null; next: string | null; contentKey: string }> = {
    // MODULE 1: GETTING STARTED
    '1-1': { prev: null, next: '1-2', contentKey: 'welcome' }, // ✅ WelcomeView
    '1-2': { prev: '1-1', next: '1-3', contentKey: 'self-awareness-opp' }, // ✅ Self Awareness Opportunity View
    '1-3': { prev: '1-2', next: '2-1', contentKey: 'about-course' }, // ✅ AboutCourseView

    // MODULE 2: STRENGTH AND FLOW
    '2-1': { prev: '1-3', next: '2-2', contentKey: 'star-strengths-assessment' }, // ✅ IntroStrengthsView
    '2-2': { prev: '2-1', next: '2-4', contentKey: 'flow-patterns' }, // ✅ IntroToFlowView (OLD 3-1)
    '2-4': { prev: '2-2', next: '3-1', contentKey: 'module-2-recap' }, // NEW - PlaceholderView

    // MODULE 3: VISUALIZE YOUR POTENTIAL
    '3-1': { prev: '2-4', next: '3-2', contentKey: 'wellbeing-ladder' }, // ✅ WellBeingView (OLD 4-1)
    '3-2': { prev: '3-1', next: '3-3', contentKey: 'future-self' }, // ✅ FutureSelfView (OLD 4-4)
    '3-3': { prev: '3-2', next: '3-4', contentKey: 'final-reflection' }, // ✅ FinalReflectionView (OLD 4-5)
    '3-4': { prev: '3-3', next: '4-1', contentKey: 'workshop-recap' }, // ✅ WorkshopRecap - NEW

    // MODULE 4: TAKEAWAYS & NEXT STEPS (unlocked after 3-4)
    '4-1': { prev: '3-4', next: '4-2', contentKey: 'download-star-card' }, // ✅ DownloadStarCardView (OLD 5-1)
    '4-2': { prev: '4-1', next: '4-3', contentKey: 'holistic-report' }, // ✅ GeneralHolisticReportView (OLD 5-2)
    '4-3': { prev: '4-2', next: '4-4', contentKey: 'growth-plan' }, // ✅ GrowthPlanView (OLD 5-3)
    '4-4': { prev: '4-3', next: '5-1', contentKey: 'team-workshop-prep' }, // ✅ TeamWorkshopPrepView (OLD 5-4)

    // MODULE 5: MORE INFORMATION (unlocked after 3-4)
    '5-1': { prev: '4-4', next: '5-2', contentKey: 'workshop-resources' }, // ✅ WorkshopResourcesView
    '5-2': { prev: '5-1', next: '5-3', contentKey: 'extra-stuff' }, // ✅ PersonalProfileContainer (comprehensive assessments)
    '5-3': { prev: '5-2', next: null, contentKey: 'more-imaginal-agility' }, // ✅ IntroIAView (Imaginal Agility intro)
    };

    // Steps 5-2 and 5-3 are now fully implemented with real content - available to all users
    return baseSequence;
  };

  const navigationSequence = getNavigationSequence();

  // Helper function to find step ID from content key
  const findStepIdFromContentKey = (contentKey: string): string | null => {
    for (const [stepId, data] of Object.entries(navigationSequence)) {
      if (data.contentKey === contentKey) {
        return stepId;
      }
    }


    return null;
  };

  // Handle step click with SIMPLIFIED LINEAR PROGRESSION - NO AUTO-COMPLETION
  const handleStepClick = (sectionId: string, stepId: string) => {
    console.log(`🧭 Menu navigation clicked: stepId=${stepId}, sectionId=${sectionId}`);

    // Mark that user has manually navigated (prevents auto-navigation from overriding)
    sessionStorage.setItem('hasNavigatedManually', 'true');

    // FIXED: Let navigation hook manage currentStep - it will trigger content updates
    navigation.navigateToStep(stepId);

    // Get navigation info for this step to update content
    const navInfo = navigationSequence[stepId];
    console.log(`🧭 Navigation info for ${stepId}:`, navInfo);

    if (!navInfo) {
      // For steps not defined in the sequence (like resource items)
      console.log(`🧭 No navigation info found for ${stepId}, showing placeholder`);
      setCurrentContent(`placeholder-${stepId}`);
    } else {
      // Set the content based on the navigation mapping
      console.log(`🧭 Setting content to: ${navInfo.contentKey}`);
      setCurrentContent(navInfo.contentKey);
    }

    // Scroll to content top anchor
    document.getElementById('content-top')?.scrollIntoView({ behavior: 'smooth' });

    // SIMPLIFIED MODE: Menu clicks should NEVER mark steps as completed
    // Only Next button progression should mark steps complete
    console.log(`🧭 SIMPLIFIED MODE: Menu navigation to ${stepId} - NO auto-completion`);
  };

  // Scroll to top when currentContent changes (including programmatic navigation)
  useEffect(() => {
    document.getElementById('content-top')?.scrollIntoView({ behavior: 'smooth' });
    
    // REMOVED: Sync current step with content - this was causing race conditions
    // The navigation hook should be the single source of truth for currentStep
    // Content changes should come FROM navigation state, not drive it
  }, [currentContent]);

  // Data check for debugging
  const hasData = React.useMemo(() => {
    const hasStarCardData = starCardData && (
      ((starCardData as any).thinking && (starCardData as any).thinking > 0) ||
      ((starCardData as any).feeling && (starCardData as any).feeling > 0) ||
      ((starCardData as any).acting && (starCardData as any).acting > 0) ||
      ((starCardData as any).planning && (starCardData as any).planning > 0)
    );    const hasFlowData = flowAttributesData && 
                        (flowAttributesData as any).attributes && 
                        Array.isArray((flowAttributesData as any).attributes) && 
                        (flowAttributesData as any).attributes.length > 0;

    const starCardData1 = {
      thinking: (starCardData as any)?.thinking || 0,
      acting: (starCardData as any)?.acting || 0,
      feeling: (starCardData as any)?.feeling || 0,
      planning: (starCardData as any)?.planning || 0,
      imageUrl: !!(starCardData as any)?.imageUrl
    };

    const flowAttributes = {
      hasAttributes: !!(flowAttributesData as any)?.attributes,
      attributesLength: (flowAttributesData as any)?.attributes?.length || 0,
      flowScore: (flowAttributesData as any)?.flowScore || 0
    };

    // Debug log for data checking
    console.log("Has data condition:", { hasData: !!hasStarCardData, hasFlowData, starCardData1, flowAttributes });

    return hasStarCardData;
  }, [starCardData, flowAttributesData]);

  // Function to toggle the drawer
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  // Update navigation sections with completion information
  const updatedNavigationSections = activeNavigationSections.map(section => {
    // Skip resource section which doesn't have completion tracking
    if (section.id === '5') return section;

    // Count completed steps in this section
    const completedStepsInSection = section.steps.filter(step =>
      Array.isArray(completedSteps) && completedSteps.includes(step.id)
    ).length;

    // Special handling for modules 4 and 5: expand when workshop is completed OR when step 3-4 is completed
    let shouldExpand = section.expanded;
    if ((section.id === '4' || section.id === '5') && (astCompleted || completedSteps.includes('3-4'))) {
      shouldExpand = true;
      console.log(`🔓 Module ${section.id} unlocked - astCompleted: ${astCompleted}, 3-4 completed: ${completedSteps.includes('3-4')}`);
    }

    return {
      ...section,
      expanded: shouldExpand,
      completedSteps: completedStepsInSection,
      totalSteps: section.steps.length
    };
  });

  return (
    <CoachingModalProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Navigation */}
        <NavBar />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Assessment Modal */}
          <AssessmentModal
            isOpen={isAssessmentModalOpen}
            onClose={() => setIsAssessmentModalOpen(false)}
            onComplete={handleAssessmentComplete}
          />

          {/* Welcome Video Modal */}
          <WelcomeVideoModal
            isOpen={showWelcomeModal}
            onClose={handleCloseModal}
            onGetStarted={handleGetStarted}
            showCloseButton={true}
          />

          {/* Left Navigation Drawer */}
          <WorkshopNavigationSidebar
            drawerOpen={drawerOpen}
            toggleDrawer={toggleDrawer}
            navigationSections={updatedNavigationSections}
            completedSteps={completedSteps}
            isStepAccessible={isStepAccessible}
            handleStepClick={handleStepClick}
            starCard={starCardData}
            flowAttributesData={flowAttributesData}
            currentContent={currentContent || ""}
            isImaginalAgility={currentApp === 'imaginal-agility'}
            navigation={navigation}
          />

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6">
            {/* Anchor for scroll-to-top navigation */}
            <div id="content-top" className="h-0 w-0 invisible" aria-hidden="true"></div>
            {currentContent ? (
              <AllStarTeamsContent
                currentContent={currentContent}
                markStepCompleted={markStepCompleted}
                setCurrentContent={setCurrentContent}
                starCard={starCardData}
                user={userProfile}
                flowAttributesData={flowAttributesData}
                setIsAssessmentModalOpen={setIsAssessmentModalOpen}
                isImaginalAgility={currentApp === 'imaginal-agility'}
                triggerWelcomeVideo={triggerWelcomeVideo}
              />
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading workshop content...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </CoachingModalProvider>
  );
}
