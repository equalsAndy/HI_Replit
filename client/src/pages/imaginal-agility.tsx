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
import LogoutButton from '@/components/auth/LogoutButton';
import { useProgressionLogic } from '@/hooks/use-progression-logic';
import AssessmentModal from '@/components/assessment/AssessmentModal';
import ProfileEditor from '@/components/profile/ProfileEditor';

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

  // Logout function for ProfileEditor
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Clear React Query cache
        queryClient.clear();

        // Show success toast
        toast({
          title: 'Logged out successfully',
          description: 'You have been logged out of your account.',
          variant: 'default',
        });

        // Navigate to home page
        navigate('/');

        // Force page reload to clear all state
        window.location.reload();
      } else {
        throw new Error(data.error || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout failed',
        description: 'There was a problem logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
        // Progress is managed by navigation hook, not local state
        console.log('Loaded progress:', completed);
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
    // Find the content key for this step
    const contentKey = getContentKeyFromStepId(stepId);

    if (contentKey) {
      setCurrentContent(contentKey);
      // Note: Don't auto-complete steps on navigation - only when user explicitly progresses
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
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
          {/* User Controls Menu for authenticated users */}
          {(user as any)?.id ? (
            <div className="flex items-center gap-2">
              {/* Admin button - only shown for admin users */}
              {(user as any)?.role === 'admin' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-md text-white hover:bg-yellow-400"
                  onClick={() => navigate('/admin')}
                >
                  Admin
                </Button>
              )}

              {/* Profile Editor with logout functionality */}
              <ProfileEditor
                user={user}
                onLogout={handleLogout}
              />
            </div>
          ) : (
            /* Show ProfileEditor for all users regardless of login status */
            <ProfileEditor
              user={user}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>

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
            setIsAssessmentModalOpen={setIsAssessmentModalOpen}
          />

          {/* Add the new 5-Capacity Assessment Modal */}
          <ImaginalAgilityAssessmentComplete
            isOpen={isAssessmentModalOpen}
            onClose={() => setIsAssessmentModalOpen(false)}
            onComplete={(results) => {
              setIsAssessmentModalOpen(false);
              markStepCompleted('1-5');
              setCurrentContent("assessment-results");
            }}
          />
        </div>
      </div>
    </div>
  );
}