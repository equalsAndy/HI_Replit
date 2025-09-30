/**
 * AST Sectional Reports Routes
 * ============================
 * API endpoints for section-by-section AST report generation with progress tracking
 * and individual section management capabilities.
 */

import express from 'express';
import { Pool } from 'pg';
import { requireAuth } from '../middleware/auth.js';
import { astSectionalReportService } from '../services/ast-sectional-report-service.js';

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ===================================================================
// ENDPOINT: POST /api/ast-sectional-reports/generate/:userId
// Initiate section-by-section AST report generation
// ===================================================================
router.post('/generate/:userId', requireAuth, async (req, res) => {
  try {
    const { userId: urlUserId } = req.params;
    const sessionUserId = req.session?.userId;

    // SECURITY: Validate authenticated user matches the userId in URL
    if (!sessionUserId || sessionUserId.toString() !== urlUserId) {
      console.log(`❌ SECURITY: User ${sessionUserId} attempted to generate report for user ${urlUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only generate reports for your own account'
      });
    }

    const userId = sessionUserId; // Use session userId for all operations
    const {
      reportType = 'ast_personal',
      regenerate = false,
      specificSections = null,
      qualityThreshold = 0.8
    } = req.body;

    console.log(`🚀 Initiating sectional report generation for user: ${userId}, type: ${reportType}`);

    // Validate report type
    if (!['ast_personal', 'ast_professional'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report type. Must be "ast_personal" or "ast_professional"'
      });
    }

    // Validate specific sections if provided
    if (specificSections && (!Array.isArray(specificSections) ||
        !specificSections.every(s => Number.isInteger(s) && s >= 0 && s <= 5))) {
      return res.status(400).json({
        success: false,
        error: 'specificSections must be an array of integers between 0 and 5'
      });
    }

    // Initiate generation
    const result = await astSectionalReportService.initiateReportGeneration(userId, reportType, {
      regenerate,
      specificSections,
      qualityThreshold
    });

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        report_id: result.reportId,
        user_id: userId,
        report_type: reportType,
        generation_mode: 'sectional',
        initiated_at: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message,
        report_id: result.reportId
      });
    }

  } catch (error) {
    console.error('❌ Error initiating sectional report generation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate sectional report generation',
      details: error.message
    });
  }
});

// ===================================================================
// DEBUG ENDPOINT: POST /api/ast-sectional-reports/debug-generate/:userId
// DEBUG ONLY - Initiate section-by-section generation without auth (development only)
// ===================================================================
if (process.env.NODE_ENV === 'development') {
  router.post('/debug-generate/:userId', async (req, res) => {
    try {
      console.log('🐛 DEBUG: Bypassing authentication for sectional report generation');
      const { userId } = req.params;
      const {
        reportType = 'ast_personal',
        regenerate = false,
        specificSections,
        qualityThreshold
      } = req.body;

      console.log(`🚀 DEBUG: Initiating sectional report generation for user: ${userId}, type: ${reportType}`);

      // Validate report type
      if (!['ast_personal', 'ast_professional'].includes(reportType)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid report type. Must be "ast_personal" or "ast_professional"'
        });
      }

      const result = await astSectionalReportService.initiateReportGeneration(userId, reportType, {
        regenerate,
        specificSections,
        qualityThreshold
      });

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          report_id: result.reportId,
          user_id: userId,
          report_type: reportType,
          generation_mode: 'sectional',
          initiated_at: new Date().toISOString(),
          debug: true
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message,
          report_id: result.reportId,
          debug: true
        });
      }

    } catch (error) {
      console.error('❌ DEBUG: Error initiating sectional report generation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initiate sectional report generation',
        details: error.message,
        debug: true
      });
    }
  });
}

// ===================================================================
// ENDPOINT: GET /api/ast-sectional-reports/progress/:userId/:reportType
// Get real-time progress of section-by-section generation
// ===================================================================
router.get('/progress/:userId/:reportType', requireAuth, async (req, res) => {
  try {
    const { userId: urlUserId, reportType } = req.params;
    const sessionUserId = req.session?.userId;

    // SECURITY: Validate authenticated user matches the userId in URL
    if (!sessionUserId || sessionUserId.toString() !== urlUserId) {
      console.log(`❌ SECURITY: User ${sessionUserId} attempted to access progress for user ${urlUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only view progress for your own reports'
      });
    }

    const userId = sessionUserId; // Use session userId for all operations
    console.log(`📊 Getting generation progress for user: ${userId}, type: ${reportType}`);

    // Validate report type
    if (!['ast_personal', 'ast_professional'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report type. Must be "ast_personal" or "ast_professional"'
      });
    }

    const progress = await astSectionalReportService.getReportProgress(userId, reportType);

    res.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('❌ Error getting generation progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get generation progress',
      details: error.message
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/ast-sectional-reports/sections/:userId/:reportType
// Get sections for a report (all sections or specific section)
// ===================================================================
router.get('/sections/:userId/:reportType', requireAuth, async (req, res) => {
  try {
    const { userId: urlUserId, reportType } = req.params;
    const sessionUserId = req.session?.userId;
    const { sectionId } = req.query;

    // SECURITY: Validate authenticated user matches the userId in URL
    if (!sessionUserId || sessionUserId.toString() !== urlUserId) {
      console.log(`❌ SECURITY: User ${sessionUserId} attempted to access sections for user ${urlUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only view sections for your own reports'
      });
    }

    const userId = sessionUserId; // Use session userId for all operations
    console.log(`📄 Getting sections for user: ${userId}, type: ${reportType}${sectionId ? `, section: ${sectionId}` : ''}`);

    // Validate report type
    if (!['ast_personal', 'ast_professional'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report type. Must be "ast_personal" or "ast_professional"'
      });
    }

    let query = `
      SELECT section_id, section_name, section_title, section_content,
             status, error_message, completed_at, generation_attempts,
             created_at, updated_at
      FROM report_sections
      WHERE user_id = $1 AND report_type = $2
    `;

    const params = [userId, reportType];

    if (sectionId !== undefined) {
      const sectionIdNum = parseInt(sectionId as string);
      if (isNaN(sectionIdNum) || sectionIdNum < 0 || sectionIdNum > 5) {
        return res.status(400).json({
          success: false,
          error: 'Invalid section ID. Must be a number between 0 and 5'
        });
      }
      query += ` AND section_id = $3`;
      params.push(sectionIdNum.toString());
    }

    query += ` ORDER BY section_id`;

    const sectionsResult = await pool.query(query, params);

    if (sectionsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: sectionId !== undefined ?
          `Section ${sectionId} not found for this user and report type` :
          'No sections found for this user and report type'
      });
    }

    const sections = sectionsResult.rows.map(row => ({
      section_id: row.section_id,
      section_name: row.section_name,
      section_title: row.section_title,
      section_content: row.section_content,
      status: row.status,
      error_message: row.error_message,
      completed_at: row.completed_at,
      generation_attempts: row.generation_attempts,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    res.json({
      success: true,
      user_id: userId,
      report_type: reportType,
      sections: sectionId !== undefined ? sections[0] : sections,
      section_count: sections.length
    });

  } catch (error) {
    console.error('❌ Error getting sections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sections',
      details: error.message
    });
  }
});

// ===================================================================
// ENDPOINT: PUT /api/ast-sectional-reports/sections/:userId/:reportType/:sectionId
// Edit individual section content
// ===================================================================
router.put('/sections/:userId/:reportType/:sectionId', requireAuth, async (req, res) => {
  try {
    const { userId: urlUserId, reportType, sectionId } = req.params;
    const sessionUserId = req.session?.userId;
    const { sectionContent, sectionTitle } = req.body;

    // SECURITY: Validate authenticated user matches the userId in URL
    if (!sessionUserId || sessionUserId.toString() !== urlUserId) {
      console.log(`❌ SECURITY: User ${sessionUserId} attempted to edit section for user ${urlUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only edit sections for your own reports'
      });
    }

    const userId = sessionUserId; // Use session userId for all operations
    console.log(`✏️ Editing section ${sectionId} for user: ${userId}, type: ${reportType}`);

    // Validate inputs
    if (!['ast_personal', 'ast_professional'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report type. Must be "ast_personal" or "ast_professional"'
      });
    }

    const sectionIdNum = parseInt(sectionId);
    if (isNaN(sectionIdNum) || sectionIdNum < 0 || sectionIdNum > 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section ID. Must be a number between 0 and 5'
      });
    }

    if (!sectionContent) {
      return res.status(400).json({
        success: false,
        error: 'sectionContent is required'
      });
    }

    // Check if section exists
    const existingSection = await pool.query(`
      SELECT section_id FROM report_sections
      WHERE user_id = $1 AND report_type = $2 AND section_id = $3
    `, [userId, reportType, sectionIdNum]);

    if (existingSection.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    // Update section content
    const updateQuery = `
      UPDATE report_sections
      SET section_content = $1,
          ${sectionTitle ? 'section_title = $2,' : ''}
          updated_at = NOW()
      WHERE user_id = $${sectionTitle ? '3' : '2'} AND report_type = $${sectionTitle ? '4' : '3'} AND section_id = $${sectionTitle ? '5' : '4'}
      RETURNING section_title, updated_at
    `;

    const updateParams = sectionTitle
      ? [sectionContent, sectionTitle, userId, reportType, sectionIdNum]
      : [sectionContent, userId, reportType, sectionIdNum];

    const updateResult = await pool.query(updateQuery, updateParams);

    res.json({
      success: true,
      message: 'Section updated successfully',
      user_id: userId,
      report_type: reportType,
      section_id: sectionIdNum,
      section_title: updateResult.rows[0].section_title,
      updated_at: updateResult.rows[0].updated_at
    });

  } catch (error) {
    console.error('❌ Error editing section:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to edit section',
      details: error.message
    });
  }
});

// ===================================================================
// ENDPOINT: POST /api/ast-sectional-reports/sections/:userId/:reportType/:sectionId/regenerate
// Regenerate a specific section
// ===================================================================
router.post('/sections/:userId/:reportType/:sectionId/regenerate', requireAuth, async (req, res) => {
  try {
    const { userId: urlUserId, reportType, sectionId } = req.params;
    const sessionUserId = req.session?.userId;

    // SECURITY: Validate authenticated user matches the userId in URL
    if (!sessionUserId || sessionUserId.toString() !== urlUserId) {
      console.log(`❌ SECURITY: User ${sessionUserId} attempted to regenerate section for user ${urlUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only regenerate sections for your own reports'
      });
    }

    const userId = sessionUserId; // Use session userId for all operations
    console.log(`🔄 Regenerating section ${sectionId} for user: ${userId}, type: ${reportType}`);

    // Validate inputs
    if (!['ast_personal', 'ast_professional'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report type. Must be "ast_personal" or "ast_professional"'
      });
    }

    const sectionIdNum = parseInt(sectionId);
    if (isNaN(sectionIdNum) || sectionIdNum < 0 || sectionIdNum > 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section ID. Must be a number between 0 and 5'
      });
    }

    // Regenerate section
    const result = await astSectionalReportService.regenerateSection(userId, reportType, sectionIdNum);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        user_id: userId,
        report_type: reportType,
        section_id: sectionIdNum,
        regenerated_at: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message
      });
    }

  } catch (error) {
    console.error('❌ Error regenerating section:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate section',
      details: error.message
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/ast-sectional-reports/final/:userId/:reportType
// Get assembled final report in various formats with rich visual integration
// ===================================================================
router.get('/final/:userId/:reportType', requireAuth, async (req, res) => {
  try {
    const { userId: urlUserId, reportType } = req.params;
    const sessionUserId = req.session?.userId;
    const { format = 'html' } = req.query;

    // SECURITY: Validate authenticated user matches the userId in URL
    if (!sessionUserId || sessionUserId.toString() !== urlUserId) {
      console.log(`❌ SECURITY: User ${sessionUserId} attempted to access final report for user ${urlUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only view final reports for your own account'
      });
    }

    const userId = sessionUserId; // Use session userId for all operations
    console.log(`📋 Getting final assembled report for user: ${userId}, type: ${reportType}, format: ${format}`);

    // Validate inputs
    if (!['ast_personal', 'ast_professional'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report type. Must be "ast_personal" or "ast_professional"'
      });
    }

    if (!['html', 'json', 'text'].includes(format as string)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid format. Must be "html", "json", or "text"'
      });
    }

    // Get assembled report with enhanced HTML support
    const result = await astSectionalReportService.getAssembledReport(
      userId,
      reportType,
      format as 'html' | 'json' | 'text'
    );

    if (result.success) {
      // Set appropriate content type
      let contentType = 'text/plain';
      if (format === 'html') contentType = 'text/html';
      if (format === 'json') contentType = 'application/json';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      // For downloads, set appropriate filename
      if (req.query.download === 'true') {
        const extension = format === 'html' ? 'html' : format === 'json' ? 'json' : 'txt';
        const filename = `${userId}_AST_${reportType}_Sectional_Report.${extension}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      } else if (format === 'html') {
        // For inline viewing, set appropriate disposition
        res.setHeader('Content-Disposition', 'inline');
      }

      res.send(result.content);
    } else {
      res.status(400).json({
        success: false,
        error: result.content
      });
    }

  } catch (error) {
    console.error('❌ Error getting final report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get final report',
      details: error.message
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/ast-sectional-reports/status/:userId
// Get overall status for both personal and professional reports
// ===================================================================
router.get('/status/:userId', requireAuth, async (req, res) => {
  try {
    const { userId: urlUserId } = req.params;
    const sessionUserId = req.session?.userId;

    // SECURITY: Validate authenticated user matches the userId in URL
    if (!sessionUserId || sessionUserId.toString() !== urlUserId) {
      console.log(`❌ SECURITY: User ${sessionUserId} attempted to access status for user ${urlUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only view status for your own reports'
      });
    }

    const userId = sessionUserId; // Use session userId for all operations
    console.log(`📊 Getting overall report status for user: ${userId}`);

    // Get status for both report types
    const personalProgress = await astSectionalReportService.getReportProgress(userId, 'ast_personal');
    const professionalProgress = await astSectionalReportService.getReportProgress(userId, 'ast_professional');

    // Get traditional reports status for comparison
    const traditionalReports = await pool.query(`
      SELECT report_type, generation_status, generation_mode, updated_at
      FROM holistic_reports
      WHERE user_id = $1 AND report_type IN ('ast_personal', 'ast_professional')
      AND generation_mode = 'traditional'
      ORDER BY updated_at DESC
    `, [userId]);

    const traditionalReportsMap = {};
    traditionalReports.rows.forEach(row => {
      traditionalReportsMap[row.report_type] = {
        status: row.generation_status,
        mode: row.generation_mode,
        updated_at: row.updated_at
      };
    });

    res.json({
      success: true,
      user_id: userId,
      sectional_reports: {
        ast_personal: personalProgress,
        ast_professional: professionalProgress
      },
      traditional_reports: traditionalReportsMap,
      overall_summary: {
        sectional_personal_complete: personalProgress.progressPercentage === 100,
        sectional_professional_complete: professionalProgress.progressPercentage === 100,
        traditional_personal_exists: !!traditionalReportsMap['ast_personal'],
        traditional_professional_exists: !!traditionalReportsMap['ast_professional']
      }
    });

  } catch (error) {
    console.error('❌ Error getting report status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get report status',
      details: error.message
    });
  }
});

// ===================================================================
// ENDPOINT: DELETE /api/ast-sectional-reports/:userId/:reportType
// Delete sectional report and all its sections
// ===================================================================
router.delete('/:userId/:reportType', requireAuth, async (req, res) => {
  try {
    const { userId: urlUserId, reportType } = req.params;
    const sessionUserId = req.session?.userId;

    // SECURITY: Validate authenticated user matches the userId in URL
    if (!sessionUserId || sessionUserId.toString() !== urlUserId) {
      console.log(`❌ SECURITY: User ${sessionUserId} attempted to delete report for user ${urlUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only delete your own reports'
      });
    }

    const userId = sessionUserId; // Use session userId for all operations
    console.log(`🗑️ Deleting sectional report for user: ${userId}, type: ${reportType}`);

    // Validate report type
    if (!['ast_personal', 'ast_professional'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report type. Must be "ast_personal" or "ast_professional"'
      });
    }

    // Delete sections first (due to potential foreign key constraints)
    const sectionsResult = await pool.query(`
      DELETE FROM report_sections
      WHERE user_id = $1 AND report_type = $2
    `, [userId, reportType]);

    // Delete sectional report from holistic_reports
    const reportResult = await pool.query(`
      DELETE FROM holistic_reports
      WHERE user_id = $1 AND report_type = $2 AND generation_mode = 'sectional'
    `, [userId, reportType]);

    res.json({
      success: true,
      message: 'Sectional report deleted successfully',
      user_id: userId,
      report_type: reportType,
      sections_deleted: sectionsResult.rowCount,
      reports_deleted: reportResult.rowCount
    });

  } catch (error) {
    console.error('❌ Error deleting sectional report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete sectional report',
      details: error.message
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/ast-sectional-reports/list
// List all users with sectional reports (admin only)
// ===================================================================
router.get('/list', requireAuth, async (req, res) => {
  try {
    console.log('📊 Listing all users with sectional reports');

    const usersWithSectionalReports = await pool.query(`
      SELECT
        u.id,
        u.name,
        COUNT(CASE WHEN hr.report_type = 'ast_personal' AND hr.generation_mode = 'sectional' THEN 1 END) as sectional_personal_reports,
        COUNT(CASE WHEN hr.report_type = 'ast_professional' AND hr.generation_mode = 'sectional' THEN 1 END) as sectional_professional_reports,
        AVG(CASE WHEN hr.generation_mode = 'sectional' THEN hr.sectional_progress END) as avg_progress,
        MAX(hr.updated_at) as latest_activity,
        COUNT(rs.id) as total_sections
      FROM users u
      LEFT JOIN holistic_reports hr ON u.id = hr.user_id
        AND hr.report_type IN ('ast_personal', 'ast_professional')
        AND hr.generation_mode = 'sectional'
      LEFT JOIN report_sections rs ON u.id = rs.user_id
        AND rs.report_type IN ('ast_personal', 'ast_professional')
      GROUP BY u.id, u.name
      HAVING COUNT(hr.id) > 0 OR COUNT(rs.id) > 0
      ORDER BY MAX(hr.updated_at) DESC NULLS LAST
    `);

    res.json({
      success: true,
      users: usersWithSectionalReports.rows,
      total_users: usersWithSectionalReports.rows.length
    });

  } catch (error) {
    console.error('❌ Error listing sectional reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list sectional reports'
    });
  }
});

export default router;