import express from 'express';
import { Pool } from 'pg';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Apply auth middleware to all routes
router.use(requireAuth);

console.log('🔧 PERSONA MANAGEMENT ROUTES LOADED');

// ===================================================================
// DOCUMENT NAME MAPPING
// ===================================================================

// Map UUIDs to human-readable document names for admin interface
const DOCUMENT_NAME_MAPPING = {
  // Reflection Talia Training Documents
  'd359217d-2020-44e2-8f42-25cfe01e3a2b': 'Reflection Talia Training Doc',
  
  // Star Report Talia Training Documents
  '0a6f331e-bb58-469c-8aa0-3b5db2074f1b': 'Star Report Training - Core Methodology',
  '8053a205-701b-4a10-8dd8-39d92b18566d': 'Star Report Training - Assessment Analysis',
  '3577e1e1-2fad-45d9-8ad1-12698bc327e3': 'Star Report Training - Flow State Guidance',
  '158fcf64-75e9-4f46-8331-7de774ca89a6': 'Star Report Training - Strengths Integration',
  '1ffd5369-e17a-41bb-b54c-2f38630d7ff4': 'Star Report Training - Personal Development',
  '6e98d248-db4c-4bdc-99e0-a90e25b7032c': 'Star Report Training - Professional Applications',
  '5cd8779c-4a3f-4e8a-91a7-378323ce8493': 'Star Report Training - Vision & Future Planning',
  'ddb2e849-0ff1-4766-9675-288575b95806': 'Star Report Training - Well-being Integration',
  '7a1ccb9d-31f7-4d9b-88f4-d63f3e9b50bb': 'Star Report Training - Team Dynamics',
  'a2eb129f-faa9-418b-96fb-0beda55a4eb5': 'Star Report Training - Growth Planning',
  '30bf8cb3-3411-490f-a024-c11e20728691': 'Star Report Training - Report Structure',
  '74faa6cb-91a3-41e8-a99d-96c1d4036e13': 'Star Report Training - Personalization',
  'f2cf6ca4-8954-42dd-978e-42b1c4ce6fe2': 'Star Report Training - Data Analysis',
  '24454ad2-0655-4e5e-b048-3496e1c85bce': 'Star Report Training - Coaching Integration',
  '37ffd442-c115-4291-b1e9-38993089e285': 'Star Report Training - User Journey',
  '2fe879b8-6e00-40a1-a83a-2499da4803e3': 'Star Report Training - Context Awareness',
  '7f16c08e-45c4-4847-9992-ec1445ea7605': 'Star Report Training - Communication Style',
  '55a07f54-4fc3-4297-b5eb-5a41517ea7f7': 'Star Report Training - Professional Language',
  'fed2182e-4387-4d0d-a269-7e7534df7020': 'Star Report Training - Executive Summary',
  '0535a97a-4353-4cf3-822a-36b97f12c7c0': 'Star Report Training - Action Planning',
  'a89f9f77-ecd4-4365-9adf-75fac4154528': 'Star Report Training - Developmental Guidance',
  '0dcfa7e0-a08d-45be-a299-4ca33efef3f1': 'Star Report Training - Reflection Integration',
  '9f73a4ee-7a69-490c-a530-59597825b58f': 'Star Report Training - Future Visioning',
  '8498619b-8e07-4f62-8bce-c075e17adc1b': 'Star Report Training - Leadership Development',
  'd74c99c0-12c5-4d15-9a34-d11a6394fb75': 'Star Report Training - Team Collaboration',
  '0c360d21-7da8-4299-8443-6b27e43ebfdb': 'Star Report Training - Implementation Guide'
};

// Helper function to get document name from UUID
function getDocumentName(uuid) {
  return DOCUMENT_NAME_MAPPING[uuid] || `Document ${uuid.substring(0, 8)}...`;
}

// Helper function to enhance personas with readable document names
function enhancePersonasWithDocumentNames(personas) {
  return personas.map(persona => ({
    ...persona,
    trainingDocumentNames: persona.trainingDocuments?.map(getDocumentName) || [],
    requiredDocumentNames: persona.requiredDocuments?.map(getDocumentName) || []
  }));
}

// ===================================================================
// PERSONA MANAGEMENT API
// ===================================================================

// In-memory storage for persona configurations (persists during session)
export let CURRENT_PERSONAS = [
  {
    id: 'ast_reflection',
    name: 'Reflection Talia',
    role: 'Step-by-step reflection coaching',
    description: 'Helps users think through their strength reflections during workshop steps',
    dataAccess: ['basic_user_info', 'current_step_progress', 'current_strengths_focus', 'job_title_context'],
    trainingDocuments: ['d359217d-2020-44e2-8f42-25cfe01e3a2b'], // Reflection Talia Training Doc
    requiredDocuments: ['d359217d-2020-44e2-8f42-25cfe01e3a2b'],
    tokenLimit: 800,
    enabled: true, // Set to false to disable AI coaching for testing
    environments: ['development', 'staging'],
    behavior: {
      tone: 'encouraging, conversational, coach-like',
      nameUsage: 'first',
      maxResponseLength: 400,
      helpStyle: 'guide'
    }
  },
  {
    id: 'star_report',
    name: 'Star Report Talia',
    role: 'Comprehensive report generation',
    description: 'Creates detailed personal and professional development reports',
    dataAccess: ['full_assessment_data', 'all_reflections', 'complete_journey', 'professional_context'],
    trainingDocuments: [
      "0a6f331e-bb58-469c-8aa0-3b5db2074f1b",
      "8053a205-701b-4a10-8dd8-39d92b18566d",
      "3577e1e1-2fad-45d9-8ad1-12698bc327e3",
      "158fcf64-75e9-4f46-8331-7de774ca89a6",
      "1ffd5369-e17a-41bb-b54c-2f38630d7ff4",
      "6e98d248-db4c-4bdc-99e0-a90e25b7032c",
      "5cd8779c-4a3f-4e8a-91a7-378323ce8493",
      "ddb2e849-0ff1-4766-9675-288575b95806",
      "7a1ccb9d-31f7-4d9b-88f4-d63f3e9b50bb",
      "a2eb129f-faa9-418b-96fb-0beda55a4eb5",
      "30bf8cb3-3411-490f-a024-c11e20728691",
      "74faa6cb-91a3-41e8-a99d-96c1d4036e13",
      "f2cf6ca4-8954-42dd-978e-42b1c4ce6fe2",
      "24454ad2-0655-4e5e-b048-3496e1c85bce",
      "37ffd442-c115-4291-b1e9-38993089e285",
      "2fe879b8-6e00-40a1-a83a-2499da4803e3",
      "d359217d-2020-44e2-8f42-25cfe01e3a2b",
      "7f16c08e-45c4-4847-9992-ec1445ea7605",
      "55a07f54-4fc3-4297-b5eb-5a41517ea7f7",
      "fed2182e-4387-4d0d-a269-7e7534df7020",
      "0535a97a-4353-4cf3-822a-36b97f12c7c0",
      "a89f9f77-ecd4-4365-9adf-75fac4154528",
      "0dcfa7e0-a08d-45be-a299-4ca33efef3f1",
      "9f73a4ee-7a69-490c-a530-59597825b58f",
      "8498619b-8e07-4f62-8bce-c075e17adc1b",
      "d74c99c0-12c5-4d15-9a34-d11a6394fb75",
      "0c360d21-7da8-4299-8443-6b27e43ebfdb"
    ],
    requiredDocuments: ['report_talia_training_doc', 'talia_roles_overview'],
    tokenLimit: 4000,
    enabled: true,
    environments: ['development', 'staging', 'production'],
    behavior: {
      tone: 'comprehensive, analytical, developmental',
      nameUsage: 'full',
      maxResponseLength: 15000,
      helpStyle: 'analyze'
    }
  }
];

// In-memory storage for reflection areas organized by actual workshop steps
let CURRENT_REFLECTION_AREAS = [
  {
    id: 'step_1_1',
    name: 'Step 1-1: Initial Assessment',
    description: 'Self-assessment and initial orientation activities',
    workshopStep: '1-1',
    enabled: false,
    fallbackText: 'Please take time to reflect on your initial assessment and workshop orientation.'
  },
  {
    id: 'step_2_1',
    name: 'Step 2-1: Assessment Review',
    description: 'Review and discussion of assessment results',
    workshopStep: '2-1',
    enabled: false,
    fallbackText: 'Consider your assessment results and what they reveal about your natural strengths.'
  },
  {
    id: 'step_2_2',
    name: 'Step 2-2: Understanding Your Strengths',
    description: 'Deep dive into understanding your individual strength profile',
    workshopStep: '2-2',
    enabled: false,
    fallbackText: 'Reflect on how your strengths manifest in your daily work and interactions.'
  },
  {
    id: 'step_2_3',
    name: 'Step 2-3: Strength Applications',
    description: 'Exploring how to apply your strengths in various contexts',
    workshopStep: '2-3',
    enabled: false,
    fallbackText: 'Consider specific examples of how you have used your strengths successfully.'
  },
  {
    id: 'step_2_4',
    name: 'Step 2-4: Strength Reflections',
    description: 'Individual strength reflections (Strengths 1-4) plus team environment reflections: "What You Value Most in Team Environments" and "Your Unique Contribution"',
    workshopStep: '2-4',
    enabled: true,
    reflectionCount: 6,
    reflections: [
      'Strength 1 Reflection',
      'Strength 2 Reflection', 
      'Strength 3 Reflection',
      'Strength 4 Reflection',
      'What You Value Most in Team Environments',
      'Your Unique Contribution'
    ],
    fallbackText: 'This step contains 6 reflections: 4 individual strength reflections and 2 team-focused reflections. Please work through each reflection thoughtfully.'
  },
  {
    id: 'step_3_1',
    name: 'Step 3-1: Team Applications',
    description: 'Applying your strengths within team contexts',
    workshopStep: '3-1',
    enabled: true,
    fallbackText: 'Consider how you can leverage your strengths to contribute more effectively in team settings.'
  },
  {
    id: 'step_3_2',
    name: 'Step 3-2: Flow Assessment',
    description: 'Assessment of flow attributes and preferences',
    workshopStep: '3-2',
    enabled: true,
    fallbackText: 'Complete your flow assessment to understand your flow state preferences and patterns.'
  },
  {
    id: 'step_3_3',
    name: 'Step 3-3: Flow Reflections',
    description: 'Four reflections on flow states: natural flow conditions, flow blockers, flow enablers, and creating more flow opportunities',
    workshopStep: '3-3',
    enabled: true,
    reflectionCount: 4,
    reflections: [
      'When does flow happen most naturally for you?',
      'What typically blocks or interrupts your flow state?',
      'What conditions help you get into flow more easily?',
      'How could you create more opportunities for flow in your work and life?'
    ],
    fallbackText: 'This step contains 4 flow-related reflections. Please work through each reflection thoughtfully, considering your personal flow experiences.'
  },
  {
    id: 'step_3_4',
    name: 'Step 3-4: Flow Attributes Selection',
    description: 'Interactive exercise where users select 4 flow attribute words that describe their optimal flow state to complement their Star strengths profile',
    workshopStep: '3-4',
    enabled: true,
    isExercise: true,
    exerciseInstructions: {
      purpose: 'Flow attributes represent how you work at your best. They complement your Star strengths profile which shows what you\'re naturally good at. Together, they create a more complete picture of your professional identity.',
      task: 'Select four flow attributes that best describe your optimal flow state. These will be added to your StarCard to create a comprehensive visualization.',
      userAction: 'Choose 4 words that best describe your flow state from the available options. Users can click badges to select/deselect and drag to reorder selections.',
      completionPhrase: 'I find myself in flow when I am being: [4 selected attributes]',
      taliaGuidance: 'Help users think about their flow reflections from step 3-3 and connect them to the available attribute words. Look up current flow attribute options dynamically before providing guidance.'
    },
    fallbackText: 'Select 4 flow attribute words that best describe how you work at your best. Consider your flow reflections as you make your choices.'
  },
  {
    id: 'step_4_1',
    name: 'Step 4-1: Future Vision',
    description: 'Future visioning activities and planning exercises that may benefit from Talia coaching support',
    workshopStep: '4-1',
    enabled: true,
    fallbackText: 'Work through your future vision planning exercises. Consider how your strengths and flow attributes can help you achieve your goals.'
  },
  {
    id: 'step_4_2',
    name: 'Step 4-2: Well-being Assessment Reflections',
    description: 'Five reflections based on the Cantril Ladder well-being assessment: current rating factors, main well-being elements, envisioned improvements, tangible differences, and quarterly commitments',
    workshopStep: '4-2',
    enabled: true,
    reflectionCount: 5,
    reflections: [
      'What factors shape your current rating?',
      'What are the main elements contributing to your current well-being? Consider your work, relationships, health, finances, and personal growth...',
      'What improvements do you envision? What achievements or changes would make your life better in one year?',
      'What will be different? How will your experience be noticeably different in tangible ways?',
      'What actions will you commit to this quarter? Name 1-2 concrete steps you\'ll take before your first quarterly check-in.'
    ],
    specialContext: 'cantril_ladder',
    fallbackText: 'This step contains 5 well-being reflections based on your Cantril Ladder assessment. Talia should be aware of your ladder rating and help you connect your responses to your assessment results.'
  },
  {
    id: 'step_4_3',
    name: 'Step 4-3: Vision Images Exercise',
    description: 'Interactive exercise where users select 1-5 images that represent their ideal future self, followed by a reflection on what the images mean to them',
    workshopStep: '4-3',
    enabled: true,
    isExercise: true,
    hasReflection: true,
    exerciseInstructions: {
      purpose: 'This exercise helps you turn your one-year vision into something visible by selecting images that represent your ideal future self.',
      task: 'Select 1-5 images that represent your ideal future self. You can upload your own images or search for images from Unsplash.',
      userAction: 'Choose images that evoke positive emotions, align with your ladder reflection, and represent different aspects of your future vision.',
      imageStorage: 'Selected images should be stored in the photo service database for future reference.',
      imageGuidelines: {
        maxImages: 5,
        minImages: 1,
        maxFileSize: '10MB',
        sources: ['Upload your own images', 'Search Unsplash stock images'],
        selectionCriteria: [
          'Choose images that evoke positive emotions',
          'Look for images that align with your ladder reflection', 
          'Select a variety of images that represent different aspects of your future vision'
        ]
      },
      reflectionPrompt: 'What do these images mean to you? Explain what these images represent about your future vision. How do they connect to your strengths and flow state?',
      taliaGuidance: 'Help users think about how their selected images connect to their strengths, flow state, and future vision. Support them in reflecting on the deeper meaning behind their image choices.'
    },
    fallbackText: 'Select 1-5 images that represent your ideal future self, then reflect on what these images mean to you and how they connect to your strengths and flow state.'
  },
  {
    id: 'step_4_4',
    name: 'Step 4-4: Future Self Journey Reflections',
    description: 'Four reflections exploring your future self timeline: 20-year masterpiece, 10-year mastery, 5-year development, and flow-optimized life design',
    workshopStep: '4-4',
    enabled: true,
    reflectionCount: 4,
    reflections: [
      '20 Years: What is the masterpiece of your life?',
      '10 Years: What level of mastery or influence must you have reached by now to be on track?',
      '5 Years: What capacities or conditions need to be actively developing now?',
      'Flow-Optimized Life: What would your life look like if it were designed to support flow states more often?'
    ],
    exerciseContext: {
      purpose: 'This exercise helps you imagine who you want to become—and how to shape a life that supports that becoming.',
      approach: 'Use your Flow Assessment insights to guide your vision. You can work backwards (20→10→5 years) or forwards (5→10→20 years). There\'s no right way—only your way.',
      flowConnection: 'Bridge to flow by designing a life that supports the conditions where you experience deep focus, energy, and ease.',
      timeline: {
        direction: 'Choose your direction - work backwards from 20 years or forwards from 5 years',
        twentyYear: 'What is the masterpiece of your life?',
        tenYear: 'What level of mastery or influence must you have reached by now to be on track?',
        fiveYear: 'What capacities or conditions need to be actively developing now?',
        flowOptimized: 'What would your life look like if it were designed to support flow states more often?'
      }
    },
    specialContext: 'future_self_timeline',
    fallbackText: 'This step contains 4 reflections about your future self journey. Use your Flow Assessment insights to guide your vision as you explore your timeline and design a flow-optimized life.'
  },
  {
    id: 'step_4_5',
    name: 'Step 4-5: Journey Completion Reflection',
    description: 'Final reflection to distill the entire workshop experience into one key insight to carry forward into team collaboration',
    workshopStep: '4-5',
    enabled: true,
    reflectionCount: 1,
    reflections: [
      'What\'s the one insight you want to carry forward?'
    ],
    journeyContext: {
      purpose: 'Distill the entire workshop experience into one clear insight that will guide you forward as you move into team collaboration.',
      journeyScope: 'You\'ve completed a journey of personal discovery, from understanding your core strengths to envisioning your future potential. Each step revealed something valuable about who you are.',
      focusArea: 'This insight should be something you want to remember as you transition from individual reflection to team collaboration.',
      reflectionPrompt: 'What\'s the one insight you want to carry forward?'
    },
    specialContext: 'workshop_completion',
    fallbackText: 'Reflect on your entire workshop journey and distill your experience into one key insight you want to carry forward into team collaboration.'
  }
];

// ===================================================================
// GET /api/admin/ai/personas
// Get all personas with their configurations (filtered by environment)
// ===================================================================
router.get('/personas', requireAdmin, async (req, res) => {
  try {
    console.log('🔧 PERSONA GET REQUEST RECEIVED');
    console.log('📋 Fetching persona configurations');

    const currentEnvironment = process.env.NODE_ENV || 'development';
    
    // Filter personas by current environment
    const filteredPersonas = CURRENT_PERSONAS.filter(persona => 
      persona.environments.includes(currentEnvironment)
    );

    console.log(`🌍 Environment: ${currentEnvironment}, Available personas: ${filteredPersonas.length}/${CURRENT_PERSONAS.length}`);

    // Enhance personas with readable document names for admin interface
    const enhancedPersonas = enhancePersonasWithDocumentNames(filteredPersonas);
    console.log(`✅ Enhanced personas with document names:`, enhancedPersonas[0]?.requiredDocumentNames || 'No required docs');

    res.json({
      success: true,
      personas: enhancedPersonas,
      environment: currentEnvironment,
      message: 'Personas retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching personas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personas'
    });
  }
});

// ===================================================================
// PUT /api/admin/ai/personas/:personaId  
// Update persona configuration
// ===================================================================
router.put('/personas/:personaId', requireAdmin, async (req, res) => {
  try {
    const { personaId } = req.params;
    const updates = req.body;

    console.log('🔧 PERSONA UPDATE REQUEST:', personaId, updates);
    console.log('🔧 Current persona before update:', CURRENT_PERSONAS.find(p => p.id === personaId));

    // Find and update the persona in memory
    const personaIndex = CURRENT_PERSONAS.findIndex(p => p.id === personaId);
    
    if (personaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Persona not found'
      });
    }

    // Update the persona with provided fields
    CURRENT_PERSONAS[personaIndex] = {
      ...CURRENT_PERSONAS[personaIndex],
      ...updates
    };

    console.log('🔧 Persona AFTER update:', CURRENT_PERSONAS[personaIndex]);
    console.log('🔧 ALL PERSONAS current state:', CURRENT_PERSONAS.map(p => ({ id: p.id, enabled: p.enabled })));

    // Enhance the updated persona with readable document names
    const enhancedPersona = enhancePersonasWithDocumentNames([CURRENT_PERSONAS[personaIndex]])[0];

    res.json({
      success: true,
      message: `Persona ${personaId} updated successfully`,
      persona: enhancedPersona
    });

  } catch (error) {
    console.error('❌ Error updating persona:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update persona'
    });
  }
});

// ===================================================================
// GET /api/admin/ai/reflection-areas
// Get all reflection areas with their status
// ===================================================================
router.get('/reflection-areas', requireAdmin, async (req, res) => {
  try {
    console.log('📋 Fetching reflection areas');

    res.json({
      success: true,
      areas: CURRENT_REFLECTION_AREAS,
      message: 'Reflection areas retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching reflection areas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reflection areas'
    });
  }
});

// ===================================================================
// PUT /api/admin/ai/reflection-areas/:areaId
// Update reflection area configuration
// ===================================================================
router.put('/reflection-areas/:areaId', requireAdmin, async (req, res) => {
  try {
    const { areaId } = req.params;
    const updates = req.body;

    console.log('✅ Updating reflection area:', areaId, updates);

    // Find and update the reflection area in memory
    const areaIndex = CURRENT_REFLECTION_AREAS.findIndex(a => a.id === areaId);
    
    if (areaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Reflection area not found'
      });
    }

    // Update the reflection area with provided fields
    CURRENT_REFLECTION_AREAS[areaIndex] = {
      ...CURRENT_REFLECTION_AREAS[areaIndex],
      ...updates
    };

    console.log('✅ Reflection area updated successfully:', CURRENT_REFLECTION_AREAS[areaIndex]);

    res.json({
      success: true,
      message: `Reflection area ${areaId} updated successfully`,
      area: CURRENT_REFLECTION_AREAS[areaIndex]
    });

  } catch (error) {
    console.error('❌ Error updating reflection area:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update reflection area'
    });
  }
});

// ===================================================================
// GET /api/admin/ai/reflection-areas/:areaId/status
// Check if reflection area is enabled (for fallback logic)
// ===================================================================
router.get('/reflection-areas/:areaId/status', async (req, res) => {
  try {
    const { areaId } = req.params;
    
    console.log('🔍 Checking reflection area status:', areaId);

    // Find the area in current memory storage
    const area = CURRENT_REFLECTION_AREAS.find(a => a.id === areaId);

    if (!area) {
      return res.status(404).json({
        success: false,
        error: 'Reflection area not found'
      });
    }

    res.json({
      success: true,
      area: {
        id: area.id,
        enabled: area.enabled,
        fallbackText: area.fallbackText
      }
    });

  } catch (error) {
    console.error('❌ Error checking reflection area status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check reflection area status'
    });
  }
});

export default router;