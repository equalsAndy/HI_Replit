import express from 'express';
import { Pool } from 'pg';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ===================================================================
// TRAINING DOCUMENTS API - Document Management for RAG System
// ===================================================================
// Phase 1: Document upload, management, and metadata handling
// Phase 2: Document chunking and embedding generation
// Phase 3: Similarity search and context retrieval
// ===================================================================

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow text files, PDFs, and Word docs
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only text, markdown, PDF, and Word documents are allowed.'));
    }
  }
});

// Apply auth middleware to all routes
router.use(requireAuth);

// ===================================================================
// ENDPOINT: GET /api/training/documents
// Get all training documents with filtering and pagination
// ===================================================================
router.get('/documents', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      document_type,
      category,
      status = 'active',
      search
    } = req.query;

    console.log('📋 Fetching training documents:', { page, limit, document_type, category, status, search });

    // Build WHERE clause dynamically
    let whereClause = `WHERE status = $1`;
    const params: any[] = [status];
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

    // Calculate offset
    const offset = ((page as number) - 1) * (limit as number);

    // Get documents with pagination
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

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM training_documents
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    // Get document type statistics
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
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / (limit as number))
      },
      stats,
      message: `Found ${documents.length} training documents`
    });

  } catch (error) {
    console.error('❌ Error fetching training documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch training documents'
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/training/documents/:id
// Get a specific training document with full content
// ===================================================================
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

    // Get processing status if chunks exist
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

  } catch (error) {
    console.error('❌ Error fetching training document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch training document'
    });
  }
});

// ===================================================================
// ENDPOINT: POST /api/training/documents
// Upload and create a new training document
// ===================================================================
router.post('/documents', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const {
      title,
      document_type,
      category,
      tags,
      version = '1.0',
      content
    } = req.body;

    const file = req.file;

    console.log('📤 Uploading training document:', { title, document_type, category });

    // Validation
    if (!title || !document_type) {
      return res.status(400).json({
        success: false,
        error: 'Title and document_type are required'
      });
    }

    // Validate document type
    const validTypes = [
      'coaching_guide',
      'report_template',
      'assessment_framework',
      'best_practices',
      'strengths_theory',
      'flow_research',
      'team_dynamics',
      'industry_guidance'
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

    // If file is uploaded, extract content
    if (file) {
      fileSize = file.size;
      fileType = file.mimetype;
      originalFilename = file.originalname;

      // For now, handle only text files directly
      // TODO: Add PDF and Word document parsing
      if (file.mimetype === 'text/plain' || file.mimetype === 'text/markdown') {
        documentContent = file.buffer.toString('utf-8');
      } else {
        return res.status(400).json({
          success: false,
          error: 'File parsing for this type not yet implemented. Please provide content in text format.'
        });
      }
    }

    if (!documentContent) {
      return res.status(400).json({
        success: false,
        error: 'Either file upload or content text is required'
      });
    }

    // Parse tags if provided as string
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    // Insert document
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
      (req as any).user?.id
    ]);

    // Create initial processing job for chunking
    const jobId = uuidv4();
    await pool.query(`
      INSERT INTO document_processing_jobs (
        id, document_id, job_type, status, progress_percentage, created_at
      ) VALUES ($1, $2, 'chunking', 'pending', 0, NOW())
    `, [jobId, documentId]);

    console.log('✅ Training document uploaded successfully:', documentId);

    res.status(201).json({
      success: true,
      document_id: documentId,
      job_id: jobId,
      message: 'Training document uploaded successfully. Processing will begin shortly.'
    });

  } catch (error) {
    console.error('❌ Error uploading training document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload training document'
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/training/document-types
// Get available document types and categories
// ===================================================================
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
      }
    ];

    // Get categories currently in use
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

  } catch (error) {
    console.error('❌ Error fetching document types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document types'
    });
  }
});

// ===================================================================
// ENDPOINT: GET /api/training/stats
// Get training document statistics
// ===================================================================
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching training document statistics');

    // Get document counts by type
    const typeStatsResult = await pool.query(`
      SELECT 
        document_type,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
      FROM training_documents
      GROUP BY document_type
      ORDER BY count DESC
    `);

    // Get processing statistics
    const processingStatsResult = await pool.query(`
      SELECT 
        job_type,
        status,
        COUNT(*) as count
      FROM document_processing_jobs
      GROUP BY job_type, status
      ORDER BY job_type, status
    `);

    // Get total statistics
    const totalStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_documents,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_documents,
        SUM(file_size) as total_size,
        AVG(file_size) as avg_size
      FROM training_documents
    `);

    // Get chunk statistics
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

  } catch (error) {
    console.error('❌ Error fetching training statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch training statistics'
    });
  }
});

export default router;