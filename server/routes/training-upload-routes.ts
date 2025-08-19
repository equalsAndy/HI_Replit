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

// Default OpenAI client (no explicit project)
const openaiDefault = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Optional AllStarTeams_Talia project client
const allstarProjectId = process.env.ALLSTAR_TALIA_PROJECT_ID;
const openaiAllStar = allstarProjectId
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, project: allstarProjectId })
  : null;

// Optional Ultra project client
const ultraProjectId = process.env.ULTRA_TALIA_PROJECT_ID;
const openaiUltra = ultraProjectId
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, project: ultraProjectId })
  : null;

// Optional Imaginal Agility project client
const iaProjectId = process.env.IMAGINAL_AGILITY_PROJECT_ID || process.env.IA_PROJECT_ID;
const openaiIA = iaProjectId
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, project: iaProjectId })
  : null;

// Optional Reflection Assistant Talia project client
const reflectionProjectId = process.env.REFLECTION_TALIA_PROJECT_ID;
const openaiReflection = reflectionProjectId
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, project: reflectionProjectId })
  : null;

// Persona vector store mapping - UPDATED with current IDs from OpenAI projects
const PERSONA_VECTOR_STORES_DEFAULT = {
  'reflection_talia': 'vs_689bf4308ccc819181e5168906b51fee',     // AST Reflections 
  'report_talia': 'vs_688e55e74e68819190cca71d1fa54f52',        // AllStarTeams_Report_Corpus
  'admin_talia': 'vs_689c0216a784819180bd2d242c868588'          // V_Ultra_Report_Sandbox
};

// Ultra vector stores from env (preferred) fallback to defaults if missing
const PERSONA_VECTOR_STORES_ULTRA = {
  'reflection_talia': process.env.ULTRA_TALIA_REFLECTION_VECTOR_STORE_ID || PERSONA_VECTOR_STORES_DEFAULT['reflection_talia'],
  'report_talia': process.env.ULTRA_TALIA_VECTOR_STORE_ID || PERSONA_VECTOR_STORES_DEFAULT['report_talia'],
  'admin_talia': process.env.ULTRA_TALIA_ADMIN_VECTOR_STORE_ID || PERSONA_VECTOR_STORES_DEFAULT['admin_talia']
};

// Imaginal Agility vector stores from env (preferred) fallback to defaults if missing
const PERSONA_VECTOR_STORES_IA = {
  'reflection_talia': process.env.IA_REFLECTION_VECTOR_STORE_ID || process.env.IMAGINAL_AGILITY_REFLECTION_VECTOR_STORE_ID || PERSONA_VECTOR_STORES_DEFAULT['reflection_talia'],
  'report_talia': process.env.IA_VECTOR_STORE_ID || process.env.IMAGINAL_AGILITY_VECTOR_STORE_ID || PERSONA_VECTOR_STORES_DEFAULT['report_talia'],
  'admin_talia': process.env.IA_ADMIN_VECTOR_STORE_ID || process.env.IMAGINAL_AGILITY_ADMIN_VECTOR_STORE_ID || PERSONA_VECTOR_STORES_DEFAULT['admin_talia']
};

// Reflection Assistant Talia vector stores from env (preferred) fallback to defaults if missing
const PERSONA_VECTOR_STORES_REFLECTION = {
  'reflection_talia': process.env.REFLECTION_TALIA_REFLECTION_VECTOR_STORE_ID || PERSONA_VECTOR_STORES_DEFAULT['reflection_talia'],
  'report_talia': process.env.REFLECTION_TALIA_REPORT_VECTOR_STORE_ID || PERSONA_VECTOR_STORES_DEFAULT['report_talia'],
  'admin_talia': process.env.REFLECTION_TALIA_ADMIN_VECTOR_STORE_ID || PERSONA_VECTOR_STORES_DEFAULT['admin_talia']
};

function getClientAndStores(projectKey?: string) {
  const key = (projectKey || '').toLowerCase();
  if (/ultra/.test(key)) {
    return { client: openaiUltra || openaiDefault, stores: PERSONA_VECTOR_STORES_ULTRA, projectKey: 'ultra' };
  }
  if (/ia|imaginal/.test(key)) {
    return { client: openaiIA || openaiDefault, stores: PERSONA_VECTOR_STORES_IA, projectKey: 'ia' };
  }
  if (/reflection/.test(key)) {
    return { client: openaiReflection || openaiDefault, stores: PERSONA_VECTOR_STORES_REFLECTION, projectKey: 'reflection' };
  }
  if (/allstar|allstarteams|talia/.test(key)) {
    return { client: openaiAllStar || openaiDefault, stores: PERSONA_VECTOR_STORES_DEFAULT, projectKey: 'allstar' };
  }
  return { client: openaiDefault, stores: PERSONA_VECTOR_STORES_DEFAULT, projectKey: 'default' };
}

// When projects represent personas, allow a single default vector store per project
function getDefaultVectorStoreId(projectKey: string | undefined): string | null {
  const key = (projectKey || 'default').toLowerCase();
  if (key === 'ultra') return process.env.ULTRA_TALIA_VECTOR_STORE_ID || PERSONA_VECTOR_STORES_ULTRA['report_talia'];
  if (key === 'ia') return process.env.IA_VECTOR_STORE_ID || PERSONA_VECTOR_STORES_IA['report_talia'];
  if (key === 'reflection') return process.env.REFLECTION_TALIA_REPORT_VECTOR_STORE_ID || PERSONA_VECTOR_STORES_REFLECTION['report_talia'];
  if (key === 'allstar') return PERSONA_VECTOR_STORES_DEFAULT['report_talia'];
  return PERSONA_VECTOR_STORES_DEFAULT['report_talia'];
}

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
      isGeneral = true,
      projectKey
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'content']
      });
    }

    const { client, stores } = getClientAndStores(projectKey);
    const vectorStoreId = personaId ? (stores as any)[personaId] : getDefaultVectorStoreId(projectKey);
    if (!vectorStoreId) {
      return res.status(400).json({
        error: 'No vector store configured for this project/persona',
        projectKey,
        personaId: personaId || null
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
      file = await client.files.create({
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
    const vsApi = (client as any)?.beta?.vectorStores?.files;
    if (!vsApi || typeof vsApi.create !== 'function') {
      return res.status(501).json({ error: 'Vector Stores API not available for this project/client' });
    }
    const vectorStoreFile = await vsApi.create(
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
    const { personaId, projectKey } = req.query as { personaId?: string; projectKey?: string };

    const { client, stores } = getClientAndStores(projectKey);
    const vectorStoreId = personaId ? (stores as any)[personaId as string] : getDefaultVectorStoreId(projectKey);
    if (!vectorStoreId) {
      return res.status(400).json({ error: 'No vector store configured for this project/persona', projectKey, personaId: personaId || null });
    }

    // Get files from vector store
    const vsApi = (client as any)?.beta?.vectorStores?.files;
    if (!vsApi || typeof vsApi.list !== 'function') {
      return res.status(501).json({ error: 'Vector Stores API not available for this project/client' });
    }
    const filesResponse = await vsApi.list(vectorStoreId);
    
    const trainingFiles = [];
    for (const file of filesResponse.data) {
      try {
        const fileDetails = await client.files.retrieve(file.id);
        trainingFiles.push({
          id: file.id,
          filename: fileDetails.filename,
          createdAt: new Date(fileDetails.created_at * 1000),
          size: fileDetails.bytes,
          status: file.status
        });
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
    const { personaId, projectKey, mode } = req.body as { personaId?: string; projectKey?: string; mode?: 'detach' | 'detach_delete' };

    const { client, stores } = getClientAndStores(projectKey);
    const vectorStoreId = personaId ? (stores as any)[personaId as string] : getDefaultVectorStoreId(projectKey);
    if (!vectorStoreId) {
      return res.status(400).json({ error: 'No vector store configured for this project/persona', projectKey, personaId: personaId || null });
    }

    console.log(`🗑️ Deleting training document ${fileId} from ${personaId}`);

    // Remove from vector store
    const vsApiDel = (client as any)?.beta?.vectorStores?.files;
    if (!vsApiDel || typeof vsApiDel.del !== 'function') {
      return res.status(501).json({ error: 'Vector Stores API not available for this project/client' });
    }
    let detached = false;
    try {
      await vsApiDel.del(vectorStoreId, fileId);
      detached = true;
      console.log(`✅ Removed from vector store: ${fileId}`);
    } catch (error) {
      console.warn('Failed to remove from vector store:', error);
    }

    if (mode === 'detach') {
      return res.json({ success: true, detached, deleted: false, fileId, message: 'Detached from vector store' });
    }

    // Delete project file
    const deleteResult = await client.files.del(fileId);
    
    res.json({
      success: true,
      detached,
      deleted: deleteResult.deleted,
      fileId,
      message: 'Training document detached and deleted'
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
