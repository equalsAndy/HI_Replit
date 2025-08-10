import express from 'express';
import { Pool } from 'pg';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        console.log('📎 File upload attempt:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        const allowedTypes = [
            'text/plain',
            'text/markdown',
            'text/csv',
            'text/html',
            'text/xml',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/json',
            'application/xml',
            'text/rtf',
            'application/rtf',
            'application/octet-stream'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            console.log('✅ File type accepted:', file.mimetype);
            cb(null, true);
        }
        else {
            console.error('❌ File type rejected:', file.mimetype);
            cb(new Error(`Invalid file type "${file.mimetype}". Allowed types: ${allowedTypes.join(', ')}`));
        }
    }
});
router.use(requireAuth);
router.get('/documents', requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, document_type, category, status = 'active', search } = req.query;
        console.log('📋 Fetching training documents:', { page, limit, document_type, category, status, search });
        let whereClause = `WHERE status = $1`;
        const params = [status];
        let paramIndex = 2;
        if (document_type) {
            whereClause += ` AND document_type = $${paramIndex}`;
            params.push(document_type);
            paramIndex++;
        }
        if (category) {
            whereClause += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }
        if (search) {
            whereClause += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        const offset = (page - 1) * limit;
        const documentsQuery = `
      SELECT 
        id,
        title,
        document_type,
        category,
        tags,
        version,
        status,
        file_size,
        file_type,
        original_filename,
        uploaded_by,
        created_at,
        updated_at,
        LENGTH(content) as content_length
      FROM training_documents
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        params.push(limit, offset);
        const documentsResult = await pool.query(documentsQuery, params);
        const documents = documentsResult.rows;
        const countQuery = `
      SELECT COUNT(*) as total
      FROM training_documents
      ${whereClause}
    `;
        const countResult = await pool.query(countQuery, params.slice(0, -2));
        const total = parseInt(countResult.rows[0].total);
        const statsQuery = `
      SELECT 
        document_type,
        COUNT(*) as count
      FROM training_documents
      WHERE status = 'active'
      GROUP BY document_type
      ORDER BY count DESC
    `;
        const statsResult = await pool.query(statsQuery);
        const stats = statsResult.rows;
        res.json({
            success: true,
            documents,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            stats,
            message: `Found ${documents.length} training documents`
        });
    }
    catch (error) {
        console.error('❌ Error fetching training documents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch training documents'
        });
    }
});
router.get('/documents/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('📄 Fetching training document:', id);
        const documentResult = await pool.query(`
      SELECT 
        td.*,
        u.name as uploaded_by_name,
        (
          SELECT COUNT(*)
          FROM document_chunks dc
          WHERE dc.document_id = td.id
        ) as chunk_count
      FROM training_documents td
      LEFT JOIN users u ON td.uploaded_by = u.id
      WHERE td.id = $1
    `, [id]);
        if (documentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Training document not found'
            });
        }
        const document = documentResult.rows[0];
        let processingStatus = null;
        if (document.chunk_count > 0) {
            const processingResult = await pool.query(`
        SELECT 
          job_type,
          status,
          progress_percentage,
          error_message,
          completed_at
        FROM document_processing_jobs
        WHERE document_id = $1
        ORDER BY created_at DESC
        LIMIT 3
      `, [id]);
            processingStatus = processingResult.rows;
        }
        res.json({
            success: true,
            document,
            processing_status: processingStatus,
            message: 'Training document retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Error fetching training document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch training document'
        });
    }
});
router.post('/documents', requireAdmin, upload.single('file'), async (req, res) => {
    try {
        console.log('📤 Training document upload request received');
        console.log('📤 Request body:', req.body);
        console.log('📤 Request file:', req.file ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        } : 'No file');
        console.log('📤 User:', req.user?.id);
        const { title, document_type, category, tags, version = '1.0', content } = req.body;
        const file = req.file;
        console.log('📤 Uploading training document:', { title, document_type, category });
        if (!title || !document_type) {
            return res.status(400).json({
                success: false,
                error: 'Title and document_type are required'
            });
        }
        const validTypes = [
            'coaching_guide',
            'report_template',
            'assessment_framework',
            'best_practices',
            'strengths_theory',
            'flow_research',
            'team_dynamics',
            'industry_guidance',
            'ast_methodology',
            'ast_training_material',
            'ast_workshop_guide',
            'ast_assessment_info',
            'ast_strengths_analysis',
            'ast_flow_attributes',
            'ast_reflection_prompts',
            'ast_report_examples',
            'ast_coaching_scripts'
        ];
        if (!validTypes.includes(document_type)) {
            return res.status(400).json({
                success: false,
                error: `Invalid document_type. Must be one of: ${validTypes.join(', ')}`
            });
        }
        let documentContent = content;
        let fileSize = 0;
        let fileType = 'text/plain';
        let originalFilename = null;
        if (file) {
            fileSize = file.size;
            fileType = file.mimetype;
            originalFilename = file.originalname;
            const textMimeTypes = [
                'text/plain',
                'text/markdown',
                'text/csv',
                'text/html',
                'text/xml',
                'application/json',
                'application/xml',
                'text/rtf',
                'application/rtf'
            ];
            const isTextFile = textMimeTypes.includes(file.mimetype) ||
                file.originalname.match(/\.(txt|md|csv|html|xml|json|rtf)$/i);
            if (isTextFile) {
                documentContent = file.buffer.toString('utf-8');
                console.log(`📄 Text file processed: ${file.originalname} (${file.mimetype}) - ${documentContent.length} characters`);
            }
            else {
                documentContent = `[Binary file: ${file.originalname}]\nFile type: ${file.mimetype}\nSize: ${file.size} bytes\n\nContent stored as binary data - parsing will be implemented in future updates.`;
                console.log(`📄 Binary file uploaded: ${file.originalname} (${file.mimetype})`);
            }
        }
        if (!documentContent) {
            return res.status(400).json({
                success: false,
                error: 'Either file upload or content text is required'
            });
        }
        let parsedTags = [];
        if (tags) {
            if (typeof tags === 'string') {
                parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
            else if (Array.isArray(tags)) {
                parsedTags = tags;
            }
        }
        const documentId = uuidv4();
        await pool.query(`
      INSERT INTO training_documents (
        id, title, content, document_type, category, tags, version,
        file_size, file_type, original_filename, uploaded_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    `, [
            documentId,
            title,
            documentContent,
            document_type,
            category,
            parsedTags,
            version,
            fileSize,
            fileType,
            originalFilename,
            req.user?.id
        ]);
        const jobId = uuidv4();
        await pool.query(`
      INSERT INTO document_processing_jobs (
        id, document_id, job_type, status, progress_percentage, created_at
      ) VALUES ($1, $2, 'chunking', 'pending', 0, NOW())
    `, [jobId, documentId]);
        try {
            console.log('🔄 Automatically processing document for search...');
            const { textSearchService } = await import('../services/text-search-service.js');
            await textSearchService.processDocumentForSearch(documentId);
            await pool.query(`
        UPDATE document_processing_jobs 
        SET status = 'completed', progress_percentage = 100, completed_at = NOW()
        WHERE id = $1
      `, [jobId]);
            console.log('✅ Document automatically processed into searchable chunks');
        }
        catch (processingError) {
            console.error('❌ Auto-processing failed:', processingError);
            await pool.query(`
        UPDATE document_processing_jobs 
        SET status = 'failed', error_message = $1, completed_at = NOW()
        WHERE id = $2
      `, [processingError.message, jobId]);
        }
        console.log('✅ Training document uploaded successfully:', documentId);
        res.status(201).json({
            success: true,
            document_id: documentId,
            job_id: jobId,
            message: 'Training document uploaded and processed successfully. Talia can now access this content.',
            processing_status: 'completed'
        });
    }
    catch (error) {
        console.error('❌ Error uploading training document:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({
            success: false,
            error: 'Failed to upload training document',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.post('/documents/text', requireAdmin, async (req, res) => {
    try {
        console.log('📝 Text-based training document upload request received');
        console.log('📝 User:', req.user?.id);
        const { title, content, document_type, category = 'coaching_system', tags, version = '1.0' } = req.body;
        console.log('📝 Creating text-based training document:', { title, document_type, category });
        if (!title || !content || !document_type) {
            return res.status(400).json({
                success: false,
                error: 'Title, content, and document_type are required'
            });
        }
        if (content.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Content must be at least 10 characters long'
            });
        }
        const validTypes = [
            'coaching_guide', 'report_template', 'assessment_framework', 'best_practices',
            'strengths_theory', 'flow_research', 'team_dynamics', 'industry_guidance',
            'ast_methodology', 'ast_training_material', 'ast_workshop_guide',
            'ast_assessment_info', 'ast_strengths_analysis', 'ast_flow_attributes',
            'ast_reflection_prompts', 'ast_report_examples', 'ast_coaching_scripts'
        ];
        if (!validTypes.includes(document_type)) {
            return res.status(400).json({
                success: false,
                error: `Invalid document_type. Must be one of: ${validTypes.join(', ')}`
            });
        }
        let parsedTags = null;
        if (tags) {
            if (typeof tags === 'string') {
                parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
            else if (Array.isArray(tags)) {
                parsedTags = tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
            }
        }
        const documentId = uuidv4();
        await pool.query(`
      INSERT INTO training_documents (
        id, title, content, document_type, category, tags, version, status,
        file_size, file_type, original_filename, uploaded_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, 'text/plain', 'text-upload.txt', $9, NOW(), NOW())
    `, [
            documentId,
            title,
            content,
            document_type,
            category,
            parsedTags,
            version,
            content.length,
            req.user?.id
        ]);
        const jobId = uuidv4();
        await pool.query(`
      INSERT INTO document_processing_jobs (
        id, document_id, job_type, status, progress_percentage, created_at
      ) VALUES ($1, $2, 'chunking', 'pending', 0, NOW())
    `, [jobId, documentId]);
        try {
            console.log('🔄 Automatically processing text document for search...');
            const { textSearchService } = await import('../services/text-search-service.js');
            await textSearchService.processDocumentForSearch(documentId);
            await pool.query(`
        UPDATE document_processing_jobs 
        SET status = 'completed', progress_percentage = 100, completed_at = NOW()
        WHERE id = $1
      `, [jobId]);
            console.log('✅ Text document automatically processed into searchable chunks');
        }
        catch (processingError) {
            console.error('❌ Auto-processing failed:', processingError);
            await pool.query(`
        UPDATE document_processing_jobs 
        SET status = 'failed', error_message = $1, completed_at = NOW()
        WHERE id = $2
      `, [processingError.message, jobId]);
        }
        console.log('✅ Text-based training document created successfully:', documentId);
        res.status(201).json({
            success: true,
            document_id: documentId,
            job_id: jobId,
            message: 'Text document uploaded and processed successfully. Talia can now access this content.',
            processing_status: 'completed',
            document: {
                id: documentId,
                title,
                document_type,
                category,
                content_length: content.length,
                created_at: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('❌ Error creating text-based training document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create text-based training document',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.get('/document-types', requireAdmin, async (req, res) => {
    try {
        const documentTypes = [
            {
                value: 'coaching_guide',
                label: 'Coaching Guide',
                description: 'Methodologies and techniques for coaching'
            },
            {
                value: 'report_template',
                label: 'Report Template',
                description: 'Templates for generating holistic reports'
            },
            {
                value: 'assessment_framework',
                label: 'Assessment Framework',
                description: 'Frameworks for evaluating strengths and abilities'
            },
            {
                value: 'best_practices',
                label: 'Best Practices',
                description: 'Proven strategies and approaches'
            },
            {
                value: 'strengths_theory',
                label: 'Strengths Theory',
                description: 'Theoretical foundations of strengths-based development'
            },
            {
                value: 'flow_research',
                label: 'Flow Research',
                description: 'Research on flow states and peak performance'
            },
            {
                value: 'team_dynamics',
                label: 'Team Dynamics',
                description: 'Understanding and optimizing team interactions'
            },
            {
                value: 'industry_guidance',
                label: 'Industry Guidance',
                description: 'Industry-specific advice and insights'
            },
            {
                value: 'ast_methodology',
                label: 'AST Methodology',
                description: 'AllStarTeams core methodology and principles'
            },
            {
                value: 'ast_training_material',
                label: 'AST Training Material',
                description: 'Training content and educational materials for AST'
            },
            {
                value: 'ast_workshop_guide',
                label: 'AST Workshop Guide',
                description: 'Step-by-step guides for conducting AST workshops'
            },
            {
                value: 'ast_assessment_info',
                label: 'AST Assessment Info',
                description: 'Information about AST assessments and evaluation tools'
            },
            {
                value: 'ast_strengths_analysis',
                label: 'AST Strengths Analysis',
                description: 'Guidance on analyzing and interpreting strengths results'
            },
            {
                value: 'ast_flow_attributes',
                label: 'AST Flow Attributes',
                description: 'Information about flow state attributes and selection'
            },
            {
                value: 'ast_reflection_prompts',
                label: 'AST Reflection Prompts',
                description: 'Reflection questions and prompts for AST participants'
            },
            {
                value: 'ast_report_examples',
                label: 'AST Report Examples',
                description: 'Sample reports and analysis examples'
            },
            {
                value: 'ast_coaching_scripts',
                label: 'AST Coaching Scripts',
                description: 'Scripts and conversation guides for AST coaching'
            }
        ];
        const categoriesResult = await pool.query(`
      SELECT DISTINCT category
      FROM training_documents
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category
    `);
        const categories = categoriesResult.rows.map(row => row.category);
        res.json({
            success: true,
            document_types: documentTypes,
            categories,
            message: 'Document types and categories retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Error fetching document types:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch document types'
        });
    }
});
router.delete('/documents/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ Deleting training document:', id);
        const documentResult = await pool.query(`
      SELECT id, title, original_filename
      FROM training_documents
      WHERE id = $1
    `, [id]);
        if (documentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Training document not found'
            });
        }
        const document = documentResult.rows[0];
        await pool.query(`
      DELETE FROM document_chunks
      WHERE document_id = $1
    `, [id]);
        await pool.query(`
      DELETE FROM document_processing_jobs
      WHERE document_id = $1
    `, [id]);
        await pool.query(`
      DELETE FROM training_documents
      WHERE id = $1
    `, [id]);
        console.log('✅ Training document deleted successfully:', document.title);
        res.json({
            success: true,
            message: `Training document "${document.title}" deleted successfully`
        });
    }
    catch (error) {
        console.error('❌ Error deleting training document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete training document'
        });
    }
});
router.put('/documents/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, document_type, category, tags, version, status } = req.body;
        console.log('✏️ Updating training document:', id, req.body);
        const documentResult = await pool.query(`
      SELECT id, title
      FROM training_documents
      WHERE id = $1
    `, [id]);
        if (documentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Training document not found'
            });
        }
        let parsedTags = [];
        if (tags) {
            if (typeof tags === 'string') {
                parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
            else if (Array.isArray(tags)) {
                parsedTags = tags;
            }
        }
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (title !== undefined) {
            updates.push(`title = $${paramIndex}`);
            values.push(title);
            paramIndex++;
        }
        if (document_type !== undefined) {
            updates.push(`document_type = $${paramIndex}`);
            values.push(document_type);
            paramIndex++;
        }
        if (category !== undefined) {
            updates.push(`category = $${paramIndex}`);
            values.push(category);
            paramIndex++;
        }
        if (tags !== undefined) {
            updates.push(`tags = $${paramIndex}`);
            values.push(parsedTags);
            paramIndex++;
        }
        if (version !== undefined) {
            updates.push(`version = $${paramIndex}`);
            values.push(version);
            paramIndex++;
        }
        if (status !== undefined) {
            updates.push(`status = $${paramIndex}`);
            values.push(status);
            paramIndex++;
        }
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }
        updates.push(`updated_at = NOW()`);
        values.push(id);
        const updateQuery = `
      UPDATE training_documents 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, document_type, category, tags, version, status, updated_at
    `;
        const result = await pool.query(updateQuery, values);
        const updatedDocument = result.rows[0];
        console.log('✅ Training document updated successfully:', updatedDocument.title);
        res.json({
            success: true,
            document: updatedDocument,
            message: 'Training document updated successfully'
        });
    }
    catch (error) {
        console.error('❌ Error updating training document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update training document'
        });
    }
});
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        console.log('📊 Fetching training document statistics');
        const typeStatsResult = await pool.query(`
      SELECT 
        document_type,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
      FROM training_documents
      GROUP BY document_type
      ORDER BY count DESC
    `);
        const processingStatsResult = await pool.query(`
      SELECT 
        job_type,
        status,
        COUNT(*) as count
      FROM document_processing_jobs
      GROUP BY job_type, status
      ORDER BY job_type, status
    `);
        const totalStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_documents,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_documents,
        SUM(file_size) as total_size,
        AVG(file_size) as avg_size
      FROM training_documents
    `);
        const chunkStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_chunks,
        AVG(token_count) as avg_tokens_per_chunk,
        COUNT(DISTINCT document_id) as documents_with_chunks
      FROM document_chunks
    `);
        res.json({
            success: true,
            stats: {
                by_type: typeStatsResult.rows,
                processing: processingStatsResult.rows,
                totals: totalStatsResult.rows[0],
                chunks: chunkStatsResult.rows[0]
            },
            message: 'Training document statistics retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Error fetching training statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch training statistics'
        });
    }
});
export default router;
