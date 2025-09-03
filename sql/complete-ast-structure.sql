-- Complete AST Workshop Step Structure Correction
-- Based on the correct module/step layout provided

-- Clear existing incorrect mappings
DELETE FROM videos WHERE "workshopType" = 'allstarteams';

-- Module 1: Foundation
INSERT INTO videos (title, description, url, "editableId", "workshopType", section, "stepId", autoplay, "sortOrder", "createdAt", "updatedAt") VALUES
('On Self-Awareness', 'Introduction to self-awareness and personal development', 'https://www.youtube.com/embed/pp2wrqE8r2o?enablejsapi=1&autoplay=1&rel=0', 'pp2wrqE8r2o', 'allstarteams', 'foundation', '1-1', true, 1, NOW(), NOW()),
('Positive Psychology', 'Understanding positive psychology principles', 'https://www.youtube.com/embed/TN5b8jx7KSI?enablejsapi=1&autoplay=1&rel=0', 'TN5b8jx7KSI', 'allstarteams', 'foundation', '1-2', true, 2, NOW(), NOW()),
('About this Course', 'Course overview and expectations', 'https://www.youtube.com/embed/JJWb058M-sY?enablejsapi=1&autoplay=1&rel=0', 'JJWb058M-sY', 'allstarteams', 'foundation', '1-3', true, 3, NOW(), NOW());

-- Module 2: Discovery  
INSERT INTO videos (title, description, url, "editableId", "workshopType", section, "stepId", autoplay, "sortOrder", "createdAt", "updatedAt") VALUES
('Star Strengths Assessment', 'Discover your core strengths', 'https://www.youtube.com/embed/TN5b8jx7KSI?enablejsapi=1&autoplay=1&rel=0', 'TN5b8jx7KSI', 'allstarteams', 'discovery', '2-1', true, 4, NOW(), NOW()),
('Your Future Self', 'Envisioning your future potential', 'https://www.youtube.com/embed/9Q5JMKoSFVk?enablejsapi=1&autoplay=1&rel=0', '9Q5JMKoSFVk', 'allstarteams', 'discovery', '2-3', true, 6, NOW(), NOW());

-- Module 2: Flow Patterns (2-2) - WITH FULL TRANSCRIPT AND GLOSSARY
INSERT INTO videos (
  title, description, url, "editableId", "workshopType", section, "stepId", autoplay, "sortOrder",
  "transcriptMd", glossary, "createdAt", "updatedAt"
) VALUES (
  'Flow Patterns',
  'Understanding your personal flow patterns and how to optimize them',
  'https://www.youtube.com/embed/KGv31SFLKC0?enablejsapi=1&autoplay=1&rel=0',
  'KGv31SFLKC0',
  'allstarteams',
  'discovery',
  '2-2',
  true,
  5,
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
);

-- Module 3: Application
INSERT INTO videos (title, description, url, "editableId", "workshopType", section, "stepId", autoplay, "sortOrder", "createdAt", "updatedAt") VALUES
('Well-Being Ladder', 'Understanding the Well-being Ladder concept', 'https://www.youtube.com/embed/SjEfwPEl65U?enablejsapi=1&autoplay=1&rel=0', 'SjEfwPEl65U', 'allstarteams', 'application', '3-1', true, 8, NOW(), NOW()),
('Rounding Out', 'Developing a well-rounded approach', 'https://www.youtube.com/embed/BBAx5dNZw6Y?enablejsapi=1&autoplay=1&rel=0', 'BBAx5dNZw6Y', 'allstarteams', 'application', '3-2', true, 9, NOW(), NOW());

-- Note: 2-4, 3-3, 3-4, and Module 4-5 steps don't have videos currently
-- They are likely text-based or assessment steps

-- Verification query
SELECT 
  "stepId",
  title,
  section,
  "sortOrder",
  CASE 
    WHEN "transcriptMd" IS NOT NULL THEN 'Has Transcript (' || LENGTH("transcriptMd") || ' chars)'
    ELSE 'No Transcript' 
  END as transcript_status,
  CASE 
    WHEN glossary IS NOT NULL THEN jsonb_array_length(glossary) || ' glossary terms'
    ELSE 'No Glossary' 
  END as glossary_status
FROM videos 
WHERE "workshopType" = 'allstarteams' 
ORDER BY "sortOrder";
