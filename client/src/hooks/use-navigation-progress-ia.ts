import { useState, useEffect } from 'react';

interface IANavigationProgress {
  completedSteps: string[];
  currentStepId: string;
  appType: 'ia';
  lastVisitedAt: string;
  unlockedSteps: string[];
  videoProgress: { [stepId: string]: { farthest: number; current: number } };
}

interface VideoProgressData {
  farthest: number;
  current: number;
}

export const useIANavigationProgress = () => {
  const [progress, setProgress] = useState<IANavigationProgress>({
    completedSteps: [],
    currentStepId: 'ia-1-1',
    appType: 'ia',
    lastVisitedAt: new Date().toISOString(),
    unlockedSteps: ['ia-1-1'],
    videoProgress: {}
  });

  // Use localStorage for now instead of backend API
  useEffect(() => {
    const savedProgress = localStorage.getItem('ia-navigation-progress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed);
      } catch (error) {
        console.error('Failed to parse IA progress from localStorage:', error);
      }
    }
  }, []);

  const markStepCompleted = (stepId: string) => {
    console.log('IA Navigation - Marking step completed:', stepId);
    
    const updatedProgress = {
      ...progress,
      completedSteps: [...new Set([...progress.completedSteps, stepId])],
      lastVisitedAt: new Date().toISOString()
    };
    
    setProgress(updatedProgress);
    localStorage.setItem('ia-navigation-progress', JSON.stringify(updatedProgress));
  };

  const isStepCompleted = (stepId: string): boolean => {
    return progress.completedSteps.includes(stepId);
  };

  const isStepAccessible = (stepId: string): boolean => {
    const iaSequence = ['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-4-2'];
    const stepIndex = iaSequence.indexOf(stepId);
    
    if (stepIndex === 0) return true; // First step always accessible
    
    const previousStep = iaSequence[stepIndex - 1];
    return previousStep ? isStepCompleted(previousStep) : false;
  };

  const isNextButtonEnabled = (stepId: string): boolean => {
    // For now, always enable next button for IA steps
    return true;
  };

  const updateVideoProgress = (stepId: string, progressData: VideoProgressData): void => {
    console.log('IA Navigation - Updating video progress:', stepId, progressData);
    
    const updatedProgress = {
      ...progress,
      videoProgress: {
        ...progress.videoProgress,
        [stepId]: progressData
      },
      lastVisitedAt: new Date().toISOString()
    };
    
    setProgress(updatedProgress);
    localStorage.setItem('ia-navigation-progress', JSON.stringify(updatedProgress));
  };

  return {
    progress,
    markStepCompleted,
    isStepCompleted,
    isStepAccessible,
    isNextButtonEnabled,
    updateVideoProgress
  };
};