/**
 * Vault Provisioning Client
 *
 * Thin HTTP client for the SelfActual provisioning service.
 * SAFE BY DEFAULT: If VAULT_PROVISIONING_TOKEN is not set, all calls silently skip.
 * This means production (which doesn't have this env var) is never affected.
 */

const PROVISIONING_URL = process.env.VAULT_PROVISIONING_URL || '';
const PROVISIONING_TOKEN = process.env.VAULT_PROVISIONING_TOKEN || '';

function isEnabled(): boolean {
  return !!(PROVISIONING_URL && PROVISIONING_TOKEN);
}

export async function provisionUserVault(
  auth0Sub: string,
  userId: number,
  displayName: string
): Promise<{ status: string; skipped?: boolean } | null> {
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
  return response.json();
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
