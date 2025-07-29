import express from 'express';
import { Pool } from 'pg';
import { requireAuth } from '../middleware/auth.js';
import { astReportService } from '../services/ast-report-service.js';

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ===================================================================
// ENDPOINT: POST /api/ast-reports/generate/:userId
// Generate AST reports for a specific user
// ===================================================================
router.post('/generate/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { regenerate = false } = req.body;

    console.log(`🎯 Generating AST reports for user: ${userId}`);

    // Check if reports already exist (unless regenerating)
    if (!regenerate) {
      const existingReports = await pool.query(`
        SELECT report_type, created_at 
        FROM holistic_reports 
        WHERE user_id = $1 AND report_type IN ('ast_personal', 'ast_professional')
        ORDER BY created_at DESC
      `, [userId]);

      if (existingReports.rows.length >= 2) {
        return res.json({
          success: true,
          message: 'AST reports already exist for this user',
          existing_reports: existingReports.rows,
          regenerate_available: true
        });
      }
    }

    // Get user's AST workshop data
    const userData = await astReportService.getUserASTData(userId);
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found or AST workshop data incomplete'
      });
    }

    // Generate reports
    const reports = await astReportService.generateASTReports(userData);

    // Save reports to database
    await astReportService.saveReports(userId, reports);

    res.json({
      success: true,
      message: 'AST reports generated successfully',
      user_name: userData.userName,
      strengths_signature: reports.metadata.userStrengthsSignature,
      flow_category: reports.metadata.flowCategory,
      context_sources: reports.metadata.contextSources,
      report_lengths: {
        personal: reports.personalReport.length,
        professional: reports.professionalProfile.length
      },
      generated_at: reports.metadata.generatedAt
    });

  } catch (error) {
    console.error('❌ Error generating AST reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AST reports',
      details: error.message
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/ast-reports/:userId
// Get AST reports for a specific user
// ===================================================================
router.get('/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // 'personal', 'professional', or 'both'

    console.log(`📋 Retrieving AST reports for user: ${userId}`);

    let reportTypeFilter = '';
    if (type === 'personal') {
      reportTypeFilter = "AND report_type = 'ast_personal'";
    } else if (type === 'professional') {
      reportTypeFilter = "AND report_type = 'ast_professional'";
    } else {
      reportTypeFilter = "AND report_type IN ('ast_personal', 'ast_professional')";
    }

    const reportsResult = await pool.query(`
      SELECT 
        hr.report_type,
        hr.report_content,
        hr.metadata,
        hr.created_at,
        u.name as user_name
      FROM holistic_reports hr
      JOIN users u ON hr.user_id = u.id
      WHERE hr.user_id = $1 ${reportTypeFilter}
      ORDER BY hr.report_type, hr.created_at DESC
    `, [userId]);

    if (reportsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No AST reports found for this user'
      });
    }

    const reports: any = {};
    reportsResult.rows.forEach(row => {
      const reportType = row.report_type.replace('ast_', '');
      reports[reportType] = {
        content: row.report_content,
        metadata: row.metadata,
        created_at: row.created_at
      };
    });

    res.json({
      success: true,
      user_id: userId,
      user_name: reportsResult.rows[0].user_name,
      reports,
      report_count: reportsResult.rows.length
    });

  } catch (error) {
    console.error('❌ Error retrieving AST reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve AST reports'
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/ast-reports/:userId/download/:type
// Download AST report as formatted text or PDF
// ===================================================================
router.get('/:userId/download/:type', requireAuth, async (req, res) => {
  try {
    const { userId, type } = req.params;
    const { format = 'txt' } = req.query;

    if (!['personal', 'professional'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report type. Must be "personal" or "professional"'
      });
    }

    console.log(`💾 Downloading ${type} AST report for user: ${userId} (format: ${format})`);

    const reportResult = await pool.query(`
      SELECT 
        hr.report_content,
        hr.metadata,
        hr.created_at,
        u.name as user_name
      FROM holistic_reports hr
      JOIN users u ON hr.user_id = u.id
      WHERE hr.user_id = $1 AND hr.report_type = $2
      ORDER BY hr.created_at DESC
      LIMIT 1
    `, [userId, `ast_${type}`]);

    if (reportResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No ${type} AST report found for this user`
      });
    }

    const report = reportResult.rows[0];
    const filename = `${report.user_name.replace(/\s+/g, '_')}_AST_${type}_Report.${format}`;

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'text/plain');

    // For now, return as text (PDF generation can be added later)
    res.send(report.report_content);

  } catch (error) {
    console.error('❌ Error downloading AST report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download AST report'
    });
  }
});

// ===================================================================
// ENDPOINT: DELETE /api/ast-reports/:userId
// Delete AST reports for a user (for regeneration)
// ===================================================================
router.delete('/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🗑️ Deleting AST reports for user: ${userId}`);

    const deleteResult = await pool.query(`
      DELETE FROM holistic_reports 
      WHERE user_id = $1 AND report_type IN ('ast_personal', 'ast_professional')
    `, [userId]);

    res.json({
      success: true,
      message: 'AST reports deleted successfully',
      deleted_count: deleteResult.rowCount
    });

  } catch (error) {
    console.error('❌ Error deleting AST reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete AST reports'
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/ast-reports/list
// List all users with AST reports (admin only)
// ===================================================================
router.get('/list', requireAuth, async (req, res) => {
  try {
    console.log('📊 Listing all users with AST reports');

    const usersWithReports = await pool.query(`
      SELECT 
        u.id,
        u.name,
        COUNT(CASE WHEN hr.report_type = 'ast_personal' THEN 1 END) as personal_reports,
        COUNT(CASE WHEN hr.report_type = 'ast_professional' THEN 1 END) as professional_reports,
        MAX(hr.created_at) as latest_report
      FROM users u
      LEFT JOIN holistic_reports hr ON u.id = hr.user_id 
        AND hr.report_type IN ('ast_personal', 'ast_professional')
      GROUP BY u.id, u.name
      HAVING COUNT(hr.id) > 0
      ORDER BY MAX(hr.created_at) DESC
    `);

    res.json({
      success: true,
      users: usersWithReports.rows,
      total_users: usersWithReports.rows.length
    });

  } catch (error) {
    console.error('❌ Error listing AST reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list AST reports'
    });
  }
});

export default router;