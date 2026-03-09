/**
 * Pod Write Service — Smoke Test
 *
 * Runs syncAll() for a test user, then reads back each resource from the pod
 * to verify the data was written correctly.
 *
 * Usage:
 *   npx tsx server/services/solid-pod/smoke-test.ts [userId]
 *
 * If no userId is provided, picks the first user with a vault account.
 *
 * Prerequisites:
 *   - SOLID_CLIENT_ID and SOLID_CLIENT_SECRET set in .env
 *   - FEATURE_SOLID_POD_SYNC=true in .env (or this script sets it)
 *   - User must have a vault_accounts entry
 */

import 'dotenv/config';
import { db } from '../../db.js';
import { eq } from 'drizzle-orm';
import { vaultAccounts, users } from '../../../shared/schema.js';
import { getAccessToken, generateDPoPProof, isDPoPConfigured } from './dpop-utils.js';
import { syncAll } from './pod-sync-service.js';

// ── Ensure feature flag is on for testing ───────────────────────────────────
process.env.FEATURE_SOLID_POD_SYNC = 'true';

const VAULT_BASE = process.env.VAULT_BASE_URL || 'https://vaults.selfactual.ai';

// ── Helpers ─────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function pass(msg: string) {
  passed++;
  console.log(`  ✅ PASS: ${msg}`);
}

function fail(msg: string) {
  failed++;
  console.log(`  ❌ FAIL: ${msg}`);
}

function info(msg: string) {
  console.log(`  ℹ️  ${msg}`);
}

/** Authenticated GET request to a pod resource */
async function fetchResource(podPath: string): Promise<{ status: number; body: string }> {
  const url = `${VAULT_BASE}${podPath}`;
  const accessToken = await getAccessToken();
  const dpopProof = await generateDPoPProof('GET', url, accessToken);

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/turtle',
      'Authorization': `DPoP ${accessToken}`,
      'DPoP': dpopProof,
    },
  });

  const body = await res.text();
  return { status: res.status, body };
}

/** Unauthenticated GET to verify access control */
async function fetchUnauthenticated(podPath: string): Promise<number> {
  const url = `${VAULT_BASE}${podPath}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'text/turtle' },
  });
  return res.status;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Pod Write Service — Smoke Test');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 0: Check prerequisites
  console.log('Step 0: Prerequisites\n');
  if (!isDPoPConfigured()) {
    console.log('  ❌ SOLID_CLIENT_ID and SOLID_CLIENT_SECRET must be set');
    process.exit(1);
  }
  pass('DPoP credentials configured');

  try {
    await getAccessToken();
    pass('Access token obtained');
  } catch (err) {
    fail(`Access token failed: ${(err as Error).message}`);
    process.exit(1);
  }

  // Step 1: Find the test user
  console.log('\nStep 1: Find test user\n');
  const targetUserId = process.argv[2] ? parseInt(process.argv[2]) : null;

  let account: any;
  if (targetUserId) {
    const rows = await db.select().from(vaultAccounts).where(eq(vaultAccounts.userId, targetUserId)).limit(1);
    account = rows[0];
  } else {
    const rows = await db.select().from(vaultAccounts).limit(1);
    account = rows[0];
  }

  if (!account) {
    fail('No vault account found. Provide a userId with a vault account.');
    process.exit(1);
  }

  const userId = account.userId;
  const username = account.podUsername || account.masterPodUrl.match(/\/([^/]+)\/master\/?$/)?.[1];
  pass(`Using user ${userId} (pod: ${username})`);
  info(`Master: ${account.masterPodUrl}`);
  info(`Sub:    ${account.subPodUrl}`);

  // Look up user details
  const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userRows[0];
  if (user) {
    info(`Name: ${user.name}, Email: ${user.email}`);
  }

  // Step 2: Run syncAll
  console.log('\nStep 2: Run syncAll()\n');
  const result = await syncAll(userId);
  info(`Written: ${result.written.length} resources`);
  for (const w of result.written) {
    info(`  → ${w}`);
  }
  if (result.errors.length > 0) {
    info(`Errors: ${result.errors.length}`);
    for (const e of result.errors) {
      info(`  → ${e}`);
    }
  }

  if (result.written.length > 0) {
    pass(`syncAll wrote ${result.written.length} resources`);
  } else if (result.errors.length > 0) {
    fail('syncAll had errors and wrote nothing');
  } else {
    info('No data to sync (user may have no assessments/reflections)');
  }

  // Step 3: Read back resources and verify
  console.log('\nStep 3: Verify resources in pods\n');

  // 3a: Profile (master)
  const profileRes = await fetchResource(`/${username}/master/profile`);
  if (profileRes.status === 200 && profileRes.body.includes('sa:VaultOwner')) {
    pass('Profile exists in master pod with sa:VaultOwner type');
  } else if (profileRes.status === 404) {
    info('Profile not found in master (may not have been synced)');
  } else {
    fail(`Profile master: HTTP ${profileRes.status}`);
  }

  // 3b: Profile summary (sub)
  const profileSumRes = await fetchResource(`/${username}/sub/profile-summary`);
  if (profileSumRes.status === 200 && profileSumRes.body.includes('sa:SharedProfile')) {
    pass('Profile summary exists in sub pod with sa:SharedProfile type');
    if (profileSumRes.body.includes('schema:email')) {
      fail('Sub pod profile contains email — should be omitted!');
    } else {
      pass('Sub pod profile correctly omits email');
    }
  } else if (profileSumRes.status === 404) {
    info('Profile summary not found in sub (may not have been synced)');
  } else {
    fail(`Profile summary sub: HTTP ${profileSumRes.status}`);
  }

  // 3c: Star Card (master)
  const scMasterRes = await fetchResource(`/${username}/master/assessments/starcard`);
  if (scMasterRes.status === 200 && scMasterRes.body.includes('sa:StarCard')) {
    pass('Star Card exists in master pod');
    if (scMasterRes.body.includes('sa:hasReflections')) {
      pass('Master Star Card includes sa:hasReflections link');
    }
  } else if (scMasterRes.status === 404) {
    info('Star Card not found in master (user may not have completed it)');
  } else {
    fail(`Star Card master: HTTP ${scMasterRes.status}`);
  }

  // 3d: Star Card (sub) — should NOT have hasReflections
  const scSubRes = await fetchResource(`/${username}/sub/assessments/starcard`);
  if (scSubRes.status === 200 && scSubRes.body.includes('sa:StarCard')) {
    pass('Star Card exists in sub pod');
    if (scSubRes.body.includes('sa:hasReflections')) {
      fail('Sub pod Star Card contains sa:hasReflections — should be omitted!');
    } else {
      pass('Sub pod Star Card correctly omits sa:hasReflections');
    }
  } else if (scSubRes.status === 404) {
    info('Star Card not found in sub (user may not have completed it)');
  }

  // 3e: Strength Reflections (master only)
  const reflectionDimensions = ['thinking', 'acting', 'feeling', 'planning'];
  for (const dim of reflectionDimensions) {
    const reflRes = await fetchResource(`/${username}/master/reflections/strength-reflections/${dim}`);
    if (reflRes.status === 200 && reflRes.body.includes('sa:Reflection')) {
      pass(`Reflection/${dim} exists in master pod`);
    } else if (reflRes.status === 404) {
      info(`Reflection/${dim} not found (may not have been submitted)`);
    } else {
      fail(`Reflection/${dim}: HTTP ${reflRes.status}`);
    }
  }

  // 3f: Verify reflections are NOT in sub pod
  console.log('\nStep 4: Verify reflections absent from sub pod\n');
  for (const dim of reflectionDimensions) {
    const subReflRes = await fetchResource(`/${username}/sub/reflections/strength-reflections/${dim}`);
    if (subReflRes.status === 404 || subReflRes.status === 403 || subReflRes.status === 401) {
      pass(`Reflection/${dim} correctly absent from sub pod (${subReflRes.status})`);
    } else if (subReflRes.status === 200) {
      fail(`Reflection/${dim} found in sub pod — should NOT be there!`);
    }
  }

  // 3g: Final Insight (master only)
  const fiRes = await fetchResource(`/${username}/master/reflections/final-insight`);
  if (fiRes.status === 200 && fiRes.body.includes('sa:FinalInsight')) {
    pass('Final Insight exists in master pod');
  } else if (fiRes.status === 404) {
    info('Final Insight not found (user may not have submitted it)');
  } else {
    fail(`Final Insight: HTTP ${fiRes.status}`);
  }

  // 3h: Provenance log
  const provRes = await fetchResource(`/${username}/master/provenance/ast-write-log`);
  if (provRes.status === 200 && provRes.body.includes('sa:ProvenanceEntry')) {
    pass('Provenance log exists with entries');
  } else if (provRes.status === 404) {
    info('Provenance log not found (nothing may have been written)');
  } else {
    fail(`Provenance log: HTTP ${provRes.status}`);
  }

  // Step 5: Access control check
  console.log('\nStep 5: Access control\n');
  const unauthStatus = await fetchUnauthenticated(`/${username}/master/assessments/starcard`);
  if (unauthStatus === 401 || unauthStatus === 403) {
    pass(`Master pod denies unauthenticated access (HTTP ${unauthStatus})`);
  } else if (unauthStatus === 404) {
    info('Resource not found — cannot test access control');
  } else {
    fail(`Master pod returned HTTP ${unauthStatus} for unauthenticated request — expected 401/403`);
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Clean up DB connection
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
