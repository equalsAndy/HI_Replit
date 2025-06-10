import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import ImaginalAgilityNavigation from '@/components/navigation/ImaginalAgilityNavigation';
import ImaginalAgilityContent from '@/components/content/imaginal-agility/ImaginalAgilityContent';
import ImaginalAgilityAssessmentComplete from '@/components/assessment/ImaginalAgilityAssessmentComplete';
import { Button } from '@/components/ui/button';

export default function ImaginalAgilityWorkshop() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/imaginal-agility/:stepId');
  const stepId = params?.stepId || 'ia-1-1';
  const queryClient = useQueryClient();
  
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStepId, setCurrentStepId] = useState('ia-1-1');

  // Get current user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await fetch('/api/user/current', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    }
  });

  // Get IA navigation progress
  const { data: navigationProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['ia-navigation-progress'],
    queryFn: async () => {
      const response = await fetch('/api/user/ia-navigation-progress', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch navigation progress');
      return response.json();
    }
  });

  // Get IA assessment results
  const { data: iaAssessment } = useQuery({
    queryKey: ['ia-assessment'],
    queryFn: async () => {
      const response = await fetch('/api/workshop-data/ia-assessment', {
        credentials: 'include'
      });
      if (!response.ok) return null;
      return response.json();
    }
  });

  // Update state when navigation progress loads
  useEffect(() => {
    if (navigationProgress) {
      setCompletedSteps(navigationProgress.completedSteps || []);
      setCurrentStepId(stepId || navigationProgress.currentStepId || 'ia-1-1');
    }
  }, [navigationProgress, stepId]);

  // Update assessment results when loaded
  useEffect(() => {
    if (iaAssessment) {
      setAssessmentResults(iaAssessment);
    }
  }, [iaAssessment]);

  // Save navigation progress
  const saveNavigationProgress = async (stepId: string, completed: boolean = false) => {
    try {
      const updatedCompletedSteps = completed && !completedSteps.includes(stepId) 
        ? [...completedSteps, stepId] 
        : completedSteps;

      const progressData = {
        appType: 'ia',
        completedSteps: updatedCompletedSteps,
        currentStepId: stepId,
        unlockedSteps: calculateUnlockedSteps(updatedCompletedSteps),
        lastVisitedAt: new Date().toISOString()
      };

      const response = await fetch('/api/user/ia-navigation-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(progressData)
      });

      if (response.ok) {
        if (completed) {
          setCompletedSteps(updatedCompletedSteps);
        }
        setCurrentStepId(stepId);
        queryClient.invalidateQueries({ queryKey: ['ia-navigation-progress'] });
      }
    } catch (error) {
      console.error('Failed to save navigation progress:', error);
    }
  };

  // Calculate unlocked steps for IA
  const calculateUnlockedSteps = (completed: string[]): string[] => {
    const iaSequence = ['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-4-2', 'ia-5-1', 'ia-6-1', 'ia-7-1', 'ia-8-1'];
    const unlocked = ['ia-1-1'];
    
    for (let i = 0; i < iaSequence.length - 1; i++) {
      const currentStep = iaSequence[i];
      const nextStep = iaSequence[i + 1];
      
      if (completed.includes(currentStep) && !unlocked.includes(nextStep)) {
        unlocked.push(nextStep);
      }
    }
    
    return unlocked;
  };

  // Navigation functions
  const navigateToStep = (stepId: string) => {
    setLocation(`/imaginal-agility/${stepId}`);
    saveNavigationProgress(stepId);
  };

  const markStepCompleted = (stepId: string) => {
    saveNavigationProgress(stepId, true);
  };

  const handleNext = () => {
    const iaSequence = ['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-4-2', 'ia-5-1', 'ia-6-1', 'ia-7-1', 'ia-8-1'];
    const currentIndex = iaSequence.indexOf(currentStepId);
    
    if (currentIndex < iaSequence.length - 1) {
      const nextStep = iaSequence[currentIndex + 1];
      markStepCompleted(currentStepId);
      navigateToStep(nextStep);
    }
  };

  const handleOpenAssessment = () => {
    if (currentStepId === 'ia-4-1') {
      setIsAssessmentOpen(true);
    }
  };

  const handleAssessmentComplete = (results: any) => {
    setIsAssessmentOpen(false);
    setAssessmentResults(results);
    markStepCompleted('ia-4-1');
    navigateToStep('ia-4-2');
  };

  // Check if current step is unlocked
  const isStepUnlocked = (stepId: string): boolean => {
    const unlockedSteps = calculateUnlockedSteps(completedSteps);
    return unlockedSteps.includes(stepId);
  };

  // Check if next button should be enabled
  const isNextEnabled = (): boolean => {
    if (currentStepId === 'ia-4-1') {
      return !!assessmentResults; // Assessment must be completed
    }
    return true; // All other steps can proceed
  };

  if (userLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-yellow-400 h-16 flex items-center px-6">
        <div className="flex items-center space-x-4">
          <img 
            src="/heliotrope-logo.png" 
            alt="Heliotrope" 
            className="h-8 w-auto"
          />
          <h1 className="text-xl font-semibold text-gray-800">
            Imaginal Agility Workshop
          </h1>
        </div>
      </div>

      <div className="flex">
        {/* Left Navigation */}
        <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
          <ImaginalAgilityNavigation
            currentStepId={currentStepId}
            completedSteps={completedSteps}
            onStepClick={navigateToStep}
            isStepUnlocked={isStepUnlocked}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-4xl mx-auto p-8">
            <ImaginalAgilityContent
              stepId={currentStepId}
              onNext={handleNext}
              onOpenAssessment={handleOpenAssessment}
              assessmentResults={assessmentResults}
              user={user}
            />

            {/* Next Button */}
            {currentStepId !== 'ia-8-1' && (
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleNext}
                  disabled={!isNextEnabled()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                >
                  Next
                </Button>
              </div>
            )}

            {/* Completion Message */}
            {currentStepId === 'ia-8-1' && (
              <div className="mt-8 p-6 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  Workshop Complete!
                </h3>
                <p className="text-purple-700">
                  Congratulations on completing the Imaginal Agility Workshop. You've developed essential skills for conscious collaboration with AI and enhanced imagination capabilities.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assessment Modal */}
      <ImaginalAgilityAssessmentComplete
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        onComplete={handleAssessmentComplete}
      />
    </div>
  );
}