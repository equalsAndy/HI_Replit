import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all feedback (admin only)
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const feedback = await db.execute(`
      SELECT 
        f.id,
        f.user_id as userId,
        u.name as userName,
        u.username,
        u.is_test_user as isTestUser,
        f.page_context as pageContext,
        f.feedback_text as feedbackText,
        f.priority_level as priorityLevel,
        f.status,
        f.created_at as createdAt,
        f.updated_at as updatedAt
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
    `);

    // Handle different response formats
    const feedbackData = feedback.rows || (Array.isArray(feedback) ? feedback : []);

    res.json({
      success: true,
      feedback: feedbackData
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch feedback' 
    });
  }
});

// Get feedback for specific user (admin only)
router.get('/admin/user/:userId', requireAuth, async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = parseInt(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const feedback = await db.execute(`
      SELECT 
        f.id,
        f.user_id as userId,
        f.page_context as pageContext,
        f.feedback_text as feedbackText,
        f.priority_level as priorityLevel,
        f.status,
        f.created_at as createdAt,
        f.updated_at as updatedAt
      FROM feedback f
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `, [userId]);

    // Handle different response formats
    const feedbackData = feedback.rows || (Array.isArray(feedback) ? feedback : []);

    res.json({
      success: true,
      feedback: feedbackData
    });

  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user feedback' 
    });
  }
});

// Create new feedback (authenticated users)
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { pageContext, feedbackText, priorityLevel = 'medium' } = req.body;

    if (!feedbackText || feedbackText.trim().length === 0) {
      return res.status(400).json({ error: 'Feedback text is required' });
    }

    const result = await db.execute(`
      INSERT INTO feedback (user_id, page_context, feedback_text, priority_level, status)
      VALUES ($1, $2, $3, $4, 'open')
      RETURNING id, created_at as createdAt
    `, [userId, pageContext, feedbackText.trim(), priorityLevel]);

    // Handle different response formats
    const feedbackData = result.rows?.[0] || (Array.isArray(result) ? result[0] : result);

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: feedbackData
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit feedback' 
    });
  }
});

// Update feedback status (admin only)
router.patch('/admin/:feedbackId/status', requireAuth, async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const feedbackId = parseInt(req.params.feedbackId);
    const { status } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await db.execute(`
      UPDATE feedback 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, status, updated_at as updatedAt
    `, [status, feedbackId]);

    // Handle different response formats
    const feedbackData = result.rows?.[0] || (Array.isArray(result) ? result[0] : result);

    if (!feedbackData) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({
      success: true,
      message: 'Feedback status updated successfully',
      feedback: feedbackData
    });

  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update feedback status' 
    });
  }
});

// Delete feedback (admin only)
router.delete('/admin/:feedbackId', requireAuth, async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const feedbackId = parseInt(req.params.feedbackId);

    const result = await db.execute(`
      DELETE FROM feedback WHERE id = $1 RETURNING id
    `, [feedbackId]);

    // Handle different response formats
    const deletedData = result.rows?.[0] || (Array.isArray(result) ? result[0] : result);

    if (!deletedData) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete feedback' 
    });
  }
});

export default router;