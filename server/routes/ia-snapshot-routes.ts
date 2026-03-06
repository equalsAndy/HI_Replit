import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db.js';
import { workshopStepData, userAssessments } from '../../shared/schema.js';
import { and, eq, inArray } from 'drizzle-orm';

const router = express.Router();

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';

// Maps interlude IDs to the two capabilities they activate (at 0.5 weight each)
const INTERLUDE_CAPABILITY_MAP: Record<string, CapabilityKey[]> = {
  nature:  ['curiosity', 'caring'],
  beauty:  ['curiosity', 'creativity'],
  journal: ['imagination', 'creativity'],
  create:  ['creativity', 'imagination'],
  vision:  ['imagination', 'courage'],
  play:    ['curiosity', 'creativity'],
  learn:   ['curiosity', 'imagination'],
  heroes:  ['courage', 'caring'],
  art:     ['creativity', 'caring'],
};

function zeroCounts(): Record<CapabilityKey, number> {
  return { imagination: 0, curiosity: 0, caring: 0, creativity: 0, courage: 0 };
}

function addCount(counts: Record<CapabilityKey, number>, key: string | null | undefined, amount = 1) {
  if (!key) return;
  // Map empathy → caring for backward compat
  const normalised = key === 'empathy' ? 'caring' : key as CapabilityKey;
  if (normalised in counts) counts[normalised] += amount;
}

router.get('/activation-snapshot', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId as number;

    // Fetch all relevant workshopStepData rows in one query
    const stepIds = [
      'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6',
      'ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5',
      'ia-4-6',
    ];

    const [rows, assessmentRows] = await Promise.all([
      db
        .select()
        .from(workshopStepData)
        .where(
          and(
            eq(workshopStepData.userId, userId),
            eq(workshopStepData.workshopType, 'ia'),
            inArray(workshopStepData.stepId, stepIds)
          )
        ),
      // The I4C assessment is stored in userAssessments table, not workshopStepData
      db
        .select()
        .from(userAssessments)
        .where(
          and(
            eq(userAssessments.userId, userId),
            eq(userAssessments.assessmentType, 'iaCoreCapabilities')
          )
        )
        .limit(1),
    ]);

    // Index rows by stepId for easy access
    const byStep: Record<string, any> = {};
    for (const row of rows) {
      const d = row.data;
      byStep[row.stepId] = typeof d === 'string' ? JSON.parse(d) : (d ?? {});
    }

    // ── Prism (from userAssessments table) ──────────────────────────────────
    let prism: Record<CapabilityKey, number> | null = null;
    const assessmentRow = assessmentRows[0];
    if (assessmentRow?.results) {
      try {
        const parsed = typeof assessmentRow.results === 'string'
          ? JSON.parse(assessmentRow.results)
          : assessmentRow.results;
        if (parsed && typeof parsed === 'object') {
          prism = {
            imagination: parseFloat(parsed.imagination) || 0,
            curiosity:   parseFloat(parsed.curiosity)   || 0,
            caring:      parseFloat(parsed.empathy ?? parsed.caring) || 0,
            creativity:  parseFloat(parsed.creativity)  || 0,
            courage:     parseFloat(parsed.courage)     || 0,
          };
        }
      } catch { /* malformed results — leave prism as null */ }
    }

    // ── Solo activations (Module 3) ─────────────────────────────────────────
    const soloActivations = zeroCounts();
    let soloStepsCompleted = 0;

    // ia-3-3: single capability_activation
    const d33 = byStep['ia-3-3'];
    if (d33?.capability_activation) {
      addCount(soloActivations, d33.capability_activation);
      soloStepsCompleted++;
    }

    // ia-3-4: dual capability_activations array
    const d34 = byStep['ia-3-4'];
    if (Array.isArray(d34?.capability_activations) && d34.capability_activations.length > 0) {
      for (const cap of d34.capability_activations) addCount(soloActivations, cap);
      soloStepsCompleted++;
    }

    // ia-3-5: interlude selections at 0.5 weight each
    const d35 = byStep['ia-3-5'];
    if (Array.isArray(d35?.completed) && d35.completed.length > 0) {
      for (const interludeId of d35.completed) {
        const caps = INTERLUDE_CAPABILITY_MAP[interludeId];
        if (caps) {
          for (const cap of caps) addCount(soloActivations, cap, 0.5);
        }
      }
      soloStepsCompleted++;
    }

    // ia-3-6: single capability_activation
    const d36 = byStep['ia-3-6'];
    if (d36?.capability_activation) {
      addCount(soloActivations, d36.capability_activation);
      soloStepsCompleted++;
    }

    // ── AI-partnered activations (Module 4, from database) ─────────────────
    const aiActivations = zeroCounts();
    let aiStepsCompleted = 0;

    const aiStepKeys = ['ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5'] as const;
    for (const stepId of aiStepKeys) {
      const stepData = byStep[stepId];
      if (stepData?.capability_stretched) {
        addCount(aiActivations, stepData.capability_stretched);
        aiStepsCompleted++;
      }
    }

    // ── Capstone (ia-4-6) ──────────────────────────────────────────────────
    const d46 = byStep['ia-4-6'];
    const capstoneVision      = d46?.vision      || null;
    const capstoneReflection  = d46?.capstone_reflection || null;

    // ── Completeness ────────────────────────────────────────────────────────
    const completeness = {
      hasPrism: prism !== null,
      soloStepsCompleted,
      soloStepsTotal: 4,
      aiStepsCompleted,
      aiStepsTotal: 4,
      hasCapstone: !!capstoneVision,
    };

    return res.json({
      success: true,
      snapshot: {
        prism,
        soloActivations,
        aiActivations,
        capstoneVision,
        capstoneReflection,
        completeness,
      },
    });
  } catch (e: any) {
    console.error('activation-snapshot error:', e);
    return res.status(500).json({ success: false, error: e?.message || 'Failed to build activation snapshot' });
  }
});

export default router;
