-- Manual SQL to create coaching tables safely
-- Run this in the database to add coaching system tables

BEGIN;

-- Coach knowledge base for storing AST methodology, conversation patterns, etc.
CREATE TABLE IF NOT EXISTS coach_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Extended user profiles for team connections and collaboration
CREATE TABLE IF NOT EXISTS user_profiles_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(255),
  department VARCHAR(255),
  role VARCHAR(255),
  ast_profile_summary JSONB,
  expertise_areas JSONB,
  project_experience JSONB,
  collaboration_preferences JSONB,
  availability_status VARCHAR(50) DEFAULT 'available',
  connection_opt_in BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Coaching conversation sessions
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation JSONB NOT NULL,
  session_summary TEXT,
  context_used JSONB,
  session_type VARCHAR(50) DEFAULT 'general',
  session_length VARCHAR(50),
  user_satisfaction VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Team connection suggestions and tracking
CREATE TABLE IF NOT EXISTS connection_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requestor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggested_collaborator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason_type VARCHAR(100) NOT NULL,
  reason_explanation TEXT NOT NULL,
  context TEXT,
  status VARCHAR(50) DEFAULT 'suggested',
  response_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Vector embeddings references (for linking to external vector DB)
CREATE TABLE IF NOT EXISTS vector_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table VARCHAR(100) NOT NULL,
  source_id VARCHAR(255) NOT NULL,
  vector_id VARCHAR(255) NOT NULL,
  embedding_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coach_knowledge_base_category ON coach_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_user_id ON user_profiles_extended(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user_id ON coaching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_suggestions_requestor ON connection_suggestions(requestor_id);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_source ON vector_embeddings(source_table, source_id);

COMMIT;

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('coach_knowledge_base', 'user_profiles_extended', 'coaching_sessions', 'connection_suggestions', 'vector_embeddings')
ORDER BY table_name;
