/**
 * Workshop Test Fixtures
 * ======================
 * Reusable test data for workshop-related tests
 */

export const astWorkshopData = {
  starCard: {
    id: 1,
    userId: 1,
    thinking: 35,
    acting: 20,
    feeling: 25,
    planning: 20,
    state: 'completed',
    createdAt: '2025-01-01T00:00:00.000Z',
    imageUrl: null
  },
  
  stepByStepReflection: {
    id: 1,
    userId: 1,
    workshopType: 'ast' as const,
    stepId: '2-4-1',
    data: {
      strength1: 'My thinking strength helps me analyze complex problems systematically.',
      strength2: 'I use my planning abilities to organize team projects effectively.',
      strength3: 'My feeling strength allows me to connect with team members.',
      strength4: 'Acting strength helps me take decisive action when needed.'
    },
    completed: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },

  videoProgress: {
    userId: 1,  
    videoId: 'ast-intro-video',
    progressPercentage: 100,
    completed: true,
    lastWatchedAt: '2025-01-01T00:00:00.000Z'
  },

  assessmentData: {
    userId: 1,
    assessmentType: 'starCard',
    results: {
      thinking: 35,
      acting: 20,
      feeling: 25,
      planning: 20
    },
    completed: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  }
}

export const iaWorkshopData = {
  introductionData: {
    id: 1,
    userId: 1,
    workshopType: 'ia' as const,
    stepId: 'ia-1-1',
    data: {
      introduction: 'I am excited to explore my imagination and creativity.'
    },
    completed: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },

  visualizationData: {
    id: 2,
    userId: 1,
    workshopType: 'ia' as const,
    stepId: 'ia-2-2',
    data: {
      visualization: 'I visualize a future where I lead creative projects with confidence.'
    },
    completed: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },

  assessmentData: {
    userId: 1,
    assessmentType: 'imaginalAgility',
    results: {
      creativity: 85,
      adaptability: 75,
      vision: 90,
      innovation: 80
    },
    completed: true,
    createdAt: '2025-01-01T00:00:00.000Z'
  }
}

export const workshopProgressData = {
  astProgress: {
    userId: 1,
    workshopType: 'ast' as const,
    completedSteps: ['1-1', '1-2', '2-1', '2-2'],
    currentStep: '2-3',
    overallProgress: 65,
    lastActivity: '2025-01-01T00:00:00.000Z'
  },

  iaProgress: {
    userId: 1,
    workshopType: 'ia' as const,
    completedSteps: ['ia-1-1', 'ia-1-2', 'ia-2-1'],
    currentStep: 'ia-2-2',
    overallProgress: 55,
    lastActivity: '2025-01-01T00:00:00.000Z'
  }
}

export const invalidWorkshopData = {
  wrongWorkshopType: {
    userId: 1,
    workshopType: 'invalid' as any,
    stepId: 'invalid-step',
    data: {}
  },

  crossContamination: {
    // AST data with IA step ID (should be prevented)
    userId: 1,
    workshopType: 'ast' as const,
    stepId: 'ia-1-1', // Wrong step format for AST
    data: {}
  },

  missingUserId: {
    workshopType: 'ast' as const,
    stepId: '1-1',
    data: {}
    // Missing userId
  }
}

export const mockApiResponses = {
  starCardSuccess: {
    success: true,
    data: astWorkshopData.starCard
  },

  workshopDataSuccess: {
    success: true,
    data: [astWorkshopData.stepByStepReflection]
  },

  progressSuccess: {
    success: true,
    data: workshopProgressData.astProgress
  },

  errorResponse: {
    success: false,
    error: 'Workshop data not found'
  },

  validationError: {
    success: false,
    error: 'Invalid workshop type or step ID'
  }
}