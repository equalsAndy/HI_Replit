import express from 'express';
import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '../middleware/auth.js';
import { 
  GenerateReportRequest, 
  GenerateReportResponse, 
  ReportStatusResponse,
  HolisticReport,
  ReportType 
} from '../../shared/holistic-report-types';
import { mockReportDataService } from '../services/mock-report-data-service';
import { pdfReportService } from '../services/pdf-report-service';
import { generateClaudeCoachingResponse } from '../services/claude-api-service';
import { taliaPersonaService } from '../services/talia-personas';
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
      if (existing.generation_status === 'completed') {
        return res.status(409).json({
          success: false,
          message: `Test user has already generated a ${reportType} report. Only one report per type is allowed.`,
          reportId: existing.id,
          status: 'completed'
        });
      }
      
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

    // Generate star card image (if not exists)
    const starCardImagePath = await generateStarCardImage(userId);
    reportData.starCardImagePath = starCardImagePath;

    // Generate PDF
    console.log('🎯 Generating PDF document');
    const pdfBuffer = await pdfReportService.generatePDF(reportData, starCardImagePath);
    
    // Save PDF to file system
    const pdfFilePath = await pdfReportService.savePDF(pdfBuffer, userId, reportType);
    const pdfFileName = `${reportData.participant.name}-${reportType}-report.pdf`;
    
    // Update database with complete report
    await pool.query(
      `UPDATE holistic_reports SET 
        report_data = $1, 
        pdf_file_path = $2, 
        pdf_file_name = $3, 
        pdf_file_size = $4,
        star_card_image_path = $5,
        generation_status = $6,
        updated_at = NOW()
       WHERE id = $7`,
      [
        JSON.stringify(reportData),
        pdfFilePath,
        pdfFileName,
        pdfBuffer.length,
        starCardImagePath,
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
router.post('/generate', requireAuth, async (req, res) => {
  const { reportType }: GenerateReportRequest = req.body;
  const userId = req.session?.userId;

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

    // Check if user has already generated this type of report
    const existingReport = await pool.query(
      'SELECT id, generation_status FROM holistic_reports WHERE user_id = $1 AND report_type = $2',
      [userId, reportType]
    );

    if (existingReport.rows.length > 0) {
      const existing = existingReport.rows[0];
      if (existing.generation_status === 'completed') {
        return res.status(409).json({
          success: false,
          message: `You have already generated a ${reportType} report. Only one report per type is allowed.`,
          reportId: existing.id,
          status: 'completed'
        } as GenerateReportResponse);
      }
      
      if (existing.generation_status === 'generating') {
        return res.status(409).json({
          success: false,
          message: `A ${reportType} report is currently being generated. Please wait.`,
          reportId: existing.id,
          status: 'generating'
        } as GenerateReportResponse);
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

    // Generate star card image (if not exists)
    const starCardImagePath = await generateStarCardImage(userId);
    reportData.starCardImagePath = starCardImagePath;

    // Generate PDF
    console.log('🎯 Generating PDF document');
    const pdfBuffer = await pdfReportService.generatePDF(reportData, starCardImagePath);
    
    // Save PDF to file system
    const pdfFilePath = await pdfReportService.savePDF(pdfBuffer, userId, reportType);
    const pdfFileName = `${reportData.participant.name}-${reportType}-report.pdf`;
    
    // Update database with complete report
    await pool.query(
      `UPDATE holistic_reports SET 
        report_data = $1, 
        pdf_file_path = $2, 
        pdf_file_name = $3, 
        pdf_file_size = $4,
        star_card_image_path = $5,
        generation_status = $6,
        updated_at = NOW()
       WHERE id = $7`,
      [
        JSON.stringify(reportData),
        pdfFilePath,
        pdfFileName,
        pdfBuffer.length,
        starCardImagePath,
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
      response.pdfUrl = `/api/reports/holistic/test-view/${reportType}/${userId}`;
      response.downloadUrl = `/api/reports/holistic/test-download/${reportType}/${userId}`;
    }

    res.json(response);

  } catch (error) {
    console.error('Error fetching test report status:', error);
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
      'SELECT id, generation_status, generated_at, error_message FROM holistic_reports WHERE user_id = $1 AND report_type = $2',
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
      response.pdfUrl = `/api/reports/holistic/${reportType}/view`;
      response.downloadUrl = `/api/reports/holistic/${reportType}/download`;
    }

    res.json(response);

  } catch (error) {
    console.error('Error fetching report status:', error);
    res.status(500).json({ error: 'Failed to fetch report status' });
  }
});

/**
 * View PDF report in browser
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
      'SELECT pdf_file_path, pdf_file_name FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3',
      [userId, reportType, 'completed']
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
    console.error('Error serving PDF:', error);
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
      'SELECT pdf_file_path, pdf_file_name FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3',
      [userId, reportType, 'completed']
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
    console.error('Error downloading PDF:', error);
    res.status(500).json({ error: 'Failed to download report' });
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
 * Generate report using Star Report Talia AI persona
 */
async function generateReportUsingTalia(userId: number, reportType: ReportType): Promise<any> {
  try {
    console.log(`🎆 Starting Star Report Talia generation for user ${userId}, type: ${reportType}`);
    
    // Get comprehensive user context for the report
    const reportContext = await taliaPersonaService.getReportContext(userId.toString());
    
    if (!reportContext) {
      console.log(`⚠️ No report context found for user ${userId}, falling back to mock data`);
      return await mockReportDataService.generateMockReportData(userId, reportType);
    }
    
    console.log(`📊 Found assessment data types:`, Object.keys(reportContext.assessments));
    
    // Generate personal development report using Talia
    console.log(`🤖 Generating personal report using Star Report Talia...`);
    const personalPrompt = await taliaPersonaService.generateReportPrompt(
      reportContext, 
      reportType, 
      'personal'
    );
    
    const personalReport = await generateClaudeCoachingResponse({
      userMessage: personalPrompt,
      personaType: 'talia', // This triggers Star Report Talia mode
      userName: reportContext.user.name,
      userId: userId,
      contextData: reportContext,
      maxTokens: 4000,
      sessionId: `holistic-report-${userId}-${Date.now()}`
    });
    
    console.log(`✅ Personal report generated (${personalReport.length} characters)`);
    
    // Generate professional profile using Talia
    console.log(`🤖 Generating professional profile using Star Report Talia...`);
    const professionalPrompt = await taliaPersonaService.generateReportPrompt(
      reportContext,
      reportType,
      'professional'
    );
    
    const professionalProfile = await generateClaudeCoachingResponse({
      userMessage: professionalPrompt,
      personaType: 'talia', // This triggers Star Report Talia mode
      userName: reportContext.user.name,
      userId: userId,
      contextData: reportContext,
      maxTokens: 3000,
      sessionId: `professional-profile-${userId}-${Date.now()}`
    });
    
    console.log(`✅ Professional profile generated (${professionalProfile.length} characters)`);
    
    // Get star card data from assessments
    const starCardData = reportContext.assessments.starCard || {
      thinking: 25,
      acting: 25,
      feeling: 25,
      planning: 25
    };

    // Structure the data in the format expected by the PDF service
    const reportData = {
      participant: {
        name: reportContext.user.name,
        title: reportContext.user.email || '',
        organization: '',
        completedAt: new Date()
      },
      strengths: {
        thinking: starCardData.thinking,
        acting: starCardData.acting,
        feeling: starCardData.feeling,
        planning: starCardData.planning,
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
      workshopVersion: '2.0',
      // Custom properties for AI-generated content
      generatedBy: 'Star Report Talia',
      personalReport: personalReport,
      professionalProfile: professionalProfile,
      assessmentData: reportContext.assessments
    };
    
    console.log(`✅ Complete report data structure generated for user ${userId}`);
    return reportData;
    
  } catch (error) {
    console.error(`❌ Error generating report with Star Report Talia for user ${userId}:`, error);
    
    // Fallback to mock data if AI generation fails
    console.log(`🔄 Falling back to mock data service for user ${userId}`);
    return await mockReportDataService.generateMockReportData(userId, reportType);
  }
}

/**
 * Helper function to generate star card image for report
 */
async function generateStarCardImage(userId: number): Promise<string> {
  const imagesDir = path.join(process.cwd(), 'storage', 'star-cards');
  await fs.mkdir(imagesDir, { recursive: true });
  
  const imagePath = path.join(imagesDir, `user-${userId}-star-card.png`);
  
  // Check if image already exists
  try {
    await fs.access(imagePath);
    console.log('✅ Using existing star card image:', imagePath);
    return imagePath;
  } catch {
    // Image doesn't exist, we'll use a placeholder for now
    // In a real implementation, this would trigger star card generation
    console.log('⚠️ Star card image not found, using placeholder');
    
    // Create a simple placeholder image file path
    // The PDF service will handle missing images gracefully
    return imagePath;
  }
}

export default router;