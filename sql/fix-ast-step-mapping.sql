-- Fix AST Step Mapping Issues
-- Current problem: Steps are incorrectly mapped
-- AST 3-1 should be "Well-being Ladder", not "Intro to Flow"
-- AST 2-2 should be "Flow Patterns" (the one we just added)

-- Step 1: Move the current "Ladder of Well-being" from 4-1 to 3-1
UPDATE videos 
SET 
  "stepId" = '3-1',
  "sortOrder" = 5
WHERE "stepId" = '4-1' AND "workshopType" = 'allstarteams' AND title = 'Ladder of Well-being';

-- Step 2: Remove the incorrectly placed "Intro to Flow" from 3-1 
-- (since 3-1 should be well-being, not flow)
DELETE FROM videos 
WHERE "stepId" = '3-1' AND "workshopType" = 'allstarteams' AND title = 'Intro to Flow';

-- Step 3: Add/Update Flow Patterns as 2-2 (this should already exist from our previous work)
INSERT INTO videos (
  title, 
  description, 
  url, 
  "editableId", 
  "workshopType", 
  section, 
  "stepId", 
  autoplay, 
  "sortOrder",
  "transcriptMd",
  glossary,
  "createdAt",
  "updatedAt"
) VALUES (
  'Flow Patterns',
  'Understanding your personal flow patterns and how to optimize them',
  'https://www.youtube.com/embed/KGv31SFLKC0?enablejsapi=1&autoplay=1&rel=0',
  'KGv31SFLKC0',
  'allstarteams',
  'flow',
  '2-2',
  true,
  3,
  '# Flow Patterns Video Transcript

1. *"Welcome to Finding Your Flow — where focus and energy align."*
2. *"Flow is when everything comes together — effort feels natural, and time disappears."*
3. *"Flow fuels creativity, accelerates learning, and strengthens well-being."*
4. *"Flow arises with clear goals, real-time feedback, and the right challenges."*
5. *"In flow, the brain locks attention, calms stress, and boosts learning."*
6. *"Notice the tasks, settings, and rhythms that naturally spark your flow."*
7. *"Shape your attitudes, habits, environment, and time to invite flow more often."*
8. *"Match important work to the times of day when your focus peaks."*
9. *"Recall your best flow moments, then capture the triggers that made them possible."*
10. *"Now it''s your turn — a short assessment to map your flow and then to review Rounding Out next."*',
  '[
    {"term": "Flow", "definition": "A mental state of deep focus and enjoyment where effort feels natural and time seems to disappear."},
    {"term": "Immersion", "definition": "Being fully absorbed in a task, with little awareness of distractions."},
    {"term": "Creativity", "definition": "The ability to generate new and useful ideas or solutions."},
    {"term": "Performance", "definition": "How effectively you complete tasks or achieve results."},
    {"term": "Productivity", "definition": "Getting more done with focus and efficiency."},
    {"term": "Stress Reduction", "definition": "Lowering tension and pressure so you can stay calm and energized."},
    {"term": "Clear Goals", "definition": "Knowing exactly what you are aiming to achieve."},
    {"term": "Feedback", "definition": "Information on how you are doing, so you can adjust and improve."},
    {"term": "Challenge–Skill Balance", "definition": "The sweet spot where tasks are hard enough to be engaging but not overwhelming."},
    {"term": "Neuroscience of Flow", "definition": "The study of how brain systems create focus, reward motivation with dopamine, reduce stress, and speed up learning."},
    {"term": "Flow Triggers", "definition": "The conditions (tasks, settings, times, challenges) that naturally spark flow for you."},
    {"term": "Designing for Flow", "definition": "Setting up habits, environments, and schedules to increase your chances of experiencing flow."},
    {"term": "Flow Pattern", "definition": "Your personal map of when and how flow happens most often in your life."},
    {"term": "Flow Assessment", "definition": "A short reflection exercise that helps you track your flow and adds to your Star Card."}
  ]'::jsonb,
  NOW(),
  NOW()
) 
ON CONFLICT ("stepId", "workshopType") 
DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  "editableId" = EXCLUDED."editableId",
  "transcriptMd" = EXCLUDED."transcriptMd",
  glossary = EXCLUDED.glossary,
  "updatedAt" = NOW();

-- Verification: Show the corrected mapping
SELECT 
  "stepId",
  title,
  "editableId",
  section,
  "sortOrder",
  CASE 
    WHEN "transcriptMd" IS NOT NULL THEN 'Has Transcript' 
    ELSE 'No Transcript' 
  END as transcript_status
FROM videos 
WHERE "workshopType" = 'allstarteams' 
ORDER BY "sortOrder";
