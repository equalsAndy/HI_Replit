/**
 * Training Document Upload Routes
 * ==============================
 * API endpoints for uploading and managing training documents from admin chat sessions
 */

import express from 'express';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Persona vector store mapping
const PERSONA_VECTOR_STORES = {
  'reflection_talia': 'vs_688e55e74e68819190cca71d1fa54f52',
  'report_talia': 'vs_688e2bf0d94c81918b50080064684bde',
  'admin_talia': 'vs_688e55e81e6c8191af100194c2ac9512'
};

/**
 * POST /api/admin/ai/upload-training-document
 * Upload training document from admin chat session to OpenAI
 */
router.post('/upload-training-document', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { 
      personaId, 
      title, 
      content, 
      category = 'training_session',
      isGeneral = true 
    } = req.body;

    if (!personaId || !title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['personaId', 'title', 'content']
      });
    }

    const vectorStoreId = PERSONA_VECTOR_STORES[personaId];
    if (!vectorStoreId) {
      return res.status(400).json({
        error: 'Invalid persona ID',
        validPersonas: Object.keys(PERSONA_VECTOR_STORES)
      });
    }

    console.log(`📚 Uploading training document for ${personaId}: ${title}`);

    // Create file content with metadata
    const timestamp = new Date().toISOString();
    const fileContent = `Title: ${title}
Type: ${category}
Persona: ${personaId}
Is General: ${isGeneral}
Created: ${timestamp}

${content}`;

    // Create temporary file for Node.js environment
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.txt`;
    const tempDir = path.join(process.cwd(), 'temp');
    const tempFilePath = path.join(tempDir, filename);
    
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Write content to temporary file
    fs.writeFileSync(tempFilePath, fileContent, 'utf-8');
    
    let file;
    try {
      // Upload to OpenAI using file stream
      file = await openai.files.create({
        file: fs.createReadStream(tempFilePath),
        purpose: 'assistants'
      });
      
      console.log(`📤 File uploaded to OpenAI: ${file.id}`);
    } finally {
      // Clean up temporary file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }

    // Add to vector store
    const vectorStoreFile = await openai.beta.vectorStores.files.create(
      vectorStoreId,
      { file_id: file.id }
    );

    console.log(`✅ Added to ${personaId} vector store: ${file.id}`);

    // Save metadata to database (optional)
    try {
      // You could save training session metadata to PostgreSQL here
      // for admin tracking and management
    } catch (dbError) {
      console.warn('Failed to save metadata to database:', dbError);
      // Don't fail the whole operation for database issues
    }

    res.json({
      success: true,
      fileId: file.id,
      vectorStoreId,
      filename,
      message: `Training document uploaded successfully for ${personaId}`
    });

  } catch (error) {
    console.error('❌ Training document upload failed:', error);
    res.status(500).json({
      error: 'Failed to upload training document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/ai/training-sessions
 * List training sessions for a persona
 */
router.get('/training-sessions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { personaId } = req.query;

    if (!personaId) {
      return res.status(400).json({ error: 'personaId is required' });
    }

    const vectorStoreId = PERSONA_VECTOR_STORES[personaId as string];
    if (!vectorStoreId) {
      return res.status(400).json({ error: 'Invalid persona ID' });
    }

    // Get files from vector store
    const filesResponse = await openai.beta.vectorStores.files.list(vectorStoreId);
    
    const trainingFiles = [];
    for (const file of filesResponse.data) {
      try {
        const fileDetails = await openai.files.retrieve(file.id);
        if (fileDetails.filename.includes('training') || fileDetails.filename.includes('session')) {
          trainingFiles.push({
            id: file.id,
            filename: fileDetails.filename,
            createdAt: new Date(fileDetails.created_at * 1000),
            size: fileDetails.bytes,
            status: file.status
          });
        }
      } catch (error) {
        console.warn(`Failed to get details for file ${file.id}:`, error);
      }
    }

    res.json({
      success: true,
      personaId,
      trainingSessions: trainingFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    });

  } catch (error) {
    console.error('❌ Failed to list training sessions:', error);
    res.status(500).json({
      error: 'Failed to list training sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/admin/ai/training-document/:fileId
 * Delete a training document
 */
router.delete('/training-document/:fileId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { personaId } = req.body;

    if (!personaId) {
      return res.status(400).json({ error: 'personaId is required' });
    }

    const vectorStoreId = PERSONA_VECTOR_STORES[personaId];
    if (!vectorStoreId) {
      return res.status(400).json({ error: 'Invalid persona ID' });
    }

    console.log(`🗑️ Deleting training document ${fileId} from ${personaId}`);

    // Remove from vector store
    try {
      await openai.beta.vectorStores.files.del(vectorStoreId, fileId);
      console.log(`✅ Removed from vector store: ${fileId}`);
    } catch (error) {
      console.warn('Failed to remove from vector store:', error);
    }

    // Delete file from OpenAI
    const deleteResult = await openai.files.del(fileId);
    
    res.json({
      success: true,
      deleted: deleteResult.deleted,
      fileId,
      message: 'Training document deleted successfully'
    });

  } catch (error) {
    console.error('❌ Failed to delete training document:', error);
    res.status(500).json({
      error: 'Failed to delete training document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;