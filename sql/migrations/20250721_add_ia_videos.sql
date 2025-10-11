-- Migration: Add IA Workshop Videos (2025-07-21)
-- Adds new IA workshop videos to the videos table

BEGIN;

-- 1. IAWS SOLO INTRO VIDEO - Orientation ia-1-1
INSERT INTO videos (title, description, url, workshop_type, section, step_id, autoplay, sort_order, content_mode, required_watch_percentage, created_at, updated_at)
VALUES (
  'IAWS SOLO INTRO VIDEO - Orientation',
  'Orientation video for IA workshop solo introduction.',
  'https://www.youtube.com/embed/CZ89trlNaK8',
  'ia',
  'Orientation',
  'ia-1-1',
  TRUE,
  1,
  'both',
  75,
  NOW(),
  NOW()
);

-- 2. IAWS SOLO VIDEO HIGH - Autoflow ia-3-2
INSERT INTO videos (title, description, url, workshop_type, section, step_id, autoplay, sort_order, content_mode, required_watch_percentage, created_at, updated_at)
VALUES (
  'IAWS SOLO VIDEO HIGH - Autoflow',
  'Autoflow video for IA workshop solo session.',
  'https://www.youtube.com/embed/Kjy3lBW06Gs',
  'ia',
  'Autoflow',
  'ia-3-2',
  TRUE,
  2,
  'both',
  75,
  NOW(),
  NOW()
);

-- 3. IA SOLO INSPIRATION - Inspiration ia-3-5
INSERT INTO videos (title, description, url, workshop_type, section, step_id, autoplay, sort_order, content_mode, required_watch_percentage, created_at, updated_at)
VALUES (
  'IA SOLO INSPIRATION - Inspiration',
  'Inspiration video for IA solo session.',
  'https://www.youtube.com/embed/vGIYaL7jTJo',
  'ia',
  'Inspiration',
  'ia-3-5',
  TRUE,
  3,
  'both',
  75,
  NOW(),
  NOW()
);

-- 4. IA SOLO IMAGINE UNIMAGINABLE - The Unimaginable ia-3-6
INSERT INTO videos (title, description, url, workshop_type, section, step_id, autoplay, sort_order, content_mode, required_watch_percentage, created_at, updated_at)
VALUES (
  'IA SOLO IMAGINE UNIMAGINABLE - The Unimaginable',
  'The Unimaginable video for IA solo session.',
  'https://www.youtube.com/embed/F1qGAW4OofQ',
  'ia',
  'The Unimaginable',
  'ia-3-6',
  TRUE,
  4,
  'both',
  75,
  NOW(),
  NOW()
);

-- 5. IAWS SOLO PART 2 ADVANCED PRACTICE V4 - Advanced Ladder ia-4-1
INSERT INTO videos (title, description, url, workshop_type, section, step_id, autoplay, sort_order, content_mode, required_watch_percentage, created_at, updated_at)
VALUES (
  'IAWS SOLO PART 2 ADVANCED PRACTICE V4 - Advanced Ladder',
  'Advanced Ladder video for IA workshop solo part 2.',
  'https://www.youtube.com/embed/MUbEbYEiimk',
  'ia',
  'Advanced Ladder',
  'ia-4-1',
  TRUE,
  5,
  'both',
  75,
  NOW(),
  NOW()
);

-- 6. IA TEAM LADDER - Team section
INSERT INTO videos (title, description, url, workshop_type, section, step_id, autoplay, sort_order, content_mode, required_watch_percentage, created_at, updated_at)
VALUES (
  'IA TEAM LADDER - Team section',
  'Team Ladder video for IA team session.',
  'https://www.youtube.com/embed/ScQ7JqLOOVY',
  'ia',
  'Team',
  NULL,
  TRUE,
  6,
  'both',
  75,
  NOW(),
  NOW()
);

COMMIT;

-- ROLLBACK: Remove these videos if needed
-- DELETE FROM videos WHERE url IN (
--   'https://www.youtube.com/embed/CZ89trlNaK8',
--   'https://www.youtube.com/embed/Kjy3lBW06Gs',
--   'https://www.youtube.com/embed/vGIYaL7jTJo',
--   'https://www.youtube.com/embed/F1qGAW4OofQ',
--   'https://www.youtube.com/embed/MUbEbYEiimk',
--   'https://www.youtube.com/embed/ScQ7JqLOOVY'
-- );
