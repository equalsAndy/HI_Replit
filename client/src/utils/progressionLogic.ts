// Progression Logic for AllStarTeams Workshop
// Implements completion detection and navigation progression as specified

import { WorkshopType } from '../types/workshop';

export interface CompletionDetectionResult {
  isComplete: boolean;
  missingRequirements?: string[];
}

export interface NavigationProgressData {
  completedSteps: string[];
  currentStepId: string;
  appType: string;
  lastVisitedAt: string;
  unlockedSections: string[];
  videoProgress: { [stepId: string]: number };
}

// Section step mappings for progress calculation
export const SECTION_STEPS = {
  introduction: ["1-1"],
  starStrengths: ["2-1", "2-2", "2-3", "2-4"], 
  flow: ["3-1", "3-2", "3-3", "3-4"],
  potential: ["4-1", "4-2", "4-3", "4-4", "4-5"]
};

// AST step sequence
// ...existing code...

// IA step sequence
export const IA_STEPS = [
  // Welcome & Orientation
  'ia-1-1', // Introduction to Imaginal Agility
  'ia-1-2', // AI's 4X Mental Challenge
  
  // The I4C Model
  'ia-2-1', // I4C Prism Overview
  'ia-2-2', // I4C Self-Assessment
  'ia-2-3', // Review Radar Map
  
  // Ladder of Imagination (Basics)
  'ia-3-1', // Ladder Overview
  'ia-3-2', // Autoflow Practice
  'ia-3-3', // Visualization Exercise
  'ia-3-4', // Higher Purpose Reflection
  'ia-3-5', // Inspiration Moments
  'ia-3-6', // The Unimaginable
  
  // Advanced Ladder of Imagination
  'ia-4-1', // Advanced Ladder Overview
  'ia-4-2', // Autoflow Mindful Prompts
  'ia-4-3', // Visualization Stretch
  'ia-4-4', // Higher Purpose Uplift
  'ia-4-5', // Inspiration Support
  'ia-4-6', // Nothing is Unimaginable
  
  // Outcomes & Benefits
  'ia-5-1', // HaiQ
  'ia-5-2', // ROI 2.0
  'ia-5-3', // Course Completion Badge
  'ia-5-4', // Imaginal Agility Compendium
  'ia-5-5', // Community of Practice
  
  // Quarterly Tune-Up
  'ia-6-1', // Orientation
  'ia-6-2', // Practices
  
  // More Info
  'ia-7-1', // The Neuroscience of Imagination
  'ia-7-2', // About Heliotrope Imaginal
] as const;

// Assessment type validation functions
export const assessmentValidators = {
  starCard: (data: any): boolean => {
    return data && 
           typeof data.thinking === 'number' && 
           typeof data.acting === 'number' && 
           typeof data.feeling === 'number' && 
           typeof data.planning === 'number' &&
           Math.abs((data.thinking + data.acting + data.feeling + data.planning) - 100) < 0.01;
  },

  stepByStepReflection: (data: any): boolean => {
    const requiredFields = ['strength1', 'strength2', 'strength3', 'strength4', 'teamValues', 'uniqueContribution'];
    return data && requiredFields.every(field => 
      data[field] && typeof data[field] === 'string' && data[field].trim().length >= 10
    );
  },

  flowAssessment: (data: any): boolean => {
    return data && 
           data.answers && 
           typeof data.flowScore === 'number' &&
           typeof data.totalQuestions === 'number' &&
           typeof data.maxScore === 'number';
  },

  roundingOutReflection: (data: any): boolean => {
    const requiredFields = ['strengths', 'values', 'passions', 'growthAreas'];
    return data && requiredFields.every(field => 
      data[field] && typeof data[field] === 'string' && data[field].trim().length > 0
    );
  },

  flowAttributes: (data: any): boolean => {
    return data && 
           data.attributes && 
           Array.isArray(data.attributes) && 
           data.attributes.length === 4 &&
           data.attributes.every((attr: any) => typeof attr === 'string' && attr.trim().length > 0);
  },

  cantrilLadder: (data: any): boolean => {
    return data && 
           typeof data.currentRating === 'number' && 
           typeof data.futureRating === 'number' &&
           data.currentRating >= 0 && data.currentRating <= 10 &&
           data.futureRating >= 0 && data.futureRating <= 10;
  },

  cantrilLadderReflection: (data: any): boolean => {
    const requiredFields = ['currentFactors', 'futureImprovements', 'specificChanges', 'quarterlyProgress', 'quarterlyActions'];
    return data && requiredFields.every(field => 
      data[field] && typeof data[field] === 'string' && data[field].trim().length > 0
    );
  },

  visualizingPotential: (data: any): boolean => {
    return data && 
           data.selectedImages && 
           Array.isArray(data.selectedImages) && 
           data.selectedImages.length > 0 &&
           data.imageMeaning && 
           typeof data.imageMeaning === 'string' && 
           data.imageMeaning.trim().length > 0;
  },

  futureSelfReflection: (data: any): boolean => {
    const requiredFields = ['futureSelfDescription', 'visualizationNotes', 'additionalNotes'];
    return data && requiredFields.every(field => 
      data[field] && typeof data[field] === 'string' && data[field].trim().length > 0
    );
  },

  finalReflection: (data: any): boolean => {
    // Check for either the old format (keyInsights, actionSteps, commitments) or new format (futureLetterText)
    if (data && data.futureLetterText && typeof data.futureLetterText === 'string' && data.futureLetterText.trim().length > 0) {
      return true;
    }
    // Fallback to old format for backward compatibility
    const requiredFields = ['keyInsights', 'actionSteps', 'commitments'];
    return data && requiredFields.every(field => 
      data[field] && typeof data[field] === 'string' && data[field].trim().length > 0
    );
  }
};

// Check if step is completed based on type and requirements
export const isStepCompleted = (
  stepId: string, 
  userAssessments: any[], 
  navigationProgress: NavigationProgressData
): CompletionDetectionResult => {
  
  switch (stepId) {
    case '1-1': // Introduction Video
      return isVideoCompleted(stepId, navigationProgress, 1);
    
    case '2-1': // Intro to Star Strengths
      return isVideoCompleted(stepId, navigationProgress, 1);
    
    case '2-2': // Star Strengths Self-Assessment
      return isAssessmentCompleted('starCard', userAssessments);
    
    case '2-3': // Review Your Star Card
      return isVideoCompleted(stepId, navigationProgress, 1);
    
    case '2-4': // Strength Reflection
      return isAssessmentCompleted('stepByStepReflection', userAssessments);
    
    case '3-1': // Intro to Flow
      return isVideoCompleted(stepId, navigationProgress, 1);
    
    case '3-2': // Flow Assessment
      return isAssessmentCompleted('flowAssessment', userAssessments);
    
    case '3-3': // Rounding Out
      return isAssessmentCompleted('roundingOutReflection', userAssessments);
    
    case '3-4': // Add Flow to Star Card
      return isAssessmentCompleted('flowAttributes', userAssessments);
    
    case '4-1': // Ladder of Well-being
      return isAssessmentCompleted('cantrilLadder', userAssessments);
    
    case '4-2': // Well-being Reflections
      return isAssessmentCompleted('cantrilLadderReflection', userAssessments);
    
    case '4-3': // Visualizing You
      return isAssessmentCompleted('visualizingPotential', userAssessments);
    
    case '4-4': // Your Future Self
      return isAssessmentCompleted('futureSelfReflection', userAssessments);
    
    case '4-5': // Final Reflection
      return isAssessmentCompleted('finalReflection', userAssessments);
    
    // IA Steps
    case 'ia-1-1': // Introduction to Imaginal Agility
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-1-2': // AI's 4X Mental Challenge
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-2-1': // I4C Prism Overview
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-2-2': // I4C Self-Assessment
      return isAssessmentCompleted('I4C', userAssessments);
    case 'ia-2-3': // Review Radar Map
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-3-1': // Ladder Overview
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-3-2': // Autoflow Practice
      return isAssessmentCompleted('autoflow_basic', userAssessments);
    case 'ia-3-3': // Visualization Exercise
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-3-4': // Higher Purpose Reflection
      return isAssessmentCompleted('higher_purpose', userAssessments);
    case 'ia-3-5': // Inspiration Moments
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-3-6': // The Unimaginable
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-4-1': // Advanced Ladder Overview
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-4-2': // Autoflow Mindful Prompts
      return isAssessmentCompleted('autoflow_advanced', userAssessments);
    case 'ia-4-3': // Visualization Stretch
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-4-4': // Higher Purpose Uplift
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-4-5': // Inspiration Support
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-4-6': // Nothing is Unimaginable
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-5-1': // HaiQ
      return isAssessmentCompleted('haiq', userAssessments);
    case 'ia-5-2': // ROI 2.0
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-5-3': // Course Completion Badge
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-5-4': // Imaginal Agility Compendium
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-5-5': // Community of Practice
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-6-1': // Orientation
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-6-2': // Practices
      return isAssessmentCompleted('practices', userAssessments);
    case 'ia-7-1': // The Neuroscience of Imagination
      return isVideoCompleted(stepId, navigationProgress, 1);
    case 'ia-7-2': // About Heliotrope Imaginal
      return isVideoCompleted(stepId, navigationProgress, 1);
    
    default:
      return { isComplete: false, missingRequirements: ['Unknown step'] };
  }
};

// Helper function to check video completion
const isVideoCompleted = (
  stepId: string, 
  navigationProgress: NavigationProgressData, 
  minPercentage: number = 5
): CompletionDetectionResult => {
  const progress = navigationProgress?.videoProgress?.[stepId] || 0;
  const globalProgress = (window as any).currentVideoProgress?.[stepId] || 0;
  const currentProgress = Math.max(progress, globalProgress);
  const isComplete = currentProgress >= minPercentage;
  
  console.log(`🎬 Video completion check - Step: ${stepId}, Progress: ${currentProgress}%, Required: ${minPercentage}%, Complete: ${isComplete}`);
  
  return {
    isComplete,
    missingRequirements: isComplete ? [] : [`Video must be watched to at least ${minPercentage}%`]
  };
};

// Helper function to check assessment completion
const isAssessmentCompleted = (
  assessmentType: string, 
  userAssessments: any[]
): CompletionDetectionResult => {
  const assessment = userAssessments.find(a => a.assessmentType === assessmentType);
  
  if (!assessment) {
    return { 
      isComplete: false, 
      missingRequirements: [`${assessmentType} assessment not found`] 
    };
  }
  
  try {
    const data = JSON.parse(assessment.results);
    const validator = assessmentValidators[assessmentType as keyof typeof assessmentValidators];
    
    if (!validator) {
      return { 
        isComplete: false, 
        missingRequirements: [`No validator found for ${assessmentType}`] 
      };
    }
    
    const isValid = validator(data);
    return {
      isComplete: isValid,
      missingRequirements: isValid ? [] : [`${assessmentType} data is incomplete or invalid`]
    };
  } catch (error) {
    return { 
      isComplete: false, 
      missingRequirements: [`Error parsing ${assessmentType} data`] 
    };
  }
};

// Calculate section progress based on completed steps
export const getSectionProgress = (sectionSteps: string[], completedSteps: string[]) => {
  const completedInSection = sectionSteps.filter(stepId => 
    completedSteps.includes(stepId)
  ).length;
  
  // Debug logging for false positive detection
  console.log(`📊 Section Progress Debug:`, {
    sectionSteps,
    completedSteps,
    completedInSection,
    total: sectionSteps.length,
    display: `${completedInSection}/${sectionSteps.length}`,
    stackTrace: new Error().stack?.split('\n').slice(1, 3)
  });
  
  return {
    completed: completedInSection,
    total: sectionSteps.length,
    display: `${completedInSection}/${sectionSteps.length}`,
    isComplete: completedInSection === sectionSteps.length
  };
};

// Determine which sections should be unlocked based on completion
export const getUnlockedSections = (completedSteps: string[]): string[] => {
  const unlockedSections = ['1']; // Introduction always unlocked
  
  // Section 2 unlocks after Introduction (1-1) is complete
  if (completedSteps.includes('1-1')) {
    unlockedSections.push('2');
  }
  
  // Section 3 unlocks after all of Section 2 is complete
  const section2Complete = SECTION_STEPS.starStrengths.every(stepId => 
    completedSteps.includes(stepId)
  );
  if (section2Complete) {
    unlockedSections.push('3');
  }
  
  // Section 4 unlocks after all of Section 3 is complete
  const section3Complete = SECTION_STEPS.flow.every(stepId => 
    completedSteps.includes(stepId)
  );
  if (section3Complete) {
    unlockedSections.push('4');
  }
  
  // Sections 5 and 6 unlock after Final Reflection (4-5) is complete
  if (completedSteps.includes('4-5')) {
    unlockedSections.push('5', '6');
  }
  
  return unlockedSections;
};

// Get the next step that should be unlocked
export const getNextStepId = (completedSteps: string[]): string | null => {
  const allSteps = [
    '1-1', '2-1', '2-2', '2-3', '2-4', 
    '3-1', '3-2', '3-3', '3-4',
    '4-1', '4-2', '4-3', '4-4', '4-5'
  ];
  
  for (const stepId of allSteps) {
    if (!completedSteps.includes(stepId)) {
      return stepId;
    }
  }
  
  return null; // All steps completed
};

// Check if a specific step should be accessible
export const isStepAccessible = (
  stepId: string, 
  completedSteps: string[]
): boolean => {
  const allSteps = [
    '1-1', '2-1', '2-2', '2-3', '2-4', 
    '3-1', '3-2', '3-3', '3-4',
    '4-1', '4-2', '4-3', '4-4', '4-5'
  ];
  
  const stepIndex = allSteps.indexOf(stepId);
  if (stepIndex === -1) return false;
  
  // First step is always accessible
  if (stepIndex === 0) return true;
  
  // All previous steps must be completed
  for (let i = 0; i < stepIndex; i++) {
    if (!completedSteps.includes(allSteps[i])) {
      return false;
    }
  }
  
  return true;
};

// Validation helper functions
const hasI4CAssessment = (assessments: any[]): boolean => {
  return assessments.some(a => a.type === 'I4C' && a.completed);
};

const hasAutoflowData = (assessments: any[]): boolean => {
  return assessments.some(a => a.type === 'autoflow_basic' && a.completed);
};

const hasHigherPurposeReflection = (assessments: any[]): boolean => {
  return assessments.some(a => a.type === 'higher_purpose' && a.completed);
};

const hasAdvancedAutoflowData = (assessments: any[]): boolean => {
  return assessments.some(a => a.type === 'autoflow_advanced' && a.completed);
};

const hasHaiQAssessment = (assessments: any[]): boolean => {
  return assessments.some(a => a.type === 'haiq' && a.completed);
};

const hasPracticesData = (assessments: any[]): boolean => {
  return assessments.some(a => a.type === 'practices' && a.completed);
};

// IA validation function
const validateIAStep = (stepId: string, userAssessments: any[]): boolean => {
  switch (stepId) {
    case 'ia-2-2': return hasI4CAssessment(userAssessments);
    case 'ia-3-2': return hasAutoflowData(userAssessments);
    case 'ia-3-4': return hasHigherPurposeReflection(userAssessments);
    case 'ia-4-2': return hasAdvancedAutoflowData(userAssessments);
    case 'ia-5-1': return hasHaiQAssessment(userAssessments);
    case 'ia-6-2': return hasPracticesData(userAssessments);
    default:
      return true; // Videos and content unlock automatically
  }
};

// Update main validation function to support both workshop types
export const validateStepCompletion = (
  workshopType: WorkshopType,
  stepId: string, 
  userAssessments: any[]
): boolean => {
  if (workshopType === 'IA') {
    return validateIAStep(stepId, userAssessments);
  }
  // Default AST validation (assuming content-based progression)
  return true;
};