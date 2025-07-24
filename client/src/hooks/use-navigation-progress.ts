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
  sectionExpansion?: { [sectionId: string]: boolean }; // NEW: Track section expansion state
  workshopCompleted?: boolean; // NEW: Track if workshop is fully completed
}

interface VideoProgressData {
  farthest: number;
  current: number;
}

// Query for user assessments to check completion states - TEMPORARILY DISABLED TO STOP INFINITE LOOP
const useUserAssessments = () => {
  // DISABLED - return mock data to stop infinite loop
  return {
    data: {
      starCard: { thinking: 27, acting: 25, feeling: 23, planning: 25 }, // Mock data
      flowAssessment: { flowScore: 45 },
      cantrilLadder: { wellBeingLevel: 7 }
    },
    isLoading: false,
    error: null
  };
  
  /* ORIGINAL CODE DISABLED:
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
  */
};

// SIMPLIFIED MODE: Only validate non-video requirements
const validateStepCompletionSimplified = (stepId: string, userAssessments: any): boolean => {
  console.log(`🔍 SIMPLIFIED VALIDATION: Step ${stepId}`);

  // IA Assessment steps - require completion
  if (stepId === 'ia-2-2') {
    const isValid = !!userAssessments?.iaI4CAssessment;
    console.log(`📋 IA I4C assessment: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
    return isValid;
  }

  if (stepId === 'ia-5-1') {
    const isValid = !!userAssessments?.iaHaiQAssessment;
    console.log(`📋 IA HaiQ assessment: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
    return isValid;
  }

  // Legacy IA assessment validation (for backward compatibility)
  if (stepId === 'ia-4-1') {
    const isValid = !!userAssessments?.iaCoreCapabilities;
    console.log(`📋 IA Core Capabilities assessment: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
    return isValid;
  }

  // AST Assessment steps - still require completion
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
const calculateUnlockedSteps = (completedSteps: string[], appType: 'ast' | 'ia' = 'ast'): string[] => {
  // IA progression sequence - NEW 26-step structure
  if (appType === 'ia') {
    const iaSequence = [
      // Welcome & Orientation
      'ia-1-1', 'ia-1-2',
      // The I4C Model
      'ia-2-1', 'ia-2-2', // Removed ia-2-3
      // Ladder of Imagination (Basics)
      'ia-3-1', 'ia-3-2', 'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6',
      // Advanced Ladder of Imagination
      'ia-4-1', 'ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5', 'ia-4-6',
      // Outcomes & Benefits
      'ia-5-1', 'ia-5-2', 'ia-5-3', 'ia-5-4', 'ia-5-5',
      // Quarterly Tune-Up
      'ia-6-1', 'ia-6-2',
      // More Info
      'ia-7-1', 'ia-7-2'
    ];
    const unlocked = ['ia-1-1']; // First step always unlocked

    // Linear progression through IA sequence
    for (let i = 0; i < iaSequence.length - 1; i++) {
      const currentStep = iaSequence[i];
      const nextStep = iaSequence[i + 1];

      if (completedSteps.includes(currentStep) && !unlocked.includes(nextStep)) {
        unlocked.push(nextStep);
        console.log(`📝 IA MODE: Step ${currentStep} completed → unlocked ${nextStep}`);
      }
    }

    return unlocked;
  }

  // AST progression sequence
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

// Progressive section expansion logic based on user progression
const calculateSectionExpansion = (currentStepId: string, completedSteps: string[], appType: 'ast' | 'ia' = 'ast', workshopCompleted: boolean = false): { [sectionId: string]: boolean } => {
  console.log(`🎯 CALCULATING SECTION EXPANSION for ${appType} - Current: ${currentStepId}, Workshop Completed: ${workshopCompleted}`);
  
  if (appType === 'ia') {
    // IA Section progression rules
    const currentSection = getSectionFromStepId(currentStepId, 'ia');
    
    // Default expansion state for IA
    const expansion = {
      '1': true,  // Welcome - always expanded initially
      '2': true,  // I4C Model - always expanded initially
      '3': false, // Ladder of Imagination
      '4': false, // Advanced Ladder
      '5': false, // Outcomes & Benefits
      '6': false, // Quarterly Tune-up
      '7': false  // Additional Info
    };
    
    // KAN-112: Workshop completion unlocks sections 5, 6, 7 permanently
    if (workshopCompleted) {
      expansion['5'] = true;
      expansion['6'] = true;
      expansion['7'] = true;
      expansion['4'] = false; // Collapse section 4 when workshop complete
      console.log(`🏆 IA Workshop completed - unlocked sections 5, 6, 7, collapsed section 4`);
      return expansion;
    }
    
    // KAN-112: Progressive expansion based on current section
    if (currentSection >= 5) {
      // Section 5 entry: Expand Section 5, collapse Section 3, keep Section 4
      expansion['1'] = false;
      expansion['2'] = false;
      expansion['3'] = false;
      expansion['4'] = true;
      expansion['5'] = true;
      console.log(`📖 IA Section 5+ entry: Collapsed 1,2,3, expanded 4,5`);
    } else if (currentSection >= 4) {
      // Section 4 entry: Expand Section 4, collapse Sections 1 & 2, keep Section 3
      expansion['1'] = false;
      expansion['2'] = false;
      expansion['3'] = true;
      expansion['4'] = true;
      console.log(`📖 IA Section 4+ entry: Collapsed 1&2, expanded 3&4`);
    } else if (currentSection >= 3) {
      // In section 3: keep 1, 2, 3 expanded
      expansion['3'] = true;
      console.log(`📖 IA Section 3: Sections 1,2,3 expanded`);
    }
    
    return expansion;
  }
  
  // AST Section progression rules
  const currentSection = getSectionFromStepId(currentStepId, 'ast');
  
  // Default expansion state for AST
  const expansion = {
    '1': true,  // Introduction
    '2': true,  // Discover Strengths
    '3': false, // Find Flow
    '4': false, // Visualize Potential
    '5': false, // Next Steps
    '6': false  // More Information
  };
  
  // Workshop completion: unlock sections 5, 6 permanently (no section 7 in AST)
  if (workshopCompleted) {
    expansion['5'] = true;
    expansion['6'] = true;
    console.log(`🏆 AST Workshop completed - unlocked sections 5, 6`);
    return expansion;
  }
  
  // Progressive expansion based on current section
  if (currentSection >= 4) {
    // Section 4 entry: Expand Section 4, collapse Sections 1 & 2, keep Section 3
    expansion['1'] = false;
    expansion['2'] = false;
    expansion['3'] = true;
    expansion['4'] = true;
    console.log(`📖 AST Section 4+ entry: Collapsed 1&2, expanded 3&4`);
  } else if (currentSection >= 3) {
    // In section 3: keep 1, 2, 3 expanded
    expansion['3'] = true;
    console.log(`📖 AST Section 3: Sections 1,2,3 expanded`);
  }
  
  return expansion;
};

// Helper function to determine which section a step belongs to
const getSectionFromStepId = (stepId: string, appType: 'ast' | 'ia' = 'ast'): number => {
  if (appType === 'ia') {
    if (stepId.startsWith('ia-1-')) return 1;
    if (stepId.startsWith('ia-2-')) return 2;
    if (stepId.startsWith('ia-3-')) return 3;
    if (stepId.startsWith('ia-4-')) return 4;
    if (stepId.startsWith('ia-5-')) return 5;
    if (stepId.startsWith('ia-6-')) return 6;
    if (stepId.startsWith('ia-7-')) return 7;
    return 1; // Default to section 1
  }
  
  // AST step parsing
  if (stepId.startsWith('1-')) return 1;
  if (stepId.startsWith('2-')) return 2;
  if (stepId.startsWith('3-')) return 3;
  if (stepId.startsWith('4-')) return 4;
  if (stepId.startsWith('5-')) return 5;
  if (stepId.startsWith('6-')) return 6;
  return 1; // Default to section 1
};

// Check if workshop is completed
const isWorkshopCompleted = (completedSteps: string[], appType: 'ast' | 'ia' = 'ast'): boolean => {
  if (appType === 'ia') {
    // KAN-112: IA workshop completed when user finishes section 4 (ia-4-6)
    const workshopCompleted = completedSteps.includes('ia-4-6');
    console.log(`🏆 IA Workshop completion check: ${workshopCompleted ? 'COMPLETED' : 'IN PROGRESS'} (ia-4-6: ${completedSteps.includes('ia-4-6') ? 'YES' : 'NO'})`);
    return workshopCompleted;
  }
  
  // AST workshop completed when user finishes section 4 (4-5 is final reflection)
  return completedSteps.includes('4-5');
};
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

  // If main sequence is complete (including 4-5), stay at final step
  // Do NOT auto-navigate to resources after completing 4-5
  return '4-5';
};

interface NavigationStep {
  id: string;
  label: string;
  path: string;
  type: string;
  icon?: string;
  iconColor?: string;
}

export interface NavigationSection {
  id: string;
  title: string;
  path: string;
  totalSteps: number;
  completedSteps: number;
  icon: string;
  iconColor?: string;
  steps: NavigationStep[];
}

export function useNavigationProgress(appType: 'ast' | 'ia' = 'ast') {
  const queryClient = useQueryClient();
  const debouncedSync = useRef<NodeJS.Timeout>();

  const [progress, setProgress] = useState<NavigationProgress>({
    completedSteps: [],
    currentStepId: appType === 'ia' ? 'ia-1-1' : '1-1',
    appType,
    lastVisitedAt: new Date().toISOString(),
    unlockedSteps: appType === 'ia' ? ['ia-1-1'] : ['1-1'],
    videoProgress: {},
    sectionExpansion: appType === 'ia' ? 
      { '1': true, '2': true, '3': false, '4': false, '5': false, '6': false, '7': false } :
      { '1': true, '2': true, '3': false, '4': false, '5': false, '6': false },
    workshopCompleted: false
  });

  // Get user assessments for completion detection
  const { data: userAssessments = {} } = useUserAssessments();

  // Load progress from navigationProgress table only
  useEffect(() => {
    const loadProgress = async () => {
      try {
        console.log(`🔄 SIMPLIFIED MODE: Loading ${appType} progress from navigationProgress table...`);
        const response = await fetch(`/api/workshop-data/navigation-progress/${appType}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const dbProgress = result.data;

            // Auto-mark steps as completed up to current position
            let completedSteps = dbProgress.completedSteps || [];
            if (dbProgress.currentStepId && (appType === 'ast' ? dbProgress.currentStepId !== '1-1' : dbProgress.currentStepId !== 'ia-1-1')) {
              const autoMarkedSteps = autoMarkStepsCompleted(dbProgress.currentStepId, userAssessments);
              // Merge with existing completed steps (user might have completed additional resource steps)
              const mergedSteps = [...new Set([...completedSteps, ...autoMarkedSteps])];
              completedSteps = mergedSteps;
              console.log(`🔄 AUTO-MARKED: Fixed completed steps for user at ${dbProgress.currentStepId}`);
            }

            // Calculate workshop completion status
            const workshopCompleted = isWorkshopCompleted(completedSteps, appType);
            
            // Calculate section expansion state
            const sectionExpansion = calculateSectionExpansion(
              dbProgress.currentStepId, 
              completedSteps, 
              appType, 
              workshopCompleted
            );

            const updatedProgress = {
              ...dbProgress,
              completedSteps,
              appType: appType, // Ensure correct app type
              lastVisitedAt: new Date().toISOString(),
              unlockedSteps: calculateUnlockedSteps(completedSteps),
              sectionExpansion,
              workshopCompleted
            };

            setProgress(prev => ({ ...prev, ...updatedProgress }));

            // Auto-save corrected progress back to database if we made changes
            if (completedSteps.length !== (dbProgress.completedSteps || []).length) {
              console.log('💾 AUTO-SAVING: Corrected completed steps to database');
              setTimeout(() => syncToDatabase(updatedProgress), 1000);
            }

            console.log(`✅ SIMPLIFIED MODE: ${appType.toUpperCase()} progress loaded from navigationProgress table`);
          } else {
            console.log(`ℹ️ SIMPLIFIED MODE: No ${appType} progress found in database, using defaults`);
          }
        } else {
          console.error(`❌ SIMPLIFIED MODE: Failed to load ${appType} progress from navigationProgress table`);
        }
      } catch (error) {
        console.error(`❌ SIMPLIFIED MODE: Error loading ${appType} progress:`, error);
        handleNetworkError(error as Error, 'loading progress');
      }
    };

    loadProgress();
  }, [appType]);

  // Simplified database sync with debouncing
  const syncToDatabase = async (progressData: NavigationProgress) => {
    try {
      console.log('🔄 SIMPLIFIED MODE: Syncing to database...', progressData);
      
      // Use the workshop-data navigation progress endpoint with correct parameters
      const response = await fetch('/api/workshop-data/navigation-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          completedSteps: progressData.completedSteps,
          currentStepId: progressData.currentStepId,
          appType: progressData.appType,
          unlockedSteps: progressData.unlockedSteps,
          videoProgress: progressData.videoProgress
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
  const markStepCompleted = async (stepId: string) => {
    console.log(`🎯 SIMPLIFIED MODE: Manual progression - marking step ${stepId} completed`);

    // Check if already completed
    if (progress.completedSteps.includes(stepId)) {
      console.log(`Step ${stepId} already completed`);
      return;
    }

    // For step 2-2 (assessment results), check if StarCard exists
    if (stepId === '2-2') {
      try {
        const response = await fetch('/api/workshop-data/starcard', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          const hasValidStarCard = data && data.success && (
            data.thinking > 0 || data.acting > 0 || data.feeling > 0 || data.planning > 0
          );

          if (!hasValidStarCard) {
            console.log(`❌ Step ${stepId} validation failed - StarCard assessment incomplete`);
            return;
          }
          console.log(`✅ Step ${stepId} validation passed - StarCard assessment complete`);
        } else {
          console.log(`❌ Step ${stepId} validation failed - could not verify StarCard`);
          return;
        }
      } catch (error) {
        console.error(`❌ Error validating step ${stepId}:`, error);
        return;
      }
    }

    console.log(`✅ SIMPLIFIED MODE: Completing step ${stepId} via Next button click`);

    setProgress(prev => {
      const newCompletedSteps = [...prev.completedSteps, stepId];
      const newUnlockedSteps = calculateUnlockedSteps(newCompletedSteps);
      const nextStepId = getNextStepFromCompletedSteps(newCompletedSteps);
      
      // Calculate workshop completion status
      const workshopCompleted = isWorkshopCompleted(newCompletedSteps, appType);
      
      // Recalculate section expansion state
      const sectionExpansion = calculateSectionExpansion(
        nextStepId, 
        newCompletedSteps, 
        appType, 
        workshopCompleted
      );

      const newProgress = {
        ...prev,
        completedSteps: newCompletedSteps,
        currentStepId: nextStepId,
        unlockedSteps: newUnlockedSteps,
        lastVisitedAt: new Date().toISOString(),
        sectionExpansion,
        workshopCompleted
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

  // Simple next step navigation
  const getNextStepId = (currentStepId: string): string | null => {
    const allSteps = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5', '5-1', '5-2', '5-3', '5-4', '6-1'];
    const currentIndex = allSteps.indexOf(currentStepId);

    return currentIndex === -1 || currentIndex === allSteps.length - 1 
      ? null 
      : allSteps[currentIndex + 1];
  };

  const getNextButtonState = (stepId: string) => {
    const nextStepId = getNextStepId(stepId);
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
    getNextStepId,
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