import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import UserHomeNavigation from '@/components/navigation/UserHomeNavigationWithStarCard';
import ContentViews from '@/components/content/ContentViews';
import { imaginalAgilityNavigationSections } from '@/components/navigation/navigationData';
import { User } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Constants
const PROGRESS_STORAGE_KEY = 'imaginal-agility-navigation-progress';

export default function ImaginalAgilityHome() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState("imaginal-intro");
  const { toast } = useToast();
  
  // Fetch user profile data
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile'],
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
  }, []);
  
  // Update navigation sections with completed steps count
  const updatedNavigationSections = imaginalAgilityNavigationSections.map(section => {
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
    
    // If it's the first step, it's always accessible
    if (sectionIndex === 0 && stepIndex === 0) return true;
    
    // For other steps, check if the previous step is completed
    const prevStepId = `${sectionId}-${stepIndex}`;
    return completedSteps.includes(prevStepId);
  };
  
  // Get content key from step ID
  const getContentKeyFromStepId = (sectionId: string, stepId: string): string => {
    // Find the step in the navigation sections
    const section = imaginalAgilityNavigationSections.find(s => s.id === sectionId);
    if (!section) return '';
    
    const step = section.steps.find(s => s.id === stepId);
    return step?.contentKey || '';
  };
  
  // Handle step click
  const handleStepClick = (sectionId: string, stepId: string) => {
    // Find the content key for this step
    const contentKey = getContentKeyFromStepId(sectionId, stepId);
    
    if (contentKey) {
      setCurrentContent(contentKey);
      
      // Don't automatically mark assessments as completed
      const isAssessment = contentKey.includes('assessment');
      if (!isAssessment) {
        markStepCompleted(stepId);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with Reset Button */}
      <header className="bg-white border-b border-gray-200 py-2 px-4" style={{ height: 'var(--header-height)' }}>
        <div className="flex justify-between items-center h-full">
          <img 
            src="/src/assets/imaginal_agility_logo_nobkgrd.png" 
            alt="Imaginal Agility Workshop"
            className="h-10 w-auto" 
          />
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
        {/* Left Navigation Drawer */}
        <UserHomeNavigation
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          navigationSections={updatedNavigationSections}
          completedSteps={completedSteps}
          isStepAccessible={isStepAccessible}
          handleStepClick={handleStepClick}
          currentContent={currentContent}
        />
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <ContentViews
            currentContent={currentContent}
            navigate={navigate}
            markStepCompleted={markStepCompleted}
            setCurrentContent={setCurrentContent}
            user={user}
            setIsAssessmentModalOpen={() => {}} // Not needed for Imaginal Agility
          />
        </div>
      </div>
    </div>
  );
}