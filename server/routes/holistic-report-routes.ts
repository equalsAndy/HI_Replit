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

    // Get star card image from photo service
    const starCardImagePath = await getStarCardImagePath(userId);
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

    // TEMPORARILY DISABLED: Check if user has already generated this type of report
    // This restriction is disabled for testing purposes
    const existingReport = await pool.query(
      'SELECT id, generation_status FROM holistic_reports WHERE user_id = $1 AND report_type = $2',
      [userId, reportType]
    );

    if (existingReport.rows.length > 0) {
      const existing = existingReport.rows[0];
      // TESTING: Allow regeneration even if completed
      // if (existing.generation_status === 'completed') {
      //   return res.status(409).json({
      //     success: false,
      //     message: `You have already generated a ${reportType} report. Only one report per type is allowed.`,
      //     reportId: existing.id,
      //     status: 'completed'
      //   } as GenerateReportResponse);
      // }
      
      // Still prevent concurrent generation attempts
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

    // Get star card image from photo service
    const starCardImagePath = await getStarCardImagePath(userId);
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
      response.htmlUrl = `/api/reports/holistic/${reportType}/html`;
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
      'SELECT report_data FROM holistic_reports WHERE user_id = $1 AND report_type = $2 AND generation_status = $3',
      [userId, reportType, 'completed']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or not completed' });
    }

    const reportData = result.rows[0].report_data;
    
    // Generate HTML view of the report
    const htmlContent = generateHtmlReport(reportData, reportType);
    
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
    console.log(`🎆 Starting Star Report Talia generation using AST methodology for user ${userId}, type: ${reportType}`);
    
    // Import and use the specialized AST report service
    const { astReportService } = await import('../services/ast-report-service.js');
    
    // Get user's AST workshop data
    const userData = await astReportService.getUserASTData(userId.toString());
    
    if (!userData) {
      console.log(`⚠️ No AST data found for user ${userId}, falling back to mock data`);
      return await mockReportDataService.generateMockReportData(userId, reportType);
    }
    
    console.log(`📊 Found AST data for user ${userData.userName}, generating reports using trained Talia methodology...`);
    
    // Generate comprehensive AST reports using Talia coaching methodology
    const reports = await astReportService.generateASTReports(userData);
    
    console.log(`✅ AST reports generated successfully (Personal: ${reports.personalReport.length} chars, Professional: ${reports.professionalProfile.length} chars)`);
    
    // Get star card data from user data
    const starCardData = userData.starStrengths;

    // Structure the data in the format expected by the PDF service
    const reportData = {
      participant: {
        name: userData.userName,
        title: '', // Can be extracted from job title if available
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
        futureVision: userData.futureVision,
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
      // Custom properties for AI-generated content using AST methodology
      generatedBy: 'Star Report Talia (AST Methodology)',
      personalReport: reports.personalReport,
      professionalProfile: reports.professionalProfile,
      metadata: reports.metadata,
      // Include StarCard image data for PDF generation
      starCardData: reports.starCardData,
      // Include the raw user data for reference
      userData: userData
    };
    
    console.log(`✅ Complete AST report data structure generated for user ${userId} using trained Talia methodology`);
    return reportData;
    
  } catch (error) {
    console.error(`❌ Error generating AST report with Star Report Talia for user ${userId}:`, error);
    
    // Fallback to mock data if AST generation fails
    console.log(`🔄 Falling back to mock data service for user ${userId}`);
    return await mockReportDataService.generateMockReportData(userId, reportType);
  }
}

/**
 * Helper function to get star card image path from photo service
 */
async function getStarCardImagePath(userId: number): Promise<string> {
  try {
    console.log(`🖼️ Getting StarCard image for user ${userId} from photo service...`);
    
    // Import photo storage service
    const { photoStorageService } = await import('../services/photo-storage-service.js');
    
    // Get StarCard from photo service
    const starCardImage = await photoStorageService.getUserStarCard(userId.toString());
    
    if (starCardImage && starCardImage.filePath) {
      console.log('✅ Found StarCard in photo service:', starCardImage.filePath);
      return starCardImage.filePath;
    }
    
    console.log('⚠️ No StarCard found in photo service, creating fallback...');
    
    // Fallback: create a proper mock StarCard with realistic data
    const imagesDir = path.join(process.cwd(), 'storage', 'star-cards');
    await fs.mkdir(imagesDir, { recursive: true });
    
    const imagePath = path.join(imagesDir, `user-${userId}-star-card-mock.png`);
    
    // Create realistic StarCard if doesn't exist
    try {
      await fs.access(imagePath);
      console.log('📊 Using existing mock StarCard');
    } catch {
      console.log('🎨 Creating realistic mock StarCard...');
      await createMockStarCard(imagePath, userId);
    }
    
    return imagePath;
    
  } catch (error) {
    console.error(`❌ Error getting StarCard image for user ${userId}:`, error);
    
    // Final fallback: return a basic placeholder path
    const imagesDir = path.join(process.cwd(), 'storage', 'star-cards');
    await fs.mkdir(imagesDir, { recursive: true });
    return path.join(imagesDir, `user-${userId}-star-card-error.png`);
  }
}

/**
 * Generate HTML version of the report
 */
function generateHtmlReport(reportData: any, reportType: string): string {
  const title = reportType === 'standard' ? 'Professional Development Report' : 'Personal Development Report';
  const isPersonalReport = reportType === 'personal';
  
  // Get StarCard and pie chart images if available
  const starCardImage = reportData.starCardImageBase64 || (reportData.starCardData?.photoData) || '';
  const pieChartImage = reportData.pieChartImageBase64 || '';
  
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
                width: 300px;
                height: 300px;
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
                white-space: pre-wrap;
                line-height: 1.8;
            }
            
            .personal-section {
                background: #fefbf3;
                border: 2px solid #f59e0b;
                border-radius: 12px;
                padding: 25px;
                margin: 40px 0;
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
                      day: 'numeric',
                      timeZone: 'America/Los_Angeles'
                    })} at ${new Date(reportData.generatedAt || Date.now()).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZone: 'America/Los_Angeles',
                      timeZoneName: 'short'
                    })}</p>
                </div>
            </div>
            
            <div class="content-section">
                <h2 class="section-title">Your Strengths Profile</h2>
                
                <p class="intro-text">You possess a unique combination of strengths that shapes how you naturally approach challenges, collaborate with others, and create value in your work.</p>

                ${reportData.strengths ? `
                <!-- Pie Chart Visualization -->
                <div class="pie-chart-section">
                    <div class="pie-container">
                        <svg class="pie-svg" viewBox="0 0 500 500">
                            <!-- Thinking segment (largest) -->
                            <path d="M 250 100 A 150 150 0 ${(reportData.strengths.thinking || 0) > 50 ? 1 : 0} 1 ${250 + 150 * Math.cos(((reportData.strengths.thinking || 0) * 3.6 - 90) * Math.PI / 180)} ${250 + 150 * Math.sin(((reportData.strengths.thinking || 0) * 3.6 - 90) * Math.PI / 180)} L 250 250 Z" fill="#01a252" />
                            <!-- Acting segment -->
                            <path d="M ${250 + 150 * Math.cos(((reportData.strengths.thinking || 0) * 3.6 - 90) * Math.PI / 180)} ${250 + 150 * Math.sin(((reportData.strengths.thinking || 0) * 3.6 - 90) * Math.PI / 180)} A 150 150 0 0 1 ${250 + 150 * Math.cos((((reportData.strengths.thinking || 0) + (reportData.strengths.acting || 0)) * 3.6 - 90) * Math.PI / 180)} ${250 + 150 * Math.sin((((reportData.strengths.thinking || 0) + (reportData.strengths.acting || 0)) * 3.6 - 90) * Math.PI / 180)} L 250 250 Z" fill="#f14040" />
                            <!-- Feeling segment -->
                            <path d="M ${250 + 150 * Math.cos((((reportData.strengths.thinking || 0) + (reportData.strengths.acting || 0)) * 3.6 - 90) * Math.PI / 180)} ${250 + 150 * Math.sin((((reportData.strengths.thinking || 0) + (reportData.strengths.acting || 0)) * 3.6 - 90) * Math.PI / 180)} A 150 150 0 0 1 ${250 + 150 * Math.cos((((reportData.strengths.thinking || 0) + (reportData.strengths.acting || 0) + (reportData.strengths.feeling || 0)) * 3.6 - 90) * Math.PI / 180)} ${250 + 150 * Math.sin((((reportData.strengths.thinking || 0) + (reportData.strengths.acting || 0) + (reportData.strengths.feeling || 0)) * 3.6 - 90) * Math.PI / 180)} L 250 250 Z" fill="#167efd" />
                            <!-- Planning segment -->
                            <path d="M ${250 + 150 * Math.cos((((reportData.strengths.thinking || 0) + (reportData.strengths.acting || 0) + (reportData.strengths.feeling || 0)) * 3.6 - 90) * Math.PI / 180)} ${250 + 150 * Math.sin((((reportData.strengths.thinking || 0) + (reportData.strengths.acting || 0) + (reportData.strengths.feeling || 0)) * 3.6 - 90) * Math.PI / 180)} A 150 150 0 0 1 250 100 L 250 250 Z" fill="#ffcb2f" />
                            
                            <!-- Percentage labels around the pie (bigger and repositioned) -->
                            <text x="350" y="150" class="percentage-label" text-anchor="middle" fill="white" style="font-weight: bold; font-size: 20px;">THINKING</text>
                            <text x="350" y="175" class="percentage-label" text-anchor="middle" fill="white" style="font-weight: bold; font-size: 24px;">${reportData.strengths.thinking || 0}%</text>
                            
                            <text x="350" y="350" class="percentage-label" text-anchor="middle" fill="white" style="font-weight: bold; font-size: 20px;">ACTING</text>
                            <text x="350" y="375" class="percentage-label" text-anchor="middle" fill="white" style="font-weight: bold; font-size: 24px;">${reportData.strengths.acting || 0}%</text>
                            
                            <text x="150" y="350" class="percentage-label" text-anchor="middle" fill="white" style="font-weight: bold; font-size: 20px;">FEELING</text>
                            <text x="150" y="375" class="percentage-label" text-anchor="middle" fill="white" style="font-weight: bold; font-size: 24px;">${reportData.strengths.feeling || 0}%</text>
                            
                            <text x="250" y="440" class="percentage-label" text-anchor="middle" fill="#333" style="font-weight: bold; font-size: 20px;">PLANNING</text>
                            <text x="250" y="465" class="percentage-label" text-anchor="middle" fill="#333" style="font-weight: bold; font-size: 24px;">${reportData.strengths.planning || 0}%</text>
                        </svg>
                    </div>
                </div>

                <!-- Strengths Details Grid -->
                <div class="strengths-grid">
                    <div class="strength-card thinking">
                        <div class="strength-header">
                            <div class="strength-number" style="background: #01a252;">1</div>
                            <div>
                                <div class="strength-title">THINKING</div>
                                <div class="strength-percentage">${reportData.strengths.thinking || 0}%</div>
                            </div>
                        </div>
                        <div class="strength-description">
                            Your analytical powerhouse. You naturally approach challenges systematically, design elegant solutions, and see patterns others miss. This isn't just problem-solving - it's solution architecture.
                        </div>
                    </div>

                    <div class="strength-card planning">
                        <div class="strength-header">
                            <div class="strength-number" style="background: #ffcb2f; color: #333;">2</div>
                            <div>
                                <div class="strength-title">PLANNING</div>
                                <div class="strength-percentage">${reportData.strengths.planning || 0}%</div>
                            </div>
                        </div>
                        <div class="strength-description">
                            Your organizational excellence. You create realistic timelines, anticipate dependencies, and build systems that actually work in the real world. This is strategic thinking in action.
                        </div>
                    </div>

                    <div class="strength-card feeling">
                        <div class="strength-header">
                            <div class="strength-number" style="background: #167efd;">3</div>
                            <div>
                                <div class="strength-title">FEELING</div>
                                <div class="strength-percentage">${reportData.strengths.feeling || 0}%</div>
                            </div>
                        </div>
                        <div class="strength-description">
                            Your empathetic leadership edge. You ensure everyone feels heard, mediate conflicts gracefully, and bring diverse perspectives together. This is what transforms good teams into great ones.
                        </div>
                    </div>

                    <div class="strength-card acting">
                        <div class="strength-header">
                            <div class="strength-number" style="background: #f14040;">4</div>
                            <div>
                                <div class="strength-title">ACTING</div>
                                <div class="strength-percentage">${reportData.strengths.acting || 0}%</div>
                            </div>
                        </div>
                        <div class="strength-description">
                            Your decisive moment capability. When urgency strikes, you shift gears and drive execution. This complements your thoughtful approach with the ability to act decisively when needed.
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>

            ${reportData.professionalProfile ? `
            <div class="content-section">
                <h2 class="section-title">${isPersonalReport ? 'Personal Development Insights' : 'Professional Development Analysis'}</h2>
                <div class="ai-content">${formatAIContentForHTML(reportData.professionalProfile)}</div>
            </div>
            ` : ''}

            ${isPersonalReport && reportData.personalReport ? `
            <div class="content-section personal-section">
                <h2 class="section-title">Personal Reflection & Development Guidance</h2>
                <div class="ai-content">${formatAIContentForHTML(reportData.personalReport)}</div>
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
 * Format AI content for HTML display with proper structure
 */
function formatAIContentForHTML(content: string): string {
  if (!content || !content.trim()) return '';
  
  // Split into paragraphs and format properly
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
  
  return paragraphs.map(paragraph => {
    const trimmed = paragraph.trim();
    
    // Handle markdown headers - convert to proper HTML structure
    if (trimmed.startsWith('###')) {
      const title = trimmed.replace(/^###\s*/, '').trim();
      return `<h4 style="font-size: 1.2rem; font-weight: 500; color: #4b5563; margin: 20px 0 10px 0;">${title}</h4>`;
    }
    if (trimmed.startsWith('##')) {
      const title = trimmed.replace(/^##\s*/, '').trim();
      return `<h3 style="font-size: 1.4rem; font-weight: 600; color: #374151; margin: 25px 0 15px 0; padding-bottom: 5px;">${title}</h3>`;
    }
    if (trimmed.startsWith('#')) {
      const title = trimmed.replace(/^#\s*/, '').trim();
      return `<h2 style="font-size: 1.8rem; font-weight: 600; color: #1f2937; margin: 30px 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">${title}</h2>`;
    }
    
    // Handle bullet points - convert to professional lists
    if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
      const items = trimmed.split(/\n?- /).filter(item => item.trim()).map(item => item.trim());
      return `
        <ul style="margin: 15px 0; padding-left: 20px;">
          ${items.map(item => `<li style="margin: 8px 0; line-height: 1.6;">${item}</li>`).join('')}
        </ul>
      `;
    }
    
    // Handle numbered lists
    if (/^\d+\./.test(trimmed) || /\n\d+\./.test(trimmed)) {
      const items = trimmed.split(/\n?\d+\./).filter(item => item.trim()).map(item => item.trim());
      return `
        <ol style="margin: 15px 0; padding-left: 20px;">
          ${items.map(item => `<li style="margin: 8px 0; line-height: 1.6;">${item}</li>`).join('')}
        </ol>
      `;
    }
    
    // Handle quotes
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return `<blockquote style="border-left: 4px solid #2563eb; padding-left: 20px; margin: 20px 0; font-style: italic; color: #4b5563;">${trimmed.slice(1, -1)}</blockquote>`;
    }
    
    // Regular paragraphs
    return `<p style="margin: 15px 0; line-height: 1.7; color: #374151; text-align: justify;">${trimmed}</p>`;
  }).join('');
}

export default router;