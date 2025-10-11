import fetch from 'node-fetch';

const TENANT = process.env.TENANT_DOMAIN!;
const AUDIENCE = process.env.MGMT_AUDIENCE!;
const CLIENT_ID = process.env.MGMT_CLIENT_ID!;
const CLIENT_SECRET = process.env.MGMT_CLIENT_SECRET!;

let cachedToken: { access_token: string; expires_at: number } | null = null;

async function getMgmtToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expires_at - 60 > now) return cachedToken.access_token;

  const r = await fetch(`https://${TENANT}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: AUDIENCE,
      grant_type: 'client_credentials'
    })
  });
  if (!r.ok) throw new Error(`mgmt token failed: ${r.status}`);
  const j = await r.json();
  cachedToken = { access_token: j.access_token, expires_at: now + (j.expires_in || 3600) };
  return cachedToken.access_token;
}

export async function deleteAuth0User(userId: string): Promise<Response> {
  const token = await getMgmtToken();
  return fetch(`https://${TENANT}/api/v2/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
}
