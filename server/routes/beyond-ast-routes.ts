/**
 * Beyond AST Routes
 * ==================
 * API endpoints for managing user interests in Beyond AST features
 */

import express from 'express';
import { Pool } from 'pg';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ===================================================================
// ENDPOINT: GET /api/beyond-ast/interests/:userId
// Get user's Beyond AST interests
// ===================================================================
router.get('/interests/:userId', requireAuth, async (req, res) => {
  try {
    const { userId: urlUserId } = req.params;
    const sessionUserId = req.session?.userId;

    // SECURITY: Validate authenticated user matches the userId in URL
    if (!sessionUserId || sessionUserId.toString() !== urlUserId) {
      console.log(`❌ SECURITY: User ${sessionUserId} attempted to access interests for user ${urlUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only view your own interests'
      });
    }

    const userId = sessionUserId;

    const result = await pool.query(`
      SELECT *
      FROM user_beyond_ast_interests
      WHERE user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        interests: null
      });
    }

    res.json({
      success: true,
      interests: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error fetching Beyond AST interests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch interests'
    });
  }
});

// ===================================================================
// ENDPOINT: POST /api/beyond-ast/interests/:userId
// Save user's Beyond AST interests
// ===================================================================
router.post('/interests/:userId', requireAuth, async (req, res) => {
  try {
    const { userId: urlUserId } = req.params;
    const sessionUserId = req.session?.userId;

    // SECURITY: Validate authenticated user matches the userId in URL
    if (!sessionUserId || sessionUserId.toString() !== urlUserId) {
      console.log(`❌ SECURITY: User ${sessionUserId} attempted to save interests for user ${urlUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only save your own interests'
      });
    }

    const userId = sessionUserId;
    const {
      interest_about_me_page,
      interest_other_assessments,
      interest_mbti,
      interest_enneagram,
      interest_clifton_strengths,
      interest_disc,
      interest_other_assessment_names,
      interest_ai_coach,
      preferred_email
    } = req.body;

    // Upsert (insert or update) the interests
    const result = await pool.query(`
      INSERT INTO user_beyond_ast_interests (
        user_id,
        interest_about_me_page,
        interest_other_assessments,
        interest_mbti,
        interest_enneagram,
        interest_clifton_strengths,
        interest_disc,
        interest_other_assessment_names,
        interest_ai_coach,
        preferred_email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id)
      DO UPDATE SET
        interest_about_me_page = EXCLUDED.interest_about_me_page,
        interest_other_assessments = EXCLUDED.interest_other_assessments,
        interest_mbti = EXCLUDED.interest_mbti,
        interest_enneagram = EXCLUDED.interest_enneagram,
        interest_clifton_strengths = EXCLUDED.interest_clifton_strengths,
        interest_disc = EXCLUDED.interest_disc,
        interest_other_assessment_names = EXCLUDED.interest_other_assessment_names,
        interest_ai_coach = EXCLUDED.interest_ai_coach,
        preferred_email = EXCLUDED.preferred_email,
        updated_at = NOW()
      RETURNING *
    `, [
      userId,
      interest_about_me_page || false,
      interest_other_assessments || false,
      interest_mbti || false,
      interest_enneagram || false,
      interest_clifton_strengths || false,
      interest_disc || false,
      interest_other_assessment_names || null,
      interest_ai_coach || false,
      preferred_email || null
    ]);

    console.log(`✅ Saved Beyond AST interests for user ${userId}`);

    res.json({
      success: true,
      interests: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error saving Beyond AST interests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save interests'
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/beyond-ast/emails/:userId
// Get all email addresses for a user (for selection in AST 5-3)
// ===================================================================
router.get('/emails/:userId', requireAuth, async (req, res) => {
  try {
    const { userId: urlUserId } = req.params;
    const sessionUserId = req.session?.userId;

    // SECURITY: Validate authenticated user matches the userId in URL
    if (!sessionUserId || sessionUserId.toString() !== urlUserId) {
      console.log(`❌ SECURITY: User ${sessionUserId} attempted to access emails for user ${urlUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only view your own email addresses'
      });
    }

    const userId = sessionUserId;

    // Get user's primary email from users table
    const userResult = await pool.query(`
      SELECT email
      FROM users
      WHERE id = $1
    `, [userId]);

    // Get preferred email from beyond_ast_interests if exists
    const interestsResult = await pool.query(`
      SELECT preferred_email
      FROM user_beyond_ast_interests
      WHERE user_id = $1
    `, [userId]);

    const emails = [];

    if (userResult.rows[0]?.email) {
      emails.push({
        email: userResult.rows[0].email,
        label: 'Primary Email',
        isPrimary: true
      });
    }

    if (interestsResult.rows[0]?.preferred_email &&
        interestsResult.rows[0].preferred_email !== userResult.rows[0]?.email) {
      emails.push({
        email: interestsResult.rows[0].preferred_email,
        label: 'Additional Email',
        isPrimary: false
      });
    }

    res.json({
      success: true,
      emails
    });

  } catch (error) {
    console.error('❌ Error fetching user emails:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emails'
    });
  }
});

export default router;
