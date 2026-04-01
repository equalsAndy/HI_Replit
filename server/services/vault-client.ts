/**
 * Vault Provisioning Client
 *
 * Thin HTTP client for the SelfActual provisioning service.
 * SAFE BY DEFAULT: If VAULT_PROVISIONING_TOKEN is not set, all calls silently skip.
 * This means production (which doesn't have this env var) is never affected.
 *
 * DB-first strategy: A vault_accounts record is created BEFORE calling the
 * provisioning API (status='provisioning'), then updated to 'active' or 'failed'.
 * This ensures partial failures are always trackable.
 */

import { db } from '../db.js';
import { eq } from 'drizzle-orm';
import { vaultAccounts } from '../../shared/schema.js';

const PROVISIONING_URL = process.env.VAULT_PROVISIONING_URL || '';
const PROVISIONING_TOKEN = process.env.VAULT_PROVISIONING_TOKEN || '';

function isEnabled(): boolean {
  return !!(PROVISIONING_URL && PROVISIONING_TOKEN);
}

interface ProvisionResponse {
  status: string;
  skipped?: boolean;
  masterPodUrl?: string;
  subPodUrl?: string;
  username?: string;
  error?: string;
}

export async function provisionUserVault(
  auth0Sub: string,
  userId: number,
  displayName: string
): Promise<ProvisionResponse | null> {
  if (!isEnabled()) {
    return { status: 'skipped', skipped: true };
  }

  // Step 1: Create or update DB record BEFORE calling the provisioning API
  try {
    const existing = await db
      .select()
      .from(vaultAccounts)
      .where(eq(vaultAccounts.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      // If already active, don't re-provision
      if (existing[0].provisioningStatus === 'active') {
        console.log(`[vault-client] User ${userId} already has an active vault, skipping`);
        return { status: 'already_active', skipped: true };
      }
      // Reset for retry (e.g. previously failed)
      await db
        .update(vaultAccounts)
        .set({
          auth0Sub,
          provisioningStatus: 'provisioning',
          lastError: null,
          updatedAt: new Date(),
        })
        .where(eq(vaultAccounts.userId, userId));
    } else {
      await db.insert(vaultAccounts).values({
        userId,
        auth0Sub,
        provisioningStatus: 'provisioning',
      });
    }
  } catch (dbErr) {
    console.error('[vault-client] Failed to create tracking record:', dbErr);
    // Continue with provisioning anyway — better to attempt than abort
  }

  // Step 2: Call the provisioning API
  let result: ProvisionResponse;
  try {
    const response = await fetch(`${PROVISIONING_URL}/provision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PROVISIONING_TOKEN}`,
      },
      body: JSON.stringify({ auth0Sub, userId: String(userId), displayName }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      const errorMsg = `HTTP ${response.status}: ${errorBody}`;
      console.error(`[vault-client] Provisioning API error for user ${userId}:`, errorMsg);

      // Step 3a: Mark as failed
      await markFailed(userId, errorMsg);
      return { status: 'failed', error: errorMsg };
    }

    result = await response.json() as ProvisionResponse;
  } catch (fetchErr) {
    const errorMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
    console.error(`[vault-client] Provisioning API unreachable for user ${userId}:`, errorMsg);
    await markFailed(userId, errorMsg);
    return { status: 'failed', error: errorMsg };
  }

  // Step 3b: Mark as active with pod URLs
  if (result && result.masterPodUrl && result.subPodUrl) {
    try {
      const username = result.username || extractUsername(result.masterPodUrl);
      await db
        .update(vaultAccounts)
        .set({
          podUsername: username,
          masterPodUrl: result.masterPodUrl,
          subPodUrl: result.subPodUrl,
          provisioningStatus: 'active',
          lastError: null,
          updatedAt: new Date(),
        })
        .where(eq(vaultAccounts.userId, userId));
      console.log(`[vault-client] Vault active for user ${userId} (${username})`);
    } catch (err) {
      console.error('[vault-client] Failed to update vault_accounts to active:', err);
    }
  } else {
    // API returned 200 but no pod URLs — treat as failed
    const errorMsg = `Provisioning returned OK but missing pod URLs: ${JSON.stringify(result)}`;
    console.error(`[vault-client] ${errorMsg}`);
    await markFailed(userId, errorMsg);
    result.status = 'failed';
  }

  return result;
}

interface VaultStatusResponse {
  status: string;
  skipped?: boolean;
  masterPodUrl?: string;
  subPodUrl?: string;
  username?: string;
}

export async function getVaultStatus(
  auth0Sub: string
): Promise<VaultStatusResponse | null> {
  if (!isEnabled()) {
    return { status: 'skipped', skipped: true };
  }

  const response = await fetch(
    `${PROVISIONING_URL}/status/${encodeURIComponent(auth0Sub)}`,
    { headers: { 'Authorization': `Bearer ${PROVISIONING_TOKEN}` } }
  );

  if (!response.ok) return null;
  return response.json();
}

/**
 * Check whether a vault already exists before provisioning.
 * All callsites should use this instead of calling provisionUserVault() directly.
 * If a vault exists remotely but the local vault_accounts record is missing or
 * incomplete, upserts it so pod-sync-service can find the pod.
 */
export async function provisionIfNeeded(
  auth0Sub: string,
  userId: number,
  displayName: string
): Promise<ProvisionResponse | null> {
  // First check the provisioning API for an existing vault under this auth0Sub
  try {
    const remote = await getVaultStatus(auth0Sub);
    if (remote && !remote.skipped && remote.status !== 'not_found') {
      console.log(`[vault] Vault already exists for ${auth0Sub}, syncing local record`);

      // Ensure the local vault_accounts row exists and has the pod URLs
      await ensureLocalVaultRecord(userId, auth0Sub, remote);

      return { status: 'already_exists', skipped: true };
    }
  } catch (err) {
    console.warn('[vault] Vault status check failed, proceeding with provisioning:', err);
  }
  return provisionUserVault(auth0Sub, userId, displayName);
}

/** Upsert local vault_accounts row from remote vault status */
async function ensureLocalVaultRecord(
  userId: number,
  auth0Sub: string,
  remote: VaultStatusResponse
): Promise<void> {
  try {
    const existing = await db
      .select()
      .from(vaultAccounts)
      .where(eq(vaultAccounts.userId, userId))
      .limit(1);

    const podUsername = remote.username || (remote.masterPodUrl ? extractUsername(remote.masterPodUrl) : null);

    if (existing.length > 0) {
      // Update if pod URLs are missing
      if (!existing[0].masterPodUrl && remote.masterPodUrl) {
        await db
          .update(vaultAccounts)
          .set({
            auth0Sub,
            podUsername,
            masterPodUrl: remote.masterPodUrl,
            subPodUrl: remote.subPodUrl,
            provisioningStatus: 'active',
            lastError: null,
            updatedAt: new Date(),
          })
          .where(eq(vaultAccounts.userId, userId));
        console.log(`[vault] Updated local vault_accounts for user ${userId} with remote pod URLs`);
      }
    } else {
      // Create the local record from remote state
      await db.insert(vaultAccounts).values({
        userId,
        auth0Sub,
        podUsername,
        masterPodUrl: remote.masterPodUrl || null,
        subPodUrl: remote.subPodUrl || null,
        provisioningStatus: 'active',
      });
      console.log(`[vault] Created local vault_accounts for user ${userId} from existing remote vault`);
    }
  } catch (err) {
    console.error('[vault] Failed to sync local vault_accounts record:', err);
  }
}

/** Update vault_accounts record to failed status */
async function markFailed(userId: number, error: string) {
  try {
    await db
      .update(vaultAccounts)
      .set({
        provisioningStatus: 'failed',
        lastError: error,
        updatedAt: new Date(),
      })
      .where(eq(vaultAccounts.userId, userId));
  } catch (dbErr) {
    console.error('[vault-client] Failed to mark vault as failed:', dbErr);
  }
}

/** Extract username from master pod URL */
function extractUsername(masterPodUrl: string): string {
  const match = masterPodUrl.match(/\/([^/]+)\/master\/?$/);
  return match?.[1] || '';
}
