# Vector Database Documentation - AI Coaching System

## 🔍 Vector Database Overview

The AI Coaching System uses ChromaDB as a vector database to enable semantic search across AST methodology, team profiles, and coaching knowledge. This powers context-aware coaching conversations and intelligent team connections.

## 🏗️ Architecture

### **Technology Stack**
- **Vector Database**: ChromaDB (containerized)
- **Embeddings**: Amazon Bedrock Titan Text Embeddings
- **Integration**: REST API with PostgreSQL bridge
- **Deployment**: Docker container alongside main application

### **Vector Collections Structure**
```
ChromaDB Instance
├── ast_knowledge_base          # AST methodology and coaching patterns
├── team_profiles              # User expertise and collaboration data
├── conversation_patterns      # Coaching response templates
└── holistic_reports          # Report generation templates
```

## 📊 Collection Schemas

### **1. ast_knowledge_base Collection**
Stores AST methodology, positive psychology principles, and coaching guidance.

**Document Types**:
- **Methodology chunks**: Sections from AST Compendium
- **Coaching patterns**: Response templates and conversation flows
- **Assessment guidance**: How to interpret Star Cards, flow scores
- **Team dynamics**: Collaboration and strength combinations

**Metadata Schema**:
```json
{
  "id": "uuid-from-postgresql",
  "category": "methodology | coaching_patterns | team_dynamics",
  "title": "Five Strengths Framework",
  "source": "AST_Compendium_2025",
  "section": "Core_Methodology",
  "chunk_index": 12,
  "total_chunks": 45,
  "tags": ["strengths", "assessment", "thinking"],
  "created_at": "2025-07-18T14:30:00Z"
}
```

**Sample Documents**:
```
Document: "The Five Strengths model maps human potential across Thinking, Planning, Acting, Feeling, and Imagination. Imagination serves as the apex strength..."
Metadata: {"category": "methodology", "title": "Five Strengths Framework", "tags": ["strengths", "assessment"]}

Document: "When a user mentions feeling stuck, ask: 'What approach has worked for you in similar situations?' This activates their problem-solving patterns..."
Metadata: {"category": "coaching_patterns", "title": "Stuck Response Pattern", "tags": ["conversation", "questions"]}
```

### **2. team_profiles Collection**
User expertise, project experience, and collaboration preferences for team matching.

**Document Types**:
- **Expertise summaries**: Skills, technologies, domain knowledge
- **Project narratives**: Past project experience and contributions
- **Collaboration styles**: Work preferences and communication patterns
- **AST profiles**: Processed strengths and flow data for matching

**Metadata Schema**:
```json
{
  "user_id": "uuid",
  "company": "Lion Software",
  "department": "Product",
  "role": "Product Manager",
  "primary_strength": "thinking",
  "flow_attributes": ["Strategic", "Methodical", "Insightful"],
  "availability": "available",
  "opt_in": true,
  "last_updated": "2025-07-18T14:30:00Z"
}
```

**Sample Documents**:
```
Document: "Product Manager with 5 years experience in mobile app development. Strong analytical thinking combined with user empathy. Led Mobile App Redesign project using data-driven prioritization and collaborative design sessions. Expertise in Product Strategy, User Research, Data Analysis."
Metadata: {"user_id": "uuid", "role": "Product Manager", "primary_strength": "thinking", "availability": "available"}

Document: "Engineering Lead specializing in system architecture and team leadership. Combines systematic planning with reliable execution. Prefers clear requirements and structured implementation phases. Experience with API design, database optimization, and team mentoring."
Metadata: {"user_id": "uuid", "role": "Engineering Lead", "primary_strength": "planning", "availability": "busy"}
```

### **3. conversation_patterns Collection**
Coaching response templates and conversation flow guidance.

**Document Types**:
- **Response templates**: Context-aware coaching responses
- **Question patterns**: Socratic questioning techniques
- **Transition phrases**: Natural conversation connectors
- **Persona guidelines**: Helpful colleague voice and tone

**Sample Documents**:
```
Document: "User expresses frustration with team dynamics. Response pattern: Acknowledge feeling + Explore specific situation + Connect to their strengths. Example: 'That sounds challenging. What part of the team dynamic is most frustrating for you?'"
Metadata: {"pattern_type": "team_dynamics", "emotion": "frustration", "strength_focus": "feeling"}
```

## 🔧 Technical Implementation

### **ChromaDB Setup**
```bash
# Start ChromaDB container
docker run -p 8000:8000 chromadb/chroma

# Verify running
curl http://localhost:8000/api/v1/heartbeat
```

### **Collection Initialization**
```typescript
import { ChromaApi } from 'chromadb';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

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

  // Initialize all collections
  async initializeCollections() {
    const collections = [
      'ast_knowledge_base',
      'team_profiles', 
      'conversation_patterns',
      'holistic_reports'
    ];

    for (const name of collections) {
      await this.client.getOrCreateCollection({
        name,
        metadata: { 
          description: `${name} for AI coaching system`,
          created_at: new Date().toISOString()
        }
      });
    }
  }
}
```

### **Embedding Generation**
```typescript
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
```

## 🔄 Data Pipeline

### **Knowledge Base Population**
```typescript
// Process AST Compendium into knowledge base
async processDocument(document: {
  title: string;
  content: string;
  category: string;
  metadata?: any;
}) {
  // 1. Chunk document into manageable pieces
  const chunks = this.chunkText(document.content, 1000);
  
  // 2. Create embeddings for each chunk
  const embeddings = await Promise.all(
    chunks.map(chunk => this.createEmbedding(chunk))
  );
  
  // 3. Store in ChromaDB
  const collection = await this.client.getCollection({
    name: 'ast_knowledge_base'
  });
  
  const ids = chunks.map(() => uuidv4());
  const metadatas = chunks.map((chunk, index) => ({
    title: document.title,
    category: document.category,
    chunk_index: index,
    total_chunks: chunks.length,
    ...document.metadata
  }));

  await collection.add({
    ids,
    documents: chunks,
    embeddings,
    metadatas
  });

  // 4. Update PostgreSQL tracking
  await this.updateVectorEmbeddings(ids, 'coach_knowledge_base', document.title);
}
```

### **Team Profile Processing**
```typescript
// Convert user data to searchable team profile
async createTeamProfile(user: {
  id: string;
  profile: UserProfileExtended;
  astData: WorkshopData;
}) {
  // 1. Create comprehensive profile text
  const profileText = this.generateProfileText(user);
  
  // 2. Create embedding
  const embedding = await this.createEmbedding(profileText);
  
  // 3. Store in team_profiles collection
  const collection = await this.client.getCollection({
    name: 'team_profiles'
  });
  
  await collection.upsert({
    ids: [user.id],
    documents: [profileText],
    embeddings: [embedding],
    metadatas: [{
      user_id: user.id,
      company: user.profile.company,
      role: user.profile.role,
      primary_strength: user.astData.primaryStrength,
      flow_attributes: user.astData.flowAttributes,
      availability: user.profile.availabilityStatus,
      opt_in: user.profile.connectionOptIn
    }]
  });
}

// Generate searchable profile text
private generateProfileText(user: any): string {
  const { profile, astData } = user;
  
  return `
    ${profile.role} at ${profile.company} in ${profile.department}.
    Primary strength: ${astData.primaryStrength}.
    Flow attributes: ${astData.flowAttributes.join(', ')}.
    Expertise: ${profile.expertiseAreas.join(', ')}.
    Project experience: ${profile.projectExperience.map(p => p.project).join(', ')}.
    Collaboration style: ${profile.collaborationPreferences.workStyle}.
    Communication preference: ${profile.collaborationPreferences.communicationStyle}.
  `.trim();
}
```

## 🔍 Search Operations

### **Coaching Context Search**
```typescript
// Find relevant knowledge for coaching conversation
async searchCoachingContext(query: string, userContext: any) {
  const collection = await this.client.getCollection({
    name: 'ast_knowledge_base'
  });

  // Enhanced query with user context
  const contextualQuery = `
    User challenge: ${query}
    User primary strength: ${userContext.primaryStrength}
    User flow attributes: ${userContext.flowAttributes.join(', ')}
  `;

  const results = await collection.query({
    queryTexts: [contextualQuery],
    nResults: 5,
    where: {
      category: { $in: ['methodology', 'coaching_patterns'] }
    }
  });

  return this.formatSearchResults(results);
}
```

### **Team Member Matching**
```typescript
// Find team members for collaboration
async findCollaborators(request: {
  challenge: string;
  skillsNeeded: string[];
  userCompany: string;
  excludeUserId: string;
}) {
  const collection = await this.client.getCollection({
    name: 'team_profiles'
  });

  const searchQuery = `
    Challenge: ${request.challenge}
    Skills needed: ${request.skillsNeeded.join(', ')}
    Looking for team member who can help with these areas.
  `;

  const results = await collection.query({
    queryTexts: [searchQuery],
    nResults: 5,
    where: {
      $and: [
        { company: request.userCompany },
        { opt_in: true },
        { availability: { $ne: 'unavailable' } },
        { user_id: { $ne: request.excludeUserId } }
      ]
    }
  });

  return this.rankCollaborationMatches(results, request);
}
```

### **Similarity Scoring**
```typescript
// Enhanced matching with multiple factors
private rankCollaborationMatches(results: any, request: any) {
  return results.documents.map((doc: string, index: number) => {
    const metadata = results.metadatas[index];
    const distance = results.distances[index];
    
    // Calculate composite match score
    const semanticScore = 1 - distance; // ChromaDB uses cosine distance
    const availabilityBonus = metadata.availability === 'available' ? 0.1 : 0;
    const strengthsComplement = this.calculateStrengthComplement(
      request.userStrengths, 
      metadata.primary_strength
    );
    
    const totalScore = (semanticScore * 0.7) + 
                      (availabilityBonus * 0.1) + 
                      (strengthsComplement * 0.2);

    return {
      userId: metadata.user_id,
      role: metadata.role,
      matchScore: totalScore,
      semanticRelevance: semanticScore,
      reasoning: this.generateMatchReasoning(metadata, request),
      availability: metadata.availability
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
}
```

## 📊 Performance Optimization

### **Indexing Strategy**
- **Metadata indexes**: Company, role, availability for fast filtering
- **Vector indexes**: HNSW algorithm for approximate nearest neighbor search
- **Batch operations**: Process multiple embeddings simultaneously
- **Caching**: Redis cache for frequently accessed embeddings

### **Query Optimization**
```typescript
// Efficient hybrid search combining filters with vector similarity
async hybridSearch(params: {
  query: string;
  collection: string;
  filters: any;
  limit: number;
}) {
  // 1. Pre-filter by metadata (fast)
  // 2. Vector search on filtered subset (accurate)
  // 3. Re-rank by composite scoring (relevant)
  
  const collection = await this.client.getCollection({
    name: params.collection
  });

  return await collection.query({
    queryTexts: [params.query],
    nResults: params.limit,
    where: params.filters,
    include: ['documents', 'metadatas', 'distances']
  });
}
```

### **Embedding Caching**
```typescript
// Cache embeddings to avoid re-computation
private embeddingCache = new Map<string, number[]>();

async getCachedEmbedding(text: string): Promise<number[]> {
  const cacheKey = this.hashText(text);
  
  if (this.embeddingCache.has(cacheKey)) {
    return this.embeddingCache.get(cacheKey)!;
  }
  
  const embedding = await this.createEmbedding(text);
  this.embeddingCache.set(cacheKey, embedding);
  
  // Implement LRU eviction if cache gets too large
  if (this.embeddingCache.size > 10000) {
    this.evictOldestEntries();
  }
  
  return embedding;
}
```

## 🔄 Data Synchronization

### **PostgreSQL ↔ ChromaDB Sync**
```typescript
// Keep vector database in sync with PostgreSQL
async syncUserProfile(userId: string) {
  // 1. Fetch latest user data from PostgreSQL
  const userData = await this.fetchUserProfileData(userId);
  
  // 2. Check if vector embedding exists
  const existingEmbedding = await this.getVectorEmbedding(
    'team_profiles', 
    userId
  );
  
  // 3. Update or create vector entry
  if (existingEmbedding) {
    await this.updateTeamProfile(userData);
  } else {
    await this.createTeamProfile(userData);
  }
  
  // 4. Update sync timestamp
  await this.updateSyncTimestamp('team_profiles', userId);
}

// Batch sync for multiple users
async batchSyncProfiles(userIds: string[]) {
  const batchSize = 10;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    await Promise.all(batch.map(id => this.syncUserProfile(id)));
  }
}
```

### **Vector Database Backup & Recovery**
```typescript
// Export collections for backup
async exportCollection(collectionName: string) {
  const collection = await this.client.getCollection({
    name: collectionName
  });
  
  // Get all documents (paginated for large collections)
  const allData = await collection.get({
    include: ['documents', 'metadatas', 'embeddings']
  });
  
  // Save to S3 for backup
  await this.saveToS3(`backups/${collectionName}-${Date.now()}.json`, allData);
}

// Restore collection from backup
async restoreCollection(collectionName: string, backupData: any) {
  // Delete existing collection
  await this.client.deleteCollection({ name: collectionName });
  
  // Recreate and populate
  const collection = await this.client.createCollection({
    name: collectionName
  });
  
  await collection.add({
    ids: backupData.ids,
    documents: backupData.documents,
    embeddings: backupData.embeddings,
    metadatas: backupData.metadatas
  });
}
```

## 🔐 Security & Privacy

### **Data Filtering**
```typescript
// Ensure users only access appropriate data
async secureSearch(userId: string, query: string, collectionName: string) {
  const userContext = await this.getUserContext(userId);
  
  // Add security filters based on user context
  const securityFilters = {
    $and: [
      { company: userContext.company }, // Only same company
      { opt_in: true },                 // Only opted-in users
      // Additional role-based filters
    ]
  };
  
  return await this.hybridSearch({
    query,
    collection: collectionName,
    filters: securityFilters,
    limit: 10
  });
}
```

### **Data Anonymization**
```typescript
// Remove sensitive data from embeddings
private sanitizeForEmbedding(profileData: any): string {
  // Remove: personal contact info, salary data, private projects
  // Keep: role, expertise, collaboration style, public project names
  
  return {
    role: profileData.role,
    expertise: profileData.expertiseAreas,
    projectTypes: profileData.projects.map(p => p.type), // Not specific names
    collaborationStyle: profileData.collaborationPreferences,
    strengths: profileData.astProfileSummary
  };
}
```

## 📊 Monitoring & Analytics

### **Vector Database Health**
```typescript
// Monitor vector database performance
async getVectorDBHealth() {
  const collections = await this.client.listCollections();
  
  const health = await Promise.all(
    collections.map(async (collection) => {
      const count = await collection.count();
      const sample = await collection.peek({ limit: 1 });
      
      return {
        name: collection.name,
        documentCount: count,
        lastUpdated: sample.metadatas[0]?.created_at,
        status: count > 0 ? 'healthy' : 'empty'
      };
    })
  );
  
  return {
    totalCollections: collections.length,
    totalDocuments: health.reduce((sum, c) => sum + c.documentCount, 0),
    collections: health,
    systemStatus: 'operational'
  };
}
```

### **Search Analytics**
```typescript
// Track search performance and relevance
async logSearchMetrics(searchId: string, query: string, results: any, userFeedback?: number) {
  const metrics = {
    searchId,
    query: query.substring(0, 100), // Truncate for privacy
    resultCount: results.length,
    averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
    responseTime: Date.now() - searchId.timestamp,
    userFeedback, // 1-5 rating if provided
    timestamp: new Date()
  };
  
  // Store in analytics database or send to monitoring service
  await this.recordSearchMetrics(metrics);
}
```

---

**Last Updated**: July 18, 2025
**Version**: 1.0
**Status**: Vector database design complete, ready for implementation
