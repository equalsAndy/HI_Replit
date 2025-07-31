import express from 'express';
import { Pool } from 'pg';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Types for AI Management
interface AIConfiguration {
  id: string;
  featureName: string;
  enabled: boolean;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
  maxTokens: number;
  timeoutMs: number;
  createdAt: Date;
  updatedAt: Date;
}

interface AIUsageStats {
  featureName: string;
  hour: Date;
  totalCalls: number;
  totalTokens: number;
  avgResponseTime: number;
  successfulCalls: number;
  failedCalls: number;
  totalEstimatedCost: number;
  uniqueUsers: number;
}

interface UpdateConfigRequest {
  enabled?: boolean;
  rateLimitPerHour?: number;
  rateLimitPerDay?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

/**
 * Get all AI feature configurations
 * GET /api/admin/ai/config
 */
router.get('/config', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ai_configuration ORDER BY feature_name'
    );
    
    res.json({
      success: true,
      configurations: result.rows
    });
  } catch (error) {
    console.error('Error fetching AI configurations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI configurations'
    });
  }
});

/**
 * Update AI feature configuration
 * PUT /api/admin/ai/config/:featureName
 */
router.put('/config/:featureName', requireAdmin, async (req, res) => {
  const { featureName } = req.params;
  const updates: UpdateConfigRequest = req.body;

  try {
    // Validate feature name
    const validFeatures = ['global', 'coaching', 'holistic_reports', 'reflection_assistance'];
    if (!validFeatures.includes(featureName)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feature name'
      });
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.enabled !== undefined) {
      updateFields.push(`enabled = $${paramCount++}`);
      values.push(updates.enabled);
    }
    if (updates.rateLimitPerHour !== undefined) {
      updateFields.push(`rate_limit_per_hour = $${paramCount++}`);
      values.push(updates.rateLimitPerHour);
    }
    if (updates.rateLimitPerDay !== undefined) {
      updateFields.push(`rate_limit_per_day = $${paramCount++}`);
      values.push(updates.rateLimitPerDay);
    }
    if (updates.maxTokens !== undefined) {
      updateFields.push(`max_tokens = $${paramCount++}`);
      values.push(updates.maxTokens);
    }
    if (updates.timeoutMs !== undefined) {
      updateFields.push(`timeout_ms = $${paramCount++}`);
      values.push(updates.timeoutMs);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid update fields provided'
      });
    }

    // Add feature name to values
    values.push(featureName);

    const query = `
      UPDATE ai_configuration 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE feature_name = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Feature configuration not found'
      });
    }

    console.log(`✅ AI configuration updated for ${featureName} by admin ${req.session?.userId}`);

    res.json({
      success: true,
      configuration: result.rows[0],
      message: `${featureName} configuration updated successfully`
    });

  } catch (error) {
    console.error('Error updating AI configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update AI configuration'
    });
  }
});

/**
 * Get AI usage statistics
 * GET /api/admin/ai/usage/stats
 */
router.get('/usage/stats', requireAdmin, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const hoursNum = parseInt(hours as string) || 24;

    // Get usage statistics from view
    const statsResult = await pool.query(
      'SELECT * FROM ai_usage_statistics WHERE hour >= NOW() - INTERVAL \'$1 hours\' ORDER BY hour DESC, feature_name',
      [hoursNum]
    );

    // Get current hour summary
    const currentHourResult = await pool.query(`
      SELECT 
        feature_name,
        COUNT(*) as calls_this_hour,
        SUM(tokens_used) as tokens_this_hour,
        AVG(response_time_ms) as avg_response_time,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_calls,
        SUM(cost_estimate) as cost_this_hour
      FROM ai_usage_logs 
      WHERE timestamp >= DATE_TRUNC('hour', NOW())
      GROUP BY feature_name
    `);

    // Get overall totals
    const totalsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_calls_24h,
        SUM(tokens_used) as total_tokens_24h,
        SUM(cost_estimate) as total_cost_24h,
        COUNT(DISTINCT user_id) as active_users_24h
      FROM ai_usage_logs 
      WHERE timestamp >= NOW() - INTERVAL '24 hours'
    `);

    res.json({
      success: true,
      statistics: statsResult.rows,
      currentHour: currentHourResult.rows,
      totals: totalsResult.rows[0] || {
        total_calls_24h: 0,
        total_tokens_24h: 0,
        total_cost_24h: 0,
        active_users_24h: 0
      }
    });

  } catch (error) {
    console.error('Error fetching AI usage statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI usage statistics'
    });
  }
});

/**
 * Get recent AI usage logs
 * GET /api/admin/ai/usage/logs
 */
router.get('/usage/logs', requireAdmin, async (req, res) => {
  try {
    const { limit = 100, feature, userId, success } = req.query;
    
    let query = `
      SELECT 
        al.*,
        u.username,
        u.name as user_name
      FROM ai_usage_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    
    const values: any[] = [];
    let paramCount = 1;

    if (feature) {
      query += ` AND al.feature_name = $${paramCount++}`;
      values.push(feature);
    }

    if (userId) {
      query += ` AND al.user_id = $${paramCount++}`;
      values.push(parseInt(userId as string));
    }

    if (success !== undefined) {
      query += ` AND al.success = $${paramCount++}`;
      values.push(success === 'true');
    }

    query += ` ORDER BY al.timestamp DESC LIMIT $${paramCount}`;
    values.push(parseInt(limit as string) || 100);

    const result = await pool.query(query, values);

    res.json({
      success: true,
      logs: result.rows
    });

  } catch (error) {
    console.error('Error fetching AI usage logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI usage logs'
    });
  }
});

/**
 * Emergency AI disable
 * POST /api/admin/ai/emergency-disable
 */
router.post('/emergency-disable', requireAdmin, async (req, res) => {
  try {
    const adminUserId = req.session?.userId;
    
    // Disable all AI features
    await pool.query(
      'UPDATE ai_configuration SET enabled = false, updated_at = NOW()'
    );

    // Log the emergency disable action
    console.log(`🚨 EMERGENCY AI DISABLE triggered by admin ${adminUserId}`);

    res.json({
      success: true,
      message: 'All AI features have been disabled',
      disabledAt: new Date().toISOString(),
      disabledBy: adminUserId
    });

  } catch (error) {
    console.error('Error during emergency AI disable:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable AI features'
    });
  }
});

/**
 * Get beta testers list
 * GET /api/admin/ai/beta-testers
 */
router.get('/beta-testers', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.name,
        u.email,
        u.is_beta_tester,
        u.beta_tester_granted_at,
        u.beta_tester_granted_by,
        admin.username as granted_by_username
      FROM users u
      LEFT JOIN users admin ON u.beta_tester_granted_by = admin.id
      WHERE u.is_beta_tester = true
      ORDER BY u.beta_tester_granted_at DESC
    `);

    res.json({
      success: true,
      betaTesters: result.rows
    });

  } catch (error) {
    console.error('Error fetching beta testers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch beta testers list'
    });
  }
});

/**
 * Get training documents
 * GET /api/admin/ai/training-docs
 */
router.get('/training-docs', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        original_filename,
        category,
        content_preview,
        word_count,
        chunk_count,
        uploaded_at,
        processed_at
      FROM training_documents 
      ORDER BY uploaded_at DESC
    `);

    res.json({
      success: true,
      documents: result.rows,
      totalDocuments: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching training documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch training documents'
    });
  }
});

/**
 * Get training document details
 * GET /api/admin/ai/training-docs/:id
 */
router.get('/training-docs/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const docResult = await pool.query(
      'SELECT * FROM training_documents WHERE id = $1',
      [id]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Training document not found'
      });
    }

    // Get associated chunks
    const chunksResult = await pool.query(`
      SELECT 
        id,
        chunk_index,
        content,
        char_count,
        search_vector_preview
      FROM training_document_chunks 
      WHERE document_id = $1 
      ORDER BY chunk_index
    `, [id]);

    res.json({
      success: true,
      document: docResult.rows[0],
      chunks: chunksResult.rows,
      chunkCount: chunksResult.rows.length
    });

  } catch (error) {
    console.error('Error fetching training document details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch training document details'
    });
  }
});

/**
 * Delete training document
 * DELETE /api/admin/ai/training-docs/:id
 */
router.delete('/training-docs/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.session?.userId;

  try {
    // Start transaction
    await pool.query('BEGIN');

    // Delete associated chunks first
    await pool.query('DELETE FROM training_document_chunks WHERE document_id = $1', [id]);

    // Delete the document
    const result = await pool.query(
      'DELETE FROM training_documents WHERE id = $1 RETURNING original_filename',
      [id]
    );

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Training document not found'
      });
    }

    await pool.query('COMMIT');
    
    console.log(`🗑️ Training document ${result.rows[0].original_filename} deleted by admin ${adminUserId}`);

    res.json({
      success: true,
      message: 'Training document deleted successfully',
      deletedFilename: result.rows[0].original_filename
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error deleting training document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete training document'
    });
  }
});

/**
 * Get Talia personas configuration
 * GET /api/admin/ai/personas
 */
router.get('/personas', requireAdmin, async (req, res) => {
  try {
    console.log('🔧 PERSONA GET REQUEST RECEIVED (from ai-management-routes)');
    console.log('📋 Fetching persona configurations');

    // Import the current personas from persona-management-routes
    const { CURRENT_PERSONAS } = await import('./persona-management-routes.js');
    
    const currentEnvironment = process.env.NODE_ENV || 'development';
    
    // Filter personas by current environment
    const filteredPersonas = CURRENT_PERSONAS.filter(persona => 
      persona.environments.includes(currentEnvironment)
    );

    console.log(`🌍 Environment: ${currentEnvironment}, Available personas: ${filteredPersonas.length}/${CURRENT_PERSONAS.length}`);

    res.json({
      success: true,
      personas: filteredPersonas,
      environment: currentEnvironment,
      message: 'Personas retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching personas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Talia personas configuration'
    });
  }
});

/**
 * Grant/revoke beta tester access
 * POST /api/admin/ai/beta-testers/:userId
 */
router.post('/beta-testers/:userId', requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const { grant } = req.body; // true to grant, false to revoke
  const adminUserId = req.session?.userId;

  try {
    if (grant) {
      // Grant beta access
      await pool.query(
        'UPDATE users SET is_beta_tester = true, beta_tester_granted_at = NOW(), beta_tester_granted_by = $1 WHERE id = $2',
        [adminUserId, userId]
      );

      console.log(`✅ Beta tester access granted to user ${userId} by admin ${adminUserId}`);
      
      res.json({
        success: true,
        message: 'Beta tester access granted successfully'
      });
    } else {
      // Revoke beta access
      await pool.query(
        'UPDATE users SET is_beta_tester = false, beta_tester_granted_at = NULL, beta_tester_granted_by = NULL WHERE id = $1',
        [userId]
      );

      console.log(`🚫 Beta tester access revoked for user ${userId} by admin ${adminUserId}`);
      
      res.json({
        success: true,
        message: 'Beta tester access revoked successfully'
      });
    }

  } catch (error) {
    console.error('Error updating beta tester status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update beta tester status'
    });
  }
});

/**
 * Get users who have completed AST workshop for Report Talia
 * GET /api/admin/ai/report-talia/completed-users
 */
router.get('/report-talia/completed-users', requireAdmin, async (_req, res) => {
  try {
    console.log('🔧 Fetching AST completed users for Report Talia');

    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.name,
        u.email,
        u.ast_completed_at,
        u.created_at
      FROM users u
      WHERE u.ast_workshop_completed = true
      ORDER BY u.ast_completed_at DESC NULLS LAST, u.name ASC
    `);

    console.log(`📊 Found ${result.rows.length} users who completed AST workshop`);
    console.log('📋 Users:', result.rows);

    res.json({
      success: true,
      users: result.rows,
      count: result.rows.length,
      message: `Found ${result.rows.length} users who completed AST workshop`
    });

  } catch (error) {
    console.error('❌ Error fetching AST completed users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AST completed users'
    });
  }
});

/**
 * Update user AST completion status (Admin only)
 * POST /api/admin/ai/report-talia/update-completion
 */
router.post('/report-talia/update-completion', requireAdmin, async (req, res) => {
  const { userId, completed } = req.body;
  const adminUserId = (req.session as any)?.userId;

  try {
    console.log(`🔧 Admin ${adminUserId} updating AST completion for user ${userId}: ${completed}`);

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const updateQuery = completed 
      ? 'UPDATE users SET ast_workshop_completed = true, ast_completed_at = NOW() WHERE id = $1'
      : 'UPDATE users SET ast_workshop_completed = false, ast_completed_at = NULL WHERE id = $1';

    const result = await pool.query(updateQuery, [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`✅ Updated AST completion status for user ${userId}: ${completed}`);

    res.json({
      success: true,
      message: `User ${userId} AST completion status updated to: ${completed}`,
      userId: userId,
      completed: completed
    });

  } catch (error) {
    console.error('❌ Error updating AST completion status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update AST completion status'
    });
  }
});

/**
 * Generate markdown report for a specific user using Report Talia
 * POST /api/admin/ai/report-talia/generate-report
 */
router.post('/report-talia/generate-report', requireAdmin, async (req, res) => {
  const { userId } = req.body;
  const adminUserId = (req.session as any)?.userId;

  try {
    console.log(`🔧 Generating Report Talia MD report for user ${userId}`);

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Check if user has completed AST workshop
    const userResult = await pool.query(
      'SELECT id, username, name, ast_workshop_completed, ast_completed_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];
    if (!user.ast_workshop_completed) {
      return res.status(400).json({
        success: false,
        error: 'User has not completed AST workshop'
      });
    }

    // Get user's workshop data (assessments, step data, etc.)
    const assessmentResult = await pool.query(
      'SELECT * FROM user_assessments WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const stepDataResult = await pool.query(
      'SELECT * FROM workshop_step_data WHERE user_id = $1 ORDER BY step_id, created_at DESC',
      [userId]
    );

    // Import Claude API service for report generation
    const { generateClaudeCoachingResponse } = await import('../services/claude-api-service.js');

    // Prepare user data for Report Talia
    const userData = {
      user: user,
      assessments: assessmentResult.rows,
      stepData: stepDataResult.rows,
      completedAt: user.ast_completed_at
    };

    // Generate report using Star Report Talia persona with proper configuration
    const reportPrompt = `You are Report Talia generating a comprehensive Personal Development Report following the EXACT format and structure of the Samantha Personal Report template in your training documents.

CRITICAL INSTRUCTIONS:
1. This is a PERSONAL DEVELOPMENT REPORT (not professional/business focused)
2. Use the EXACT structure from the Samantha Personal Report template
3. Write in SECOND PERSON ("You possess...", "Your signature...") not third person
4. Use the SAME intimate, personal tone as the Samantha template
5. Follow the SAME section structure: "Part I", "Part II", etc.
6. This is a complete standalone markdown document (no conversational elements)

REQUIRED TEMPLATE STRUCTURE (follow exactly):
# Your Personal Development Report
## Understanding Your Unique Strengths Signature

**${user.name} | [Role] | AllStarTeams Workshop Results**

## Executive Summary
[Personal, intimate analysis using "You possess..." tone]

## Part I: Your Strengths Signature Deep Dive
### The Architecture of Your Natural Talents
### How Your Energy Flows
### Your Unique Operating System
### Understanding Your Supporting Strengths

## Part II: Optimizing Your Flow State
### Your Current Flow Profile
### Flow Optimization Strategy for Your Signature

## Part III: Bridging to Your Future Self
### The Evolution of Your Signature
### Bridging Strategies: Present to Future

## Part IV: Your Development Pathway
### Core Development Areas
### Personal Well-being and Integration

## Part V: Your Signature in Action
### Daily Practices That Honor Your Signature
### Handling Challenges and Stress

## Part VI: Your Unique Value Proposition
### What You Bring That Others Don't
### Recognition and Career Positioning

## Conclusion: Embracing Your Signature

TONE: Personal, intimate, coaching-focused (like the Samantha template)
LENGTH: 3000+ words with deep psychological analysis
PERSPECTIVE: Second person ("You", "Your") throughout

USER DATA:
- Name: ${user.name} (${user.username})
- Completed AST: ${user.ast_completed_at}
- Assessment Records: ${assessmentResult.rows.length}
- Workshop Data: ${stepDataResult.rows.length}

Generate the complete Personal Development Report following the Samantha template structure and tone exactly:`;

    console.log('🔧 About to call generateClaudeCoachingResponse with params:', {
      userMessage: reportPrompt.substring(0, 100) + '...',
      personaType: 'star_report',
      userName: user.name,
      contextData: {
        reportContext: 'md_generation',
        selectedUserId: userId,
        selectedUserName: user.name,
        adminMode: true
      }
    });

    const reportContent = await generateClaudeCoachingResponse({
      userMessage: reportPrompt,
      personaType: 'star_report',
      userName: user.name,
      contextData: {
        reportContext: 'md_generation',
        selectedUserId: userId,
        selectedUserName: user.name,
        adminMode: true,
        userData: userData
      },
      userId: userId,
      sessionId: `report-gen-${Date.now()}`,
      maxTokens: 25000
    });

    if (!reportContent || reportContent.trim() === '') {
      throw new Error('Report generation failed: Empty response from Claude API');
    }

    // Save report to storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `report-talia-${user.username}-${timestamp}.md`;

    // Create storage directory if it doesn't exist
    const fs = await import('fs');
    const path = await import('path');
    const storageDir = path.join(process.cwd(), 'storage', 'reports');
    
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const filePath = path.join(storageDir, filename);
    fs.writeFileSync(filePath, reportContent, 'utf8');

    console.log(`✅ Report Talia MD report generated and saved: ${filename}`);
    console.log(`🗃️ Report generated by admin ${adminUserId} for user ${userId}`);

    res.json({
      success: true,
      report: {
        filename: filename,
        filePath: filePath,
        content: reportContent,
        generatedAt: new Date().toISOString(),
        generatedBy: adminUserId,
        targetUser: {
          id: user.id,
          name: user.name,
          username: user.username
        }
      },
      message: `Report successfully generated for ${user.name}`
    });

  } catch (error) {
    console.error('❌ Error generating Report Talia MD report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Report Talia MD report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;