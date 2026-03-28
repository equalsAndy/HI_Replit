/**
 * Vault Sync Routes
 *
 * Admin-only endpoints for manually triggering pod sync operations
 * and checking vault account status. Requires Auth0 token in the
 * Authorization header for gateway authentication.
 */

import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { eq } from 'drizzle-orm';
import { vaultAccounts } from '../../shared/schema.js';
import { syncAll } from '../services/solid-pod/index.js';

const vaultRouter = Router();

/**
 * POST /api/vault/sync/:userId
 * Trigger a full sync of all user data to their Solid Pod.
 * Requires Auth0 token (from session or Authorization header).
 */
vaultRouter.post('/sync/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const result = await syncAll(userId);
    res.json({
      success: result.errors.length === 0,
      userId,
      written: result.written,
      errors: result.errors,
    });
  } catch (err) {
    console.error('[vault-routes] sync failed:', err);
    res.status(500).json({ error: 'Sync failed', message: String(err) });
  }
});

/**
 * GET /api/vault/status/:userId
 * Check if a user has a vault account and its current status.
 */
vaultRouter.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const rows = await db
      .select()
      .from(vaultAccounts)
      .where(eq(vaultAccounts.userId, userId))
      .limit(1);

    const account = rows[0];
    if (!account) {
      return res.json({ hasVault: false, userId });
    }

    res.json({
      hasVault: account.provisioningStatus === 'active',
      userId,
      provisioningStatus: account.provisioningStatus,
      lastError: account.lastError,
      podUsername: account.podUsername,
      masterPodUrl: account.masterPodUrl,
      subPodUrl: account.subPodUrl,
      lastSyncedAt: account.lastSyncedAt,
      createdAt: account.createdAt,
    });
  } catch (err) {
    console.error('[vault-routes] status failed:', err);
    res.status(500).json({ error: 'Status check failed', message: String(err) });
  }
});

export default vaultRouter;
