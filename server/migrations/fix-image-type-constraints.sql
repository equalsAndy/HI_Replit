-- Migration: Fix Image Type Constraints
-- Purpose: Prevent profile picture/StarCard confusion by enforcing image_type usage
-- Date: 2025-10-03
-- Related: fix/profile-starcard-separation branch

-- =========================================================================
-- STEP 1: Add NOT NULL constraint to image_type (with safe default)
-- =========================================================================

-- First, set default for any NULL values (shouldn't exist, but be safe)
UPDATE photo_storage
SET image_type = 'general_upload'
WHERE image_type IS NULL;

-- Add NOT NULL constraint with default
ALTER TABLE photo_storage
  ALTER COLUMN image_type SET NOT NULL,
  ALTER COLUMN image_type SET DEFAULT 'general_upload';

-- =========================================================================
-- STEP 2: Add CHECK constraint to validate image_type values
-- =========================================================================

ALTER TABLE photo_storage
  ADD CONSTRAINT chk_image_type_valid
  CHECK (image_type IN (
    'profile_picture',
    'starcard_generated',
    'workshop_visualization',
    'workshop_upload',
    'general_upload'
  ));

-- =========================================================================
-- STEP 3: Add performance index for type-based queries
-- =========================================================================

-- Index for fast retrieval by type and user (used by getUserStarCard)
CREATE INDEX IF NOT EXISTS idx_photo_storage_type_user
  ON photo_storage(image_type, uploaded_by, created_at DESC);

-- Index for profile picture lookups (used by users.profile_picture_id FK)
CREATE INDEX IF NOT EXISTS idx_photo_storage_profile_pictures
  ON photo_storage(uploaded_by, image_type)
  WHERE image_type = 'profile_picture';

-- =========================================================================
-- STEP 4: Add validation function to prevent profile/StarCard mix-ups
-- =========================================================================

CREATE OR REPLACE FUNCTION validate_profile_picture_type()
RETURNS TRIGGER AS $$
BEGIN
  -- If updating profile_picture_id, ensure it points to a profile_picture type
  IF NEW.profile_picture_id IS NOT NULL THEN
    DECLARE
      img_type TEXT;
    BEGIN
      SELECT image_type INTO img_type
      FROM photo_storage
      WHERE id = NEW.profile_picture_id;

      IF img_type IS NOT NULL AND img_type != 'profile_picture' THEN
        RAISE WARNING 'User % profile_picture_id points to image type %, not profile_picture',
          NEW.id, img_type;
        -- Don't block the update, just warn (for backwards compatibility)
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table (only if profile_picture_id column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profile_picture_id'
  ) THEN
    DROP TRIGGER IF EXISTS trg_validate_profile_picture_type ON users;
    CREATE TRIGGER trg_validate_profile_picture_type
      BEFORE INSERT OR UPDATE OF profile_picture_id ON users
      FOR EACH ROW
      EXECUTE FUNCTION validate_profile_picture_type();
  END IF;
END $$;

-- =========================================================================
-- STEP 5: Data cleanup - Fix existing misclassified images (OPTIONAL)
-- =========================================================================

-- This section identifies and fixes images that may have been misclassified
-- Run this ONLY if you want to automatically reclassify existing data

-- Find images marked as profile_picture but with StarCard dimensions
-- (Uncomment to execute)
/*
UPDATE photo_storage
SET image_type = 'starcard_generated'
WHERE image_type = 'profile_picture'
  AND mime_type = 'image/png'
  AND width > 600 AND width < 1000
  AND height > 1000 AND height < 1400
  AND file_size > 100000;
*/

-- Find users whose profile_picture_id points to StarCard-type images
-- (Uncomment to execute - this will CLEAR those profile_picture_id references)
/*
UPDATE users
SET profile_picture_id = NULL
WHERE profile_picture_id IN (
  SELECT id FROM photo_storage
  WHERE image_type = 'starcard_generated'
);
*/

-- =========================================================================
-- VERIFICATION QUERIES (run these to check migration success)
-- =========================================================================

-- Check for NULL image_type values (should be 0)
-- SELECT COUNT(*) as null_image_types FROM photo_storage WHERE image_type IS NULL;

-- Check image type distribution
-- SELECT image_type, COUNT(*) as count FROM photo_storage GROUP BY image_type ORDER BY count DESC;

-- Check for profile_picture_id pointing to non-profile images
-- SELECT u.id, u.name, ps.image_type
-- FROM users u
-- JOIN photo_storage ps ON u.profile_picture_id = ps.id
-- WHERE ps.image_type != 'profile_picture';

-- Check for users with multiple profile_picture type images
-- SELECT uploaded_by, COUNT(*) as profile_pic_count
-- FROM photo_storage
-- WHERE image_type = 'profile_picture'
-- GROUP BY uploaded_by
-- HAVING COUNT(*) > 1;

-- =========================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =========================================================================

/*
-- To rollback this migration:

DROP TRIGGER IF EXISTS trg_validate_profile_picture_type ON users;
DROP FUNCTION IF EXISTS validate_profile_picture_type();
DROP INDEX IF EXISTS idx_photo_storage_type_user;
DROP INDEX IF EXISTS idx_photo_storage_profile_pictures;
ALTER TABLE photo_storage DROP CONSTRAINT IF EXISTS chk_image_type_valid;
ALTER TABLE photo_storage ALTER COLUMN image_type DROP NOT NULL;
ALTER TABLE photo_storage ALTER COLUMN image_type DROP DEFAULT;
*/
