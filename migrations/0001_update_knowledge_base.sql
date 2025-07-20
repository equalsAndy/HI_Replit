-- Migration to update the coach_knowledge_base table and add full-text search capabilities

-- Drop the old table if it exists to ensure a clean slate
DROP TABLE IF EXISTS coach_knowledge_base CASCADE;

-- Create the new coach_knowledge_base table with a UUID primary key
CREATE TABLE coach_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(255),
    category VARCHAR(100),
    metadata JSONB,
    search_vector TSVECTOR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create an index on the category for faster filtering
CREATE INDEX knowledge_category_idx ON coach_knowledge_base(category);

-- Create a GIN index on the search_vector for efficient full-text search
CREATE INDEX knowledge_search_vector_idx ON coach_knowledge_base USING GIN(search_vector);

-- Create a function to automatically update the search_vector column
CREATE OR REPLACE FUNCTION update_knowledge_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    -- Combine title and content for a comprehensive search vector
    NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before any insert or update
CREATE TRIGGER update_coach_knowledge_search_vector_trigger
BEFORE INSERT OR UPDATE ON coach_knowledge_base
FOR EACH ROW EXECUTE FUNCTION update_knowledge_search_vector();

-- Add comments to the table and columns for clarity
COMMENT ON TABLE coach_knowledge_base IS 'Knowledge base for the AI coach, containing methodology, team profiles, and other reference content. Optimized for full-text search.';
COMMENT ON COLUMN coach_knowledge_base.metadata IS 'Stores structured data like original section titles, key concepts, etc.';
COMMENT ON COLUMN coach_knowledge_base.search_vector IS 'A tsvector column automatically generated from title and content for full-text search.';

COMMIT;
