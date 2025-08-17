import express from 'express';
import { Pool } from 'pg';
import { isAdmin } from '../middleware/roles.js';
import { getOpenAIClient } from '../services/openai-api-service.js';
import { generateOpenAICoachingResponse } from '../services/openai-api-service.js';

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_exercise_instructions (
      id SERIAL PRIMARY KEY,
      workshop_type VARCHAR(10) NOT NULL DEFAULT 'ia',
      step_id VARCHAR(32) NOT NULL,
      instruction TEXT NOT NULL,
      simulation_starter TEXT,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(workshop_type, step_id)
    );
  `);
  // Add column if upgrading from older schema
  await pool.query(`ALTER TABLE ai_exercise_instructions ADD COLUMN IF NOT EXISTS simulation_starter TEXT`);
}

router.use(async (_req, _res, next) => {
  try { await ensureTable(); } catch (e) { console.error('ensureTable failed', e); }
  next();
});

// GET list or single by stepId
router.get('/', isAdmin, async (req, res) => {
  try {
    const workshop = (req.query.workshop as string) || 'ia';
    const stepId = (req.query.stepId as string) || null;
    let result;
    if (stepId) {
      result = await pool.query('SELECT * FROM ai_exercise_instructions WHERE workshop_type=$1 AND step_id=$2', [workshop, stepId]);
      return res.json({ success: true, instruction: result.rows[0] || null });
    }
    result = await pool.query('SELECT * FROM ai_exercise_instructions WHERE workshop_type=$1 ORDER BY step_id', [workshop]);
    res.json({ success: true, instructions: result.rows });
  } catch (error) {
    console.error('Error fetching exercise instructions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch instructions' });
  }
});

// UPSERT instruction
router.post('/', isAdmin, async (req, res) => {
  try {
    const { workshopType = 'ia', stepId, instruction, simulationStarter = null, enabled = true } = req.body || {};
    const userId = (req.session as any)?.userId || null;
    if (!stepId || !instruction) {
      return res.status(400).json({ success: false, error: 'stepId and instruction are required' });
    }
    const result = await pool.query(`
      INSERT INTO ai_exercise_instructions (workshop_type, step_id, instruction, simulation_starter, enabled, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (workshop_type, step_id)
      DO UPDATE SET instruction = EXCLUDED.instruction, simulation_starter = EXCLUDED.simulation_starter, enabled = EXCLUDED.enabled, updated_at = NOW()
      RETURNING *
    `, [workshopType, stepId, instruction, simulationStarter, enabled, userId]);
    res.json({ success: true, instruction: result.rows[0] });
  } catch (error) {
    console.error('Error upserting exercise instruction:', error);
    res.status(500).json({ success: false, error: 'Failed to save instruction' });
  }
});

// DELETE by id
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid id' });
    await pool.query('DELETE FROM ai_exercise_instructions WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting instruction:', error);
    res.status(500).json({ success: false, error: 'Failed to delete instruction' });
  }
});

// GLOBAL instruction helpers (maps to step_id='__global__')
router.get('/global', isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ai_exercise_instructions WHERE workshop_type=$1 AND step_id=$2', ['ia', '__global__']);
    res.json({ success: true, instruction: result.rows[0] || null });
  } catch (error) {
    console.error('Error fetching global instruction:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch global instruction' });
  }
});

router.post('/global', isAdmin, async (req, res) => {
  try {
    const { instruction, enabled = true } = req.body || {};
    const userId = (req.session as any)?.userId || null;
    if (!instruction) return res.status(400).json({ success: false, error: 'instruction is required' });
    const result = await pool.query(`
      INSERT INTO ai_exercise_instructions (workshop_type, step_id, instruction, enabled, created_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (workshop_type, step_id)
      DO UPDATE SET instruction = EXCLUDED.instruction, enabled = EXCLUDED.enabled, updated_at = NOW()
      RETURNING *
    `, ['ia', '__global__', instruction, enabled, userId]);
    res.json({ success: true, instruction: result.rows[0] });
  } catch (error) {
    console.error('Error saving global instruction:', error);
    res.status(500).json({ success: false, error: 'Failed to save global instruction' });
  }
});

// Brainstorm endpoint: helps craft instructions
router.post('/brainstorm', isAdmin, async (req, res) => {
  try {
    const { stepId = 'ia-4-2', goals = '', constraints = '', currentDraft = '' } = req.body || {};
    const client = getOpenAIClient();
    const messages = [
      { role: 'system', content: 'You help an admin craft concise, effective guidance for an assistant that supports a specific IA exercise. Return a short instruction (bulleted if useful), 120-200 words.' },
      { role: 'user', content: `Exercise: ${stepId}\nGoals: ${goals}\nConstraints/Do&Don\'ts: ${constraints}\nCurrent draft (optional): ${currentDraft}` }
    ];
    const resp = await client.chat.completions.create({ model: 'gpt-4o-mini', messages, temperature: 0.5, max_tokens: 350 });
    const text = resp.choices?.[0]?.message?.content || '';
    res.json({ success: true, suggestion: text });
  } catch (error) {
    console.error('Brainstorm error:', error);
    res.status(500).json({ success: false, error: 'Failed to brainstorm instruction' });
  }
});

// Simulation endpoint: run assistant with current instructions
router.post('/simulate', isAdmin, async (req, res) => {
  try {
    const { stepId = 'ia-4-2', testMessage = 'I\'m stuck on this exercise.' } = req.body || {};
    // Load global and step instruction
    const globalRes = await pool.query('SELECT instruction, enabled FROM ai_exercise_instructions WHERE workshop_type=$1 AND step_id=$2', ['ia', '__global__']);
    const stepRes = await pool.query('SELECT instruction, enabled FROM ai_exercise_instructions WHERE workshop_type=$1 AND step_id=$2', ['ia', stepId]);
    const exerciseGlobalInstruction = globalRes.rows?.[0]?.enabled ? globalRes.rows[0].instruction : '';
    const exerciseInstruction = stepRes.rows?.[0]?.enabled ? stepRes.rows[0].instruction : '';

    const response = await generateOpenAICoachingResponse({
      userMessage: testMessage,
      personaType: 'talia_coach',
      userName: 'Admin Tester',
      contextData: {
        currentStep: stepId,
        workshopType: 'ia',
        exerciseInstruction,
        exerciseGlobalInstruction,
        stepName: stepId,
      },
      maxTokens: 500
    });
    res.json({ success: true, response });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ success: false, error: 'Failed to run simulation' });
  }
});

export default router;
