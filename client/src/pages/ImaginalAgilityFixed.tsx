import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { useApplication } from '@/hooks/use-application';
import { Button } from '@/components/ui/button';
import UserHomeNavigation from '@/components/navigation/UserHomeNavigationWithStarCard';
import { imaginalAgilityNavigationSections } from '@/components/navigation/navigationData';
import ImaginalAgilityAssessmentComplete from '@/components/assessment/ImaginalAgilityAssessmentComplete';
import ImaginalAgilityContent from '@/components/content/imaginal-agility/ImaginalAgilityContent';
import { NavBar } from '@/components/layout/NavBar';
import { TestUserBanner } from '@/components/test-users/TestUserBanner';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function ImaginalAgilityFixed() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState("ia-1-1");
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
  } = useNavigationProgress('ia');

  // Use navigation progress state instead of separate completedSteps state
  const completedSteps = navProgress?.completedSteps || [];

  // Set app type for navigation
  useEffect(() => {
    setCurrentApp('imaginal-agility');
  }, [setCurrentApp]);

  // Navigation sequence for IA workshop
  const iaNavigationSequence = {
    'ia-1-1': { prev: null, next: 'ia-2-1', contentKey: 'ia-1-1' },
    'ia-2-1': { prev: 'ia-1-1', next: 'ia-3-1', contentKey: 'ia-2-1' },
    'ia-3-1': { prev: 'ia-2-1', next: 'ia-4-1', contentKey: 'ia-3-1' },
    'ia-4-1': { prev: 'ia-3-1', next: 'ia-4-2', contentKey: 'ia-4-1' },
    'ia-4-2': { prev: 'ia-4-1', next: 'ia-5-1', contentKey: 'ia-4-2' },
    'ia-5-1': { prev: 'ia-4-2', next: 'ia-6-1', contentKey: 'ia-5-1' },
    'ia-6-1': { prev: 'ia-5-1', next: 'ia-7-1', contentKey: 'ia-6-1' },
    'ia-7-1': { prev: 'ia-6-1', next: 'ia-8-1', contentKey: 'ia-7-1' },
    'ia-8-1': { prev: 'ia-7-1', next: null, contentKey: 'ia-8-1' },
  };

  // Auto-navigate to current step on page load
  React.useEffect(() => {
    if (navProgress?.currentStepId) {
      const currentStepId = navProgress.currentStepId;
      const navInfo = iaNavigationSequence[currentStepId];
      if (navInfo) {
        setCurrentContent(navInfo.contentKey);
      }
    }
  }, [navProgress?.currentStepId]);

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Step accessibility function to match interface
  const isStepAccessible = (sectionId: string, stepId: string) => {
    const unlockedSteps = navProgress?.unlockedSteps || [];
    return unlockedSteps.includes(stepId);
  };

  // Handle step clicks - match the AllStarTeams implementation
  const handleStepClick = (sectionId: string, stepId: string) => {
    const navInfo = iaNavigationSequence[stepId];
    
    if (!navInfo) {
      setCurrentContent(`placeholder-${stepId}`);
      return;
    }

    setCurrentContent(navInfo.contentKey);
    setCurrentStep(stepId);
  };

  // Handle assessment completion
  const handleAssessmentComplete = (assessmentData: any) => {
    console.log('IA Assessment completed:', assessmentData);
    setIsAssessmentModalOpen(false);
    toast({
      title: "Assessment Complete",
      description: "Your Imaginal Agility profile has been generated.",
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading Imaginal Agility Workshop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Bar - Same as AllStarTeams */}
      <NavBar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Assessment Modal */}
        <ImaginalAgilityAssessmentComplete 
          isOpen={isAssessmentModalOpen} 
          onClose={() => setIsAssessmentModalOpen(false)}
          onComplete={handleAssessmentComplete}
        />

        {/* Left Navigation Drawer - Same as AST structure */}
        <UserHomeNavigation
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          navigationSections={imaginalAgilityNavigationSections}
          completedSteps={completedSteps}
          isStepAccessible={isStepAccessible}
          handleStepClick={handleStepClick}
          starCard={null}
          flowAttributesData={null}
          currentContent={currentContent}
          isImaginalAgility={true}
        />

        {/* Content Area - Same layout as AST */}
        <div className="flex-1 overflow-auto p-6">
          <ImaginalAgilityContent
            currentContent={currentContent}
            markStepCompleted={markNavStepCompleted}
            setCurrentContent={setCurrentContent}
            user={user}
            setIsAssessmentModalOpen={setIsAssessmentModalOpen}
            isImaginalAgility={true}
          />
        </div>
      </div>
    </div>
  );
}