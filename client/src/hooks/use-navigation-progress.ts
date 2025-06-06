import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface NavigationProgress {
  completedSteps: string[];
  currentStepId: string;
  appType: 'ast' | 'ia' | null;
  lastVisitedAt: string;
  unlockedSections: string[];
  unlockedSteps?: string[]; // Added for step-level unlocking
  videoProgress: { [stepId: string]: number };
  videoPositions: { [stepId: string]: number }; // New: track current playback positions
}

// Query for user assessments to check completion states
const useUserAssessments = () => {
  return useQuery({
    queryKey: ['user-assessments'],
    queryFn: async () => {
      const response = await fetch('/api/user/assessments', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch assessments');
      const result = await response.json();
      console.log('📊 User assessments loaded:', result);
      return result.currentUser || {};
    },
    staleTime: 5000,
    retry: 1
  });
};

export function useNavigationProgress() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const lastKnownProgressRef = useRef<NavigationProgress | null>(null);

  const [progress, setProgress] = useState<NavigationProgress>({
    completedSteps: [],
    currentStepId: '1-1', // Start with first step
    appType: 'ast',
    lastVisitedAt: new Date().toISOString(),
    unlockedSections: ['1'], // Only Introduction is unlocked initially
    unlockedSteps: ['1-1'], // Initialize with first step unlocked
    videoProgress: {},
    videoPositions: {} // New: track current playback positions
  });

  // Load navigation progress from database on component mount
  useEffect(() => {
    console.log('🔄 Loading progress from database...');
    
    const loadProgressFromDatabase = async () => {
      try {
        const response = await fetch('/api/user/navigation-progress', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Database progress loaded:', data);
          
          if (data.progress) {
            let dbProgress;
            
            console.log('📊 Raw progress data:', data.progress);
            
            // Handle deeply nested JSON structure
            if (typeof data.progress === 'string') {
              try {
                let currentData = data.progress;
                let parseLevel = 0;
                
                // Keep parsing until we get to actual progress data
                while (typeof currentData === 'string' && parseLevel < 5) {
                  const parsed = JSON.parse(currentData);
                  console.log(`📊 Parse level ${parseLevel}:`, parsed);
                  
                  if (parsed.navigationProgress && typeof parsed.navigationProgress === 'string') {
                    currentData = parsed.navigationProgress;
                    parseLevel++;
                  } else if (parsed.completedSteps || parsed.currentStepId) {
                    // Found actual progress data
                    dbProgress = parsed;
                    break;
                  } else {
                    // This might be the progress data itself
                    dbProgress = parsed;
                    break;
                  }
                }
                
                // If we still have a string, try one more parse
                if (typeof currentData === 'string' && !dbProgress) {
                  dbProgress = JSON.parse(currentData);
                }
                
                console.log('📊 Final parsed progress:', dbProgress);
              } catch (error) {
                console.error('❌ Failed to parse progress:', error);
                dbProgress = null;
              }
            } else {
              dbProgress = data.progress;
              console.log('📊 Using object progress:', dbProgress);
            }
            
            if (dbProgress && (dbProgress.completedSteps || dbProgress.currentStepId)) {
              // Apply loaded progress
              const loadedProgress = {
                completedSteps: dbProgress.completedSteps || [],
                currentStepId: dbProgress.currentStepId || '1-1',
                appType: dbProgress.appType || 'ast' as const,
                lastVisitedAt: dbProgress.lastVisitedAt || new Date().toISOString(),
                unlockedSections: dbProgress.unlockedSections || ['1'],
                unlockedSteps: dbProgress.unlockedSteps || ['1-1'],
                videoProgress: dbProgress.videoProgress || {},
                videoPositions: dbProgress.videoPositions || {}
              };
            
              console.log('✅ Setting loaded progress:', loadedProgress);
              setProgress(loadedProgress);
              
              // Auto-navigate to current step
              if (loadedProgress.currentStepId && loadedProgress.currentStepId !== '1-1') {
                console.log(`🧭 Auto-navigating to step: ${loadedProgress.currentStepId}`);
                
                const stepContentMap = {
                  '1-1': 'welcome',
                  '2-1': 'intro-strengths', 
                  '2-2': 'strengths-assessment',
                  '2-3': 'star-card-preview',
                  '2-4': 'reflection-2-4',
                  '3-1': 'intro-flow',
                  '3-2': 'flow-assessment',
                  '3-3': 'rounding-out',
                  '3-4': 'reflection-3-4',
                  '4-1': 'ladder-wellbeing',
                  '4-2': 'reflection-4-2',
                  '4-3': 'potential-visualization',
                  '4-4': 'future-self'
                };
                
                const targetContent = stepContentMap[loadedProgress.currentStepId];
                if (targetContent) {
                  console.log(`🧭 Dispatching auto-navigation to: ${targetContent}`);
                  window.dispatchEvent(new CustomEvent('autoNavigateToContent', {
                    detail: { 
                      content: targetContent, 
                      stepId: loadedProgress.currentStepId 
                    }
                  }));
                }
              }
            } else {
              console.log('⚠️ No valid progress data found, using defaults');
            }
          }
        } else {
          console.log('⚠️ Failed to load progress, using defaults');
        }
      } catch (error) {
        console.error('❌ Error loading progress:', error);
      }
    };
    
    loadProgressFromDatabase();
  }, []);

  // Get user assessments for completion detection
  const { data: userAssessments = {} } = useUserAssessments();

  const recalculateProgress = (): NavigationProgress => {
    const currentProgress = { ...progress };
    
    // Step completion detection
    const isStepCompleted = (stepId: string): boolean => {
      // Assessment steps require actual completion from database
      if (stepId === '2-2') {
        const hasStarCard = !!(userAssessments?.starCard || userAssessments?.assessments?.starCard);
        console.log(`🔍 Step 2-2 completion check - hasStarCard: ${hasStarCard}`);
        return hasStarCard;
      }
      if (stepId === '3-2') {
        const hasFlowAssessment = !!(userAssessments?.flowAssessment || userAssessments?.assessments?.flowAssessment);
        console.log(`🔍 Step 3-2 completion check - hasFlowAssessment: ${hasFlowAssessment}`);
        return hasFlowAssessment;
      }
      if (stepId === '3-4') {
        const hasFlowAttributes = !!(userAssessments?.flowAttributes || userAssessments?.assessments?.flowAttributes);
        console.log(`🔍 Step 3-4 completion check - hasFlowAttributes: ${hasFlowAttributes}`);
        return hasFlowAttributes;
      }
      if (stepId === '4-1') {
        const hasCantrilLadder = !!(userAssessments?.cantrilLadder || userAssessments?.assessments?.cantrilLadder);
        console.log(`🔍 Step 4-1 completion check - hasCantrilLadder: ${hasCantrilLadder}`);
        return hasCantrilLadder;
      }
      
      // For content/video steps, check if they should be auto-completed based on next assessment completion
      if (stepId === '2-1' && (userAssessments?.starCard || userAssessments?.assessments?.starCard)) {
        console.log(`🔍 Step 2-1 auto-completion - starCard exists`);
        return true;
      }
      if (stepId === '2-3' && (userAssessments?.stepByStepReflection || userAssessments?.assessments?.stepByStepReflection)) {
        console.log(`🔍 Step 2-3 auto-completion - stepByStepReflection exists`);
        return true;
      }
      if (stepId === '2-4' && (userAssessments?.roundingOutReflection || userAssessments?.assessments?.roundingOutReflection)) {
        console.log(`🔍 Step 2-4 auto-completion - roundingOutReflection exists`);
        return true;
      }
      if (stepId === '3-1' && (userAssessments?.flowAssessment || userAssessments?.assessments?.flowAssessment)) {
        console.log(`🔍 Step 3-1 auto-completion - flowAssessment exists`);
        return true;
      }
      if (stepId === '3-3' && (userAssessments?.flowAttributes || userAssessments?.assessments?.flowAttributes)) {
        console.log(`🔍 Step 3-3 auto-completion - flowAttributes exists`);
        return true;
      }
      
      // All other steps rely on explicit completion tracking
      const isMarkedComplete = currentProgress.completedSteps.includes(stepId);
      console.log(`🔍 Step ${stepId} completion check - isMarkedComplete: ${isMarkedComplete}`);
      return isMarkedComplete;
    };

    // Recalculate completed steps
    const allSteps = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4'];
    const newCompletedSteps = allSteps.filter(isStepCompleted);
    
    // Calculate unlocked steps - sequential unlocking
    const unlockedSteps = new Set(['1-1']); // Always unlock first step
    
    // Progressive step unlocking logic
    if (newCompletedSteps.includes('1-1')) {
      unlockedSteps.add('2-1');
    }
    if (newCompletedSteps.includes('2-1')) {
      unlockedSteps.add('2-2');
    }
    if (newCompletedSteps.includes('2-2')) {
      unlockedSteps.add('2-3');
    }
    if (newCompletedSteps.includes('2-3')) {
      unlockedSteps.add('2-4');
    }
    if (newCompletedSteps.includes('2-4')) {
      unlockedSteps.add('3-1');
    }
    if (newCompletedSteps.includes('3-1')) {
      unlockedSteps.add('3-2');
    }
    if (newCompletedSteps.includes('3-2')) {
      unlockedSteps.add('3-3');
    }
    if (newCompletedSteps.includes('3-3')) {
      unlockedSteps.add('3-4');
    }
    if (newCompletedSteps.includes('3-4')) {
      unlockedSteps.add('4-1');
    }
    if (newCompletedSteps.includes('4-1')) {
      unlockedSteps.add('4-2');
    }
    if (newCompletedSteps.includes('4-2')) {
      unlockedSteps.add('4-3');
    }
    if (newCompletedSteps.includes('4-3')) {
      unlockedSteps.add('4-4');
    }
    
    // Calculate unlocked sections based on unlocked steps
    const unlockedSections = new Set(['1']); // Always unlock section 1
    if (Array.from(unlockedSteps).some(step => step.startsWith('2-'))) {
      unlockedSections.add('2');
    }
    if (Array.from(unlockedSteps).some(step => step.startsWith('3-'))) {
      unlockedSections.add('3');
    }
    if (Array.from(unlockedSteps).some(step => step.startsWith('4-'))) {
      unlockedSections.add('4');
    }

    // Calculate the current step ID based on progress
    const allStepsInOrder = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5'];
    let currentStepId = '1-1'; // Default to first step
    
    // Find the first incomplete step as the current step
    for (const stepId of allStepsInOrder) {
      if (!newCompletedSteps.includes(stepId)) {
        currentStepId = stepId;
        break;
      }
    }
    
    // If all steps are complete, stay on the last step
    if (newCompletedSteps.length === allStepsInOrder.length) {
      currentStepId = allStepsInOrder[allStepsInOrder.length - 1];
    }
    
    console.log(`🎯 Current step calculated as: ${currentStepId} (completed: ${newCompletedSteps.length}/${allStepsInOrder.length})`);

    return {
      ...currentProgress,
      completedSteps: newCompletedSteps,
      currentStepId,
      unlockedSections: Array.from(unlockedSections),
      unlockedSteps: Array.from(unlockedSteps)
    };
  };

  const syncProgressToDatabase = async (progressData: NavigationProgress) => {
    try {
      console.log('🔄 Syncing progress to database:', progressData);
      
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to sync progress to database:', response.status, errorText);
      } else {
        console.log('✅ Progress synced successfully');
      }
    } catch (error) {
      console.error('❌ Error syncing progress:', error);
    }
  };

  const updateCurrentStep = (stepId: string) => {
    console.log(`🎯 Updating current step to: ${stepId}`);
    
    const updatedProgress = {
      ...progress,
      currentStepId: stepId,
      lastVisitedAt: new Date().toISOString()
    };
    
    setProgress(updatedProgress);
    syncProgressToDatabase(updatedProgress);
  };

  const markStepCompleted = (stepId: string) => {
    console.log(`✅ Marking step ${stepId} as completed`);
    
    const newCompletedSteps = Array.from(new Set([...progress.completedSteps, stepId]));
    
    // Calculate what should be unlocked based on completion
    const unlockedSections = new Set(['1']); // Always unlock section 1
    const unlockedSteps = new Set(['1-1']); // Always unlock first step
    
    // Progressive unlocking logic
    if (newCompletedSteps.includes('1-1')) {
      unlockedSections.add('2');
      unlockedSteps.add('2-1');
    }
    if (newCompletedSteps.includes('2-1')) {
      unlockedSteps.add('2-2');
    }
    if (newCompletedSteps.includes('2-2')) {
      unlockedSteps.add('2-3');
    }
    if (newCompletedSteps.includes('2-3')) {
      unlockedSteps.add('2-4');
    }
    if (newCompletedSteps.includes('2-4')) {
      unlockedSections.add('3');
      unlockedSteps.add('3-1');
    }
    if (newCompletedSteps.includes('3-1')) {
      unlockedSteps.add('3-2');
    }
    if (newCompletedSteps.includes('3-2')) {
      unlockedSteps.add('3-3');
    }
    if (newCompletedSteps.includes('3-3')) {
      unlockedSteps.add('3-4');
    }
    if (newCompletedSteps.includes('3-4')) {
      unlockedSections.add('4');
      unlockedSteps.add('4-1');
    }
    if (newCompletedSteps.includes('4-1')) {
      unlockedSteps.add('4-2');
    }
    if (newCompletedSteps.includes('4-2')) {
      unlockedSteps.add('4-3');
    }
    if (newCompletedSteps.includes('4-3')) {
      unlockedSteps.add('4-4');
    }
    
    const updatedProgress = {
      ...progress,
      completedSteps: newCompletedSteps,
      unlockedSections: Array.from(unlockedSections),
      unlockedSteps: Array.from(unlockedSteps),
      lastVisitedAt: new Date().toISOString()
    };
    
    console.log(`📊 Updated progress:`, updatedProgress);
    setProgress(updatedProgress);
    syncProgressToDatabase(updatedProgress);
  };

  const updateVideoProgress = (stepId: string, progressPercent: number, currentPosition?: number) => {
    const updatedProgress = {
      ...progress,
      videoProgress: {
        ...progress.videoProgress,
        [stepId]: Math.max(progress.videoProgress[stepId] || 0, progressPercent)
      },
      videoPositions: currentPosition !== undefined ? {
        ...progress.videoPositions,
        [stepId]: currentPosition
      } : progress.videoPositions
    };
    
    setProgress(updatedProgress);
    syncProgressToDatabase(updatedProgress);
  };

  const getCurrentVideoProgress = (stepId: string) => {
    return progress.videoProgress[stepId] || 0;
  };

  const getCurrentVideoPosition = (stepId: string) => {
    return progress.videoPositions[stepId] || 0;
  };

  const isStepAccessibleByProgression = (stepId: string): boolean => {
    const recalculatedProgress = recalculateProgress();
    return recalculatedProgress.unlockedSteps?.includes(stepId) || false;
  };

  const canProceedToNext = (currentStepId: string): boolean => {
    // Always allow proceeding for now (simplified mode)
    return true;
  };

  const shouldShowGreenCheckmark = (stepId: string): boolean => {
    const recalculatedProgress = recalculateProgress();
    return recalculatedProgress.completedSteps.includes(stepId);
  };

  // Force update progress when assessments are detected
  useEffect(() => {
    if (userAssessments && (userAssessments.starCard || userAssessments.assessments?.starCard)) {
      const calculated = recalculateProgress();
      if (calculated.completedSteps.length > progress.completedSteps.length) {
        console.log('🔄 Assessment detected - updating stored progress:', calculated.completedSteps);
        setProgress(calculated);
        syncProgressToDatabase(calculated);
      }
    }
  }, [userAssessments, progress.completedSteps.length]);

  const currentCalculatedProgress = recalculateProgress();

  return {
    progress: currentCalculatedProgress,
    updateVideoProgress,
    markStepCompleted,
    updateCurrentStep,
    isStepAccessibleByProgression,
    canProceedToNext,
    shouldShowGreenCheckmark,
    getCurrentVideoProgress,
    getCurrentVideoPosition
  };
}