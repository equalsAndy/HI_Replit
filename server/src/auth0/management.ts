import fetch from 'node-fetch';

// Support both legacy and new env names
const TENANT = process.env.AUTH0_TENANT_DOMAIN || process.env.TENANT_DOMAIN || '';
const AUDIENCE = process.env.AUTH0_MGMT_AUDIENCE || process.env.MGMT_AUDIENCE || '';
const CLIENT_ID = process.env.AUTH0_MGMT_CLIENT_ID || process.env.MGMT_CLIENT_ID || '';
const CLIENT_SECRET = process.env.AUTH0_MGMT_CLIENT_SECRET || process.env.MGMT_CLIENT_SECRET || '';
const DB_CONNECTION = process.env.AUTH0_DB_CONNECTION || 'Username-Password-Authentication';
const MGMT_SCOPES = process.env.AUTH0_MGMT_SCOPES;

let cachedToken: { access_token: string; expires_at: number } | null = null;

export async function getMgmtToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expires_at - 60 > now) return cachedToken.access_token;

  const r = await fetch(`https://${TENANT}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: AUDIENCE,
      grant_type: 'client_credentials',
      scope: MGMT_SCOPES
    })
  });
  if (!r.ok) throw new Error(`mgmt token failed: ${r.status}`);
  const j = await r.json();
  cachedToken = { access_token: j.access_token, expires_at: now + (j.expires_in || 3600) };
  return cachedToken.access_token;
}

/** Delete the Auth0 user via management API */
export async function deleteAuth0User(userId: string): Promise<Response> {
  const token = await getMgmtToken();
  return fetch(`https://${TENANT}/api/v2/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
}

/** Create a database user in Auth0 via Management API */
export async function createAuth0DbUser(params: { email: string; password: string; name?: string }): Promise<any> {
  if (!TENANT || !AUDIENCE || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Auth0 Management env not configured');
  }
  const token = await getMgmtToken();
  const r = await fetch(`https://${TENANT}/api/v2/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      connection: DB_CONNECTION,
      email: params.email,
      password: params.password,
      name: params.name,
      email_verified: false
    })
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Auth0 user create failed: ${r.status} ${txt}`);
  }
  return r.json();
}
