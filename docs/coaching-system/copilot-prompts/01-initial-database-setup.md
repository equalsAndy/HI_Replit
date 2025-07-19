# Copilot Prompt: Extend Development Database for AI Coaching System

## 🎯 Task Overview
Extend the existing development database on AWS Lightsail to support AI coaching system and holistic report generation. This is development-only work that won't affect any production systems.

## 📋 Current Project Context
- **Location**: `/Users/bradtopliff/Desktop/HI_Replit`
- **Environment**: Development branch only
- **Database**: AWS Lightsail PostgreSQL (development)
- **Tech Stack**: Node.js, Drizzle ORM, PostgreSQL, TypeScript
- **Safety**: This is development database only - safe to modify

## 🛠️ Step 1: Extend Database Schema

**File to modify**: `shared/schema.ts`

Add these new tables to the existing schema file (after the existing tables):

```typescript
import { pgTable, uuid, varchar, text, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core';

// Coach knowledge base for storing AST methodology, conversation patterns, etc.
export const coachKnowledgeBase = pgTable('coach_knowledge_base', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: varchar('category', { length: 100 }).notNull(), // 'methodology', 'coaching_patterns', 'team_dynamics'
  contentType: varchar('content_type', { length: 100 }).notNull(), // 'training_prompt', 'example_response', 'guidelines'
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  tags: jsonb('tags'), // for categorization and search
  metadata: jsonb('metadata'), // additional context, source info, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Extended user profiles for team connections and collaboration
export const userProfilesExtended = pgTable('user_profiles_extended', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Company/Team Info
  company: varchar('company', { length: 255 }),
  department: varchar('department', { length: 255 }),
  role: varchar('role', { length: 255 }),
  
  // AST Profile Summary (derived from workshop data)
  astProfileSummary: jsonb('ast_profile_summary'), // processed Star Card + flow data
  
  // Expertise and Experience
  expertiseAreas: jsonb('expertise_areas'), // array of skills/domains
  projectExperience: jsonb('project_experience'), // past projects and roles
  collaborationPreferences: jsonb('collaboration_preferences'), // work style preferences
  
  // Team Connection Data
  availabilityStatus: varchar('availability_status', { length: 50 }).default('available'),
  connectionOptIn: boolean('connection_opt_in').default(true),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Coaching conversation sessions
export const coachingSessions = pgTable('coaching_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Conversation Data
  conversation: jsonb('conversation').notNull(), // full message history
  sessionSummary: text('session_summary'), // AI-generated summary of key topics
  contextUsed: jsonb('context_used'), // what knowledge base content was referenced
  
  // Session Metadata
  sessionType: varchar('session_type', { length: 50 }).default('general'),
  sessionLength: varchar('session_length', { length: 50 }),
  userSatisfaction: varchar('user_satisfaction', { length: 20 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Team connection suggestions and tracking
export const connectionSuggestions = pgTable('connection_suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestorId: uuid('requestor_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  suggestedCollaboratorId: uuid('suggested_collaborator_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Connection Logic
  reasonType: varchar('reason_type', { length: 100 }).notNull(),
  reasonExplanation: text('reason_explanation').notNull(),
  context: text('context'),
  
  // Status Tracking
  status: varchar('status', { length: 50 }).default('suggested'),
  responseAt: timestamp('response_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vector embeddings references (for linking to external vector DB)
export const vectorEmbeddings = pgTable('vector_embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceTable: varchar('source_table', { length: 100 }).notNull(),
  sourceId: uuid('source_id').notNull(),
  vectorId: varchar('vector_id', { length: 255 }).notNull(),
  embeddingType: varchar('embedding_type', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

## 🛠️ Step 2: Create API Routes

**Create new file**: `server/routes/coaching-routes.ts`

```typescript
import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { 
  coachKnowledgeBase, 
  coachingSessions, 
  userProfilesExtended,
  connectionSuggestions 
} from '../../shared/schema';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Upload knowledge base content (AST methodology, coaching patterns, etc.)
router.post('/knowledge-base', authenticateUser, async (req, res) => {
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
router.get('/knowledge-base', authenticateUser, async (req, res) => {
  try {
    const { category, contentType } = req.query;
    
    let query = db.select().from(coachKnowledgeBase);
    
    if (category) {
      query = query.where(eq(coachKnowledgeBase.category, category as string));
    }
    
    const knowledge = await query.orderBy(desc(coachKnowledgeBase.createdAt));
    
    res.json({ success: true, data: knowledge });
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge base' });
  }
});

// Create/update extended user profile for team connections
router.post('/profile/extended', authenticateUser, async (req, res) => {
  try {
    const userId = req.session.userId;
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

// Bulk upload team profiles (for Lion Software fake data)
router.post('/bulk-upload/team-profiles', authenticateUser, async (req, res) => {
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

export default router;
```

## 🛠️ Step 3: Connect Routes to Server

**Modify file**: `server/index.ts`

Add this import near the top with other route imports:
```typescript
import coachingRoutes from './routes/coaching-routes';
```

Add this route after existing routes:
```typescript
app.use('/api/coaching', coachingRoutes);
```

## 🛠️ Step 4: Run Database Migration

**Execute these commands in terminal:**

```bash
# Generate the migration
npx drizzle-kit generate:pg --schema=./shared/schema.ts

# Apply the migration to development database
npx drizzle-kit push:pg
```

## 🛠️ Step 5: Install Vector Database Dependencies

```bash
npm install chromadb uuid @aws-sdk/client-bedrock-runtime
npm install -D @types/uuid
```

## 🛠️ Step 6: Create Vector Database Service

**Create new file**: `server/services/vector-db.ts`

```typescript
import { ChromaApi } from 'chromadb';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { v4 as uuidv4 } from 'uuid';

class VectorDBService {
  private client: ChromaApi;
  private bedrockClient: BedrockRuntimeClient;
  
  constructor() {
    this.client = new ChromaApi({
      host: process.env.CHROMA_HOST || 'localhost',
      port: parseInt(process.env.CHROMA_PORT || '8000'),
    });
    
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-west-2',
    });
  }

  // Create embeddings using Amazon Bedrock Titan
  async createEmbedding(text: string): Promise<number[]> {
    try {
      const command = new InvokeModelCommand({
        modelId: 'amazon.titan-embed-text-v1',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({ 
          inputText: text.substring(0, 8192) // Titan limit
        }),
      });

      const response = await this.bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }

  // Initialize collections for different types of knowledge
  async initializeCollections() {
    try {
      const astCollection = await this.client.getOrCreateCollection({
        name: 'ast_knowledge_base',
        metadata: { description: 'AST methodology, coaching patterns, positive psychology' }
      });

      const teamCollection = await this.client.getOrCreateCollection({
        name: 'team_profiles',
        metadata: { description: 'User profiles, expertise, project experience' }
      });

      console.log('Vector database collections initialized');
      return { astCollection, teamCollection };
    } catch (error) {
      console.error('Error initializing vector collections:', error);
      throw error;
    }
  }

  // Add knowledge base content to vector database
  async addKnowledgeContent(content: {
    id: string;
    category: string;
    title: string;
    content: string;
    metadata?: any;
  }) {
    try {
      const collection = await this.client.getCollection({
        name: 'ast_knowledge_base',
      });

      // Create embedding using Bedrock
      const embedding = await this.createEmbedding(content.content);

      await collection.add({
        ids: [content.id],
        documents: [content.content],
        embeddings: [embedding],
        metadatas: [{
          category: content.category,
          title: content.title,
          source: 'knowledge_base',
          ...content.metadata,
        }],
      });

      console.log(`Added knowledge content: ${content.title}`);
    } catch (error) {
      console.error('Error adding knowledge content:', error);
      throw error;
    }
  }
}

export const vectorDB = new VectorDBService();
```

## 🛠️ Step 7: Update Environment Variables

**Add to `.env` file**:

```bash
# Vector Database (Chroma)
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Amazon Bedrock for Claude and embeddings
AWS_REGION=us-west-2
CLAUDE_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_EMBEDDING_MODEL=amazon.titan-embed-text-v1

# S3 Storage
S3_COACHING_BUCKET_STAGING=hi-coaching-staging-data
S3_COACHING_BUCKET_PRODUCTION=hi-coaching-production-data
```

## ✅ Success Criteria

After completion, you should be able to:
1. **Database migration successful** - new tables created
2. **API endpoints available** - `/api/coaching/knowledge-base` responds
3. **Vector database ready** - Chroma container running
4. **Ready for data upload** - Can POST AST documents and team profiles

## 🚀 Next Steps After Setup

1. Upload AST Compendium to knowledge base
2. Create Lion Software fake profiles
3. Test vector search functionality
4. Begin Claude API integration

**Focus**: This is development environment only - safe to experiment!
