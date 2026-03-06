/**
 * Beta Tester Notes Routes
 * ========================
 * API endpoints for beta tester workshop feedback notes
 */

import express from 'express';
import { BetaTesterNotesService, BetaTesterNote } from '../services/beta-tester-notes-service.js';

const router = express.Router();

// Lightweight request logging for QA (dev/staging only)
const notesLoggingEnabled = (process.env.FEATURE_LOG_API === 'true') || (process.env.NODE_ENV !== 'production');
router.use((req, res, next) => {
  if (!notesLoggingEnabled) return next();
  const start = Date.now();
  const userId = (req.session as any)?.userId;
  const preview: Record<string, any> = {};
  try {
    if (req.method === 'POST' || req.method === 'PUT') {
      const body: any = req.body || {};
      preview.workshopType = body.workshopType;
      preview.noteType = body.noteType;
      if (typeof body.noteContent === 'string') preview.noteLen = body.noteContent.length;
    }
    if (req.method === 'GET') {
      preview.includeSubmitted = req.query?.includeSubmitted;
      preview.workshopType = req.query?.workshopType;
    }
  } catch {}
  console.log('📝 [beta-notes]', {
    method: req.method,
    path: req.originalUrl || req.url,
    userId,
    ...preview,
  });
  res.on('finish', () => {
    console.log('✅ [beta-notes]', {
      status: res.statusCode,
      ms: Date.now() - start,
    });
  });
  next();
});

/**
 * Helper function to verify beta tester access with database fallback
 */
async function verifyBetaTesterAccess(req: express.Request, res: express.Response): Promise<boolean> {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      console.log('❌ No userId in session');
      res.status(401).json({ error: 'Authentication required' });
      return false;
    }

    // Check session data first
    let isBetaTester = (req.session as any)?.user?.isBetaTester;
    let userRole = (req.session as any)?.user?.role;

    console.log('🔍 Initial session check for user', userId, ':', { isBetaTester, userRole, hasUserObject: !!(req.session as any)?.user });

    // If session data is incomplete, fetch from database
    if (isBetaTester === undefined || userRole === undefined) {
      console.log('🔍 Session data incomplete for user', userId, '- fetching from database');
      try {
        const { userManagementService } = await import('../services/user-management-service.js');
        const userResult = await userManagementService.getUserById(userId);

        console.log('🔍 Database fetch result:', { success: userResult.success, hasUser: !!userResult.user });

        if (userResult.success && userResult.user) {
          isBetaTester = userResult.user.isBetaTester;
          userRole = userResult.user.role;
          // Update session with fresh data
          (req.session as any).user = { ...(req.session as any)?.user, ...userResult.user };
          console.log('✅ Updated session with fresh user data:', { isBetaTester, userRole });

          // Save the updated session
          await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
              if (err) {
                console.error('⚠️ Failed to save session after updating user data:', err);
                reject(err);
              } else {
                console.log('✅ Session saved successfully');
                resolve();
              }
            });
          });
        } else {
          console.log('❌ Failed to fetch user data from database:', userResult.error);
        }
      } catch (dbError) {
        console.error('❌ Error fetching user from database:', dbError);
      }
    }

    // Check access
    if (!isBetaTester && userRole !== 'admin') {
      console.log('❌ Beta tester access denied for user:', userId, { isBetaTester, role: userRole });
      res.status(403).json({
        error: 'Beta tester access required',
        debug: { userId, isBetaTester, userRole }
      });
      return false;
    }

    console.log('✅ Beta tester access granted for user:', userId, { isBetaTester, role: userRole });
    return true;
  } catch (error) {
    console.error('❌ Error in verifyBetaTesterAccess:', error);
    res.status(500).json({ error: 'Failed to verify access' });
    return false;
  }
}


/**
 * Get all beta tester notes for the current user (alias endpoint)
 * Uses the same service and access checks as the main /notes route.
 */
router.get('/my-notes', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Beta tester access required' });
    }

    const notes = await BetaTesterNotesService.getUserNotes(userId);
    res.json({ success: true, notes, count: notes.length });

  } catch (error) {
    console.error('Error getting beta tester notes:', error);
    res.status(500).json({ error: 'Failed to retrieve notes' });
  }
});

/**
 * Update a specific beta tester note by ID
 */
router.put('/:noteId', async (req, res) => {
  try {
    const userId = req.session?.userId;
    const noteId = parseInt(req.params.noteId);
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a beta tester or admin
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Beta tester access required' });
    }

    if (!content || !noteId) {
      return res.status(400).json({ error: 'Note content and ID required' });
    }

    const updated = await BetaTesterNotesService.updateNote(noteId, userId, content);
    if (updated) {
      res.json({ success: true, message: 'Note updated successfully' });
    } else {
      res.status(404).json({ error: 'Note not found or not authorized' });
    }

  } catch (error) {
    console.error('Error updating beta tester note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

/**
 * Delete a specific beta tester note by ID
 */
router.delete('/:noteId', async (req, res) => {
  try {
    const userId = req.session?.userId;
    const noteId = parseInt(req.params.noteId);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a beta tester or admin
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Beta tester access required' });
    }

    const deleted = await BetaTesterNotesService.deleteNote(noteId, userId);
    if (deleted) {
      res.json({ success: true, message: 'Note deleted successfully' });
    } else {
      res.status(404).json({ error: 'Note not found or not authorized' });
    }

  } catch (error) {
    console.error('Error deleting beta tester note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

/**
 * Update a beta tester note (legacy)
 */
router.put('/notes/:noteId', async (req, res) => {
  try {
    const userId = req.session?.userId;
    const noteId = parseInt(req.params.noteId);
    const { content } = req.body;
    const noteContent = content;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a beta tester or admin
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Beta tester access required' });
    }

    if (!noteContent || !noteId) {
      return res.status(400).json({ error: 'Note content and ID required' });
    }

    const updated = await BetaTesterNotesService.updateNote(noteId, userId, noteContent);
    if (updated) {
      res.json({ success: true, message: 'Note updated successfully' });
    } else {
      res.status(404).json({ error: 'Note not found or not authorized' });
    }

  } catch (error) {
    console.error('Error updating beta tester note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

/**
 * Delete a beta tester note
 */
router.delete('/notes/:noteId', async (req, res) => {
  try {
    const userId = req.session?.userId;
    const noteId = parseInt(req.params.noteId);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a beta tester or admin
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Beta tester access required' });
    }

    const deleted = await BetaTesterNotesService.deleteNote(noteId, userId);
    if (deleted) {
      res.json({ success: true, message: 'Note deleted successfully' });
    } else {
      res.status(404).json({ error: 'Note not found or not authorized' });
    }

  } catch (error) {
    console.error('Error deleting beta tester note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

/**
 * Submit final beta feedback survey
 */
router.post('/feedback', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a beta tester or admin
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Beta tester access required' });
    }

    const feedbackData = {
      userId,
      overallQuality: req.body.overallQuality,
      authenticity: req.body.authenticity,
      recommendation: req.body.recommendation,
      rose: req.body.rose,
      bud: req.body.bud,
      thorn: req.body.thorn,
      professionalApplication: req.body.professionalApplication,
      improvements: req.body.improvements,
      interests: req.body.interests,
      finalComments: req.body.finalComments,
      submittedAt: new Date()
    };

    const feedbackId = await BetaTesterNotesService.submitFinalFeedback(feedbackData);
    res.json({ success: true, feedbackId, message: 'Feedback submitted successfully' });

  } catch (error) {
    console.error('Error submitting beta feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

/**
 * Create a new beta tester note
 */
router.post('/notes', async (req, res) => {
  try {
    // Use helper function for beta tester access verification
    const hasAccess = await verifyBetaTesterAccess(req, res);
    if (!hasAccess) return; // Response already sent by helper
    
    const userId = (req.session as any)?.userId;

    const noteData: BetaTesterNote = {
      userId,
      workshopType: req.body.workshopType,
      pageTitle: req.body.pageTitle,
      stepId: req.body.stepId,
      moduleName: req.body.moduleName,
      questionContext: req.body.questionContext,
      urlPath: req.body.urlPath,
      noteContent: req.body.noteContent,
      noteType: req.body.noteType,
      browserInfo: req.body.browserInfo,
      systemInfo: req.body.systemInfo
    };

    // Validate required fields
    if (!noteData.noteContent?.trim()) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    if (!noteData.pageTitle?.trim()) {
      return res.status(400).json({ error: 'Page title is required' });
    }

    if (!['ast', 'ia'].includes(noteData.workshopType)) {
      return res.status(400).json({ error: 'Invalid workshop type' });
    }

    const noteId = await BetaTesterNotesService.createNote(noteData);

    res.status(201).json({ 
      success: true, 
      noteId,
      message: 'Note created successfully' 
    });

  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

/**
 * Get all notes for current user
 */
router.get('/notes', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a beta tester or admin (admins are also beta testers)
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      console.log('❌ Beta tester access denied for user:', req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
      return res.status(403).json({ error: 'Beta tester access required' });
    }

    const workshopType = req.query.workshopType as 'ast' | 'ia' | undefined;
    const includeSubmitted = req.query.includeSubmitted === 'true';

    const notes = await BetaTesterNotesService.getUserNotes(
      userId, 
      workshopType,
      includeSubmitted
    );

    res.json({ 
      success: true, 
      notes,
      count: notes.length
    });

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

/**
 * Get notes summary for current user with workshop completion status
 */
router.get('/notes/summary', async (req, res) => {
  try {
    // Use helper function for beta tester access verification
    const hasAccess = await verifyBetaTesterAccess(req, res);
    if (!hasAccess) return; // Response already sent by helper

    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const workshopType = req.query.workshopType as 'ast' | 'ia' | undefined;
    
    const summary = await BetaTesterNotesService.getUserNotesSummary(userId, workshopType);
    
    // Check workshop completion status from user session data
    const user = req.session?.user;
    const astCompleted = user?.astWorkshopCompleted || false;
    const iaCompleted = user?.iaWorkshopCompleted || false;
    
    // Determine primary workshop type and completion status
    let workshopCompleted = false;
    let primaryWorkshopType: 'ast' | 'ia' | undefined;
    
    if (workshopType) {
      workshopCompleted = workshopType === 'ast' ? astCompleted : iaCompleted;
      primaryWorkshopType = workshopType;
    } else {
      // Auto-detect based on most recent activity or completion
      if (astCompleted || iaCompleted) {
        workshopCompleted = true;
        primaryWorkshopType = astCompleted ? 'ast' : 'ia';
      }
    }

    res.json({ 
      success: true, 
      ...summary,
      workshopCompleted,
      primaryWorkshopType,
      astCompleted,
      iaCompleted
    });

  } catch (error) {
    console.error('Get notes summary error:', error);
    res.status(500).json({ error: 'Failed to fetch notes summary' });
  }
});

/**
 * Update a note
 */
router.put('/notes/:noteId', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a beta tester or admin (admins are also beta testers)
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      console.log('❌ Beta tester access denied for user:', req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
      return res.status(403).json({ error: 'Beta tester access required' });
    }

    const noteId = parseInt(req.params.noteId);
    if (isNaN(noteId)) {
      return res.status(400).json({ error: 'Invalid note ID' });
    }

    const updates: Partial<BetaTesterNote> = {};
    
    if (req.body.noteContent !== undefined) {
      updates.noteContent = req.body.noteContent.trim();
    }
    
    if (req.body.noteType !== undefined) {
      updates.noteType = req.body.noteType;
    }

    // Validate note content if being updated
    if (updates.noteContent !== undefined && !updates.noteContent) {
      return res.status(400).json({ error: 'Note content cannot be empty' });
    }

    const success = updates.noteContent !== undefined 
      ? await BetaTesterNotesService.updateNote(noteId, userId, updates.noteContent)
      : await BetaTesterNotesService.updateNoteAdvanced(noteId, userId, updates);

    if (success) {
      res.json({ 
        success: true, 
        message: 'Note updated successfully' 
      });
    } else {
      res.status(404).json({ error: 'Note not found or not authorized' });
    }

  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

/**
 * Delete a note
 */
router.delete('/notes/:noteId', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a beta tester or admin (admins are also beta testers)
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      console.log('❌ Beta tester access denied for user:', req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
      return res.status(403).json({ error: 'Beta tester access required' });
    }

    const noteId = parseInt(req.params.noteId);
    if (isNaN(noteId)) {
      return res.status(400).json({ error: 'Invalid note ID' });
    }

    const success = await BetaTesterNotesService.deleteNote(noteId, userId);

    if (success) {
      res.json({ 
        success: true, 
        message: 'Note deleted successfully' 
      });
    } else {
      res.status(404).json({ error: 'Note not found or not authorized' });
    }

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

/**
 * Submit all notes
 */
router.post('/notes/submit', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a beta tester or admin (admins are also beta testers)
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      console.log('❌ Beta tester access denied for user:', req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
      return res.status(403).json({ error: 'Beta tester access required' });
    }

    const workshopType = req.body.workshopType as 'ast' | 'ia' | undefined;
    
    const submittedCount = await BetaTesterNotesService.submitAllUserNotes(userId, workshopType);

    res.json({ 
      success: true, 
      submittedCount,
      message: `Successfully submitted ${submittedCount} notes` 
    });

  } catch (error) {
    console.error('Submit notes error:', error);
    res.status(500).json({ error: 'Failed to submit notes' });
  }
});

/**
 * Check if user has already submitted final feedback
 */
router.get('/feedback-status', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a beta tester or admin
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Beta tester access required' });
    }

    // Check if feedback already submitted
    const result = await BetaTesterNotesService.checkFeedbackStatus(userId);

    res.json({ 
      success: true, 
      hasSubmittedFeedback: result.hasSubmittedFeedback,
      submittedAt: result.submittedAt
    });

  } catch (error) {
    console.error('Check feedback status error:', error);
    res.status(500).json({ error: 'Failed to check feedback status' });
  }
});

/**
 * Admin endpoint - Get all beta tester notes
 */
router.get('/admin/notes', async (req, res) => {
  try {
    // Check if user is admin
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { db } = await import('../db.js');

    // Get all beta tester notes with user information using raw SQL
    const notes = await db.execute(`
      SELECT 
        btn.id,
        btn.user_id as userId,
        u.name as userName,
        u.username,
        btn.workshop_type as workshopType,
        btn.page_title as pageTitle,
        btn.step_id as stepId,
        btn.module_name as moduleName,
        btn.question_context as questionContext,
        btn.url_path as urlPath,
        btn.note_content as noteContent,
        btn.note_type as noteType,
        btn.created_at as createdAt,
        btn.updated_at as updatedAt,
        btn.submitted_at as submittedAt
      FROM beta_tester_notes btn
      LEFT JOIN users u ON btn.user_id = u.id
      ORDER BY btn.created_at DESC
    `);

    console.log('📊 Beta notes query result:', {
      type: typeof notes,
      isArray: Array.isArray(notes),
      hasRows: !!notes.rows,
      rowsLength: notes.rows?.length,
      directLength: Array.isArray(notes) ? notes.length : 'not array',
      keys: Object.keys(notes || {})
    });

    const notesArray = notes.rows || (Array.isArray(notes) ? notes : []);
    
    // Ensure proper field mapping for frontend compatibility
    const mappedNotes = notesArray.map((note: any) => ({
      id: note.id,
      userId: note.userId || note.userid || note.user_id,
      userName: note.userName || note.username || note.user_name,
      username: note.username,
      workshopType: note.workshopType || note.workshoptype || note.workshop_type,
      pageTitle: note.pageTitle || note.pagetitle || note.page_title,
      stepId: note.stepId || note.stepid || note.step_id,
      moduleName: note.moduleName || note.modulename || note.module_name,
      questionContext: note.questionContext || note.questioncontext || note.question_context,
      urlPath: note.urlPath || note.urlpath || note.url_path,
      noteContent: note.noteContent || note.notecontent || note.note_content,
      noteType: note.noteType || note.notetype || note.note_type,
      createdAt: note.createdAt || note.createdat || note.created_at,
      updatedAt: note.updatedAt || note.updatedat || note.updated_at,
      submittedAt: note.submittedAt || note.submittedat || note.submitted_at
    }));
    
    res.json({
      success: true,
      notes: mappedNotes,
      total: mappedNotes.length
    });

  } catch (error) {
    console.error('Error fetching admin beta notes:', error);
    res.status(500).json({ error: 'Failed to fetch beta tester notes' });
  }
});

/**
 * Admin endpoint - Get all beta feedback surveys
 */
router.get('/admin/surveys', async (req, res) => {
  try {
    // Check if user is admin
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { db } = await import('../db.js');
    const { users } = await import('../../shared/schema.js');
    const { desc, eq } = await import('drizzle-orm');

    // Get all beta feedback surveys with user information
    const surveys = await db.execute(`
      SELECT 
        bfs.id,
        bfs.user_id,
        u.name as user_name,
        u.username,
        bfs.overall_quality,
        bfs.authenticity,
        bfs.recommendation,
        bfs.rose,
        bfs.bud,
        bfs.thorn,
        bfs.professional_application,
        bfs.improvements,
        bfs.interests,
        bfs.final_comments,
        bfs.submitted_at,
        bfs.created_at
      FROM beta_feedback_surveys bfs
      LEFT JOIN users u ON bfs.user_id = u.id
      ORDER BY bfs.submitted_at DESC
    `);

    console.log('📊 Beta surveys query result:', {
      type: typeof surveys,
      isArray: Array.isArray(surveys),
      hasRows: !!surveys.rows,
      rowsLength: surveys.rows?.length,
      directLength: Array.isArray(surveys) ? surveys.length : 'not array',
      keys: Object.keys(surveys || {})
    });

    const surveysArray = surveys.rows || (Array.isArray(surveys) ? surveys : []);

    res.json({
      success: true,
      surveys: surveysArray,
      total: surveysArray.length
    });

  } catch (error) {
    console.error('Error fetching admin beta surveys:', error);
    res.status(500).json({ error: 'Failed to fetch beta feedback surveys' });
  }
});

/**
 * Admin - Export all beta feedback surveys to CSV
 */
router.get('/admin/surveys/export/csv', async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { db } = await import('../db.js');

    const result: any = await db.execute(`
      SELECT 
        bfs.id,
        bfs.user_id,
        u.name as user_name,
        u.username,
        bfs.overall_quality,
        bfs.authenticity,
        bfs.recommendation,
        bfs.rose,
        bfs.bud,
        bfs.thorn,
        bfs.professional_application,
        bfs.improvements,
        bfs.interests,
        bfs.final_comments,
        bfs.submitted_at,
        bfs.created_at
      FROM beta_feedback_surveys bfs
      LEFT JOIN users u ON bfs.user_id = u.id
      ORDER BY bfs.submitted_at DESC
    `);

    const rows = result.rows || (Array.isArray(result) ? result : []);

    const headers = [
      'ID','User ID','User Name','Username','Overall','Authenticity','Recommendation',
      'Rose','Bud','Thorn','Professional Application','Improvements','Interests','Final Comments','Submitted At','Created At'
    ];

    const csv = [
      headers.join(','),
      ...rows.map((r: any) => [
        r.id,
        r.user_id,
        quoteCsv(r.user_name),
        quoteCsv(r.username),
        r.overall_quality,
        r.authenticity,
        r.recommendation,
        quoteCsv(r.rose),
        quoteCsv(r.bud),
        quoteCsv(r.thorn),
        quoteCsv(r.professional_application),
        quoteCsv(r.improvements),
        quoteCsv(Array.isArray(r.interests) ? r.interests.join('; ') : r.interests),
        quoteCsv(r.final_comments),
        r.submitted_at ? new Date(r.submitted_at).toISOString() : '',
        r.created_at ? new Date(r.created_at).toISOString() : ''
      ].join(','))
    ].join('\n');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `beta-feedback-surveys-${timestamp}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting beta surveys to CSV:', error);
    res.status(500).json({ error: 'Failed to export beta feedback surveys' });
  }
});

function quoteCsv(value: unknown) {
  if (value === null || value === undefined) return '';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Admin bulk delete of beta feedback surveys
 */
router.delete('/admin/surveys/bulk/delete', async (req, res) => {
  try {
    // Check admin
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const surveyIds = (req.body?.surveyIds || []) as number[];
    if (!Array.isArray(surveyIds) || surveyIds.length === 0) {
      return res.status(400).json({ error: 'surveyIds array is required' });
    }

    const { db } = await import('../db.js');
    const { sql } = await import('drizzle-orm');

    // Delete one-by-one to avoid array parameter issues
    let deletedCount = 0;
    for (const id of surveyIds) {
      if (typeof id !== 'number' || !Number.isFinite(id)) continue;
      const res: any = await db.execute(sql`DELETE FROM beta_feedback_surveys WHERE id = ${id}`);
      if (res && typeof res.rowCount === 'number') {
        deletedCount += res.rowCount;
      } else if (Array.isArray(res)) {
        deletedCount += res.length; // fallback for drivers returning arrays
      }
    }

    console.log('🗑️ Admin bulk deleted beta surveys:', {
      requested: surveyIds.length,
      deleted: deletedCount ?? 'unknown',
      sampleIds: surveyIds.slice(0, 5)
    });

    res.json({ success: true, deletedCount: deletedCount ?? surveyIds.length });
  } catch (error) {
    console.error('Error bulk deleting beta surveys:', error);
    res.status(500).json({ error: 'Failed to bulk delete beta surveys' });
  }
});

export default router;
