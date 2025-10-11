export async function adminHardDelete(auth0Id: string): Promise<Response> {
  return fetch(`/admin/users/${encodeURIComponent(auth0Id)}?hard=true`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' }
  });
}
