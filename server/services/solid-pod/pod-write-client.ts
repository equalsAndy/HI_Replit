/**
 * Pod Write Client
 *
 * Thin HTTP client for writing Turtle RDF resources to Solid Pods.
 * Uses DPoP-bound access tokens for authentication.
 */

import { getAccessToken, generateDPoPProof, isDPoPConfigured } from './dpop-utils.js';

// ── Configuration ────────────────────────────────────────────────────────────

const VAULT_BASE = process.env.VAULT_BASE_URL || 'https://vaults.selfactual.ai';

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * PUT a Turtle resource to a pod path.
 * Idempotent — overwrites if the resource already exists.
 */
export async function putResource(
  podPath: string,
  turtleBody: string
): Promise<{ ok: boolean; status: number; statusText: string }> {
  if (!isDPoPConfigured()) {
    return { ok: false, status: 0, statusText: 'DPoP not configured — skipping' };
  }

  const url = `${VAULT_BASE}${podPath}`;
  const accessToken = await getAccessToken();
  const dpopProof = await generateDPoPProof('PUT', url, accessToken);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/turtle',
      'Authorization': `DPoP ${accessToken}`,
      'DPoP': dpopProof,
    },
    body: turtleBody,
  });

  return { ok: res.ok, status: res.status, statusText: res.statusText };
}

/**
 * PATCH a resource using SPARQL Update (for appending provenance entries).
 */
export async function patchResource(
  podPath: string,
  sparqlUpdate: string
): Promise<{ ok: boolean; status: number; statusText: string }> {
  if (!isDPoPConfigured()) {
    return { ok: false, status: 0, statusText: 'DPoP not configured — skipping' };
  }

  const url = `${VAULT_BASE}${podPath}`;
  const accessToken = await getAccessToken();
  const dpopProof = await generateDPoPProof('PATCH', url, accessToken);

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/sparql-update',
      'Authorization': `DPoP ${accessToken}`,
      'DPoP': dpopProof,
    },
    body: sparqlUpdate,
  });

  return { ok: res.ok, status: res.status, statusText: res.statusText };
}

/**
 * Check if a resource exists in the pod.
 */
export async function headResource(
  podPath: string
): Promise<boolean> {
  if (!isDPoPConfigured()) return false;

  const url = `${VAULT_BASE}${podPath}`;
  const accessToken = await getAccessToken();
  const dpopProof = await generateDPoPProof('HEAD', url, accessToken);

  const res = await fetch(url, {
    method: 'HEAD',
    headers: {
      'Authorization': `DPoP ${accessToken}`,
      'DPoP': dpopProof,
    },
  });

  return res.ok;
}

/** Returns true if pod writing is available */
export function isPodWriteConfigured(): boolean {
  return isDPoPConfigured();
}
