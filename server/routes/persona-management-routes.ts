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

// In-memory storage for reflection areas organized by workshop steps
let CURRENT_REFLECTION_AREAS = [
  {
    id: 'step_2_2',
    name: 'Step 2-2: Star Strengths Reflection',
    description: 'Reflection on primary strength identification and application',
    workshopStep: '2-2',
    enabled: true,
    fallbackText: 'Please take time to reflect on your primary strength and how it manifests in your daily work and personal interactions.'
  },
  {
    id: 'step_2_3', 
    name: 'Step 2-3: Star Card Deep Dive',
    description: 'Deeper exploration of strength combinations and secondary strengths',
    workshopStep: '2-3',
    enabled: true,
    fallbackText: 'Consider how your secondary strength complements your primary strength in achieving your goals.'
  },
  {
    id: 'step_2_4',
    name: 'Step 2-4: Strength Integration', 
    description: 'Understanding how third and fourth strengths contribute to your profile',
    workshopStep: '2-4',
    enabled: true,
    fallbackText: 'Reflect on specific examples where your additional strengths have helped you overcome challenges.'
  },
  {
    id: 'step_3_1',
    name: 'Step 3-1: Team Dynamics & Flow',
    description: 'Applying individual strengths within team contexts and flow states',
    workshopStep: '3-1',
    enabled: true,
    fallbackText: 'Consider how you can leverage your strengths to contribute more effectively in team settings and achieve flow.'
  },
  {
    id: 'step_3_2',
    name: 'Step 3-2: Leadership & Influence',
    description: 'Using your strength profile to lead and influence others positively',
    workshopStep: '3-2',
    enabled: true,
    fallbackText: 'Reflect on how your strengths can inform your leadership approach and help you influence others positively.'
  },
  {
    id: 'step_3_3',
    name: 'Step 3-3: Development Planning',
    description: 'Creating actionable plans for continued strength development',
    workshopStep: '3-3',
    enabled: true,
    fallbackText: 'Create specific action steps for continuing to develop and apply your strengths in new ways.'
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

    res.json({
      success: true,
      personas: filteredPersonas,
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

    res.json({
      success: true,
      message: `Persona ${personaId} updated successfully`,
      persona: CURRENT_PERSONAS[personaIndex]
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