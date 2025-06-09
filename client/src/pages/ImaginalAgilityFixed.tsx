import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { Button } from '@/components/ui/button';
import UserHomeNavigation from '@/components/navigation/UserHomeNavigationWithStarCard';
import { imaginalAgilityNavigationSections } from '@/components/navigation/navigationData';
import ImaginalAgilityAssessmentComplete from '@/components/assessment/ImaginalAgilityAssessmentComplete';
import ImaginalAgilityContent from '@/components/content/imaginal-agility/ImaginalAgilityContent';

export default function ImaginalAgilityFixed() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState("ia-1-1");
  const { toast } = useToast();
  
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

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Step accessibility function to match interface
  const isStepAccessibleFunc = (sectionId: string, stepId: string) => {
    return isStepUnlocked(stepId);
  };

  // Handle step clicks - match the UserHomeNavigationWithStarCard interface
  const handleStepClick = (sectionId: string, stepId: string) => {
    if (isStepUnlocked(stepId)) {
      setCurrentContent(stepId);
      setCurrentStep(stepId);
    }
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
      {/* Yellow Heliotrope Imaginal Header Bar - Same as AST but with IA branding */}
      <div className="bg-yellow-500 text-white p-2 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/attached_assets/HI_Logo_horizontal.png" 
            alt="Heliotrope Imaginal"
            className="h-8 w-auto" 
          />
          <span className="ml-2 font-semibold">Heliotrope Imaginal</span>
        </div>
        <div className="flex items-center space-x-2">
          {user && (
            <div className="flex items-center gap-2">
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
              <span className="text-sm">Welcome, {(user as any)?.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Assessment Modal */}
        <ImaginalAgilityAssessmentComplete 
          isOpen={isAssessmentModalOpen} 
          onClose={() => setIsAssessmentModalOpen(false)}
          onComplete={handleAssessmentComplete}
        />

        {/* Left Navigation Drawer - Same as AST but with IA sections */}
        <UserHomeNavigation
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          navigationSections={imaginalAgilityNavigationSections}
          completedSteps={completedSteps}
          isStepAccessible={isStepAccessibleFunc}
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