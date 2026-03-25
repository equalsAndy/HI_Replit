import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import UserHomeNavigation from '@/components/navigation/WorkshopNavigationSidebar';
import { productMindsetNavigationSections } from '@/components/navigation/navigationData';
import ProductMindsetContent from '@/components/content/product-mindset/ProductMindsetContent';
import { NavBar } from '@/components/layout/NavBar';
import { useApplication } from '@/hooks/use-application';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { useToast } from '@/hooks/use-toast';
import { useStepContextSafe } from '@/contexts/StepContext';
import { queryClient } from '@/lib/queryClient';

const PM_STEP_ORDER = [
  'pm-1-1', 'pm-1-2', 'pm-1-3', 'pm-1-4', 'pm-1-5', 'pm-1-6', 'pm-1-7', 'pm-1-8',
  'pm-2-1', 'pm-2-2', 'pm-2-3', 'pm-2-4', 'pm-2-5', 'pm-2-6',
  'pm-3-1', 'pm-3-2', 'pm-3-3', 'pm-3-4', 'pm-3-5', 'pm-3-6', 'pm-3-7',
  'pm-4-1', 'pm-4-2', 'pm-4-3', 'pm-4-4', 'pm-4-5',
  'pm-5-1', 'pm-5-2', 'pm-5-3', 'pm-5-4', 'pm-5-5', 'pm-5-6', 'pm-5-7',
];

export default function ProductMindsetWorkshop() {
  const [location, navigate] = useLocation();
  const [currentContent, setCurrentContent] = useState('pm-1-1');
  const [currentStep, setCurrentStepState] = useState('pm-1-1');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { toast } = useToast();
  const { setCurrentApp } = useApplication();
  const { setCurrentStepId } = useStepContextSafe();

  const {
    progress: navProgress,
    updateVideoProgress,
    markStepCompleted: markNavStepCompleted,
    updateCurrentStep: setCurrentStep,
    isStepAccessibleByProgression: isStepUnlocked,
    canProceedToNext,
    shouldShowGreenCheckmark: isStepCompleted,
    getCurrentVideoProgress: getVideoProgress
  } = useNavigationProgress('pm');

  const completedSteps = navProgress?.completedSteps || [];

  // Set app type and check authentication on mount
  useEffect(() => {
    setCurrentApp('product-mindset');

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.status === 401) {
          toast({
            title: 'Authentication Required',
            description: 'Please log in to access this workshop.',
          });
          localStorage.setItem('selectedApp', 'product-mindset');
          navigate('/auth?app=product-mindset');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/auth?app=product-mindset');
      }
    };
    checkAuth();
  }, [navigate, toast]);

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  // Update StepContext when content changes
  useEffect(() => {
    if (currentContent && currentContent.startsWith('pm-')) {
      setCurrentStepId(currentContent);
    }
  }, [currentContent, setCurrentStepId]);

  // Auto-navigate to current step from navigation progress
  useEffect(() => {
    if (!navProgress?.currentStepId) return;
    const navigationCurrentStep = navProgress.currentStepId;
    if (navigationCurrentStep !== currentStep && navigationCurrentStep.startsWith('pm-')) {
      setCurrentStep(navigationCurrentStep);
      setCurrentStepState(navigationCurrentStep);
      setCurrentContent(navigationCurrentStep);
    }
  }, [navProgress?.currentStepId, currentStep]);

  // Step accessibility check — linear progression
  const isStepAccessible = (sectionId: string, stepId: string) => {
    if (stepId === 'pm-1-1') return true;
    if (completedSteps.includes(stepId)) return true;

    const currentStepIndex = PM_STEP_ORDER.indexOf(stepId);
    if (currentStepIndex <= 0) return currentStepIndex === 0;

    const previousStepId = PM_STEP_ORDER[currentStepIndex - 1];
    return completedSteps.includes(previousStepId);
  };

  // Mark step completed and advance
  const markStepCompleted = async (stepId: string) => {
    try {
      const result = await markNavStepCompleted(stepId);
      if (result && result !== stepId) {
        setCurrentStep(result);
        setCurrentStepState(result);
        setCurrentContent(result);
        setTimeout(() => {
          document.getElementById('content-top')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/navigation-progress/pm'] });
      return result;
    } catch (error) {
      console.error('PM markStepCompleted error:', error);
      return null;
    }
  };

  // Handle step click from nav sidebar
  const handleStepClick = (sectionId: string, stepId: string) => {
    if (isStepAccessible(sectionId, stepId)) {
      setCurrentStep(stepId);
      setCurrentStepState(stepId);
      setCurrentContent(stepId);
      setTimeout(() => {
        document.getElementById('content-top')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  // Scroll to top on content change
  useEffect(() => {
    document.getElementById('content-top')?.scrollIntoView({ behavior: 'smooth' });
  }, [currentContent]);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <NavBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation */}
        <UserHomeNavigation
          key="pm-nav"
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          navigationSections={productMindsetNavigationSections}
          completedSteps={completedSteps}
          isStepAccessible={(sectionId, stepId) => isStepAccessible(sectionId, stepId)}
          handleStepClick={(sectionId, stepId) => handleStepClick(sectionId, stepId)}
          currentContent={currentContent}
          isImaginalAgility={false}
          isProductMindset={true}
          navigation={{
            progress: navProgress,
            currentStepId: currentContent,
            completedSteps: completedSteps,
            isStepCurrent: (stepId: string) => currentContent === stepId,
            getStepVisualState: (stepId: string) => {
              const isCurrent = currentContent === stepId;
              const isCompleted = completedSteps.includes(stepId);
              const isAccessible = isStepAccessible('', stepId);

              const nextUnfinishedStep = PM_STEP_ORDER.find(step =>
                !completedSteps.includes(step) && isStepAccessible('', step)
              );
              const isNextUnfinished = stepId === nextUnfinishedStep;
              const currentStepIsCompleted = completedSteps.includes(currentContent);
              const userNavigatedBack = currentStepIsCompleted && nextUnfinishedStep !== currentContent;

              return {
                showRoundedHighlight: isCurrent,
                showGreenCheckmark: isCompleted,
                showLightBlueShading: false,
                showDarkDot: isCurrent && !isCompleted && isAccessible,
                showPulsatingDot: !isCurrent && isNextUnfinished && userNavigatedBack,
                isLocked: !isAccessible,
              };
            }
          }}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div id="content-top" className="h-0 w-0 invisible" aria-hidden="true"></div>
          <ProductMindsetContent
            stepId={currentContent}
            onNext={() => markStepCompleted(currentContent)}
            user={user}
          />
        </div>
      </div>
    </div>
  );
}
