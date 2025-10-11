-- ===================================================================
-- MIGRATION 0008: Create Document Chunks Table
-- ===================================================================
-- Creates the missing document_chunks table required for text search functionality
-- in the sectional report generation system

-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- ===================================================================
-- TRAINING DOCUMENTS TABLE (create if missing)
-- ===================================================================
CREATE TABLE IF NOT EXISTS training_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  document_type VARCHAR(50) DEFAULT 'general',
  file_path VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- DOCUMENT CHUNKS TABLE
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
-- INDEXES FOR PERFORMANCE
-- ===================================================================

-- Training documents indexes
CREATE INDEX IF NOT EXISTS idx_training_documents_status ON training_documents(status);
CREATE INDEX IF NOT EXISTS idx_training_documents_type ON training_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_training_documents_created_at ON training_documents(created_at DESC);

-- Document chunks indexes
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chunk_index ON document_chunks(document_id, chunk_index);

-- Vector similarity index (IVFFlat for good performance/accuracy balance)
-- Only create if we have the vector extension and table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_chunks') THEN
    CREATE INDEX IF NOT EXISTS idx_document_chunks_embeddings ON document_chunks
    USING ivfflat (embeddings vector_cosine_ops) WITH (lists = 100);
    RAISE NOTICE 'Created vector similarity index on document_chunks.embeddings';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Vector index creation skipped: %', SQLERRM;
END $$;

-- ===================================================================
-- SAMPLE TRAINING DOCUMENTS (for testing)
-- ===================================================================

-- Insert sample training documents if table is empty
INSERT INTO training_documents (id, title, content, document_type, status)
SELECT
  gen_random_uuid(),
  'AST Workshop Guide',
  'AllStarTeams workshop focuses on strengths-based development and flow psychology. Participants discover their unique talents and learn to apply them in team settings.',
  'workshop_guide',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM training_documents WHERE title = 'AST Workshop Guide');

INSERT INTO training_documents (id, title, content, document_type, status)
SELECT
  gen_random_uuid(),
  'Flow State Research',
  'Flow states represent optimal performance experiences characterized by deep focus, clear goals, and intrinsic motivation. Research shows flow experiences enhance well-being and performance.',
  'research',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM training_documents WHERE title = 'Flow State Research');

INSERT INTO training_documents (id, title, content, document_type, status)
SELECT
  gen_random_uuid(),
  'Strengths Assessment Methods',
  'Comprehensive strengths assessment involves identifying natural talents, learned skills, and passion areas. The AST methodology combines self-reflection with peer feedback.',
  'methodology',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM training_documents WHERE title = 'Strengths Assessment Methods');

-- ===================================================================
-- COSINE SIMILARITY FUNCTION
-- ===================================================================

-- Create cosine similarity function for vector searches
CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector)
RETURNS float AS $$
BEGIN
  RETURN 1 - (a <=> b);
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- ===================================================================
-- COMPLETION MESSAGE
-- ===================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 0008: Document Chunks Table - COMPLETED SUCCESSFULLY';
  RAISE NOTICE 'Created tables: training_documents (if missing), document_chunks';
  RAISE NOTICE 'Created indexes for performance optimization';
  RAISE NOTICE 'Created vector similarity function for searches';
  RAISE NOTICE 'Inserted sample training documents for testing';
  RAISE NOTICE 'Text search functionality now available for sectional reports';
END $$;