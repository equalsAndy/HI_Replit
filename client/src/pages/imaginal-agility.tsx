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
import { ImaginalAgilityAssessment } from '@/components/assessment/ImaginalAgilityAssessment';
import ProfileEditor from '@/components/profile/ProfileEditor';
import { NavBar } from '@/components/layout/NavBar';
import { useApplication } from '@/hooks/use-application';

// Constants
const PROGRESS_STORAGE_KEY = 'imaginal-agility-navigation-progress';

export default function ImaginalAgilityHome() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [currentContent, setCurrentContent] = useState("ia-1-1");
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const { toast } = useToast();
  const { setCurrentApp } = useApplication();

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

  // Set app type and check authentication on component mount
  useEffect(() => {
    setCurrentApp('imaginal-agility');
    
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

  // Function to determine if a step is accessible for IA workshop
  const isStepAccessible = (sectionId: string, stepId: string) => {
    // Always allow access to the first step
    if (stepId === 'ia-1-1') return true;

    // Define the progression order for IA
    const iaStepOrder = [
      'ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 
      'ia-5-1', 'ia-6-1', 'ia-7-1', 'ia-8-1', 'ia-9-1'
    ];

    const currentStepIndex = iaStepOrder.indexOf(stepId);
    if (currentStepIndex === -1) return false; // Unknown step

    // Check if previous step is completed
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
      setCurrentContent(stepId);
      // Note: Don't auto-complete steps on navigation - only when user explicitly progresses
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navigation */}
      <NavBar />

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
            markStepCompleted={progressionMarkCompleted}
            setCurrentContent={setCurrentContent}
            user={user}
            setIsAssessmentModalOpen={setIsAssessmentModalOpen}
            isImaginalAgility={true}
          />

          {/* Imaginal Agility Assessment */}
          <ImaginalAgilityAssessment
            isOpen={isAssessmentModalOpen}
            onClose={() => setIsAssessmentModalOpen(false)}
            onComplete={(results) => {
              setIsAssessmentModalOpen(false);
              markStepCompleted('ia-4-1'); // Mark self-assessment as completed
              setCurrentContent("ia-5-1"); // Navigate to Review Results
            }}
          />
        </div>
      </div>
    </div>
  );
}