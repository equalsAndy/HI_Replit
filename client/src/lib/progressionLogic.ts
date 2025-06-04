/**
 * AllStarTeams Progression Logic System
 * Implements exact progression rules as specified in the requirements
 */

export interface ProgressionState {
  completedSteps: string[];
  currentStepId: string;
  videoProgress: Record<string, number>;
  assessmentResults: Record<string, any>;
  reflectionData: Record<string, any>;
  flowAttributesData: any;
  cantrailLadderData: any;
  visionBoardData: any;
}

export interface CompletionCriteria {
  type: 'video' | 'assessment' | 'reflection' | 'activity';
  requirements: {
    minWatchPercent?: number;
    allQuestionsAnswered?: boolean;
    dataSubmitted?: boolean;
    exactWordCount?: number;
    hasSliders?: boolean;
  };
}

/**
 * AllStarTeams Progression Rules - Exact implementation per specification
 */
export const progressionRules: Record<string, CompletionCriteria> = {
  // AllStarTeams Introduction (1/1)
  '1-1': {
    type: 'video',
    requirements: {
      minWatchPercent: 1, // ≥1% watch required
      dataSubmitted: false // "Next: Intro to Strengths" button click
    }
  },

  // Discover your Strengths (4/4)
  '2-1': {
    type: 'video', 
    requirements: {
      minWatchPercent: 1, // ≥1% watch required
      dataSubmitted: false // "Next: Strengths Assessment" button click
    }
  },
  '2-2': {
    type: 'assessment',
    requirements: {
      allQuestionsAnswered: true, // Complete all assessment questions
      dataSubmitted: true // Save results to database at results screen
    }
  },
  '2-3': {
    type: 'video',
    requirements: {
      minWatchPercent: 1, // ≥1% watch required
      dataSubmitted: false // "Next: Reflect" button click
    }
  },
  '2-4': {
    type: 'reflection',
    requirements: {
      allQuestionsAnswered: true, // ALL 6 reflection questions answered
      dataSubmitted: true // Save reflection responses to database
    }
  },

  // Find your Flow (4/4)
  '3-1': {
    type: 'video',
    requirements: {
      minWatchPercent: 1, // ≥1% watch required
      dataSubmitted: false // "Next: Flow Assessment" button click
    }
  },
  '3-2': {
    type: 'assessment',
    requirements: {
      allQuestionsAnswered: true, // Complete all flow assessment questions
      dataSubmitted: true // Save results to database at results screen
    }
  },
  '3-3': {
    type: 'video',
    requirements: {
      minWatchPercent: 1, // ≥1% watch required + 4 reflection inputs
      allQuestionsAnswered: true, // ALL 4 inputs must be completed
      dataSubmitted: true // Save reflection data to database
    }
  },
  '3-4': {
    type: 'activity',
    requirements: {
      exactWordCount: 4, // Select exactly 4 words
      dataSubmitted: true // Save flow attributes to database
    }
  },

  // Visualize your Potential (5/5)
  '4-1': {
    type: 'video',
    requirements: {
      minWatchPercent: 1, // ≥1% watch required + Cantril Ladder activity
      hasSliders: true, // 2 sliders must be set
      dataSubmitted: true // Save slider values to database
    }
  },
  '4-2': {
    type: 'reflection',
    requirements: {
      allQuestionsAnswered: true, // ALL questions answered
      dataSubmitted: true // Save reflection data to database
    }
  },
  '4-3': {
    type: 'activity',
    requirements: {
      dataSubmitted: true // Vision board/image selection completed and saved
    }
  },
  '4-4': {
    type: 'video',
    requirements: {
      minWatchPercent: 1, // ≥1% watch required + reflection questions
      allQuestionsAnswered: true, // ALL questions answered
      dataSubmitted: true // Save reflection data to database
    }
  },
  '4-5': {
    type: 'reflection',
    requirements: {
      allQuestionsAnswered: true, // One final question answered
      dataSubmitted: true // Save final reflection to database
    }
  }
};

/**
 * Check if a step can be unlocked based on progression rules
 */
export function canUnlockStep(stepId: string, progressionState: ProgressionState): boolean {
  const [section, step] = stepId.split('-').map(Number);
  
  // Step 1-1 (Introduction) is always unlocked initially
  if (stepId === '1-1') return true;
  
  // Sequential unlock within sections
  const previousStepId = step === 1 
    ? `${section - 1}-${getLastStepOfSection(section - 1)}` // Last step of previous section
    : `${section}-${step - 1}`; // Previous step in same section
  
  // Check if previous step is completed
  return progressionState.completedSteps.includes(previousStepId);
}

/**
 * Get the last step number for a given section
 */
function getLastStepOfSection(sectionNumber: number): number {
  const sectionStepCounts = {
    1: 1, // AllStarTeams Introduction: 1 step
    2: 4, // Discover your Strengths: 4 steps
    3: 4, // Find your Flow: 4 steps
    4: 5, // Visualize your Potential: 5 steps
    5: 4, // Next Steps: 4 steps (unlocked after 4-5)
    6: 4  // More Information: 4 steps (unlocked after 4-5)
  };
  
  return sectionStepCounts[sectionNumber] || 1;
}

/**
 * Check if step completion criteria are met
 */
export function isStepCompleted(stepId: string, progressionState: ProgressionState): boolean {
  const criteria = progressionRules[stepId];
  if (!criteria) return false;
  
  const { type, requirements } = criteria;
  
  switch (type) {
    case 'video':
      const videoProgress = progressionState.videoProgress[stepId] || 0;
      const hasMinWatch = !requirements.minWatchPercent || videoProgress >= requirements.minWatchPercent;
      
      // For videos with additional requirements
      if (requirements.allQuestionsAnswered) {
        const hasAnswers = progressionState.reflectionData[stepId]?.allAnswered || false;
        return hasMinWatch && hasAnswers && requirements.dataSubmitted;
      }
      
      if (requirements.hasSliders) {
        const hasSliderData = progressionState.cantrailLadderData?.completed || false;
        return hasMinWatch && hasSliderData && requirements.dataSubmitted;
      }
      
      return hasMinWatch;
      
    case 'assessment':
      const assessmentData = progressionState.assessmentResults[stepId];
      return assessmentData?.completed && requirements.dataSubmitted;
      
    case 'reflection':
      const reflectionData = progressionState.reflectionData[stepId];
      return reflectionData?.allAnswered && requirements.dataSubmitted;
      
    case 'activity':
      if (stepId === '3-4') {
        // Flow attributes: exactly 4 words selected
        const flowData = progressionState.flowAttributesData;
        const hasExactWords = flowData?.attributes?.length === 4;
        return hasExactWords && requirements.dataSubmitted;
      }
      
      if (stepId === '4-3') {
        // Vision board activity
        const visionData = progressionState.visionBoardData;
        return visionData?.completed && requirements.dataSubmitted;
      }
      
      return false;
      
    default:
      return false;
  }
}

/**
 * Get unlocked sections based on completed steps
 */
export function getUnlockedSections(completedSteps: string[]): string[] {
  const unlocked = ['1']; // Introduction always unlocked
  
  // Section 2 unlocks after completing 1-1
  if (completedSteps.includes('1-1')) {
    unlocked.push('2');
  }
  
  // Section 3 unlocks after completing all of Section 2
  if (['2-1', '2-2', '2-3', '2-4'].every(step => completedSteps.includes(step))) {
    unlocked.push('3');
  }
  
  // Section 4 unlocks after completing all of Section 3
  if (['3-1', '3-2', '3-3', '3-4'].every(step => completedSteps.includes(step))) {
    unlocked.push('4');
  }
  
  // Sections 5 and 6 unlock after completing 4-5 (Final Reflection)
  if (completedSteps.includes('4-5')) {
    unlocked.push('5', '6');
  }
  
  return unlocked;
}

/**
 * Get the next step that should be unlocked
 */
export function getNextStep(completedSteps: string[]): string | null {
  const stepOrder = [
    '1-1', // Introduction
    '2-1', '2-2', '2-3', '2-4', // Discover Strengths
    '3-1', '3-2', '3-3', '3-4', // Find Flow
    '4-1', '4-2', '4-3', '4-4', '4-5' // Visualize Potential
  ];
  
  for (const step of stepOrder) {
    if (!completedSteps.includes(step)) {
      return step;
    }
  }
  
  return null; // All steps completed
}

/**
 * Get exact menu item name for navigation buttons
 */
export function getMenuItemName(stepId: string): string {
  const menuNames: Record<string, string> = {
    '1-1': 'Introduction',
    '2-1': 'Intro to Star Strengths',
    '2-2': 'Star Strengths Self-Assessment',
    '2-3': 'Review Your Star Card',
    '2-4': 'Strength Reflection',
    '3-1': 'Intro to Flow',
    '3-2': 'Flow Assessment',
    '3-3': 'Rounding Out',
    '3-4': 'Add Flow to Star Card',
    '4-1': 'Ladder of Well-being',
    '4-2': 'Well-being Reflections',
    '4-3': 'Visualizing You',
    '4-4': 'Your Future Self',
    '4-5': 'Final Reflection'
  };
  
  return menuNames[stepId] || 'Unknown Step';
}

/**
 * Get progress indicators (e.g., "2/4" for sections)
 */
export function getSectionProgress(sectionId: string, completedSteps: string[]): { completed: number; total: number } {
  const sectionSteps = {
    '1': ['1-1'],
    '2': ['2-1', '2-2', '2-3', '2-4'],
    '3': ['3-1', '3-2', '3-3', '3-4'],
    '4': ['4-1', '4-2', '4-3', '4-4', '4-5'],
    '5': ['5-1', '5-2', '5-3', '5-4'],
    '6': ['6-1', '6-2', '6-3', '6-4']
  };
  
  const steps = sectionSteps[sectionId] || [];
  const completed = steps.filter(step => completedSteps.includes(step)).length;
  
  return { completed, total: steps.length };
}