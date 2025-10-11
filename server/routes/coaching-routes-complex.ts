import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { 
  coachKnowledgeBase, 
  userProfilesExtended,
  coachingSessions,
  connectionSuggestions,
  vectorEmbeddings
} from '../../shared/schema.js';
// import { VectorDBService } from '../services/vector-db.js'; // Temporarily disabled
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Initialize database connection
const connection = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(connection);

const router = Router();
const vectorDB = new VectorDBService();

// Initialize vector database (call once on startup)
router.post('/vector/init', async (req, res) => {
  try {
    const success = await vectorDB.initializeCollections();
    res.json({ success, message: success ? 'Vector DB initialized' : 'Failed to initialize' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize vector database' });
  }
});

// Test vector database connection
router.get('/vector/status', async (req, res) => {
  try {
    const connected = await vectorDB.testConnection();
    res.json({ 
      status: connected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check vector database status' });
  }
});

// Extend Express Session type for TypeScript
declare global {
  namespace Express {
    interface Session {
      userId?: number;
      username?: string;
      userRole?: 'admin' | 'facilitator' | 'participant';
    }
  }
}

// Upload knowledge base content (AST methodology, coaching patterns, etc.)
router.post('/knowledge-base', requireAuth, async (req, res) => {
  try {
    const { category, contentType, title, content, tags, metadata } = req.body;
    
    const newKnowledge = await db.insert(coachKnowledgeBase).values({
      category,
      contentType,
      title,
      content,
      tags,
      metadata,
    }).returning();

    res.json({ 
      success: true, 
      data: newKnowledge[0],
      message: 'Knowledge base content added successfully' 
    });
  } catch (error) {
    console.error('Error adding knowledge base content:', error);
    res.status(500).json({ error: 'Failed to add knowledge base content' });
  }
});

// Get knowledge base content (for admin/debugging)
router.get('/knowledge-base', requireAuth, async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = db.select().from(coachKnowledgeBase);
    
    if (category) {
      query = db.select().from(coachKnowledgeBase).where(eq(coachKnowledgeBase.category, category as string));
    }
    
    const knowledge = await query.orderBy(desc(coachKnowledgeBase.createdAt));
    
    res.json({ success: true, data: knowledge });
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge base' });
  }
});

// Create/update extended user profile for team connections
router.post('/profile/extended', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const { 
      company, 
      department, 
      role, 
      expertiseAreas, 
      projectExperience, 
      collaborationPreferences,
      availabilityStatus,
      connectionOptIn 
    } = req.body;

    // Check if profile exists
    const existingProfile = await db.select()
      .from(userProfilesExtended)
      .where(eq(userProfilesExtended.userId, userId))
      .limit(1);

    let profile;
    if (existingProfile.length > 0) {
      // Update existing profile
      profile = await db.update(userProfilesExtended)
        .set({
          company,
          department,
          role,
          expertiseAreas,
          projectExperience,
          collaborationPreferences,
          availabilityStatus,
          connectionOptIn,
          updatedAt: new Date(),
        })
        .where(eq(userProfilesExtended.userId, userId))
        .returning();
    } else {
      // Create new profile
      profile = await db.insert(userProfilesExtended)
        .values({
          userId,
          company,
          department,
          role,
          expertiseAreas,
          projectExperience,
          collaborationPreferences,
          availabilityStatus,
          connectionOptIn,
        })
        .returning();
    }

    res.json({ 
      success: true, 
      data: profile[0],
      message: 'Extended profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating extended profile:', error);
    res.status(500).json({ error: 'Failed to update extended profile' });
  }
});

// Get extended user profile
router.get('/profile/extended', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    
    const profile = await db.select()
      .from(userProfilesExtended)
      .where(eq(userProfilesExtended.userId, userId))
      .limit(1);

    res.json({ 
      success: true, 
      data: profile[0] || null 
    });
  } catch (error) {
    console.error('Error fetching extended profile:', error);
    res.status(500).json({ error: 'Failed to fetch extended profile' });
  }
});

// Save coaching session
router.post('/session', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const { 
      conversation, 
      sessionSummary, 
      contextUsed, 
      sessionType, 
      sessionLength, 
      userSatisfaction 
    } = req.body;

    const newSession = await db.insert(coachingSessions).values({
      userId,
      conversation,
      sessionSummary,
      contextUsed,
      sessionType,
      sessionLength,
      userSatisfaction,
    }).returning();

    res.json({ 
      success: true, 
      data: newSession[0],
      message: 'Coaching session saved successfully' 
    });
  } catch (error) {
    console.error('Error saving coaching session:', error);
    res.status(500).json({ error: 'Failed to save coaching session' });
  }
});

// Get user's coaching sessions
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    
    const sessions = await db.select()
      .from(coachingSessions)
      .where(eq(coachingSessions.userId, userId))
      .orderBy(desc(coachingSessions.createdAt));

    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error fetching coaching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch coaching sessions' });
  }
});

// Bulk upload team profiles (for Lion Software fake data)
router.post('/bulk-upload/team-profiles', requireAuth, async (req, res) => {
  try {
    const { profiles } = req.body; // Array of profile objects
    
    const results = [];
    for (const profile of profiles) {
      const newProfile = await db.insert(userProfilesExtended).values(profile).returning();
      results.push(newProfile[0]);
    }

    res.json({ 
      success: true, 
      data: results,
      message: `Uploaded ${results.length} team profiles` 
    });
  } catch (error) {
    console.error('Error bulk uploading profiles:', error);
    res.status(500).json({ error: 'Failed to bulk upload profiles' });
  }
});

// Create connection suggestion
router.post('/connection-suggestion', requireAuth, async (req, res) => {
  try {
    const requestorId = (req.session as any).userId;
    const { 
      suggestedCollaboratorId, 
      reasonType, 
      reasonExplanation, 
      context 
    } = req.body;

    const newSuggestion = await db.insert(connectionSuggestions).values({
      requestorId,
      suggestedCollaboratorId,
      reasonType,
      reasonExplanation,
      context,
    }).returning();

    res.json({ 
      success: true, 
      data: newSuggestion[0],
      message: 'Connection suggestion created successfully' 
    });
  } catch (error) {
    console.error('Error creating connection suggestion:', error);
    res.status(500).json({ error: 'Failed to create connection suggestion' });
  }
});

// Get connection suggestions for user
router.get('/connection-suggestions', requireAuth, async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    
    const suggestions = await db.select()
      .from(connectionSuggestions)
      .where(eq(connectionSuggestions.requestorId, userId))
      .orderBy(desc(connectionSuggestions.createdAt));

    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Error fetching connection suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch connection suggestions' });
  }
});

export default router;
