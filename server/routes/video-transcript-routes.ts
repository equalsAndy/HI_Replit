/**
 * Video Transcript Routes
 * =======================
 * Admin CRUD + sync endpoints for video transcripts stored in the videos table.
 * Reuses TRAINING_DOC_SYNC_KEY for server-to-server auth (same key as training docs).
 *
 * All routes mounted at /api/admin/video-transcripts
 *
 * IMPORTANT — route ordering: named routes (/export, /sync-from, /push-to) must be
 * registered BEFORE the /:id parameter route to avoid Express treating
 * those literal strings as id values.
 */

import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { db } from '../db.js';
import { eq, and, ne } from 'drizzle-orm';
import { videos } from '../../shared/schema.js';

const router = express.Router();

// ─── Dual auth helper ────────────────────────────────────────────────────────
function isDualAuthed(req: express.Request): { isKeyAuth: boolean; isSessionAuth: boolean; authorized: boolean } {
  const syncKey = req.headers['x-sync-key'];
  const expectedKey = process.env.TRAINING_DOC_SYNC_KEY;
  const isKeyAuth = !!(syncKey && expectedKey && syncKey === expectedKey);
  const isSessionAuth =
    !!(req.session as any)?.userId && (req.session as any)?.userRole === 'admin';
  return { isKeyAuth, isSessionAuth, authorized: isKeyAuth || isSessionAuth };
}

// ─── GET /export ─────────────────────────────────────────────────────────────
// Returns all videos with non-empty transcripts as JSON.
// Dual auth: admin session OR X-Sync-Key header.
router.get('/export', async (req, res) => {
  const { authorized } = isDualAuthed(req);
  if (!authorized) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const allVideos = await db
      .select({
        id: videos.id,
        stepId: videos.stepId,
        workshopType: videos.workshopType,
        title: videos.title,
        transcriptMd: videos.transcriptMd,
      })
      .from(videos)
      .where(ne(videos.transcriptMd, ''));

    return res.json({ success: true, transcripts: allVideos });
  } catch (error: any) {
    console.error('[video-transcripts] Export error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /sync-from ─────────────────────────────────────────────────────────
// Pull transcripts from another environment and update local videos by stepId+workshopType.
router.post('/sync-from', requireAuth, requireAdmin, async (req, res) => {
  const syncKey = process.env.TRAINING_DOC_SYNC_KEY;
  if (!syncKey) {
    return res.status(500).json({
      success: false,
      error: 'TRAINING_DOC_SYNC_KEY not configured — add it to .env to enable sync',
    });
  }

  const { sourceUrl } = req.body;
  if (!sourceUrl || typeof sourceUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'sourceUrl is required' });
  }

  try {
    const cleanUrl = sourceUrl.replace(/\/+$/, '');
    const response = await fetch(
      `${cleanUrl}/api/admin/video-transcripts/export`,
      { headers: { 'X-Sync-Key': syncKey } }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({
        success: false,
        error: `Source returned ${response.status}: ${text.substring(0, 200)}`,
      });
    }

    const data = await response.json() as any;
    if (!data.success || !Array.isArray(data.transcripts)) {
      return res.status(502).json({ success: false, error: 'Invalid response from source' });
    }

    let synced = 0;
    let skipped = 0;
    const errors: Array<{ stepId: string; workshopType: string; error: string }> = [];

    for (const transcript of data.transcripts) {
      try {
        if (!transcript.stepId || !transcript.workshopType) {
          skipped++;
          continue;
        }

        const [localVideo] = await db
          .select({ id: videos.id })
          .from(videos)
          .where(and(
            eq(videos.stepId, transcript.stepId),
            eq(videos.workshopType, transcript.workshopType)
          ))
          .limit(1);

        if (!localVideo) {
          skipped++;
          continue;
        }

        await db
          .update(videos)
          .set({ transcriptMd: transcript.transcriptMd, updatedAt: new Date() })
          .where(eq(videos.id, localVideo.id));

        synced++;
      } catch (err: any) {
        errors.push({ stepId: transcript.stepId, workshopType: transcript.workshopType, error: err.message });
      }
    }

    console.log(`[video-transcripts] Synced ${synced} transcripts from ${sourceUrl} (${skipped} skipped, ${errors.length} errors)`);
    return res.json({ success: true, synced, total: data.transcripts.length, skipped, errors });
  } catch (error: any) {
    console.error('[video-transcripts] Sync error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /push-to ───────────────────────────────────────────────────────────
// Push all local transcripts to another environment.
router.post('/push-to', requireAuth, requireAdmin, async (req, res) => {
  const syncKey = process.env.TRAINING_DOC_SYNC_KEY;
  if (!syncKey) {
    return res.status(500).json({
      success: false,
      error: 'TRAINING_DOC_SYNC_KEY not configured — add it to .env to enable sync',
    });
  }

  const { targetUrl } = req.body;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'targetUrl is required' });
  }

  try {
    const localVideos = await db
      .select({
        id: videos.id,
        stepId: videos.stepId,
        workshopType: videos.workshopType,
        transcriptMd: videos.transcriptMd,
      })
      .from(videos)
      .where(ne(videos.transcriptMd, ''));

    const cleanUrl = targetUrl.replace(/\/+$/, '');
    const results: Array<{ stepId: string | null; status: 'pushed' | 'error'; error?: string }> = [];

    for (const video of localVideos) {
      try {
        const putRes = await fetch(
          `${cleanUrl}/api/admin/video-transcripts/${video.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Sync-Key': syncKey,
            },
            body: JSON.stringify({
              stepId: video.stepId,
              workshopType: video.workshopType,
              transcriptMd: video.transcriptMd,
            }),
          }
        );
        if (!putRes.ok) {
          const text = await putRes.text();
          results.push({ stepId: video.stepId, status: 'error', error: `${putRes.status}: ${text.substring(0, 200)}` });
        } else {
          results.push({ stepId: video.stepId, status: 'pushed' });
        }
      } catch (err: any) {
        results.push({ stepId: video.stepId, status: 'error', error: err.message });
      }
    }

    const pushed = results.filter(r => r.status === 'pushed').length;
    const errors = results.filter(r => r.status === 'error');
    console.log(`[video-transcripts] Pushed ${pushed} transcripts to ${targetUrl} (${errors.length} errors)`);
    return res.json({ success: true, pushed, total: localVideos.length, errors });
  } catch (error: any) {
    console.error('[video-transcripts] Push error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET / ───────────────────────────────────────────────────────────────────
// List all videos with transcript metadata (not full content).
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const allVideos = await db
      .select({
        id: videos.id,
        stepId: videos.stepId,
        workshopType: videos.workshopType,
        title: videos.title,
        transcriptMd: videos.transcriptMd,
        updatedAt: videos.updatedAt,
      })
      .from(videos)
      .orderBy(videos.workshopType, videos.stepId);

    const result = allVideos.map(v => ({
      id: v.id,
      stepId: v.stepId,
      workshopType: v.workshopType,
      title: v.title,
      hasTranscript: v.transcriptMd.length > 0,
      transcriptLength: v.transcriptMd.length,
      updatedAt: v.updatedAt,
    }));

    return res.json({ success: true, videos: result });
  } catch (error: any) {
    console.error('[video-transcripts] List error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /:id ────────────────────────────────────────────────────────────────
// Get full video record including complete transcript.
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid video id' });
    }

    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, id))
      .limit(1);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    return res.json({ success: true, video });
  } catch (error: any) {
    console.error('[video-transcripts] Get error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── PUT /:id ────────────────────────────────────────────────────────────────
// Update transcript. Dual auth: admin session OR X-Sync-Key header.
// When body includes stepId+workshopType (sync mode), match by those instead of URL id.
router.put('/:id', async (req, res) => {
  const { authorized } = isDualAuthed(req);
  if (!authorized) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { transcriptMd, stepId, workshopType } = req.body;

    if (typeof transcriptMd !== 'string') {
      return res.status(400).json({ success: false, error: 'transcriptMd is required' });
    }

    let updated;

    // Sync mode: match by stepId+workshopType instead of URL id
    if (stepId && workshopType) {
      [updated] = await db
        .update(videos)
        .set({ transcriptMd, updatedAt: new Date() })
        .where(and(eq(videos.stepId, stepId), eq(videos.workshopType, workshopType)))
        .returning();
    } else {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid video id' });
      }

      [updated] = await db
        .update(videos)
        .set({ transcriptMd, updatedAt: new Date() })
        .where(eq(videos.id, id))
        .returning();
    }

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    console.log(`[video-transcripts] Updated video ${updated.id} (${updated.stepId}) — ${transcriptMd.length} chars`);
    return res.json({ success: true, video: updated });
  } catch (error: any) {
    console.error('[video-transcripts] Update error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
