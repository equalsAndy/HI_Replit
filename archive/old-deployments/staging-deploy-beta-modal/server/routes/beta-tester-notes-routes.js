import express from 'express';
import { BetaTesterNotesService } from '../services/beta-tester-notes-service.js';
const router = express.Router();
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
        res.json({ success: true, notes });
    }
    catch (error) {
        console.error('Error getting beta tester notes:', error);
        res.status(500).json({ error: 'Failed to retrieve notes' });
    }
});
router.get('/notes', async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Beta tester access required' });
        }
        const notes = await BetaTesterNotesService.getUserNotes(userId);
        res.json({ success: true, notes });
    }
    catch (error) {
        console.error('Error getting beta tester notes:', error);
        res.status(500).json({ error: 'Failed to retrieve notes' });
    }
});
router.put('/:noteId', async (req, res) => {
    try {
        const userId = req.session?.userId;
        const noteId = parseInt(req.params.noteId);
        const { content } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Beta tester access required' });
        }
        if (!content || !noteId) {
            return res.status(400).json({ error: 'Note content and ID required' });
        }
        const updated = await BetaTesterNotesService.updateNote(noteId, userId, content);
        if (updated) {
            res.json({ success: true, message: 'Note updated successfully' });
        }
        else {
            res.status(404).json({ error: 'Note not found or not authorized' });
        }
    }
    catch (error) {
        console.error('Error updating beta tester note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});
router.delete('/:noteId', async (req, res) => {
    try {
        const userId = req.session?.userId;
        const noteId = parseInt(req.params.noteId);
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Beta tester access required' });
        }
        const deleted = await BetaTesterNotesService.deleteNote(noteId, userId);
        if (deleted) {
            res.json({ success: true, message: 'Note deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'Note not found or not authorized' });
        }
    }
    catch (error) {
        console.error('Error deleting beta tester note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});
router.put('/notes/:noteId', async (req, res) => {
    try {
        const userId = req.session?.userId;
        const noteId = parseInt(req.params.noteId);
        const { content } = req.body;
        const noteContent = content;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Beta tester access required' });
        }
        if (!noteContent || !noteId) {
            return res.status(400).json({ error: 'Note content and ID required' });
        }
        const updated = await BetaTesterNotesService.updateNote(noteId, userId, noteContent);
        if (updated) {
            res.json({ success: true, message: 'Note updated successfully' });
        }
        else {
            res.status(404).json({ error: 'Note not found or not authorized' });
        }
    }
    catch (error) {
        console.error('Error updating beta tester note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});
router.delete('/notes/:noteId', async (req, res) => {
    try {
        const userId = req.session?.userId;
        const noteId = parseInt(req.params.noteId);
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Beta tester access required' });
        }
        const deleted = await BetaTesterNotesService.deleteNote(noteId, userId);
        if (deleted) {
            res.json({ success: true, message: 'Note deleted successfully' });
        }
        else {
            res.status(404).json({ error: 'Note not found or not authorized' });
        }
    }
    catch (error) {
        console.error('Error deleting beta tester note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});
router.post('/feedback', async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
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
    }
    catch (error) {
        console.error('Error submitting beta feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});
router.post('/notes', async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
            console.log('❌ Beta tester access denied for user:', req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
            return res.status(403).json({ error: 'Beta tester access required' });
        }
        const noteData = {
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
    }
    catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});
router.get('/notes', async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
            console.log('❌ Beta tester access denied for user:', req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
            return res.status(403).json({ error: 'Beta tester access required' });
        }
        const workshopType = req.query.workshopType;
        const includeSubmitted = req.query.includeSubmitted === 'true';
        const notes = await BetaTesterNotesService.getUserNotes(userId, workshopType, includeSubmitted);
        res.json({
            success: true,
            notes,
            count: notes.length
        });
    }
    catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});
router.get('/notes/summary', async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
            console.log('❌ Beta tester access denied for user:', req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
            return res.status(403).json({ error: 'Beta tester access required' });
        }
        const workshopType = req.query.workshopType;
        const summary = await BetaTesterNotesService.getUserNotesSummary(userId, workshopType);
        const user = req.session?.user;
        const astCompleted = user?.astWorkshopCompleted || false;
        const iaCompleted = user?.iaWorkshopCompleted || false;
        let workshopCompleted = false;
        let primaryWorkshopType;
        if (workshopType) {
            workshopCompleted = workshopType === 'ast' ? astCompleted : iaCompleted;
            primaryWorkshopType = workshopType;
        }
        else {
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
    }
    catch (error) {
        console.error('Get notes summary error:', error);
        res.status(500).json({ error: 'Failed to fetch notes summary' });
    }
});
router.put('/notes/:noteId', async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
            console.log('❌ Beta tester access denied for user:', req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
            return res.status(403).json({ error: 'Beta tester access required' });
        }
        const noteId = parseInt(req.params.noteId);
        if (isNaN(noteId)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }
        const updates = {};
        if (req.body.noteContent !== undefined) {
            updates.noteContent = req.body.noteContent.trim();
        }
        if (req.body.noteType !== undefined) {
            updates.noteType = req.body.noteType;
        }
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
        }
        else {
            res.status(404).json({ error: 'Note not found or not authorized' });
        }
    }
    catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});
router.delete('/notes/:noteId', async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
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
        }
        else {
            res.status(404).json({ error: 'Note not found or not authorized' });
        }
    }
    catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});
router.post('/notes/submit', async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
            console.log('❌ Beta tester access denied for user:', req.session?.userId, { isBetaTester: req.session?.user?.isBetaTester, role: req.session?.user?.role });
            return res.status(403).json({ error: 'Beta tester access required' });
        }
        const workshopType = req.body.workshopType;
        const submittedCount = await BetaTesterNotesService.submitAllUserNotes(userId, workshopType);
        res.json({
            success: true,
            submittedCount,
            message: `Successfully submitted ${submittedCount} notes`
        });
    }
    catch (error) {
        console.error('Submit notes error:', error);
        res.status(500).json({ error: 'Failed to submit notes' });
    }
});
router.get('/feedback-status', async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.session?.user?.isBetaTester && req.session?.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Beta tester access required' });
        }
        const result = await BetaTesterNotesService.checkFeedbackStatus(userId);
        res.json({
            success: true,
            hasSubmittedFeedback: result.hasSubmittedFeedback,
            submittedAt: result.submittedAt
        });
    }
    catch (error) {
        console.error('Check feedback status error:', error);
        res.status(500).json({ error: 'Failed to check feedback status' });
    }
});
export default router;
