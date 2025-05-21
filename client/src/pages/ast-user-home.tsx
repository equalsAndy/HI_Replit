
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

export default function ASTUserHome() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState("welcome");
  const { toast } = useToast();
  
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
    }
  });

  // Load completed steps from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (savedProgress) {
      setCompletedSteps(JSON.parse(savedProgress));
    }
  }, []);

  // Save completed steps to localStorage
  useEffect(() => {
    if (completedSteps.length > 0) {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(completedSteps));
    }
  }, [completedSteps]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleStepClick = (sectionId: string, stepId: string) => {
    setCurrentContent(`${sectionId}-${stepId}`);
  };

  const isStepAccessible = (sectionId: string, stepId: string) => {
    const currentStep = `${sectionId}-${stepId}`;
    
    // Always allow access to the first step
    if (currentStep === '1-1') return true;
    
    // Get previous step ID
    const [section, step] = currentStep.split('-').map(Number);
    const previousStep = step > 1 ? `${section}-${step-1}` : `${section-1}-${navigationSections[section-2]?.steps.length}`;
    
    // Check if previous step is completed
    return completedSteps.includes(previousStep);
  };

  const handleAssessmentComplete = (quadrantData: Record<string, number>) => {
    setIsAssessmentModalOpen(false);
    if (!completedSteps.includes('1-2')) {
      setCompletedSteps([...completedSteps, '1-2']);
    }
  };

  // Update navigation sections with completion status
  const updatedNavigationSections = navigationSections.map(section => ({
    ...section,
    steps: section.steps.map(step => ({
      ...step,
      completed: completedSteps.includes(`${section.id}-${step.id}`)
    }))
  }));

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with Reset Button */}
      <header className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="flex justify-between items-center">
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
        />
        
        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto transition-all duration-200 ${drawerOpen ? 'ml-80' : 'ml-0'}`}>
          <ContentViews 
            currentContent={currentContent}
            setCurrentContent={setCurrentContent}
            completedSteps={completedSteps}
            setCompletedSteps={setCompletedSteps}
            openAssessmentModal={() => setIsAssessmentModalOpen(true)}
            starCard={starCard}
            flowAttributesData={flowAttributesData}
          />
        </div>
      </div>
    </div>
  );
}
