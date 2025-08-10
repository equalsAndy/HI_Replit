import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all beta tester notes (admin only)
router.get('/admin/notes', requireAuth, async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const notes = await db.execute(`
      SELECT 
        btn.id,
        btn.user_id as userId,
        u.name as userName,
        u.username,
        u.is_beta_tester as isBetaTester,
        btn.workshop_type as workshopType,
        btn.step_id as stepId,
        btn.note_content as noteContent,
        btn.note_type as noteType,
        btn.created_at as createdAt,
        btn.updated_at as updatedAt
      FROM beta_tester_notes btn
      LEFT JOIN users u ON btn.user_id = u.id
      ORDER BY btn.created_at DESC
    `);

    // Handle different response formats
    const notesData = notes.rows || (Array.isArray(notes) ? notes : []);

    res.json({
      success: true,
      notes: notesData
    });

  } catch (error) {
    console.error('Error fetching beta tester notes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch beta tester notes' 
    });
  }
});

// Get beta tester notes for specific user (admin only)
router.get('/admin/user/:userId/notes', requireAuth, async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = parseInt(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const notes = await db.execute(`
      SELECT 
        btn.id,
        btn.user_id as userId,
        btn.workshop_type as workshopType,
        btn.step_id as stepId,
        btn.note_content as noteContent,
        btn.note_type as noteType,
        btn.created_at as createdAt,
        btn.updated_at as updatedAt
      FROM beta_tester_notes btn
      WHERE btn.user_id = $1
      ORDER BY btn.created_at DESC
    `, [userId]);

    // Handle different response formats
    const notesData = notes.rows || (Array.isArray(notes) ? notes : []);

    res.json({
      success: true,
      notes: notesData
    });

  } catch (error) {
    console.error('Error fetching user beta notes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user beta notes' 
    });
  }
});

// Get all beta surveys (admin only)
router.get('/admin/surveys', requireAuth, async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const surveys = await db.execute(`
      SELECT 
        bs.id,
        bs.user_id as userId,
        u.name as userName,
        u.username,
        u.is_beta_tester as isBetaTester,
        bs.quality_rating as qualityRating,
        bs.authenticity_rating as authenticityRating,
        bs.recommendation_rating as recommendationRating,
        bs.rose_response as roseResponse,
        bs.bud_response as budResponse,
        bs.thorn_response as thornResponse,
        bs.professional_application as professionalApplication,
        bs.suggested_improvements as suggestedImprovements,
        bs.interests,
        bs.final_comments as finalComments,
        bs.completed_at as completedAt,
        bs.created_at as createdAt
      FROM beta_surveys bs
      LEFT JOIN users u ON bs.user_id = u.id
      ORDER BY bs.completed_at DESC
    `);

    // Handle different response formats
    const surveysData = surveys.rows || (Array.isArray(surveys) ? surveys : []);

    res.json({
      success: true,
      surveys: surveysData
    });

  } catch (error) {
    console.error('Error fetching beta surveys:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch beta surveys' 
    });
  }
});

// Get beta survey for specific user (admin only)
router.get('/admin/user/:userId/survey', requireAuth, async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = parseInt(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const survey = await db.execute(`
      SELECT 
        bs.id,
        bs.user_id as userId,
        bs.quality_rating as qualityRating,
        bs.authenticity_rating as authenticityRating,
        bs.recommendation_rating as recommendationRating,
        bs.rose_response as roseResponse,
        bs.bud_response as budResponse,
        bs.thorn_response as thornResponse,
        bs.professional_application as professionalApplication,
        bs.suggested_improvements as suggestedImprovements,
        bs.interests,
        bs.final_comments as finalComments,
        bs.completed_at as completedAt,
        bs.created_at as createdAt
      FROM beta_surveys bs
      WHERE bs.user_id = $1
      ORDER BY bs.completed_at DESC
      LIMIT 1
    `, [userId]);

    // Handle different response formats
    const surveyData = survey.rows?.[0] || (Array.isArray(survey) ? survey[0] : survey);

    res.json({
      success: true,
      survey: surveyData || null
    });

  } catch (error) {
    console.error('Error fetching user beta survey:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user beta survey' 
    });
  }
});

// Get combined user list with feedback counts (admin only)
router.get('/admin/users-with-feedback', requireAuth, async (req, res) => {
  try {
    if (req.session?.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await db.execute(`
      SELECT 
        u.id,
        u.name,
        u.username,
        u.is_test_user as isTestUser,
        u.is_beta_tester as isBetaTester,
        COALESCE(f.feedback_count, 0) as feedbackCount,
        COALESCE(btn.notes_count, 0) as notesCount,
        CASE WHEN bs.user_id IS NOT NULL THEN 1 ELSE 0 END as hasSurvey
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) as feedback_count 
        FROM feedback 
        GROUP BY user_id
      ) f ON u.id = f.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as notes_count 
        FROM beta_tester_notes 
        GROUP BY user_id
      ) btn ON u.id = btn.user_id
      LEFT JOIN beta_surveys bs ON u.id = bs.user_id
      WHERE 
        (u.is_test_user = true OR u.is_beta_tester = true)
        AND (
          COALESCE(f.feedback_count, 0) > 0 
          OR COALESCE(btn.notes_count, 0) > 0 
          OR bs.user_id IS NOT NULL
        )
      ORDER BY u.name
    `);

    // Handle different response formats
    const usersData = users.rows || (Array.isArray(users) ? users : []);

    res.json({
      success: true,
      users: usersData
    });

  } catch (error) {
    console.error('Error fetching users with feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users with feedback' 
    });
  }
});

// Submit beta tester note (beta testers only)
router.post('/submit-note', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { workshopType, stepId, noteContent, noteType = 'general' } = req.body;

    if (!noteContent || noteContent.trim().length === 0) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    const result = await db.execute(`
      INSERT INTO beta_tester_notes (user_id, workshop_type, step_id, note_content, note_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at as createdAt
    `, [userId, workshopType, stepId, noteContent.trim(), noteType]);

    // Handle different response formats
    const noteData = result.rows?.[0] || (Array.isArray(result) ? result[0] : result);

    res.json({
      success: true,
      message: 'Beta note submitted successfully',
      note: noteData
    });

  } catch (error) {
    console.error('Error submitting beta note:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit beta note' 
    });
  }
});

// Submit beta survey (beta testers only)
router.post('/submit-survey', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      qualityRating,
      authenticityRating,
      recommendationRating,
      roseResponse,
      budResponse,
      thornResponse,
      professionalApplication,
      suggestedImprovements,
      interests,
      finalComments
    } = req.body;

    // Check if survey already exists for this user
    const existingSurvey = await db.execute(`
      SELECT id FROM beta_surveys WHERE user_id = $1
    `, [userId]);

    const existingData = existingSurvey.rows?.[0] || (Array.isArray(existingSurvey) ? existingSurvey[0] : existingSurvey);

    if (existingData) {
      // Update existing survey
      const result = await db.execute(`
        UPDATE beta_surveys 
        SET 
          quality_rating = $2,
          authenticity_rating = $3,
          recommendation_rating = $4,
          rose_response = $5,
          bud_response = $6,
          thorn_response = $7,
          professional_application = $8,
          suggested_improvements = $9,
          interests = $10,
          final_comments = $11,
          completed_at = NOW()
        WHERE user_id = $1
        RETURNING id, completed_at as completedAt
      `, [
        userId, qualityRating, authenticityRating, recommendationRating,
        roseResponse, budResponse, thornResponse, professionalApplication,
        suggestedImprovements, interests, finalComments
      ]);

      const surveyData = result.rows?.[0] || (Array.isArray(result) ? result[0] : result);

      res.json({
        success: true,
        message: 'Beta survey updated successfully',
        survey: surveyData
      });
    } else {
      // Create new survey
      const result = await db.execute(`
        INSERT INTO beta_surveys (
          user_id, quality_rating, authenticity_rating, recommendation_rating,
          rose_response, bud_response, thorn_response, professional_application,
          suggested_improvements, interests, final_comments
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, completed_at as completedAt
      `, [
        userId, qualityRating, authenticityRating, recommendationRating,
        roseResponse, budResponse, thornResponse, professionalApplication,
        suggestedImprovements, interests, finalComments
      ]);

      const surveyData = result.rows?.[0] || (Array.isArray(result) ? result[0] : result);

      res.json({
        success: true,
        message: 'Beta survey submitted successfully',
        survey: surveyData
      });
    }

  } catch (error) {
    console.error('Error submitting beta survey:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit beta survey' 
    });
  }
});

export default router;