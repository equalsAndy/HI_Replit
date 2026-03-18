import { Router, Request, Response } from 'express';
import { pool, authenticateUser } from './workshop-data-shared.js';

const router = Router();

/**
 * Get user's assessment profile (MBTI, Enneagram, CliftonStrengths, DISC)
 * GET /api/workshop-data/assessment-profile
 */
router.get('/assessment-profile', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await pool.query(`
      SELECT
        mbti_familiarity,
        mbti_result,
        enneagram_familiarity,
        enneagram_result,
        clifton_familiarity,
        clifton_result,
        disc_familiarity,
        disc_result,
        created_at,
        updated_at
      FROM user_assessment_profiles
      WHERE user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.json({ profile: null });
    }

    res.json({ profile: result.rows[0] });

  } catch (error) {
    console.error('Error fetching assessment profile:', error);
    res.status(500).json({ error: 'Failed to fetch assessment profile' });
  }
});

/**
 * Save/update user's assessment profile
 * POST /api/workshop-data/assessment-profile
 */
router.post('/assessment-profile', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      mbti_familiarity,
      mbti_result,
      enneagram_familiarity,
      enneagram_result,
      clifton_familiarity,
      clifton_result,
      disc_familiarity,
      disc_result
    } = req.body;

    await pool.query(`
      INSERT INTO user_assessment_profiles (
        user_id,
        mbti_familiarity,
        mbti_result,
        enneagram_familiarity,
        enneagram_result,
        clifton_familiarity,
        clifton_result,
        disc_familiarity,
        disc_result
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id)
      DO UPDATE SET
        mbti_familiarity = EXCLUDED.mbti_familiarity,
        mbti_result = EXCLUDED.mbti_result,
        enneagram_familiarity = EXCLUDED.enneagram_familiarity,
        enneagram_result = EXCLUDED.enneagram_result,
        clifton_familiarity = EXCLUDED.clifton_familiarity,
        clifton_result = EXCLUDED.clifton_result,
        disc_familiarity = EXCLUDED.disc_familiarity,
        disc_result = EXCLUDED.disc_result,
        updated_at = CURRENT_TIMESTAMP
    `, [
      userId,
      mbti_familiarity || '',
      mbti_result || '',
      enneagram_familiarity || '',
      enneagram_result || '',
      clifton_familiarity || '',
      clifton_result || '',
      disc_familiarity || '',
      disc_result || ''
    ]);

    await pool.query(`
      INSERT INTO user_profile_activities (user_id, activity_id, completed)
      VALUES ($1, $2, true)
      ON CONFLICT (user_id, activity_id)
      DO UPDATE SET completed = true, completed_at = CURRENT_TIMESTAMP
    `, [userId, 'add-assessments']);

    res.json({ success: true, message: 'Assessment profile saved successfully' });

  } catch (error) {
    console.error('Error saving assessment profile:', error);
    res.status(500).json({ error: 'Failed to save assessment profile' });
  }
});

/**
 * Get user's profile activity completion states
 * GET /api/workshop-data/profile-activities
 */
router.get('/profile-activities', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await pool.query(`
      SELECT activity_id, completed, completed_at
      FROM user_profile_activities
      WHERE user_id = $1 AND completed = true
    `, [userId]);

    const completedActivities: Record<string, boolean> = {};
    result.rows.forEach((row: any) => {
      completedActivities[row.activity_id] = row.completed;
    });

    res.json({ completedActivities });

  } catch (error) {
    console.error('Error fetching profile activities:', error);
    res.status(500).json({ error: 'Failed to fetch profile activities' });
  }
});

/**
 * Save/update user's WOO assessment results
 * POST /api/workshop-data/woo-results
 */
router.post('/woo-results', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { woa, level, label, responses } = req.body;

    await pool.query(`
      INSERT INTO user_woo_results (
        user_id,
        woa_score,
        woo_level,
        woo_label,
        responses
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id)
      DO UPDATE SET
        woa_score = EXCLUDED.woa_score,
        woo_level = EXCLUDED.woo_level,
        woo_label = EXCLUDED.woo_label,
        responses = EXCLUDED.responses,
        updated_at = CURRENT_TIMESTAMP
    `, [
      userId,
      woa || 0,
      level || 0,
      label || '',
      JSON.stringify(responses || {})
    ]);

    await pool.query(`
      INSERT INTO user_profile_activities (user_id, activity_id, completed)
      VALUES ($1, $2, true)
      ON CONFLICT (user_id, activity_id)
      DO UPDATE SET completed = true, completed_at = CURRENT_TIMESTAMP
    `, [userId, 'woo-assessment']);

    res.json({ success: true, message: 'WOO results saved successfully' });

  } catch (error) {
    console.error('Error saving WOO results:', error);
    res.status(500).json({ error: 'Failed to save WOO results' });
  }
});

/**
 * Get user's WOO assessment results
 * GET /api/workshop-data/woo-results
 */
router.get('/woo-results', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await pool.query(`
      SELECT woa_score, woo_level, woo_label, responses, completed_at
      FROM user_woo_results
      WHERE user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.json({ wooResults: null });
    }

    res.json({
      wooResults: {
        woa: parseFloat(result.rows[0].woa_score),
        level: result.rows[0].woo_level,
        label: result.rows[0].woo_label,
        responses: result.rows[0].responses,
        completedAt: result.rows[0].completed_at
      }
    });

  } catch (error) {
    console.error('Error fetching WOO results:', error);
    res.status(500).json({ error: 'Failed to fetch WOO results' });
  }
});

/**
 * Save/update user's quick start profile
 * POST /api/workshop-data/quick-start-profile
 */
router.post('/quick-start-profile', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId || (req.cookies.userId ? parseInt(req.cookies.userId) : null);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      workStyle,
      workEnvironment,
      communicationStyle,
      meetingPreference,
      primaryInterests,
      learningStyle,
      personalEmail,
      timezone
    } = req.body;

    await pool.query(`
      INSERT INTO user_quick_start_profiles (
        user_id,
        work_style,
        work_environment,
        communication_style,
        meeting_preference,
        primary_interests,
        learning_style,
        personal_email,
        timezone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id)
      DO UPDATE SET
        work_style = EXCLUDED.work_style,
        work_environment = EXCLUDED.work_environment,
        communication_style = EXCLUDED.communication_style,
        meeting_preference = EXCLUDED.meeting_preference,
        primary_interests = EXCLUDED.primary_interests,
        learning_style = EXCLUDED.learning_style,
        personal_email = EXCLUDED.personal_email,
        timezone = EXCLUDED.timezone,
        updated_at = CURRENT_TIMESTAMP
    `, [
      userId,
      workStyle || '',
      workEnvironment || '',
      communicationStyle || '',
      meetingPreference || '',
      JSON.stringify(primaryInterests || []),
      learningStyle || '',
      personalEmail || '',
      timezone || ''
    ]);

    await pool.query(`
      INSERT INTO user_profile_activities (user_id, activity_id, completed)
      VALUES ($1, $2, true)
      ON CONFLICT (user_id, activity_id)
      DO UPDATE SET completed = true, completed_at = CURRENT_TIMESTAMP
    `, [userId, 'quick-start']);

    res.json({ success: true, message: 'Quick start profile saved successfully' });

  } catch (error) {
    console.error('Error saving quick start profile:', error);
    res.status(500).json({ error: 'Failed to save quick start profile' });
  }
});

export default router;
