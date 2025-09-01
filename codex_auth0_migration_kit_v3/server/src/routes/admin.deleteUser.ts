import type { Request, Response } from 'express';
import { z } from 'zod';
import { deleteAuth0User } from '../auth0/management';

const Params = z.object({ auth0Id: z.string().min(1) });

// TODO: replace with your real DB deletion logic
async function deleteAppDataForUser(auth0Id: string): Promise<void> {
  // Implement your DB cascade delete here
  return;
}

export async function deleteUserHandler(req: Request, res: Response) {
  try {
    const { auth0Id } = Params.parse(req.params);
    const hard = String(req.query.hard ?? 'false') === 'true';
    if (!hard) return res.status(400).json({ error: 'Add ?hard=true to confirm deletion.' });

    await deleteAppDataForUser(auth0Id);

    const r = await deleteAuth0User(auth0Id);
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).send({ error: 'Auth0 delete failed', details: text });
    }
    return res.json({ ok: true, deleted: auth0Id });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'delete failed' });
  }
}
