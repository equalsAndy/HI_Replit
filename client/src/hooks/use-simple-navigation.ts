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

  // Load from database and recalculate unlocked steps based on video progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetch('/api/user/navigation-progress');
        if (response.ok) {
          const data = await response.json();
          if (data.navigationProgress) {
            const parsed = JSON.parse(data.navigationProgress);
            console.log('📥 Loaded progress from database:', parsed);
            
            // Recalculate unlocked steps based on actual video progress
            const recalculatedProgress = {
              ...parsed,
              unlockedSteps: calculateUnlockedSteps(parsed.completedSteps || [], parsed.videoProgress || {})
            };
            
            console.log('🔄 Recalculated unlocked steps:', recalculatedProgress.unlockedSteps);
            setProgress(recalculatedProgress);
          }
        }
      } catch (error) {
        console.log('📥 Using default progress state');
      }
    };
    
    loadProgress();
  }, []);

  // Calculate which steps should be unlocked based on video progress and completed steps
  const calculateUnlockedSteps = (completedSteps: string[], videoProgress: { [stepId: string]: number }): string[] => {
    const allSteps = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5'];
    const unlocked = ['1-1']; // First step always unlocked
    
    for (let i = 0; i < allSteps.length - 1; i++) {
      const currentStep = allSteps[i];
      const nextStep = allSteps[i + 1];
      
      let canUnlockNext = false;
      
      // For video steps, check 5% threshold
      if (['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'].includes(currentStep)) {
        const currentVideoProgress = videoProgress[currentStep] || 0;
        canUnlockNext = currentVideoProgress >= 5; // 5% threshold
        
        console.log(`📹 Step ${currentStep}: ${currentVideoProgress}% (need 5% to unlock ${nextStep}) - ${canUnlockNext ? 'UNLOCKED' : 'LOCKED'}`);
      } 
      // For assessment steps, check if completed
      else if (completedSteps.includes(currentStep)) {
        canUnlockNext = true;
        console.log(`📝 Step ${currentStep}: Completed - UNLOCKS ${nextStep}`);
      }
      
      if (canUnlockNext && !unlocked.includes(nextStep)) {
        unlocked.push(nextStep);
      }
    }
    
    return unlocked;
  };

  // Update video progress with dual-threshold system (5% for Next button, 90% for completion)
  const updateVideoProgress = (stepId: string, percentage: number) => {
    console.log(`🎬 VIDEO PROGRESS UPDATE: ${stepId} = ${percentage}%`);
    
    // Store in global state for immediate validation access
    if (!(window as any).currentVideoProgress) {
      (window as any).currentVideoProgress = {};
    }
    (window as any).currentVideoProgress[stepId] = percentage;
    console.log(`  ✅ Stored in global state`);
    
    setProgress(prev => {
      const currentProgress = prev.videoProgress[stepId] || 0;
      const newPercentage = Math.max(percentage, currentProgress); // Always maintain highest progress
      
      // Only update if the new percentage is actually higher
      if (newPercentage <= currentProgress) {
        console.log(`🔄 Skipping update - Current: ${currentProgress}%, New: ${percentage}%, Keeping: ${currentProgress}%`);
        return prev; // No change needed
      }

      console.log(`📈 Progress increased: ${stepId} from ${currentProgress}% to ${newPercentage}%`);
      
      const newProgress = {
        ...prev,
        videoProgress: {
          ...prev.videoProgress,
          [stepId]: newPercentage
        },
        lastVisitedAt: new Date().toISOString()
      };

      // Check thresholds for dual-threshold system
      console.log(`📊 Thresholds for ${stepId}: Next=5%, Complete=90%`);
      
      // Auto-complete step when it reaches 90% threshold
      if (!prev.completedSteps.includes(stepId) && newPercentage >= 90) {
        console.log(`✅ Auto-completing video step ${stepId} at ${newPercentage}% (>= 90%)`);
        newProgress.completedSteps = [...prev.completedSteps, stepId];
        
        // Update unlocked steps based on 5% threshold for next button access
        const updateUnlockedSteps = (completedSteps: string[], videoProgress: { [stepId: string]: number }): string[] => {
          const allSteps = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5'];
          const unlocked = ['1-1']; // First step always unlocked
          
          for (let i = 0; i < allSteps.length - 1; i++) {
            const currentStep = allSteps[i];
            const nextStep = allSteps[i + 1];
            
            let canUnlockNext = false;
            
            // For video steps, check 5% threshold
            if (['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'].includes(currentStep)) {
              const currentVideoProgress = videoProgress[currentStep] || 0;
              canUnlockNext = currentVideoProgress >= 5; // 5% threshold
              
              console.log(`📹 Step ${currentStep}: ${currentVideoProgress}% (need 5% to unlock ${nextStep}) - ${canUnlockNext ? 'UNLOCKED' : 'LOCKED'}`);
            } 
            // For assessment steps, check if completed
            else if (completedSteps.includes(currentStep)) {
              canUnlockNext = true;
              console.log(`📝 Step ${currentStep}: Completed - UNLOCKS ${nextStep}`);
            }
            
            if (canUnlockNext && !unlocked.includes(nextStep)) {
              unlocked.push(nextStep);
            }
          }
          
          return unlocked;
        };
        
        newProgress.unlockedSteps = updateUnlockedSteps(newProgress.completedSteps, newProgress.videoProgress);
      }
      
      // Only save to database if progress actually increased
      if (newPercentage > currentProgress) {
        // Debounce database saves to prevent race conditions
        setTimeout(() => {
          saveProgressToDatabase(stepId, newPercentage, newProgress);
        }, 100);
      }
      
      return newProgress;
    });
  };

  // Save progress to database with atomic updates to prevent race conditions
  const saveProgressToDatabase = async (stepId?: string, videoPercentage?: number, progressData?: any) => {
    try {
      // Use the provided progressData or construct from current state
      let updatedProgress = progressData;
      
      if (!updatedProgress) {
        // Get the current progress state to ensure we have the latest data
        const currentState = progress;
        updatedProgress = {
          ...currentState,
          videoProgress: {
            ...currentState.videoProgress,
            [stepId!]: Math.max(videoPercentage || 0, currentState.videoProgress[stepId!] || 0) // Ensure highest value
          },
          lastVisitedAt: new Date().toISOString()
        };
      }

      console.log(`💾 Saving atomic video progress: ${stepId} = ${videoPercentage}%`);
      console.log(`📋 Complete progress state:`, updatedProgress.videoProgress);
      
      const response = await fetch('/api/user/navigation-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ navigationProgress: JSON.stringify(updatedProgress) })
      });

      if (response.ok) {
        console.log(`✅ Atomic progress saved: ${stepId} = ${videoPercentage}%`);
      } else {
        const errorText = await response.text();
        console.error(`❌ Failed to save atomic progress - Status: ${response.status}, Error: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Failed to save atomic progress:', error);
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

  // Helper: Check if step can proceed to next (5% threshold for videos)
  const canProceedToNext = (stepId: string): boolean => {
    if (['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'].includes(stepId)) {
      const videoProgress = progress.videoProgress[stepId] || 0;
      const globalProgress = (window as any).currentVideoProgress?.[stepId] || 0;
      const currentProgress = Math.max(videoProgress, globalProgress);
      return currentProgress >= 5; // 5% threshold for Next button
    }
    return progress.completedSteps.includes(stepId);
  };

  // Helper: Check if step should show green checkmark (90% for videos)
  const shouldShowGreenCheckmark = (stepId: string): boolean => {
    if (['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'].includes(stepId)) {
      const videoProgress = progress.videoProgress[stepId] || 0;
      const globalProgress = (window as any).currentVideoProgress?.[stepId] || 0;
      const currentProgress = Math.max(videoProgress, globalProgress);
      const isComplete = currentProgress >= 90; // 90% threshold for green checkmark
      
      console.log(`🏆 Green Checkmark Check for ${stepId}:`);
      console.log(`  📊 Progress: ${currentProgress}%`);
      console.log(`  🎯 Completion Threshold: 90%`);
      console.log(`  ${isComplete ? '✅ SHOW GREEN CHECKMARK' : '⏳ NO CHECKMARK YET'}`);
      
      return isComplete;
    }
    
    // Non-video steps: show checkmark when completed
    return progress.completedSteps.includes(stepId);
  };

  // Helper: Get current video progress
  const getCurrentVideoProgress = (stepId: string): number => {
    const videoProgress = progress.videoProgress[stepId] || 0;
    const globalProgress = (window as any).currentVideoProgress?.[stepId] || 0;
    return Math.max(videoProgress, globalProgress);
  };

  return {
    progress,
    updateVideoProgress,
    markStepCompleted,
    isStepUnlocked,
    isStepCompleted,
    getVideoProgress,
    saveProgressToDatabase,
    // New dual-threshold functions
    canProceedToNext,           // For Next button validation (5% threshold)
    shouldShowGreenCheckmark,   // For menu green checkmarks (90% threshold)
    getCurrentVideoProgress     // Helper for getting current video progress
  };
}