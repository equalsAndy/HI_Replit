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

// Short exercise names for pill display in the matrix
const EXERCISE_NAMES: Record<string, string> = {
  'ia-3-3': 'Visualizing',   'ia-3-4': 'Insight',
  'ia-3-5': 'Inspiration',   'ia-3-6': 'Unimaginable',
  'ia-4-2': 'Reframe',       'ia-4-3': 'Stretch',
  'ia-4-4': 'Purpose',       'ia-4-5': 'Muse',
};

function zeroCounts(): Record<CapabilityKey, number> {
  return { imagination: 0, curiosity: 0, caring: 0, creativity: 0, courage: 0 };
}

function normalise(key: string | null | undefined): CapabilityKey | null {
  if (!key) return null;
  const k = key === 'empathy' ? 'caring' : key;
  return (k in zeroCounts()) ? (k as CapabilityKey) : null;
}

function addCount(counts: Record<CapabilityKey, number>, key: string | null | undefined, amount = 1) {
  const norm = normalise(key);
  if (norm) counts[norm] += amount;
}

interface ExerciseCapabilities {
  stepId: string;
  name: string;
  capabilities: CapabilityKey[];
}

router.get('/activation-snapshot', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId as number;

    // Fetch all relevant workshopStepData rows in one query
    const stepIds = [
      'ia-2-1-pulse',
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

    // ── Pulse ranking (ia-2-1-pulse) ────────────────────────────────────────
    const dPulse = byStep['ia-2-1-pulse'];
    let pulseRanking: CapabilityKey[] | null = null;
    if (Array.isArray(dPulse?.ranking) && dPulse.ranking.length === 5) {
      pulseRanking = dPulse.ranking
        .map((r: any) => normalise(r.key ?? r))
        .filter((k): k is CapabilityKey => k !== null);
    }

    // ── Solo activations (Module 3) ─────────────────────────────────────────
    const soloActivations = zeroCounts();
    let soloStepsCompleted = 0;
    const soloExercises: ExerciseCapabilities[] = [];

    // ia-3-3: single capability_activation
    const d33 = byStep['ia-3-3'];
    if (d33?.capability_activation) {
      addCount(soloActivations, d33.capability_activation);
      soloStepsCompleted++;
      const cap = normalise(d33.capability_activation);
      if (cap) soloExercises.push({ stepId: 'ia-3-3', name: EXERCISE_NAMES['ia-3-3'], capabilities: [cap] });
    }

    // ia-3-4: dual capability_activations array
    const d34 = byStep['ia-3-4'];
    if (Array.isArray(d34?.capability_activations) && d34.capability_activations.length > 0) {
      const caps: CapabilityKey[] = [];
      for (const cap of d34.capability_activations) {
        addCount(soloActivations, cap);
        const norm = normalise(cap);
        if (norm) caps.push(norm);
      }
      soloStepsCompleted++;
      if (caps.length > 0) soloExercises.push({ stepId: 'ia-3-4', name: EXERCISE_NAMES['ia-3-4'], capabilities: caps });
    }

    // ia-3-5: interlude selections at 0.5 weight each
    const d35 = byStep['ia-3-5'];
    if (Array.isArray(d35?.completed) && d35.completed.length > 0) {
      const capSet = new Set<CapabilityKey>();
      for (const interludeId of d35.completed) {
        const caps = INTERLUDE_CAPABILITY_MAP[interludeId];
        if (caps) {
          for (const cap of caps) {
            addCount(soloActivations, cap, 0.5);
            capSet.add(cap);
          }
        }
      }
      soloStepsCompleted++;
      if (capSet.size > 0) soloExercises.push({ stepId: 'ia-3-5', name: EXERCISE_NAMES['ia-3-5'], capabilities: [...capSet] });
    }

    // ia-3-6: single capability_activation
    const d36 = byStep['ia-3-6'];
    if (d36?.capability_activation) {
      addCount(soloActivations, d36.capability_activation);
      soloStepsCompleted++;
      const cap = normalise(d36.capability_activation);
      if (cap) soloExercises.push({ stepId: 'ia-3-6', name: EXERCISE_NAMES['ia-3-6'], capabilities: [cap] });
    }

    // ── AI-partnered activations (Module 4) ─────────────────────────────────
    const aiActivations = zeroCounts();
    let aiStepsCompleted = 0;
    const aiExercises: ExerciseCapabilities[] = [];

    // ia-4-2: capability_stretched (modal) + capabilities_applied (content area)
    const d42 = byStep['ia-4-2'];
    if (d42) {
      const capSet = new Set<CapabilityKey>();
      if (d42.capability_stretched) {
        const norm = normalise(d42.capability_stretched);
        if (norm) capSet.add(norm);
      }
      if (Array.isArray(d42.capabilities_applied)) {
        for (const c of d42.capabilities_applied) {
          const norm = normalise(c);
          if (norm) capSet.add(norm);
        }
      }
      if (capSet.size > 0) {
        aiStepsCompleted++;
        for (const c of capSet) addCount(aiActivations, c);
        aiExercises.push({ stepId: 'ia-4-2', name: EXERCISE_NAMES['ia-4-2'], capabilities: [...capSet] });
      }
    }

    // ia-4-3: capability_stretched (modal) + Object.keys(capability_stretches) (content area)
    const d43 = byStep['ia-4-3'];
    if (d43) {
      const capSet = new Set<CapabilityKey>();
      if (d43.capability_stretched) {
        const norm = normalise(d43.capability_stretched);
        if (norm) capSet.add(norm);
      }
      if (d43.capability_stretches && typeof d43.capability_stretches === 'object') {
        for (const key of Object.keys(d43.capability_stretches)) {
          const norm = normalise(key);
          if (norm) capSet.add(norm);
        }
      }
      if (capSet.size > 0) {
        aiStepsCompleted++;
        for (const c of capSet) addCount(aiActivations, c);
        aiExercises.push({ stepId: 'ia-4-3', name: EXERCISE_NAMES['ia-4-3'], capabilities: [...capSet] });
      }
    }

    // ia-4-4: capability_stretched only
    const d44 = byStep['ia-4-4'];
    if (d44?.capability_stretched) {
      const norm = normalise(d44.capability_stretched);
      if (norm) {
        aiStepsCompleted++;
        addCount(aiActivations, norm);
        aiExercises.push({ stepId: 'ia-4-4', name: EXERCISE_NAMES['ia-4-4'], capabilities: [norm] });
      }
    }

    // ia-4-5: capability_stretched + selectedCoachingLines (coaching line IDs are capability names)
    const d45 = byStep['ia-4-5'];
    if (d45) {
      const capSet = new Set<CapabilityKey>();
      if (d45.capability_stretched) {
        const norm = normalise(d45.capability_stretched);
        if (norm) capSet.add(norm);
      }
      if (Array.isArray(d45.selectedCoachingLines)) {
        for (const c of d45.selectedCoachingLines) {
          const norm = normalise(c);
          if (norm) capSet.add(norm);
        }
      }
      if (capSet.size > 0) {
        aiStepsCompleted++;
        for (const c of capSet) addCount(aiActivations, c);
        aiExercises.push({ stepId: 'ia-4-5', name: EXERCISE_NAMES['ia-4-5'], capabilities: [...capSet] });
      }
    }

    // ── Capstone (ia-4-6) ──────────────────────────────────────────────────
    const d46 = byStep['ia-4-6'];
    const capstoneVision      = d46?.vision      || null;
    const capstoneReflection  = d46?.capstone_reflection || null;

    // ── Completeness ────────────────────────────────────────────────────────
    const completeness = {
      hasPulse: pulseRanking !== null,
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
        pulseRanking,
        soloActivations,
        aiActivations,
        soloExercises,
        aiExercises,
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
