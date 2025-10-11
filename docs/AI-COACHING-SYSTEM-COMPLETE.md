# AI Coaching System - Complete Implementation Guide

**Last Updated**: January 2025  
**Version**: 2.0  
**Status**: Comprehensive consolidation - Ready for implementation

---

## 📋 **EXECUTIVE SUMMARY**

The AI Coaching System enhances the AllStarTeams (AST) workshop platform with intelligent coaching capabilities. **Key finding**: Sophisticated reflection AI modals already exist and are functional. The missing piece is the complete backend AI implementation documented below.

### **🎯 Core Capabilities**
1. **Individual AI Coach**: Personalized coaching conversations using Claude API
2. **Team Connection Engine**: Intelligent suggestions for collaboration based on strengths  
3. **Holistic Report Generation**: AI-powered comprehensive development reports
4. **Workshop AI Assistant**: Guided reflection during workshop completion (UI exists)

### **✅ Current Implementation Status**
- **Frontend Modals**: ✅ **COMPLETE** - Two sophisticated coaching modals with dual-pane interfaces
- **API Structure**: ✅ **COMPLETE** - Route handlers and integration points ready
- **Documentation**: ✅ **COMPLETE** - Comprehensive specs for all components
- **Backend AI Logic**: ❌ **PENDING** - Core coaching conversation engine needs implementation
- **Vector Database**: ❌ **PENDING** - ChromaDB + AWS Bedrock integration
- **Database Schema**: ❌ **PENDING** - 5 new tables for coaching data

### **🚀 Implementation Priority**
1. **Database Setup** (2-3 days) - Create 5 coaching tables on staging
2. **Vector Database** (3-4 days) - ChromaDB + AWS Bedrock embeddings  
3. **AI Coaching API** (4-5 days) - Claude conversation engine
4. **Production Deployment** (2-3 days) - Full system deployment

---

## 🏗️ **SYSTEM ARCHITECTURE**

### **Technology Stack**
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (AWS Lightsail) + ChromaDB (Vector)
- **AI Services**: AWS Bedrock (Claude + Titan Embeddings)
- **Frontend**: React + TypeScript (modals already implemented)
- **Deployment**: Docker, AWS Lightsail
- **Storage**: S3 for documents and backups

### **Component Overview**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  React Client   │    │   Express API    │    │  PostgreSQL DB  │
│                 │◄──►│                  │◄──►│                 │
│ ✅ CoachingModal │    │ ✅ Routes Setup  │    │ ❌ 5 New Tables │
│ ✅ ReflectionUI │    │ ❌ AI Logic     │    │ ✅ Existing Data│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌────────┴────────┐
                       │                 │
                       ▼                 ▼
            ┌─────────────────┐    ┌─────────────────┐
            │   AWS Bedrock   │    │    ChromaDB     │
            │                 │    │                 │
            │ ❌ Claude API   │    │ ❌ Vector Store │
            │ ❌ Titan Embed  │    │ ❌ Semantic     │
            │ ❌ Integration  │    │   Search        │
            └─────────────────┘    └─────────────────┘
```

### **Data Flow Architecture**
```
Workshop Completion → PostgreSQL → Vector Database → Claude API → Coaching Response
       ↓                 ↓              ↓               ↓              ↓
   Assessments      Extended       Embeddings     AI Context    User Interface
   Reflections      Profiles       Knowledge      Generation     (Existing)
```

---

## 💻 **EXISTING FRONTEND IMPLEMENTATION ANALYSIS**

### **✅ CoachingModal Components (ALREADY BUILT)**

#### **1. Advanced Modal (`/client/src/components/modals/CoachingModal.tsx`)**
- **Split-pane design**: TaliaPanel (AI chat) + ReflectionPanel (writing)  
- **Full conversation UI**: Message history, typing indicators
- **Context awareness**: Uses current strength and user data
- **Professional interface**: Clean, responsive design

#### **2. Workshop Modal (`/client/src/components/coaching/CoachingModal.tsx`)**
- **Dual-tab interface**: "Chat with Coach" + "Write Your Reflection"
- **Workshop integration**: Knows current step, reflection question
- **API ready**: Connected to `/api/coaching/chat/` endpoints
- **Context logging**: Debug information for troubleshooting

#### **3. Provider System (`/client/src/components/modals/CoachingModalProvider.tsx`)**
- **State management**: useCoachingModal hook integration
- **Global access**: Available throughout application
- **Message handling**: Add messages, update drafts

### **🔌 Existing API Integration Points**
```typescript
// Already implemented in workshop modal
const messageResponse = await fetch('/api/coaching/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    conversationId: conversationData.conversationId,
    message: coachingInput,
    persona: 'workshop_assistant',
    context: {
      currentStrength,
      stepNumber: currentStep,
      workshopStep: `reflect_${currentStep}`,
      reflectionQuestion
    }
  })
});
```

**Key Finding**: Frontend is production-ready. Backend API needs to be implemented to match these existing calls.

---

## 🗄️ **DATABASE SCHEMA SPECIFICATION**

### **Environment Strategy**
- **Development**: Current AWS Lightsail PostgreSQL (safe for testing)
- **Staging**: Separate AWS Lightsail PostgreSQL (deployment testing)
- **Production**: Protected AWS Lightsail PostgreSQL (live system)

### **5 New Tables Required**

#### **1. coach_knowledge_base**
Store AST methodology, coaching patterns, and conversation examples.

```sql
CREATE TABLE coach_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,        -- 'methodology', 'coaching_patterns', 'team_dynamics'
  content_type VARCHAR(100) NOT NULL,    -- 'training_prompt', 'example_response', 'guidelines'
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags JSONB,                           -- for categorization and search
  metadata JSONB,                       -- additional context, source info, etc.
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_knowledge_category ON coach_knowledge_base(category);
CREATE INDEX idx_knowledge_content_type ON coach_knowledge_base(content_type);
CREATE INDEX idx_knowledge_tags ON coach_knowledge_base USING GIN(tags);
```

#### **2. user_profiles_extended**
Extended user profiles for team connections and collaboration matching.

```sql
CREATE TABLE user_profiles_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Company/Team Information
  company VARCHAR(255),
  department VARCHAR(255),
  role VARCHAR(255),
  
  -- AST Profile Summary (processed from workshop data)
  ast_profile_summary JSONB,            -- Star Card + flow data summary
  
  -- Professional Information
  expertise_areas JSONB,                -- array of skills/domains
  project_experience JSONB,             -- past projects and roles
  collaboration_preferences JSONB,       -- work style preferences
  
  -- Team Connection Settings
  availability_status VARCHAR(50) DEFAULT 'available',  -- 'available', 'busy', 'unavailable'
  connection_opt_in BOOLEAN DEFAULT true,               -- wants to be suggested for collaborations
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(user_id)
);

-- Indexes for team matching queries
CREATE INDEX idx_extended_company ON user_profiles_extended(company);
CREATE INDEX idx_extended_department ON user_profiles_extended(department);
CREATE INDEX idx_extended_availability ON user_profiles_extended(availability_status);
CREATE INDEX idx_extended_expertise ON user_profiles_extended USING GIN(expertise_areas);
```

#### **3. coaching_sessions**
Store coaching conversation sessions with context and metadata.

```sql
CREATE TABLE coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Conversation Data
  conversation JSONB NOT NULL,           -- full message history array
  session_summary TEXT,                 -- AI-generated summary of key topics
  context_used JSONB,                   -- what knowledge base content was referenced
  
  -- Session Metadata
  session_type VARCHAR(50) DEFAULT 'general',  -- 'general', 'growth_planning', 'team_connection'
  session_length VARCHAR(50),           -- estimated conversation duration
  user_satisfaction VARCHAR(20),        -- optional user feedback rating
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for session queries
CREATE INDEX idx_sessions_user ON coaching_sessions(user_id);
CREATE INDEX idx_sessions_type ON coaching_sessions(session_type);
CREATE INDEX idx_sessions_date ON coaching_sessions(created_at);
```

#### **4. connection_suggestions**
Track team collaboration suggestions and their outcomes.

```sql
CREATE TABLE connection_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requestor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  suggested_collaborator_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Connection Logic
  reason_type VARCHAR(100) NOT NULL,    -- 'complementary_strengths', 'similar_challenge', 'expertise_match'
  reason_explanation TEXT NOT NULL,     -- human-readable explanation
  context TEXT,                         -- the problem/project context
  
  -- Status Tracking
  status VARCHAR(50) DEFAULT 'suggested',  -- 'suggested', 'viewed', 'connected', 'declined', 'expired'
  response_at TIMESTAMP,               -- when user responded
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CHECK (requestor_id != suggested_collaborator_id)
);

-- Indexes for connection queries
CREATE INDEX idx_connections_requestor ON connection_suggestions(requestor_id);
CREATE INDEX idx_connections_suggested ON connection_suggestions(suggested_collaborator_id);
CREATE INDEX idx_connections_status ON connection_suggestions(status);
```

#### **5. vector_embeddings**
Link database records to vector database entries for semantic search.

```sql
CREATE TABLE vector_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table VARCHAR(100) NOT NULL,   -- 'coach_knowledge_base', 'user_profiles_extended', etc.
  source_id UUID NOT NULL,              -- reference to the actual record
  vector_id VARCHAR(255) NOT NULL,      -- ID in the vector database (ChromaDB)
  embedding_type VARCHAR(100) NOT NULL, -- 'knowledge_chunk', 'user_profile', 'conversation_summary'
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(source_table, source_id, embedding_type)
);

-- Indexes for vector lookups
CREATE INDEX idx_vector_source ON vector_embeddings(source_table, source_id);
CREATE INDEX idx_vector_type ON vector_embeddings(embedding_type);
```

### **Migration Strategy**
```bash
# Development database setup
npx drizzle-kit generate:pg --schema=./shared/schema.ts
npx drizzle-kit push:pg

# Staging database deployment  
npx drizzle-kit push:pg --config=staging
npm run seed:staging

# Production deployment (when ready)
npx drizzle-kit push:pg --config=production
```

---

## 🧠 **VECTOR DATABASE INTEGRATION**

### **ChromaDB + AWS Bedrock Architecture**
- **Vector Database**: ChromaDB (containerized with main app)
- **Embeddings**: Amazon Bedrock Titan Text Embeddings v1
- **Collections**: 4 specialized collections for different data types
- **Integration**: REST API bridge with PostgreSQL tracking

### **Vector Collections Structure**
```
ChromaDB Instance
├── ast_knowledge_base          # AST methodology and coaching patterns
├── team_profiles              # User expertise and collaboration data  
├── conversation_patterns      # Coaching response templates
└── holistic_reports          # Report generation templates
```

### **Technical Implementation**

#### **ChromaDB Service Setup**
```typescript
import { ChromaClient } from 'chromadb';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export class VectorDBService {
  private client: ChromaClient;
  private bedrockClient: BedrockRuntimeClient;

  constructor() {
    this.client = new ChromaClient({
      host: process.env.CHROMA_HOST || 'localhost',
      port: parseInt(process.env.CHROMA_PORT || '8000')
    });
    
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-west-2'
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

  // Create embeddings using Amazon Bedrock Titan
  async createEmbedding(text: string): Promise<number[]> {
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
  }
}
```

#### **Knowledge Base Population**
```typescript
// Process AST Compendium into searchable knowledge
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
}
```

### **Environment Configuration**
```bash
# Vector Database
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Amazon Bedrock
AWS_REGION=us-west-2
CLAUDE_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_EMBEDDING_MODEL=amazon.titan-embed-text-v1

# Development setup
docker run -p 8000:8000 chromadb/chroma
```

---

## 🔌 **COMPLETE API SPECIFICATION**

### **API Base URL**: `/api/coaching`
**Authentication**: All endpoints require user session authentication

### **Knowledge Base Management**

#### **POST** `/knowledge-base`
Upload AST methodology and coaching content.

**Request Body**:
```json
{
  "category": "methodology" | "coaching_patterns" | "team_dynamics",
  "contentType": "training_prompt" | "example_response" | "guidelines",
  "title": "Five Strengths Framework",
  "content": "The AST methodology focuses on...",
  "tags": ["strengths", "assessment"],
  "metadata": {
    "source": "AST Compendium",
    "section": "Core Framework"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "category": "methodology",
    "title": "Five Strengths Framework",
    "createdAt": "2025-01-26T14:30:00Z"
  }
}
```

#### **GET** `/knowledge-base`
Retrieve knowledge base content with filtering.

**Query Parameters**:
- `category` (optional): Filter by content category
- `limit` (optional): Number of results (default: 50)

### **Coaching Conversations**

#### **POST** `/session`
Start a new coaching conversation.

**Request Body**:
```json
{
  "initialMessage": "I'm struggling with prioritizing features for our product roadmap",
  "sessionType": "general" | "growth_planning" | "team_connection"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "conversation": [
      {
        "role": "user",
        "content": "I'm struggling with prioritizing features...",
        "timestamp": "2025-01-26T14:30:00Z"
      }
    ],
    "sessionType": "general"
  }
}
```

#### **POST** `/session/:sessionId/message`
Continue coaching conversation with AI response.

**Request Body**:
```json
{
  "message": "I usually try to balance user value with business impact, but this time I have too many high-priority items"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "conversation": [
      {
        "role": "user",
        "content": "I usually try to balance user value...",
        "timestamp": "2025-01-26T14:30:05Z"
      },
      {
        "role": "assistant",
        "content": "That balance approach sounds like your thinking strength at work...",
        "timestamp": "2025-01-26T14:30:08Z",
        "contextSources": ["thinking_strength_guidance"]
      }
    ]
  },
  "response": {
    "role": "assistant",
    "content": "That balance approach sounds like your thinking strength at work..."
  }
}
```

### **Team Connections**  

#### **GET** `/connections/suggestions`
Get AI-generated team collaboration suggestions.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "suggestion-uuid",
      "suggestedCollaborator": {
        "id": "user-uuid",
        "name": "Sarah Chen",
        "role": "Product Manager"
      },
      "reasonType": "complementary_strengths",
      "reasonExplanation": "Sarah has strong analytical thinking that would complement your planning approach",
      "matchScore": 0.85
    }
  ]
}
```

#### **POST** `/connections/suggest`
Generate new team collaboration suggestions.

**Request Body**:
```json
{
  "challenge": "I need help with user research methodology",
  "skillsNeeded": ["User Research", "Mobile UX"],
  "collaborationType": "consultation"
}
```

### **User Profile Management**

#### **POST** `/profile/extended`
Create or update extended user profile.

**Request Body**:
```json
{
  "company": "Lion Software",
  "role": "Product Manager",
  "expertiseAreas": ["Product Strategy", "User Research"],
  "collaborationPreferences": {
    "workStyle": "collaborative_analytical",
    "communicationStyle": "structured_brainstorming"
  },
  "connectionOptIn": true
}
```

### **Additional Endpoints**
- **GET** `/sessions` - User's coaching session history
- **GET** `/session/:sessionId` - Full session details
- **POST** `/connections/:suggestionId/respond` - Respond to team suggestions
- **GET** `/search/knowledge` - Search knowledge base
- **GET** `/analytics/usage` - System usage metrics

---

## 🔄 **DATA FLOW PATTERNS**

### **1. Coaching Conversation Flow**

```
User Message → Session Validation → User Context Assembly → Vector Search → Claude API → Response Storage → UI Update
```

**Detailed Process**:
1. **Message Reception**: User types message in existing CoachingModal
2. **Context Loading**: Fetch user's AST data, recent conversation history
3. **Knowledge Search**: Vector search for relevant coaching patterns
4. **AI Generation**: Claude API call with assembled context
5. **Response Processing**: Store conversation, update UI

**Key Implementation**:
```typescript
// Context assembly for Claude API
const claudePrompt = `
You are a helpful colleague coaching ${userContext.firstName}.

User Context:
- Role: ${userContext.role} at ${userContext.company}  
- Primary Strength: ${userContext.primaryStrength}
- Recent conversation: ${lastMessages}

Relevant Knowledge:
${knowledgeResults.map(r => r.content).join('\n')}

User Message: "${userMessage}"

Respond as a supportive colleague, naturally referencing their strengths.
`;
```

### **2. Team Connection Flow**

```
Connection Request → User Analysis → Team Profile Search → Compatibility Scoring → Suggestion Generation → Storage
```

**Matching Algorithm**:
```typescript
const totalScore = (semanticMatch * 0.6) + 
                   (strengthComplement * 0.3) + 
                   (availabilityBonus * 0.1);
```

### **3. Holistic Report Generation Flow**

```
Report Trigger → Data Assembly → Template Selection → Claude Generation → PDF Creation → Download
```

**Data Assembly Query**:
```sql
-- Complete user data for holistic report
SELECT 
  u.first_name, u.last_name,
  wd.starcard, wd.flow_assessment, wd.wellbeing_level,
  sr.strength1, sr.team_values, sr.unique_contribution,
  cl.current_factors, cl.future_improvements,
  fs.twenty_year_vision, fs.flow_optimized_life,
  fr.future_letter_text
FROM users u
LEFT JOIN workshop_data wd ON u.id = wd.user_id
LEFT JOIN step_reflections sr ON u.id = sr.user_id  
LEFT JOIN cantril_ladder cl ON u.id = cl.user_id
LEFT JOIN future_self fs ON u.id = fs.user_id
LEFT JOIN final_reflection fr ON u.id = fr.user_id
WHERE u.id = $userId;
```

---

## 🚀 **DEPLOYMENT GUIDE**

### **Staging VM Deployment** (`34.220.143.127`)

#### **1. Environment Setup**
```bash
# SSH to staging VM
ssh -i /path/to/ubuntu-staging-key.pem ubuntu@34.220.143.127

# Install Docker if not present
sudo apt update && sudo apt install docker.io docker-compose

# Create coaching environment file
cat > coaching.env << EOF
NODE_ENV=staging
DATABASE_URL=postgresql://staging-db-connection-string
SESSION_SECRET=staging-secret-key
CHROMA_HOST=localhost
CHROMA_PORT=8000
AWS_REGION=us-west-2
CLAUDE_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_EMBEDDING_MODEL=amazon.titan-embed-text-v1
EOF
```

#### **2. Docker Compose Configuration**
```yaml
# docker-compose.coaching.yml
version: '3.8'
services:
  app:
    image: your-app-image:staging
    ports:
      - "80:8080"
    env_file:
      - coaching.env
    depends_on:
      - chromadb
    restart: unless-stopped

  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma_data:/chroma/chroma
    restart: unless-stopped

volumes:
  chroma_data:
```

#### **3. Database Migration**
```bash
# Apply coaching schema to staging database
docker exec -it staging-app npm run db:migrate:staging

# Initialize vector database collections
curl -X POST "http://localhost:8080/api/coaching/vector/init"

# Verify setup
curl -X GET "http://localhost:8080/api/coaching/vector/status"
```

### **AWS Bedrock Setup**

#### **1. IAM Role Configuration**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
        "arn:aws:bedrock:us-west-2::foundation-model/amazon.titan-embed-text-v1"
      ]
    }
  ]
}
```

#### **2. Environment Variables**
```bash
# Add to staging environment
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key  
AWS_REGION=us-west-2
```

### **Production Deployment**

#### **1. Lightsail Container Service**
```bash
# Build production image with coaching features
docker build --platform linux/amd64 -t coaching-app:prod .

# Push to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin your-ecr-uri
docker tag coaching-app:prod your-ecr-uri/coaching-app:prod
docker push your-ecr-uri/coaching-app:prod

# Deploy to Lightsail
aws lightsail create-container-service-deployment \
  --service-name hi-replit-v2 \
  --containers file://coaching-deployment.json
```

#### **2. Production Environment**
```json
{
  "containers": {
    "coaching-app": {
      "image": ":hi-replit-v2.coaching-app-prod.latest",
      "environment": {
        "NODE_ENV": "production",
        "DATABASE_URL": "production-db-connection",
        "CHROMA_HOST": "chromadb",
        "AWS_REGION": "us-west-2"
      },
      "ports": {
        "8080": "HTTP"
      }
    },
    "chromadb": {
      "image": "chromadb/chroma:latest",
      "ports": {
        "8000": "HTTP"
      }
    }
  }
}
```

---

## 📋 **IMPLEMENTATION ROADMAP**

### **Phase 1: Database & Vector Setup (5-7 days)**

#### **Week 1 Priority Tasks**
1. **Database Schema Implementation** (2-3 days)
   - Add 5 coaching tables to staging database
   - Implement Drizzle ORM models in `shared/schema.ts`
   - Create migration scripts and run on staging
   - Test table relationships and constraints

2. **ChromaDB Integration** (3-4 days)
   - Deploy ChromaDB container on staging VM
   - Implement VectorDBService with AWS Bedrock embeddings
   - Create initialization scripts for 4 collections
   - Test embedding generation and vector search

**Deliverables**:
- ✅ 5 new database tables operational on staging
- ✅ ChromaDB running with Bedrock embeddings
- ✅ Vector search capabilities functional
- ✅ Basic health check endpoints working

### **Phase 2: AI Coaching API (5-6 days)**

#### **Week 2 Priority Tasks**
1. **Coaching Conversation Engine** (3-4 days)
   - Implement `/api/coaching/session` and `/api/coaching/session/:id/message` endpoints
   - Create Claude API integration with context assembly
   - Build knowledge base search and response generation
   - Connect to existing CoachingModal frontend calls

2. **Team Connection System** (2-3 days)
   - Implement `/api/coaching/connections/suggest` endpoint
   - Build team profile vector search and matching algorithm
   - Create compatibility scoring with strength analysis
   - Test suggestion generation and storage

**Deliverables**:
- ✅ Coaching conversations working end-to-end
- ✅ Existing CoachingModal fully functional with AI
- ✅ Team connection suggestions generating
- ✅ All API endpoints responding correctly

### **Phase 3: Knowledge Base & Content (3-4 days)**

#### **Week 3 Priority Tasks**
1. **AST Methodology Upload** (2-3 days)
   - Process AST Compendium into knowledge base chunks
   - Upload coaching patterns and conversation examples
   - Create document processing pipeline
   - Test knowledge search relevance

2. **Holistic Report Enhancement** (1-2 days)
   - Integrate coaching insights into existing report generation
   - Add AI-powered growth recommendations
   - Test report content quality and generation speed

**Deliverables**:
- ✅ Complete AST methodology searchable in vector database
- ✅ Coaching knowledge base populated with patterns
- ✅ Enhanced holistic reports with AI insights
- ✅ Document upload and processing pipeline working

### **Phase 4: Production Deployment (3-4 days)**

#### **Week 4 Priority Tasks**
1. **Production Environment Setup** (2-3 days)
   - Create production database with coaching schema
   - Deploy ChromaDB + app containers to Lightsail
   - Configure AWS Bedrock access and security
   - Implement monitoring and logging

2. **Testing & Optimization** (1-2 days)
   - End-to-end system testing with real user data
   - Performance optimization for vector searches
   - Load testing coaching conversation endpoints
   - Security audit and access control verification

**Deliverables**:
- ✅ Full production deployment operational
- ✅ All coaching features live and tested
- ✅ Performance metrics within acceptable ranges
- ✅ Security and monitoring systems active

### **Success Metrics**
- **Response Time**: Coaching responses < 3 seconds
- **Accuracy**: 85%+ user satisfaction with AI responses
- **Reliability**: 99.5% uptime for coaching endpoints
- **Usage**: Existing CoachingModal fully functional with AI backend

---

## 🔧 **TECHNICAL INTEGRATION POINTS**

### **Frontend Modal Integration**
The existing CoachingModal components are already making API calls that need to be implemented:

```typescript
// Existing call in CoachingModal.tsx - needs backend implementation
const messageResponse = await fetch('/api/coaching/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    conversationId: conversationData.conversationId,
    message: coachingInput,
    persona: 'workshop_assistant',
    context: {
      currentStrength,
      stepNumber: currentStep, 
      workshopStep: `reflect_${currentStep}`,
      reflectionQuestion
    }
  })
});
```

### **Database Integration**
Extend existing `shared/schema.ts` with coaching tables:

```typescript
// Add to shared/schema.ts
export const coachKnowledgeBase = pgTable('coach_knowledge_base', {
  id: uuid('id').defaultRandom().primaryKey(),
  category: varchar('category', { length: 100 }).notNull(),
  contentType: varchar('content_type', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  tags: jsonb('tags'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Additional tables: userProfilesExtended, coachingSessions, connectionSuggestions, vectorEmbeddings
```

### **Existing Workshop Data Integration**
```sql
-- Leverage existing workshop_data table for coaching context
SELECT 
  wd.starcard,
  wd.flow_assessment, 
  wd.wellbeing_level,
  wd.flow_attributes
FROM workshop_data wd
WHERE wd.user_id = $userId
```

### **Error Handling & Fallbacks**
```typescript
// Graceful degradation when AI services unavailable
const coachingResponse = await claudeAPI.generateResponse(prompt)
  .catch(error => {
    console.error('Claude API error:', error);
    return generateFallbackResponse(userContext, userMessage);
  });
```

---

## 🔐 **SECURITY & PRIVACY**

### **Data Access Controls**
- **User Sessions**: All endpoints require valid session authentication
- **Company Isolation**: Team suggestions filtered by user's company
- **Opt-in Only**: Team profiles only searchable if user opted in
- **Personal Data**: Coaching conversations only accessible by owner

### **Data Sanitization**
```typescript
// Remove sensitive data before vector embedding
function sanitizeForEmbedding(userData: any): string {
  return {
    role: userData.role,
    expertise: userData.expertiseAreas,
    collaborationStyle: userData.collaborationPreferences,
    strengths: userData.astProfileSummary
    // Exclude: email, phone, salary, private projects
  };
}
```

### **AI Safety**
- **Bounded Responses**: Claude responses limited to coaching persona
- **Knowledge Scope**: Vector search limited to approved AST methodology
- **Context Filtering**: Only relevant, appropriate knowledge used
- **Audit Trail**: All AI interactions logged for review

---

## 📊 **MONITORING & ANALYTICS**

### **Health Check Endpoints**
```bash
# System health
curl http://localhost:8080/api/coaching/health

# Vector database status  
curl http://localhost:8080/api/coaching/vector/status

# Database connectivity
curl http://localhost:8080/api/coaching/db/status
```

### **Key Metrics to Track**
- **Coaching Sessions**: Daily active users, session length, satisfaction
- **Team Connections**: Suggestion acceptance rate, collaboration success
- **API Performance**: Response times, error rates, throughput
- **Vector Search**: Query relevance, search accuracy, cache hit rates

### **Usage Analytics**
```typescript
// Log coaching interactions for improvement
async function logCoachingMetrics(event: {
  userId: string;
  action: 'message_sent' | 'connection_suggested' | 'report_generated';
  responseTime: number;
  success: boolean;
  userFeedback?: number; // 1-5 rating
}) {
  await metricsService.track(event);
}
```

---

## 🎯 **NEXT STEPS**

### **Immediate Actions (This Week)**
1. **Database Setup**: Apply coaching schema to staging database
2. **Vector Database**: Deploy ChromaDB container on staging VM
3. **API Stub**: Create basic endpoint stubs that existing modals can call
4. **AWS Bedrock**: Configure IAM roles and test Claude API access

### **Priority Development (Week 1-2)**
1. **Core Coaching API**: Implement conversation engine with Claude integration
2. **Vector Search**: Build knowledge base search and context assembly
3. **Frontend Integration**: Connect existing CoachingModal to AI backend
4. **Testing**: End-to-end testing with staging environment

### **Production Readiness (Week 3-4)**
1. **Knowledge Upload**: Process AST Compendium into vector database
2. **Performance Optimization**: Caching, query optimization, load testing
3. **Production Deployment**: Full system deployment to Lightsail
4. **Monitoring**: Analytics, health checks, error reporting

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Common Issues**
1. **ChromaDB Connection**: Verify container is running on port 8000
2. **AWS Bedrock Access**: Check IAM roles and regional availability
3. **Database Migration**: Ensure all foreign key relationships exist
4. **Modal API Calls**: Match exact endpoint paths and request formats

### **Debug Commands**
```bash
# Test vector database
curl -X GET "http://localhost:8000/api/v2/version"

# Test coaching endpoints
curl -X POST "http://localhost:8080/api/coaching/vector/init"

# Check database connectivity
npx drizzle-kit introspect:pg
```

### **Development Resources**
- **ChromaDB Docs**: https://docs.trychroma.com/
- **AWS Bedrock Guide**: https://docs.aws.amazon.com/bedrock/
- **Drizzle ORM**: https://orm.drizzle.team/docs/overview
- **Vector Embedding Best Practices**: Semantic search optimization guides

---

**This comprehensive guide consolidates all AI coaching system documentation into a single implementation-ready resource. The existing CoachingModal components are production-ready; focus implementation efforts on the backend AI engine and vector database integration.**

**Status**: Ready for immediate development - all specifications complete, existing frontend components functional, clear implementation roadmap provided.