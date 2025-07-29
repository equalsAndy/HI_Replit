-- ===================================================================
-- AI Training System with Vector Database (Phase 1)
-- Migration 0005: RAG (Retrieval Augmented Generation) Infrastructure
-- ===================================================================
-- This migration creates the foundation for document-trained AI coaching
-- and enhanced holistic report generation using PostgreSQL pgvector

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ===================================================================
-- TRAINING DOCUMENTS TABLE
-- ===================================================================
-- Stores uploaded training documents for AI coaching and reports
CREATE TABLE IF NOT EXISTS training_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
    'coaching_guide',
    'report_template', 
    'assessment_framework',
    'best_practices',
    'strengths_theory',
    'flow_research',
    'team_dynamics',
    'industry_guidance'
  )),
  category VARCHAR(100),
  tags TEXT[],
  version VARCHAR(20) DEFAULT '1.0',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  file_size INTEGER,
  file_type VARCHAR(50),
  original_filename VARCHAR(255),
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- DOCUMENT CHUNKS TABLE (for embeddings)
-- ===================================================================
-- Stores document chunks with vector embeddings for similarity search
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES training_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embeddings vector(1536), -- OpenAI text-embedding-ada-002 dimension
  metadata JSONB DEFAULT '{}',
  token_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- DOCUMENT PROCESSING JOBS TABLE
-- ===================================================================
-- Tracks background processing jobs for document chunking and embedding
CREATE TABLE IF NOT EXISTS document_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES training_documents(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('chunking', 'embedding', 'validation')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress_percentage INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- ENHANCED AI CONFIGURATION (extending existing table)
-- ===================================================================
-- Add RAG-specific configuration options
DO $$
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'ai_configuration' AND column_name = 'embedding_model') THEN
    ALTER TABLE ai_configuration ADD COLUMN embedding_model VARCHAR(100) DEFAULT 'text-embedding-ada-002';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'ai_configuration' AND column_name = 'context_chunk_limit') THEN
    ALTER TABLE ai_configuration ADD COLUMN context_chunk_limit INTEGER DEFAULT 5;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'ai_configuration' AND column_name = 'similarity_threshold') THEN
    ALTER TABLE ai_configuration ADD COLUMN similarity_threshold DECIMAL(3,2) DEFAULT 0.70;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'ai_configuration' AND column_name = 'max_context_tokens') THEN
    ALTER TABLE ai_configuration ADD COLUMN max_context_tokens INTEGER DEFAULT 8000;
  END IF;
END $$;

-- ===================================================================
-- ENHANCED AI USAGE LOGS (extending existing table)
-- ===================================================================
-- Add RAG-specific tracking fields
DO $$
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'ai_usage_logs' AND column_name = 'context_chunks_used') THEN
    ALTER TABLE ai_usage_logs ADD COLUMN context_chunks_used INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'ai_usage_logs' AND column_name = 'embedding_tokens_used') THEN
    ALTER TABLE ai_usage_logs ADD COLUMN embedding_tokens_used INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'ai_usage_logs' AND column_name = 'retrieval_time_ms') THEN
    ALTER TABLE ai_usage_logs ADD COLUMN retrieval_time_ms INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'ai_usage_logs' AND column_name = 'total_context_tokens') THEN
    ALTER TABLE ai_usage_logs ADD COLUMN total_context_tokens INTEGER DEFAULT 0;
  END IF;
END $$;

-- ===================================================================
-- COACHING CONVERSATIONS TABLE
-- ===================================================================
-- Stores multi-turn conversation context for enhanced coaching
CREATE TABLE IF NOT EXISTS coaching_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  persona_type VARCHAR(50) DEFAULT 'talia_coach',
  conversation_summary TEXT,
  coaching_goals TEXT[],
  workshop_context JSONB DEFAULT '{}',
  last_interaction TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  total_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- COACHING MESSAGES TABLE
-- ===================================================================
-- Stores individual messages within conversations
CREATE TABLE IF NOT EXISTS coaching_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES coaching_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context_documents UUID[], -- Array of document chunk IDs used
  metadata JSONB DEFAULT '{}',
  token_count INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- REPORT GENERATION CONTEXT TABLE
-- ===================================================================
-- Tracks context used in holistic report generation
CREATE TABLE IF NOT EXISTS report_generation_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id),
  report_type VARCHAR(50) DEFAULT 'holistic',
  context_documents UUID[], -- Array of document chunk IDs used
  prompt_template TEXT,
  generation_metadata JSONB DEFAULT '{}',
  quality_score DECIMAL(3,2),
  user_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================================

-- Training documents indexes
CREATE INDEX IF NOT EXISTS idx_training_documents_type ON training_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_training_documents_status ON training_documents(status);
CREATE INDEX IF NOT EXISTS idx_training_documents_category ON training_documents(category);
CREATE INDEX IF NOT EXISTS idx_training_documents_uploaded_by ON training_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_training_documents_created_at ON training_documents(created_at DESC);

-- Document chunks indexes
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chunk_index ON document_chunks(document_id, chunk_index);

-- Vector similarity index (IVFFlat for good performance/accuracy balance)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embeddings ON document_chunks 
USING ivfflat (embeddings vector_cosine_ops) WITH (lists = 100);

-- Processing jobs indexes
CREATE INDEX IF NOT EXISTS idx_processing_jobs_document_id ON document_processing_jobs(document_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON document_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_type ON document_processing_jobs(job_type);

-- Coaching conversation indexes
CREATE INDEX IF NOT EXISTS idx_coaching_conversations_user_id ON coaching_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_conversations_session_id ON coaching_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_coaching_conversations_status ON coaching_conversations(status);
CREATE INDEX IF NOT EXISTS idx_coaching_conversations_last_interaction ON coaching_conversations(last_interaction DESC);

-- Coaching messages indexes
CREATE INDEX IF NOT EXISTS idx_coaching_messages_conversation_id ON coaching_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_coaching_messages_timestamp ON coaching_messages(conversation_id, timestamp);

-- Report context indexes
CREATE INDEX IF NOT EXISTS idx_report_context_user_id ON report_generation_context(user_id);
CREATE INDEX IF NOT EXISTS idx_report_context_type ON report_generation_context(report_type);
CREATE INDEX IF NOT EXISTS idx_report_context_created_at ON report_generation_context(created_at DESC);

-- ===================================================================
-- INSERT INITIAL RAG CONFIGURATION
-- ===================================================================

-- Add RAG-specific AI configurations
INSERT INTO ai_configuration (feature_name, enabled, rate_limit_per_hour, rate_limit_per_day, max_tokens, timeout_ms, embedding_model, context_chunk_limit, similarity_threshold, max_context_tokens)
VALUES 
  ('document_training', true, 50, 200, 2000, 30000, 'text-embedding-ada-002', 5, 0.70, 8000),
  ('enhanced_coaching', true, 100, 500, 1500, 45000, 'text-embedding-ada-002', 3, 0.75, 6000),
  ('enhanced_reports', true, 20, 100, 8000, 60000, 'text-embedding-ada-002', 8, 0.65, 12000)
ON CONFLICT (feature_name) DO UPDATE SET
  embedding_model = EXCLUDED.embedding_model,
  context_chunk_limit = EXCLUDED.context_chunk_limit,
  similarity_threshold = EXCLUDED.similarity_threshold,
  max_context_tokens = EXCLUDED.max_context_tokens,
  updated_at = NOW();

-- ===================================================================
-- INSERT SAMPLE TRAINING DOCUMENTS (for testing)
-- ===================================================================

-- Insert sample coaching guide
INSERT INTO training_documents (title, content, document_type, category, tags, version, status)
VALUES (
  'Strengths-Based Coaching Principles',
  'Strengths-based coaching focuses on identifying and developing an individual''s natural talents and abilities rather than attempting to fix weaknesses. Key principles include:

1. **Discovery Over Development**: Help people discover their existing strengths rather than trying to build new ones from scratch.

2. **Energy and Engagement**: When people use their strengths, they feel more energized and engaged in their work.

3. **Unique Contribution**: Each person has a unique combination of strengths that creates their distinct value proposition.

4. **Growth Through Strengths**: The greatest potential for growth exists in areas of greatest strength.

5. **Complementary Partnerships**: Build teams where members'' strengths complement each other rather than overlap.

**Coaching Questions for Strength Discovery:**
- When do you feel most energized at work?
- What activities make you lose track of time?
- What do people consistently come to you for help with?
- When have you felt most successful and confident?

**Common Coaching Scenarios:**
- Helping someone identify their top strengths
- Addressing performance issues through a strengths lens
- Career development planning using strengths
- Team dynamics and role optimization',
  'coaching_guide',
  'Strengths Development',
  ARRAY['strengths', 'coaching', 'development', 'energy', 'engagement'],
  '1.0',
  'active'
),
(
  'Holistic Report Template - Executive Summary',
  'A comprehensive holistic development report should include the following sections:

**EXECUTIVE SUMMARY**
- Brief overview of individual''s key strengths and development areas
- Primary insights from assessments and workshops
- Top 3 development recommendations
- Expected outcomes and timeline

**STRENGTHS ANALYSIS**
- Detailed breakdown of top strengths with scores
- How strengths manifest in workplace behaviors
- Unique strength combinations and their advantages
- Potential blind spots or overuse of strengths

**FLOW STATE ANALYSIS**
- Activities and conditions that create flow experiences
- Alignment between strengths and flow triggers
- Recommendations for increasing flow opportunities
- Environmental factors that support or hinder flow

**DEVELOPMENT OPPORTUNITIES**
- Growth areas identified through assessments
- Specific skill gaps or knowledge areas
- Leadership development pathways
- Team collaboration improvements

**ACTION PLAN**
- 90-day immediate focus areas
- 6-month development goals
- 12-month vision and objectives
- Specific activities and resources
- Success metrics and checkpoints

**RESOURCES AND SUPPORT**
- Recommended reading and learning materials
- Internal mentoring or coaching opportunities
- External development programs
- Team or organizational support needed',
  'report_template',
  'Report Generation',
  ARRAY['holistic', 'report', 'template', 'executive', 'development'],
  '1.0',
  'active'
);

-- ===================================================================
-- FUNCTIONS FOR VECTOR OPERATIONS
-- ===================================================================

-- Function to calculate cosine similarity between vectors
CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector)
RETURNS float8
LANGUAGE sql
IMMUTABLE STRICT PARALLEL SAFE
AS $$
  SELECT (a <=> b) * -1 + 1;
$$;

-- Function to find similar document chunks
CREATE OR REPLACE FUNCTION find_similar_chunks(
  query_embedding vector(1536),
  similarity_threshold float8 DEFAULT 0.7,
  max_results integer DEFAULT 5,
  document_types text[] DEFAULT NULL
)
RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  content text,
  similarity_score float8,
  document_title text,
  document_type text
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    dc.id as chunk_id,
    dc.document_id,
    dc.content,
    cosine_similarity(dc.embeddings, query_embedding) as similarity_score,
    td.title as document_title,
    td.document_type
  FROM document_chunks dc
  JOIN training_documents td ON dc.document_id = td.id
  WHERE 
    td.status = 'active'
    AND cosine_similarity(dc.embeddings, query_embedding) >= similarity_threshold
    AND (document_types IS NULL OR td.document_type = ANY(document_types))
  ORDER BY similarity_score DESC
  LIMIT max_results;
$$;

-- ===================================================================
-- MIGRATION COMPLETION
-- ===================================================================

-- Update migration tracking if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schema_migrations') THEN
    INSERT INTO schema_migrations (version, applied_at) 
    VALUES ('0005_add_ai_training_system', NOW())
    ON CONFLICT (version) DO NOTHING;
  END IF;
END $$;

-- Log successful completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 0005: AI Training System with Vector Database - COMPLETED';
  RAISE NOTICE 'Features enabled: Document training, Enhanced coaching, Enhanced reports';
  RAISE NOTICE 'Vector extension enabled with pgvector support';
  RAISE NOTICE 'Sample training documents inserted for testing';
END $$;