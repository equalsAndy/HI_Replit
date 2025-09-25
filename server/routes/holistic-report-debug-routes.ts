import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Debug endpoint: Get complete report generation data flow
 * GET /api/reports/holistic/debug/:reportId
 * 
 * Returns all data at each transformation step:
 * - Raw database query
 * - Transformer input
 * - Transformer output (sent to OpenAI)
 * - Raw OpenAI response
 * - Final HTML report
 */
router.get('/debug/:reportId', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Debug endpoint not available in production' });
  }

  const { reportId } = req.params;

  try {
    // Get the report from database
    const reportResult = await pool.query(
      `SELECT hr.*, 
              u.id as user_id, u.name as user_name, u.username,
              u.ast_workshop_completed, u.ast_completed_at
       FROM holistic_reports hr
       JOIN users u ON hr.user_id = u.id
       WHERE hr.id = $1`,
      [reportId]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = reportResult.rows[0];
    const userId = report.user_id;

    // Get raw assessment data (Step 1: Database Query)
    const assessmentResult = await pool.query(
      'SELECT * FROM user_assessments WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const stepDataResult = await pool.query(
      'SELECT * FROM workshop_step_data WHERE user_id = $1 ORDER BY step_id, created_at DESC',
      [userId]
    );

    // Build raw database query result
    const rawDatabaseQuery = {
      user: {
        id: report.user_id,
        name: report.user_name,
        username: report.username,
        ast_workshop_completed: report.ast_workshop_completed,
        ast_completed_at: report.ast_completed_at
      },
      assessments: assessmentResult.rows,
      stepData: stepDataResult.rows
    };

    // Build transformer input (Step 2: Data structured for transformer)
    const parsedAssessments: any = {};
    for (const row of assessmentResult.rows) {
      try {
        if (row.assessment_type && row.results) {
          parsedAssessments[row.assessment_type] = JSON.parse(row.results as string);
        }
      } catch (parseError) {
        console.error(`Failed to parse ${row.assessment_type}:`, parseError);
      }
    }

    const transformerInput = {
      userInfo: {
        userName: report.user_name,
        firstName: report.user_name?.split(' ')[0] || report.user_name,
        lastName: report.user_name?.split(' ').slice(1).join(' ') || ''
      },
      assessments: parsedAssessments
    };

    // The transformer output and OpenAI response are in report_data
    let transformerOutput = null;
    let openaiResponse = null;

    if (report.report_data) {
      // report_data is already a string, parse it
      const reportData = typeof report.report_data === 'string' 
        ? JSON.parse(report.report_data) 
        : report.report_data;
      
      // Extract what would have been sent to OpenAI (transformer output)
      // This is reconstructed from the final report data
      transformerOutput = {
        participant_name: reportData.participant?.name,
        report_type: report.report_type,
        strengths: reportData.strengths,
        flow: reportData.flow,
        vision: reportData.vision,
        growth: reportData.growth
      };

      // The OpenAI response is the generated content
      openaiResponse = report.report_type === 'personal' 
        ? reportData.personalReport 
        : reportData.professionalProfile;
    }

    // Return complete debug package
    res.json({
      reportId: report.id,
      userId: report.user_id,
      reportType: report.report_type,
      generationStatus: report.generation_status,
      generatedAt: report.generated_at,
      
      // Step 1: Raw Database Query
      rawDatabaseQuery,
      
      // Step 2: Transformer Input (structured for transformer)
      transformerInput,
      
      // Step 3: Transformer Output (sent to OpenAI)
      transformerOutput,
      
      // Step 4: Raw OpenAI Response
      openaiResponse,
      
      // Step 5: Final HTML Report
      htmlContent: report.html_content,
      
      // Step 6: Complete Report Data
      reportData: report.report_data ? 
        (typeof report.report_data === 'string' ? JSON.parse(report.report_data) : report.report_data) 
        : null
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve debug data',
      message: error.message 
    });
  }
});

export default router;
