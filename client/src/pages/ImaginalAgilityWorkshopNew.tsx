import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { Button } from '@/components/ui/button';
import UserHomeNavigationWithStarCard from '@/components/navigation/UserHomeNavigationWithStarCard';
import { imaginalAgilityNavigationSections } from '@/components/navigation/navigationData';
import ImaginalAgilityContent from '@/components/content/imaginal-agility/ImaginalAgilityContent';
import ImaginalAgilityAssessmentComplete from '@/components/assessment/ImaginalAgilityAssessmentComplete';
import { NavBar } from '@/components/layout/NavBar';
import { StepProvider, useStepContextSafe } from '@/contexts/StepContext';

function ImaginalAgilityWorkshopContent() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState("ia-1-1");
  const { setCurrentStepId } = useStepContextSafe();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define IA navigation sequence mapping for auto-navigation (similar to AST)
  const iaNavigationSequence: Record<string, { prev: string | null; next: string | null; contentKey: string }> = {
    // Section 1: Getting Started
    'ia-1-1': { prev: null, next: 'ia-1-2', contentKey: 'ia-1-1' },
    'ia-1-2': { prev: 'ia-1-1', next: 'ia-2-1', contentKey: 'ia-1-2' },

    // Section 2: Foundations
    'ia-2-1': { prev: 'ia-1-2', next: 'ia-2-2', contentKey: 'ia-2-1' },
    'ia-2-2': { prev: 'ia-2-1', next: 'ia-3-1', contentKey: 'ia-2-2' },

    // Section 3: Planning
    'ia-3-1': { prev: 'ia-2-2', next: 'ia-3-2', contentKey: 'ia-3-1' },
    'ia-3-2': { prev: 'ia-3-1', next: 'ia-3-3', contentKey: 'ia-3-2' },
    'ia-3-3': { prev: 'ia-3-2', next: 'ia-3-4', contentKey: 'ia-3-3' },
    'ia-3-4': { prev: 'ia-3-3', next: 'ia-3-5', contentKey: 'ia-3-4' },
    'ia-3-5': { prev: 'ia-3-4', next: 'ia-3-6', contentKey: 'ia-3-5' },
    'ia-3-6': { prev: 'ia-3-5', next: 'ia-4-1', contentKey: 'ia-3-6' },

    // Section 4: Practice
    'ia-4-1': { prev: 'ia-3-6', next: 'ia-4-2', contentKey: 'ia-4-1' },
    'ia-4-2': { prev: 'ia-4-1', next: 'ia-4-3', contentKey: 'ia-4-2' },
    'ia-4-3': { prev: 'ia-4-2', next: 'ia-4-4', contentKey: 'ia-4-3' },
    'ia-4-4': { prev: 'ia-4-3', next: 'ia-4-5', contentKey: 'ia-4-4' },
    'ia-4-5': { prev: 'ia-4-4', next: 'ia-4-6', contentKey: 'ia-4-5' },
    'ia-4-6': { prev: 'ia-4-5', next: 'ia-5-1', contentKey: 'ia-4-6' },

    // Section 5: Assessment and Results
    'ia-5-1': { prev: 'ia-4-6', next: 'ia-6-1', contentKey: 'ia-5-1' },

    // Section 6: Team Integration
    'ia-6-1': { prev: 'ia-5-1', next: 'ia-7-1', contentKey: 'ia-6-1' },

    // Section 7: Team Practice
    'ia-7-1': { prev: 'ia-6-1', next: 'ia-7-2', contentKey: 'ia-7-1' },
    'ia-7-2': { prev: 'ia-7-1', next: 'ia-8-1', contentKey: 'ia-7-2' },

    // Section 8: More Info
    'ia-8-1': { prev: 'ia-7-2', next: 'ia-8-2', contentKey: 'ia-8-1' },
    'ia-8-2': { prev: 'ia-8-1', next: null, contentKey: 'ia-8-2' },
  };
  
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

  // Function to determine if a step is accessible for IA workshop
  const isStepAccessible = (sectionId: string, stepId: string) => {
    return isStepUnlocked(stepId);
  };

  // Handle step clicks for IA navigation
  const handleStepClick = (sectionId: string, stepId: string) => {
    console.log(`🧭 IA Menu navigation clicked: stepId=${stepId}, sectionId=${sectionId}`);
    
    if (isStepAccessible(sectionId, stepId)) {
      // Get navigation info for this step
      const navInfo = iaNavigationSequence[stepId];
      console.log(`🧭 IA Navigation info for ${stepId}:`, navInfo);

      if (navInfo) {
        // Set the content based on the navigation mapping
        console.log(`🧭 IA Setting content to: ${navInfo.contentKey}`);
        setCurrentContent(navInfo.contentKey);
      } else {
        // Fallback: use stepId directly as content key
        console.log(`🧭 IA No navigation info found for ${stepId}, using stepId as content key`);
        setCurrentContent(stepId);
      }
      
      setCurrentStep(stepId);
      
      // Scroll to content top anchor
      document.getElementById('content-top')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Auto-navigate to current step on page load (similar to AST)
  React.useEffect(() => {
    if (navProgress?.currentStepId) {
      const currentStepId = navProgress.currentStepId;
      console.log(`🧭 IA AUTO-NAVIGATION: Current step from database: ${currentStepId}`);
      console.log(`🧭 IA AUTO-NAVIGATION: Available navigation sequence:`, Object.keys(iaNavigationSequence));

      // Map step ID to content key and navigate there
      const navInfo = iaNavigationSequence[currentStepId];
      if (navInfo) {
        console.log(`🧭 IA AUTO-NAVIGATION: Navigating to content: ${navInfo.contentKey}`);
        setCurrentContent(navInfo.contentKey);
      } else {
        console.log(`🧭 IA AUTO-NAVIGATION: No navigation mapping for ${currentStepId}, staying on current content`);
      }
    }
  }, [navProgress?.currentStepId]);

  // Update step context when currentContent changes
  useEffect(() => {
    setCurrentStepId(currentContent);
  }, [currentContent, setCurrentStepId]);

  // Handle assessment completion
  const handleAssessmentComplete = (assessmentData: any) => {
    setIsAssessmentModalOpen(false);
    
    // Invalidate the assessment query cache so it refetches
    queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/ia-assessment'] });
    
    // Mark ia-2-2 as completed and stay on the page to show radar chart
    // Do NOT use markNavStepCompleted as it triggers auto-progression
    if (!navProgress?.completedSteps.includes('ia-2-2')) {
      // Use a direct API call but force the current step to stay at ia-2-2
      fetch('/api/workshop-data/navigation-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          completedSteps: [...(navProgress?.completedSteps || []), 'ia-2-2'],
          currentStepId: 'ia-2-2', // Force stay on ia-2-2 to show radar chart
          appType: 'ia',
          unlockedSteps: [...(navProgress?.unlockedSteps || []), 'ia-3-1'], // Unlock next section
          videoProgress: navProgress?.videoProgress || {}
        })
      }).catch(error => console.error('Failed to update progress:', error));
    }
    
    // Stay on ia-2-2 to show the radar chart
    setCurrentContent('ia-2-2');
    setCurrentStep('ia-2-2');
    
    toast({
      title: "Assessment Complete!",
      description: "Your radar chart should now be visible. If not, please refresh the page.",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navigation */}
      <NavBar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Assessment Modal */}
        <ImaginalAgilityAssessmentComplete 
          isOpen={isAssessmentModalOpen} 
          onClose={() => setIsAssessmentModalOpen(false)}
          onComplete={handleAssessmentComplete}
        />

        {/* Left Navigation - IA Specific */}
        <UserHomeNavigationWithStarCard
          drawerOpen={true}
          toggleDrawer={() => {}}
          navigationSections={imaginalAgilityNavigationSections}
          completedSteps={completedSteps}
          isStepAccessible={(sectionId, stepId) => isStepAccessible(sectionId, stepId)}
          handleStepClick={(sectionId, stepId) => handleStepClick(sectionId, stepId)}
          currentContent={currentContent}
          isImaginalAgility={true}
        />

        {/* Content Area - Same layout as AST */}
        <div className="flex-1 overflow-auto p-6">
          <div id="content-top"></div>
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

export default function ImaginalAgilityWorkshopNew() {
  return (
    <StepProvider>
      <ImaginalAgilityWorkshopContent />
    </StepProvider>
  );
}