import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { Button } from '@/components/ui/button';
import ImaginalAgilityNavigation from '@/components/navigation/ImaginalAgilityNavigation';
import { imaginalAgilityNavigationSections } from '@/components/navigation/navigationData';
import ImaginalAgilityContent from '@/components/content/imaginal-agility/ImaginalAgilityContent';
import ImaginalAgilityAssessmentComplete from '@/components/assessment/ImaginalAgilityAssessmentComplete';

export default function ImaginalAgilityWorkshopNew() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState("ia-1-1");
  const { toast } = useToast();
  
  const {
    progress: navProgress,
    markStepCompleted: markNavStepCompleted,
    updateCurrentStep: setCurrentStep,
    isStepAccessibleByProgression: isStepUnlocked,
    shouldShowGreenCheckmark: isStepCompleted,
  } = useNavigationProgress('ia'); // Pass 'ia' for Imaginal Agility

  // Use navigation progress state
  const completedSteps = navProgress?.completedSteps || [];

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false
  });

  // Handle step clicks for IA navigation
  const handleStepClick = (stepId: string) => {
    if (isStepUnlocked(stepId)) {
      setCurrentContent(stepId);
      setCurrentStep(stepId);
    }
  };

  // Handle assessment completion
  const handleAssessmentComplete = (assessmentData: any) => {
    console.log('IA Assessment completed:', assessmentData);
    setIsAssessmentModalOpen(false);
    markNavStepCompleted('ia-5-1');
    toast({
      title: "Assessment Complete!",
      description: "Your Imaginal Agility profile has been generated.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Yellow Heliotrope Imaginal Header Bar - Same as AST but with IA branding */}
      <div className="bg-yellow-500 text-white p-2 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="https://app.heliotropeimaginal.com/assets/imaginal_agility_logo_nobkgrd-iiMRa1Pw.png" 
            alt="Imaginal Agility"
            className="h-8 w-auto" 
          />
          <span className="ml-2 font-semibold">Heliotrope Imaginal</span>
        </div>
        <div className="flex items-center space-x-2">
          {user && (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-md text-white hover:bg-yellow-400"
                  onClick={() => navigate('/admin')}
                >
                  Admin
                </Button>
              )}
              <span className="text-sm">Welcome, {user.name}</span>
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

        {/* Left Navigation - IA Specific */}
        <div className={`${drawerOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-purple-600`}>
          <ImaginalAgilityNavigation
            currentStepId={currentContent}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
            isStepUnlocked={isStepUnlocked}
          />
        </div>

        {/* Content Area - Same layout as AST */}
        <div className="flex-1 overflow-auto p-6">
          <ImaginalAgilityContent
            stepId={currentContent}
            onNext={(nextStepId) => {
              markNavStepCompleted(currentContent);
              setCurrentContent(nextStepId);
              setCurrentStep(nextStepId);
            }}
            onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            user={user}
          />
        </div>
      </div>
    </div>
  );
}