/**
 * Gateway Sync — Smoke Test
 *
 * Tests the Solid Pod sync flow via the SelfActual gateway.
 *
 * Usage:
 *   npx tsx server/services/solid-pod/smoke-test.ts [userId]
 *
 * Prerequisites:
 *   - GATEWAY_BASE_URL set in .env (e.g. http://localhost:3002)
 *   - FEATURE_SOLID_POD_SYNC=true in .env
 *   - User must have a vault_accounts entry
 *   - A valid Auth0 token (set AUTH0_TEST_TOKEN env var, or pass as 2nd arg)
 */

import 'dotenv/config';
import { db } from '../../db.js';
import { eq } from 'drizzle-orm';
import { vaultAccounts, users } from '../../../shared/schema.js';
import { healthCheck, getFullProfile, isGatewayConfigured } from './gateway-client.js';
import { syncAll } from './pod-sync-service.js';

// ── Ensure feature flag is on for testing ───────────────────────────────────
process.env.FEATURE_SOLID_POD_SYNC = 'true';

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

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Gateway Sync — Smoke Test');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 0: Prerequisites
  console.log('Step 0: Prerequisites\n');

  if (!isGatewayConfigured()) {
    console.log('  ❌ GATEWAY_BASE_URL must be set');
    process.exit(1);
  }
  pass('Gateway URL configured');

  const auth0Token = process.argv[3] || process.env.AUTH0_TEST_TOKEN || '';
  if (!auth0Token) {
    console.log('  ❌ Auth0 token required. Set AUTH0_TEST_TOKEN env var or pass as 2nd argument.');
    console.log('     Usage: npx tsx server/services/solid-pod/smoke-test.ts [userId] [auth0Token]');
    process.exit(1);
  }
  pass('Auth0 token provided');

  // Step 1: Gateway health check
  console.log('\nStep 1: Gateway health check\n');
  const health = await healthCheck();
  if (health.ok) {
    pass(`Gateway healthy (HTTP ${health.status})`);
  } else {
    fail(`Gateway unreachable: ${health.status} ${health.statusText}`);
    process.exit(1);
  }

  // Step 2: Find the test user
  console.log('\nStep 2: Find test user\n');
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

  const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userRows[0];
  if (user) {
    info(`Name: ${user.name}, Email: ${user.email}`);
  }

  // Step 3: Run syncAll via gateway
  console.log('\nStep 3: Run syncAll()\n');
  const result = await syncAll(userId, auth0Token);
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

  // Step 4: Read back via gateway
  console.log('\nStep 4: Verify data in pod via gateway\n');
  const fullProfile = await getFullProfile(username, auth0Token);
  if (fullProfile.ok) {
    pass(`Full profile retrieved (HTTP ${fullProfile.status})`);
    info(`Data: ${JSON.stringify(fullProfile.data).substring(0, 200)}...`);
  } else {
    fail(`Full profile read failed: ${fullProfile.status} ${fullProfile.statusText}`);
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
