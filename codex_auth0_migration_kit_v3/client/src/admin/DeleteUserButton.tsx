import { useState } from 'react';
import { adminHardDelete } from './api';

export function DeleteUserButton({ auth0Id }: { auth0Id: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onClick = async () => {
    if (!confirm(`Delete ALL data and Auth0 user ${auth0Id}?`)) return;
    setBusy(true); setMsg(null);
    try {
      const r = await adminHardDelete(auth0Id);
      const text = await r.text();
      if (r.ok) setMsg('Deleted successfully.');
      else setMsg(`Delete failed: ${text}`);
    } catch (e: any) {
      setMsg(e.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button onClick={onClick} disabled={busy} style={{padding:'8px 12px', borderRadius:8}}>
        {busy ? 'Deleting…' : 'Hard Delete User'}
      </button>
      {msg && <div style={{marginTop:8}}>{msg}</div>}
    </div>
  );
}
