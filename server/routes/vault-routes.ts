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
import { syncAll, syncWorkshopReport } from '../services/solid-pod/index.js';

const vaultRouter = Router();

/**
 * POST /api/vault/sync-all
 * Trigger a full sync for ALL users with active vault accounts.
 * Admin-only — intended for the admin console "Sync All Pods" button.
 */
vaultRouter.post('/sync-all', async (req: Request, res: Response) => {
  try {
    const activeAccounts = await db
      .select()
      .from(vaultAccounts)
      .where(eq(vaultAccounts.provisioningStatus, 'active'));

    if (activeAccounts.length === 0) {
      return res.json({ success: true, message: 'No active vault accounts found', results: [] });
    }

    const results: Array<{ userId: number; podUsername: string | null; written: string[]; errors: string[] }> = [];

    for (const account of activeAccounts) {
      try {
        const result = await syncAll(account.userId);
        results.push({
          userId: account.userId,
          podUsername: account.podUsername,
          written: result.written,
          errors: result.errors,
        });
      } catch (err) {
        results.push({
          userId: account.userId,
          podUsername: account.podUsername,
          written: [],
          errors: [String(err)],
        });
      }
    }

    const totalWritten = results.reduce((sum, r) => sum + r.written.length, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    res.json({
      success: totalErrors === 0,
      message: `Synced ${activeAccounts.length} users: ${totalWritten} resources written, ${totalErrors} errors`,
      results,
    });
  } catch (err) {
    console.error('[vault-routes] sync-all failed:', err);
    res.status(500).json({ error: 'Sync-all failed', message: String(err) });
  }
});

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

/**
 * POST /api/vault/sync-report/:userId
 * Receive compiled workshop report HTML and sync it to the user's pod
 * as a companion-report artifact. Can be called by the client after
 * report viewing, or as a manual trigger.
 */
vaultRouter.post('/sync-report/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const { reportHtml, aiModelVersion } = req.body;
    if (!reportHtml || typeof reportHtml !== 'string') {
      return res.status(400).json({ error: 'reportHtml is required and must be a string' });
    }

    // Respond immediately — sync in background
    res.json({ status: 'accepted' });

    syncWorkshopReport(userId, reportHtml, aiModelVersion).catch(err => {
      console.error(`[vault-routes] syncWorkshopReport failed for user ${userId}:`, err);
    });
  } catch (err) {
    console.error('[vault-routes] sync-report failed:', err);
    res.status(500).json({ error: 'Sync-report failed', message: String(err) });
  }
});

export default vaultRouter;
