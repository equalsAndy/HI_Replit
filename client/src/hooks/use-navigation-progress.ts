import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// FEATURE FLAG SYSTEM - Easy toggle for restoration
const PROGRESSION_MODE = {
  SIMPLIFIED: 'simplified',
  COMPLEX: 'complex'
} as const;

const CURRENT_PROGRESSION_MODE = 'simplified' as const;

interface NavigationProgress {
  completedSteps: string[];
  currentStepId: string;
  appType: 'ast' | 'ia';
  lastVisitedAt: string;
  unlockedSteps: string[];
  videoProgress: { [stepId: string]: { farthest: number; current: number } };
}

interface VideoProgressData {
  farthest: number;
  current: number;
}

// Query for user assessments to check completion states
const useUserAssessments = () => {
  return useQuery({
    queryKey: ['user-assessments'],
    queryFn: async () => {
      const response = await fetch('/api/workshop-data/userAssessments', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch assessments');
      const result = await response.json();
      return result.currentUser?.assessments || {};
    },
    staleTime: 10000,
    retry: false
  });
};

// SIMPLIFIED MODE: Only validate non-video requirements
const validateStepCompletionSimplified = (stepId: string, userAssessments: any): boolean => {
  console.log(`🔍 SIMPLIFIED VALIDATION: Step ${stepId}`);
  
  // Assessment steps - still require completion
  if (stepId === '2-2') {
    const isValid = !!userAssessments?.starCard;
    console.log(`📋 Star Card assessment: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
    return isValid;
  }
  
  if (stepId === '3-2') {
    const isValid = !!userAssessments?.flowAssessment;
    console.log(`📋 Flow assessment: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
    return isValid;
  }
  
  // Mixed requirement steps - only validate activity parts (not video)
  if (stepId === '4-1') {
    const isValid = !!userAssessments?.cantrilLadder;
    console.log(`🎚️ Cantril Ladder activity: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
    return isValid;
  }
  
  // 4-2 is reflections, non-blocking in simplified mode
  if (stepId === '4-2') {
    console.log(`📝 Well-being reflection: NON-BLOCKING (reflections in simplified mode)`);
    return true;
  }
  
  // All other steps: Next button always active
  console.log(`✅ SIMPLIFIED MODE: Next button always active for ${stepId}`);
  return true;
};

// SIMPLIFIED: Linear progression with resource branches
const calculateUnlockedSteps = (completedSteps: string[]): string[] => {
  const mainSequence = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5'];
  const unlocked = ['1-1']; // First step always unlocked
  
  // Linear progression through main sequence
  for (let i = 0; i < mainSequence.length - 1; i++) {
    const currentStep = mainSequence[i];
    const nextStep = mainSequence[i + 1];
    
    if (completedSteps.includes(currentStep) && !unlocked.includes(nextStep)) {
      unlocked.push(nextStep);
      console.log(`📝 SIMPLIFIED MODE: Step ${currentStep} completed → unlocked ${nextStep}`);
    }
  }
  
  // BRANCH 1: 3-4 completion unlocks 5-1 (parallel branch, 4-1 remains next step)
  if (completedSteps.includes('3-4') && !unlocked.includes('5-1')) {
    unlocked.push('5-1');
    console.log(`🌟 BRANCH: Step 3-4 completed → unlocked 5-1 (resource branch)`);
  }
  
  // BRANCH 2: 4-5 completion unlocks all remaining resources
  if (completedSteps.includes('4-5')) {
    const resources = ['5-2', '5-3', '5-4', '6-1'];
    resources.forEach(stepId => {
      if (!unlocked.includes(stepId)) {
        unlocked.push(stepId);
        console.log(`🏆 COMPLETION: Step 4-5 completed → unlocked ${stepId} (final resource)`);
      }
    });
  }
  
  console.log('🔓 SIMPLIFIED MODE: Unlocked steps:', unlocked);
  return unlocked;
};

// JSON parsing with error recovery
const handleJSONParseError = (error: Error, rawData: string): NavigationProgress => {
  console.error('Failed to parse navigation progress:', error);
  
  const showRecoveryOptions = () => {
    const message = `
      Navigation data appears corrupted. Recovery options:
      
      1. Refresh the page (Ctrl+F5 or Cmd+R)
      2. Clear browser data (Settings > Clear browsing data)
      3. Contact your facilitator for assistance
      
      Your progress will be restored from the last successful save.
    `;
    
    console.warn(message);
  };
  
  showRecoveryOptions();
  
  // Return safe default state
  return {
    completedSteps: [],
    currentStepId: '1-1',
    appType: 'ast',
    lastVisitedAt: new Date().toISOString(),
    unlockedSteps: ['1-1'],
    videoProgress: {}
  };
};

// Network error handling
const handleNetworkError = (error: Error, operation: string): boolean => {
  console.warn(`Network error during ${operation}:`, error);
  return false; // Indicate failure but don't break app
};

// Auto-mark steps as completed up to current position with validation
const autoMarkStepsCompleted = (currentStepId: string, userAssessments: any): string[] => {
  const mainSequence = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5'];
  const currentIndex = mainSequence.indexOf(currentStepId);
  const completedSteps: string[] = [];
  
  if (currentIndex <= 0) {
    return []; // At or before first step
  }
  
  console.log(`🎯 AUTO-MARKING: User at step ${currentStepId} (index ${currentIndex})`);
  
  // Mark all steps up to current as completed, but validate assessments
  for (let i = 0; i < currentIndex; i++) {
    const stepId = mainSequence[i];
    
    // Always mark regular steps as completed if user has progressed past them
    if (!['2-2', '3-2', '4-1'].includes(stepId)) {
      completedSteps.push(stepId);
      console.log(`  ✅ Auto-completed: ${stepId} (regular step)`);
    } else {
      // Assessment steps - validate but still mark as completed if user progressed
      const isValid = validateStepCompletionSimplified(stepId, userAssessments);
      completedSteps.push(stepId);
      
      if (isValid) {
        console.log(`  ✅ Auto-completed: ${stepId} (assessment validated)`);
      } else {
        console.log(`  ⚠️ Auto-completed: ${stepId} (assessment missing but user progressed)`);
      }
    }
  }
  
  console.log(`🎯 AUTO-MARKED COMPLETED:`, completedSteps);
  return completedSteps;
};

// Get next step prioritizing main sequence over resources
const getNextStepFromCompletedSteps = (completedSteps: string[]): string => {
  const mainSequence = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5'];
  
  // Priority 1: Continue main sequence
  for (const step of mainSequence) {
    if (!completedSteps.includes(step)) {
      return step;
    }
  }
  
  // Priority 2: If main sequence complete, point to resources (but user navigates via menu)
  const resources = ['5-1', '5-2', '5-3', '5-4', '6-1'];
  for (const step of resources) {
    if (!completedSteps.includes(step)) {
      return step;
    }
  }
  
  // All completed, stay at final main sequence step
  return '4-5';
};

export function useNavigationProgress() {
  const queryClient = useQueryClient();
  const debouncedSync = useRef<NodeJS.Timeout>();
  
  const [progress, setProgress] = useState<NavigationProgress>({
    completedSteps: [],
    currentStepId: '1-1',
    appType: 'ast',
    lastVisitedAt: new Date().toISOString(),
    unlockedSteps: ['1-1'],
    videoProgress: {}
  });

  // Get user assessments for completion detection
  const { data: userAssessments = {} } = useUserAssessments();

  // Load progress from database on mount with error recovery
  useEffect(() => {
    const loadProgress = async () => {
      try {
        console.log('🔄 SIMPLIFIED MODE: Loading progress from database...');
        const response = await fetch('/api/user/profile', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.user?.navigationProgress) {
            try {
              const dbProgress = JSON.parse(result.user.navigationProgress);
              
              // Auto-mark steps as completed up to current position
              let completedSteps = dbProgress.completedSteps || [];
              if (dbProgress.currentStepId && dbProgress.currentStepId !== '1-1') {
                const autoMarkedSteps = autoMarkStepsCompleted(dbProgress.currentStepId, userAssessments);
                // Merge with existing completed steps (user might have completed additional resource steps)
                const mergedSteps = [...new Set([...completedSteps, ...autoMarkedSteps])];
                completedSteps = mergedSteps;
                console.log(`🔄 AUTO-MARKED: Fixed completed steps for user at ${dbProgress.currentStepId}`);
              }
              
              const updatedProgress = {
                ...dbProgress,
                completedSteps,
                appType: 'ast',
                lastVisitedAt: new Date().toISOString(),
                unlockedSteps: calculateUnlockedSteps(completedSteps)
              };

              setProgress(prev => ({ ...prev, ...updatedProgress }));
              
              // Auto-save corrected progress back to database if we made changes
              if (completedSteps.length !== (dbProgress.completedSteps || []).length) {
                console.log('💾 AUTO-SAVING: Corrected completed steps to database');
                setTimeout(() => syncToDatabase(updatedProgress), 1000);
              }
              
              console.log('✅ SIMPLIFIED MODE: Progress loaded and corrected');
            } catch (parseError) {
              console.error('JSON parse error in navigation progress:', parseError);
              const fallbackProgress = handleJSONParseError(parseError as Error, result.user.navigationProgress);
              setProgress(prev => ({ ...prev, ...fallbackProgress }));
            }
          }
        } else {
          handleNetworkError(new Error(`HTTP ${response.status}`), 'loading user progress');
        }
      } catch (error) {
        console.error('❌ Error loading navigation progress:', error);
        handleNetworkError(error as Error, 'loading user progress');
      }
    };
    
    loadProgress();
  }, []);

  // Simplified database sync with debouncing
  const syncToDatabase = async (progressData: NavigationProgress) => {
    try {
      console.log('🔄 SIMPLIFIED MODE: Syncing to database...', progressData);
      const response = await fetch('/api/user/navigation-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          navigationProgress: JSON.stringify(progressData)
        })
      });
      
      if (response.ok) {
        console.log('✅ SIMPLIFIED MODE: Progress synced to database');
      } else {
        const error = await response.text();
        console.error('❌ SIMPLIFIED MODE: Failed to sync progress to database:', error);
      }
    } catch (error) {
      console.error('❌ SIMPLIFIED MODE: Error syncing progress:', error);
    }
  };

  // Debounced sync to reduce database calls
  const scheduleSync = (progressData: NavigationProgress) => {
    if (debouncedSync.current) {
      clearTimeout(debouncedSync.current);
    }
    debouncedSync.current = setTimeout(() => {
      syncToDatabase(progressData);
    }, 1000); // Sync after 1 second of inactivity
  };

  // Mode-aware validation
  const validateStepCompletion = (stepId: string): boolean => {
    if (CURRENT_PROGRESSION_MODE === 'simplified') {
      return validateStepCompletionSimplified(stepId, userAssessments);
    } else {
      return true; // Complex mode disabled for now
    }
  };

  // Enhanced video progress tracking with mode-aware logging
  const updateVideoProgress = (stepId: string, percentage: number, isResumption: boolean = false) => {
    const normalizedProgress = Math.min(100, Math.max(0, percentage));
    
    // Enhanced logging for simplified mode
    console.log(`🎬 VIDEO PROGRESS TRACKED (SIMPLIFIED MODE - not used for unlocking): ${stepId} = ${normalizedProgress}%`);
    
    // Continue all existing dual tracking logic for future restoration
    if (!(window as any).currentVideoProgress) {
      (window as any).currentVideoProgress = {};
    }
    
    if (!(window as any).currentVideoProgress[stepId] || typeof (window as any).currentVideoProgress[stepId] === 'number') {
      const existingProgress = (window as any).currentVideoProgress[stepId] || 0;
      (window as any).currentVideoProgress[stepId] = {
        farthest: typeof existingProgress === 'number' ? existingProgress : 0,
        current: normalizedProgress
      };
    }
    
    const globalData = (window as any).currentVideoProgress[stepId] as VideoProgressData;
    
    if (isResumption) {
      globalData.current = normalizedProgress;
      console.log(`  📍 SIMPLIFIED MODE: Updated current position (for resumption): ${normalizedProgress}%`);
    } else {
      globalData.current = normalizedProgress;
      globalData.farthest = Math.max(globalData.farthest, normalizedProgress);
      console.log(`  📊 SIMPLIFIED MODE: Tracked progress - current: ${normalizedProgress}%, farthest: ${globalData.farthest}%`);
    }
    
    // Continue database persistence but don't use for unlocking in simplified mode
    setProgress(prev => {
      const newProgress = {
        ...prev,
        videoProgress: {
          ...prev.videoProgress,
          [stepId]: {
            farthest: Math.max(globalData.farthest, prev.videoProgress[stepId]?.farthest || 0),
            current: normalizedProgress
          }
        },
        lastVisitedAt: new Date().toISOString()
      };
      
      // NOTE: In simplified mode, don't auto-complete based on video progress
      console.log(`📊 SIMPLIFIED MODE: Video progress saved but not used for step completion`);
      
      // Sync to database for future restoration
      scheduleSync(newProgress);
      
      return newProgress;
    });
  };

  // ENHANCED: Manual progression with immediate counter updates
  const markStepCompleted = (stepId: string) => {
    console.log(`🎯 SIMPLIFIED MODE: Manual progression - marking step ${stepId} completed`);
    
    // Check if already completed
    if (progress.completedSteps.includes(stepId)) {
      console.log(`Step ${stepId} already completed`);
      return;
    }
    
    // Validate completion (assessments/activities still required)
    if (!validateStepCompletion(stepId)) {
      console.log(`❌ Step ${stepId} validation failed - assessment/activity incomplete`);
      return;
    }
    
    console.log(`✅ SIMPLIFIED MODE: Completing step ${stepId} via Next button click`);
    
    setProgress(prev => {
      const newCompletedSteps = [...prev.completedSteps, stepId];
      const newUnlockedSteps = calculateUnlockedSteps(newCompletedSteps);
      const nextStepId = getNextStepFromCompletedSteps(newCompletedSteps);
      
      const newProgress = {
        ...prev,
        completedSteps: newCompletedSteps,
        currentStepId: nextStepId,
        unlockedSteps: newUnlockedSteps,
        lastVisitedAt: new Date().toISOString()
      };
      
      console.log(`📊 SIMPLIFIED MODE: Progress counters updated immediately`);
      console.log(`  ✅ Completed: ${newCompletedSteps.length} steps`);
      console.log(`  🔓 Unlocked: ${newUnlockedSteps.length} steps`);
      console.log(`  ➡️ Next step: ${nextStepId}`);
      
      // Sync to database
      scheduleSync(newProgress);
      
      return newProgress;
    });
  };

  // Set current step (for navigation)
  const setCurrentStep = (stepId: string) => {
    console.log(`🔄 SIMPLIFIED MODE: Navigating to step ${stepId}`);
    
    setProgress(prev => {
      const newProgress = {
        ...prev,
        currentStepId: stepId,
        lastVisitedAt: new Date().toISOString()
      };
      
      scheduleSync(newProgress);
      return newProgress;
    });
  };

  // Check if step is accessible (unlocked)
  const isStepAccessible = (stepId: string): boolean => {
    return progress.unlockedSteps.includes(stepId);
  };

  // Check if Next button should be enabled (simplified mode)
  const canProceedToNext = (stepId: string): boolean => {
    if (CURRENT_PROGRESSION_MODE === 'simplified') {
      return validateStepCompletion(stepId);
    }
    return true;
  };

  // Check if step should show green checkmark
  const shouldShowGreenCheckmark = (stepId: string): boolean => {
    return progress.completedSteps.includes(stepId);
  };

  // Get video progress for display (if needed)
  const getVideoProgress = (stepId: string): number => {
    return progress.videoProgress[stepId]?.current || 0;
  };

  // Next button functionality with validation and error messages
  const getNextStepForButton = (currentStepId: string): string | null => {
    const allSteps = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5', '5-1', '5-2', '5-3', '5-4', '6-1'];
    const currentIndex = allSteps.indexOf(currentStepId);
    
    // Main sequence progression
    const mainSequence = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5'];
    if (mainSequence.includes(currentStepId)) {
      const mainIndex = mainSequence.indexOf(currentStepId);
      if (mainIndex < mainSequence.length - 1) {
        return mainSequence[mainIndex + 1];
      }
    }
    
    // Resource sequence progression
    const resourceSteps = ['5-1', '5-2', '5-3', '5-4', '6-1'];
    if (resourceSteps.includes(currentStepId)) {
      const resourceIndex = resourceSteps.indexOf(currentStepId);
      if (resourceIndex < resourceSteps.length - 1) {
        return resourceSteps[resourceIndex + 1];
      }
    }
    
    return null; // No next step
  };

  const getNextButtonState = (stepId: string) => {
    const nextStepId = getNextStepForButton(stepId);
    const canProceed = validateStepCompletion(stepId);
    
    let errorMessage = null;
    if (!canProceed) {
      if (stepId === '2-2') {
        errorMessage = 'Complete the Star Card assessment to continue';
      } else if (stepId === '3-2') {
        errorMessage = 'Complete the Flow assessment to continue';
      } else if (stepId === '4-1') {
        errorMessage = 'Complete the Cantril Ladder activity to continue';
      } else {
        errorMessage = 'Complete this step to continue';
      }
    }
    
    return {
      enabled: canProceed && nextStepId !== null,
      nextStepId,
      errorMessage,
      isLastStep: nextStepId === null
    };
  };

  const handleNextButtonClick = async (currentStepId: string): Promise<{ success: boolean; error?: string; nextStepId?: string }> => {
    const buttonState = getNextButtonState(currentStepId);
    
    if (!buttonState.enabled) {
      return {
        success: false,
        error: buttonState.errorMessage || 'Cannot proceed to next step'
      };
    }
    
    if (buttonState.isLastStep) {
      return {
        success: false,
        error: 'You have reached the final step'
      };
    }
    
    try {
      // Mark current step as completed
      markStepCompleted(currentStepId);
      
      // Navigate to next step
      if (buttonState.nextStepId) {
        setCurrentStep(buttonState.nextStepId);
      }
      
      return {
        success: true,
        nextStepId: buttonState.nextStepId || undefined
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to navigate to next step'
      };
    }
  };

  // User restoration functionality
  const restoreUserToCurrentStep = async () => {
    const currentStep = progress.currentStepId;
    console.log(`🔄 Restoring user to current step: ${currentStep}`);
    // The actual navigation will be handled by the calling component
    return currentStep;
  };

  // Enhanced step state checking
  const isCurrentStep = (stepId: string): boolean => {
    return progress.currentStepId === stepId;
  };

  const canNavigateToStep = (stepId: string): boolean => {
    return progress.unlockedSteps.includes(stepId) || progress.completedSteps.includes(stepId);
  };

  const getStepDisplayState = (stepId: string) => {
    const isCompleted = progress.completedSteps.includes(stepId);
    const isCurrent = progress.currentStepId === stepId;
    const isUnlocked = progress.unlockedSteps.includes(stepId);
    const canNavigate = canNavigateToStep(stepId);
    
    return {
      isCompleted,
      isCurrent,
      isUnlocked,
      canNavigate,
      showGreenCheckmark: isCompleted,
      displayState: isCompleted ? 'completed' : isCurrent ? 'current' : isUnlocked ? 'unlocked' : 'locked'
    };
  };

  const handleStepNavigation = (stepId: string): boolean => {
    if (canNavigateToStep(stepId)) {
      setCurrentStep(stepId);
      return true;
    }
    return false;
  };

  // Legacy compatibility functions for archived hooks
  const isStepUnlocked = (stepId: string): boolean => {
    return progress.unlockedSteps.includes(stepId);
  };

  const isStepCompleted = (stepId: string): boolean => {
    return progress.completedSteps.includes(stepId);
  };

  const saveProgressToDatabase = () => {
    syncToDatabase(progress);
  };

  // Navigation sections compatibility
  const updateNavigationSections = () => {
    // No-op for simplified mode
  };

  const calculateOverallProgress = () => {
    const mainSequence = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5'];
    const completedMainSteps = progress.completedSteps.filter(step => mainSequence.includes(step));
    return Math.round((completedMainSteps.length / mainSequence.length) * 100);
  };

  // Check if congratulations modal should be shown (4-5 just completed)
  const shouldShowCongratulationsModal = (): boolean => {
    return progress.completedSteps.includes('4-5');
  };

  const currentStepId = progress.currentStepId;
  const completedSteps = progress.completedSteps;

  // Additional compatibility functions
  const getSectionProgressData = (stepIds: string[]) => {
    const completedCount = stepIds.filter(stepId => progress.completedSteps.includes(stepId)).length;
    return {
      completed: completedCount,
      total: stepIds.length,
      percentage: Math.round((completedCount / stepIds.length) * 100)
    };
  };

  const SECTION_STEPS = {
    introduction: ['1-1'],
    starStrengths: ['2-1', '2-2', '2-3', '2-4'],
    flow: ['3-1', '3-2', '3-3', '3-4'],
    wellbeing: ['4-1', '4-2', '4-3', '4-4', '4-5'],
    resources: ['5-1', '5-2', '5-3', '5-4'],
    workshop: ['6-1']
  };

  const getLastPosition = () => {
    // Return last video position data for resume functionality
    const videoSteps = ['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'];
    for (const stepId of videoSteps.reverse()) {
      const videoData = progress.videoProgress[stepId];
      if (videoData && videoData.current > 0) {
        return {
          stepId,
          position: videoData.current,
          duration: 100 // Simplified for compatibility
        };
      }
    }
    return null;
  };

  return {
    progress,
    updateVideoProgress,
    markStepCompleted,
    setCurrentStep,
    isStepAccessible,
    canProceedToNext,
    shouldShowGreenCheckmark,
    getVideoProgress,
    validateStepCompletion,
    isVideoStep: (stepId: string) => ['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'].includes(stepId),
    CURRENT_PROGRESSION_MODE,
    
    // Enhanced Next Button Functionality
    getNextStepId: getNextStepForButton,
    getNextButtonState,
    handleNextButtonClick,
    
    // User Restoration and Navigation
    restoreUserToCurrentStep,
    isCurrentStep,
    canNavigateToStep,
    getStepDisplayState,
    handleStepNavigation,
    
    // Legacy compatibility for existing code
    isStepUnlocked,
    isStepCompleted,
    saveProgressToDatabase,
    updateNavigationSections,
    calculateOverallProgress,
    currentStepId,
    completedSteps,
    
    // Additional compatibility exports
    getSectionProgressData,
    SECTION_STEPS,
    getLastPosition,
    
    // Additional aliases for compatibility
    updateCurrentStep: setCurrentStep,
    isStepAccessibleByProgression: isStepAccessible,
    getCurrentVideoProgress: (stepId: string) => progress.videoProgress[stepId]?.current || 0,
    
    // New completion modal detection
    shouldShowCongratulationsModal
  };
}