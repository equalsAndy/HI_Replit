/**
 * Vault Provisioning Client
 *
 * Thin HTTP client for the SelfActual provisioning service.
 * SAFE BY DEFAULT: If VAULT_PROVISIONING_TOKEN is not set, all calls silently skip.
 * This means production (which doesn't have this env var) is never affected.
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
}

export async function provisionUserVault(
  auth0Sub: string,
  userId: number,
  displayName: string
): Promise<ProvisionResponse | null> {
  if (!isEnabled()) {
    // Silently skip — no token means provisioning is not configured for this environment
    return { status: 'skipped', skipped: true };
  }

  const response = await fetch(`${PROVISIONING_URL}/provision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PROVISIONING_TOKEN}`,
    },
    body: JSON.stringify({ auth0Sub, userId: String(userId), displayName }),
  });
  const result = await response.json() as ProvisionResponse;

  // If provisioning succeeded and returned pod URLs, save to vault_accounts
  if (result && result.masterPodUrl && result.subPodUrl) {
    try {
      const username = result.username || extractUsername(result.masterPodUrl);
      const existing = await db
        .select()
        .from(vaultAccounts)
        .where(eq(vaultAccounts.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(vaultAccounts)
          .set({
            podUsername: username,
            masterPodUrl: result.masterPodUrl,
            subPodUrl: result.subPodUrl,
            updatedAt: new Date(),
          })
          .where(eq(vaultAccounts.userId, userId));
      } else {
        await db.insert(vaultAccounts).values({
          userId,
          podUsername: username,
          masterPodUrl: result.masterPodUrl,
          subPodUrl: result.subPodUrl,
        });
      }
      console.log(`[vault-client] Saved vault_accounts for user ${userId} (${username})`);
    } catch (err) {
      console.error('[vault-client] Failed to save vault_accounts:', err);
    }
  }

  return result;
}

export async function getVaultStatus(
  auth0Sub: string
): Promise<{ status: string; skipped?: boolean } | null> {
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

/** Extract username from master pod URL */
function extractUsername(masterPodUrl: string): string {
  const match = masterPodUrl.match(/\/([^/]+)\/master\/?$/);
  return match?.[1] || '';
}
