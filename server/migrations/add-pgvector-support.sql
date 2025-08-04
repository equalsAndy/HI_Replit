-- Add pgvector extension for semantic search
-- This migration adds vector search capabilities to improve training document retrieval

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector embedding column to training_documents table
ALTER TABLE training_documents 
ADD COLUMN IF NOT EXISTS content_embedding vector(1536);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS training_documents_embedding_idx 
ON training_documents 
USING ivfflat (content_embedding vector_cosine_ops)
WITH (lists = 100);

-- Add metadata for embedding generation tracking
ALTER TABLE training_documents 
ADD COLUMN IF NOT EXISTS embedding_model varchar(100) DEFAULT 'text-embedding-3-small',
ADD COLUMN IF NOT EXISTS embedding_generated_at timestamp,
ADD COLUMN IF NOT EXISTS embedding_tokens integer;

-- Create function for cosine similarity search
CREATE OR REPLACE FUNCTION search_training_documents_by_embedding(
    query_embedding vector(1536),
    similarity_threshold float DEFAULT 0.7,
    max_results integer DEFAULT 5
)
RETURNS TABLE (
    id uuid,
    title text,
    content text,
    similarity float,
    category varchar(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        td.id,
        td.title,
        td.content,
        1 - (td.content_embedding <=> query_embedding) as similarity,
        td.category
    FROM training_documents td
    WHERE 
        td.status = 'active' 
        AND td.content_embedding IS NOT NULL
        AND (1 - (td.content_embedding <=> query_embedding)) >= similarity_threshold
    ORDER BY td.content_embedding <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;