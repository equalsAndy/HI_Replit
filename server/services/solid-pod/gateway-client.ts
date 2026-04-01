/**
 * SelfActual Gateway Client
 *
 * HTTP client for the SelfActual gateway API. The gateway handles all Solid Pod
 * authentication internally — HI_Replit authenticates with a static service token.
 *
 * Required env vars:
 *   GATEWAY_BASE_URL          — e.g. https://api.selfactual.ai
 *   GATEWAY_SERVICE_TOKEN     — shared secret (same value set on gateway server)
 *
 * Auth: Static Bearer token + X-SA-App header (no per-user Auth0 JWTs needed)
 */

const GATEWAY_BASE_URL = process.env.GATEWAY_BASE_URL || 'http://localhost:3002';
const GATEWAY_SERVICE_TOKEN = process.env.GATEWAY_SERVICE_TOKEN || '';

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
  userIdentifier?: string,
  body?: unknown
): Promise<GatewayResult<T>> {
  const url = `${GATEWAY_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${GATEWAY_SERVICE_TOKEN}`,
    'X-SA-App': 'hi_replit',
    'Accept': 'application/json',
  };
  if (userIdentifier) {
    headers['X-SA-User'] = userIdentifier;
  }
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
export async function getFullProfile(username: string, userIdentifier?: string) {
  return gatewayRequest('GET', `/api/pods/${username}/full`, userIdentifier);
}

/** Read Star Card from pod */
export async function getStarCard(username: string, userIdentifier?: string) {
  return gatewayRequest('GET', `/api/pods/${username}/starcard`, userIdentifier);
}

/** Read flow attributes from pod */
export async function getFlowAttributes(username: string, userIdentifier?: string) {
  return gatewayRequest('GET', `/api/pods/${username}/flow-attributes`, userIdentifier);
}

/** Read profile from pod */
export async function getProfile(username: string, userIdentifier?: string) {
  return gatewayRequest('GET', `/api/pods/${username}/profile`, userIdentifier);
}

/** Read all reflections from pod */
export async function getReflections(username: string, userIdentifier?: string) {
  return gatewayRequest('GET', `/api/pods/${username}/reflections`, userIdentifier);
}

/** Write an external assessment to the pod */
export async function writeExternalAssessment(
  username: string,
  payload: { type: string; data: unknown },
  userIdentifier?: string
) {
  return gatewayRequest('POST', `/api/pods/${username}/external-assessments`, userIdentifier, payload);
}

/** Write a session log to the pod */
export async function writeSession(
  username: string,
  payload: { sessionSummary: string; [key: string]: unknown },
  userIdentifier?: string
) {
  return gatewayRequest('POST', `/api/pods/${username}/sessions`, userIdentifier, payload);
}

/** Write an artifact (companion visual, companion report, etc.) to a pod resource */
export async function writeArtifact(
  username: string,
  payload: {
    resourcePath: string;
    role: string;
    url?: string;
    base64Data?: string;
    contentType?: string;
    fileName?: string;
    metadata?: Record<string, string>;
  },
  userIdentifier?: string
) {
  return gatewayRequest('POST', `/api/pods/${username}/artifacts`, userIdentifier, payload);
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

/** Check if gateway URL and service token are configured */
export function isGatewayConfigured(): boolean {
  return !!(GATEWAY_BASE_URL && GATEWAY_SERVICE_TOKEN);
}
