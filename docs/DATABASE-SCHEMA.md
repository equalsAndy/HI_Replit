# Database Schema Documentation

## 🗄️ AI Coaching System Database Schema

This document details the database schema extensions for the AI Coaching System built on the AllStarTeams platform.

## Overview

The AI Coaching System extends the existing AST database with 5 new tables designed to support:
- Knowledge base management with semantic search
- Extended user profiling for coaching
- Coaching session tracking and recommendations
- Team member connection suggestions
- Vector embedding metadata storage

## Database Configuration

### Connection Details
- **Database Type**: PostgreSQL
- **ORM**: Drizzle ORM
- **Environment Variable**: `DATABASE_URL`
- **SSL Configuration**: Required for AWS RDS/Lightsail

### Existing AST Tables (Reference)
- `users` - User authentication and basic info
- `assessments` - Star Card and assessment results
- `user_progress` - Workshop step completion tracking
- `videos` - AST methodology content
- `session_aws` - Express session storage

## New Coaching Tables

### 1. coach_knowledge_base

**Purpose**: Store AST methodology content, coaching guides, and knowledge articles for semantic search and AI recommendations.

```sql
CREATE TABLE coach_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_knowledge_category ON coach_knowledge_base(category);
CREATE INDEX idx_knowledge_created_at ON coach_knowledge_base(created_at);
CREATE INDEX idx_knowledge_title ON coach_knowledge_base USING gin(to_tsvector('english', title));
CREATE INDEX idx_knowledge_content ON coach_knowledge_base USING gin(to_tsvector('english', content));
```

**Field Descriptions**:
- `id`: UUID primary key, auto-generated
- `title`: Article/content title (max 255 characters)
- `content`: Full text content for semantic search
- `category`: Content category (e.g., "team_dynamics", "communication", "leadership")
- `tags`: Array of relevant tags for filtering
- `source`: Content source reference (e.g., "AST Methodology Guide v1.0")
- `created_at`: Record creation timestamp
- `updated_at`: Last modification timestamp

**Sample Data**:
```sql
INSERT INTO coach_knowledge_base (title, content, category, tags, source) VALUES (
    'AST Team Dynamics Foundation',
    'The All Stars Team methodology focuses on understanding individual strengths and challenges to build high-performing teams. Key principles include psychological safety, clear communication, and leveraging diverse perspectives.',
    'team_dynamics',
    ARRAY['foundation', 'team-building', 'psychology'],
    'AST Methodology Guide v1.0'
);
```

**Use Cases**:
- Semantic search for coaching recommendations
- Content management for AST methodology
- AI-powered content suggestions
- Knowledge base for coaches and facilitators

---

### 2. user_profiles_extended

**Purpose**: Extended user profiles beyond basic demographics, focusing on coaching-relevant characteristics, work styles, and development goals.

```sql
CREATE TABLE user_profiles_extended (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    strengths TEXT[],
    challenges TEXT[],
    values TEXT[],
    work_style VARCHAR(100),
    communication_style VARCHAR(100),
    goals TEXT[],
    preferences JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX idx_profiles_user_id ON user_profiles_extended(user_id);
CREATE INDEX idx_profiles_work_style ON user_profiles_extended(work_style);
CREATE INDEX idx_profiles_communication_style ON user_profiles_extended(communication_style);
CREATE INDEX idx_profiles_preferences ON user_profiles_extended USING gin(preferences);
```

**Field Descriptions**:
- `id`: UUID primary key
- `user_id`: Foreign key to existing users table (one-to-one relationship)
- `strengths`: Array of identified personal/professional strengths
- `challenges`: Array of areas for development/improvement
- `values`: Array of core personal/professional values
- `work_style`: Primary work approach (e.g., "methodical", "collaborative", "independent")
- `communication_style`: Communication preference (e.g., "direct", "supportive", "analytical")
- `goals`: Array of coaching/development goals
- `preferences`: JSON object for flexible preference storage
- `created_at`: Profile creation timestamp
- `updated_at`: Last profile update timestamp

**Sample Data**:
```sql
INSERT INTO user_profiles_extended (user_id, strengths, challenges, values, work_style, communication_style, goals, preferences) VALUES (
    1,
    ARRAY['analytical thinking', 'problem-solving', 'attention to detail'],
    ARRAY['delegation', 'time management'],
    ARRAY['accuracy', 'innovation', 'continuous learning'],
    'methodical',
    'direct',
    ARRAY['improve leadership skills', 'enhance team collaboration'],
    '{
        "feedback_frequency": "weekly",
        "learning_style": "hands-on", 
        "meeting_preference": "structured",
        "notification_preferences": {
            "email": true,
            "in_app": true,
            "frequency": "daily"
        }
    }'::JSONB
);
```

**Use Cases**:
- Team member matching and compatibility analysis
- Personalized coaching recommendations
- Leadership development tracking
- Communication style adaptation
- Vector embedding generation for similarity matching

---

### 3. coaching_sessions

**Purpose**: Track coaching sessions, recommendations provided, user interactions, and coaching effectiveness over time.

```sql
CREATE TABLE coaching_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(100) NOT NULL,
    content JSONB NOT NULL,
    recommendations TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_coaching_sessions_user_id ON coaching_sessions(user_id);
CREATE INDEX idx_coaching_sessions_type ON coaching_sessions(session_type);
CREATE INDEX idx_coaching_sessions_created_at ON coaching_sessions(created_at);
CREATE INDEX idx_coaching_sessions_content ON coaching_sessions USING gin(content);
```

**Field Descriptions**:
- `id`: UUID primary key
- `user_id`: Foreign key to users table
- `session_type`: Type of coaching session (e.g., "individual_coaching", "team_assessment", "progress_review")
- `content`: JSON object storing session details, discussions, assessments
- `recommendations`: Array of coaching recommendations provided
- `created_at`: Session timestamp

**Session Types**:
- `individual_coaching`: One-on-one coaching sessions
- `team_assessment`: Team dynamics evaluation
- `progress_review`: Development progress check-ins
- `goal_setting`: Goal establishment sessions
- `skill_development`: Specific skill focus sessions
- `conflict_resolution`: Team conflict mediation
- `performance_feedback`: Performance review sessions

**Sample Data**:
```sql
INSERT INTO coaching_sessions (user_id, session_type, content, recommendations) VALUES (
    1,
    'individual_coaching',
    '{
        "duration_minutes": 45,
        "focus_areas": ["communication", "leadership"],
        "assessments_completed": ["star_card"],
        "discussion_points": [
            "team dynamics challenges",
            "conflict resolution strategies",
            "leadership development goals"
        ],
        "user_feedback": {
            "satisfaction": 4,
            "clarity": 5,
            "actionability": 4
        },
        "next_session_scheduled": "2025-08-02T14:00:00Z"
    }'::JSONB,
    ARRAY[
        'Practice active listening techniques in next team meeting',
        'Observe and document communication patterns in team interactions',
        'Schedule follow-up session in 2 weeks to review progress'
    ]
);
```

**Use Cases**:
- Coaching session history and progress tracking
- Recommendation effectiveness analysis
- User engagement metrics
- Coaching outcome measurement
- AI model training data for better recommendations

---

### 4. connection_suggestions

**Purpose**: Store AI-generated suggestions for team member connections based on compatibility analysis, complementary skills, and collaboration potential.

```sql
CREATE TABLE connection_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    suggested_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    similarity_score DECIMAL(3,2) CHECK (similarity_score >= 0 AND similarity_score <= 1),
    reasoning TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    CONSTRAINT no_self_suggestion CHECK (user_id != suggested_user_id)
);

-- Indexes for performance
CREATE INDEX idx_connections_user_id ON connection_suggestions(user_id);
CREATE INDEX idx_connections_suggested_user_id ON connection_suggestions(suggested_user_id);
CREATE INDEX idx_connections_status ON connection_suggestions(status);
CREATE INDEX idx_connections_similarity ON connection_suggestions(similarity_score DESC);
CREATE INDEX idx_connections_created_at ON connection_suggestions(created_at);
```

**Field Descriptions**:
- `id`: UUID primary key
- `user_id`: User receiving the connection suggestion
- `suggested_user_id`: User being suggested for connection
- `similarity_score`: AI-calculated compatibility score (0.0 to 1.0)
- `reasoning`: Human-readable explanation for the suggestion
- `status`: Suggestion status ("pending", "accepted", "declined", "expired")
- `created_at`: Suggestion creation timestamp
- `responded_at`: User response timestamp

**Status Values**:
- `pending`: Suggestion awaiting user response
- `accepted`: User accepted the connection suggestion
- `declined`: User declined the connection suggestion
- `expired`: Suggestion expired without response
- `implemented`: Connection successfully established

**Sample Data**:
```sql
INSERT INTO connection_suggestions (user_id, suggested_user_id, similarity_score, reasoning, status) VALUES (
    1,
    5,
    0.92,
    'High compatibility in analytical thinking with complementary strengths in leadership and public speaking. Both value innovation and continuous learning, making this an excellent collaboration opportunity for leadership development.',
    'pending'
);
```

**Use Cases**:
- Team formation recommendations
- Mentorship pairing suggestions
- Collaboration opportunity identification
- Network building within organizations
- Cross-functional team composition
- Skill-based connection matching

---

### 5. vector_embeddings

**Purpose**: Store metadata and references for vector embeddings used in semantic search, maintaining links between ChromaDB vectors and database records.

```sql
CREATE TABLE vector_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    embedding_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_embeddings_content_id ON vector_embeddings(content_id);
CREATE INDEX idx_embeddings_content_type ON vector_embeddings(content_type);
CREATE INDEX idx_embeddings_created_at ON vector_embeddings(created_at);
CREATE INDEX idx_embeddings_data ON vector_embeddings USING gin(embedding_data);
```

**Field Descriptions**:
- `id`: UUID primary key
- `content_id`: Reference to the source content (knowledge base ID, profile ID, etc.)
- `content_type`: Type of content embedded ("knowledge_base", "user_profile", "session_content")
- `embedding_data`: JSON metadata about the embedding (dimensions, model used, etc.)
- `created_at`: Embedding creation timestamp

**Content Types**:
- `knowledge_base`: Embeddings for coach_knowledge_base entries
- `user_profile`: Embeddings for user_profiles_extended entries
- `session_content`: Embeddings for coaching session content
- `assessment_result`: Embeddings for assessment outcomes
- `goal_description`: Embeddings for user goals

**Sample Data**:
```sql
INSERT INTO vector_embeddings (content_id, content_type, embedding_data) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'knowledge_base',
    '{
        "model": "default-embedding-function",
        "dimensions": 384,
        "chroma_collection": "ast_knowledge_base",
        "chroma_id": "ast-001",
        "embedding_version": "1.0",
        "preprocessing": {
            "text_length": 245,
            "language": "en",
            "tokenization": "default"
        }
    }'::JSONB
);
```

**Use Cases**:
- Tracking vector embedding metadata
- Debugging semantic search issues
- Embedding model version management
- Performance optimization analysis
- Data lineage for AI recommendations

## Table Relationships

### Entity Relationship Diagram

```
users (existing)
├── user_profiles_extended (1:1)
├── coaching_sessions (1:many)
└── connection_suggestions (1:many as user_id)
└── connection_suggestions (1:many as suggested_user_id)

coach_knowledge_base (independent)
└── vector_embeddings (1:1 via content_id)

user_profiles_extended
└── vector_embeddings (1:1 via content_id)

coaching_sessions
└── vector_embeddings (1:many via content_id)
```

### Foreign Key Constraints

```sql
-- Ensure referential integrity
ALTER TABLE user_profiles_extended 
    ADD CONSTRAINT fk_profiles_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE coaching_sessions 
    ADD CONSTRAINT fk_sessions_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE connection_suggestions 
    ADD CONSTRAINT fk_connections_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE connection_suggestions 
    ADD CONSTRAINT fk_connections_suggested_user 
    FOREIGN KEY (suggested_user_id) REFERENCES users(id) ON DELETE CASCADE;
```

## Data Migration Strategy

### Phase 1: Table Creation
```sql
-- Run the complete table creation script
-- All tables created with proper indexes and constraints
```

### Phase 2: Initial Data Population
```sql
-- Populate knowledge base with AST methodology content
-- Create initial user profiles for existing users
-- No historical coaching session data (start fresh)
```

### Phase 3: Vector Database Sync
```sql
-- Populate ChromaDB collections
-- Create vector_embeddings records for tracking
-- Establish semantic search capabilities
```

## Performance Considerations

### Indexing Strategy
- **Primary Keys**: All UUIDs for distributed system compatibility
- **Foreign Keys**: Indexed for join performance
- **Search Fields**: GIN indexes for text search and JSON queries
- **Temporal Data**: Indexes on timestamp fields for reporting

### Query Optimization
- Use JSONB for flexible schema parts (preferences, content)
- Array types for multiple values (tags, strengths, challenges)
- Proper normalization while maintaining query performance

### Scaling Considerations
- UUID primary keys support horizontal scaling
- JSONB fields provide schema flexibility
- Separate vector database (ChromaDB) handles embedding storage
- Connection table designed for efficient recommendation queries

## Backup and Maintenance

### Backup Strategy
```bash
# Include coaching tables in backup routine
pg_dump --host=hostname --username=username --dbname=database_name \
    --table=coach_knowledge_base \
    --table=user_profiles_extended \
    --table=coaching_sessions \
    --table=connection_suggestions \
    --table=vector_embeddings \
    > coaching_backup.sql
```

### Regular Maintenance
- **Vacuum**: Regular vacuum for optimal performance
- **Reindex**: Periodic reindexing of GIN indexes
- **Archive**: Archive old coaching sessions (>1 year)
- **Cleanup**: Remove expired connection suggestions

## Security Considerations

### Data Privacy
- User profiles contain sensitive personal information
- Coaching sessions may include confidential discussions
- Implement proper access controls and audit logging

### Access Control
- Row-level security for multi-tenant scenarios
- API-level authentication and authorization
- Encrypted storage for sensitive JSONB fields

### Compliance
- GDPR compliance for user data deletion
- Data retention policies for coaching sessions
- Audit trails for data access and modifications

## Testing Data

### Sample Data Sets
```sql
-- Create sample knowledge base entries
-- Generate test user profiles
-- Create example coaching sessions
-- Populate connection suggestions for testing
```

This schema provides a robust foundation for the AI coaching system while maintaining compatibility with the existing AllStarTeams platform.
