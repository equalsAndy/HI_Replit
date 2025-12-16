import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// FEATURE FLAG SYSTEM - Easy toggle for restoration
const PROGRESSION_MODE = {
  SIMPLIFIED: 'simplified',
  COMPLEX: 'complex'
} as const;

const CURRENT_PROGRESSION_MODE = 'simplified' as const;

// Define step categories for proper handling
const RESOURCE_STEPS = ['4-1', '4-2', '4-3', '4-4', '5-1', '5-2', '5-3'];
const PROGRESSIVE_STEPS = ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4'];

const isResourceStep = (stepId: string): boolean => {
  return RESOURCE_STEPS.includes(stepId);
};

const isProgressiveStep = (stepId: string): boolean => {
  return PROGRESSIVE_STEPS.includes(stepId);
};

interface NavigationProgress {
  completedSteps: string[];        // Only progressive steps (1-1 through 3-4)
  visitedSteps: string[];          // Resource steps that user has viewed (4-1, 4-2, etc.)
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

// Get user assessments for completion detection - ENHANCED for IA
const useUserAssessments = () => {
  return useQuery({
    queryKey: ['user-assessments'],
    queryFn: async () => {
      try {
        // Fetch both general assessments and IA-specific assessment
        const [generalResponse, iaResponse] = await Promise.all([
          fetch('/api/workshop-data/userAssessments', { credentials: 'include' }),
          fetch('/api/workshop-data/ia-assessment', { credentials: 'include' })
        ]);
        
        const generalData = generalResponse.ok ? await generalResponse.json() : {};
        const iaData = iaResponse.ok ? await iaResponse.json() : {};
        
        const assessments = generalData?.currentUser?.assessments || {};
        
        // Add IA assessment data if available
        if (iaData?.data) {
          assessments.imaginalAgilityAssessment = iaData.data;
          console.log('📋 IA Assessment found in API:', !!iaData.data);
        }
        
        console.log('📋 Available assessments:', Object.keys(assessments));
        return assessments;
      } catch (error) {
        console.error('📋 Error fetching assessments:', error);
        return {
          starCard: { thinking: 27, acting: 25, feeling: 23, planning: 25 }, // AST fallback
          flowAssessment: { flowScore: 45 },
          cantrilLadder: { wellBeingLevel: 7 }
        };
      }
    },
    staleTime: 5000,
    retry: 1
  });
};

// SIMPLIFIED MODE: Only validate non-video requirements
const validateStepCompletionSimplified = (stepId: string, userAssessments: any): boolean => {
  console.log(`🔍 SIMPLIFIED VALIDATION: Step ${stepId}`);

  // IA Assessment step ia-2-2 - check for actual assessment completion
  if (stepId === 'ia-2-2') {
    // Check for multiple possible assessment data structures in the correct API endpoint
    const isValid = !!(userAssessments?.imaginalAgilityAssessment || 
                      userAssessments?.iaAssessment ||
                      userAssessments?.iaI4CAssessment);
    console.log(`📋 IA assessment (ia-2-2): ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
    console.log(`📋 Available assessments:`, Object.keys(userAssessments || {}));
    return isValid;
  }

  // For all other IA steps, allow next button to be active (simplified mode)
  if (stepId.startsWith('ia-')) {
    console.log(`✅ SIMPLIFIED MODE: IA step ${stepId} - next button always active`);
    return true;
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
  // IA progression sequence - Updated structure matching actual navigation
  if (appType === 'ia') {
    const iaSequence = [
      // Welcome & Orientation (Module 1)
      'ia-1-1', 'ia-1-2', 'ia-1-3', 'ia-1-4', 'ia-1-5',
      // The I4C Model (Module 2)
      'ia-2-1', 'ia-2-2',
      // Ladder of Imagination (Basics)
      'ia-3-1', 'ia-3-2', 'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6',
      // Advanced Ladder of Imagination
      'ia-4-1', 'ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5', 'ia-4-6',
      // Outcomes & Benefits
      'ia-5-1'
      // Note: ia-6-1, ia-7-1, ia-7-2 handled by special rules below
    ];
    
    const unlocked = ['ia-1-1']; // First step always unlocked

    // Linear progression through main sequence
    for (let i = 0; i < iaSequence.length - 1; i++) {
      const currentStep = iaSequence[i];
      const nextStep = iaSequence[i + 1];

      if (completedSteps.includes(currentStep)) {
        if (!unlocked.includes(nextStep)) {
          unlocked.push(nextStep);
          console.log(`🔓 IA: ${currentStep} completed → unlocked ${nextStep}`);
        }
      }
    }
    
    // Special unlock rules:
    // ia-5-1, ia-5-2, ia-5-3 (Outcomes and Teams section) - unlocked after ia-4-6 completion
    if (completedSteps.includes('ia-4-6')) {
      if (!unlocked.includes('ia-5-1')) {
        unlocked.push('ia-5-1');
        console.log(`🔓 IA: ia-4-6 completed → unlocked ia-5-1`);
      }
      if (!unlocked.includes('ia-5-2')) {
        unlocked.push('ia-5-2');
        console.log(`🔓 IA: ia-4-6 completed → unlocked ia-5-2`);
      }
      if (!unlocked.includes('ia-5-3')) {
        unlocked.push('ia-5-3');
        console.log(`🔓 IA: ia-4-6 completed → unlocked ia-5-3`);
      }
    }

    // ia-6-1 (Quarterly Tune-up) - always accessible
    if (!unlocked.includes('ia-6-1')) {
      unlocked.push('ia-6-1');
      console.log(`🔓 IA: ia-6-1 always accessible`);
    }

    // ia-7-1 and ia-7-2 (Team Ladder) - unlocked after ia-4-6 completion
    if (completedSteps.includes('ia-4-6')) {
      if (!unlocked.includes('ia-7-1')) {
        unlocked.push('ia-7-1');
        console.log(`🔓 IA: ia-4-6 completed → unlocked ia-7-1`);
      }
      if (!unlocked.includes('ia-7-2')) {
        unlocked.push('ia-7-2');
        console.log(`🔓 IA: ia-4-6 completed → unlocked ia-7-2`);
      }
    }

    console.log(`🔓 IA unlocked steps:`, unlocked);
    return unlocked;
  }

  // AST progression sequence - 5 Module Structure (RENUMBERED)
  const mainSequence = ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4'];
  const unlocked = ['1-1']; // First step always unlocked

  // Linear progression through Modules 1-3
  for (let i = 0; i < mainSequence.length - 1; i++) {
    const currentStep = mainSequence[i];
    const nextStep = mainSequence[i + 1];

    if (completedSteps.includes(currentStep) && !unlocked.includes(nextStep)) {
      unlocked.push(nextStep);
      console.log(`📝 5-MODULE MODE: Step ${currentStep} completed → unlocked ${nextStep}`);
    }
  }

  // SPECIAL UNLOCK: 5-3 (Introducing Imaginal Agility) is available after completing Module 2 (step 2-4)
  // TEMPORARY: Always unlock 5-3 for testing
  if (!unlocked.includes('5-3')) {
    unlocked.push('5-3');
    if (completedSteps.includes('2-4')) {
      console.log(`🎯 EARLY UNLOCK: Step 2-4 completed → unlocked 5-3 (Introducing Imaginal Agility)`);
    } else {
      console.log(`🎯 TEMP UNLOCK: 5-3 (Introducing Imaginal Agility) always unlocked for testing`);
    }
  }

  // WORKSHOP COMPLETION: 3-4 completion unlocks ALL of Module 4 and rest of Module 5 (RENUMBERED)
  if (completedSteps.includes('3-4')) {
    const module4and5 = ['4-1', '4-2', '4-3', '4-4', '5-1', '5-2'];
    console.log(`🏆 WORKSHOP COMPLETED: Step 3-4 finished, unlocking all Module 4 & remaining Module 5 resources:`, module4and5);
    module4and5.forEach(stepId => {
      if (!unlocked.includes(stepId)) {
        unlocked.push(stepId);
        console.log(`🎯 WORKSHOP COMPLETION: Unlocked ${stepId}`);
      }
    });
    // 5-3 is already unlocked earlier, so ensure it's still there
    if (!unlocked.includes('5-3')) {
      unlocked.push('5-3');
    }
  } else {
    console.log(`📝 Workshop in progress. Complete 2-4 to unlock 5-3, or complete 3-4 to unlock Modules 4 & 5`);
  }

  // console.log('🔓 SIMPLIFIED MODE: Unlocked steps:', unlocked);
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
      '3': true,  // Ladder of Imagination - expanded initially
      '4': true,  // Advanced Ladder - expanded initially
      '5': false, // Outcomes & Benefits
      '6': false, // Quarterly Tune-up
      '7': false  // Team Ladder - only expanded after ia-4-6 completion
    };
    
    // Special unlock: ia-4-6 completion unlocks Outcomes & Benefits and Team Ladder sections
    if (completedSteps.includes('ia-4-6')) {
      expansion['5'] = true;
      expansion['7'] = true;
      console.log(`🎯 IA MODE: ia-4-6 completed → expanded Outcomes & Benefits section 5 and Team Ladder section 7`);
    }
    
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
  
  // AST 5-Module progression rules
  const currentSection = getSectionFromStepId(currentStepId, 'ast');
  
  // Default expansion state for AST 5-Module structure
  const expansion = {
    '1': true,  // Module 1: Getting Started
    '2': true,  // Module 2: Strength and Flow
    '3': true,  // Module 3: Visualize Your Potential
    '4': false, // Module 4: Takeaways & Next Steps (unlocked after 3-4)
    '5': false  // Module 5: More Information (5-3 unlocked after 2-4, full unlock after 3-4)
  };
  
  // EARLY EXPANSION: Module 5 expands when step 2-4 is completed (to show unlocked 5-3)
  // TEMPORARY: Always expand Module 5 for testing
  expansion['5'] = true;
  if (completedSteps.includes('2-4')) {
    console.log(`📖 AST Module 5 early expansion: Step 2-4 completed → Module 5 expanded for 5-3 access`);
  } else {
    console.log(`📖 AST Module 5 TEMP expansion: Always visible for testing`);
  }
  
  // Workshop completion: unlock Modules 4, 5 permanently
  if (workshopCompleted) {
    expansion['4'] = true;
    expansion['5'] = true;
    console.log(`🏆 AST Workshop completed - unlocked Modules 4, 5`);
    return expansion;
  }
  
  // Progressive expansion based on current section
  if (currentSection >= 4) {
    // Module 4+ entry: Expand Modules 4 & 5, collapse Module 1
    expansion['1'] = false;
    expansion['2'] = true;
    expansion['3'] = true;
    expansion['4'] = true;
    expansion['5'] = true;
    console.log(`📖 AST Module 4+ entry: Collapsed Module 1, expanded Modules 2,3,4,5`);
  } else if (currentSection >= 3) {
    // In Module 3: keep Modules 1, 2, 3 expanded
    expansion['3'] = true;
    console.log(`📖 AST Module 3: Modules 1,2,3 expanded`);
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
  
  // AST 5-Module step parsing
  if (stepId.startsWith('1-')) return 1;  // Module 1
  if (stepId.startsWith('2-')) return 2;  // Module 2
  if (stepId.startsWith('3-')) return 3;  // Module 3
  if (stepId.startsWith('4-')) return 4;  // Module 4
  if (stepId.startsWith('5-')) return 5;  // Module 5
  return 1; // Default to Module 1
};

// Check if workshop is completed
const isWorkshopCompleted = (completedSteps: string[], appType: 'ast' | 'ia' = 'ast'): boolean => {
  if (appType === 'ia') {
    // KAN-112: IA workshop completed when user finishes section 4 (ia-4-6)
    const workshopCompleted = completedSteps.includes('ia-4-6');
    console.log(`🏆 IA Workshop completion check: ${workshopCompleted ? 'COMPLETED' : 'IN PROGRESS'} (ia-4-6: ${completedSteps.includes('ia-4-6') ? 'YES' : 'NO'})`);
    return workshopCompleted;
  }
  
  // AST workshop completed when user finishes Module 3 (3-4 is workshop completion)
  return completedSteps.includes('3-4');
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
const autoMarkStepsCompleted = (currentStepId: string, userAssessments: any, appType: 'ast' | 'ia' = 'ast'): string[] => {
  if (appType === 'ia') {
    // IA progression sequence
    const iaMainSequence = [
      'ia-1-1', 'ia-1-2',
      'ia-2-1', 'ia-2-2', 
      'ia-3-1', 'ia-3-2', 'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6',
      'ia-4-1', 'ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5', 'ia-4-6',
      'ia-5-1'
    ];
    
    const currentIndex = iaMainSequence.indexOf(currentStepId);
    const completedSteps: string[] = [];

    if (currentIndex <= 0) {
      return []; // At or before first step
    }

    console.log(`🎯 IA AUTO-MARKING: User at step ${currentStepId} (index ${currentIndex})`);

    // Mark all steps up to current as completed
    for (let i = 0; i < currentIndex; i++) {
      const stepId = iaMainSequence[i];
      completedSteps.push(stepId);
      console.log(`  ✅ IA Auto-completed: ${stepId}`);
    }

    console.log(`🎯 IA AUTO-MARKED COMPLETED:`, completedSteps);
    return completedSteps;
  }
  
  // AST progression (existing logic)
  const mainSequence = ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4'];
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
    if (!['2-1', '2-2', '3-1'].includes(stepId)) {
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
const getNextStepFromCompletedSteps = (completedSteps: string[], appType: 'ast' | 'ia' = 'ast'): string => {
  if (appType === 'ia') {
    // IA progression sequence
    const iaMainSequence = [
      // Module 1: WELCOME (5 steps)
      'ia-1-1', 'ia-1-2', 'ia-1-3', 'ia-1-4', 'ia-1-5',
      // Module 2: THE I4C MODEL
      'ia-2-1', 'ia-2-2',
      // Module 3: LADDER OF IMAGINATION
      'ia-3-1', 'ia-3-2', 'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6',
      // Module 4: ADVANCED LADDER OF IMAGINATION
      'ia-4-1', 'ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5', 'ia-4-6',
      // Module 5: OUTCOMES & BENEFITS
      'ia-5-1'
    ];

    // Find next incomplete step in main sequence
    for (const step of iaMainSequence) {
      if (!completedSteps.includes(step)) {
        return step;
      }
    }

    // If main sequence complete, stay on last step
    console.log(`🏆 IA WORKSHOP COMPLETED: All main steps finished, staying on ia-5-1`);
    return 'ia-5-1';
  }
  
  // AST progression (existing logic)
  const mainSequence = ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4'];

  // Priority 1: Continue main sequence (1-1 through 3-4)
  for (const step of mainSequence) {
    if (!completedSteps.includes(step)) {
      return step;
    }
  }

  // WORKSHOP COMPLETED: If main sequence is complete (including 3-4), user stays on 3-4
  console.log(`🏆 AST WORKSHOP COMPLETED: All main steps finished, staying on 3-4`);
  return '3-4';
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
    visitedSteps: [],  // Initialize visited steps tracking
    currentStepId: appType === 'ia' ? 'ia-1-1' : '1-1',
    appType,
    lastVisitedAt: new Date().toISOString(),
    unlockedSteps: appType === 'ia' ? ['ia-1-1'] : ['1-1'],
    videoProgress: {},
    sectionExpansion: appType === 'ia' ? 
      { '1': true, '2': true, '3': true, '4': true, '5': false, '6': false, '7': false } :
      { '1': true, '2': true, '3': true, '4': false, '5': false },
    workshopCompleted: false
  });

  // Get user assessments for completion detection
  const { data: userAssessments = {} } = useUserAssessments();

  // Load progress from navigationProgress table only
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // console.log(`🔄 SIMPLIFIED MODE: Loading ${appType} progress from navigationProgress table...`);
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
              const autoMarkedSteps = autoMarkStepsCompleted(dbProgress.currentStepId, userAssessments, appType);
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
              unlockedSteps: calculateUnlockedSteps(completedSteps, appType),
              sectionExpansion,
              workshopCompleted
            };

            setProgress(prev => ({ ...prev, ...updatedProgress }));

            // Auto-save corrected progress back to database if we made changes
            if (completedSteps.length !== (dbProgress.completedSteps || []).length) {
              console.log('💾 AUTO-SAVING: Corrected completed steps to database');
              setTimeout(() => syncToDatabase(updatedProgress), 1000);
            }

            // console.log(`✅ SIMPLIFIED MODE: ${appType.toUpperCase()} progress loaded from navigationProgress table`);
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

  // FIXED: Database sync with proper progress state and enhanced logging
  const syncToDatabase = async (progressData: NavigationProgress) => {
    try {
      console.log('🔄 Attempting to save navigation state...');
      console.log('📤 Payload:', {
        currentStepId: progressData.currentStepId,
        completedSteps: progressData.completedSteps,
        appType: progressData.appType,
        stepConfig: {
          unlockedSteps: progressData.unlockedSteps?.length || 0,
          videoProgressCount: Object.keys(progressData.videoProgress || {}).length
        }
      });
      
      // Use the workshop-data navigation progress endpoint with correct parameters
      const response = await fetch('/api/workshop-data/navigation-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          completedSteps: progressData.completedSteps,
          currentStepId: progressData.currentStepId, // CRITICAL: Use progressData, not stale progress state
          appType: progressData.appType,
          unlockedSteps: progressData.unlockedSteps,
          videoProgress: progressData.videoProgress
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Navigation state saved successfully:', result);
        console.log('📊 Saved state: currentStep=' + progressData.currentStepId + ', completed=[' + progressData.completedSteps.join(',') + ']');
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

  // ENHANCED: Manual progression with immediate counter updates - FIXED DATABASE SYNC
  const markStepCompleted = async (stepId: string, options?: { autoAdvance?: boolean }): Promise<string | null> => {
    console.log(`🎯 NAVIGATION HOOK: markStepCompleted called with: ${stepId}, options:`, options);
    console.log(`🎯 NAVIGATION HOOK: Current state before:`, {
      currentStepId: progress.currentStepId,
      completedSteps: progress.completedSteps.length
    });

    // RESOURCE STEPS: Don't mark as completed, only track as visited
    if (isResourceStep(stepId)) {
      console.log(`📖 RESOURCE STEP: ${stepId} visited (not marked as completed)`);
      
      // Track as visited if not already
      if (!progress.visitedSteps.includes(stepId)) {
        const newVisitedSteps = [...progress.visitedSteps, stepId];
        setProgress(prev => ({
          ...prev,
          visitedSteps: newVisitedSteps,
          lastVisitedAt: new Date().toISOString()
        }));
        
        // Sync visited steps to database
        const updatedProgress = {
          ...progress,
          visitedSteps: newVisitedSteps,
          lastVisitedAt: new Date().toISOString()
        };
        scheduleSync(updatedProgress);
      }
      
      return progress.currentStepId; // Stay on current step, no advancement
    }

    // Check if already completed (for progressive steps only)
    if (progress.completedSteps.includes(stepId)) {
      console.log(`⚠️ Step ${stepId} already completed`);
      return progress.currentStepId;
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
            return null;
          }
          console.log(`✅ Step ${stepId} validation passed - StarCard assessment complete`);
        } else {
          console.log(`❌ Step ${stepId} validation failed - could not verify StarCard`);
          return null;
        }
      } catch (error) {
        console.error(`❌ Error validating step ${stepId}:`, error);
        return null;
      }
    }

    console.log(`✅ SIMPLIFIED MODE: Completing step ${stepId} via Next button click`);

    // Calculate the new progress data outside of setProgress to avoid stale closures
    const newCompletedSteps = [...progress.completedSteps, stepId];
    const newUnlockedSteps = calculateUnlockedSteps(newCompletedSteps, appType);
    
    // Different completion logic for IA vs AST
    let nextStepId;
    if (appType === 'ia') {
      // IA workshop progression
      nextStepId = getNextStepFromCompletedSteps(newCompletedSteps, appType);
      console.log(`➡️ IA PROGRESSION: Step ${stepId} completed, advancing to ${nextStepId}`);
    } else {
      // AST workshop progression (existing logic)
      const workshopCompleted = newCompletedSteps.includes('3-4') || progress.completedSteps.includes('3-4');
      const isPostWorkshopStep = ['4-1', '4-2', '4-3', '4-4', '5-1', '5-2', '5-3'].includes(stepId);
      
      if (workshopCompleted && isPostWorkshopStep) {
        // POST-WORKSHOP: Stay on current step, no auto-advancement in resource modules
        nextStepId = progress.currentStepId;
        console.log(`🔒 POST-WORKSHOP: Step ${stepId} completed, staying on ${progress.currentStepId} (no auto-advancement in resource modules)`);
      } else if (stepId === '3-4') {
        // Workshop completion: stay on 3-4
        nextStepId = '3-4';
        console.log(`🏆 WORKSHOP COMPLETION: Step 3-4 completed, staying on 3-4 and unlocking modules 4 & 5`);
      } else {
        // Normal progression for main workshop steps 1-1 through 3-4
        nextStepId = getNextStepFromCompletedSteps(newCompletedSteps, appType);
        console.log(`➡️ NORMAL PROGRESSION: Step ${stepId} completed, advancing to ${nextStepId}`);
      }
    }

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
      ...progress,
      completedSteps: newCompletedSteps,
      currentStepId: nextStepId, // CRITICAL FIX: Update currentStepId atomically
      unlockedSteps: newUnlockedSteps,
      lastVisitedAt: new Date().toISOString(),
      sectionExpansion,
      workshopCompleted
    };

    console.log(`📊 SIMPLIFIED MODE: Progress counters updated immediately`);
    console.log(`  ✅ Completed: ${newCompletedSteps.length} steps`);
    console.log(`  🔓 Unlocked: ${newUnlockedSteps.length} steps`);
    console.log(`  ➡️ Next step: ${nextStepId}`);
    console.log(`  💾 About to sync to database with currentStepId: ${nextStepId}`);

    console.log(`🎯 NAVIGATION HOOK: Calculated new state:`, {
      currentStepId: nextStepId,
      completedSteps: newCompletedSteps.length,
      justCompleted: stepId,
      nextStep: nextStepId
    });

    // CRITICAL FIX: Update state with the complete new progress object
    setProgress(newProgress);

    // CRITICAL FIX: Schedule database sync with the new progress data
    setTimeout(() => {
      console.log(`💾 NAVIGATION HOOK: Syncing to database:`, {
        currentStepId: newProgress.currentStepId,
        completedSteps: newProgress.completedSteps.length
      });
      syncToDatabase(newProgress);
    }, 50); // Minimal delay to ensure React state update

    // Force React Query to refetch navigation data to trigger UI updates
    queryClient.invalidateQueries({ queryKey: [`/api/workshop-data/navigation-progress/${appType}`] });

    return nextStepId; // Return the next step ID for navigation
  };

  // Set current step (for navigation) and mark resource steps as visited
  const setCurrentStep = (stepId: string) => {
    console.log(`🔄 SIMPLIFIED MODE: Navigating to step ${stepId}`);

    setProgress(prev => {
      // Recalculate workshop completion status
      const workshopCompleted = isWorkshopCompleted(prev.completedSteps, appType);

      // Recalculate section expansion state based on the new current step
      const sectionExpansion = calculateSectionExpansion(
        stepId,
        prev.completedSteps,
        appType,
        workshopCompleted
      );

      const newProgress = {
        ...prev,
        currentStepId: stepId,
        lastVisitedAt: new Date().toISOString(),
        sectionExpansion  // Update section expansion when navigating
      };

      // If navigating to a resource step, mark it as visited
      if (isResourceStep(stepId) && !prev.visitedSteps.includes(stepId)) {
        newProgress.visitedSteps = [...prev.visitedSteps, stepId];
        console.log(`📖 RESOURCE STEP: Marked ${stepId} as visited`);
      }

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
    if (currentStepId.startsWith('ia-')) {
      // IA step progression
      const iaAllSteps = [
        'ia-1-1', 'ia-1-2',
        'ia-2-1', 'ia-2-2',
        'ia-3-1', 'ia-3-2', 'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6',
        'ia-4-1', 'ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5', 'ia-4-6',
        'ia-5-1', 'ia-6-1', 'ia-7-1', 'ia-7-2'
      ];
      const currentIndex = iaAllSteps.indexOf(currentStepId);
      return currentIndex === -1 || currentIndex === iaAllSteps.length - 1 
        ? null 
        : iaAllSteps[currentIndex + 1];
    } else {
      // AST step progression (existing logic)
      const allSteps = ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '5-1', '5-2', '5-3'];
      const currentIndex = allSteps.indexOf(currentStepId);
      return currentIndex === -1 || currentIndex === allSteps.length - 1 
        ? null 
        : allSteps[currentIndex + 1];
    }
  };

  const getNextButtonState = (stepId: string) => {
    const nextStepId = getNextStepId(stepId);
    const canProceed = validateStepCompletion(stepId);

    let errorMessage = null;
    if (!canProceed) {
      if (stepId === '2-1') {
      errorMessage = 'Complete the Star Card assessment to continue';
      } else if (stepId === '2-2') {
      errorMessage = 'Complete the Flow assessment to continue';
      } else if (stepId === '3-1') {
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
    const isVisited = progress.visitedSteps.includes(stepId);
    const isCurrent = progress.currentStepId === stepId;
    const isUnlocked = progress.unlockedSteps.includes(stepId);
    const canNavigate = canNavigateToStep(stepId);
    const isResource = isResourceStep(stepId);

    return {
      isCompleted: isResource ? false : isCompleted,     // Resource steps never show as "completed"
      isVisited: isResource ? isVisited : false,         // Only resource steps can be "visited"
      isCurrent,
      isUnlocked,
      canNavigate,
      showGreenCheckmark: !isResource && isCompleted,    // No green checkmarks for resource steps
      showVisitedBadge: isResource && isVisited,         // Visited badge for resource steps only
      displayState: isResource 
        ? (isVisited ? 'visited' : (isUnlocked ? 'unlocked' : 'locked'))
        : (isCompleted ? 'completed' : (isCurrent ? 'current' : (isUnlocked ? 'unlocked' : 'locked')))
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
    const mainSequence = ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4'];
    const completedMainSteps = progress.completedSteps.filter(step => mainSequence.includes(step));
    return Math.round((completedMainSteps.length / mainSequence.length) * 100);
  };

  // Check if congratulations modal should be shown (3-4 just completed)
  const shouldShowCongratulationsModal = (): boolean => {
    return progress.completedSteps.includes('3-4');
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
    module1: ['1-1', '1-2', '1-3'],
    module2: ['2-1', '2-2', '2-3', '2-4'],
    module3: ['3-1', '3-2', '3-3', '3-4'],
    module4: ['4-1', '4-2', '4-3', '4-4'],
    module5: ['5-1', '5-2', '5-3']
  };

  const getLastPosition = () => {
    // Return last video position data for resume functionality
    const videoSteps = ['1-1', '2-1', '3-1', '3-3', '4-1', '4-4'];
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
    shouldShowGreenCheckmark: (stepId: string) => !isResourceStep(stepId) && progress.completedSteps.includes(stepId),
    shouldShowVisitedBadge: (stepId: string) => isResourceStep(stepId) && progress.visitedSteps.includes(stepId),
    getVideoProgress,
    validateStepCompletion,
    isVideoStep: (stepId: string) => ['1-1', '2-1', '3-1', '3-3', '4-1', '4-4'].includes(stepId),
    isResourceStep,
    isProgressiveStep,
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
    isStepAccessibleByProgression: canNavigateToStep,
    getCurrentVideoProgress: (stepId: string) => progress.videoProgress[stepId]?.current || 0,

    // New completion modal detection
    shouldShowCongratulationsModal
  };
}
