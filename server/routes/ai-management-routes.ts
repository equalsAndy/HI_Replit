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
        u.is_test_user,
        u.beta_tester_granted_at,
        u.beta_tester_granted_by,
        admin.username as granted_by_username,
        CASE 
          WHEN u.is_beta_tester = true THEN 'beta_tester'
          WHEN u.is_test_user = true THEN 'test_user'
          ELSE 'none'
        END as access_type
      FROM users u
      LEFT JOIN users admin ON u.beta_tester_granted_by = admin.id
      WHERE u.is_beta_tester = true OR u.is_test_user = true
      ORDER BY u.beta_tester_granted_at DESC NULLS LAST, u.username
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
  const { userId, reportType = 'personal' } = req.body;
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

    // Import OpenAI API service for report generation
    const { generateOpenAICoachingResponse } = await import('../services/openai-api-service.js');

    // Get StarCard image for the user FIRST (before using in template)
    let starCardImageBase64 = '';
    try {
      console.log(`🖼️ Getting StarCard image for user ${userId}...`);
      const { photoStorageService } = await import('../services/photo-storage-service.js');
      const starCardImage = await photoStorageService.getUserStarCard(userId.toString());
      
      if (starCardImage && starCardImage.imageData) {
        starCardImageBase64 = starCardImage.imageData;
        console.log('✅ Found StarCard image for report integration');
      } else {
        console.log('⚠️ No StarCard image found for this user');
      }
    } catch (error) {
      console.warn('Could not retrieve StarCard image:', error);
    }

    // Prepare user data for Report Talia
    const userData = {
      user: user,
      assessments: assessmentResult.rows,
      stepData: stepDataResult.rows,
      completedAt: user.ast_completed_at
    };

    // Use Foundation Training Documents (METAlia disabled)
    const isPersonalReport = reportType === 'personal';
    console.log('🚀 Admin Console: Using pgvector semantic search for optimal training content');
    console.log('🔧 FIXED DATA MAPPING - Testing strengths data fix');
    
    // Import pgvector search service
    const { pgvectorSearchService } = await import('../services/pgvector-search-service.js');
    
    // Build user context for semantic search using correct data sources
    const userContextData = {
      name: user.name,
      strengths: assessmentResult.rows.find(a => a.assessment_type === 'starCard')?.results ? JSON.parse(assessmentResult.rows.find(a => a.assessment_type === 'starCard').results) : {"thinking":0,"feeling":0,"acting":0,"planning":0},
      reflections: assessmentResult.rows.find(a => a.assessment_type === 'stepByStepReflection')?.results ? JSON.parse(assessmentResult.rows.find(a => a.assessment_type === 'stepByStepReflection').results) : {},
      flowData: assessmentResult.rows.find(a => a.assessment_type === 'flowAssessment')?.results ? JSON.parse(assessmentResult.rows.find(a => a.assessment_type === 'flowAssessment').results) : null
    };
    
    console.log('🔍 DEBUG: Admin route - Assessment result rows:', assessmentResult.rows.map(r => ({ type: r.assessment_type, hasResults: !!r.results })));
    console.log('🔍 DEBUG: Admin route - User context data:', JSON.stringify(userContextData, null, 2));
    
    // Get optimal training prompt using pgvector search
    const reportPrompt = await pgvectorSearchService.getOptimalTrainingPrompt(
      isPersonalReport ? 'personal' : 'professional',
      userContextData
    );
    
    console.log('📋 Generated pgvector-optimized prompt for admin console');

    console.log('🔧 About to call generateOpenAICoachingResponse with params:', {
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

    // DEBUG: Save the admin console prompt to tempcomms
    try {
      const fs = await import('fs/promises');
      const debugContent = `# ADMIN CONSOLE PROMPT DEBUG - ${new Date().toISOString()}

## Context Data:
- User: ${user.name} (ID: ${userId})
- Report Type: ${isPersonalReport ? 'Personal' : 'Professional'}
- Assessments: ${assessmentResult.rows.length}
- Workshop Data: ${stepDataResult.rows.length}

## FULL ADMIN CONSOLE PROMPT:
\`\`\`
${reportPrompt}
\`\`\`

## Notes:
- This is the exact prompt sent to Claude from the admin console
- PersonaType: star_report
- AdminMode: true
- Context: md_generation
- Foundation Mode: Using training documents only (METAlia disabled)
`;
      await fs.writeFile('/Users/bradtopliff/Desktop/HI_Replit/tempClaudecomms/admin-prompt-debug.md', debugContent);
      console.log('📄 Admin console debug prompt saved to tempClaudecomms/admin-prompt-debug.md');
    } catch (debugError) {
      console.warn('Could not save admin debug prompt:', debugError);
    }

    // StarCard image already retrieved above before template construction

    const reportContent = await generateOpenAICoachingResponse({
      userMessage: reportPrompt,
      personaType: 'star_report',
      userName: user.name,
      contextData: {
        reportContext: 'md_generation',
        selectedUserId: userId,
        selectedUserName: user.name,
        userData: userData,
        starCardImageBase64: starCardImageBase64,
        adminMode: true,
        foundationMode: true // Flag that we're using foundation training documents only
      },
      userId: userId,
      sessionId: `report-gen-${Date.now()}`,
      maxTokens: 25000
    });

    if (!reportContent || reportContent.trim() === '') {
      throw new Error('Report generation failed: Empty response from Claude API');
    }

    // Quality monitoring disabled - testing foundation only
    console.log('📊 Foundation testing mode - METAlia quality monitoring disabled');

    // Generate report filename (for reference only - no file system write in production)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `report-talia-${user.username}-${timestamp}.md`;

    console.log(`✅ Report Talia ${reportType} report generated: ${filename}`);
    console.log(`🗃️ ${reportType} report generated by admin ${adminUserId} for user ${userId}`);

    // Return report content directly (no file system persistence in container environment)
    res.json({
      success: true,
      report: {
        filename: filename,
        content: reportContent,
        reportType: reportType,
        hasStarCard: !!starCardImageBase64,
        generatedAt: new Date().toISOString(),
        generatedBy: adminUserId,
        targetUser: {
          id: user.id,
          name: user.name,
          username: user.username
        }
      },
      message: `${reportType === 'personal' ? 'Personal development' : 'Professional development'} report successfully generated for ${user.name}${starCardImageBase64 ? ' (with StarCard)' : ' (no StarCard available)'}`,
      note: 'Report content returned in response (container environment)'
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

/**
 * Get training document content for editing
 * GET /api/ai-management/training-docs/:id/content
 */
router.get('/training-docs/:id/content', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, title, content FROM training_documents WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Training document not found'
      });
    }

    const document = result.rows[0];
    res.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        content: document.content
      }
    });

  } catch (error) {
    console.error('❌ Error fetching document content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Update training document content and reprocess chunks
 * PUT /api/ai-management/training-docs/:id
 */
router.put('/training-docs/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Content is required and must be a string'
    });
  }

  try {
    console.log(`📝 Updating training document ${id}`);

    // Update the document content
    const updateResult = await pool.query(
      'UPDATE training_documents SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING title, document_type',
      [content, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Training document not found'
      });
    }

    const document = updateResult.rows[0];
    console.log(`✅ Updated document: ${document.title}`);

    // Delete existing chunks for this document
    await pool.query('DELETE FROM document_chunks WHERE document_id = $1', [id]);
    console.log('🗑️ Deleted existing document chunks');

    // Reprocess and create new chunks
    const chunkSize = 1000; // Standard chunk size
    const chunks = [];
    let startIndex = 0;

    while (startIndex < content.length) {
      const endIndex = Math.min(startIndex + chunkSize, content.length);
      const chunkContent = content.slice(startIndex, endIndex);
      
      chunks.push({
        content: chunkContent,
        startIndex,
        endIndex: endIndex - 1,
        tokenCount: Math.ceil(chunkContent.length / 4) // Approximate token count
      });
      
      startIndex = endIndex;
    }

    // Insert new chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      await pool.query(
        `INSERT INTO document_chunks (
          document_id, chunk_index, content, token_count, metadata
        ) VALUES ($1, $2, $3, $4, $5)`,
        [id, i, chunk.content, chunk.tokenCount, JSON.stringify({
          startIndex: chunk.startIndex,
          endIndex: chunk.endIndex
        })]
      );
    }

    console.log(`✅ Created ${chunks.length} new chunks for document`);

    // Reinitialize vector service to pick up changes
    try {
      const { javascriptVectorService } = await import('../services/javascript-vector-service.js');
      await javascriptVectorService.initialize();
      console.log('🔄 Vector service reinitialized with updated document');
    } catch (vectorError) {
      console.warn('⚠️ Could not reinitialize vector service:', vectorError);
    }

    res.json({
      success: true,
      message: `Document "${document.title}" updated successfully`,
      chunksCreated: chunks.length,
      documentInfo: {
        title: document.title,
        type: document.document_type,
        contentLength: content.length,
        chunks: chunks.length
      }
    });

  } catch (error) {
    console.error('❌ Error updating training document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update training document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Fix Talia prompt documents - upload and enable for star_report persona
 * POST /api/ai-management/fix-talia-prompts
 */
router.post('/fix-talia-prompts', requireAdmin, async (req, res) => {
  try {
    console.log('🔧 Fixing Talia prompt documents...');
    
    const fs = await import('fs/promises');
    
    // Check if documents already exist
    // No longer auto-creating or force-assigning hardwired prompt documents
    // All documents are now managed through the persona management interface
    console.log('📋 Skipping hardwired prompt document creation - all documents managed via persona interface');
    
    res.json({
      success: true,
      message: 'Talia prompt documents fixed successfully',
      documentsCreated: createdDocIds.length,
      documentsEnabled: promptDocIds.length,
      enabledDocuments: updatedEnabledDocs,
      promptDocuments: allPromptDocs.rows.map(doc => ({
        id: doc.id,
        title: doc.title,
        enabled: updatedEnabledDocs.includes(doc.id.toString())
      }))
    });
    
  } catch (error) {
    console.error('❌ Error fixing Talia prompt documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fix Talia prompt documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Initialize learning documents for all personas
 * POST /api/admin/ai/initialize-learning-documents
 */
router.post('/initialize-learning-documents', requireAdmin, async (req, res) => {
  try {
    console.log('🚀 Initializing learning documents for all personas...');
    
    const { conversationLearningService } = await import('../services/conversation-learning-service.js');
    await conversationLearningService.initializeAllPersonaLearningDocuments();
    
    console.log('✅ Learning documents initialized successfully');
    
    res.json({
      success: true,
      message: 'Learning documents initialized for all personas',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error initializing learning documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize learning documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get detailed document information for personas with processing status
 * GET /api/admin/ai/persona-documents
 */
router.get('/persona-documents', requireAdmin, async (req, res) => {
  try {
    console.log('🔧 Fetching detailed document information for personas');

    const result = await pool.query(`
      SELECT 
        td.id,
        td.title,
        td.document_type,
        td.category,
        td.status,
        td.created_at,
        td.updated_at,
        td.file_size,
        td.original_filename,
        COALESCE(chunk_counts.chunk_count, 0) as chunk_count,
        CASE 
          WHEN chunk_counts.chunk_count > 0 THEN 'processed'
          ELSE 'pending'
        END as processing_status
      FROM training_documents td
      LEFT JOIN (
        SELECT 
          document_id, 
          COUNT(*) as chunk_count
        FROM document_chunks 
        GROUP BY document_id
      ) chunk_counts ON td.id = chunk_counts.document_id
      WHERE td.status = 'active'
      ORDER BY td.updated_at DESC
    `);

    // Get persona document assignments
    const personaResult = await pool.query(`
      SELECT id, training_documents 
      FROM talia_personas 
      WHERE enabled = true
    `);

    const personaDocuments = personaResult.rows.reduce((acc, persona) => {
      acc[persona.id] = persona.training_documents || [];
      return acc;
    }, {} as Record<string, string[]>);

    const documentsWithPersonaInfo = result.rows.map(doc => ({
      ...doc,
      assignedToPersonas: Object.entries(personaDocuments)
        .filter(([_, docIds]) => docIds.includes(doc.id))
        .map(([personaId]) => personaId),
      isProcessed: doc.chunk_count > 0,
      lastUpdated: doc.updated_at,
      processingStatus: doc.chunk_count > 0 ? 'processed' : 'pending'
    }));

    res.json({
      success: true,
      documents: documentsWithPersonaInfo,
      totalDocuments: result.rows.length,
      message: 'Document information retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching persona document information:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch persona document information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get training data for a specific persona in editable format
 * GET /api/admin/ai/training-data/:personaId
 */
router.get('/training-data/:personaId', requireAdmin, async (req, res) => {
  const { personaId } = req.params;
  
  try {
    const { taliaTrainingService } = await import('../services/talia-training-service.js');
    const trainingData = await taliaTrainingService.loadTrainingData(personaId);
    
    if (!trainingData) {
      return res.json({
        success: true,
        trainingData: {
          guidelines: [],
          examples: [],
          trainingSessions: [],
          lastUpdated: null
        },
        message: 'No training data found - will create new'
      });
    }
    
    res.json({
      success: true,
      trainingData: trainingData,
      personaId: personaId,
      message: 'Training data retrieved successfully'
    });
    
  } catch (error) {
    console.error(`❌ Error getting training data for ${personaId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to get training data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Update training data for a specific persona
 * PUT /api/admin/ai/training-data/:personaId
 */
router.put('/training-data/:personaId', requireAdmin, async (req, res) => {
  const { personaId } = req.params;
  const { guidelines, examples } = req.body;
  
  try {
    if (!Array.isArray(guidelines) || !Array.isArray(examples)) {
      return res.status(400).json({
        success: false,
        error: 'Guidelines and examples must be arrays'
      });
    }
    
    const { taliaTrainingService } = await import('../services/talia-training-service.js');
    
    // Load existing data
    let trainingData = await taliaTrainingService.loadTrainingData(personaId) || {
      trainingSessions: [],
      guidelines: [],
      examples: [],
      lastUpdated: null
    };
    
    // Update guidelines and examples
    trainingData.guidelines = guidelines;
    trainingData.examples = examples;
    trainingData.lastUpdated = new Date().toISOString();
    
    // Save the updated training data
    const fs = await import('fs/promises');
    const path = await import('path');
    const trainingFilePath = path.join(process.cwd(), 'storage', 'talia-training.json');
    
    // Load full training file
    let fullTrainingData = {};
    try {
      const existingData = await fs.readFile(trainingFilePath, 'utf-8');
      fullTrainingData = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist yet
    }
    
    // Update specific persona data
    fullTrainingData[personaId] = trainingData;
    
    // Save back to file
    await fs.writeFile(trainingFilePath, JSON.stringify(fullTrainingData, null, 2));
    
    console.log(`✅ Training data updated for persona ${personaId} by admin`);
    
    res.json({
      success: true,
      message: 'Training data updated successfully',
      personaId: personaId,
      guidelinesCount: guidelines.length,
      examplesCount: examples.length
    });
    
  } catch (error) {
    console.error(`❌ Error updating training data for ${personaId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update training data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Toggle training data on/off for a persona
 * POST /api/admin/ai/training-data/:personaId/toggle
 */
router.post('/training-data/:personaId/toggle', requireAdmin, async (req, res) => {
  const { personaId } = req.params;
  const { enabled } = req.body;
  
  try {
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'enabled must be a boolean value'
      });
    }
    
    const { taliaTrainingService } = await import('../services/talia-training-service.js');
    
    // Load existing data
    let trainingData = await taliaTrainingService.loadTrainingData(personaId) || {
      trainingSessions: [],
      guidelines: [],
      examples: [],
      lastUpdated: null
    };
    
    // Add or update the enabled flag
    trainingData.enabled = enabled;
    trainingData.lastUpdated = new Date().toISOString();
    
    // Save the updated training data
    const fs = await import('fs/promises');
    const path = await import('path');
    const trainingFilePath = path.join(process.cwd(), 'storage', 'talia-training.json');
    
    // Load full training file
    let fullTrainingData = {};
    try {
      const existingData = await fs.readFile(trainingFilePath, 'utf-8');
      fullTrainingData = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist yet
    }
    
    // Update specific persona data
    fullTrainingData[personaId] = trainingData;
    
    // Save back to file
    await fs.writeFile(trainingFilePath, JSON.stringify(fullTrainingData, null, 2));
    
    console.log(`✅ Training data ${enabled ? 'enabled' : 'disabled'} for persona ${personaId} by admin`);
    
    res.json({
      success: true,
      message: `Training data ${enabled ? 'enabled' : 'disabled'} successfully`,
      personaId: personaId,
      enabled: enabled
    });
    
  } catch (error) {
    console.error(`❌ Error toggling training data for ${personaId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle training data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get learning document for a specific persona
 * GET /api/admin/ai/learning-document/:personaId
 */
router.get('/learning-document/:personaId', requireAdmin, async (req, res) => {
  const { personaId } = req.params;
  
  try {
    const { conversationLearningService } = await import('../services/conversation-learning-service.js');
    const learningDocId = await conversationLearningService.getLearningDocumentId(personaId);
    
    if (!learningDocId) {
      return res.status(404).json({
        success: false,
        error: 'Learning document not found for this persona'
      });
    }
    
    // Get the learning document details
    const docResult = await pool.query(`
      SELECT id, title, content, created_at, updated_at
      FROM training_documents 
      WHERE id = $1 AND document_type = 'conversation_learning'
    `, [learningDocId]);
    
    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Learning document not found'
      });
    }
    
    res.json({
      success: true,
      learningDocument: docResult.rows[0],
      personaId: personaId
    });
    
  } catch (error) {
    console.error(`❌ Error getting learning document for ${personaId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to get learning document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;