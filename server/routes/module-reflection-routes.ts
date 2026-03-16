import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db.js';
import { workshopStepData } from '../../shared/schema.js';
import { and, eq, isNull, inArray } from 'drizzle-orm';
import { getTrainingDoc } from '../config/training-doc-loader.js';
import { getProvider } from '../services/ai-provider.js';

const router = express.Router();

const STEP_IDS = ['ia-3-2', 'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6'] as const;

const EXERCISE_NAMES: Record<string, string> = {
  autoflow: 'Autoflow (ia-3-2)',
  visualization: 'Visualization (ia-3-3)',
  intention: 'Intention (ia-3-4)',
  inspiration: 'Inspiration (ia-3-5)',
  mystery: 'Mystery (ia-3-6)',
};

const STEP_TO_EXERCISE: Record<string, string> = {
  'ia-3-2': 'autoflow',
  'ia-3-3': 'visualization',
  'ia-3-4': 'intention',
  'ia-3-5': 'inspiration',
  'ia-3-6': 'mystery',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Strip markdown code fences from AI response before JSON.parse */
function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
}

function buildAutoflowBlock(data: any): string {
  const moments = data?.savedMoments;
  if (!Array.isArray(moments) || moments.length === 0) return 'No moments captured';
  return 'Captured moments:\n' + moments.map((m: any) => `- "${m.text}" [${m.tag}]`).join('\n');
}

function buildVisualizationBlock(data: any): string {
  if (!data?.imageTitle && !data?.reflection) return 'No visualization completed';
  const parts: string[] = [];
  if (data.imageTitle) parts.push(`Image title: ${data.imageTitle}`);
  if (data.reflection) parts.push(`Reflection: ${data.reflection}`);
  return parts.join('\n');
}

function buildIntentionBlock(data: any): string {
  if (!data?.whyReflection && !data?.howReflection && !data?.whatReflection && !data?.nextStep) {
    return 'No intention completed';
  }
  const parts: string[] = [];
  if (data.whyReflection) parts.push(`Why (what pulls their attention): ${data.whyReflection}`);
  if (data.howReflection) parts.push(`How (where positioned to act): ${data.howReflection}`);
  if (data.whatReflection) parts.push(`What (desired impact): ${data.whatReflection}`);
  if (data.nextStep) parts.push(`Next step: ${data.nextStep}`);
  return parts.join('\n');
}

function buildInspirationBlock(data: any): string {
  const hasContent = data?.patternReflection || data?.momentStory || data?.feelingClaim ||
    (Array.isArray(data?.completed) && data.completed.length > 0);
  if (!hasContent) return 'No interludes completed';

  const parts: string[] = [];
  if (Array.isArray(data.completed) && data.completed.length > 0) {
    const responses = data.responses || {};
    const interludeLines = data.completed.map((id: string) => {
      const response = responses[id];
      return response ? `- ${id}: "${response}"` : `- ${id}: (completed, no text)`;
    });
    parts.push(`Completed interludes:\n${interludeLines.join('\n')}`);
  }
  if (data.patternReflection) parts.push(`Pattern reflection: ${data.patternReflection}`);
  if (data.momentStory) parts.push(`Moment story: ${data.momentStory}`);
  if (data.feelingClaim) parts.push(`Feeling claim: ${data.feelingClaim}`);
  return parts.join('\n');
}

function buildMysteryBlock(data: any): string {
  if (!data?.selectedMystery && !data?.visionText) return 'No mystery completed';
  const parts: string[] = [];
  if (data.selectedMystery) parts.push(`Selected mystery: ${data.selectedMystery}`);
  if (data.selectedQuestion) parts.push(`Question: ${data.selectedQuestion}`);
  if (data.visionText) parts.push(`Vision/Leap: ${data.visionText}`);
  if (data.reflectionText) parts.push(`Post-leap reflection: ${data.reflectionText}`);
  return parts.join('\n');
}

const BLOCK_BUILDERS: Record<string, (data: any) => string> = {
  'ia-3-2': buildAutoflowBlock,
  'ia-3-3': buildVisualizationBlock,
  'ia-3-4': buildIntentionBlock,
  'ia-3-5': buildInspirationBlock,
  'ia-3-6': buildMysteryBlock,
};

function assembleUserPrompt(stepDataMap: Record<string, any>): string {
  return `Here is the participant's work across five Module 3 exercises:

AUTOFLOW (ia-3-2):
${BLOCK_BUILDERS['ia-3-2'](stepDataMap['ia-3-2'])}

VISUALIZATION (ia-3-3):
${BLOCK_BUILDERS['ia-3-3'](stepDataMap['ia-3-3'])}

INTENTION (ia-3-4):
${BLOCK_BUILDERS['ia-3-4'](stepDataMap['ia-3-4'])}

INSPIRATION (ia-3-5):
${BLOCK_BUILDERS['ia-3-5'](stepDataMap['ia-3-5'])}

MYSTERY (ia-3-6):
${BLOCK_BUILDERS['ia-3-6'](stepDataMap['ia-3-6'])}

Summarize each exercise in one sentence using their words.`;
}

function buildTailorUserPrompt(selectedExercise: string, exerciseContent: any): string {
  const exerciseName = EXERCISE_NAMES[selectedExercise] || selectedExercise;
  const stepId = Object.entries(STEP_TO_EXERCISE).find(([, ex]) => ex === selectedExercise)?.[0];
  const builder = stepId ? BLOCK_BUILDERS[stepId] : null;
  const contentBlock = builder ? builder(exerciseContent) : JSON.stringify(exerciseContent);

  return `The participant selected their ${exerciseName} moment. Here is their content:

${contentBlock}

Generate 5 capability questions that reference their specific content.`;
}

// ─── Route ──────────────────────────────────────────────────────────────────

router.post('/module-reflection', requireAuth, express.json(), async (req, res) => {
  try {
    const userId = (req.session as any).userId as number;
    const { action } = req.body;

    if (action === 'summarize') {
      return await handleSummarize(userId, res);
    } else if (action === 'tailor') {
      const { selectedExercise, exerciseContent } = req.body;
      if (!selectedExercise || !exerciseContent) {
        return res.status(400).json({ success: false, error: 'selectedExercise and exerciseContent are required' });
      }
      return await handleTailor(selectedExercise, exerciseContent, res);
    } else {
      return res.status(400).json({ success: false, error: 'Invalid action. Use "summarize" or "tailor".' });
    }
  } catch (error: any) {
    console.error('[module-reflection] Unexpected error:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// ─── Summarize Handler ──────────────────────────────────────────────────────

async function handleSummarize(userId: number, res: express.Response) {
  // Fetch all 5 step data sets in one query
  const rows = await db
    .select()
    .from(workshopStepData)
    .where(and(
      eq(workshopStepData.userId, userId),
      eq(workshopStepData.workshopType, 'ia'),
      inArray(workshopStepData.stepId, [...STEP_IDS]),
      isNull(workshopStepData.deletedAt)
    ));

  // Build lookup map: stepId -> data
  const stepDataMap: Record<string, any> = {};
  for (const row of rows) {
    stepDataMap[row.stepId] = row.data;
  }

  // Check if there's any content at all
  if (rows.length === 0) {
    return res.json({
      success: true,
      summaries: { autoflow: null, visualization: null, intention: null, inspiration: null, mystery: null },
    });
  }

  // Load system prompt from training doc
  const systemPrompt = getTrainingDoc('ia-3-7-summarize');
  if (!systemPrompt) {
    console.error('[module-reflection] Missing training doc: ia-3-7-summarize');
    return res.status(500).json({ success: false, error: 'Training document not available' });
  }

  const userPrompt = assembleUserPrompt(stepDataMap);

  const provider = await getProvider('ia');
  const response = await provider.complete({
    systemPrompt: systemPrompt + '\n\nReturn valid JSON only, no markdown fences, no preamble.',
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 512,
    temperature: 0.6,
  });

  let summaries: Record<string, string | null>;
  try {
    summaries = JSON.parse(stripFences(response.content));
  } catch {
    console.error('[module-reflection] Failed to parse summarize response:', response.content);
    return res.status(500).json({ success: false, error: 'Failed to parse AI response' });
  }

  console.log(`[module-reflection] Summarize complete: ${response.usage.inputTokens} in / ${response.usage.outputTokens} out, ${response.latencyMs}ms`);
  return res.json({ success: true, summaries });
}

// ─── Tailor Handler ─────────────────────────────────────────────────────────

async function handleTailor(selectedExercise: string, exerciseContent: any, res: express.Response) {
  const validExercises = ['autoflow', 'visualization', 'intention', 'inspiration', 'mystery'];
  if (!validExercises.includes(selectedExercise)) {
    return res.status(400).json({ success: false, error: `Invalid exercise: ${selectedExercise}` });
  }

  const systemPrompt = getTrainingDoc('ia-3-7-tailor');
  if (!systemPrompt) {
    console.error('[module-reflection] Missing training doc: ia-3-7-tailor');
    return res.status(500).json({ success: false, error: 'Training document not available' });
  }

  const userPrompt = buildTailorUserPrompt(selectedExercise, exerciseContent);

  const provider = await getProvider('ia');
  const response = await provider.complete({
    systemPrompt: systemPrompt + '\n\nReturn valid JSON only, no markdown fences, no preamble.',
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 512,
    temperature: 0.7,
  });

  let questions: Record<string, string>;
  try {
    questions = JSON.parse(stripFences(response.content));
  } catch {
    console.error('[module-reflection] Failed to parse tailor response:', response.content);
    return res.status(500).json({ success: false, error: 'Failed to parse AI response' });
  }

  console.log(`[module-reflection] Tailor complete for ${selectedExercise}: ${response.usage.inputTokens} in / ${response.usage.outputTokens} out, ${response.latencyMs}ms`);
  return res.json({ success: true, questions });
}

export default router;
