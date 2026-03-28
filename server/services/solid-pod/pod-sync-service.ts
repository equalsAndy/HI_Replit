/**
 * Pod Sync Service
 *
 * Orchestrates syncing AST assessment and reflection data to Solid Pods
 * via the SelfActual gateway API. The gateway handles Solid auth internally —
 * this service just sends Auth0 JWTs and JSON payloads.
 *
 * Non-blocking: all sync operations are fire-and-forget after the API response.
 * Safe by default: skips if feature flag off, gateway unreachable, or user has no vault account.
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
import { writeExternalAssessment, isGatewayConfigured } from './gateway-client.js';

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
  if (!isGatewayConfigured()) {
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

/** Write an assessment to the gateway and log the result */
async function writeToGateway(
  username: string,
  token: string,
  type: string,
  data: unknown,
  label: string
): Promise<boolean> {
  try {
    const result = await writeExternalAssessment(username, token, { type, data });
    if (result.ok) {
      log(`✓ ${label} → gateway`);
    } else {
      logError(`✗ ${label}: ${result.status} ${result.statusText}`);
    }
    return result.ok;
  } catch (err) {
    logError(`✗ ${label}:`, err);
    return false;
  }
}

/** Update lastSyncedAt timestamp */
async function touchSyncTimestamp(userId: number) {
  try {
    await db
      .update(vaultAccounts)
      .set({ lastSyncedAt: new Date() })
      .where(eq(vaultAccounts.userId, userId));
  } catch {
    // Non-critical — don't propagate
  }
}

// ── Reflection ID Mapping ──────────────────────────────────────────────────
const REFLECTION_ID_TO_DIMENSION: Record<string, string> = {
  'strength-1': 'thinking',
  'strength-2': 'acting',
  'strength-3': 'feeling',
  'strength-4': 'planning',
};

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Full sync of all user data to pods via the gateway.
 * Queries the DB for all relevant data and POSTs each as an external assessment.
 *
 * @param userId - DB user ID
 * @param auth0Token - Auth0 JWT for gateway authentication
 * @returns Summary of what was written
 */
export async function syncAll(
  userId: number,
  auth0Token: string
): Promise<{ written: string[]; errors: string[] }> {
  const written: string[] = [];
  const errors: string[] = [];
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
      const ok = await writeToGateway(username, auth0Token, 'profile', {
        name: user.name,
        email: user.email,
        jobTitle: user.jobTitle ?? null,
        organization: user.organization ?? null,
      }, 'profile');
      if (ok) written.push('profile');
      else errors.push('profile');
    }

    // ── 2. Star Card ────────────────────────────────────────────────────
    if (starCard) {
      const ok = await writeToGateway(username, auth0Token, 'starCard', {
        thinking: starCard.thinking,
        acting: starCard.acting,
        feeling: starCard.feeling,
        planning: starCard.planning,
        createdAt: starCard.createdAt?.toISOString() || now,
      }, 'starCard');
      if (ok) written.push('starCard');
      else errors.push('starCard');
    }

    // ── 3. Flow Attributes ──────────────────────────────────────────────
    if (flowAttr) {
      const attrs = flowAttr.attributes as Array<{ name: string; score: number }>;
      const ok = await writeToGateway(username, auth0Token, 'flowAttributes', {
        attributes: Array.isArray(attrs) ? attrs : [],
        createdAt: flowAttr.createdAt?.toISOString() || now,
      }, 'flowAttributes');
      if (ok) written.push('flowAttributes');
      else errors.push('flowAttributes');
    }

    // ── 4. Strength Reflections ─────────────────────────────────────────
    if (reflectionRows.length > 0) {
      const reflections: Record<string, string> = {};
      for (const row of reflectionRows) {
        const dimension = REFLECTION_ID_TO_DIMENSION[row.reflectionId];
        if (dimension && row.response) {
          reflections[dimension] = row.response;
        }
      }

      const ok = await writeToGateway(username, auth0Token, 'strengthReflections', {
        reflections,
        starCard: starCard ? {
          thinking: starCard.thinking,
          acting: starCard.acting,
          feeling: starCard.feeling,
          planning: starCard.planning,
        } : null,
        createdAt: reflectionRows[0]?.createdAt?.toISOString() || now,
      }, 'strengthReflections');
      if (ok) written.push('strengthReflections');
      else errors.push('strengthReflections');
    }

    // ── 5. Final Insight ────────────────────────────────────────────────
    if (finalRefl) {
      const ok = await writeToGateway(username, auth0Token, 'finalInsight', {
        insight: finalRefl.insight,
        createdAt: finalRefl.createdAt?.toISOString() || now,
      }, 'finalInsight');
      if (ok) written.push('finalInsight');
      else errors.push('finalInsight');
    }

    // ── 6. Future Self Reflection (from user_assessments) ───────────────
    const futureSelfRow = assessmentByType.get('futureSelfReflection');
    if (futureSelfRow) {
      try {
        const data = JSON.parse(futureSelfRow.results);
        const ok = await writeToGateway(username, auth0Token, 'futureSelfReflection', {
          ...data,
          createdAt: futureSelfRow.createdAt?.toISOString() || now,
        }, 'futureSelf');
        if (ok) written.push('futureSelf');
        else errors.push('futureSelf');
      } catch (err) {
        logError('syncAll futureSelf parse failed:', err);
        errors.push('futureSelf');
      }
    }

    // ── 7. Cantril Ladder (from user_assessments) ───────────────────────
    const cantrilRow = assessmentByType.get('cantrilLadder');
    if (cantrilRow) {
      try {
        const data = JSON.parse(cantrilRow.results);
        const ok = await writeToGateway(username, auth0Token, 'cantrilLadder', {
          ...data,
          createdAt: cantrilRow.createdAt?.toISOString() || now,
        }, 'cantrilLadder');
        if (ok) written.push('cantrilLadder');
        else errors.push('cantrilLadder');
      } catch (err) {
        logError('syncAll cantrilLadder parse failed:', err);
        errors.push('cantrilLadder');
      }
    }

    // ── 8. Cantril Ladder Reflection (from user_assessments) ────────────
    const cantrilReflRow = assessmentByType.get('cantrilLadderReflection');
    if (cantrilReflRow) {
      try {
        const data = JSON.parse(cantrilReflRow.results);
        const ok = await writeToGateway(username, auth0Token, 'cantrilLadderReflection', {
          ...data,
          createdAt: cantrilReflRow.createdAt?.toISOString() || now,
        }, 'cantrilLadderReflection');
        if (ok) written.push('cantrilLadderReflection');
        else errors.push('cantrilLadderReflection');
      } catch (err) {
        logError('syncAll cantrilLadderReflection parse failed:', err);
        errors.push('cantrilLadderReflection');
      }
    }

    // ── 9. Rounding Out Reflection (from user_assessments) ──────────────
    const roundingOutRow = assessmentByType.get('roundingOutReflection');
    if (roundingOutRow) {
      try {
        const data = JSON.parse(roundingOutRow.results);
        const ok = await writeToGateway(username, auth0Token, 'roundingOutReflection', {
          ...data,
          createdAt: roundingOutRow.createdAt?.toISOString() || now,
        }, 'roundingOut');
        if (ok) written.push('roundingOut');
        else errors.push('roundingOut');
      } catch (err) {
        logError('syncAll roundingOut parse failed:', err);
        errors.push('roundingOut');
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
