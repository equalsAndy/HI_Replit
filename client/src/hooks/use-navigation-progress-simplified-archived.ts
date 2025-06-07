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
  
  if (stepId === '4-2') {
    const isValid = !!userAssessments?.cantrilLadderReflection;
    console.log(`📝 Well-being reflection: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
    return isValid;
  }
  
  // All other steps: Next button always active
  console.log(`✅ SIMPLIFIED MODE: Next button always active for ${stepId}`);
  return true;
};

// SIMPLIFIED: Linear progression only
const calculateUnlockedSteps = (completedSteps: string[]): string[] => {
  const allSteps = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5'];
  const unlocked = ['1-1']; // First step always unlocked
  
  // Simple linear unlocking: each completed step unlocks exactly the next one
  for (let i = 0; i < allSteps.length - 1; i++) {
    const currentStep = allSteps[i];
    const nextStep = allSteps[i + 1];
    
    if (completedSteps.includes(currentStep)) {
      unlocked.push(nextStep);
      console.log(`📝 SIMPLIFIED MODE: Step ${currentStep} completed → unlocked ${nextStep}`);
    }
  }
  
  console.log('🔓 SIMPLIFIED MODE: Unlocked steps (linear only):', unlocked);
  return unlocked;
};

// Get next step in linear sequence
const getNextStepId = (completedSteps: string[]): string => {
  const allSteps = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5'];
  
  for (const step of allSteps) {
    if (!completedSteps.includes(step)) {
      return step;
    }
  }
  
  // All steps completed, return last step
  return allSteps[allSteps.length - 1];
};

export function useNavigationProgressSimplified() {
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

  // Load progress from database on mount
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
            const dbProgress = JSON.parse(result.user.navigationProgress);
            
            setProgress(prev => ({
              ...prev,
              ...dbProgress,
              appType: 'ast',
              lastVisitedAt: new Date().toISOString(),
              unlockedSteps: calculateUnlockedSteps(dbProgress.completedSteps || [])
            }));
            
            console.log('✅ SIMPLIFIED MODE: Progress loaded from database');
          }
        }
      } catch (error) {
        console.error('❌ Error loading navigation progress:', error);
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
      const nextStepId = getNextStepId(newCompletedSteps);
      
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
    CURRENT_PROGRESSION_MODE
  };
}