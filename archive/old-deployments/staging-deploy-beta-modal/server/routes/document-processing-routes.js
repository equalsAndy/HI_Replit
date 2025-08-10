import express from 'express';
import { Pool } from 'pg';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { textSearchService } from '../services/text-search-service.js';
import { similaritySearchService } from '../services/similarity-search-service.js';
const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
router.post('/documents/:id/process', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id: documentId } = req.params;
        const { maxTokens = 500, overlapTokens = 50, preserveContext = true } = req.body;
        console.log('🔄 Manual processing triggered for document:', documentId);
        const documentResult = await pool.query(`
      SELECT id, title, status FROM training_documents WHERE id = $1
    `, [documentId]);
        if (documentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Training document not found'
            });
        }
        const document = documentResult.rows[0];
        if (document.status !== 'active') {
            return res.status(400).json({
                success: false,
                error: 'Can only process active documents'
            });
        }
        const existingJobResult = await pool.query(`
      SELECT id, status FROM document_processing_jobs
      WHERE document_id = $1 AND status IN ('pending', 'processing')
      ORDER BY created_at DESC
      LIMIT 1
    `, [documentId]);
        if (existingJobResult.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'Document is already being processed',
                job_status: existingJobResult.rows[0].status
            });
        }
        textSearchService.processDocumentForSearch(documentId).catch(error => {
            console.error(`❌ Background processing failed for document ${documentId}:`, error);
        });
        res.json({
            success: true,
            message: `Processing started for document: ${document.title}`,
            document_id: documentId,
            processing_options: {
                maxTokens,
                overlapTokens,
                preserveContext
            }
        });
    }
    catch (error) {
        console.error('❌ Error triggering document processing:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start document processing'
        });
    }
});
router.post('/documents/process-pending', requireAuth, requireAdmin, async (req, res) => {
    try {
        console.log('🔄 Processing all pending documents...');
        const pendingCountResult = await pool.query(`
      SELECT COUNT(DISTINCT document_id) as count
      FROM document_processing_jobs
      WHERE status = 'pending' AND job_type = 'chunking'
    `);
        const pendingCount = parseInt(pendingCountResult.rows[0].count);
        if (pendingCount === 0) {
            return res.json({
                success: true,
                message: 'No pending documents to process',
                pending_count: 0
            });
        }
        textSearchService.processPendingDocuments().catch(error => {
            console.error('❌ Background processing of pending documents failed:', error);
        });
        res.json({
            success: true,
            message: `Started processing ${pendingCount} pending document(s)`,
            pending_count: pendingCount
        });
    }
    catch (error) {
        console.error('❌ Error processing pending documents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start processing pending documents'
        });
    }
});
router.get('/documents/:id/status', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id: documentId } = req.params;
        const jobsResult = await pool.query(`
      SELECT 
        id,
        job_type,
        status,
        progress_percentage,
        error_message,
        created_at,
        completed_at
      FROM document_processing_jobs
      WHERE document_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `, [documentId]);
        const chunkCountResult = await pool.query(`
      SELECT COUNT(*) as chunk_count
      FROM document_chunks
      WHERE document_id = $1
    `, [documentId]);
        const chunkCount = parseInt(chunkCountResult.rows[0].chunk_count);
        res.json({
            success: true,
            document_id: documentId,
            chunk_count: chunkCount,
            processing_jobs: jobsResult.rows,
            is_processed: chunkCount > 0,
            message: `Found ${jobsResult.rows.length} processing job(s) for document`
        });
    }
    catch (error) {
        console.error('❌ Error getting document processing status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get document processing status'
        });
    }
});
router.post('/search/similar', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { query, similarityThreshold = 0.7, maxResults = 5, documentTypes } = req.body;
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Query text is required'
            });
        }
        console.log('🔍 Searching for similar content:', {
            query: query.substring(0, 100) + '...',
            similarityThreshold,
            maxResults,
            documentTypes
        });
        const similarChunks = await similaritySearchService.searchSimilarContent(query, {
            similarityThreshold,
            maxResults,
            documentTypes
        });
        res.json({
            success: true,
            query,
            results: similarChunks,
            result_count: similarChunks.length,
            search_options: {
                similarityThreshold,
                maxResults,
                documentTypes
            },
            message: `Found ${similarChunks.length} similar chunk(s)`
        });
    }
    catch (error) {
        console.error('❌ Error searching for similar chunks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search for similar content'
        });
    }
});
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
    try {
        console.log('📊 Fetching document processing statistics');
        const searchStats = await textSearchService.getSearchStats();
        const jobStatsResult = await pool.query(`
      SELECT 
        job_type,
        status,
        COUNT(*) as count,
        AVG(progress_percentage) as avg_progress
      FROM document_processing_jobs
      GROUP BY job_type, status
      ORDER BY job_type, status
    `);
        const recentActivityResult = await pool.query(`
      SELECT 
        dpj.id,
        dpj.job_type,
        dpj.status,
        dpj.progress_percentage,
        dpj.created_at,
        dpj.completed_at,
        td.title as document_title
      FROM document_processing_jobs dpj
      JOIN training_documents td ON dpj.document_id = td.id
      ORDER BY dpj.created_at DESC
      LIMIT 10
    `);
        res.json({
            success: true,
            stats: {
                text_search: searchStats,
                processing_jobs: jobStatsResult.rows,
                recent_activity: recentActivityResult.rows
            },
            message: 'Document processing statistics retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Error getting processing statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get processing statistics'
        });
    }
});
router.delete('/documents/:id/chunks', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id: documentId } = req.params;
        console.log('🗑️ Deleting chunks for document:', documentId);
        const documentResult = await pool.query(`
      SELECT id, title FROM training_documents WHERE id = $1
    `, [documentId]);
        if (documentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Training document not found'
            });
        }
        const chunkCountResult = await pool.query(`
      SELECT COUNT(*) as count FROM document_chunks WHERE document_id = $1
    `, [documentId]);
        const chunkCount = parseInt(chunkCountResult.rows[0].count);
        await pool.query('DELETE FROM document_chunks WHERE document_id = $1', [documentId]);
        await pool.query(`
      UPDATE document_processing_jobs 
      SET status = 'cancelled', updated_at = NOW()
      WHERE document_id = $1 AND status IN ('pending', 'processing')
    `, [documentId]);
        res.json({
            success: true,
            document_id: documentId,
            document_title: documentResult.rows[0].title,
            deleted_chunks: chunkCount,
            message: `Deleted ${chunkCount} chunk(s) for document: ${documentResult.rows[0].title}`
        });
    }
    catch (error) {
        console.error('❌ Error deleting document chunks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete document chunks'
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        const claudeAvailable = !!process.env.CLAUDE_API_KEY;
        await pool.query('SELECT 1');
        const pendingJobs = await pool.query(`
      SELECT COUNT(*) as count 
      FROM document_processing_jobs 
      WHERE status IN ('pending', 'processing')
    `);
        const totalChunks = await pool.query(`
      SELECT COUNT(*) as count FROM document_chunks
    `);
        res.json({
            success: true,
            status: 'healthy',
            services: {
                database: 'connected',
                claude_api: claudeAvailable ? 'configured' : 'missing_key',
                text_search_service: 'operational'
            },
            metrics: {
                pending_jobs: parseInt(pendingJobs.rows[0].count),
                total_chunks: parseInt(totalChunks.rows[0].count)
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Processing health check failed:', error);
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: 'Processing system health check failed'
        });
    }
});
export default router;
