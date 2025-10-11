-- Migration: Add image_type, attribution, and source_url columns to photo_storage
-- Purpose: Prepare database for profile picture/StarCard separation fix
-- Date: 2025-10-03
-- Run BEFORE: fix-image-type-constraints.sql

-- =========================================================================
-- STEP 1: Add image_type column with default
-- =========================================================================

-- Add the column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photo_storage' AND column_name = 'image_type'
  ) THEN
    ALTER TABLE photo_storage
      ADD COLUMN image_type VARCHAR(50) DEFAULT 'general_upload';

    RAISE NOTICE 'Added image_type column to photo_storage';
  ELSE
    RAISE NOTICE 'image_type column already exists';
  END IF;
END $$;

-- =========================================================================
-- STEP 2: Add attribution column
-- =========================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photo_storage' AND column_name = 'attribution'
  ) THEN
    ALTER TABLE photo_storage
      ADD COLUMN attribution TEXT;

    RAISE NOTICE 'Added attribution column to photo_storage';
  ELSE
    RAISE NOTICE 'attribution column already exists';
  END IF;
END $$;

-- =========================================================================
-- STEP 3: Add source_url column
-- =========================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photo_storage' AND column_name = 'source_url'
  ) THEN
    ALTER TABLE photo_storage
      ADD COLUMN source_url TEXT;

    RAISE NOTICE 'Added source_url column to photo_storage';
  ELSE
    RAISE NOTICE 'source_url column already exists';
  END IF;
END $$;

-- =========================================================================
-- STEP 4: Populate image_type for existing data (best effort)
-- =========================================================================

-- Mark images that look like StarCards based on dimensions
UPDATE photo_storage
SET image_type = 'starcard_generated'
WHERE image_type = 'general_upload'
  AND mime_type = 'image/png'
  AND width > 600 AND width < 1000
  AND height > 1000 AND height < 1400
  AND file_size > 100000;

-- Mark images that are likely profile pictures (smaller, squarish)
UPDATE photo_storage
SET image_type = 'profile_picture'
WHERE image_type = 'general_upload'
  AND file_size < 100000
  AND width IS NOT NULL
  AND height IS NOT NULL
  AND width < 800
  AND height < 800
  AND ABS(width - height) < 200; -- Roughly square

-- =========================================================================
-- VERIFICATION
-- =========================================================================

-- Show distribution of image types
SELECT image_type, COUNT(*) as count
FROM photo_storage
GROUP BY image_type
ORDER BY count DESC;

-- Show sample of each type
SELECT image_type, id, width, height, file_size, created_at
FROM photo_storage
ORDER BY image_type, created_at DESC;
