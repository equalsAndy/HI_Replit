/**
 * Beta Tester Notes Routes
 * ========================
 * API endpoints for beta tester workshop feedback notes
 */

import express from 'express';
import { BetaTesterNotesService, BetaTesterNote } from '../services/beta-tester-notes-service.js';

const router = express.Router();


/**
 * Get all beta tester notes for the current user (alias endpoint)
 */
router.get('/my-notes', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a beta tester or admin
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Beta tester access required' });
    }

    const notes = await BetaTesterNotesService.getUserNotes(userId);
    res.json({ success: true, notes });

  } catch (error) {
    console.error('Error getting beta tester notes:', error);
    res.status(500).json({ error: 'Failed to retrieve notes' });
  }
});

/**
 * Get all beta tester notes for the current user
 */
router.get('/notes', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a beta tester or admin
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Beta tester access required' });
    }

    const notes = await BetaTesterNotesService.getUserNotes(userId);
    res.json({ success: true, notes });

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
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify user is a beta tester or admin (admins are also beta testers)
    if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
      console.log('❌ Beta tester access denied for user:', req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
      return res.status(403).json({ error: 'Beta tester access required' });
    }

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
    
    res.json({
      success: true,
      notes: notesArray,
      total: notesArray.length
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

export default router;