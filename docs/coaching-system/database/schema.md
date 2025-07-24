# Database Schema Documentation - AI Coaching System

## 🗄️ Database Architecture Overview

The AI Coaching System extends the existing AST workshop database with new tables for coaching conversations, team connections, and knowledge management.

## 📊 Environment Strategy

### **Three-Database Setup**
- **Development**: AWS Lightsail PostgreSQL (current) - safe for experimentation
- **Staging**: Separate AWS Lightsail PostgreSQL - testing before production  
- **Production**: New AWS Lightsail PostgreSQL - live coaching system

### **Database Connection Configuration**
```typescript
// Environment-aware database connections
const getDatabaseConfig = () => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return process.env.DATABASE_URL_DEV;
    case 'staging':
      return process.env.DATABASE_URL_STAGING;
    case 'production':
      return process.env.DATABASE_URL_PROD;
    default:
      return process.env.DATABASE_URL_DEV;
  }
};
```

## 🏗️ New Tables Schema

### **1. coach_knowledge_base**
Stores AST methodology, coaching patterns, and conversation examples.

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

**Purpose**: 
- Store AST Compendium sections for retrieval
- Coaching conversation patterns and examples
- Team collaboration guidance and templates

**Sample Data**:
```sql
INSERT INTO coach_knowledge_base (category, content_type, title, content, tags) VALUES
('methodology', 'training_prompt', 'Five Strengths Framework', 
 'The AST methodology uses five core strengths: Thinking, Planning, Acting, Feeling, and Imagination...', 
 '["strengths", "assessment", "core_framework"]'),
('coaching_patterns', 'example_response', 'Subtle Growth Coaching',
 'When user mentions feeling stuck: "What usually works for you when you hit challenges like this?"',
 '["conversation", "growth", "questioning"]');
```

### **2. user_profiles_extended**
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
CREATE INDEX idx_extended_opt_in ON user_profiles_extended(connection_opt_in);
CREATE INDEX idx_extended_expertise ON user_profiles_extended USING GIN(expertise_areas);
```

**Purpose**:
- Store team collaboration preferences and expertise
- Enable intelligent team member matching
- Process AST workshop data into coaching-friendly format

**Sample Data**:
```sql
INSERT INTO user_profiles_extended (user_id, company, role, expertise_areas, ast_profile_summary) VALUES
('user-uuid-here', 'Lion Software', 'Product Manager', 
 '["Product Strategy", "User Research", "Data Analysis"]',
 '{"primary_strength": "thinking", "flow_attributes": ["Strategic", "Methodical"], "collaboration_style": "analytical_empathy"}');
```

### **3. coaching_sessions**
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

**Purpose**:
- Store full coaching conversation history
- Track coaching effectiveness and user satisfaction
- Enable context-aware follow-up conversations

**Sample Data Structure**:
```json
{
  "conversation": [
    {
      "role": "user",
      "content": "I'm struggling with prioritizing features for our product roadmap",
      "timestamp": "2025-07-18T14:30:00Z"
    },
    {
      "role": "assistant", 
      "content": "That's a common challenge. What approach have you used before when you had competing priorities?",
      "timestamp": "2025-07-18T14:30:05Z",
      "context_sources": ["knowledge_base_id_123", "user_ast_data"]
    }
  ],
  "context_used": {
    "ast_data": ["thinking_strength", "planning_secondary"],
    "knowledge_base": ["product_management_guidance", "prioritization_frameworks"]
  }
}
```

### **4. connection_suggestions**
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
CREATE INDEX idx_connections_reason ON connection_suggestions(reason_type);
```

**Purpose**:
- Track AI-suggested team collaborations
- Measure success rate of connection suggestions
- Learn from user responses to improve matching

**Sample Data**:
```sql
INSERT INTO connection_suggestions (requestor_id, suggested_collaborator_id, reason_type, reason_explanation, context) VALUES
('user1-uuid', 'user2-uuid', 'complementary_strengths',
 'Sarah has strong analytical thinking that would complement your planning approach for this project',
 'Mobile app feature prioritization challenge');
```

### **5. vector_embeddings**
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
CREATE INDEX idx_vector_id ON vector_embeddings(vector_id);
```

**Purpose**:
- Bridge SQL database with vector database
- Track which records have been embedded
- Enable efficient vector-to-SQL data retrieval

## 🔄 Data Migration Strategy

### **Development Database Migration**
```bash
# Generate migration from schema
npx drizzle-kit generate:pg --schema=./shared/schema.ts

# Apply to development database
npx drizzle-kit push:pg
```

### **Staging Database Setup**
```bash
# Create new staging database
# (AWS Lightsail PostgreSQL instance)

# Apply full schema to staging
npx drizzle-kit push:pg --config=staging

# Seed with test data
npm run seed:staging
```

### **Production Database Setup**
```bash
# Create production database when ready
# Apply schema migrations carefully
# Zero-downtime migration strategy
```

## 📊 Data Relationships

### **Existing AST Data Integration**
```sql
-- Query user's full coaching context
SELECT 
  u.id, u.email, u.role,
  upe.company, upe.expertise_areas, upe.ast_profile_summary,
  wd.starcard, wd.flow_assessment, wd.wellbeing_level
FROM users u
LEFT JOIN user_profiles_extended upe ON u.id = upe.user_id
LEFT JOIN workshop_data wd ON u.id = wd.user_id
WHERE u.id = $1;
```

### **Team Connection Queries**
```sql
-- Find potential collaborators by expertise
SELECT 
  u.email, upe.role, upe.expertise_areas,
  upe.ast_profile_summary->>'primary_strength' as primary_strength
FROM users u
JOIN user_profiles_extended upe ON u.id = upe.user_id
WHERE upe.company = $1
  AND upe.connection_opt_in = true
  AND upe.availability_status = 'available'
  AND upe.expertise_areas ? $2;  -- JSONB contains operator
```

### **Coaching Context Assembly**
```sql
-- Get user's coaching context for AI
SELECT 
  u.id, u.first_name,
  upe.ast_profile_summary,
  cs.conversation->-1 as last_message,  -- Last conversation message
  ckb.content as relevant_knowledge
FROM users u
LEFT JOIN user_profiles_extended upe ON u.id = upe.user_id
LEFT JOIN coaching_sessions cs ON u.id = cs.user_id
LEFT JOIN coach_knowledge_base ckb ON ckb.category = 'coaching_patterns'
WHERE u.id = $1
ORDER BY cs.updated_at DESC
LIMIT 1;
```

## 🚀 Performance Considerations

### **Indexing Strategy**
- **JSONB columns**: GIN indexes for expertise_areas, tags
- **Foreign keys**: Standard B-tree indexes
- **Temporal queries**: Indexes on created_at, updated_at
- **Status queries**: Indexes on status, availability_status

### **Query Optimization**
- **Pagination**: Use cursor-based pagination for large result sets
- **Caching**: Redis for frequently accessed coaching knowledge
- **Connection pooling**: Optimize database connections
- **JSONB queries**: Use proper operators (?, ?&, ?|, @>, <@)

### **Scaling Considerations**
- **Partitioning**: coaching_sessions by date ranges
- **Read replicas**: For analytics and reporting
- **Archival strategy**: Move old sessions to cold storage

## 🔐 Security & Privacy

### **Data Sensitivity Levels**
- **Public**: Knowledge base content, methodology
- **Internal**: Team profiles, expertise areas
- **Private**: Coaching conversations, personal reflections
- **Confidential**: Individual workshop assessments

### **Access Controls**
```sql
-- Row-level security examples
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY coaching_sessions_user_policy ON coaching_sessions
  FOR ALL TO app_user
  USING (user_id = current_setting('app.current_user_id')::uuid);
```

### **Data Retention**
- **Coaching sessions**: Retain for 2 years, then archive
- **Connection suggestions**: Retain for 1 year
- **Knowledge base**: Retain indefinitely with versioning
- **Vector embeddings**: Clean up when source data deleted

---

**Last Updated**: July 18, 2025
**Version**: 1.0
**Status**: Schema design complete, ready for implementation
