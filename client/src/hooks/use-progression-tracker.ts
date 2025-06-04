/**
 * AllStarTeams Progression Tracker Hook
 * Manages step completion tracking and validation according to progression rules
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ProgressionState, 
  canUnlockStep, 
  isStepCompleted, 
  getUnlockedSections, 
  getNextStep,
  getMenuItemName,
  getSectionProgress
} from '@/lib/progressionLogic';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UseProgressionTrackerReturn {
  progressionState: ProgressionState;
  isStepUnlocked: (stepId: string) => boolean;
  isStepCompleted: (stepId: string) => boolean;
  canUnlockStep: (stepId: string) => boolean;
  markStepCompleted: (stepId: string, data?: any) => Promise<void>;
  updateVideoProgress: (stepId: string, percentage: number) => void;
  saveAssessmentData: (stepId: string, data: any) => Promise<void>;
  saveReflectionData: (stepId: string, data: any) => Promise<void>;
  saveActivityData: (stepId: string, data: any) => Promise<void>;
  getUnlockedSections: () => string[];
  getNextUnlockedStep: () => string | null;
  getSectionProgress: (sectionId: string) => { completed: number; total: number };
  getNextButtonText: (currentStepId: string) => string;
  isLoading: boolean;
  error: string | null;
}

export function useProgressionTracker(): UseProgressionTrackerReturn {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [progressionState, setProgressionState] = useState<ProgressionState>({
    completedSteps: [],
    currentStepId: '1-1',
    videoProgress: {},
    assessmentResults: {},
    reflectionData: {},
    flowAttributesData: null,
    cantrailLadderData: null,
    visionBoardData: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load progression state from database
  const { data: serverProgressionState } = useQuery({
    queryKey: ['progression-state'],
    queryFn: async () => {
      const response = await fetch('/api/user/progression-state', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch progression state');
      return response.json();
    },
    refetchInterval: 30000 // Check for updates every 30 seconds
  });

  // Sync progression state with server data
  useEffect(() => {
    if (serverProgressionState?.success && serverProgressionState.data) {
      setProgressionState(prev => ({
        ...prev,
        ...serverProgressionState.data
      }));
    }
  }, [serverProgressionState]);

  // Save progression state to database
  const saveProgressionMutation = useMutation({
    mutationFn: async (data: Partial<ProgressionState>) => {
      return apiRequest('/api/user/progression-state', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progression-state'] });
    },
    onError: (error) => {
      console.error('Failed to save progression state:', error);
      setError('Failed to save progress');
    }
  });

  // Check if step is unlocked
  const isStepUnlocked = useCallback((stepId: string): boolean => {
    return canUnlockStep(stepId, progressionState);
  }, [progressionState]);

  // Check if step is completed
  const isStepCompletedCheck = useCallback((stepId: string): boolean => {
    return isStepCompleted(stepId, progressionState);
  }, [progressionState]);

  // Mark step as completed
  const markStepCompleted = useCallback(async (stepId: string, data?: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedState = {
        ...progressionState,
        completedSteps: progressionState.completedSteps.includes(stepId) 
          ? progressionState.completedSteps 
          : [...progressionState.completedSteps, stepId],
        currentStepId: stepId
      };

      // Add any additional data
      if (data) {
        if (data.type === 'assessment') {
          updatedState.assessmentResults = {
            ...updatedState.assessmentResults,
            [stepId]: data
          };
        } else if (data.type === 'reflection') {
          updatedState.reflectionData = {
            ...updatedState.reflectionData,
            [stepId]: data
          };
        } else if (data.type === 'activity') {
          if (stepId === '3-4') {
            updatedState.flowAttributesData = data;
          } else if (stepId === '4-1') {
            updatedState.cantrailLadderData = data;
          } else if (stepId === '4-3') {
            updatedState.visionBoardData = data;
          }
        }
      }

      setProgressionState(updatedState);
      await saveProgressionMutation.mutateAsync(updatedState);

      toast({
        title: "Progress Saved",
        description: `Completed: ${getMenuItemName(stepId)}`,
      });

    } catch (error) {
      console.error('Error marking step completed:', error);
      setError('Failed to save step completion');
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [progressionState, saveProgressionMutation, toast]);

  // Update video progress
  const updateVideoProgress = useCallback((stepId: string, percentage: number) => {
    setProgressionState(prev => ({
      ...prev,
      videoProgress: {
        ...prev.videoProgress,
        [stepId]: percentage
      }
    }));

    // Auto-save video progress
    const updatedState = {
      ...progressionState,
      videoProgress: {
        ...progressionState.videoProgress,
        [stepId]: percentage
      }
    };
    saveProgressionMutation.mutate(updatedState);
  }, [progressionState, saveProgressionMutation]);

  // Save assessment data
  const saveAssessmentData = useCallback(async (stepId: string, data: any) => {
    const assessmentData = {
      ...data,
      type: 'assessment',
      completed: true,
      completedAt: new Date().toISOString()
    };

    await markStepCompleted(stepId, assessmentData);
  }, [markStepCompleted]);

  // Save reflection data
  const saveReflectionData = useCallback(async (stepId: string, data: any) => {
    const reflectionData = {
      ...data,
      type: 'reflection',
      allAnswered: true,
      completedAt: new Date().toISOString()
    };

    await markStepCompleted(stepId, reflectionData);
  }, [markStepCompleted]);

  // Save activity data
  const saveActivityData = useCallback(async (stepId: string, data: any) => {
    const activityData = {
      ...data,
      type: 'activity',
      completed: true,
      completedAt: new Date().toISOString()
    };

    await markStepCompleted(stepId, activityData);
  }, [markStepCompleted]);

  // Get unlocked sections
  const getUnlockedSectionsFunc = useCallback((): string[] => {
    return getUnlockedSections(progressionState.completedSteps);
  }, [progressionState.completedSteps]);

  // Get next unlocked step
  const getNextUnlockedStep = useCallback((): string | null => {
    return getNextStep(progressionState.completedSteps);
  }, [progressionState.completedSteps]);

  // Get section progress
  const getSectionProgressFunc = useCallback((sectionId: string) => {
    return getSectionProgress(sectionId, progressionState.completedSteps);
  }, [progressionState.completedSteps]);

  // Get next button text
  const getNextButtonText = useCallback((currentStepId: string): string => {
    const nextStep = getNextStep(progressionState.completedSteps);
    if (!nextStep) return "Workshop Complete";
    
    const nextStepName = getMenuItemName(nextStep);
    return `Next: ${nextStepName}`;
  }, [progressionState.completedSteps]);

  return {
    progressionState,
    isStepUnlocked,
    isStepCompleted: isStepCompletedCheck,
    canUnlockStep: isStepUnlocked,
    markStepCompleted,
    updateVideoProgress,
    saveAssessmentData,
    saveReflectionData,
    saveActivityData,
    getUnlockedSections: getUnlockedSectionsFunc,
    getNextUnlockedStep,
    getSectionProgress: getSectionProgressFunc,
    getNextButtonText,
    isLoading,
    error
  };
}