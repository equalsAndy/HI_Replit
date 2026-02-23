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
// ENDPOINT: POST /api/ia-interest/submit
// Submit email for Imaginal Agility interest
// ===================================================================
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { email, notes } = req.body;

    console.log(`📧 IA Interest submission from user ${userId}:`, { email, notes: notes ? 'provided' : 'none' });

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Check if email already submitted by this user
    const existingSubmission = await pool.query(
      'SELECT id FROM ia_interest_emails WHERE user_id = $1 AND email = $2',
      [userId, email]
    );

    if (existingSubmission.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'This email has already been submitted'
      });
    }

    // Insert email into database with notes
    const result = await pool.query(
      `INSERT INTO ia_interest_emails (user_id, email, notes)
       VALUES ($1, $2, $3)
       RETURNING id, email, notes, submitted_at`,
      [userId, email, notes || null]
    );

    console.log(`✅ IA Interest email submitted successfully:`, result.rows[0]);

    res.json({
      success: true,
      message: 'Thank you for your interest! We will be in touch.',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error submitting IA interest email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit email'
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/ia-interest/check
// Check if user has already submitted interest
// ===================================================================
router.get('/check', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;

    const result = await pool.query(
      'SELECT email, notes, submitted_at FROM ia_interest_emails WHERE user_id = $1 ORDER BY submitted_at DESC LIMIT 1',
      [userId]
    );

    res.json({
      success: true,
      hasSubmitted: result.rows.length > 0,
      data: result.rows[0] || null
    });

  } catch (error) {
    console.error('❌ Error checking IA interest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check submission status'
    });
  }
});

export default router;
