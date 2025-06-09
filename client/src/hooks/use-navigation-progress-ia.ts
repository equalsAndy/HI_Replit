import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

// Query for IA user assessments
const useIAUserAssessments = () => {
  return useQuery({
    queryKey: ['ia-user-assessments'],
    queryFn: async () => {
      const response = await fetch('/api/workshop-data/userAssessments', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch IA assessments');
      const result = await response.json();
      return result.currentUser?.assessments || {};
    },
    staleTime: 10000,
    retry: false
  });
};

// IA Step validation - simplified progression model
const validateIAStepCompletion = (stepId: string, userAssessments: any): boolean => {
  console.log(`🔍 IA VALIDATION: Step ${stepId}`);
  
  // Assessment step - requires completion
  if (stepId === 'ia-4-1') {
    const isValid = !!userAssessments?.iaCoreCabilities;
    console.log(`📋 IA Core Capabilities assessment: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
    return isValid;
  }
  
  // Video and content steps - always valid (no video progress requirements)
  console.log(`✅ IA MODE: Step ${stepId} always valid (video/content step)`);
  return true;
};

// Calculate unlocked steps for IA
const calculateIAUnlockedSteps = (completedSteps: string[]): string[] => {
  const iaSequence = ['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-4-2'];
  const unlocked = ['ia-1-1']; // First step always unlocked
  
  // Linear progression: each completed step unlocks the next one
  for (let i = 0; i < iaSequence.length - 1; i++) {
    const currentStep = iaSequence[i];
    const nextStep = iaSequence[i + 1];
    
    if (completedSteps.includes(currentStep) && !unlocked.includes(nextStep)) {
      unlocked.push(nextStep);
      console.log(`📝 IA MODE: Step ${currentStep} completed → unlocked ${nextStep}`);
    }
  }
  
  console.log('🔓 IA MODE: Unlocked steps:', unlocked);
  return unlocked;
};

// Auto-mark IA steps as completed up to current position
const autoMarkIAStepsCompleted = (currentStepId: string, userAssessments: any): string[] => {
  const iaSequence = ['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-4-2'];
  const currentIndex = iaSequence.indexOf(currentStepId);
  const completedSteps: string[] = [];
  
  if (currentIndex <= 0) {
    return []; // At or before first step
  }
  
  console.log(`🎯 IA AUTO-MARKING: User at step ${currentStepId} (index ${currentIndex})`);
  
  // Mark all steps up to current as completed
  for (let i = 0; i < currentIndex; i++) {
    const stepId = iaSequence[i];
    
    // Assessment step - validate but still mark as completed if user progressed
    if (stepId === 'ia-4-1') {
      const isValid = validateIAStepCompletion(stepId, userAssessments);
      completedSteps.push(stepId);
      
      if (isValid) {
        console.log(`  ✅ IA Auto-completed: ${stepId} (assessment validated)`);
      } else {
        console.log(`  ⚠️ IA Auto-completed: ${stepId} (assessment missing but user progressed)`);
      }
    } else {
      // Video/content steps - always mark as completed
      completedSteps.push(stepId);
      console.log(`  ✅ IA Auto-completed: ${stepId} (video/content step)`);
    }
  }
  
  console.log(`🎯 IA AUTO-MARKED COMPLETED:`, completedSteps);
  return completedSteps;
};

// Get next step from completed steps
const getNextIAStepFromCompletedSteps = (completedSteps: string[]): string => {
  const iaSequence = ['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-4-2'];
  
  // Find first uncompleted step
  for (const step of iaSequence) {
    if (!completedSteps.includes(step)) {
      return step;
    }
  }
  
  // All steps complete - return last step
  return 'ia-4-2';
};

// JSON parsing with error recovery
const handleIAJSONParseError = (error: Error, rawData: string): IANavigationProgress => {
  console.error('Failed to parse IA navigation progress:', error);
  
  // Return safe default state for IA
  return {
    completedSteps: [],
    currentStepId: 'ia-1-1',
    appType: 'ia',
    lastVisitedAt: new Date().toISOString(),
    unlockedSteps: ['ia-1-1'],
    videoProgress: {}
  };
};

// Main IA navigation progress hook
export const useIANavigationProgress = () => {
  const queryClient = useQueryClient();
  const [localProgress, setLocalProgress] = useState<IANavigationProgress | null>(null);
  const { data: userAssessments } = useIAUserAssessments();
  
  // Query for navigation progress with IA app type
  const { data: navigationData, isLoading, error } = useQuery({
    queryKey: ['ia-navigation-progress'],
    queryFn: async () => {
      const response = await fetch('/api/user/navigation-progress', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch IA navigation progress');
      const result = await response.json();
      return result.progress;
    },
    staleTime: 5000,
    retry: 1
  });

  // Process navigation data
  useEffect(() => {
    if (!navigationData) return;

    try {
      let progress: IANavigationProgress;
      
      if (typeof navigationData === 'string') {
        progress = JSON.parse(navigationData);
      } else {
        progress = navigationData;
      }

      // Only process IA app type data
      if (progress?.appType !== 'ia') {
        // Initialize IA navigation if user doesn't have IA progress yet
        progress = {
          completedSteps: [],
          currentStepId: 'ia-1-1',
          appType: 'ia',
          lastVisitedAt: new Date().toISOString(),
          unlockedSteps: ['ia-1-1'],
          videoProgress: {}
        };
      }

      // Auto-mark completed steps if needed
      if (userAssessments && progress.currentStepId) {
        const autoCompletedSteps = autoMarkIAStepsCompleted(progress.currentStepId, userAssessments);
        
        // Merge with existing completed steps
        const allCompletedSteps = [...new Set([...progress.completedSteps, ...autoCompletedSteps])];
        
        if (allCompletedSteps.length !== progress.completedSteps.length) {
          progress.completedSteps = allCompletedSteps;
          console.log('🔄 IA Updated completed steps:', allCompletedSteps);
        }
      }

      // Calculate unlocked steps
      progress.unlockedSteps = calculateIAUnlockedSteps(progress.completedSteps);

      setLocalProgress(progress);
      
    } catch (error) {
      console.error('Error processing IA navigation data:', error);
      const fallbackProgress = handleIAJSONParseError(error as Error, navigationData as string);
      setLocalProgress(fallbackProgress);
    }
  }, [navigationData, userAssessments]);

  // Mark step as completed
  const markStepCompleted = async (stepId: string): Promise<boolean> => {
    if (!localProgress) return false;

    console.log(`📝 IA Marking step completed: ${stepId}`);

    try {
      // Update local state
      const updatedCompletedSteps = [...new Set([...localProgress.completedSteps, stepId])];
      const unlockedSteps = calculateIAUnlockedSteps(updatedCompletedSteps);
      
      const updatedProgress: IANavigationProgress = {
        ...localProgress,
        completedSteps: updatedCompletedSteps,
        currentStepId: getNextIAStepFromCompletedSteps(updatedCompletedSteps),
        unlockedSteps,
        lastVisitedAt: new Date().toISOString()
      };

      setLocalProgress(updatedProgress);

      // Save to database
      const response = await fetch('/api/user/navigation-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedProgress)
      });

      if (response.ok) {
        console.log(`✅ IA Step ${stepId} marked as completed`);
        queryClient.invalidateQueries({ queryKey: ['ia-navigation-progress'] });
        return true;
      } else {
        console.error(`❌ Failed to mark IA step ${stepId} as completed`);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Error marking IA step ${stepId} as completed:`, error);
      return false;
    }
  };

  // Update video progress
  const updateVideoProgress = async (stepId: string, progressData: VideoProgressData): Promise<void> => {
    if (!localProgress) return;

    try {
      const updatedProgress = {
        ...localProgress,
        videoProgress: {
          ...localProgress.videoProgress,
          [stepId]: progressData
        },
        lastVisitedAt: new Date().toISOString()
      };

      setLocalProgress(updatedProgress);

      // Save to database (debounced)
      await fetch('/api/user/navigation-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedProgress)
      });

      console.log(`📹 IA Video progress updated for ${stepId}:`, progressData);
      
    } catch (error) {
      console.error(`❌ Error updating IA video progress for ${stepId}:`, error);
    }
  };

  // Check if step is completed
  const isStepCompleted = (stepId: string): boolean => {
    const completed = localProgress?.completedSteps.includes(stepId) || false;
    console.log(`🔍 IA MODE: Step ${stepId} completion check - completed: ${completed}`);
    return completed;
  };

  // Check if step is accessible
  const isStepAccessible = (stepId: string): boolean => {
    const accessible = localProgress?.unlockedSteps.includes(stepId) || false;
    console.log(`🔓 IA Step accessibility check: ${stepId} - unlocked: ${accessible}, available steps: ${localProgress?.unlockedSteps.join(', ')}`);
    return accessible;
  };

  // Check if next button should be enabled
  const isNextButtonEnabled = (stepId: string): boolean => {
    // Assessment step - requires completion
    if (stepId === 'ia-4-1') {
      const isValid = userAssessments && validateIAStepCompletion(stepId, userAssessments);
      console.log(`🔘 IA Next button for ${stepId}: ${isValid ? 'ENABLED' : 'DISABLED'} (assessment required)`);
      return isValid;
    }
    
    // Video/content steps - always enabled
    console.log(`🔘 IA Next button for ${stepId}: ENABLED (video/content step)`);
    return true;
  };

  return {
    progress: localProgress,
    isLoading,
    error,
    markStepCompleted,
    updateVideoProgress,
    isStepCompleted,
    isStepAccessible,
    isNextButtonEnabled
  };
};