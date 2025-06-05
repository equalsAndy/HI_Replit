import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// FEATURE FLAG SYSTEM - Easy toggle for restoration
const PROGRESSION_MODE = {
  SIMPLIFIED: 'simplified',
  COMPLEX: 'complex'
} as const;

const CURRENT_PROGRESSION_MODE = 'simplified' as const;

interface NavigationProgress {
  completedSteps: string[];
  currentStepId: string;
  appType: 'ast' | 'ia' | null;
  lastVisitedAt: string;
  unlockedSteps: string[];
  videoProgress: { [stepId: string]: number };
  videoPositions: { [stepId: string]: number };
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
    staleTime: 10000 // Cache for 10 seconds
  });
};

export function useNavigationProgressSimplified() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [progress, setProgress] = useState<NavigationProgress>({
    completedSteps: [],
    currentStepId: '1-1', // Start with first step
    appType: 'ast',
    lastVisitedAt: new Date().toISOString(),
    unlockedSteps: ['1-1'], // Initialize with first step unlocked
    videoProgress: {},
    videoPositions: {}
  });

  // Get user assessments for completion detection
  const { data: userAssessments = {} } = useUserAssessments();

  // Load navigation progress from database on component mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        console.log('🔄 SIMPLIFIED MODE: Loading progress from database...');
        const response = await fetch('/api/user/navigation-progress', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.navigationProgress) {
            const dbProgress = JSON.parse(result.navigationProgress);
            
            setProgress(prev => ({
              ...prev,
              ...dbProgress,
              appType: 'ast',
              lastVisitedAt: new Date().toISOString()
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
      const response = await fetch('/api/user/navigation-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(progressData)
      });
      
      if (response.ok) {
        console.log('✅ SIMPLIFIED MODE: Progress synced to database');
      } else {
        console.error('❌ SIMPLIFIED MODE: Failed to sync progress to database');
      }
    } catch (error) {
      console.error('❌ SIMPLIFIED MODE: Error syncing progress:', error);
    }
  };

  // SIMPLIFIED MODE: Only validate non-video requirements
  const validateStepCompletion = (stepId: string): { isComplete: boolean; reason?: string } => {
    console.log(`🔍 SIMPLIFIED VALIDATION: Step ${stepId}`);
    
    // Assessment steps - still require completion
    if (stepId === '2-2') {
      const isValid = !!userAssessments?.starCard;
      console.log(`📋 Star Card assessment: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
      return { isComplete: isValid, reason: isValid ? undefined : 'Star Card assessment required' };
    }
    
    if (stepId === '3-2') {
      const isValid = !!userAssessments?.flowAssessment;
      console.log(`📋 Flow assessment: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
      return { isComplete: isValid, reason: isValid ? undefined : 'Flow assessment required' };
    }
    
    // Mixed requirement steps - only validate activity parts (not video)
    if (stepId === '4-1') {
      const isValid = !!userAssessments?.cantrilLadder;
      console.log(`🎚️ Cantril Ladder activity: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
      return { isComplete: isValid, reason: isValid ? undefined : 'Cantril Ladder activity required' };
    }
    
    if (stepId === '4-2') {
      const isValid = !!userAssessments?.cantrilLadderReflection;
      console.log(`📝 Well-being reflection: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
      return { isComplete: isValid, reason: isValid ? undefined : 'Well-being reflection required' };
    }
    
    // All other steps: Next button always active
    console.log(`✅ SIMPLIFIED MODE: Next button always active for ${stepId}`);
    return { isComplete: true };
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

  // Get next step ID
  const getNextStepId = (completedSteps: string[]): string | null => {
    const allSteps = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5'];
    
    for (const step of allSteps) {
      if (!completedSteps.includes(step)) {
        return step;
      }
    }
    
    return null; // All steps completed
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
    const validation = validateStepCompletion(stepId);
    if (!validation.isComplete) {
      console.log(`❌ Step ${stepId} validation failed - ${validation.reason}`);
      return;
    }
    
    console.log(`✅ SIMPLIFIED MODE: Completing step ${stepId} via Next button click`);
    
    setProgress(prev => {
      const newCompletedSteps = [...prev.completedSteps, stepId];
      const newUnlockedSteps = calculateUnlockedSteps(newCompletedSteps);
      const nextStepId = getNextStepId(newCompletedSteps) || stepId;
      
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
      syncToDatabase(newProgress);
      
      return newProgress;
    });
  };

  // KEEP: Enhanced video progress tracking with mode-aware logging
  const updateVideoProgress = (stepId: string, percentage: number, isPositionUpdate = false) => {
    const roundedProgress = Math.round(percentage * 100) / 100;
    
    if (isPositionUpdate) {
      // Update current position (for resume playback) - always update
      console.log(`🎬 SIMPLIFIED MODE: VIDEO POSITION UPDATE: ${stepId} = ${roundedProgress}%`);
      
      setProgress(prev => ({
        ...prev,
        videoPositions: {
          ...prev.videoPositions,
          [stepId]: roundedProgress
        }
      }));
      
      return;
    }
    
    console.log(`🎬 SIMPLIFIED MODE: VIDEO PROGRESS TRACKED (not used for unlocking): ${stepId} = ${roundedProgress}%`);
    
    setProgress(prev => {
      const newProgress = {
        ...prev,
        videoProgress: {
          ...prev.videoProgress,
          [stepId]: Math.max(roundedProgress, prev.videoProgress[stepId] || 0) // Always maintain highest progress
        },
        videoPositions: {
          ...prev.videoPositions,
          [stepId]: roundedProgress // Also update position for this progress update
        },
        lastVisitedAt: new Date().toISOString()
      };
      
      console.log(`📊 SIMPLIFIED MODE: Video progress saved but not used for step completion`);
      
      return newProgress;
    });
  };

  // Update current step
  const updateCurrentStep = (stepId: string, appType: 'ast' | 'ia' | null = null) => {
    setProgress(prev => ({
      ...prev,
      currentStepId: stepId,
      appType: appType || prev.appType,
      lastVisitedAt: new Date().toISOString()
    }));
  };

  // Reset progress
  const resetProgress = () => {
    const resetData = {
      completedSteps: [],
      currentStepId: '1-1',
      appType: 'ast' as const,
      lastVisitedAt: new Date().toISOString(),
      unlockedSteps: ['1-1'],
      videoProgress: {},
      videoPositions: {}
    };
    setProgress(resetData);
    syncToDatabase(resetData);
  };

  // Video step identification
  const isVideoStep = (stepId: string): boolean => {
    const videoSteps = ['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'];
    return videoSteps.includes(stepId);
  };

  // For Next button validation - simplified mode always allows proceeding (except assessments)
  const canProceedToNext = (stepId: string): boolean => {
    const validation = validateStepCompletion(stepId);
    return validation.isComplete;
  };

  // Check if step should show green checkmark (completed)
  const shouldShowGreenCheckmark = (stepId: string): boolean => {
    return progress.completedSteps.includes(stepId);
  };

  // Get current video progress
  const getCurrentVideoProgress = (stepId: string): number => {
    return progress.videoProgress[stepId] || 0;
  };

  // Get current video position (for resume)
  const getCurrentVideoPosition = (stepId: string): number => {
    return progress.videoPositions[stepId] || 0;
  };

  // Check if step is unlocked
  const isStepUnlocked = (stepId: string): boolean => {
    return progress.unlockedSteps.includes(stepId);
  };

  // Legacy compatibility functions
  const isStepCompleted = (stepId: string) => progress.completedSteps.includes(stepId);
  const getVideoProgress = (stepId: string) => getCurrentVideoProgress(stepId);
  const saveProgressToDatabase = () => syncToDatabase(progress);
  const syncWithDatabase = () => syncToDatabase(progress);

  return {
    progress,
    markStepCompleted,
    updateCurrentStep,
    resetProgress,
    updateVideoProgress,
    canProceedToNext,
    shouldShowGreenCheckmark,
    getCurrentVideoProgress,
    getCurrentVideoPosition,
    isVideoStep,
    isStepUnlocked,
    // Legacy compatibility
    isStepCompleted,
    getVideoProgress,
    saveProgressToDatabase,
    syncWithDatabase,
    loadFromDatabase: () => {}
  };
}