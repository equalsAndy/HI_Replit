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
                let allParsedLevels = [];
                
                // Keep parsing until we get to actual progress data
                while (typeof currentData === 'string' && parseLevel < 5) {
                  const parsed = JSON.parse(currentData);
                  allParsedLevels.push(parsed);
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
                  try {
                    dbProgress = JSON.parse(currentData);
                  } catch (e) {
                    console.log('Final parse failed, checking all parsed levels for best progress data');
                  }
                }
                
                // If we have multiple parsed levels, find the one with the most completed steps
                if (!dbProgress || !dbProgress.completedSteps || dbProgress.completedSteps.length === 0) {
                  console.log('🔍 Looking for best progress data in all parsed levels...');
                  let bestProgress = null;
                  let maxCompletedSteps = 0;
                  
                  for (const level of allParsedLevels) {
                    if (level.completedSteps && Array.isArray(level.completedSteps) && level.completedSteps.length > maxCompletedSteps) {
                      bestProgress = level;
                      maxCompletedSteps = level.completedSteps.length;
                    }
                  }
                  
                  if (bestProgress && maxCompletedSteps > 0) {
                    console.log(`🎯 Found better progress data with ${maxCompletedSteps} completed steps:`, bestProgress);
                    dbProgress = bestProgress;
                  }
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
                  '4-2': 'wellbeing-reflections',
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
    // If no assessments exist, reset to fresh state
    const hasAnyAssessments = !!(
      userAssessments?.starCard || 
      userAssessments?.assessments?.starCard ||
      userAssessments?.flowAssessment || 
      userAssessments?.assessments?.flowAssessment ||
      userAssessments?.flowAttributes || 
      userAssessments?.assessments?.flowAttributes ||
      userAssessments?.cantrilLadder || 
      userAssessments?.assessments?.cantrilLadder ||
      userAssessments?.stepByStepReflection || 
      userAssessments?.assessments?.stepByStepReflection ||
      userAssessments?.roundingOutReflection || 
      userAssessments?.assessments?.roundingOutReflection
    );

    // If no assessments and navigation progress exists, reset everything
    if (!hasAnyAssessments && progress.completedSteps.length > 0) {
      console.log(`🔄 No assessments found - resetting navigation progress to fresh state`);
      return {
        completedSteps: [],
        currentStepId: '1-1',
        unlockedSteps: ['1-1'],
        unlockedSections: ['1'],
        appType: 'ast',
        lastVisitedAt: new Date().toISOString(),
        videoProgress: {},
        videoPositions: {}
      };
    }

    const currentProgress = { ...progress };
    
    // Step completion detection
    const isStepCompleted = (stepId: string): boolean => {
      // Assessment steps require actual completion from database
      if (stepId === '2-2') {
        const hasStarCard = !!(userAssessments?.starCard || userAssessments?.assessments?.starCard);
        console.log(`🔍 Step 2-2 (Star Card Assessment) - hasStarCard: ${hasStarCard}`);
        return hasStarCard;
      }
      if (stepId === '2-3') {
        const hasStepByStep = !!(userAssessments?.stepByStepReflection || userAssessments?.assessments?.stepByStepReflection);
        console.log(`🔍 Step 2-3 (Step by Step Reflection) - hasStepByStep: ${hasStepByStep}`);
        return hasStepByStep;
      }
      if (stepId === '3-2') {
        const hasFlowAssessment = !!(userAssessments?.flowAssessment || userAssessments?.assessments?.flowAssessment);
        console.log(`🔍 Step 3-2 (Flow Assessment) - hasFlowAssessment: ${hasFlowAssessment}`);
        return hasFlowAssessment;
      }
      if (stepId === '3-4') {
        const hasFlowAttributes = !!(userAssessments?.flowAttributes || userAssessments?.assessments?.flowAttributes);
        console.log(`🔍 Step 3-4 (Flow Attributes) - hasFlowAttributes: ${hasFlowAttributes}`);
        return hasFlowAttributes;
      }
      if (stepId === '4-1') {
        // Check for cantril ladder in assessments OR if user has progressed past it (4-2+ completed)
        const hasCantrilLadder = !!(userAssessments?.cantrilLadder || userAssessments?.assessments?.cantrilLadder);
        const hasProgressedPast = currentProgress.completedSteps.some(step => 
          step.startsWith('4-') && parseInt(step.split('-')[1]) > 1
        );
        const isComplete = hasCantrilLadder || hasProgressedPast;
        console.log(`🔍 Step 4-1 (Cantril Ladder) - hasCantrilLadder: ${hasCantrilLadder}, hasProgressedPast: ${hasProgressedPast}, isComplete: ${isComplete}`);
        return isComplete;
      }
      
      // Content/video steps auto-complete when user has progressed past them
      if (stepId === '1-1') {
        // Complete 1-1 if any assessment exists (user has progressed)
        const hasAnyAssessment = !!(
          userAssessments?.starCard || userAssessments?.assessments?.starCard
        );
        if (hasAnyAssessment) {
          console.log(`🔍 Step 1-1 auto-completion - user has progressed past intro`);
          return true;
        }
      }
      if (stepId === '2-1') {
        // Complete 2-1 if star card assessment exists
        const hasStarCard = !!(userAssessments?.starCard || userAssessments?.assessments?.starCard);
        if (hasStarCard) {
          console.log(`🔍 Step 2-1 auto-completion - starCard exists`);
          return true;
        }
      }
      if (stepId === '2-4') {
        // Complete 2-4 if flow assessment exists (user progressed to section 3)
        const hasFlowAssessment = !!(userAssessments?.flowAssessment || userAssessments?.assessments?.flowAssessment);
        if (hasFlowAssessment) {
          console.log(`🔍 Step 2-4 auto-completion - user progressed to flow section`);
          return true;
        }
      }
      if (stepId === '3-1') {
        // Complete 3-1 if flow assessment exists
        const hasFlowAssessment = !!(userAssessments?.flowAssessment || userAssessments?.assessments?.flowAssessment);
        if (hasFlowAssessment) {
          console.log(`🔍 Step 3-1 auto-completion - flowAssessment exists`);
          return true;
        }
      }
      if (stepId === '3-3') {
        // Complete 3-3 if flow attributes exists
        const hasFlowAttributes = !!(userAssessments?.flowAttributes || userAssessments?.assessments?.flowAttributes);
        if (hasFlowAttributes) {
          console.log(`🔍 Step 3-3 auto-completion - flowAttributes exists`);
          return true;
        }
      }
      
      // All other steps rely on explicit completion tracking
      const isMarkedComplete = currentProgress.completedSteps.includes(stepId);
      console.log(`🔍 Step ${stepId} explicit completion check - isMarkedComplete: ${isMarkedComplete}`);
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
    const allStepsInOrder = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4'];
    let currentStepId = '1-1'; // Default to first step
    
    // Find the first incomplete step as the current step
    for (const stepId of allStepsInOrder) {
      if (!newCompletedSteps.includes(stepId)) {
        currentStepId = stepId;
        break;
      }
    }
    
    // If all steps are complete, stay on the last step
    if (newCompletedSteps.length >= allStepsInOrder.length || 
        allStepsInOrder.every(step => newCompletedSteps.includes(step))) {
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
    
    // When visiting a step, ensure it's unlocked and mark previous steps as completed
    const allStepsInOrder = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4'];
    const currentStepIndex = allStepsInOrder.indexOf(stepId);
    
    // Unlock current step and all previous steps
    const newUnlockedSteps = new Set(progress.unlockedSteps);
    for (let i = 0; i <= currentStepIndex; i++) {
      newUnlockedSteps.add(allStepsInOrder[i]);
    }
    
    // Mark previous non-assessment steps as completed when navigating forward
    const newCompletedSteps = new Set(progress.completedSteps);
    for (let i = 0; i < currentStepIndex; i++) {
      const prevStep = allStepsInOrder[i];
      // Only auto-complete content steps, not assessment steps
      if (!['2-2', '3-2', '3-4', '4-1'].includes(prevStep)) {
        newCompletedSteps.add(prevStep);
      }
    }
    
    const updatedProgress = {
      ...progress,
      currentStepId: stepId,
      unlockedSteps: Array.from(newUnlockedSteps),
      completedSteps: Array.from(newCompletedSteps),
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

    // Calculate next step to navigate to
    const allStepsInOrder = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4'];
    const currentIndex = allStepsInOrder.indexOf(stepId);
    let nextStepId = stepId; // Default to current step
    if (currentIndex >= 0 && currentIndex < allStepsInOrder.length - 1) {
      nextStepId = allStepsInOrder[currentIndex + 1];
    }
    
    const updatedProgress = {
      ...progress,
      completedSteps: newCompletedSteps,
      currentStepId: nextStepId,
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
    // Use current progress state for step accessibility
    const isUnlocked = progress.unlockedSteps?.includes(stepId) || false;
    console.log(`🔓 Step ${stepId} accessibility: ${isUnlocked}`);
    return isUnlocked;
  };

  const canProceedToNext = (currentStepId: string): boolean => {
    // Always allow proceeding for now (simplified mode)
    return true;
  };

  const shouldShowGreenCheckmark = (stepId: string): boolean => {
    // Use the current progress state for UI display
    const isCompleted = progress.completedSteps.includes(stepId);
    console.log(`🎯 Green checkmark for ${stepId}: ${isCompleted}`);
    return isCompleted;
  };

  // Force update progress when assessments change (including reset)
  useEffect(() => {
    console.log('🔄 Assessment data changed, recalculating progress...');
    console.log('📊 Current assessments:', userAssessments);
    
    const calculated = recalculateProgress();
    
    // Always update if there are meaningful changes
    const progressChanged = JSON.stringify(calculated.completedSteps) !== JSON.stringify(progress.completedSteps) ||
                           calculated.currentStepId !== progress.currentStepId ||
                           JSON.stringify(calculated.unlockedSteps) !== JSON.stringify(progress.unlockedSteps);
    
    if (progressChanged) {
      console.log('🔄 Assessment-driven progress update:', {
        oldCompleted: progress.completedSteps,
        newCompleted: calculated.completedSteps,
        oldCurrent: progress.currentStepId,
        newCurrent: calculated.currentStepId,
        oldUnlocked: progress.unlockedSteps,
        newUnlocked: calculated.unlockedSteps
      });
      setProgress(calculated);
      syncProgressToDatabase(calculated);
    }
  }, [userAssessments]);

  return {
    progress,
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