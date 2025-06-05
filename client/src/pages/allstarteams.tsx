import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AssessmentModal } from '@/components/assessment/AssessmentModal';
import UserHomeNavigation from '@/components/navigation/UserHomeNavigationWithStarCard';
import ContentViews from '@/components/content/ContentViews';
import { navigationSections, imaginalAgilityNavigationSections } from '@/components/navigation/navigationData';
// import { StarCard, User, FlowAttributesResponse } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useApplication } from '@/hooks/use-application';
import { NavBar } from '@/components/layout/NavBar';
import { TestUserBanner } from '@/components/test-users/TestUserBanner';
import { useNavigationProgressClean } from '@/hooks/use-navigation-progress-clean';

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
    setCurrentStep,
    isStepAccessible: isStepUnlocked,
    canProceedToNext,
    shouldShowGreenCheckmark: isStepCompleted,
    getVideoProgress
  } = useNavigationProgressClean();
  
  // Use navigation progress state instead of separate completedSteps state
  const completedSteps = navProgress?.completedSteps || [];

  // Set app to AllStarTeams on component mount (authentication handled by useAuth hook elsewhere)
  useEffect(() => {
    setCurrentApp('allstarteams');
    // Simple navigation hook handles loading automatically
    console.log('App initialized with simple navigation');
  }, [setCurrentApp]);

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
            localStorage.removeItem(progressStorageKey);
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
  }, [progressStorageKey]);

  // Navigation progress is now loaded from database via useNavigationProgress hook
  // No need for localStorage-based completed steps loading

  // Navigation progress is now automatically persisted to database
  // No need for localStorage-based saving

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
      localStorage.removeItem(progressStorageKey);
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
    
    // Use simple navigation system only
    markNavStepCompleted(stepId);
    console.log(`Step ${stepId} marked as completed`);
  };

  // Function to determine if a step is accessible - strict sequential progression
  const isStepAccessible = (sectionId: string, stepId: string) => {
    // Defensive check to ensure completedSteps is an array
    if (!Array.isArray(completedSteps)) {
      console.error("completedSteps is not an array in isStepAccessible:", completedSteps);
      return stepId === '1-1'; // Only allow Introduction video if completedSteps is invalid
    }

    // Original requirement: Only Introduction Video (1-1) is active initially
    if (stepId === '1-1') return true;

    // Sequential step progression as per original requirements
    const allSteps = [
      '1-1', '2-1', '2-2', '2-3', '2-4', 
      '3-1', '3-2', '3-3', '3-4',
      '4-1', '4-2', '4-3', '4-4', '4-5'
    ];
    
    const stepPosition = allSteps.indexOf(stepId);
    if (stepPosition === -1) {
      // Resource sections (5-x, 6-x) unlock after Final Reflection (4-5)
      if (sectionId === '5' || sectionId === '6') {
        return completedSteps.includes('4-5');
      }
      return false;
    }
    
    // A step is accessible only if all previous steps are completed
    for (let i = 0; i < stepPosition; i++) {
      if (!completedSteps.includes(allSteps[i])) {
        return false;
      }
    }
    
    return true;
  };

  // Handle assessment completion
  const handleAssessmentComplete = (result: any) => {
    console.log("Assessment completed with result:", result);

    // When assessment is completed, make sure previous steps are also marked as completed
    markStepCompleted('1-1'); // Introduction Video
    markStepCompleted('2-1'); // Intro to Strengths
    markStepCompleted('2-2'); // The assessment itself

    // Check if we need to navigate to the Star Card Preview directly
    if (result?.navigateToStarCardPreview) {
      console.log("Navigating to star card preview");
      markStepCompleted('2-3'); // Star card preview step
      setCurrentContent('star-card-preview'); // Navigate to Star Card Preview
    }
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
    '4-5': { prev: '4-4', next: null, contentKey: 'your-statement' },
    '4-6': { prev: '4-5', next: null, contentKey: 'recap' },
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

  // Handle step click with automatic progression
  const handleStepClick = (sectionId: string, stepId: string) => {
    // Get navigation info for this step
    const navInfo = navigationSequence[stepId];

    if (!navInfo) {
      // For steps not defined in the sequence (like resource items)
      setCurrentContent(`placeholder-${stepId}`);
      markStepCompleted(stepId);
      return;
    }

    // Handle assessments specially - don't mark as completed yet
    const isAssessment = stepId === '2-2' || stepId === '3-2';

    // Set the content based on the navigation mapping
    setCurrentContent(navInfo.contentKey);

    // Mark previous step as completed if it exists
    if (navInfo.prev && !completedSteps.includes(navInfo.prev)) {
      markStepCompleted(navInfo.prev);
    }

    // For non-assessment steps, mark as completed when clicked
    if (!isAssessment) {
      markStepCompleted(stepId);
    }

    // For the flow assessment, navigate to the flow assessment page instead of opening modal
    if (stepId === '3-2') {
      // Mark it as completed directly
      markStepCompleted('3-2');
      // Go to flow-assessment content
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
          <ContentViews
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