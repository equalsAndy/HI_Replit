import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface ProgressionState {
  completedSteps: string[];
  currentUnlockedStep: string;
  videoWatchProgress: Record<string, number>;
  assessmentResults: Record<string, any>;
}

interface ProgressionLogic {
  completedSteps: string[];
  isStepUnlocked: (stepId: string) => boolean;
  isStepCompleted: (stepId: string) => boolean;
  markStepCompleted: (stepId: string) => void;
  markVideoWatched: (stepId: string, watchPercent: number) => void;
  saveAssessmentResult: (stepId: string, result: any) => void;
  getNextUnlockedStep: () => string | null;
  getProgressCount: () => { completed: number; total: number };
}

// Sequential progression order for Imaginal Agility
const IA_STEP_PROGRESSION_ORDER = [
  'ia-1-1', // Introduction to Imaginal Agility
  'ia-2-1', // The Triple Challenge
  'ia-3-1', // The Imaginal Agility Solution
  'ia-4-1', // Your 5 Capabilities (5Cs) / Self-Assessment
  'ia-5-1', // Assessment Results
  'ia-6-1', // Teamwork Preparation
  'ia-7-1', // Reality Discernment
  'ia-8-1', // The Neuroscience
  'ia-9-1'  // Next Steps
];

export const useProgressionLogic = (): ProgressionLogic => {
  const [progressionState, setProgressionState] = useState<ProgressionState>({
    completedSteps: [],
    currentUnlockedStep: 'ia-1-1', // Always start with first IA step unlocked
    videoWatchProgress: {},
    assessmentResults: {}
  });

  // Load progression state from database on mount
  useEffect(() => {
    const loadProgressionState = async () => {
      try {
        const response = await apiRequest('/api/user/navigation-progress');
        if (response.navigationProgress) {
          const dbProgress = response.navigationProgress;
          setProgressionState({
            completedSteps: dbProgress.completedSteps || [],
            currentUnlockedStep: dbProgress.currentStepId || 'ia-1-1',
            videoWatchProgress: dbProgress.videoWatchProgress || {},
            assessmentResults: dbProgress.assessmentResults || {}
          });
        }
      } catch (error) {
        console.error('Failed to load progression state:', error);
        // Start with default state if loading fails
      }
    };

    loadProgressionState();
  }, []);

  // Save progression state to database
  const saveProgressionState = async (newState: ProgressionState) => {
    try {
      await apiRequest('/api/user/navigation-progress', {
        method: 'POST',
        body: JSON.stringify({
          appType: 'imaginal-agility',
          completedSteps: newState.completedSteps,
          currentStepId: newState.currentUnlockedStep,
          videoWatchProgress: newState.videoWatchProgress,
          assessmentResults: newState.assessmentResults
        })
      });
    } catch (error) {
      console.error('Failed to save progression state:', error);
    }
  };

  // Check if a step is unlocked based on progression rules
  const isStepUnlocked = (stepId: string): boolean => {
    const stepIndex = IA_STEP_PROGRESSION_ORDER.indexOf(stepId);
    if (stepIndex === -1) return false;
    
    // First step is always unlocked
    if (stepIndex === 0) return true;
    
    // Step is unlocked if the previous step is completed
    const previousStepId = IA_STEP_PROGRESSION_ORDER[stepIndex - 1];
    return progressionState.completedSteps.includes(previousStepId);
  };

  // Check if a step is completed
  const isStepCompleted = (stepId: string): boolean => {
    return progressionState.completedSteps.includes(stepId);
  };

  // Mark a step as completed and unlock the next step
  const markStepCompleted = (stepId: string) => {
    if (progressionState.completedSteps.includes(stepId)) return;

    const newCompletedSteps = [...progressionState.completedSteps, stepId];
    const stepIndex = IA_STEP_PROGRESSION_ORDER.indexOf(stepId);
    const nextStepId = stepIndex < IA_STEP_PROGRESSION_ORDER.length - 1 
      ? IA_STEP_PROGRESSION_ORDER[stepIndex + 1] 
      : stepId;

    const newState = {
      ...progressionState,
      completedSteps: newCompletedSteps,
      currentUnlockedStep: nextStepId
    };

    setProgressionState(newState);
    saveProgressionState(newState);
  };

  // Track video watch progress
  const markVideoWatched = (stepId: string, watchPercent: number) => {
    const newState = {
      ...progressionState,
      videoWatchProgress: {
        ...progressionState.videoWatchProgress,
        [stepId]: watchPercent
      }
    };

    setProgressionState(newState);
    
    // If minimum watch requirement is met, mark step as completed
    if (watchPercent >= 1) { // 1% minimum as specified
      markStepCompleted(stepId);
    }
  };

  // Save assessment results
  const saveAssessmentResult = (stepId: string, result: any) => {
    const newState = {
      ...progressionState,
      assessmentResults: {
        ...progressionState.assessmentResults,
        [stepId]: result
      }
    };

    setProgressionState(newState);
    saveProgressionState(newState);
    
    // Mark assessment step as completed
    markStepCompleted(stepId);
  };

  // Get next unlocked step
  const getNextUnlockedStep = (): string | null => {
    for (const stepId of IA_STEP_PROGRESSION_ORDER) {
      if (!progressionState.completedSteps.includes(stepId) && isStepUnlocked(stepId)) {
        return stepId;
      }
    }
    return null; // All steps completed
  };

  // Get progress count for display
  const getProgressCount = () => {
    return {
      completed: progressionState.completedSteps.length,
      total: IA_STEP_PROGRESSION_ORDER.length
    };
  };

  return {
    completedSteps: progressionState.completedSteps,
    isStepUnlocked,
    isStepCompleted,
    markStepCompleted,
    markVideoWatched,
    saveAssessmentResult,
    getNextUnlockedStep,
    getProgressCount
  };
};