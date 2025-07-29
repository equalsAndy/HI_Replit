-- Migration to create photo storage system
-- This separates photo data from main tables to reduce network traffic

CREATE TABLE IF NOT EXISTS photo_storage (
    id SERIAL PRIMARY KEY,
    photo_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash for deduplication
    photo_data TEXT NOT NULL, -- Base64 encoded image data
    mime_type VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
    file_size INTEGER NOT NULL DEFAULT 0,
    width INTEGER,
    height INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Metadata for optimization
    is_thumbnail BOOLEAN DEFAULT FALSE,
    original_photo_id INTEGER REFERENCES photo_storage(id),
    -- Usage tracking
    reference_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_photo_storage_hash ON photo_storage(photo_hash);
CREATE INDEX IF NOT EXISTS idx_photo_storage_uploaded_by ON photo_storage(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_photo_storage_created_at ON photo_storage(created_at);

-- Add photo reference columns to existing tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_id INTEGER REFERENCES photo_storage(id);
ALTER TABLE workshop_data ADD COLUMN IF NOT EXISTS image_photo_id INTEGER REFERENCES photo_storage(id);

-- Create a view for user data without photo data
CREATE OR REPLACE VIEW users_without_photos AS
SELECT 
    id,
    username,
    name,
    email,
    role,
    organization,
    job_title,
    profile_picture_id, -- Reference only, not the actual data
    CASE 
        WHEN profile_picture_id IS NOT NULL THEN TRUE 
        ELSE FALSE 
    END as has_profile_picture,
    is_test_user,
    is_beta_tester,
    show_demo_data_buttons,
    navigation_progress,
    content_access,
    ast_access,
    ia_access,
    ast_workshop_completed,
    ia_workshop_completed,
    ast_completed_at,
    ia_completed_at,
    assigned_facilitator_id,
    cohort_id,
    team_id,
    invited_by,
    created_at,
    updated_at
FROM users;

-- Function to update reference counts
CREATE OR REPLACE FUNCTION update_photo_reference_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update reference count when photo is referenced
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.profile_picture_id IS NOT NULL THEN
            UPDATE photo_storage 
            SET reference_count = (
                SELECT COUNT(*) FROM users WHERE profile_picture_id = NEW.profile_picture_id
            ),
            last_accessed = CURRENT_TIMESTAMP
            WHERE id = NEW.profile_picture_id;
        END IF;
        
        IF NEW.image_photo_id IS NOT NULL THEN
            UPDATE photo_storage 
            SET reference_count = (
                SELECT COUNT(*) FROM workshop_data WHERE image_photo_id = NEW.image_photo_id
            ),
            last_accessed = CURRENT_TIMESTAMP
            WHERE id = NEW.image_photo_id;
        END IF;
    END IF;
    
    -- Clean up reference count when photo reference is removed
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        IF OLD.profile_picture_id IS NOT NULL THEN
            UPDATE photo_storage 
            SET reference_count = (
                SELECT COUNT(*) FROM users WHERE profile_picture_id = OLD.profile_picture_id
            )
            WHERE id = OLD.profile_picture_id;
        END IF;
        
        IF OLD.image_photo_id IS NOT NULL THEN
            UPDATE photo_storage 
            SET reference_count = (
                SELECT COUNT(*) FROM workshop_data WHERE image_photo_id = OLD.image_photo_id
            )
            WHERE id = OLD.image_photo_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to maintain reference counts
DROP TRIGGER IF EXISTS users_photo_reference_trigger ON users;
CREATE TRIGGER users_photo_reference_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION update_photo_reference_count();

DROP TRIGGER IF EXISTS workshop_data_photo_reference_trigger ON workshop_data;
CREATE TRIGGER workshop_data_photo_reference_trigger
    AFTER INSERT OR UPDATE OR DELETE ON workshop_data
    FOR EACH ROW EXECUTE FUNCTION update_photo_reference_count();

-- Function to cleanup unused photos (call periodically)
CREATE OR REPLACE FUNCTION cleanup_unused_photos()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM photo_storage 
    WHERE reference_count = 0 
    AND last_accessed < (CURRENT_TIMESTAMP - INTERVAL '30 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;