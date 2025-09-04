-- Migration: AST Video Content Integration
-- Date: 2025-01-04
-- Description: Update AST workshop videos with enhanced content structure including transcripts and glossaries
-- Fixes: Duplicate video IDs, proper step-to-video mapping, comprehensive content organization

-- Begin transaction for safety
BEGIN;

-- Create backup of existing AST videos before modification
CREATE TEMP TABLE videos_backup AS 
SELECT * FROM videos WHERE "workshopType" = 'allstarteams';

-- Clear existing AST video entries to avoid conflicts
DELETE FROM videos WHERE "workshopType" = 'allstarteams';

-- Insert complete AST video content structure with transcripts and glossaries
-- Each video now has unique YouTube IDs and proper step mapping

-- AST Step 1-1: On Self-Awareness
INSERT INTO videos (
  title, description, url, "editableId", "workshopType", section, "stepId", autoplay, "sortOrder",
  "transcriptMd", glossary, "createdAt", "updatedAt"
) VALUES (
  'On Self-Awareness',
  'Introduction to self-awareness and its importance in personal development',
  'https://www.youtube.com/embed/pp2wrqE8r2o?enablejsapi=1&autoplay=1&rel=0',
  'pp2wrqE8r2o',
  'allstarteams',
  'foundation',
  '1-1',
  true,
  1,
  '# On Self-Awareness Video Transcript

> *"Self-awareness is the foundation of all personal growth and meaningful relationships."*
> 
> *"When we truly know ourselves—our strengths, our challenges, our values—we can make choices that align with who we really are."*
> 
> *"This journey begins with honest reflection and curiosity about our inner landscape."*
> 
> *"Welcome to AllStarTeams, where self-discovery meets practical application."*',
  '[
    {"term": "Self-Awareness", "definition": "The conscious knowledge of one'\''s own character, feelings, motives, and desires."},
    {"term": "Personal Growth", "definition": "The ongoing process of understanding and developing oneself to achieve one'\''s fullest potential."},
    {"term": "Inner Landscape", "definition": "The internal world of thoughts, emotions, values, and beliefs that shape who we are."},
    {"term": "Authentic Living", "definition": "Living in alignment with your true self, values, and beliefs."}
  ]'::jsonb,
  NOW(),
  NOW()
);

-- AST Step 1-2: The Self-Awareness Opportunity
INSERT INTO videos (
  title, description, url, "editableId", "workshopType", section, "stepId", autoplay, "sortOrder",
  "transcriptMd", glossary, "createdAt", "updatedAt"
) VALUES (
  'The Self-Awareness Opportunity',
  'Understanding the opportunity that self-awareness creates for personal and professional growth',
  'https://www.youtube.com/embed/TN5b8jx7KSI?enablejsapi=1&autoplay=1&rel=0',
  'TN5b8jx7KSI',
  'allstarteams',
  'foundation',
  '1-2',
  true,
  2,
  '# The Self-Awareness Opportunity Video Transcript

> *"Self-awareness creates unprecedented opportunities for growth, connection, and impact."*
> 
> *"When we understand our natural patterns, we can leverage our strengths more effectively."*
> 
> *"When we recognize our blind spots, we can develop strategies to address them."*
> 
> *"This awareness becomes the foundation for building stronger teams and achieving better results."*
> 
> *"The opportunity before you is to become the architect of your own development journey."*',
  '[
    {"term": "Growth Opportunity", "definition": "A chance to develop new skills, insights, or capabilities."},
    {"term": "Natural Patterns", "definition": "The recurring behaviors, thoughts, and reactions that come naturally to you."},
    {"term": "Blind Spots", "definition": "Areas of weakness or unconscious behaviors that limit effectiveness."},
    {"term": "Development Journey", "definition": "The ongoing path of personal and professional growth and learning."},
    {"term": "Strengths Leverage", "definition": "Using your natural talents and abilities to achieve maximum impact."}
  ]'::jsonb,
  NOW(),
  NOW()
);

-- AST Step 1-3: About this Course
INSERT INTO videos (
  title, description, url, "editableId", "workshopType", section, "stepId", autoplay, "sortOrder",
  "transcriptMd", glossary, "createdAt", "updatedAt"
) VALUES (
  'About this Course',
  'Course overview, expectations, and the journey ahead',
  'https://www.youtube.com/embed/JJWb058M-sY?enablejsapi=1&autoplay=1&rel=0',
  'JJWb058M-sY',
  'allstarteams',
  'foundation',
  '1-3',
  true,
  3,
  '# About This Course Video Transcript

> *"Welcome to AllStarTeams—a journey of discovery, growth, and practical application."*
> 
> *"Over the next several modules, you'\''ll explore your strengths, identify your flow patterns, and visualize your potential."*
> 
> *"Each step builds on the previous one, creating a comprehensive picture of who you are and who you'\''re becoming."*
> 
> *"By the end, you'\''ll have practical tools and deep insights to enhance both your individual performance and your team contributions."*',
  '[
    {"term": "AllStarTeams", "definition": "A comprehensive development program focused on strengths, flow, and team effectiveness."},
    {"term": "Flow Patterns", "definition": "The conditions and activities where you naturally experience optimal performance and engagement."},
    {"term": "Comprehensive Picture", "definition": "A holistic understanding of your strengths, motivations, and potential."},
    {"term": "Team Contributions", "definition": "The unique value and impact you bring to collaborative efforts."}
  ]'::jsonb,
  NOW(),
  NOW()
);

-- AST Step 2-1: Star Strengths Assessment Introduction (FIXED - unique video ID)
INSERT INTO videos (
  title, description, url, "editableId", "workshopType", section, "stepId", autoplay, "sortOrder",
  "transcriptMd", glossary, "createdAt", "updatedAt"
) VALUES (
  'Star Strengths Assessment',
  'Introduction to the Star Strengths framework and assessment',
  'https://www.youtube.com/embed/8K_9lAFvxGo?enablejsapi=1&autoplay=1&rel=0',
  '8K_9lAFvxGo',
  'allstarteams',
  'discovery',
  '2-1',
  true,
  4,
  '# Star Strengths Assessment Video Transcript

> *"Your strengths are not just what you'\''re good at—they'\''re the activities that energize and fulfill you."*
> 
> *"The Star Strengths framework identifies four key dimensions: Thinking, Acting, Feeling, and Planning."*
> 
> *"Each person has a unique combination—a star pattern—that represents their natural approach to challenges and opportunities."*
> 
> *"Understanding your star pattern helps you make better decisions about roles, projects, and collaborations."*
> 
> *"Let'\''s discover your unique strengths profile and see how it shapes your contribution to any team."*',
  '[
    {"term": "Star Strengths", "definition": "A framework that identifies natural talents across four key dimensions of human capability."},
    {"term": "Thinking Strengths", "definition": "Abilities related to analysis, strategy, problem-solving, and intellectual processing."},
    {"term": "Acting Strengths", "definition": "Talents in execution, implementation, getting things done, and driving results."},
    {"term": "Feeling Strengths", "definition": "Capabilities in emotional intelligence, empathy, relationships, and human connection."},
    {"term": "Planning Strengths", "definition": "Skills in organization, structure, future-thinking, and systematic approaches."},
    {"term": "Star Pattern", "definition": "Your unique combination of strengths across the four dimensions that defines your natural approach."}
  ]'::jsonb,
  NOW(),
  NOW()
);

-- AST Step 2-2: Flow Patterns (FIXED - No longer duplicate video ID)
INSERT INTO videos (
  title, description, url, "editableId", "workshopType", section, "stepId", autoplay, "sortOrder",
  "transcriptMd", glossary, "createdAt", "updatedAt"
) VALUES (
  'Flow Patterns',
  'Understanding your personal flow patterns and how to optimize them for peak performance',
  'https://www.youtube.com/embed/KGv31SFLKC0?enablejsapi=1&autoplay=1&rel=0',
  'KGv31SFLKC0',
  'allstarteams',
  'discovery',
  '2-2',
  true,
  5,
  '# Flow Patterns Video Transcript

> *"Welcome to Finding Your Flow—where focus and energy align."*
> 
> *"Flow is when everything comes together—effort feels natural, and time disappears."*
> 
> *"Flow fuels creativity, accelerates learning, and strengthens well-being."*
> 
> *"Flow arises with clear goals, real-time feedback, and the right challenges."*
> 
> *"In flow, the brain locks attention, calms stress, and boosts learning."*
> 
> *"Notice the tasks, settings, and rhythms that naturally spark your flow."*
> 
> *"Shape your attitudes, habits, environment, and time to invite flow more often."*
> 
> *"Match important work to the times of day when your focus peaks."*
> 
> *"Recall your best flow moments, then capture the triggers that made them possible."*
> 
> *"Now it'\''s your turn—a short assessment to map your flow and then to review your results next."*',
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

-- AST Step 2-3: Review Your Star Card (FIXED - unique video ID)
INSERT INTO videos (
  title, description, url, "editableId", "workshopType", section, "stepId", autoplay, "sortOrder",
  "transcriptMd", glossary, "createdAt", "updatedAt"
) VALUES (
  'Review Your Star Card',
  'Understanding your Star Card results and how to interpret your strengths profile',
  'https://www.youtube.com/embed/mJ3k7DY9i8Q?enablejsapi=1&autoplay=1&rel=0',
  'mJ3k7DY9i8Q',
  'allstarteams',
  'discovery',
  '2-3',
  true,
  6,
  '# Review Your Star Card Video Transcript

> *"Your Star Card is more than just results—it'\''s a map of your natural gifts and potential."*
> 
> *"Notice which dimension scored highest—this represents your primary strength zone."*
> 
> *"Look at your secondary strengths—these add depth and uniqueness to your profile."*
> 
> *"Even your lower scores matter—they show areas for growth or collaboration opportunities."*
> 
> *"Remember: there are no bad star patterns, only different ways of contributing value."*
> 
> *"Your star pattern is your starting point, not your ceiling—you can develop in any direction you choose."*',
  '[
    {"term": "Star Card", "definition": "Your personalized strengths profile showing your natural talents across four key dimensions."},
    {"term": "Primary Strength Zone", "definition": "The area where you scored highest, representing your most natural talents."},
    {"term": "Secondary Strengths", "definition": "Areas of moderate strength that add complexity and versatility to your profile."},
    {"term": "Growth Opportunities", "definition": "Areas with lower scores that represent potential for development or collaboration."},
    {"term": "Collaboration Opportunities", "definition": "Ways to partner with others whose strengths complement your areas for growth."},
    {"term": "Starting Point", "definition": "Your current natural state, which serves as the foundation for future development."}
  ]'::jsonb,
  NOW(),
  NOW()
);

-- AST Step 3-1: Well-Being Ladder (CORRECTED POSITION - moved from 4-1)
INSERT INTO videos (
  title, description, url, "editableId", "workshopType", section, "stepId", autoplay, "sortOrder",
  "transcriptMd", glossary, "createdAt", "updatedAt"
) VALUES (
  'Well-Being Ladder',
  'Understanding the Cantril Ladder of Life and mapping your well-being journey',
  'https://www.youtube.com/embed/SjEfwPEl65U?enablejsapi=1&autoplay=1&rel=0',
  'SjEfwPEl65U',
  'allstarteams',
  'application',
  '3-1',
  true,
  7,
  '# Well-Being Ladder Video Transcript

> *"The Cantril Ladder of Life is a powerful tool for measuring and understanding your overall life satisfaction."*
> 
> *"Imagine a ladder with 10 rungs—the top represents the best possible life for you, the bottom represents the worst."*
> 
> *"Where do you stand today? This isn'\''t about comparison with others—it'\''s about your personal journey."*
> 
> *"Where do you see yourself in five years? This vision becomes a roadmap for your growth."*
> 
> *"The gap between today and tomorrow is where opportunity lives."*
> 
> *"Your well-being isn'\''t fixed—it'\''s something you can actively influence through choices and actions."*',
  '[
    {"term": "Cantril Ladder", "definition": "A measurement tool that asks people to rate their current life satisfaction on a scale from 0 to 10."},
    {"term": "Life Satisfaction", "definition": "Your overall contentment and fulfillment with your life as a whole."},
    {"term": "Best Possible Life", "definition": "Your personal vision of the ideal life you could achieve."},
    {"term": "Personal Journey", "definition": "Your unique path of growth, experiences, and development."},
    {"term": "Vision Roadmap", "definition": "A mental picture of your desired future that guides your decisions and actions."},
    {"term": "Well-Being", "definition": "A holistic state of health, happiness, and life satisfaction."}
  ]'::jsonb,
  NOW(),
  NOW()
);

-- AST Step 3-2: Rounding Out
INSERT INTO videos (
  title, description, url, "editableId", "workshopType", section, "stepId", autoplay, "sortOrder",
  "transcriptMd", glossary, "createdAt", "updatedAt"
) VALUES (
  'Rounding Out',
  'Developing a well-rounded approach to personal and professional growth',
  'https://www.youtube.com/embed/BBAx5dNZw6Y?enablejsapi=1&autoplay=1&rel=0',
  'BBAx5dNZw6Y',
  'allstarteams',
  'application',
  '3-2',
  true,
  8,
  '# Rounding Out Video Transcript

> *"Being well-rounded doesn'\''t mean being average at everything—it means developing complementary skills around your core strengths."*
> 
> *"Think of rounding out as strategic development—growing in areas that multiply the impact of your natural talents."*
> 
> *"Some growth happens through learning new skills, others through building relationships with people who complement your abilities."*
> 
> *"The goal isn'\''t perfection—it'\''s integration. How do all your pieces work together?"*
> 
> *"Your rounded profile becomes your unique value proposition—something only you can offer."*',
  '[
    {"term": "Well-Rounded", "definition": "Having a balanced set of skills and qualities that complement each other effectively."},
    {"term": "Strategic Development", "definition": "Intentionally growing skills that enhance your core strengths and overall effectiveness."},
    {"term": "Complementary Skills", "definition": "Abilities that work well together to create greater overall capability."},
    {"term": "Integration", "definition": "The process of combining different skills and strengths into a cohesive whole."},
    {"term": "Value Proposition", "definition": "The unique combination of benefits and capabilities you bring to any situation."},
    {"term": "Core Strengths", "definition": "Your primary natural talents that form the foundation of your capabilities."}
  ]'::jsonb,
  NOW(),
  NOW()
);

-- AST Step 5-1: Your Future Self (CORRECTED POSITION - moved to 5-1 from 4-4)
INSERT INTO videos (
  title, description, url, "editableId", "workshopType", section, "stepId", autoplay, "sortOrder",
  "transcriptMd", glossary, "createdAt", "updatedAt"
) VALUES (
  'Your Future Self',
  'Envisioning and planning for your future self through visualization and goal-setting',
  'https://www.youtube.com/embed/9Q5JMKoSFVk?enablejsapi=1&autoplay=1&rel=0',
  '9Q5JMKoSFVk',
  'allstarteams',
  'future',
  '5-1',
  true,
  9,
  '# Your Future Self Video Transcript

> *"Your future self is not predetermined—it'\''s something you actively create through choices and actions."*
> 
> *"Visualization isn'\''t just daydreaming—it'\''s mental rehearsal that prepares your brain for success."*
> 
> *"When you clearly see your future self, you begin making decisions that align with that vision."*
> 
> *"Your future self has developed new skills, overcome challenges, and achieved meaningful goals."*
> 
> *"The bridge between who you are and who you'\''re becoming is built one choice at a time."*
> 
> *"Start with the end in mind, then work backward to create your path forward."*',
  '[
    {"term": "Future Self", "definition": "The person you are becoming through intentional growth and development."},
    {"term": "Visualization", "definition": "The practice of creating detailed mental images of desired outcomes or experiences."},
    {"term": "Mental Rehearsal", "definition": "Practicing skills or scenarios in your mind to improve actual performance."},
    {"term": "Vision Alignment", "definition": "Making choices and taking actions that move you toward your desired future."},
    {"term": "Meaningful Goals", "definition": "Objectives that connect to your values and contribute to your sense of purpose."},
    {"term": "Intentional Growth", "definition": "Deliberately developing skills, knowledge, and capabilities over time."}
  ]'::jsonb,
  NOW(),
  NOW()
);

-- Verify the migration results
SELECT 
  'AST Video Integration Summary' AS summary,
  COUNT(*) AS total_videos,
  COUNT(DISTINCT "stepId") AS unique_steps,
  COUNT(DISTINCT "editableId") AS unique_video_ids,
  COUNT(*) FILTER (WHERE "transcriptMd" IS NOT NULL) AS videos_with_transcripts,
  COUNT(*) FILTER (WHERE glossary IS NOT NULL) AS videos_with_glossaries
FROM videos 
WHERE "workshopType" = 'allstarteams';

-- Commit the transaction
COMMIT;

-- Final verification query
SELECT 
  "stepId",
  title,
  "editableId",
  section,
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
ORDER BY "sortOrder";