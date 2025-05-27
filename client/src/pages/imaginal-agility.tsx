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
import TestUserBanner from '@/components/auth/TestUserBanner';
import LogoutButton from '@/components/auth/LogoutButton';
import { useProgressionLogic } from '@/hooks/use-progression-logic';

// Constants
const PROGRESS_STORAGE_KEY = 'imaginal-agility-navigation-progress';

export default function ImaginalAgilityHome() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [currentContent, setCurrentContent] = useState("imaginal-intro");
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Use progression logic for sequential unlocking
  const {
    completedSteps,
    isStepUnlocked,
    isStepCompleted,
    markStepCompleted: progressionMarkCompleted,
    markVideoWatched,
    saveAssessmentResult,
    getProgressCount
  } = useProgressionLogic();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile');
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
    queryKey: ['/api/user/profile'],
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  // Clear progress when user has database progress: 0
  React.useEffect(() => {
    const actualUser = user?.user || user;

    if (actualUser?.id) {
      const currentUserId = actualUser.id.toString();
      const sessionKey = `progress-cleared-imaginal-${currentUserId}`;
      const hasAlreadyCleared = sessionStorage.getItem(sessionKey);

      // Clear progress if current user has progress: 0 (database reset)
      if (actualUser.progress === 0 && !hasAlreadyCleared) {
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

  // Mark a step as completed (using progression logic)
  const markStepCompleted = (stepId: string) => {
    progressionMarkCompleted(stepId);
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ completed: [...completedSteps, stepId] }));
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
      {/* Test User Banner - Always visible regardless of user status */}
      <div className="w-full bg-blue-100 text-blue-800 px-4 py-2 flex justify-between items-center">
        <span className="font-medium">TEST MODE: All actions and data are for testing purposes only</span>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center"
            onClick={() => navigate('/allstarteams')}
          >
            <span>Switch to AllStarTeams</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="bg-white text-red-600 border-red-200 hover:bg-red-50 flex items-center"
            onClick={() => navigate('/workshop-reset-test')}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            <span>Reset Data</span>
          </Button>
        </div>
      </div>

      {/* Yellow NavBar - Just like in AllStarTeams */}
      <div className="bg-yellow-500 text-white p-2 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/src/assets/HI_Logo_horizontal.png" 
            alt="Heliotrope Imaginal"
            className="h-8 w-auto" 
          />
          <span className="ml-2 font-semibold">Imaginal Agility</span>
        </div>
        <div className="flex items-center space-x-2">
          <LogoutButton 
            variant="outline" 
            size="sm" 
            className="rounded-md bg-white text-yellow-600 hover:bg-yellow-100 flex items-center"
          />
        </div>
      </div>

      {/* Sub Header with Reset Button - specifically for Imaginal Agility */}
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
            setIsAssessmentModalOpen={() => setIsAssessmentModalOpen(true)}
          />
        </div>
      </div>
    </div>
  );
}