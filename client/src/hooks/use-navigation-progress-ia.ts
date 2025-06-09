import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

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

  // Fetch navigation progress from backend
  const { data: navigationData } = useQuery({
    queryKey: ['/api/navigation-progress/ia'],
    queryFn: async () => {
      const response = await fetch('/api/navigation-progress/ia', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch navigation progress');
      }
      return response.json();
    },
    staleTime: 30000,
    retry: false
  });

  useEffect(() => {
    if (navigationData?.progress) {
      setProgress(navigationData.progress);
    }
  }, [navigationData]);

  const markStepCompleted = async (stepId: string) => {
    console.log('IA Navigation - Marking step completed:', stepId);
    
    try {
      const response = await fetch('/api/navigation-progress/ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          stepId,
          action: 'complete'
        })
      });

      if (response.ok) {
        const updatedProgress = {
          ...progress,
          completedSteps: [...new Set([...progress.completedSteps, stepId])],
          lastVisitedAt: new Date().toISOString()
        };
        setProgress(updatedProgress);
      }
    } catch (error) {
      console.error('Failed to mark IA step completed:', error);
    }
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

  const updateVideoProgress = async (stepId: string, progressData: VideoProgressData): Promise<void> => {
    console.log('IA Navigation - Updating video progress:', stepId, progressData);
    
    try {
      const response = await fetch('/api/navigation-progress/ia/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          stepId,
          progress: progressData
        })
      });

      if (response.ok) {
        const updatedProgress = {
          ...progress,
          videoProgress: {
            ...progress.videoProgress,
            [stepId]: progressData
          }
        };
        setProgress(updatedProgress);
      }
    } catch (error) {
      console.error('Failed to update IA video progress:', error);
    }
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