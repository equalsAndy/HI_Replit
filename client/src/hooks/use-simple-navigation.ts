import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface NavigationProgress {
  completedSteps: string[];
  currentStepId: string;
  appType: 'ast' | 'ia' | null;
  lastVisitedAt: string;
  unlockedSteps: string[];
  videoProgress: { [stepId: string]: number };
}

// Simple hook without reset detection to stop the auto-reset loop
export function useSimpleNavigation() {
  // Fixed initial state to prevent reset loops
  const [progress, setProgress] = useState<NavigationProgress>({
    completedSteps: ['1-1'],
    currentStepId: '2-1',
    appType: 'ast',
    lastVisitedAt: new Date().toISOString(),
    unlockedSteps: ['1-1', '2-1'],
    videoProgress: {
      '1-1': 80,
      '2-1': 0,
      '2-3': 0,
      '3-1': 0,
      '3-3': 0,
      '4-1': 0,
      '4-4': 0
    }
  });

  const queryClient = useQueryClient();

  // Load from database only once on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetch('/api/user/navigation-progress');
        if (response.ok) {
          const data = await response.json();
          if (data.navigationProgress) {
            const parsed = JSON.parse(data.navigationProgress);
            console.log('📥 Loaded progress from database:', parsed);
            setProgress(parsed);
          }
        }
      } catch (error) {
        console.log('📥 Using default progress state');
      }
    };
    
    loadProgress();
  }, []);

  // Update video progress without triggering resets
  const updateVideoProgress = (stepId: string, percentage: number) => {
    console.log(`🎬 Video progress: ${stepId} = ${percentage}%`);
    
    const newProgress = {
      ...progress,
      videoProgress: {
        ...progress.videoProgress,
        [stepId]: percentage
      },
      lastVisitedAt: new Date().toISOString()
    };
    
    setProgress(newProgress);

    // Save to database for any video progress - immediate call
    console.log(`🔄 About to save video progress: ${stepId} = ${percentage}%`);
    saveProgressToDatabase(stepId, percentage);
  };

  // Save progress to database
  const saveProgressToDatabase = async (stepId?: string, videoPercentage?: number, progressData?: any) => {
    try {
      let updatedProgress = progressData || progress;
      
      if (stepId && videoPercentage !== undefined && !progressData) {
        updatedProgress = {
          ...progress,
          videoProgress: {
            ...progress.videoProgress,
            [stepId]: videoPercentage
          }
        };
      }

      console.log(`💾 Saving video progress to database: ${stepId} = ${videoPercentage}%`);
      
      const response = await fetch('/api/user/navigation-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ navigationProgress: JSON.stringify(updatedProgress) })
      });

      if (response.ok) {
        console.log(`✅ Video progress saved: ${stepId} = ${videoPercentage}%`);
      } else {
        const errorText = await response.text();
        console.error(`❌ Failed to save progress - Status: ${response.status}, Error: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Failed to save progress:', error);
    }
  };

  // Mark step as completed and unlock next step
  const markStepCompleted = (stepId: string) => {
    console.log(`✅ Marking step ${stepId} as completed`);
    
    setProgress(prev => {
      const newCompletedSteps = prev.completedSteps.includes(stepId) 
        ? prev.completedSteps 
        : [...prev.completedSteps, stepId];
      
      // Determine next step and unlock it
      const nextStep = getNextStep(stepId);
      const newUnlockedSteps = nextStep && !prev.unlockedSteps.includes(nextStep)
        ? [...prev.unlockedSteps, nextStep]
        : prev.unlockedSteps;

      const updated = {
        ...prev,
        completedSteps: newCompletedSteps,
        currentStepId: nextStep || prev.currentStepId,
        unlockedSteps: newUnlockedSteps,
        lastVisitedAt: new Date().toISOString()
      };

      // Save to database
      setTimeout(() => saveProgressToDatabase(), 100);
      
      return updated;
    });
  };

  // Simple next step logic
  const getNextStep = (currentStep: string): string | null => {
    const stepOrder = ['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'];
    const currentIndex = stepOrder.indexOf(currentStep);
    return currentIndex >= 0 && currentIndex < stepOrder.length - 1 
      ? stepOrder[currentIndex + 1] 
      : null;
  };

  // Check if step is unlocked
  const isStepUnlocked = (stepId: string): boolean => {
    return progress.unlockedSteps.includes(stepId);
  };

  // Check if step is completed
  const isStepCompleted = (stepId: string): boolean => {
    return progress.completedSteps.includes(stepId);
  };

  // Get video progress for a step
  const getVideoProgress = (stepId: string): number => {
    return progress.videoProgress[stepId] || 0;
  };

  return {
    progress,
    updateVideoProgress,
    markStepCompleted,
    isStepUnlocked,
    isStepCompleted,
    getVideoProgress,
    saveProgressToDatabase
  };
}