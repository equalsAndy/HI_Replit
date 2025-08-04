-- Insert Reflection Talia training documents directly into PostgreSQL
-- These documents should be uploaded to the reflection_talia persona

-- 1. Reflection Talia Training Doc (Main training manual)
INSERT INTO training_documents 
(title, content, document_type, category, file_size, original_filename, assigned_personas, enabled, created_at, updated_at)
VALUES (
  'Reflection Talia Training Doc',
  -- Content will be inserted manually via copy/paste
  'PLACEHOLDER_CONTENT_1',
  'document',
  'Talia_Training',
  50000, -- Approximate size
  'talia_training_doc.md',
  '["reflection_talia"]',
  true,
  NOW(),
  NOW()
);

-- 2. AST Workshop Compendium 2025  
INSERT INTO training_documents 
(title, content, document_type, category, file_size, original_filename, assigned_personas, enabled, created_at, updated_at)
VALUES (
  'AST Workshop Compendium 2025',
  'PLACEHOLDER_CONTENT_2',
  'document', 
  'coaching_system',
  80000, -- Approximate size
  'AST_Compendium.md',
  '["reflection_talia"]',
  true,
  NOW(),
  NOW()
);

-- 3. Talia AI Coach Training Manual
INSERT INTO training_documents 
(title, content, document_type, category, file_size, original_filename, assigned_personas, enabled, created_at, updated_at)
VALUES (
  'Talia AI Coach Training Manual',
  'PLACEHOLDER_CONTENT_3',
  'document',
  'coaching_system', 
  30000, -- Approximate size
  'reflection_talia_training_doc.md',
  '["reflection_talia"]',
  true,
  NOW(),
  NOW()
);

-- 4. Strengths-Based Coaching Principles
INSERT INTO training_documents 
(title, content, document_type, category, file_size, original_filename, assigned_personas, enabled, created_at, updated_at)
VALUES (
  'Strengths-Based Coaching Principles',
  'PLACEHOLDER_CONTENT_4',
  'document',
  'Strengths Development',
  5000, -- Approximate size  
  'Flow Attributes by Strength Quadrant.txt',
  '["reflection_talia"]',
  true,
  NOW(),
  NOW()
);