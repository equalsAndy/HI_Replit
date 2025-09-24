import express from 'express';
import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db.js';
import { 
  GenerateReportRequest, 
  GenerateReportResponse, 
  ReportStatusResponse,
  HolisticReport,
  ReportType 
} from '../../shared/holistic-report-types';
import { mockReportDataService } from '../services/mock-report-data-service';
import { pdfReportService } from '../services/pdf-report-service';
import { generateOpenAICoachingResponse } from '../services/openai-api-service.js';
import { taliaPersonaService } from '../services/talia-personas.js';
// Note: Star card image generation will be handled separately

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Test endpoint for report generation (development only)
 * POST /api/reports/holistic/test-generate
 */
router.post('/test-generate', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Endpoint not available in production' });
  }

  const { reportType = 'standard', userId = 1 } = req.body;

  try {
    console.log(`🧪 TEST: Starting ${reportType} report generation for user ${userId}`);

    // Check if user has already generated this type of report
    const existingReport = await pool.query(
      'SELECT id, generation_status FROM holistic_reports WHERE user_id = $1 AND report_type = $2',
      [userId, reportType]
    );

    if (existingReport.rows.length > 0) {
      const existing = existingReport.rows[0];
      // TESTING: Allow regeneration even if completed (for testing purposes)
      // if (existing.generation_status === 'completed') {
      //   return res.status(409).json({
      //     success: false,
      //     message: `Test user has already generated a ${reportType} report. Only one report per type is allowed.`,
      //     reportId: existing.id,
      //     status: 'completed'
      //   });
      // }
      
      if (existing.generation_status === 'generating') {
        return res.status(409).json({
          success: false,
          message: `A ${reportType} report is currently being generated for test user.`,
          reportId: existing.id,
          status: 'generating'
        });
      }
    }

    // Create or update report record
    let reportId: string;
    if (existingReport.rows.length > 0) {
      // Update existing failed record
      reportId = existingReport.rows[0].id;
      await pool.query(
        'UPDATE holistic_reports SET generation_status = $1, updated_at = NOW() WHERE id = $2',
        ['generating', reportId]
      );
    } else {
      // Create new report record
      const newReport = await pool.query(
        `INSERT INTO holistic_reports (user_id, report_type, report_data, generation_status, generated_by_user_id) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [userId, reportType, JSON.stringify({}), 'generating', userId]
      );
      reportId = newReport.rows[0].id;
    }

    // Generate report data using Star Report Talia AI persona
    console.log(`🤖 Generating ${reportType} report using Star Report Talia AI persona`);
    const reportData = await generateReportUsingTalia(userId, reportType as ReportType);

    // StarCard image will be retrieved via getUserStarCard method during report generation
    // No need to get separate path here
    
    // Also store the base64 data directly for HTML reports with validation
    if (!reportData.starCardImageBase64) {
      try {
        const { photoStorageService } = await import('../services/photo-storage-service.js');
        const starCardImage = await photoStorageService.getUserStarCardImage(userId);
        if (starCardImage && starCardImage.photoData) {
          // Validate that this looks like a StarCard (not a random image)
          console.log(`🔍 StarCard validation for user ${userId}:`);
          console.log(`   - Source: ${starCardImage.source || 'unknown'}`);
          console.log(`   - Data length: ${starCardImage.photoData.length} chars`);
          
          // Additional validation for fallback images
          if (starCardImage.source === 'fallback_png') {
            console.warn(`⚠️ Using fallback PNG for user ${userId} - report may show wrong image`);
          }
          
          reportData.starCardImageBase64 = starCardImage.photoData;
          console.log(`✅ StarCard image added to report for user ${userId}`);
        } else {
          console.warn(`⚠️ No StarCard image found for user ${userId} - report will have no StarCard`);
        }
      } catch (error) {
        console.warn('Could not get StarCard base64 data:', error);
      }
    }

    // Generate HTML report content (no file system operations for container compatibility)
    console.log('🎯 Generating HTML report content');
    const htmlContent = generateHtmlReport(reportData, reportType);
    
    // Store report data and HTML content directly in database (no file system)
    const pdfFileName = `${reportData.participant.name}-${reportType}-report.pdf`;
    
    // Update database with complete report (store HTML content instead of file paths)
    await pool.query(
      `UPDATE holistic_reports SET 
        report_data = $1, 
        html_content = $2,
        pdf_file_name = $3, 
        generation_status = $4,
        updated_at = NOW()
       WHERE id = $5`,
      [
        JSON.stringify(reportData),
        htmlContent,
        pdfFileName,
        'completed',
        reportId
      ]
    );

    console.log(`✅ TEST: ${reportType} report generated successfully for user ${userId}`);

    res.json({
      success: true,
      reportId,
      message: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} test report generated successfully`,
      status: 'completed'
    });

  } catch (error) {
    console.error(`❌ TEST: Report generation failed for user ${userId}:`, error);
    
    res.status(500).json({
      success: false,
      message: 'Test report generation failed. Please try again.',
      status: 'failed',
      error: error.message
    });
  }
});

/**
 * Generate a holistic report (Standard or Personal)
 * POST /api/reports/holistic/generate
 */
router.post('/generate', async (req, res) => {
  const { reportType }: GenerateReportRequest = req.body;
  
  // Use same authentication as test endpoints - session or cookie
  let userId = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);

  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    } as GenerateReportResponse);
  }

  if (!reportType || !['standard', 'personal'].includes(reportType)) {
    return res.status(400).json({
      success: false,
      message: 'Valid report type (standard or personal) is required'
    } as GenerateReportResponse);
  }

  try {
    console.log(`🚀 Starting ${reportType} report generation for user ${userId}`);

    // Check for concurrent generation attempts only
    const existingReport = await pool.query(
      'SELECT id, generation_status FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3',
      [userId, reportType, 'generating']
    );

    if (existingReport.rows.length > 0) {
      const existing = existingReport.rows[0];
      return res.status(409).json({
        success: false,
        message: `A ${reportType} report is currently being generated. Please wait.`,
        reportId: existing.id,
        status: 'generating'
      } as GenerateReportResponse);
    }

    // Always create a new report record (no limit on generations)
    const newReport = await pool.query(
      `INSERT INTO holistic_reports (user_id, report_type, report_data, generation_status, generated_by_user_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, reportType, JSON.stringify({}), 'generating', userId]
    );
    const reportId = newReport.rows[0].id;

    // Generate report data using Star Report Talia AI persona
    console.log(`🤖 Generating ${reportType} report using Star Report Talia AI persona`);
    const reportData = await generateReportUsingTalia(userId, reportType as ReportType);

    // StarCard image will be retrieved via getUserStarCard method during report generation
    // No need to get separate path here
    
    // Also store the base64 data directly for HTML reports with validation
    if (!reportData.starCardImageBase64) {
      try {
        const { photoStorageService } = await import('../services/photo-storage-service.js');
        const starCardImage = await photoStorageService.getUserStarCardImage(userId);
        if (starCardImage && starCardImage.photoData) {
          // Validate that this looks like a StarCard (not a random image)
          console.log(`🔍 StarCard validation for user ${userId}:`);
          console.log(`   - Source: ${starCardImage.source || 'unknown'}`);
          console.log(`   - Data length: ${starCardImage.photoData.length} chars`);
          
          // Additional validation for fallback images
          if (starCardImage.source === 'fallback_png') {
            console.warn(`⚠️ Using fallback PNG for user ${userId} - report may show wrong image`);
          }
          
          reportData.starCardImageBase64 = starCardImage.photoData;
          console.log(`✅ StarCard image added to report for user ${userId}`);
        } else {
          console.warn(`⚠️ No StarCard image found for user ${userId} - report will have no StarCard`);
        }
      } catch (error) {
        console.warn('Could not get StarCard base64 data:', error);
      }
    }

    // Generate HTML report content (no file system operations for container compatibility)
    console.log('🎯 Generating HTML report content');
    const htmlContent = generateHtmlReport(reportData, reportType);
    
    // Store report data and HTML content directly in database (no file system)
    const pdfFileName = `${reportData.participant.name}-${reportType}-report.pdf`;
    
    // Update database with complete report (store HTML content instead of file paths)
    await pool.query(
      `UPDATE holistic_reports SET 
        report_data = $1, 
        html_content = $2,
        pdf_file_name = $3, 
        generation_status = $4,
        updated_at = NOW()
       WHERE id = $5`,
      [
        JSON.stringify(reportData),
        htmlContent,
        pdfFileName,
        'completed',
        reportId
      ]
    );

    // Update user progress in navigation_progress table
    const progressField = reportType === 'standard' ? 'standard_report_generated' : 'personal_report_generated';
    await pool.query(
      `UPDATE navigation_progress SET ${progressField} = true, holistic_reports_unlocked = true WHERE user_id = $1`,
      [userId]
    );

    console.log(`✅ ${reportType} report generated successfully for user ${userId}`);

    res.json({
      success: true,
      reportId,
      message: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`,
      status: 'completed'
    } as GenerateReportResponse);

  } catch (error) {
    console.error(`❌ Report generation failed for user ${userId}:`, error);
    
    // Update report status to failed
    await pool.query(
      'UPDATE holistic_reports SET generation_status = $1, error_message = $2, updated_at = NOW() WHERE user_id = $3 AND report_type = $4',
      ['failed', error.message, userId, reportType]
    );

    res.status(500).json({
      success: false,
      message: 'Report generation failed. Please try again.',
      status: 'failed'
    } as GenerateReportResponse);
  }
});

/**
 * Test endpoint for report status (development only)
 * GET /api/reports/holistic/test-status/:reportType/:userId
 */
router.get('/test-status/:reportType/:userId', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Endpoint not available in production' });
  }

  const { reportType, userId } = req.params;

  if (!['standard', 'personal'].includes(reportType)) {
    return res.status(400).json({ error: 'Invalid report type' });
  }

  try {
    const result = await pool.query(
      'SELECT id, generation_status, generated_at, error_message FROM holistic_reports WHERE user_id = $1 AND report_type = $2',
      [parseInt(userId), reportType]
    );

    if (result.rows.length === 0) {
      return res.json({
        reportId: null,
        status: 'not_generated'
      });
    }

    const report = result.rows[0];
    const response = {
      reportId: report.id,
      status: report.generation_status,
      generatedAt: report.generated_at,
      errorMessage: report.error_message
    };

    if (report.generation_status === 'completed') {
      response.pdfUrl = `/api/reports/holistic/test-download/${reportType}/${userId}`; // PDF for viewing in iframe
      response.reportUrl = `/api/reports/holistic/test-view/${reportType}/${userId}`; // HTML version
      response.downloadUrl = `/api/reports/holistic/test-download/${reportType}/${userId}`; // PDF for download
    }

    res.json(response);

  } catch (error) {
    console.error('Error fetching test report status:', error);
    res.status(500).json({ error: 'Failed to fetch report status' });
  }
});

/**
 * Debug status endpoint (NO AUTH REQUIRED - DEVELOPMENT ONLY)
 * GET /api/reports/holistic/:reportType/debug-status
 */
router.get('/:reportType/debug-status', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Endpoint not available in production' });
  }

  const { reportType } = req.params;
  const userId = 1; // Always use admin user for debug

  if (!['standard', 'personal'].includes(reportType)) {
    return res.status(400).json({ error: 'Invalid report type' });
  }

  try {
    const result = await pool.query(
      'SELECT id, generation_status, generated_at, error_message FROM holistic_reports WHERE user_id = $1 AND report_type = $2 ORDER BY generated_at DESC LIMIT 1',
      [userId, reportType]
    );

    if (result.rows.length === 0) {
      return res.json({
        reportId: null,
        status: 'not_generated'
      } as ReportStatusResponse);
    }

    const report = result.rows[0];
    const response: ReportStatusResponse = {
      reportId: report.id,
      status: report.generation_status,
      generatedAt: report.generated_at,
      errorMessage: report.error_message
    };

    if (report.generation_status === 'completed') {
      response.pdfUrl = `/api/reports/holistic/${reportType}/download`; // PDF for viewing in iframe (inline)
      response.reportUrl = `/api/reports/holistic/${reportType}/view`; // HTML version
      response.downloadUrl = `/api/reports/holistic/${reportType}/download?download=true`; // PDF for download (attachment)
      response.htmlUrl = `/api/reports/holistic/${reportType}/html`; // HTML version
    }

    res.json(response);

  } catch (error) {
    console.error('Error fetching report status:', error);
    res.status(500).json({ error: 'Failed to fetch report status' });
  }
});

/**
 * Get report status
 * GET /api/reports/holistic/:reportType/status
 */
router.get('/:reportType/status', requireAuth, async (req, res) => {
  const { reportType } = req.params;
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!['standard', 'personal'].includes(reportType)) {
    return res.status(400).json({ error: 'Invalid report type' });
  }

  try {
    const result = await pool.query(
      'SELECT id, generation_status, generated_at, error_message FROM holistic_reports WHERE user_id = $1 AND report_type = $2 ORDER BY generated_at DESC LIMIT 1',
      [userId, reportType]
    );

    if (result.rows.length === 0) {
      return res.json({
        reportId: null,
        status: 'not_generated'
      } as ReportStatusResponse);
    }

    const report = result.rows[0];
    const response: ReportStatusResponse = {
      reportId: report.id,
      status: report.generation_status,
      generatedAt: report.generated_at,
      errorMessage: report.error_message
    };

    if (report.generation_status === 'completed') {
      response.pdfUrl = `/api/reports/holistic/${reportType}/download`; // PDF for viewing in iframe (inline)
      response.reportUrl = `/api/reports/holistic/${reportType}/view`; // HTML version
      response.downloadUrl = `/api/reports/holistic/${reportType}/download?download=true`; // PDF for download (attachment)
      response.htmlUrl = `/api/reports/holistic/${reportType}/html`; // HTML version
    }

    res.json(response);

  } catch (error) {
    console.error('Error fetching report status:', error);
    res.status(500).json({ error: 'Failed to fetch report status' });
  }
});

/**
 * View report in browser
 * GET /api/reports/holistic/:reportType/view
 */
router.get('/:reportType/view', requireAuth, async (req, res) => {
  const { reportType } = req.params;
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const result = await pool.query(
      'SELECT html_content, report_data FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3 ORDER BY generated_at DESC LIMIT 1',
      [userId, reportType, 'completed']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or not completed' });
    }

    const { html_content, report_data } = result.rows[0];
    
    // Use stored HTML content, or generate if not available
    let htmlContent = html_content;
    if (!htmlContent && report_data) {
      htmlContent = generateHtmlReport(report_data, reportType);
    }
    
    if (!htmlContent) {
      return res.status(404).json({ error: 'Report content not available' });
    }

    // Set headers for HTML viewing
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Send HTML content for viewing
    res.send(htmlContent);

  } catch (error) {
    console.error('Error serving report:', error);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

/**
 * Download PDF report
 * GET /api/reports/holistic/:reportType/download
 */
router.get('/:reportType/download', requireAuth, async (req, res) => {
  const { reportType } = req.params;
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const result = await pool.query(
      'SELECT html_content, report_data, pdf_file_name FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3 ORDER BY generated_at DESC LIMIT 1',
      [userId, reportType, 'completed']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or not completed' });
    }

    const { html_content, report_data, pdf_file_name } = result.rows[0];
    
    // Use stored HTML content, or generate if not available
    let htmlContent = html_content;
    if (!htmlContent && report_data) {
      htmlContent = generateHtmlReport(report_data, reportType);
    }
    
    if (!htmlContent) {
      return res.status(404).json({ error: 'Report content not available' });
    }

    try {
      console.log('🔄 Attempting PDF generation using Puppeteer...');
      
      // Try to import and use puppeteer
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      
      // Set viewport and wait for content to load
      await page.setViewport({ width: 1200, height: 800 });
      await page.setContent(htmlContent, { 
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000 
      });
      
      // Give extra time for images to load
      await page.waitForTimeout(2000);
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        displayHeaderFooter: false,
        preferCSSPageSize: true
      });
      
      await browser.close();
      
      console.log('✅ PDF generated successfully');
      
      // Set headers for PDF - inline for viewing, attachment for download
      const filename = pdf_file_name || `${reportType}-report.pdf`;
      const isDownload = req.query.download === 'true';
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,
        'Cache-Control': 'no-cache',
        'Content-Disposition': isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`
      };
      
      // Send PDF buffer - force binary mode
      res.writeHead(200, headers);
      res.end(pdfBuffer);
      
    } catch (pdfError) {
      console.error('❌ PDF generation failed, serving HTML instead:', pdfError);
      console.error('PDF Error details:', {
        message: pdfError.message,
        stack: pdfError.stack?.split('\n')[0]
      });
      
      // Fallback to HTML view if PDF generation fails
      const filename = pdf_file_name?.replace('.pdf', '.html') || `${reportType}-report.html`;
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache');
      
      // For download requests, still try to offer the HTML as a file
      if (req.query.download === 'true') {
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      }
      
      // Send HTML content with a note about PDF unavailability
      const htmlWithNote = htmlContent.replace(
        '<div class="header">',
        `<div class="header">
          <div style="background-color: #fef3c7; color: #92400e; padding: 10px; margin-bottom: 20px; border-radius: 6px; font-size: 14px;">
            <strong>Note:</strong> PDF generation is temporarily unavailable. This is the HTML version of your report.
          </div>`
      );
      
      res.send(htmlWithNote);
    }

  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ error: 'Failed to download report' });
  }
});

/**
 * View HTML report in browser
 * GET /api/reports/holistic/:reportType/html
 */
router.get('/:reportType/html', requireAuth, async (req, res) => {
  const { reportType } = req.params;
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const result = await pool.query(
      'SELECT html_content, report_data FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3 ORDER BY generated_at DESC LIMIT 1',
      [userId, reportType, 'completed']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or not completed' });
    }

    const { html_content, report_data } = result.rows[0];
    
    // Use stored HTML content, or generate if not available
    let htmlContent = html_content;
    if (!htmlContent && report_data) {
      htmlContent = generateHtmlReport(report_data, reportType);
    }
    
    if (!htmlContent) {
      return res.status(404).json({ error: 'Report content not available' });
    }
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);

  } catch (error) {
    console.error('Error serving HTML report:', error);
    res.status(500).json({ error: 'Failed to load HTML report' });
  }
});

/**
 * Admin route: Reset all reports for testing
 * DELETE /api/reports/holistic/admin/reset
 */
router.delete('/admin/reset', requireAuth, async (req, res) => {
  // Check if user is admin
  if (req.session?.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // Delete all holistic reports
    const result = await pool.query('DELETE FROM holistic_reports');
    
    console.log(`🧹 Admin reset: Deleted ${result.rowCount} holistic reports`);
    
    res.json({
      success: true,
      message: `Deleted ${result.rowCount} reports`,
      deletedCount: result.rowCount
    });
  } catch (error) {
    console.error('Error resetting reports:', error);
    res.status(500).json({ error: 'Failed to reset reports' });
  }
});

/**
 * Admin route: List all reports
 * GET /api/reports/holistic/admin/list
 */
router.get('/admin/list', requireAuth, async (req, res) => {
  // Check if user is admin
  if (req.session?.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const result = await pool.query(`
      SELECT hr.*, u.username, u.name as user_name 
      FROM holistic_reports hr 
      JOIN users u ON hr.user_id = u.id 
      ORDER BY hr.generated_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin report list:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * Generate report using Star Report Talia AI persona with proper AST methodology
 */
async function generateReportUsingTalia(userId: number, reportType: ReportType): Promise<any> {
  try {
    console.log(`🎆 Starting Star Report Talia generation using ADMIN CONSOLE methodology for user ${userId}, type: ${reportType}`);
    
    // Use the SAME process as admin console - get user data first
    const userResult = await pool.query(
      'SELECT id, username, name, ast_workshop_completed, ast_completed_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      console.log(`⚠️ User ${userId} not found, falling back to mock data`);
      return await mockReportDataService.generateMockReportData(userId, reportType);
    }
    
    const user = userResult.rows[0];
    console.log(`🔍 User data: ID=${user.id}, completed=${user.ast_workshop_completed}, name=${user.name}`);
    
    if (!user.ast_workshop_completed) {
      console.log(`⚠️ User ${userId} has not completed AST workshop, falling back to mock data`);
      return await mockReportDataService.generateMockReportData(userId, reportType);
    }
    
    // Get user's workshop data (same as admin console)
    const assessmentResult = await pool.query(
      'SELECT * FROM user_assessments WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const stepDataResult = await pool.query(
      'SELECT * FROM workshop_step_data WHERE user_id = $1 ORDER BY step_id, created_at DESC',
      [userId]
    );
    
    console.log(`📊 Found ${assessmentResult.rows.length} assessments and ${stepDataResult.rows.length} step data records`);
    
    // Get StarCard image FIRST (same as admin console) with enhanced validation
    let starCardImageBase64 = '';
    try {
      console.log(`🖼️ Getting StarCard image for user ${userId}...`);
      const { photoStorageService } = await import('../services/photo-storage-service.js');
      const starCardImage = await photoStorageService.getUserStarCardImage(userId);
      
      if (starCardImage && starCardImage.photoData) {
        starCardImageBase64 = starCardImage.photoData;
        console.log('✅ Found StarCard image for report integration');
        console.log(`📊 StarCard image details: length=${starCardImage.photoData.length}, source=${starCardImage.source}`);
        console.log(`🔍 StarCard data preview: ${starCardImage.photoData.substring(0, 50)}...`);
        
        // Warn if using fallback method (may be wrong image)
        if (starCardImage.source === 'fallback_png') {
          console.warn(`⚠️ ALERT: Using fallback PNG for user ${userId} - this may not be the actual StarCard!`);
          console.warn(`   This could result in visualization exercise images appearing in the report instead of StarCard`);
        }
      } else {
        console.log('⚠️ No StarCard image found for this user');
        console.log(`🔍 StarCard retrieval result: ${starCardImage ? 'object exists but no photoData' : 'null/undefined'}`);
      }
    } catch (error) {
      console.warn('Could not retrieve StarCard image:', error);
    }
    
    // Use UPDATED TEMPLATE-BASED PROMPT from taliaPersonaService
    const isPersonalReport = reportType === 'personal';
    
    // Create context for the talia persona service
    const reportContext = {
      userName: user.name,
      reportType: reportType,
      essentialAssessments: assessmentResult.rows,
      essentialReflections: stepDataResult.rows
    };
    
    console.log('🚀 Using clean AST transformer for report generation');

    // Build user context for clean report generation
    const userContextData = {
      name: user.name,
      strengths: assessmentResult.rows.find(a => a.assessment_type === 'starCard')?.results ? JSON.parse(assessmentResult.rows.find(a => a.assessment_type === 'starCard').results as string) : {"thinking":0,"feeling":0,"acting":0,"planning":0},
      reflections: assessmentResult.rows.find(a => a.assessment_type === 'stepByStepReflection')?.results ? JSON.parse(assessmentResult.rows.find(a => a.assessment_type === 'stepByStepReflection').results as string) : {},
      flowData: assessmentResult.rows.find(a => a.assessment_type === 'flowAssessment')?.results ? JSON.parse(assessmentResult.rows.find(a => a.assessment_type === 'flowAssessment').results as string) : null
    };
    
    console.log('🔍 DEBUG: Assessment results:', assessmentResult.rows.map(r => ({ type: r.assessment_type, hasResults: !!r.results })));
    console.log('🔍 DEBUG: User context data structure:', {
      userName: userContextData.userName || 'N/A',
      hasStrengths: !!userContextData.strengths,
      hasReflections: !!userContextData.reflections,
      hasFlowData: !!userContextData.flowData,
      assessmentCount: Array.isArray(userContextData.assessments) ? userContextData.assessments.length : 0,
      stepDataCount: Array.isArray(userContextData.stepData) ? userContextData.stepData.length : 0
    });
    
    // Use clean AST report generation (no legacy TALIA prompt injection)
    console.log('[AST] Using clean report generation with compact input only');
    let reportContent;
    let usingOpenAI = false;

    try {
      // Import clean report generation functions
      const { createAstReportFromExport, getAssistantByPurpose } = await import('../services/openai-api-service.js');

      // Get assistant configuration
      let assistantConfig = getAssistantByPurpose('report');
      if (!assistantConfig) {
        assistantConfig = getAssistantByPurpose('ia');
      }
      if (!assistantConfig) {
        throw new Error('No suitable assistant available for report generation');
      }

      // Construct raw export data for transformer
      const rawExportData = {
        user: user,
        assessments: assessmentResult.rows,
        stepData: stepDataResult.rows,
        completedAt: user.ast_completed_at
      };

      // Generate report using clean AST approach
      reportContent = await createAstReportFromExport(
        rawExportData,
        assistantConfig.id,
        isPersonalReport ? 'personal' : 'sharable'
      );

      usingOpenAI = true;
      console.log('✅ Clean AST report generation successful');
    } catch (openaiError) {
      console.log('⚠️ OpenAI failed, falling back to Claude:', openaiError.message);

      // Fallback to Claude API directly with clean approach
      console.log('🤖 Using Claude API for report generation...');
      const { generateClaudeCoachingResponse } = await import('../services/claude-api-service.js');

      // Create simple fallback message for Claude
      const fallbackMessage = `Generate a comprehensive ${isPersonalReport ? 'Personal Development Report' : 'Professional Profile Report'} for ${user.name} using their assessment data.`;

      reportContent = await generateClaudeCoachingResponse({
        userMessage: fallbackMessage,
        personaType: 'star_report',
        userName: user.name,
        contextData: {
          reportContext: 'holistic_generation',
          selectedUserId: userId,
          selectedUserName: user.name,
          adminMode: false,
          userData: rawExportData,
          starCardImageBase64: starCardImageBase64,
          enhancedPrompting: true
        },
        userId: userId,
        sessionId: `holistic-claude-${reportType}-${userId}-${Date.now()}`,
        maxTokens: 4000
      });
      usingOpenAI = false;
      console.log('✅ Claude fallback report generation successful');
    }

    // Quality monitoring temporarily disabled to focus on foundation
    console.log('📊 Foundation testing mode - quality monitoring disabled');
    
    if (!reportContent || reportContent.trim() === '') {
      throw new Error('Report generation failed: Empty response from Claude API');
    }
    
    // Post-process: Replace StarCard placeholder with actual image data
    if (starCardImageBase64 && reportContent.includes('{{STARCARD_IMAGE}}')) {
      const starCardHtml = `<img src="data:image/png;base64,${starCardImageBase64}" alt="StarCard for ${user.name}" class="starcard-image" style="max-width: 300px; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />`;
      reportContent = reportContent.replace(/\{\{STARCARD_IMAGE\}\}/g, starCardHtml);
      console.log('✅ StarCard placeholder replaced with actual image data');
    }
    
    console.log(`✅ Admin-style report generated successfully (${reportContent.length} chars)`);
    
    // Extract actual StarCard assessment data from user assessments
    const starCardAssessment = assessmentResult.rows.find(a => a.assessment_type === 'starCard');
    let actualStrengths = { thinking: 0, acting: 0, feeling: 0, planning: 0 };
    
    if (starCardAssessment && starCardAssessment.results) {
      try {
        const starCardData = JSON.parse(starCardAssessment.results as string);
        actualStrengths = {
          thinking: starCardData.thinking || 0,
          acting: starCardData.acting || 0,
          feeling: starCardData.feeling || 0,
          planning: starCardData.planning || 0
        };
        console.log(`✅ Extracted actual user strengths data:`, actualStrengths);
      } catch (error) {
        console.warn(`⚠️ Failed to parse StarCard data for user ${userId}, using defaults:`, error);
      }
    } else {
      console.warn(`⚠️ No StarCard assessment found for user ${userId}, using default values`);
    }

    // Structure the data for the holistic report system
    const reportData = {
      participant: {
        name: user.name,
        title: user.username,
        organization: '',
        completedAt: new Date(user.ast_completed_at || Date.now())
      },
      strengths: {
        thinking: actualStrengths.thinking,
        acting: actualStrengths.acting,
        feeling: actualStrengths.feeling,
        planning: actualStrengths.planning,
        topStrengths: [],
        strengthInsights: []
      },
      flow: {
        attributes: [],
        flowInsights: [],
        preferredWorkStyle: []
      },
      vision: {
        currentState: '',
        futureVision: '',
        obstacles: [],
        strengths: [],
        actionSteps: []
      },
      growth: {
        developmentAreas: [],
        recommendedActions: [],
        teamCollaborationTips: []
      },
      reportType: reportType,
      generatedAt: new Date(),
      workshopVersion: '2.1',
      generatedBy: `Star Report Talia (${usingOpenAI ? 'OpenAI' : 'Claude'} via Admin Console Method)`,
      personalReport: isPersonalReport ? reportContent : '',
      professionalProfile: !isPersonalReport ? reportContent : '',
      starCardImageBase64: starCardImageBase64,
      userData: {
        user: user,
        assessments: assessmentResult.rows,
        stepData: stepDataResult.rows
      }
    };
    
    console.log(`✅ Complete admin-style report data generated for user ${userId}`);
    return reportData;
    
  } catch (error) {
    console.error(`❌ Error generating admin-style report for user ${userId}:`, error);
    
    // Fallback to mock data
    console.log(`🔄 Falling back to mock data service for user ${userId}`);
    return await mockReportDataService.generateMockReportData(userId, reportType);
  }
}

// Removed getStarCardImagePath function - using getUserStarCard from photo-storage-service instead

/**
 * Generate HTML version of the report
 */
function generateHtmlReport(reportData: any, reportType: string): string {
  const title = reportType === 'standard' ? 'Professional Development Report' : 'Personal Development Report';
  const isPersonalReport = reportType === 'personal';
  
  // Order strengths from highest to lowest percentage
  const strengthsArray = [
    { name: 'thinking', value: reportData.strengths?.thinking || 0, color: '#01a252', bgColor: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)' },
    { name: 'acting', value: reportData.strengths?.acting || 0, color: '#f14040', bgColor: 'linear-gradient(135deg, #ffebee 0%, #fff5f5 100%)' },
    { name: 'feeling', value: reportData.strengths?.feeling || 0, color: '#167efd', bgColor: 'linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%)' },
    { name: 'planning', value: reportData.strengths?.planning || 0, color: '#ffcb2f', bgColor: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }
  ].sort((a, b) => b.value - a.value);
  
  // Get StarCard image from base64 data (no longer using temp files)
  let starCardImageTag = '';
  {
    const starCardImage = reportData.starCardImageBase64 || (reportData.starCardData?.photoData) || '';
    console.log(`🖼️ StarCard debug for HTML report generation:`);
    console.log(`   - starCardImageBase64 length: ${reportData.starCardImageBase64?.length || 0}`);
    console.log(`   - starCardData exists: ${!!reportData.starCardData}`);
    console.log(`   - starCardData.photoData length: ${reportData.starCardData?.photoData?.length || 0}`);
    if (starCardImage) {
      // Clean base64 data if needed
      const cleanBase64 = starCardImage.replace(/^data:image\/[a-z]+;base64,/, '');
      starCardImageTag = `<img src="data:image/png;base64,${cleanBase64}" alt="StarCard" style="max-width: 400px; height: auto; margin: 20px 0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />`;
      console.log(`✅ StarCard image tag created for HTML report`);
    } else {
      console.log(`⚠️ No StarCard image data found for HTML report`);
    }
  }
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${reportData.participant?.name || 'User'}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f9f9f9;
                margin: 0;
                padding: 20px;
            }
            
            .report-container {
                max-width: 1000px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 2.5rem;
                margin: 0 0 20px 0;
                font-weight: 300;
            }
            
            .participant-info h2 {
                font-size: 2rem;
                margin: 0 0 10px 0;
            }
            
            .participant-info p {
                margin: 5px 0;
                opacity: 0.9;
            }
            
            .content-section {
                padding: 40px;
            }
            
            .section-title {
                font-size: 1.8rem;
                color: #2563eb;
                margin: 0 0 30px 0;
                padding-bottom: 10px;
                border-bottom: 2px solid #e5e7eb;
            }
            
            /* Introduction Text */
            .intro-text {
                font-style: italic;
                color: #6c757d;
                border-left: 4px solid #e2e8f0;
                padding-left: 20px;
                margin-bottom: 30px;
                font-size: 1.1rem;
                line-height: 1.7;
            }
            
            /* Pie Chart Section */
            .pie-chart-section {
                text-align: center;
                margin: 30px 0;
            }
            
            .pie-container {
                position: relative;
                width: 700px;
                height: 500px;
                margin: 0 auto;
            }
            
            .pie-svg {
                width: 100%;
                height: 100%;
            }
            
            .strength-label {
                font-family: 'Segoe UI', sans-serif;
                font-weight: 600;
                font-size: 14px;
                text-anchor: middle;
            }
            
            .percentage-label {
                font-family: 'Segoe UI', sans-serif;
                font-weight: 700;
                font-size: 12px;
                text-anchor: middle;
            }
            
            /* Strengths Grid */
            .strengths-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 30px 0;
            }
            
            .strength-card {
                padding: 20px;
                border-radius: 12px;
                border-left: 5px solid;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .strength-card.thinking {
                background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
                border-left-color: #01a252;
            }
            
            .strength-card.planning {
                background: linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%);
                border-left-color: #ffcb2f;
            }
            
            .strength-card.feeling {
                background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
                border-left-color: #167efd;
            }
            
            .strength-card.acting {
                background: linear-gradient(135deg, #ffebee 0%, #fff5f5 100%);
                border-left-color: #f14040;
            }
            
            .strength-header {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .strength-number {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-right: 12px;
                font-size: 1rem;
            }
            
            .strength-title {
                font-size: 16px;
                font-weight: 600;
                flex: 1;
                color: #374151;
            }
            
            .strength-percentage {
                font-size: 18px;
                font-weight: 700;
                color: #2563eb;
            }
            
            .strength-description {
                font-size: 14px;
                line-height: 1.6;
                color: #4a5568;
            }
            
            .profile-summary {
                background: #fefbf3;
                border-left: 4px solid #f59e0b;
                padding: 20px;
                margin-top: 20px;
                border-radius: 0 8px 8px 0;
            }
            
            .profile-summary p {
                margin: 8px 0;
                line-height: 1.6;
            }
            
            .ai-content {
                background: #fdfdfd;
                border-radius: 12px;
                padding: 30px;
                margin: 20px 0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                line-height: 1.6;
            }
            
            .personal-section {
                background: #fefbf3;
                border: 2px solid #f59e0b;
                border-radius: 12px;
                padding: 25px;
                margin: 40px 0;
            }
            
            .professional-conclusion {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border: 2px solid #475569;
                border-radius: 12px;
                padding: 30px;
                margin: 40px 0;
                position: relative;
                overflow: hidden;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            }
            
            .professional-conclusion::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #1e40af, #3b82f6, #06b6d4);
            }
            
            .professional-conclusion::after {
                content: '';
                position: absolute;
                bottom: 0;
                right: 0;
                width: 80px;
                height: 80px;
                background: linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 70%);
                border-top-left-radius: 100%;
            }
            
            /* Enhanced professional report styling */
            .professional-highlights {
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                border: 1px solid #3b82f6;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
                position: relative;
            }
            
            .professional-highlights::before {
                content: "💼";
                position: absolute;
                top: -10px;
                left: 20px;
                background: white;
                padding: 0 8px;
                font-size: 18px;
            }
            
            .professional-action-items {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-left: 4px solid #22c55e;
                border-radius: 0 8px 8px 0;
                padding: 20px;
                margin: 25px 0;
            }
            
            .professional-signature {
                text-align: center;
                padding: 30px;
                background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
                border-top: 3px solid #2563eb;
                margin-top: 40px;
                border-radius: 0 0 12px 12px;
            }
            
            .professional-signature h3 {
                color: #1f2937;
                font-size: 1.3rem;
                margin-bottom: 15px;
                font-weight: 600;
            }
            
            .professional-signature p {
                color: #6b7280;
                font-style: italic;
                line-height: 1.6;
                max-width: 600px;
                margin: 0 auto;
            }
            
            .footer {
                background: #f8fafc;
                padding: 30px;
                text-align: center;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
                margin: 5px 0;
            }
            
            @media print {
                body { background: white; padding: 0; }
                .report-container { box-shadow: none; }
            }
            
            @media (max-width: 768px) {
                .visual-layout { grid-template-columns: 1fr; }
                .strengths-grid { grid-template-columns: 1fr; }
                .content-section { padding: 20px; }
                .professional-conclusion { padding: 20px; margin: 20px 0; }
                .professional-highlights, .professional-action-items { padding: 15px; margin: 15px 0; }
                .professional-signature { padding: 20px; }
                div[style*="grid-template-columns: 1fr 1fr"] { 
                    display: block !important; 
                }
                div[style*="grid-template-columns: 1fr 1fr"] > div {
                    margin-bottom: 15px !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="report-container">
            <div class="header">
                <h1>${title}</h1>
                <div class="participant-info">
                    <h2>${reportData.participant?.name || 'User'}</h2>
                    <p>Generated on ${new Date(reportData.generatedAt || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    })} at ${new Date(reportData.generatedAt || Date.now()).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}</p>
                </div>
            </div>
            
            <div class="content-section">
                <h2 class="section-title">Your Strengths Profile</h2>
                
                <p class="intro-text">You possess a unique combination of strengths that shapes how you naturally approach challenges, collaborate with others, and create value in your work.</p>

                ${reportData.strengths ? `
                <!-- StarCard Image -->
                ${starCardImageTag ? `<div style="text-align: center; margin: 30px 0;">${starCardImageTag}</div>` : ''}
                
                <!-- Pie Chart Visualization -->
                <div class="pie-chart-section">
                    <div class="pie-container">
                        <svg class="pie-svg" viewBox="0 0 500 500">
                            ${generatePieChartSegments(strengthsArray)}
                            ${generatePieChartLabels(strengthsArray)}
                        </svg>
                    </div>
                </div>

                <!-- Strengths Details Grid (Ordered by percentage) -->
                <div class="strengths-grid">
                    ${strengthsArray.map((strength, index) => `
                    <div class="strength-card ${strength.name}" style="background: ${strength.bgColor}; border-left-color: ${strength.color};">
                        <div class="strength-header">
                            <div class="strength-number" style="background: ${strength.color}; ${strength.name === 'planning' ? 'color: #333;' : ''}">${index + 1}</div>
                            <div>
                                <div class="strength-title">${strength.name.toUpperCase()}</div>
                                <div class="strength-percentage">${strength.value}%</div>
                            </div>
                        </div>
                        <div class="strength-description">
                            ${getStrengthDescription(strength.name)}
                        </div>
                    </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>

            ${reportData.professionalProfile ? `
            <div class="content-section ${!isPersonalReport ? 'professional-conclusion' : ''}">
                <h2 class="section-title">${isPersonalReport ? 'Personal Development Insights' : 'Professional Development Analysis'}</h2>
                
                ${!isPersonalReport ? `
                <div class="professional-highlights">
                    <h4 style="color: #1e40af; font-size: 1.1rem; font-weight: 600; margin-bottom: 12px;">Professional Strengths Overview</h4>
                    <p style="color: #374151; line-height: 1.6; margin: 0;">
                        Your unique combination of ${strengthsArray[0]?.name || 'thinking'} (${strengthsArray[0]?.value || 0}%) and ${strengthsArray[1]?.name || 'acting'} (${strengthsArray[1]?.value || 0}%) creates a distinctive professional signature that drives exceptional results in collaborative environments.
                    </p>
                </div>
                ` : ''}
                
                <div class="ai-content">${formatAIContentForHTML(reportData.professionalProfile)}</div>
                
                ${!isPersonalReport ? `
                <div class="professional-action-items">
                    <h4 style="color: #166534; font-size: 1.1rem; font-weight: 600; margin-bottom: 12px;">🎯 Strategic Application</h4>
                    <p style="color: #374151; line-height: 1.6; margin: 0;">
                        Focus on roles and projects that leverage your dominant ${strengthsArray[0]?.name || 'thinking'} strength while developing complementary skills in your secondary areas. 
                        This balanced approach maximizes your professional impact and leadership potential.
                    </p>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
                    <h3 style="color: #374151; font-size: 1.2rem; font-weight: 600; margin-bottom: 15px;">📊 Key Professional Insights</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 3px solid #3b82f6;">
                            <h5 style="color: #1e40af; font-size: 0.9rem; font-weight: 600; margin: 0 0 8px 0;">Collaboration Style</h5>
                            <p style="color: #6b7280; font-size: 0.85rem; line-height: 1.5; margin: 0;">
                                ${strengthsArray[0]?.name === 'feeling' ? 'Relationship-focused with strong emotional intelligence' : 
                                  strengthsArray[0]?.name === 'thinking' ? 'Analytical and strategic in approach' :
                                  strengthsArray[0]?.name === 'acting' ? 'Results-oriented with high execution capability' :
                                  'Structured and detail-oriented with excellent planning skills'}
                            </p>
                        </div>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 3px solid #22c55e;">
                            <h5 style="color: #166534; font-size: 0.9rem; font-weight: 600; margin: 0 0 8px 0;">Leadership Potential</h5>
                            <p style="color: #6b7280; font-size: 0.85rem; line-height: 1.5; margin: 0;">
                                Your ${strengthsArray[0]?.value || 0}% ${strengthsArray[0]?.name || 'thinking'} strength positions you as a natural ${strengthsArray[0]?.name === 'feeling' ? 'people leader' : strengthsArray[0]?.name === 'thinking' ? 'strategic leader' : strengthsArray[0]?.name === 'acting' ? 'execution leader' : 'operational leader'}
                            </p>
                        </div>
                    </div>
                    <p style="color: #6b7280; font-style: italic; line-height: 1.6;">
                        This professional analysis provides actionable insights for leveraging your unique strengths profile in collaborative and leadership contexts. 
                        Your strengths combination creates distinctive opportunities for professional impact and team contribution.
                    </p>
                </div>
                ` : ''}
            </div>
            ` : ''}

            ${isPersonalReport && reportData.personalReport ? `
            <div class="content-section personal-section">
                <h2 class="section-title">Personal Reflection & Development Guidance</h2>
                <div class="ai-content">${formatAIContentForHTML(reportData.personalReport)}</div>
            </div>
            ` : ''}
            
            ${!isPersonalReport ? `
            <div class="professional-signature">
                <h3>Your Professional Development Journey</h3>
                <p>
                    This analysis represents a comprehensive assessment of your professional strengths and collaborative potential. 
                    Use these insights to guide your career development, team positioning, and leadership growth opportunities.
                </p>
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #d1d5db;">
                    <small style="color: #9ca3af; font-size: 0.8rem;">
                        Your unique strengths signature: ${strengthsArray[0]?.name?.toUpperCase() || 'THINKING'} (${strengthsArray[0]?.value || 0}%) + ${strengthsArray[1]?.name?.toUpperCase() || 'ACTING'} (${strengthsArray[1]?.value || 0}%)
                    </small>
                </div>
            </div>
            ` : ''}
            
            <div class="footer">
                <p>Generated by AllStarTeams Workshop | ${reportData.workshopVersion || 'v2.0'}</p>
                <p>${isPersonalReport ? 'Personal Report - For Your Private Use' : 'Professional Report - Suitable for Sharing'}</p>
                <p>Report ID: ${reportData.reportId || 'N/A'}</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Test endpoint: View PDF report in browser (development only)
 * GET /api/reports/holistic/test-view/:reportType/:userId
 */
router.get('/test-view/:reportType/:userId', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Endpoint not available in production' });
  }

  const { reportType, userId } = req.params;

  if (!['standard', 'personal'].includes(reportType)) {
    return res.status(400).json({ error: 'Invalid report type' });
  }

  try {
    const result = await pool.query(
      'SELECT pdf_file_path, pdf_file_name FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3',
      [parseInt(userId), reportType, 'completed']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or not completed' });
    }

    const { pdf_file_path, pdf_file_name } = result.rows[0];
    
    // Check if file exists
    try {
      await fs.access(pdf_file_path);
    } catch {
      return res.status(404).json({ error: 'Report file not found' });
    }

    // Set headers for PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf_file_name}"`);
    
    // Stream the PDF file
    const fileBuffer = await fs.readFile(pdf_file_path);
    res.send(fileBuffer);

  } catch (error) {
    console.error('Error serving test PDF:', error);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

/**
 * Test endpoint: Download PDF report (development only)
 * GET /api/reports/holistic/test-download/:reportType/:userId
 */
router.get('/test-download/:reportType/:userId', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Endpoint not available in production' });
  }

  const { reportType, userId } = req.params;

  if (!['standard', 'personal'].includes(reportType)) {
    return res.status(400).json({ error: 'Invalid report type' });
  }

  try {
    const result = await pool.query(
      'SELECT pdf_file_path, pdf_file_name FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3',
      [parseInt(userId), reportType, 'completed']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or not completed' });
    }

    const { pdf_file_path, pdf_file_name } = result.rows[0];
    
    // Check if file exists
    try {
      await fs.access(pdf_file_path);
    } catch {
      return res.status(404).json({ error: 'Report file not found' });
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdf_file_name}"`);
    
    // Stream the PDF file
    const fileBuffer = await fs.readFile(pdf_file_path);
    res.send(fileBuffer);

  } catch (error) {
    console.error('Error downloading test PDF:', error);
    res.status(500).json({ error: 'Failed to download report' });
  }
});

/**
 * Debug endpoint: Export complete admin data (development only)
 * GET /api/reports/holistic/export-admin-data
 */
router.get('/export-admin-data', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Endpoint not available in production' });
  }

  try {
    const userId = 1; // Admin user
    
    // Get user info first
    const userResult = await pool.query('SELECT id, name, username, role, created_at FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userResult.rows[0];
    
    // Get navigation progress
    const progressResult = await pool.query(`
      SELECT current_step, completed_steps, holistic_reports_unlocked, 
             standard_report_generated, personal_report_generated, workshop_completed
      FROM navigation_progress WHERE user_id = $1
    `, [userId]);
    
    userData.navigation_progress = progressResult.rows[0] || null;
    
    // Get all assessments
    const assessmentsResult = await pool.query(`
      SELECT assessment_type, results, created_at, updated_at
      FROM user_assessments 
      WHERE user_id = $1 
      ORDER BY assessment_type, created_at DESC
    `, [userId]);
    
    userData.assessments = assessmentsResult.rows.map(row => ({
      assessment_type: row.assessment_type,
      results: JSON.parse(row.results),
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    
    // Get holistic reports
    const reportsResult = await pool.query(`
      SELECT id, report_type, generation_status, generated_at, 
             pdf_file_name, pdf_file_size, star_card_image_path, error_message
      FROM holistic_reports 
      WHERE user_id = $1 
      ORDER BY generated_at DESC
    `, [userId]);
    
    userData.holistic_reports = reportsResult.rows;
    
    // Set headers for file download
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `admin-user-export-${timestamp}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.json({
      export_timestamp: new Date().toISOString(),
      export_type: 'admin_user_complete_data',
      user_count: 1,
      users: [userData]
    });
    
  } catch (error) {
    console.error('Admin export error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate pie chart segments for ordered strengths
 */
function generatePieChartSegments(strengthsArray: any[]): string {
  let cumulativeAngle = 0;
  const centerX = 250;
  const centerY = 250;
  const radius = 150;
  
  return strengthsArray.map((strength) => {
    const angle = (strength.value / 100) * 360;
    const startAngle = cumulativeAngle - 90; // Start from top
    const endAngle = startAngle + angle;
    
    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Calculate path coordinates
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    cumulativeAngle += angle;
    
    return `<path d="${pathData}" fill="${strength.color}" stroke="white" stroke-width="2"/>`;
  }).join('\n                            ');
}

/**
 * Generate pie chart labels positioned outside the pie
 */
function generatePieChartLabels(strengthsArray: any[]): string {
  let cumulativeAngle = 0;
  const centerX = 250;
  const centerY = 250;
  const labelRadius = 220; // Distance from center for labels
  
  return strengthsArray.map((strength) => {
    const angle = (strength.value / 100) * 360;
    const midAngle = cumulativeAngle + (angle / 2) - 90; // Middle of segment, starting from top
    
    // Convert to radians
    const midRad = (midAngle * Math.PI) / 180;
    
    // Calculate label position
    const labelX = centerX + labelRadius * Math.cos(midRad);
    const labelY = centerY + labelRadius * Math.sin(midRad);
    
    cumulativeAngle += angle;
    
    return `
                            <text x="${labelX}" y="${labelY - 8}" text-anchor="middle" fill="${strength.color}" style="font-weight: bold; font-size: 16px; font-family: 'Segoe UI', sans-serif;">
                                ${strength.name.toUpperCase()}: ${strength.value}%
                            </text>`;
  }).join('');
}

/**
 * Get strength description based on strength name
 */
function getStrengthDescription(strengthName: string): string {
  const descriptions = {
    thinking: "Your analytical powerhouse. You naturally approach challenges systematically, design elegant solutions, and see patterns others miss. This isn't just problem-solving - it's solution architecture.",
    acting: "Your decisive moment capability. When urgency strikes, you shift gears and drive execution. This complements your thoughtful approach with the ability to act decisively when needed.",
    feeling: "Your empathetic leadership edge. You ensure everyone feels heard, mediate conflicts gracefully, and bring diverse perspectives together. This is what transforms good teams into great ones.",
    planning: "Your organizational excellence. You create realistic timelines, anticipate dependencies, and build systems that actually work in the real world. This is strategic thinking in action."
  };
  return descriptions[strengthName] || "Your unique strength that contributes to your overall effectiveness and team collaboration.";
}

/**
 * Format AI content for HTML display with proper structure
 */
function formatAIContentForHTML(content: string): string {
  if (!content || !content.trim()) return '';
  
  let processed = content;
  
  // Handle bold text (**text** -> <strong>text</strong>)
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle italic text (*text* -> <em>text</em>)
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Handle inline code (`code` -> <code>code</code>)
  processed = processed.replace(/`([^`]+)`/g, '<code style="background-color: #f1f5f9; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
  
  // Split into paragraphs and format properly
  const paragraphs = processed.split(/\n\n+/).filter(p => p.trim());
  
  return paragraphs.map(paragraph => {
    const trimmed = paragraph.trim();
    
    // Handle markdown headers - convert to proper HTML structure
    if (trimmed.startsWith('####')) {
      const title = trimmed.replace(/^####\s*/, '').trim();
      return `<h5 style="font-size: 1.1rem; font-weight: 600; color: #6b7280; margin: 12px 0 6px 0;">${title}</h5>`;
    }
    if (trimmed.startsWith('###')) {
      const title = trimmed.replace(/^###\s*/, '').trim();
      return `<h4 style="font-size: 1.2rem; font-weight: 600; color: #4b5563; margin: 16px 0 8px 0;">${title}</h4>`;
    }
    if (trimmed.startsWith('##')) {
      const title = trimmed.replace(/^##\s*/, '').trim();
      return `<h3 style="font-size: 1.4rem; font-weight: 600; color: #374151; margin: 20px 0 12px 0; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">${title}</h3>`;
    }
    if (trimmed.startsWith('#')) {
      const title = trimmed.replace(/^#\s*/, '').trim();
      return `<h2 style="font-size: 1.6rem; font-weight: 700; color: #1f2937; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">${title}</h2>`;
    }
    
    // Handle bullet points - convert to professional lists
    if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
      const items = trimmed.split(/\n?- /).filter(item => item.trim()).map(item => item.trim());
      return `
        <ul style="margin: 12px 0; padding-left: 20px; list-style-type: disc;">
          ${items.map(item => `<li style="margin: 6px 0; line-height: 1.6;">${item}</li>`).join('')}
        </ul>
      `;
    }
    
    // Handle numbered lists
    if (/^\d+\./.test(trimmed) || /\n\d+\./.test(trimmed)) {
      const items = trimmed.split(/\n?\d+\./).filter(item => item.trim()).map(item => item.trim());
      return `
        <ol style="margin: 12px 0; padding-left: 20px;">
          ${items.map(item => `<li style="margin: 6px 0; line-height: 1.6;">${item}</li>`).join('')}
        </ol>
      `;
    }
    
    // Handle blockquotes (> text)
    if (trimmed.startsWith('> ')) {
      const quote = trimmed.replace(/^>\s*/, '').trim();
      return `<blockquote style="border-left: 4px solid #2563eb; padding-left: 20px; margin: 16px 0; font-style: italic; color: #4b5563; background-color: #f8fafc; padding: 12px 20px; border-radius: 0 4px 4px 0;">${quote}</blockquote>`;
    }
    
    // Handle quotes with quotation marks
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return `<blockquote style="border-left: 4px solid #2563eb; padding-left: 20px; margin: 16px 0; font-style: italic; color: #4b5563;">${trimmed.slice(1, -1)}</blockquote>`;
    }
    
    // Handle horizontal rules (--- or ***)
    if (trimmed === '---' || trimmed === '***') {
      return `<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 24px 0;">`;
    }
    
    // Handle line breaks within paragraphs (single \n)
    const processedParagraph = trimmed.replace(/\n(?!\n)/g, '<br>');
    
    // Regular paragraphs
    if (processedParagraph.trim()) {
      return `<p style="margin: 12px 0; line-height: 1.6; color: #374151; text-align: justify;">${processedParagraph}</p>`;
    }
    
    return '';
  }).filter(p => p).join('');
}

export default router;