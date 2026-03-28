/**
 * SelfActual Gateway Client
 *
 * HTTP client for the SelfActual gateway API. The gateway handles all Solid Pod
 * authentication internally — HI_Replit just sends Auth0 JWTs and JSON payloads.
 *
 * Required env vars:
 *   GATEWAY_BASE_URL — e.g. http://localhost:3002 (local) or production URL
 *
 * Auth: Auth0 Bearer token passed per-request (sourced from user session)
 */

const GATEWAY_BASE_URL = process.env.GATEWAY_BASE_URL || 'http://localhost:3002';

// ── Types ────────────────────────────────────────────────────────────────────

export interface GatewayResult<T = unknown> {
  ok: boolean;
  status: number;
  statusText: string;
  data?: T;
}

// ── Core Request ─────────────────────────────────────────────────────────────

async function gatewayRequest<T = unknown>(
  method: string,
  path: string,
  auth0Token: string,
  body?: unknown
): Promise<GatewayResult<T>> {
  const url = `${GATEWAY_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${auth0Token}`,
    'Accept': 'application/json',
  };
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data: T | undefined;
    try {
      data = await res.json() as T;
    } catch {
      // Response may not be JSON
    }

    return { ok: res.ok, status: res.status, statusText: res.statusText, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, statusText: `Network error: ${message}` };
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Read the full aggregated profile from a user's pod */
export async function getFullProfile(username: string, token: string) {
  return gatewayRequest('GET', `/api/pods/${username}/full`, token);
}

/** Read Star Card from pod */
export async function getStarCard(username: string, token: string) {
  return gatewayRequest('GET', `/api/pods/${username}/starcard`, token);
}

/** Read flow attributes from pod */
export async function getFlowAttributes(username: string, token: string) {
  return gatewayRequest('GET', `/api/pods/${username}/flow-attributes`, token);
}

/** Read profile from pod */
export async function getProfile(username: string, token: string) {
  return gatewayRequest('GET', `/api/pods/${username}/profile`, token);
}

/** Read all reflections from pod */
export async function getReflections(username: string, token: string) {
  return gatewayRequest('GET', `/api/pods/${username}/reflections`, token);
}

/** Write an external assessment to the pod */
export async function writeExternalAssessment(
  username: string,
  token: string,
  payload: { type: string; data: unknown }
) {
  return gatewayRequest('POST', `/api/pods/${username}/external-assessments`, token, payload);
}

/** Write a session log to the pod */
export async function writeSession(
  username: string,
  token: string,
  payload: { sessionSummary: string; [key: string]: unknown }
) {
  return gatewayRequest('POST', `/api/pods/${username}/sessions`, token, payload);
}

/** Health check (no auth required) */
export async function healthCheck(): Promise<GatewayResult> {
  try {
    const res = await fetch(`${GATEWAY_BASE_URL}/api/health`);
    let data: unknown;
    try { data = await res.json(); } catch { /* ignore */ }
    return { ok: res.ok, status: res.status, statusText: res.statusText, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, statusText: `Network error: ${message}` };
  }
}

/** Check if gateway URL is configured */
export function isGatewayConfigured(): boolean {
  return !!GATEWAY_BASE_URL;
}
