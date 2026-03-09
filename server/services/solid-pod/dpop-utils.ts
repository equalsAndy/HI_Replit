/**
 * DPoP (Demonstration of Proof of Possession) utilities for Solid Pod authentication
 *
 * Implements DPoP token generation for Solid-OIDC service account authentication.
 * Uses the `jose` library for lightweight JWT signing.
 */

import * as jose from 'jose';

// ── Configuration ────────────────────────────────────────────────────────────

const SOLID_ISSUER = process.env.SOLID_ISSUER || 'https://vaults.selfactual.ai';
const SOLID_CLIENT_ID = process.env.SOLID_CLIENT_ID || '';
const SOLID_CLIENT_SECRET = process.env.SOLID_CLIENT_SECRET || '';

// Cache the access token + DPoP key pair
let cachedToken: { accessToken: string; expiresAt: number } | null = null;
let dpopKeyPair: { publicKey: jose.KeyLike; privateKey: jose.KeyLike; publicJwk: jose.JWK } | null = null;

// ── Key Management ───────────────────────────────────────────────────────────

async function ensureKeyPair(): Promise<typeof dpopKeyPair> {
  if (!dpopKeyPair) {
    const { publicKey, privateKey } = await jose.generateKeyPair('ES256');
    const publicJwk = await jose.exportJWK(publicKey);
    dpopKeyPair = { publicKey, privateKey, publicJwk };
  }
  return dpopKeyPair;
}

// ── DPoP Proof Generation ────────────────────────────────────────────────────

/**
 * Generate a DPoP proof JWT for a specific HTTP method and URI.
 */
export async function generateDPoPProof(
  method: string,
  uri: string,
  accessToken?: string
): Promise<string> {
  const kp = await ensureKeyPair();
  if (!kp) throw new Error('Failed to generate DPoP key pair');

  const header: jose.JWTHeaderParameters = {
    alg: 'ES256',
    typ: 'dpop+jwt',
    jwk: kp.publicJwk,
  };

  const payload: jose.JWTPayload = {
    jti: crypto.randomUUID(),
    htm: method.toUpperCase(),
    htu: uri,
    iat: Math.floor(Date.now() / 1000),
  };

  // Include ath (access token hash) if we have an access token
  if (accessToken) {
    const encoder = new TextEncoder();
    const tokenBytes = encoder.encode(accessToken);
    const hashBuffer = await crypto.subtle.digest('SHA-256', tokenBytes);
    payload.ath = jose.base64url.encode(new Uint8Array(hashBuffer));
  }

  return await new jose.SignJWT(payload)
    .setProtectedHeader(header)
    .sign(kp.privateKey);
}

// ── Token Acquisition ────────────────────────────────────────────────────────

/**
 * Obtain an access token from the Solid OIDC token endpoint using
 * client_credentials grant with DPoP binding.
 */
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  if (!SOLID_CLIENT_ID || !SOLID_CLIENT_SECRET) {
    throw new Error('SOLID_CLIENT_ID and SOLID_CLIENT_SECRET must be set');
  }

  // Discover the token endpoint from the OIDC configuration
  const oidcConfigUrl = `${SOLID_ISSUER}/.well-known/openid-configuration`;
  const oidcRes = await fetch(oidcConfigUrl);
  if (!oidcRes.ok) {
    throw new Error(`Failed to fetch OIDC config: ${oidcRes.status}`);
  }
  const oidcConfig = await oidcRes.json() as { token_endpoint: string };
  const tokenEndpoint = oidcConfig.token_endpoint;

  // Generate DPoP proof for the token request
  const dpopProof = await generateDPoPProof('POST', tokenEndpoint);

  // Request the token
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: SOLID_CLIENT_ID,
    client_secret: SOLID_CLIENT_SECRET,
    scope: 'webid',
  });

  const tokenRes = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'DPoP': dpopProof,
    },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Token request failed: ${tokenRes.status} ${errText}`);
  }

  const tokenData = await tokenRes.json() as { access_token: string; expires_in?: number };
  const expiresIn = tokenData.expires_in || 3600;

  cachedToken = {
    accessToken: tokenData.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return cachedToken.accessToken;
}

// ── Readiness Check ──────────────────────────────────────────────────────────

/** Returns true if the required env vars are configured */
export function isDPoPConfigured(): boolean {
  return !!(SOLID_CLIENT_ID && SOLID_CLIENT_SECRET);
}
