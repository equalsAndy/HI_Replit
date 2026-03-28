/**
 * Pod Sync Service
 *
 * Orchestrates syncing AST assessment and reflection data to Solid Pods.
 * Non-blocking: all sync operations are fire-and-forget after the API response.
 * Safe by default: skips if feature flag off, env vars missing, or user has no vault account.
 */

import { db } from '../../db.js';
import { eq, and } from 'drizzle-orm';
import {
  vaultAccounts,
  users,
  starCards,
  flowAttributes,
  reflectionResponses,
  finalReflections,
  userAssessments,
} from '../../../shared/schema.js';
import { isFeatureEnabled } from '../../utils/feature-flags.js';
import { putResource, isPodWriteConfigured } from './pod-write-client.js';
import {
  serializeStarCard,
  serializeStarCardSub,
  serializeFlowAttributes,
  serializeFlowAttributesSub,
  serializeAllReflections,
  serializeFutureSelf,
  serializeCantrilLadder,
  serializeCantrilLadderReflection,
  serializeRoundingOut,
  serializeFinalInsight,
  serializeProfile,
  serializeProfileSummary,
  serializeProvenanceEntry,
  type StarCardData,
  type FlowAttributesData,
  type StepByStepReflectionData,
  type FutureSelfReflectionData,
  type CantrilLadderData,
  type CantrilLadderReflectionData,
  type RoundingOutReflectionData,
  type FinalInsightData,
} from './turtle-serializer.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string, ...args: any[]) {
  console.log(`[solid-pod-sync] ${msg}`, ...args);
}

function logError(msg: string, ...args: any[]) {
  console.error(`[solid-pod-sync] ERROR: ${msg}`, ...args);
}

/** Check if pod sync is available and the user has a vault account */
async function getVaultAccount(userId: number) {
  if (!isFeatureEnabled('solidPodSync')) {
    return null;
  }
  if (!isPodWriteConfigured()) {
    return null;
  }

  const rows = await db
    .select()
    .from(vaultAccounts)
    .where(eq(vaultAccounts.userId, userId))
    .limit(1);

  return rows[0] || null;
}

/** Extract username from pod URL path */
function extractUsername(masterPodUrl: string): string {
  // e.g. "https://vaults.selfactual.ai/johndoe/master/" → "johndoe"
  const match = masterPodUrl.match(/\/([^/]+)\/master\/?$/);
  return match?.[1] || '';
}

/** Write a Turtle resource and log the result */
async function writeToPod(path: string, turtle: string, label: string): Promise<boolean> {
  try {
    const result = await putResource(path, turtle);
    if (result.ok) {
      log(`✓ ${label} → ${path}`);
    } else {
      logError(`✗ ${label} → ${path}: ${result.status} ${result.statusText}`);
    }
    return result.ok;
  } catch (err) {
    logError(`✗ ${label} → ${path}:`, err);
    return false;
  }
}

/** Update lastSyncedAt timestamp */
async function touchSyncTimestamp(userId: number) {
  try {
    await db
      .update(vaultAccounts)
      .set({ updatedAt: new Date(), lastSyncedAt: new Date() })
      .where(eq(vaultAccounts.userId, userId));
  } catch {
    // Non-critical — don't propagate
  }
}

// ── Sync Functions ───────────────────────────────────────────────────────────

/**
 * Sync Star Card to both master and sub pods.
 * Fire-and-forget — errors are logged, never thrown.
 */
export async function syncStarCard(userId: number, data: StarCardData, createdAt: string): Promise<void> {
  try {
    const account = await getVaultAccount(userId);
    if (!account) return;

    const username = extractUsername(account.masterPodUrl);
    if (!username) {
      logError('Could not extract username from masterPodUrl:', account.masterPodUrl);
      return;
    }

    const masterTurtle = serializeStarCard(data, username, createdAt);
    const subTurtle = serializeStarCardSub(data, createdAt);

    const masterPath = `/${username}/master/assessments/starcard`;
    const subPath = `/${username}/sub/assessments/starcard`;

    await Promise.all([
      writeToPod(masterPath, masterTurtle, 'starCard (master)'),
      writeToPod(subPath, subTurtle, 'starCard (sub)'),
    ]);

    await touchSyncTimestamp(userId);
  } catch (err) {
    logError('syncStarCard failed:', err);
  }
}

/**
 * Sync Flow Attributes to both master and sub pods.
 */
export async function syncFlowAttributes(userId: number, data: FlowAttributesData, createdAt: string): Promise<void> {
  try {
    const account = await getVaultAccount(userId);
    if (!account) return;

    const username = extractUsername(account.masterPodUrl);
    if (!username) return;

    const masterTurtle = serializeFlowAttributes(data, createdAt);
    const subTurtle = serializeFlowAttributesSub(data, createdAt);

    await Promise.all([
      writeToPod(`/${username}/master/assessments/flow-attributes`, masterTurtle, 'flowAttributes (master)'),
      writeToPod(`/${username}/sub/assessments/flow-attributes`, subTurtle, 'flowAttributes (sub)'),
    ]);

    await touchSyncTimestamp(userId);
  } catch (err) {
    logError('syncFlowAttributes failed:', err);
  }
}

/**
 * Sync Strength Reflections to master pod (4 individual dimension files).
 */
export async function syncReflections(
  userId: number,
  data: StepByStepReflectionData,
  createdAt: string
): Promise<void> {
  try {
    const account = await getVaultAccount(userId);
    if (!account) return;

    const username = extractUsername(account.masterPodUrl);
    if (!username) return;

    const turtleMap = serializeAllReflections(data, username, createdAt);

    const writes = Array.from(turtleMap.entries()).map(([dimensionId, turtle]) =>
      writeToPod(
        `/${username}/master/reflections/strength-reflections/${dimensionId}`,
        turtle,
        `reflection/${dimensionId}`
      )
    );

    await Promise.all(writes);
    await touchSyncTimestamp(userId);
  } catch (err) {
    logError('syncReflections failed:', err);
  }
}

/**
 * Sync Future Self Reflection to master pod.
 */
export async function syncFutureSelf(
  userId: number,
  data: FutureSelfReflectionData,
  createdAt: string
): Promise<void> {
  try {
    const account = await getVaultAccount(userId);
    if (!account) return;

    const username = extractUsername(account.masterPodUrl);
    if (!username) return;

    const turtle = serializeFutureSelf(data, createdAt);
    await writeToPod(`/${username}/master/reflections/future-self`, turtle, 'futureSelf');
    await touchSyncTimestamp(userId);
  } catch (err) {
    logError('syncFutureSelf failed:', err);
  }
}

/**
 * Sync Cantril Ladder to master pod.
 */
export async function syncCantrilLadder(
  userId: number,
  data: CantrilLadderData,
  createdAt: string
): Promise<void> {
  try {
    const account = await getVaultAccount(userId);
    if (!account) return;

    const username = extractUsername(account.masterPodUrl);
    if (!username) return;

    const turtle = serializeCantrilLadder(data, username, createdAt);
    await writeToPod(`/${username}/master/wellbeing/cantril-ladder`, turtle, 'cantrilLadder');
    await touchSyncTimestamp(userId);
  } catch (err) {
    logError('syncCantrilLadder failed:', err);
  }
}

/**
 * Sync Cantril Ladder Reflection to master pod.
 */
export async function syncCantrilLadderReflection(
  userId: number,
  data: CantrilLadderReflectionData,
  createdAt: string
): Promise<void> {
  try {
    const account = await getVaultAccount(userId);
    if (!account) return;

    const username = extractUsername(account.masterPodUrl);
    if (!username) return;

    const turtle = serializeCantrilLadderReflection(data, username, createdAt);
    await writeToPod(`/${username}/master/wellbeing/cantril-ladder-reflection`, turtle, 'cantrilLadderReflection');
    await touchSyncTimestamp(userId);
  } catch (err) {
    logError('syncCantrilLadderReflection failed:', err);
  }
}

/**
 * Sync Rounding Out Reflection to master pod.
 */
export async function syncRoundingOut(
  userId: number,
  data: RoundingOutReflectionData,
  createdAt: string
): Promise<void> {
  try {
    const account = await getVaultAccount(userId);
    if (!account) return;

    const username = extractUsername(account.masterPodUrl);
    if (!username) return;

    const turtle = serializeRoundingOut(data, createdAt);
    await writeToPod(`/${username}/master/reflections/rounding-out`, turtle, 'roundingOut');
    await touchSyncTimestamp(userId);
  } catch (err) {
    logError('syncRoundingOut failed:', err);
  }
}

/**
 * Sync Final Insight to master pod.
 */
export async function syncFinalInsight(
  userId: number,
  data: FinalInsightData,
  createdAt: string
): Promise<void> {
  try {
    const account = await getVaultAccount(userId);
    if (!account) return;

    const username = extractUsername(account.masterPodUrl);
    if (!username) return;

    const turtle = serializeFinalInsight(data, username, createdAt);
    await writeToPod(`/${username}/master/reflections/final-insight`, turtle, 'finalInsight');
    await touchSyncTimestamp(userId);
  } catch (err) {
    logError('syncFinalInsight failed:', err);
  }
}

/**
 * Sync Profile to master pod and profile summary to sub pod.
 */
export async function syncProfile(userId: number): Promise<void> {
  try {
    const account = await getVaultAccount(userId);
    if (!account) return;

    const username = extractUsername(account.masterPodUrl);
    if (!username) return;

    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const user = userRows[0];
    if (!user) {
      logError(`syncProfile: user ${userId} not found`);
      return;
    }

    const profileData = {
      name: user.name,
      email: user.email,
      jobTitle: user.jobTitle ?? null,
      organization: user.organization ?? null,
    };

    const masterTurtle = serializeProfile(profileData, {
      masterPodUrl: account.masterPodUrl,
      subPodUrl: account.subPodUrl,
      createdAt: account.createdAt,
    }, username);

    const subTurtle = serializeProfileSummary(profileData, username);

    await Promise.all([
      writeToPod(`/${username}/master/profile`, masterTurtle, 'profile (master)'),
      writeToPod(`/${username}/sub/profile-summary`, subTurtle, 'profileSummary (sub)'),
    ]);

    await touchSyncTimestamp(userId);
  } catch (err) {
    logError('syncProfile failed:', err);
  }
}

// ── Reflection ID Mapping ──────────────────────────────────────────────────
// DB reflectionId values → serializer field keys (matches DIMENSION_MAP in turtle-serializer.ts)
const REFLECTION_ID_TO_FIELD: Record<string, string> = {
  'strength-1': 'strength1',
  'strength-2': 'strength2',
  'strength-3': 'strength3',
  'strength-4': 'strength4',
};

/**
 * Full sync of all user data to pods.
 * Queries the DB for all relevant data and writes everything.
 * Returns a summary of what was written.
 */
export async function syncAll(userId: number): Promise<{ written: string[]; errors: string[] }> {
  const written: string[] = [];
  const errors: string[] = [];
  const provenanceEntries: string[] = [];
  const now = new Date().toISOString();

  try {
    const account = await getVaultAccount(userId);
    if (!account) {
      return { written: [], errors: ['No vault account or pod sync not enabled'] };
    }

    const username = extractUsername(account.masterPodUrl);
    if (!username) {
      return { written: [], errors: ['Could not extract username from masterPodUrl'] };
    }

    // ── Query all user data ─────────────────────────────────────────────
    const [userRows, starCardRows, flowAttrRows, reflectionRows, finalReflRows, assessmentRows] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(starCards).where(eq(starCards.userId, userId)).limit(1),
      db.select().from(flowAttributes).where(eq(flowAttributes.userId, userId)).limit(1),
      db.select().from(reflectionResponses).where(
        and(
          eq(reflectionResponses.userId, userId),
          eq(reflectionResponses.reflectionSetId, 'strength-reflections')
        )
      ),
      db.select().from(finalReflections).where(eq(finalReflections.userId, userId)).limit(1),
      db.select().from(userAssessments).where(eq(userAssessments.userId, userId)),
    ]);

    const user = userRows[0];
    const starCard = starCardRows[0];
    const flowAttr = flowAttrRows[0];
    const finalRefl = finalReflRows[0];

    // Build a lookup for user_assessments by assessmentType
    const assessmentByType = new Map<string, { results: string; createdAt: Date }>();
    for (const row of assessmentRows) {
      assessmentByType.set(row.assessmentType, { results: row.results, createdAt: row.createdAt });
    }

    // ── 1. Profile ──────────────────────────────────────────────────────
    if (user) {
      try {
        const profileData = {
          name: user.name,
          email: user.email,
          jobTitle: user.jobTitle ?? null,
          organization: user.organization ?? null,
        };

        const masterTurtle = serializeProfile(profileData, {
          masterPodUrl: account.masterPodUrl,
          subPodUrl: account.subPodUrl,
          createdAt: account.createdAt,
        }, username);
        const subTurtle = serializeProfileSummary(profileData, username);

        const [m, s] = await Promise.all([
          writeToPod(`/${username}/master/profile`, masterTurtle, 'profile (master)'),
          writeToPod(`/${username}/sub/profile-summary`, subTurtle, 'profileSummary (sub)'),
        ]);
        if (m) { written.push('profile (master)'); provenanceEntries.push(`/${username}/master/profile`); }
        else errors.push('profile (master)');
        if (s) { written.push('profileSummary (sub)'); provenanceEntries.push(`/${username}/sub/profile-summary`); }
        else errors.push('profileSummary (sub)');
      } catch (err) {
        logError('syncAll profile failed:', err);
        errors.push('profile');
      }
    }

    // ── 2. Star Card ────────────────────────────────────────────────────
    if (starCard) {
      try {
        const data: StarCardData = {
          thinking: starCard.thinking,
          acting: starCard.acting,
          feeling: starCard.feeling,
          planning: starCard.planning,
        };
        const createdAt = starCard.createdAt?.toISOString() || now;

        const masterTurtle = serializeStarCard(data, username, createdAt);
        const subTurtle = serializeStarCardSub(data, createdAt);

        const [m, s] = await Promise.all([
          writeToPod(`/${username}/master/assessments/starcard`, masterTurtle, 'starCard (master)'),
          writeToPod(`/${username}/sub/assessments/starcard`, subTurtle, 'starCard (sub)'),
        ]);
        if (m) { written.push('starCard (master)'); provenanceEntries.push(`/${username}/master/assessments/starcard`); }
        else errors.push('starCard (master)');
        if (s) { written.push('starCard (sub)'); provenanceEntries.push(`/${username}/sub/assessments/starcard`); }
        else errors.push('starCard (sub)');
      } catch (err) {
        logError('syncAll starCard failed:', err);
        errors.push('starCard');
      }
    }

    // ── 3. Flow Attributes ──────────────────────────────────────────────
    if (flowAttr) {
      try {
        const attrs = flowAttr.attributes as Array<{ name: string; score: number }>;
        const data: FlowAttributesData = { attributes: Array.isArray(attrs) ? attrs : [] };
        const createdAt = flowAttr.createdAt?.toISOString() || now;

        const masterTurtle = serializeFlowAttributes(data, createdAt);
        const subTurtle = serializeFlowAttributesSub(data, createdAt);

        const [m, s] = await Promise.all([
          writeToPod(`/${username}/master/assessments/flow-attributes`, masterTurtle, 'flowAttributes (master)'),
          writeToPod(`/${username}/sub/assessments/flow-attributes`, subTurtle, 'flowAttributes (sub)'),
        ]);
        if (m) { written.push('flowAttributes (master)'); provenanceEntries.push(`/${username}/master/assessments/flow-attributes`); }
        else errors.push('flowAttributes (master)');
        if (s) { written.push('flowAttributes (sub)'); provenanceEntries.push(`/${username}/sub/assessments/flow-attributes`); }
        else errors.push('flowAttributes (sub)');
      } catch (err) {
        logError('syncAll flowAttributes failed:', err);
        errors.push('flowAttributes');
      }
    }

    // ── 4. Strength Reflections (master only) ───────────────────────────
    if (reflectionRows.length > 0 && starCard) {
      try {
        // Map DB reflectionId values to serializer field keys
        const reflections: Record<string, string> = {};
        for (const row of reflectionRows) {
          const fieldKey = REFLECTION_ID_TO_FIELD[row.reflectionId];
          if (fieldKey && row.response) {
            reflections[fieldKey] = row.response;
          }
        }

        const starCardData: StarCardData = {
          thinking: starCard.thinking,
          acting: starCard.acting,
          feeling: starCard.feeling,
          planning: starCard.planning,
        };

        const data: StepByStepReflectionData = {
          reflections,
          starCardData,
          completedAt: now,
        };

        const createdAt = reflectionRows[0]?.createdAt?.toISOString() || now;
        const turtleMap = serializeAllReflections(data, username, createdAt);

        const writes = Array.from(turtleMap.entries()).map(async ([dimensionId, turtle]) => {
          const path = `/${username}/master/reflections/strength-reflections/${dimensionId}`;
          const ok = await writeToPod(path, turtle, `reflection/${dimensionId}`);
          if (ok) { written.push(`reflection/${dimensionId}`); provenanceEntries.push(path); }
          else errors.push(`reflection/${dimensionId}`);
        });

        await Promise.all(writes);
      } catch (err) {
        logError('syncAll reflections failed:', err);
        errors.push('reflections');
      }
    }

    // ── 5. Final Insight (master only) ──────────────────────────────────
    if (finalRefl) {
      try {
        const data: FinalInsightData = { insight: finalRefl.insight };
        const createdAt = finalRefl.createdAt?.toISOString() || now;

        const turtle = serializeFinalInsight(data, username, createdAt);
        const ok = await writeToPod(`/${username}/master/reflections/final-insight`, turtle, 'finalInsight');
        if (ok) { written.push('finalInsight'); provenanceEntries.push(`/${username}/master/reflections/final-insight`); }
        else errors.push('finalInsight');
      } catch (err) {
        logError('syncAll finalInsight failed:', err);
        errors.push('finalInsight');
      }
    }

    // ── 6. Future Self Reflection (master only, from user_assessments) ─
    const futureSelfRow = assessmentByType.get('futureSelfReflection');
    if (futureSelfRow) {
      try {
        const data = JSON.parse(futureSelfRow.results) as FutureSelfReflectionData;
        const createdAt = futureSelfRow.createdAt?.toISOString() || now;

        const turtle = serializeFutureSelf(data, createdAt);
        const ok = await writeToPod(`/${username}/master/reflections/future-self`, turtle, 'futureSelf');
        if (ok) { written.push('futureSelf'); provenanceEntries.push(`/${username}/master/reflections/future-self`); }
        else errors.push('futureSelf');
      } catch (err) {
        logError('syncAll futureSelf failed:', err);
        errors.push('futureSelf');
      }
    }

    // ── 7. Cantril Ladder (master only, from user_assessments) ──────────
    const cantrilRow = assessmentByType.get('cantrilLadder');
    if (cantrilRow) {
      try {
        const data = JSON.parse(cantrilRow.results) as CantrilLadderData;
        const createdAt = cantrilRow.createdAt?.toISOString() || now;

        const turtle = serializeCantrilLadder(data, username, createdAt);
        const ok = await writeToPod(`/${username}/master/wellbeing/cantril-ladder`, turtle, 'cantrilLadder');
        if (ok) { written.push('cantrilLadder'); provenanceEntries.push(`/${username}/master/wellbeing/cantril-ladder`); }
        else errors.push('cantrilLadder');
      } catch (err) {
        logError('syncAll cantrilLadder failed:', err);
        errors.push('cantrilLadder');
      }
    }

    // ── 8. Cantril Ladder Reflection (master only, from user_assessments)
    const cantrilReflRow = assessmentByType.get('cantrilLadderReflection');
    if (cantrilReflRow) {
      try {
        const data = JSON.parse(cantrilReflRow.results) as CantrilLadderReflectionData;
        const createdAt = cantrilReflRow.createdAt?.toISOString() || now;

        const turtle = serializeCantrilLadderReflection(data, username, createdAt);
        const ok = await writeToPod(`/${username}/master/wellbeing/cantril-ladder-reflection`, turtle, 'cantrilLadderReflection');
        if (ok) { written.push('cantrilLadderReflection'); provenanceEntries.push(`/${username}/master/wellbeing/cantril-ladder-reflection`); }
        else errors.push('cantrilLadderReflection');
      } catch (err) {
        logError('syncAll cantrilLadderReflection failed:', err);
        errors.push('cantrilLadderReflection');
      }
    }

    // ── 9. Rounding Out Reflection (master only, from user_assessments) ─
    const roundingOutRow = assessmentByType.get('roundingOutReflection');
    if (roundingOutRow) {
      try {
        const data = JSON.parse(roundingOutRow.results) as RoundingOutReflectionData;
        const createdAt = roundingOutRow.createdAt?.toISOString() || now;

        const turtle = serializeRoundingOut(data, createdAt);
        const ok = await writeToPod(`/${username}/master/reflections/rounding-out`, turtle, 'roundingOut');
        if (ok) { written.push('roundingOut'); provenanceEntries.push(`/${username}/master/reflections/rounding-out`); }
        else errors.push('roundingOut');
      } catch (err) {
        logError('syncAll roundingOut failed:', err);
        errors.push('roundingOut');
      }
    }

    // ── 10. Provenance Log (master only) ─────────────────────────────────
    if (provenanceEntries.length > 0) {
      try {
        const entries = provenanceEntries.map(resourcePath =>
          serializeProvenanceEntry(resourcePath, 'updated', now)
        );
        // Combine all entries into one document (replace, not append — POC simplification)
        const provenanceTurtle = entries.join('\n');
        await writeToPod(
          `/${username}/master/provenance/ast-write-log`,
          provenanceTurtle,
          'provenance log'
        );
        written.push('provenance log');
      } catch (err) {
        logError('syncAll provenance failed:', err);
        errors.push('provenance');
      }
    }

    await touchSyncTimestamp(userId);
    log(`syncAll complete for user ${userId}: ${written.length} written, ${errors.length} errors`);
  } catch (err) {
    logError('syncAll failed:', err);
    errors.push('syncAll top-level error');
  }

  return { written, errors };
}
