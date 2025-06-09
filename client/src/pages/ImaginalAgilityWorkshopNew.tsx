import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import NavBar from '@/components/navigation/NavBar';
import UserHomeNavigation from '@/components/navigation/UserHomeNavigation';
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
    queryKey: ['/api/user/me'],
    retry: false
  });

  // Imaginal Agility navigation structure matching the image provided
  const iaNavigationSections = [
    {
      id: "1",
      title: "Introduction to Imaginal Agility",
      steps: [
        { id: "ia-1-1", title: "Introduction to Imaginal Agility", type: "content" }
      ]
    },
    {
      id: "2", 
      title: "The Triple Challenge",
      steps: [
        { id: "ia-2-1", title: "The Triple Challenge", type: "content" }
      ]
    },
    {
      id: "3",
      title: "The Imaginal Agility Solution", 
      steps: [
        { id: "ia-3-1", title: "The Imaginal Agility Solution", type: "content" }
      ]
    },
    {
      id: "4",
      title: "Your 5 Capabilities (5Cs)",
      steps: [
        { id: "ia-4-1", title: "Your 5 Capabilities (5Cs)", type: "content" }
      ]
    },
    {
      id: "5",
      title: "Take the Imagination Assessment",
      steps: [
        { id: "ia-5-1", title: "Take the Imagination Assessment", type: "assessment" }
      ]
    },
    {
      id: "6",
      title: "Review your Results",
      steps: [
        { id: "ia-6-1", title: "Review your Results", type: "content" }
      ]
    },
    {
      id: "7",
      title: "Apply your Learning",
      steps: [
        { id: "ia-7-1", title: "Apply your Learning", type: "content" }
      ]
    },
    {
      id: "8", 
      title: "Next Steps",
      steps: [
        { id: "ia-8-1", title: "Next Steps", type: "content" }
      ]
    }
  ];

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Step accessibility check for IA
  const isStepAccessible = (stepId: string) => {
    return isStepUnlocked(stepId);
  };

  // Handle step clicks
  const handleStepClick = (stepId: string) => {
    if (isStepAccessible(stepId)) {
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
      {/* Use the same NavBar as AllStarTeams - this provides the yellow Heliotrope header */}
      <NavBar />

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
          navigationSections={iaNavigationSections}
          completedSteps={completedSteps}
          isStepAccessible={isStepAccessible}
          handleStepClick={handleStepClick}
          starCard={null} // IA doesn't use star cards
          flowAttributesData={null} // IA doesn't use flow attributes
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