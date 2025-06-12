import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AssessmentModal } from '@/components/assessment/AssessmentModal';
import UserHomeNavigation from '@/components/navigation/UserHomeNavigationWithStarCard';
import AllStarTeamsContent from '@/components/content/allstarteams/AllStarTeamsContent';
import { navigationSections, imaginalAgilityNavigationSections } from '@/components/navigation/navigationData';
// import { StarCard, User, FlowAttributesResponse } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useApplication } from '@/hooks/use-application';
import { NavBar } from '@/components/layout/NavBar';
import { TestUserBanner } from '@/components/test-users/TestUserBanner';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';

export default function AllStarTeams() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState("welcome");
  const { toast } = useToast();
  const { currentApp, setCurrentApp } = useApplication();
  const {
    progress: navProgress,
    updateVideoProgress,
    markStepCompleted: markNavStepCompleted,
    updateCurrentStep: setCurrentStep,
    isStepAccessibleByProgression: isStepUnlocked,
    canProceedToNext,
    shouldShowGreenCheckmark: isStepCompleted,
    getCurrentVideoProgress: getVideoProgress
  } = useNavigationProgress('ast');
  
  // Use navigation progress state instead of separate completedSteps state
  const completedSteps = navProgress?.completedSteps || [];

  // Set app type for navigation and listen for auto-navigation events
  useEffect(() => {
    setCurrentApp('allstarteams');
    
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
  }, [setCurrentApp, setCurrentContent, setCurrentStep]);

  // Determine which navigation sections to use based on the selected app
  const activeNavigationSections = currentApp === 'imaginal-agility' 
    ? imaginalAgilityNavigationSections 
    : navigationSections;

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
        const response = await fetch('/api/user/me', { credentials: 'include' });
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
    const interval = setInterval(checkUserAndRefresh, 1500);
    return () => clearInterval(interval);
  }, []);

  // Navigation progress is now loaded from database via useNavigationProgress hook
  // No need for localStorage-based completed steps loading

  // Navigation progress is now automatically persisted to database
  // No need for localStorage-based saving

  // Auto-navigate to current step on page load
  React.useEffect(() => {
    if (navProgress?.currentStepId) {
      const currentStepId = navProgress.currentStepId;
      console.log(`🧭 AUTO-NAVIGATION: Current step from database: ${currentStepId}`);
      console.log(`🧭 AUTO-NAVIGATION: Available navigation sequence:`, Object.keys(navigationSequence));
      
      // Map step ID to content key and navigate there
      const navInfo = navigationSequence[currentStepId];
      if (navInfo) {
        console.log(`🧭 AUTO-NAVIGATION: Navigating to content: ${navInfo.contentKey}`);
        setCurrentContent(navInfo.contentKey);
      } else {
        console.log(`🧭 AUTO-NAVIGATION: No navigation mapping for ${currentStepId}, staying on current content`);
        // Force navigation based on current step ID
        if (currentStepId === '4-1') {
          console.log(`🧭 AUTO-NAVIGATION: Force navigating to wellbeing for step 4-1`);
          setCurrentContent('wellbeing');
        } else if (currentStepId === '3-1') {
          console.log(`🧭 AUTO-NAVIGATION: Force navigating to intro-to-flow for step 3-1`);
          setCurrentContent('intro-to-flow');
        } else if (currentStepId === '2-4') {
          console.log(`🧭 AUTO-NAVIGATION: Force navigating to reflection for step 2-4`);
          setCurrentContent('reflection');
        }
      }
    }
  }, [navProgress?.currentStepId]);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: 30000,
  });

  // Fetch star card data separately to debug the issue
  const { data: starCardData, isLoading: starCardLoading, error: starCardError } = useQuery({
    queryKey: ['/api/user/star-card-data'],
    enabled: !!(user as any)?.id,
    staleTime: 10000,
  });

  // Clear workshop progress when user changes OR when any user has progress: 0
  React.useEffect(() => {
    // Extract actual user data from the response wrapper
    const actualUser = (user as any)?.user || (user as any);

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
    if (user) {
      console.log('AllStarTeams - User data:', user);
    }
    if (starCardData) {
      console.log('AllStarTeams - Star card data:', starCardData);
    }
    if (starCardError) {
      console.log('AllStarTeams - Star card error:', starCardError);
    }
  }, [user, starCardData, starCardError]);

  // Fetch star card data with better error handling and logging
  const { data: starCard, isLoading: starCardLoading1 } = useQuery({ 
    queryKey: ['/api/workshop-data/starcard'],
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Refresh every 30 seconds to ensure data consistency
  });

  // Fetch flow attributes data
  const { data: flowAttributesData, isLoading: flowLoading } = useQuery({
    queryKey: ['/api/workshop-data/flow-attributes'],
    refetchOnWindowFocus: false
  });

  // Reset user progress mutation
  const resetUserProgress = useMutation({
    mutationFn: async () => {
      if (!(user as any)?.id) {
        throw new Error("User ID is required to reset progress");
      }

      const response = await fetch(`/api/test-users/reset/${(user as any).id}`, {
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
      // Navigation progress will be reset through the hook

      // Clear all possible localStorage keys for maximum compatibility
      // No localStorage keys needed in simplified mode
      localStorage.removeItem('allstarteams-navigation-progress');
      localStorage.removeItem('imaginal-agility-navigation-progress');
      localStorage.removeItem('allstar_navigation_progress');

      // Refresh data from server and clear all cached assessment data
      queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/starcard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/flow-attributes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/assessments'] });

      // Clear any cached flow assessment data
      queryClient.removeQueries({ queryKey: ['/api/workshop-data/flow-attributes'] });
      queryClient.removeQueries({ queryKey: ['/api/workshop-data/starcard'] });

      // Reset functionality disabled to prevent auto-reset loops

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

  // Function to mark a step as completed
  const markStepCompleted = (stepId: string) => {
    console.log("markStepCompleted called with:", stepId, "completedSteps:", completedSteps);
    
    // Use the navigation progress hook's markStepCompleted function
    markNavStepCompleted(stepId);
    console.log(`Step ${stepId} marked as completed`);
  };

  // Function to determine if a step is accessible - uses unlocked steps from navigation progress
  const isStepAccessible = (sectionId: string, stepId: string) => {
    // Use navigation progress unlocked steps instead of completed steps
    const unlockedSteps = navProgress?.unlockedSteps || [];
    
    // Check if step is in unlocked steps
    const isUnlocked = unlockedSteps.includes(stepId);
    console.log(`🔓 Step accessibility check: ${stepId} - unlocked: ${isUnlocked}, available steps: ${unlockedSteps.join(', ')}`);
    
    return isUnlocked;
  };

  // Handle assessment completion
  const handleAssessmentComplete = (result: any) => {
    console.log("Assessment completed with result:", result);

    // DO NOT mark step 2-2 as completed yet - user should stay on assessment results page
    // Step 2-2 will be marked as completed when user manually clicks Next button
    console.log("Assessment complete. User should now view results and manually click Next button to proceed to step 2-3");
    
    // Refresh the star card data to ensure it's available for the next step
    queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/starcard'] });
    
    // Force refresh the assessment view to show results instead of intro
    queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/starcard'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/assessments'] });
  };

  // Define a structure to map stepIds to navigation sequence for automatic progress
  const navigationSequence: Record<string, { prev: string | null; next: string | null; contentKey: string }> = {
    // Section 1
    '1-1': { prev: null, next: '2-1', contentKey: 'welcome' },

    // Section 2
    '2-1': { prev: '1-1', next: '2-2', contentKey: 'intro-strengths' },
    '2-2': { prev: '2-1', next: '2-3', contentKey: 'strengths-assessment' }, // Assessment doesn't auto-complete
    '2-3': { prev: '2-2', next: '2-4', contentKey: 'star-card-preview' },
    '2-4': { prev: '2-3', next: '3-1', contentKey: 'reflection' },

    // Section 3
    '3-1': { prev: '2-4', next: '3-2', contentKey: 'intro-to-flow' },
    '3-2': { prev: '3-1', next: '3-3', contentKey: 'flow-assessment' }, // Assessment doesn't auto-complete
    '3-3': { prev: '3-2', next: '3-4', contentKey: 'flow-rounding-out' },
    '3-4': { prev: '3-3', next: '4-1', contentKey: 'flow-star-card' },

    // Section 4
    '4-1': { prev: '3-4', next: '4-2', contentKey: 'wellbeing' },
    '4-2': { prev: '4-1', next: '4-3', contentKey: 'cantril-ladder' },
    '4-3': { prev: '4-2', next: '4-4', contentKey: 'visualizing-you' },
    '4-4': { prev: '4-3', next: '4-5', contentKey: 'future-self' },
    '4-5': { prev: '4-4', next: '5-1', contentKey: 'final-reflection' },

    // Section 5
    '5-1': { prev: '4-5', next: '5-2', contentKey: 'download-star-card' },
    '5-2': { prev: '5-1', next: '5-3', contentKey: 'holistic-report' },
    '5-3': { prev: '5-2', next: '5-4', contentKey: 'growth-plan' },
    '5-4': { prev: '5-3', next: '6-1', contentKey: 'team-workshop-prep' },
    
    // Section 6
    '6-1': { prev: '5-4', next: null, contentKey: 'workshop-resources' },
  };

  // Helper function to find step ID from content key
  const findStepIdFromContentKey = (contentKey: string): string | null => {
    for (const [stepId, data] of Object.entries(navigationSequence)) {
      if (data.contentKey === contentKey) {
        return stepId;
      }
    }

    // Special case for intro-to-flow which might be referred to as intro-flow
    if (contentKey === 'intro-to-flow') {
      return '3-1';
    }

    return null;
  };

  // Handle step click with SIMPLIFIED LINEAR PROGRESSION - NO AUTO-COMPLETION
  const handleStepClick = (sectionId: string, stepId: string) => {
    console.log(`🧭 Menu navigation clicked: stepId=${stepId}, sectionId=${sectionId}`);
    
    // Get navigation info for this step
    const navInfo = navigationSequence[stepId];
    console.log(`🧭 Navigation info for ${stepId}:`, navInfo);

    if (!navInfo) {
      // For steps not defined in the sequence (like resource items)
      console.log(`🧭 No navigation info found for ${stepId}, showing placeholder`);
      setCurrentContent(`placeholder-${stepId}`);
      // DO NOT auto-mark as completed - only Next button progression should do this
      return;
    }

    // Set the content based on the navigation mapping
    console.log(`🧭 Setting content to: ${navInfo.contentKey}`);
    setCurrentContent(navInfo.contentKey);

    // SIMPLIFIED MODE: Menu clicks should NEVER mark steps as completed
    // Only Next button progression should mark steps complete
    console.log(`🧭 SIMPLIFIED MODE: Menu navigation to ${stepId} - NO auto-completion`);

    // For the flow assessment, navigate to the flow assessment page instead of opening modal
    if (stepId === '3-2') {
      // DO NOT mark as completed - only Next button should do this
      setCurrentContent('flow-assessment');
    }
  };

  // Data check for debugging
  const hasData = React.useMemo(() => {
    const hasStarCardData = starCard && (
      ((starCard as any).thinking && (starCard as any).thinking > 0) || 
      ((starCard as any).feeling && (starCard as any).feeling > 0) || 
      ((starCard as any).acting && (starCard as any).acting > 0) || 
      ((starCard as any).planning && (starCard as any).planning > 0)
    );

    const hasFlowData = flowAttributesData && 
                        (flowAttributesData as any).attributes && 
                        Array.isArray((flowAttributesData as any).attributes) && 
                        (flowAttributesData as any).attributes.length > 0;

    const starCardData1 = {
      thinking: (starCard as any)?.thinking || 0,
      acting: (starCard as any)?.acting || 0,
      feeling: (starCard as any)?.feeling || 0,
      planning: (starCard as any)?.planning || 0,
      imageUrl: !!(starCard as any)?.imageUrl
    };

    const flowAttributes = {
      hasAttributes: !!(flowAttributesData as any)?.attributes,
      attributesLength: (flowAttributesData as any)?.attributes?.length || 0,
      flowScore: (flowAttributesData as any)?.flowScore || 0
    };

    // Debug log for data checking
    console.log("Has data condition:", { hasData: !!hasStarCardData, hasFlowData, starCardData1, flowAttributes });

    return hasStarCardData;
  }, [starCard, flowAttributesData]);

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

    return {
      ...section,
      completedSteps: completedStepsInSection,
      totalSteps: section.steps.length
    };
  });

  return (
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

        {/* Left Navigation Drawer */}
        <UserHomeNavigation
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          navigationSections={updatedNavigationSections}
          completedSteps={completedSteps}
          isStepAccessible={isStepAccessible}
          handleStepClick={handleStepClick}
          starCard={starCard}
          flowAttributesData={flowAttributesData}
          currentContent={currentContent}
          isImaginalAgility={currentApp === 'imaginal-agility'}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <AllStarTeamsContent
            currentContent={currentContent}
            markStepCompleted={markNavStepCompleted}
            setCurrentContent={setCurrentContent}
            starCard={starCard}
            user={user}
            flowAttributesData={flowAttributesData}
            setIsAssessmentModalOpen={setIsAssessmentModalOpen}
            isImaginalAgility={currentApp === 'imaginal-agility'}
          />
        </div>
      </div>
    </div>
  );
}