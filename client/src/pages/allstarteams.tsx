import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AssessmentModal } from '@/components/assessment/AssessmentModal';
import UserHomeNavigation from '@/components/navigation/UserHomeNavigationWithStarCard';
import ContentViews from '@/components/content/ContentViews';
import { navigationSections, imaginalAgilityNavigationSections } from '@/components/navigation/navigationData';
import { StarCard, User, FlowAttributesResponse } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useApplication } from '@/hooks/use-application';
import { NavBar } from '@/components/layout/NavBar';
import { TestUserBanner } from '@/components/test-users/TestUserBanner';

// Constants for different apps
const APP_PROGRESS_KEYS = {
  'allstarteams': 'allstarteams-navigation-progress',
  'imaginal-agility': 'imaginal-agility-navigation-progress'
};

export default function AllStarTeams() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState("welcome");
  const { toast } = useToast();
  const { currentApp, setCurrentApp } = useApplication();

  // Set app to AllStarTeams on component mount and check authentication
  useEffect(() => {
    setCurrentApp('allstarteams');

    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.status === 401) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access this workshop.",
          });
          // Save the workshop selection before redirecting
          localStorage.setItem('selectedApp', 'ast');
          navigate('/auth?app=ast');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/auth?app=ast');
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Determine which navigation sections to use based on the selected app
  const activeNavigationSections = currentApp === 'imaginal-agility' 
    ? imaginalAgilityNavigationSections 
    : navigationSections;

  // Get the appropriate progress storage key based on the selected app
  const progressStorageKey = APP_PROGRESS_KEYS[currentApp];

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
            // Clear progress for new user
            setCompletedSteps([]);
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

  // Load completed steps from localStorage
  useEffect(() => {
    const savedProgressJSON = localStorage.getItem(progressStorageKey);
    if (savedProgressJSON) {
      try {
        const savedProgress = JSON.parse(savedProgressJSON);
        // Handle both formats: array and object with completed property
        if (Array.isArray(savedProgress)) {
          setCompletedSteps(savedProgress);
        } else if (savedProgress && typeof savedProgress === 'object' && 'completed' in savedProgress) {
          // Handle object format: { completed: [...] }
          if (Array.isArray(savedProgress.completed)) {
            setCompletedSteps(savedProgress.completed);
          } else {
            console.error("Saved progress has invalid completed property:", savedProgress);
            setCompletedSteps([]);
          }
        } else {
          console.error("Saved progress has unsupported format:", savedProgress);
          setCompletedSteps([]);
        }
      } catch (e) {
        console.error("Error parsing saved progress:", e);
        // Initialize as empty array if parsing fails
        setCompletedSteps([]);
      }
    }
  }, [progressStorageKey]);

  // Save completed steps to localStorage whenever it changes
  useEffect(() => {
    if (completedSteps.length > 0) {
      localStorage.setItem(progressStorageKey, JSON.stringify(completedSteps));
    }
  }, [completedSteps, progressStorageKey]);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: 30000,
  });

  // Fetch star card data separately to debug the issue
  const { data: starCardData, isLoading: starCardLoading, error: starCardError } = useQuery({
    queryKey: ['/api/user/star-card-data'],
    enabled: !!user?.id,
    staleTime: 10000,
  });

  // Clear workshop progress when user changes  
  React.useEffect(() => {
    // Extract actual user data from the response wrapper
    const actualUser = user?.user || user;
    
    if (actualUser?.id) {
      const lastUserId = localStorage.getItem('last-user-id');
      const currentUserId = actualUser.id.toString();
      
      if (lastUserId && lastUserId !== currentUserId) {
        // Different user logged in, clear workshop progress
        console.log(`User changed from ${lastUserId} to ${currentUserId}, clearing workshop progress`);
        
        // Clear AllStarTeams specific progress
        const keysToRemove = [
          'allstarteams-navigation-progress',
          'allstar_navigation_progress', 
          'allstarteams_progress',
          'allstarteams_completedActivities',
          'allstarteams_starCard',
          'allstarteams_flowAttributes'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Reset completed steps state
        setCompletedSteps([]);
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
  const { data: starCard, isLoading: starCardLoading1 } = useQuery<StarCard>({ 
    queryKey: ['/api/starcard'],
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Refresh every 30 seconds to ensure data consistency
    onSuccess: (data) => {
      console.log("Star Card data loaded successfully:", data);
    },
    onError: (error) => {
      console.error("Error loading Star Card data:", error);
    }
  });

  // Fetch flow attributes data
  const { data: flowAttributesData, isLoading: flowLoading } = useQuery<FlowAttributesResponse>({
    queryKey: ['/api/flow-attributes'],
    refetchOnWindowFocus: false
  });

  // Reset user progress mutation
  const resetUserProgress = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User ID is required to reset progress");
      }

      const response = await fetch(`/api/test-users/reset/${user.id}`, {
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
      setCompletedSteps([]);

      // Clear all possible localStorage keys for maximum compatibility
      localStorage.removeItem(progressStorageKey);
      localStorage.removeItem('allstarteams-navigation-progress');
      localStorage.removeItem('imaginal-agility-navigation-progress');
      localStorage.removeItem('allstar_navigation_progress');

      // Refresh data from server
      queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flow-attributes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });

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
    // Defensive check to ensure completedSteps is an array
    if (Array.isArray(completedSteps)) {
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps(prev => Array.isArray(prev) ? [...prev, stepId] : [stepId]);
      }
    } else {
      console.error("completedSteps is not an array:", completedSteps);
      setCompletedSteps([stepId]);
    }
  };

  // Function to determine if a step is accessible
  const isStepAccessible = (sectionId: string, stepId: string) => {
    // Defensive check to ensure completedSteps is an array
    if (!Array.isArray(completedSteps)) {
      console.error("completedSteps is not an array in isStepAccessible:", completedSteps);
      return sectionId === '1' && stepId === '1-1'; // Only allow first step if completedSteps is invalid
    }

    const sectionIndex = parseInt(sectionId) - 1;
    const stepIndex = parseInt(stepId.split('-')[1]) - 1;

    // If it's the first step of the first section, it's always accessible
    if (sectionIndex === 0 && stepIndex === 0) return true;

    // If it's the Intro to Flow step (3-1), check if reflection step (2-4) is completed
    if (sectionId === '3' && stepId === '3-1') {
      // Make it accessible if either the previous section is complete
      // or if we've specifically completed the reflection step
      return completedSteps.includes('2-4') || completedSteps.includes('2-3');
    }

    // For the first step of other sections, check if all steps in previous section are completed
    if (stepIndex === 0 && sectionIndex > 0) {
      const prevSection = activeNavigationSections[sectionIndex - 1];
      if (!prevSection || !prevSection.steps) {
        console.error("Previous section or steps not found:", { sectionIndex, activeNavigationSections });
        return false;
      }
      return prevSection.steps.every(step => completedSteps.includes(step.id));
    }

    // For other steps, check if the previous step in the same section is completed
    const prevStepId = `${sectionId}-${stepIndex}`;
    return completedSteps.includes(prevStepId);
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
      (starCard.thinking && starCard.thinking > 0) || 
      (starCard.feeling && starCard.feeling > 0) || 
      (starCard.acting && starCard.acting > 0) || 
      (starCard.planning && starCard.planning > 0)
    );

    const hasFlowData = flowAttributesData && 
                        flowAttributesData.attributes && 
                        Array.isArray(flowAttributesData.attributes) && 
                        flowAttributesData.attributes.length > 0;

    const starCardData1 = {
      thinking: starCard?.thinking || 0,
      acting: starCard?.acting || 0,
      feeling: starCard?.feeling || 0,
      planning: starCard?.planning || 0,
      imageUrl: !!starCard?.imageUrl
    };

    const flowAttributes = {
      hasAttributes: !!flowAttributesData?.attributes,
      attributesLength: flowAttributesData?.attributes?.length || 0,
      flowScore: flowAttributesData?.flowScore || 0
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

      {/* Test User Banner */}
      {user?.id && (
        <TestUserBanner 
          userId={user.id} 
          userName={user.name || `TEST USER ${user.id}`} 
        />
      )}

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
            navigate={navigate}
            markStepCompleted={markStepCompleted}
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