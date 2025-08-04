/**
 * Persona Document Sync Routes
 * ============================
 * Manage synchronization between PostgreSQL training documents and OpenAI vector stores
 */

import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { getOpenAIClient, getAssistantManager } from '../services/openai-api-service.js';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Configure multer for document uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.md') || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: .txt, .md, .pdf, .docx'));
    }
  }
});

interface PersonaConfig {
  id: string;
  name: string;
  type: 'reflection' | 'report' | 'admin';
  vectorStoreId: string;
  projectType: string;
  enabled: boolean;
}

// Persona configurations mapping
const PERSONA_CONFIGS: PersonaConfig[] = [
  {
    id: 'reflection_talia',
    name: 'Reflection Talia',
    type: 'reflection',
    vectorStoreId: 'vs_688e55e74e68819190cca71d1fa54f52',
    projectType: 'content-generation',
    enabled: true
  },
  {
    id: 'report_talia',
    name: 'Report Talia',
    type: 'report',
    vectorStoreId: 'vs_688e2bf0d94c81918b50080064684bde',
    projectType: 'report-generation',
    enabled: true
  },
  {
    id: 'admin_talia',
    name: 'Admin Training',
    type: 'admin',
    vectorStoreId: 'vs_688e55e81e6c8191af100194c2ac9512',
    projectType: 'admin-training',
    enabled: true
  }
];

/**
 * GET /api/admin/ai/persona-sync-configs
 * Get all persona configurations with sync status
 */
router.get('/persona-sync-configs', requireAuth, async (req, res) => {
  try {
    const configs = await Promise.all(PERSONA_CONFIGS.map(async (config) => {
      // Get PostgreSQL document count
      const postgresResult = await db.execute(
        `SELECT COUNT(*) as count FROM training_documents 
         WHERE assigned_personas @> $1 AND deleted_at IS NULL`,
        [JSON.stringify([config.id])]
      );
      const postgresCount = parseInt(postgresResult[0]?.count || '0');

      // Get OpenAI document count
      let openaiCount = 0;
      let lastSync = null;
      try {
        const client = getOpenAIClient(config.projectType);
        const vectorStore = await client.beta.vectorStores.retrieve(config.vectorStoreId);
        openaiCount = vectorStore.file_counts?.completed || 0;
      } catch (error) {
        console.warn(`Failed to get OpenAI count for ${config.id}:`, error);
      }

      // Determine sync status
      let syncStatus = 'synced';
      if (postgresCount === 0 && openaiCount === 0) {
        syncStatus = 'synced';
      } else if (postgresCount !== openaiCount) {
        syncStatus = 'partial';
      } else {
        // Check if documents match
        const syncResult = await db.execute(
          `SELECT COUNT(*) as unsynced FROM training_documents 
           WHERE assigned_personas @> $1 AND deleted_at IS NULL 
           AND (openai_file_id IS NULL OR openai_file_id = '')`,
          [JSON.stringify([config.id])]
        );
        const unsyncedCount = parseInt(syncResult[0]?.unsynced || '0');
        if (unsyncedCount > 0) {
          syncStatus = 'unsynced';
        }
      }

      return {
        ...config,
        postgresDocuments: [],
        openaiDocuments: [],
        syncStatus,
        lastSync,
        postgresCount,
        openaiCount
      };
    }));

    res.json(configs);
  } catch (error) {
    console.error('Error fetching persona sync configs:', error);
    res.status(500).json({ error: 'Failed to fetch persona configurations' });
  }
});

/**
 * GET /api/admin/ai/persona-sync-status/:personaId
 * Get detailed sync status for a specific persona
 */
router.get('/persona-sync-status/:personaId', requireAuth, async (req, res) => {
  try {
    const { personaId } = req.params;
    const config = PERSONA_CONFIGS.find(c => c.id === personaId);
    
    if (!config) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    // Get PostgreSQL documents
    const postgresResult = await db.execute(
      `SELECT id, title, content, document_type, category, enabled, 
              created_at, updated_at, file_size, openai_file_id,
              CASE 
                WHEN openai_file_id IS NOT NULL AND openai_file_id != '' THEN 'synced'
                ELSE 'pending'
              END as sync_status
       FROM training_documents 
       WHERE assigned_personas @> $1 AND deleted_at IS NULL
       ORDER BY updated_at DESC`,
      [JSON.stringify([personaId])]
    );

    // Get OpenAI documents
    let openaiDocuments = [];
    try {
      const client = getOpenAIClient(config.projectType);
      const vectorStoreFiles = await client.beta.vectorStores.files.list(config.vectorStoreId);
      
      // Get file details for each
      openaiDocuments = await Promise.all(
        vectorStoreFiles.data.map(async (fileRef) => {
          try {
            const file = await client.files.retrieve(fileRef.id);
            
            // Find matching PostgreSQL document
            const matchingDoc = postgresResult.find(doc => doc.openai_file_id === file.id);
            
            return {
              id: file.id,
              filename: file.filename,
              bytes: file.bytes,
              created_at: file.created_at,
              purpose: file.purpose,
              status: fileRef.status,
              postgresDocumentId: matchingDoc?.id || null
            };
          } catch (error) {
            console.warn(`Failed to get file details for ${fileRef.id}:`, error);
            return {
              id: fileRef.id,
              filename: 'Unknown',
              bytes: 0,
              created_at: Date.now() / 1000,
              purpose: 'assistants',
              status: fileRef.status,
              postgresDocumentId: null
            };
          }
        })
      );
    } catch (error) {
      console.warn(`Failed to get OpenAI documents for ${personaId}:`, error);
    }

    // Calculate sync status
    const postgresCount = postgresResult.length;
    const openaiCount = openaiDocuments.length;
    const syncedCount = postgresResult.filter(doc => doc.openai_file_id).length;
    const pendingCount = postgresCount - syncedCount;

    let overallStatus = 'synced';
    if (pendingCount > 0) {
      overallStatus = 'unsynced';
    } else if (postgresCount !== openaiCount) {
      overallStatus = 'partial';
    }

    res.json({
      personaId,
      config,
      postgresDocuments: postgresResult.map(doc => ({
        id: doc.id,
        title: doc.title,
        content: doc.content?.substring(0, 200) + '...',
        type: doc.document_type,
        category: doc.category,
        enabled: doc.enabled,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        file_size: doc.file_size,
        openaiFileId: doc.openai_file_id,
        syncStatus: doc.sync_status
      })),
      openaiDocuments,
      summary: {
        postgresCount,
        openaiCount,
        syncedCount,
        pendingCount
      },
      overallStatus
    });

  } catch (error) {
    console.error('Error fetching persona sync status:', error);
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
});

/**
 * POST /api/admin/ai/sync-documents/:personaId
 * Sync documents between PostgreSQL and OpenAI
 */
router.post('/sync-documents/:personaId', requireAuth, async (req, res) => {
  try {
    const { personaId } = req.params;
    const { operation = 'incremental' } = req.body; // 'incremental' or 'full'
    
    const config = PERSONA_CONFIGS.find(c => c.id === personaId);
    if (!config) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    const client = getOpenAIClient(config.projectType);
    const results = {
      uploaded: 0,
      updated: 0,
      deleted: 0,
      errors: []
    };

    // Get PostgreSQL documents that need syncing
    const documentsToSync = await db.execute(
      `SELECT id, title, content, document_type, category, file_size, openai_file_id
       FROM training_documents 
       WHERE assigned_personas @> $1 AND deleted_at IS NULL
       ${operation === 'incremental' ? 'AND (openai_file_id IS NULL OR openai_file_id = \'\')' : ''}
       ORDER BY updated_at DESC`,
      [JSON.stringify([personaId])]
    );

    // Upload/update documents
    for (const doc of documentsToSync) {
      try {
        console.log(`Syncing document: ${doc.title} (${doc.id})`);
        
        // Create file content with metadata
        const fileContent = `Title: ${doc.title}
Type: ${doc.document_type}
Category: ${doc.category}

${doc.content}`;

        // Create a buffer from the content
        const buffer = Buffer.from(fileContent, 'utf-8');
        
        // Upload to OpenAI
        const file = await client.files.create({
          file: new File([buffer], `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`, {
            type: 'text/plain'
          }),
          purpose: 'assistants'
        });

        // Add to vector store
        await client.beta.vectorStores.files.create(config.vectorStoreId, {
          file_id: file.id
        });

        // Update PostgreSQL with OpenAI file ID
        await db.execute(
          'UPDATE training_documents SET openai_file_id = $1, updated_at = NOW() WHERE id = $2',
          [file.id, doc.id]
        );

        if (doc.openai_file_id) {
          results.updated++;
        } else {
          results.uploaded++;
        }

        console.log(`✅ Synced: ${doc.title} -> ${file.id}`);
        
      } catch (error) {
        console.error(`❌ Failed to sync document ${doc.title}:`, error);
        results.errors.push(`${doc.title}: ${error.message}`);
      }
    }

    // If full sync, also clean up orphaned OpenAI files
    if (operation === 'full') {
      try {
        const vectorStoreFiles = await client.beta.vectorStores.files.list(config.vectorStoreId);
        
        for (const fileRef of vectorStoreFiles.data) {
          // Check if this file exists in PostgreSQL
          const dbDoc = await db.execute(
            'SELECT id FROM training_documents WHERE openai_file_id = $1 AND deleted_at IS NULL',
            [fileRef.id]
          );
          
          if (dbDoc.length === 0) {
            try {
              // Remove from vector store
              await client.beta.vectorStores.files.del(config.vectorStoreId, fileRef.id);
              // Delete file
              await client.files.del(fileRef.id);
              results.deleted++;
              console.log(`🗑️ Deleted orphaned file: ${fileRef.id}`);
            } catch (deleteError) {
              console.warn(`Failed to delete orphaned file ${fileRef.id}:`, deleteError);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to clean up orphaned files:', error);
      }
    }

    res.json({
      success: true,
      operation,
      results,
      message: `Sync completed: ${results.uploaded} uploaded, ${results.updated} updated, ${results.deleted} deleted`
    });

  } catch (error) {
    console.error('Error syncing documents:', error);
    res.status(500).json({ error: 'Failed to sync documents' });
  }
});

/**
 * POST /api/admin/ai/upload-document
 * Upload a new document and optionally sync to OpenAI
 */
router.post('/upload-document', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { personaId, category = 'training', autoSync = 'false' } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const config = PERSONA_CONFIGS.find(c => c.id === personaId);
    if (!config) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    // Extract text content based on file type
    let content = '';
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt') || file.originalname.endsWith('.md')) {
      content = file.buffer.toString('utf-8');
    } else {
      // For other formats, we'd need additional processing
      content = file.buffer.toString('utf-8');
    }

    // Insert into PostgreSQL
    const result = await db.execute(
      `INSERT INTO training_documents 
       (title, content, document_type, category, file_size, original_filename, assigned_personas, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id`,
      [
        file.originalname.replace(/\.[^/.]+$/, ''), // Remove file extension
        content,
        'document',
        category,
        file.size,
        file.originalname,
        JSON.stringify([personaId])
      ]
    );

    const documentId = result[0].id;
    let openaiFileId = null;

    // Auto-sync to OpenAI if requested
    if (autoSync === 'true') {
      try {
        const client = getOpenAIClient(config.projectType);
        
        // Create file content with metadata
        const fileContent = `Title: ${file.originalname}
Type: document
Category: ${category}

${content}`;

        // Upload to OpenAI
        const openaiFile = await client.files.create({
          file: new File([Buffer.from(fileContent, 'utf-8')], file.originalname, {
            type: 'text/plain'
          }),
          purpose: 'assistants'
        });

        // Add to vector store
        await client.beta.vectorStores.files.create(config.vectorStoreId, {
          file_id: openaiFile.id
        });

        openaiFileId = openaiFile.id;

        // Update PostgreSQL with OpenAI file ID
        await db.execute(
          'UPDATE training_documents SET openai_file_id = $1 WHERE id = $2',
          [openaiFileId, documentId]
        );

        console.log(`✅ Uploaded and synced: ${file.originalname} -> ${openaiFileId}`);
      } catch (syncError) {
        console.error('Failed to auto-sync to OpenAI:', syncError);
        // Don't fail the entire operation - document is still saved to PostgreSQL
      }
    }

    res.json({
      success: true,
      document: {
        id: documentId,
        title: file.originalname,
        category,
        size: file.size,
        openaiFileId,
        synced: !!openaiFileId
      },
      message: `Document uploaded successfully${openaiFileId ? ' and synced to OpenAI' : ''}`
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

/**
 * DELETE /api/admin/ai/delete-document/:documentId
 * Delete a document from PostgreSQL and/or OpenAI
 */
router.delete('/delete-document/:documentId', requireAuth, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { fromOpenAI = false } = req.body;

    if (fromOpenAI) {
      // Delete from OpenAI (documentId is the OpenAI file ID)
      const openaiFileId = documentId;
      
      // Find which persona this belongs to
      const doc = await db.execute(
        'SELECT assigned_personas FROM training_documents WHERE openai_file_id = $1 AND deleted_at IS NULL',
        [openaiFileId]
      );

      if (doc.length > 0) {
        const assignedPersonas = JSON.parse(doc[0].assigned_personas);
        const personaId = assignedPersonas[0];
        const config = PERSONA_CONFIGS.find(c => c.id === personaId);
        
        if (config) {
          const client = getOpenAIClient(config.projectType);
          
          try {
            // Remove from vector store
            await client.beta.vectorStores.files.del(config.vectorStoreId, openaiFileId);
            // Delete file
            await client.files.del(openaiFileId);
            
            // Update PostgreSQL to remove OpenAI file ID
            await db.execute(
              'UPDATE training_documents SET openai_file_id = NULL WHERE openai_file_id = $1',
              [openaiFileId]
            );
            
            res.json({ success: true, message: 'Document deleted from OpenAI' });
          } catch (error) {
            console.error('Failed to delete from OpenAI:', error);
            res.status(500).json({ error: 'Failed to delete from OpenAI' });
          }
        } else {
          res.status(404).json({ error: 'Persona configuration not found' });
        }
      } else {
        res.status(404).json({ error: 'Document not found in PostgreSQL' });
      }
    } else {
      // Delete from PostgreSQL (documentId is the PostgreSQL ID)
      const doc = await db.execute(
        'SELECT openai_file_id, assigned_personas FROM training_documents WHERE id = $1 AND deleted_at IS NULL',
        [documentId]
      );

      if (doc.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const openaiFileId = doc[0].openai_file_id;
      const assignedPersonas = JSON.parse(doc[0].assigned_personas || '[]');

      // Soft delete from PostgreSQL
      await db.execute(
        'UPDATE training_documents SET deleted_at = NOW() WHERE id = $1',
        [documentId]
      );

      // Also delete from OpenAI if it exists
      if (openaiFileId && assignedPersonas.length > 0) {
        const personaId = assignedPersonas[0];
        const config = PERSONA_CONFIGS.find(c => c.id === personaId);
        
        if (config) {
          try {
            const client = getOpenAIClient(config.projectType);
            await client.beta.vectorStores.files.del(config.vectorStoreId, openaiFileId);
            await client.files.del(openaiFileId);
            console.log(`✅ Also deleted from OpenAI: ${openaiFileId}`);
          } catch (error) {
            console.warn('Failed to delete from OpenAI:', error);
          }
        }
      }

      res.json({ success: true, message: 'Document deleted from PostgreSQL' });
    }

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;