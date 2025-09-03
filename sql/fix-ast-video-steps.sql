-- Fix AST Workshop Video Step Assignments
-- Correct the confusion between Flow Patterns (2-2) and Well-being Ladder (3-1)

-- Step 1: Update Flow Patterns to be step 2-2 (keep existing Flow video as is but update to correct step)
UPDATE videos 
SET 
  title = 'Flow Patterns',
  description = 'Understanding your personal flow patterns and how to optimize them',
  url = 'https://www.youtube.com/embed/KGv31SFLKC0?enablejsapi=1&autoplay=1&rel=0',
  "editableId" = 'KGv31SFLKC0',
  "stepId" = '2-2',
  "sortOrder" = 3,
  section = 'flow',
  "transcriptMd" = '# Flow Patterns Video Transcript

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
  glossary = '[
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
  "updatedAt" = NOW()
WHERE "stepId" = '3-1' AND "workshopType" = 'allstarteams';

-- Step 2: Move the Well-being Ladder video from step 4-1 to step 3-1
UPDATE videos 
SET 
  "stepId" = '3-1',
  "sortOrder" = 6,
  section = 'wellbeing',
  "updatedAt" = NOW()
WHERE "stepId" = '4-1' AND "workshopType" = 'allstarteams' AND title = 'Ladder of Well-being';

-- Step 3: Handle any duplicated Well-being videos by ensuring 4-1 remains but with correct title
UPDATE videos 
SET 
  title = 'Future Self Visualization',
  description = 'Envisioning and planning for your future self',
  "sortOrder" = 10,
  section = 'future',
  "updatedAt" = NOW()
WHERE "stepId" = '4-4' AND "workshopType" = 'allstarteams' AND title = 'Your Future Self';

-- Step 4: If no Flow Patterns video exists yet, insert it
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
) 
SELECT 
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
WHERE NOT EXISTS (
  SELECT 1 FROM videos WHERE "stepId" = '2-2' AND "workshopType" = 'allstarteams'
);

-- Verification: Show the corrected step assignments
SELECT 
  id, 
  title, 
  "stepId", 
  section,
  "workshopType", 
  "editableId",
  "sortOrder",
  CASE 
    WHEN "transcriptMd" IS NOT NULL THEN 'Has Transcript' 
    ELSE 'No Transcript' 
  END as transcript_status,
  CASE 
    WHEN glossary IS NOT NULL THEN jsonb_array_length(glossary) || ' terms'
    ELSE 'No Glossary' 
  END as glossary_status
FROM videos 
WHERE "workshopType" = 'allstarteams'
ORDER BY "sortOrder", "stepId";
