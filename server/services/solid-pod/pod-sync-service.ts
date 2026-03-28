/**
 * Pod Sync Service
 *
 * Orchestrates syncing AST assessment and reflection data to Solid Pods
 * via the SelfActual gateway API. Authenticates with a service token —
 * no per-user Auth0 JWTs needed.
 *
 * Non-blocking: all sync operations are fire-and-forget after the API response.
 * Safe by default: skips if feature flag off, gateway unreachable, or user has no vault account.
 */

import { db } from '../../db.js';
import { eq, and, sql } from 'drizzle-orm';
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

  const account = rows[0] || null;
  if (account && account.provisioningStatus !== 'active') {
    return null;
  }
  return account;
}

/** Extract username from pod URL path */
function extractUsername(masterPodUrl: string): string {
  const match = masterPodUrl.match(/\/([^/]+)\/master\/?$/);
  return match?.[1] || '';
}

/** Write an assessment to the gateway and log the result */
async function writeToGateway(
  username: string,
  type: string,
  data: unknown,
  label: string,
  userIdentifier?: string
): Promise<boolean> {
  try {
    const result = await writeExternalAssessment(username, { type, data }, userIdentifier);
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

/** Sync a user_assessments row by type — parses JSON and writes to gateway */
async function syncAssessment(
  username: string,
  assessmentByType: Map<string, { results: string; createdAt: Date }>,
  assessmentType: string,
  gatewayType: string,
  label: string,
  userIdentifier: string,
  written: string[],
  errors: string[],
  now: string
) {
  const row = assessmentByType.get(assessmentType);
  if (!row) return;
  try {
    const data = JSON.parse(row.results);
    const ok = await writeToGateway(username, gatewayType, {
      ...data,
      createdAt: row.createdAt?.toISOString() || now,
    }, label, userIdentifier);
    if (ok) written.push(label);
    else errors.push(label);
  } catch (err) {
    logError(`syncAll ${label} parse failed:`, err);
    errors.push(label);
  }
}

/** Sync a reflection set — groups all reflection IDs into a single object */
async function syncReflectionSet(
  username: string,
  userId: number,
  setId: string,
  gatewayType: string,
  label: string,
  userIdentifier: string,
  written: string[],
  errors: string[],
  now: string
) {
  const rows = await db.select().from(reflectionResponses).where(
    and(
      eq(reflectionResponses.userId, userId),
      eq(reflectionResponses.reflectionSetId, setId)
    )
  );
  if (rows.length === 0) return;

  const reflections: Record<string, string> = {};
  for (const row of rows) {
    if (row.response) {
      reflections[row.reflectionId] = row.response;
    }
  }

  const ok = await writeToGateway(username, gatewayType, {
    reflections,
    createdAt: rows[0]?.createdAt?.toISOString() || now,
  }, label, userIdentifier);
  if (ok) written.push(label);
  else errors.push(label);
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Full sync of all AST user data to pods via the gateway.
 * Uses service-token auth — no per-user Auth0 JWT required.
 */
export async function syncAll(
  userId: number
): Promise<{ written: string[]; errors: string[] }> {
  const written: string[] = [];
  const errors: string[] = [];
  const now = new Date().toISOString();

  try {
    const account = await getVaultAccount(userId);
    if (!account) {
      return { written: [], errors: ['No vault account or pod sync not enabled'] };
    }

    const username = extractUsername(account.masterPodUrl || '');
    if (!username) {
      return { written: [], errors: ['Could not extract username from masterPodUrl'] };
    }

    const userIdentifier = account.auth0Sub || `user:${userId}`;

    // ── Query core tables ───────────────────────────────────────────────
    const [userRows, starCardRows, flowAttrRows, finalReflRows, assessmentRows] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(starCards).where(eq(starCards.userId, userId)).limit(1),
      db.select().from(flowAttributes).where(eq(flowAttributes.userId, userId)).limit(1),
      db.select().from(finalReflections).where(eq(finalReflections.userId, userId)).limit(1),
      db.select().from(userAssessments).where(eq(userAssessments.userId, userId)),
    ]);

    const user = userRows[0];
    const starCard = starCardRows[0];
    const flowAttr = flowAttrRows[0];
    const finalRefl = finalReflRows[0];

    const assessmentByType = new Map<string, { results: string; createdAt: Date }>();
    for (const row of assessmentRows) {
      assessmentByType.set(row.assessmentType, { results: row.results, createdAt: row.createdAt });
    }

    // ── 1. Profile ──────────────────────────────────────────────────────
    if (user) {
      const ok = await writeToGateway(username, 'profile', {
        name: user.name,
        email: user.email,
        jobTitle: user.jobTitle ?? null,
        organization: user.organization ?? null,
      }, 'profile', userIdentifier);
      if (ok) written.push('profile');
      else errors.push('profile');
    }

    // ── 2. Star Card (from star_cards table) ────────────────────────────
    if (starCard) {
      const ok = await writeToGateway(username, 'starCard', {
        thinking: starCard.thinking,
        acting: starCard.acting,
        feeling: starCard.feeling,
        planning: starCard.planning,
        createdAt: starCard.createdAt?.toISOString() || now,
      }, 'starCard', userIdentifier);
      if (ok) written.push('starCard');
      else errors.push('starCard');
    }

    // ── 3. Flow Attributes (from flow_attributes table) ─────────────────
    if (flowAttr) {
      const attrs = flowAttr.attributes as Array<{ name: string; score: number }>;
      const ok = await writeToGateway(username, 'flowAttributes', {
        attributes: Array.isArray(attrs) ? attrs : [],
        createdAt: flowAttr.createdAt?.toISOString() || now,
      }, 'flowAttributes', userIdentifier);
      if (ok) written.push('flowAttributes');
      else errors.push('flowAttributes');
    }

    // ── 4. Final Insight (from final_reflections table) ─────────────────
    if (finalRefl) {
      const ok = await writeToGateway(username, 'finalInsight', {
        insight: finalRefl.insight,
        createdAt: finalRefl.createdAt?.toISOString() || now,
      }, 'finalInsight', userIdentifier);
      if (ok) written.push('finalInsight');
      else errors.push('finalInsight');
    }

    // ── 5–10. Assessments from user_assessments ─────────────────────────
    await syncAssessment(username, assessmentByType, 'futureSelfReflection', 'futureSelfReflection', 'futureSelf', userIdentifier, written, errors, now);
    await syncAssessment(username, assessmentByType, 'cantrilLadder', 'cantrilLadder', 'cantrilLadder', userIdentifier, written, errors, now);
    await syncAssessment(username, assessmentByType, 'cantrilLadderReflection', 'cantrilLadderReflection', 'cantrilLadderReflection', userIdentifier, written, errors, now);
    await syncAssessment(username, assessmentByType, 'roundingOutReflection', 'roundingOutReflection', 'roundingOut', userIdentifier, written, errors, now);
    await syncAssessment(username, assessmentByType, 'flowAssessment', 'flowAssessment', 'flowAssessment', userIdentifier, written, errors, now);
    await syncAssessment(username, assessmentByType, 'stepByStepReflection', 'stepByStepReflection', 'stepByStepReflection', userIdentifier, written, errors, now);
    await syncAssessment(username, assessmentByType, 'finalReflection', 'finalReflection', 'finalReflection', userIdentifier, written, errors, now);

    // ── 11–16. Reflection sets from reflection_responses ────────────────
    await syncReflectionSet(username, userId, 'strength-reflections', 'strengthReflections', 'strengthReflections', userIdentifier, written, errors, now);
    await syncReflectionSet(username, userId, 'flow-patterns', 'flowPatterns', 'flowPatterns', userIdentifier, written, errors, now);
    await syncReflectionSet(username, userId, 'future-self', 'futureSelfVision', 'futureSelfVision', userIdentifier, written, errors, now);
    await syncReflectionSet(username, userId, 'cantril-ladder', 'cantrilLadderReflections', 'cantrilLadderReflections', userIdentifier, written, errors, now);
    await syncReflectionSet(username, userId, 'wellbeing', 'wellbeingReflections', 'wellbeingReflections', userIdentifier, written, errors, now);
    await syncReflectionSet(username, userId, 'strengths', 'strengthsReflections', 'strengthsReflections', userIdentifier, written, errors, now);

    await touchSyncTimestamp(userId);
    log(`syncAll complete for user ${userId}: ${written.length} written, ${errors.length} errors`);
  } catch (err) {
    logError('syncAll failed:', err);
    errors.push('syncAll top-level error');
  }

  return { written, errors };
}

/**
 * Sync a completed holistic report to the user's pod.
 * Called after report generation completes — NOT part of syncAll.
 */
export async function syncHolisticReport(
  userId: number,
  reportType: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const account = await getVaultAccount(userId);
    if (!account) {
      return { ok: false, error: 'No vault account or pod sync not enabled' };
    }

    const username = extractUsername(account.masterPodUrl || '');
    if (!username) {
      return { ok: false, error: 'Could not extract username from masterPodUrl' };
    }

    const userIdentifier = account.auth0Sub || `user:${userId}`;

    // Query the completed report via Drizzle raw SQL
    const rows = await db.execute(sql`
      SELECT html_content, report_data, generated_at
      FROM holistic_reports
      WHERE user_id = ${userId} AND report_type = ${reportType} AND generation_status = 'completed'
      ORDER BY generated_at DESC LIMIT 1
    `) as any[];

    if (!rows || rows.length === 0) {
      return { ok: false, error: `No completed ${reportType} report found` };
    }

    const report = rows[0];
    const reportData = typeof report.report_data === 'string'
      ? JSON.parse(report.report_data)
      : report.report_data;

    const ok = await writeToGateway(username, 'holisticReport', {
      reportType,
      htmlContent: report.html_content || null,
      reportData,
      generatedAt: report.generated_at?.toISOString() || new Date().toISOString(),
    }, `holisticReport:${reportType}`, userIdentifier);

    return { ok };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(`syncHolisticReport failed for user ${userId}:`, msg);
    return { ok: false, error: msg };
  }
}
