import fetch from 'node-fetch';

interface DeleteUserResponse {
  ok: boolean;
  deleted?: string;
  error?: string;
  details?: any;
}

export async function deleteUser(auth0Id: string, hard: boolean = false): Promise<DeleteUserResponse> {
  const resp = await fetch(`/admin/users/${encodeURIComponent(auth0Id)}?hard=${hard}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const j = await resp.json();
  if (!resp.ok) throw new Error(j.error || 'Delete failed');
  return j as DeleteUserResponse;
}
