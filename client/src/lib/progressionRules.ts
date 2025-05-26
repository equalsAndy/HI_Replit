import { ProgressionRules } from '@/shared/types';

/**
 * AllStarTeams Progression Rules
 * Defines exact completion criteria for each step according to specifications
 */
export const allstarteamsProgressionRules: ProgressionRules = {
  sequentialUnlock: true,
  completionCriteria: {
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
        allQuestionsAnswered: true, // Complete all assessment questions
        dataSubmitted: true // Save results to database at results screen
      }
    },
    '3-3': {
      type: 'video',
      requirements: {
        minWatchPercent: 1, // ≥1% watch required + 4 reflection inputs
        allQuestionsAnswered: true, // ALL 4 reflection inputs completed
        dataSubmitted: true // "Next: Add Flow to Star Card" button click
      }
    },
    '3-4': {
      type: 'activity',
      requirements: {
        exactWordCount: 4, // Select exactly 4 words
        dataSubmitted: true // "Add Attributes to Star Card" saves to DB
      }
    },

    // Visualize your Potential (5/5)
    '4-1': {
      type: 'activity',
      requirements: {
        minWatchPercent: 1, // ≥1% watch required
        slidersCompleted: true, // Cantril Ladder activity (2 sliders)
        dataSubmitted: true // "I'm Done" button saves slider values
      }
    },
    '4-2': {
      type: 'reflection',
      requirements: {
        allQuestionsAnswered: true, // ALL reflection questions answered
        dataSubmitted: true // Save responses to database
      }
    },
    '4-3': {
      type: 'activity',
      requirements: {
        dataSubmitted: true // Vision board/image selection completion
      }
    },
    '4-4': {
      type: 'reflection',
      requirements: {
        minWatchPercent: 1, // ≥1% watch required
        allQuestionsAnswered: true, // ALL reflection questions answered
        dataSubmitted: true // Save narrative responses to database
      }
    },
    '4-5': {
      type: 'reflection',
      requirements: {
        allQuestionsAnswered: true, // Final reflection question answered
        dataSubmitted: true // Save response to database
      }
    },

    // Resources (unlocked after 4-5 completion)
    '5-1': {
      type: 'activity',
      requirements: {
        dataSubmitted: false // Reference material access
      }
    },
    '5-2': {
      type: 'activity',
      requirements: {
        dataSubmitted: false // AI-generated PDF access
      }
    },
    '5-3': {
      type: 'activity',
      requirements: {
        dataSubmitted: false // Final compiled star card download
      }
    }
  }
};

/**
 * Check if step meets completion criteria
 */
export function isStepCompleted(
  stepId: string, 
  videoProgress: { [stepId: string]: number },
  completedSteps: string[],
  additionalData?: {
    assessmentCompleted?: boolean;
    reflectionAnswers?: number;
    requiredAnswers?: number;
    wordsSelected?: number;
    slidersCompleted?: boolean;
    dataSubmitted?: boolean;
  }
): boolean {
  const rules = allstarteamsProgressionRules.completionCriteria[stepId];
  if (!rules) return false;

  // Check video watch percentage requirement
  if (rules.requirements.minWatchPercent) {
    const watchedPercent = videoProgress[stepId] || 0;
    if (watchedPercent < rules.requirements.minWatchPercent) {
      return false;
    }
  }

  // Check all questions answered requirement
  if (rules.requirements.allQuestionsAnswered) {
    if (!additionalData?.reflectionAnswers || !additionalData?.requiredAnswers) {
      return false;
    }
    if (additionalData.reflectionAnswers < additionalData.requiredAnswers) {
      return false;
    }
  }

  // Check exact word count requirement
  if (rules.requirements.exactWordCount) {
    if (!additionalData?.wordsSelected || 
        additionalData.wordsSelected !== rules.requirements.exactWordCount) {
      return false;
    }
  }

  // Check sliders completed requirement
  if (rules.requirements.slidersCompleted && !additionalData?.slidersCompleted) {
    return false;
  }

  // Check data submitted requirement
  if (rules.requirements.dataSubmitted && !additionalData?.dataSubmitted) {
    return false;
  }

  return true;
}

/**
 * Get next button text based on progression rules
 */
export function getNextButtonText(stepId: string): string {
  const nextStepMap: { [key: string]: string } = {
    '1-1': 'Next: Intro to Strengths',
    '2-1': 'Next: Strengths Assessment', 
    '2-2': 'Next: Star Card Preview',
    '2-3': 'Next: Reflect',
    '2-4': 'Next: Intro to Flow',
    '3-1': 'Next: Flow Assessment',
    '3-2': 'Next: Rounding Out', 
    '3-3': 'Next: Add Flow to Star Card',
    '3-4': 'Next: Ladder of Well-being',
    '4-1': 'Next: Well-being Reflections',
    '4-2': 'Next: Visualizing You',
    '4-3': 'Next: Your Future Self',
    '4-4': 'Next: Final Reflection',
    '4-5': 'Access Resources'
  };

  return nextStepMap[stepId] || 'Next';
}

/**
 * Get activity completion button text
 */
export function getCompletionButtonText(stepId: string): string {
  const buttonTextMap: { [key: string]: string } = {
    '3-4': 'Add Attributes to Star Card',
    '4-1': "Next",
    '4-3': 'Save Vision Board'
  };

  return buttonTextMap[stepId] || 'Complete';
}