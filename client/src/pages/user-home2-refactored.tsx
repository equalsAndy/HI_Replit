import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AssessmentModal } from '@/components/assessment/AssessmentModal';
import UserHomeNavigation from '@/components/navigation/UserHomeNavigationWithStarCard';
import ContentViews from '@/components/content/ContentViews';
import { navigationSections } from '@/components/navigation/navigationData';
import { StarCard, User, FlowAttributesResponse } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Constants
const PROGRESS_STORAGE_KEY = 'allstarteams-navigation-progress';

export default function UserHome2() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState("welcome");
  const { toast } = useToast();
  
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
  
  // Fetch user profile data
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    refetchOnWindowFocus: false
  });
  
  // Fetch user's Star Card data
  const { data: starCard } = useQuery<StarCard>({
    queryKey: ['/api/starcard'],
    refetchOnWindowFocus: false
  });
  
  // Fetch flow attributes data
  const { data: flowAttributesData } = useQuery<FlowAttributesResponse>({
    queryKey: ['/api/flow-attributes'],
    refetchOnWindowFocus: false
  });
  
  // Reset user progress mutation
  const resetUserProgress = useMutation({
    mutationFn: async () => {
      if (!user?.id) return null;
      const res = await apiRequest('POST', `/api/test-users/reset/${user.id}`);
      return res.json();
    },
    onSuccess: () => {
      // Clear local storage progress
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      setCompletedSteps([]);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flow-attributes'] });
      
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
        setCompletedSteps(completed || []);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
    
    // Check if we have a star card with data but missing navigation progress
    // This ensures if user cleared localStorage but has completed the assessment,
    // their progress is still reflected in the navigation
    if (starCard && starCard.thinking && starCard.acting && starCard.feeling && starCard.planning) {
      // Make sure steps leading to star card preview are marked complete
      setTimeout(() => {
        markStepCompleted('1-1'); // Introduction Video
        markStepCompleted('2-1'); // Intro to Strengths
        markStepCompleted('2-2'); // The assessment itself
      }, 100);
    }
  }, [starCard]);
  
  // Update navigation sections with completed steps count
  const updatedNavigationSections = navigationSections.map(section => {
    const completedStepsInSection = section.steps.filter(step => 
      completedSteps.includes(step.id)
    ).length;
    
    return {
      ...section,
      completedSteps: completedStepsInSection
    };
  });
  
  // Toggle drawer open/closed
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Mark a step as completed
  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      const newCompletedSteps = [...completedSteps, stepId];
      setCompletedSteps(newCompletedSteps);
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ completed: newCompletedSteps }));
    }
  };
  
  // Function to determine if a step is accessible
  const isStepAccessible = (sectionId: string, stepId: string) => {
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
      const prevSection = navigationSections[sectionIndex - 1];
      return prevSection.steps.every(step => completedSteps.includes(step.id));
    }
    
    // For other steps, check if the previous step in the same section is completed
    const prevStepId = `${sectionId}-${stepIndex}`;
    return completedSteps.includes(prevStepId);
  };

  // Handle assessment completion
  const handleAssessmentComplete = (result: any) => {
    // When assessment is completed, make sure previous steps are also marked as completed
    markStepCompleted('1-1'); // Introduction Video
    markStepCompleted('2-1'); // Intro to Strengths
    markStepCompleted('2-2'); // The assessment itself
    
    // You may want to update other state or navigate after assessment completes
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
    
    // Mark current step as completed unless it's an assessment
    if (!isAssessment) {
      markStepCompleted(stepId);
    }
    
    // Log navigation to intro-to-flow for debugging
    if (stepId === '3-1') {
      console.log("Navigation menu clicked - showing intro-to-flow content");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with Reset Button */}
      <header className="bg-white border-b border-gray-200 py-2 px-4" style={{ height: 'var(--header-height)' }}>
        <div className="flex justify-between items-center h-full">
          <div className="text-lg font-medium">AllStarTeams Workshop</div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 text-gray-700"
            onClick={() => resetUserProgress.mutate()}
            disabled={resetUserProgress.isPending}
          >
            <RefreshCw className="h-4 w-4" />
            {resetUserProgress.isPending ? "Resetting..." : "Reset Progress"}
          </Button>
        </div>
      </header>
      
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
          />
        </div>
      </div>
    </div>
  );
}