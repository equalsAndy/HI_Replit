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
  videoPositions: { [stepId: string]: number };
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
    },
    videoPositions: {
      '1-1': 0,
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
            
            // Ensure videoPositions exists for backward compatibility
            const progressWithPositions = {
              ...parsed,
              videoPositions: parsed.videoPositions || {}
            };
            
            // Recalculate unlocked steps based on actual video progress
            const recalculatedProgress = {
              ...progressWithPositions,
              unlockedSteps: calculateUnlockedSteps(progressWithPositions.completedSteps || [], progressWithPositions.videoProgress || {})
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

  // Update video progress with dual-state system (max progress + current position)
  const updateVideoProgress = (stepId: string, percentage: number, isCurrentPosition: boolean = false) => {
    console.log(`🎬 VIDEO PROGRESS UPDATE: ${stepId} = ${percentage}% (${isCurrentPosition ? 'POSITION' : 'MAX PROGRESS'})`);
    
    // Store in global state for immediate validation access
    if (!(window as any).currentVideoProgress) {
      (window as any).currentVideoProgress = {};
    }
    
    setProgress(prev => {
      const currentMaxProgress = prev.videoProgress[stepId] || 0;
      const currentPosition = prev.videoPositions?.[stepId] || 0;
      
      let newMaxProgress = currentMaxProgress;
      let newPosition = currentPosition;
      
      if (isCurrentPosition) {
        // Update current position for resume functionality
        newPosition = percentage;
        // Also update max progress if current position exceeds it
        if (percentage > currentMaxProgress) {
          newMaxProgress = percentage;
        }
      } else {
        // Update max progress (for achievements/unlocking)
        newMaxProgress = Math.max(percentage, currentMaxProgress);
        // Position stays the same unless it's higher
        if (percentage > currentPosition) {
          newPosition = percentage;
        }
      }
      
      // Only update if there's actual change
      if (newMaxProgress === currentMaxProgress && newPosition === currentPosition) {
        console.log(`🔄 No change needed - Max: ${currentMaxProgress}%, Pos: ${currentPosition}%`);
        return prev;
      }

      console.log(`📈 Updated ${stepId} - Max: ${currentMaxProgress}% → ${newMaxProgress}%, Pos: ${currentPosition}% → ${newPosition}%`);
      
      const newProgress = {
        ...prev,
        videoProgress: {
          ...prev.videoProgress,
          [stepId]: newMaxProgress
        },
        videoPositions: {
          ...(prev.videoPositions || {}),
          [stepId]: newPosition
        },
        lastVisitedAt: new Date().toISOString()
      };

      // Store in global state
      (window as any).currentVideoProgress[stepId] = newMaxProgress;
      
      // Check thresholds for dual-threshold system (based on max progress)
      console.log(`📊 Thresholds for ${stepId}: Next=5%, Complete=90% (Max Progress: ${newMaxProgress}%)`);
      
      // Auto-complete step when it reaches 90% threshold
      if (!prev.completedSteps.includes(stepId) && newMaxProgress >= 90) {
        console.log(`✅ Auto-completing video step ${stepId} at ${newMaxProgress}% (>= 90%)`);
        newProgress.completedSteps = [...prev.completedSteps, stepId];
        newProgress.unlockedSteps = calculateUnlockedSteps(newProgress.completedSteps, newProgress.videoProgress);
      }
      
      // Save to database if max progress increased
      if (newMaxProgress > currentMaxProgress) {
        setTimeout(() => {
          saveProgressToDatabase(stepId, newMaxProgress, newProgress);
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

  // Helper: Get current video progress (max progress for achievements)
  const getCurrentVideoProgress = (stepId: string): number => {
    const videoProgress = progress.videoProgress[stepId] || 0;
    const globalProgress = (window as any).currentVideoProgress?.[stepId] || 0;
    return Math.max(videoProgress, globalProgress);
  };

  // Helper: Get current video position (for resume playback)
  const getCurrentVideoPosition = (stepId: string): number => {
    return progress.videoPositions[stepId] || 0;
  };

  // Helper: Update video position for resume tracking
  const updateVideoPosition = (stepId: string, position: number) => {
    updateVideoProgress(stepId, position, true);
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
    getCurrentVideoProgress,    // Helper for getting max video progress
    getCurrentVideoPosition,    // Helper for getting video resume position
    updateVideoPosition         // Helper for updating video position
  };
}