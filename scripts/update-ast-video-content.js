#!/usr/bin/env node

import 'dotenv/config';
import postgres from 'postgres';

// Database connection
const sql = postgres(process.env.DATABASE_URL);

console.log('🎥 AST Video Content Update Script');
console.log('===================================');

// Video content data with proper step_id mapping based on database inspection
const videoUpdates = [
  {
    step_id: '1-1',
    title_match: 'Self Awareness Gap',
    transcript_md: `> *"Self-awareness is a core human asset and the foundation for trust, collaboration, and growth. This Microcourse Workshop offers a practical way to enhance individual and team self-awareness."*

> *"Self-awareness appears hard to achieve for deep reasons."*

> *"Lack of self-awareness adversely impacts how we think, act, and connect."*

> *"Our brains are wired for survival. That's why threats and flaws stick more strongly than positive thinking."*

> *"Fear-based commentary and the introspection illusion make us believe we see ourselves clearly, when we don't."*

> *"At work, the gap shows up as projection, misinterpreted signals, and a bias toward flaws instead of strengths."*

> *"On teams, the problem multiplies—miscommunication, friction, lower trust, and weaker results."*

> *"The good news: with intention, self-awareness can be enhanced naturally as we'll learn next."*`,
    glossary: [
      {"term": "Self-Awareness", "definition": "Understanding your own thoughts, feelings, and behaviors, and how they affect others."},
      {"term": "Self-Awareness Gap", "definition": "The difference between how aware we think we are of ourselves and how aware we actually are."},
      {"term": "Psychological Safety", "definition": "A team environment where people feel safe to speak up, share ideas, and make mistakes without fear."},
      {"term": "Disengagement", "definition": "When people lose interest, energy, or commitment to their work."},
      {"term": "Negative Mind", "definition": "Our brain's natural tendency to focus more on threats and problems than on positives."},
      {"term": "Self-Reflection", "definition": "The practice of looking inward to better understand your own thoughts and actions."},
      {"term": "Introspection Illusion", "definition": "The false belief that our inner thoughts and feelings give us a perfectly clear picture of ourselves."},
      {"term": "False Certainty", "definition": "When we feel overly sure about our self-judgments, even if they are inaccurate."},
      {"term": "Projection", "definition": "Attributing our own feelings or flaws to others instead of recognizing them in ourselves."},
      {"term": "Team Impact", "definition": "The combined effect of self-awareness gaps on groups — leading to miscommunication, loss of trust, and weaker results."}
    ]
  },
  {
    step_id: '1-2',
    title_match: 'Self Awareness Opportunity',
    transcript_md: `> *"Self-awareness is a core human asset and the foundation for trust, collaboration, and growth. This Microcourse Workshop offers a practical way to enhance individual and team self-awareness."*

> *"With intention we can move from instinct and surviving to well-being and thriving."*

> *"This course develops four dimensions: strengths, flow, well-being, and vision."*

> *"Real self-awareness starts with wholeness — knowing your strengths, flow, and well-being — not just a list of flaws."*

> *"Humans don't just react — we imagine what's next. Prospective psychology explains how we think ahead. Imagination powers that leap."*

> *"With shared awareness, trust deepens, communications improve, collaboration is better, and leadership strengthens."*

> *"Next, we'll show how this Microcourse workshop is structured, what to expect, and how to get the most from your experience."*`,
    glossary: [
      {"term": "Self-Awareness (Opportunity)", "definition": "Seeing yourself clearly, not by focusing on flaws, but by recognizing strengths, balance, and future goals."},
      {"term": "Flip the Script", "definition": "Changing the usual way of thinking — from self-criticism to self-approval."},
      {"term": "Strengths", "definition": "The talents and abilities you naturally do best."},
      {"term": "Flow", "definition": "A mental state where you are fully focused, performing at your peak, and often losing track of time."},
      {"term": "Well-Being", "definition": "The balance of physical, emotional, and mental health that supports thriving."},
      {"term": "Vision", "definition": "A clear sense of the future you want to create for yourself."},
      {"term": "Positive Psychology", "definition": "The study of happiness, resilience, and human flourishing — focusing on what helps people grow."},
      {"term": "Human Flourishing", "definition": "Living with health, purpose, and positive relationships."},
      {"term": "Resilience", "definition": "The ability to bounce back from challenges and stress."},
      {"term": "Prospective Psychology", "definition": "The study of how people think ahead, imagine possibilities, and plan for the future."},
      {"term": "Default Mode Network (DMN)", "definition": "A brain system active during daydreaming and reflection, important for imagination and planning."},
      {"term": "Distributed Self-Awareness", "definition": "When all team members practice self-awareness, building trust, smooth collaboration, and stronger leadership."}
    ]
  },
  {
    step_id: '1-3',
    title_match: 'Course Guidelines',
    transcript_md: `> *"This video introduces the AllStarTeams microcourse workshop outline, activities, and suggestions as to how to get the best experience from the content."*

> *"This microcourse has four steps: discover your strengths, explore flow and well-being, visualize your potential, and prepare with insights and resources to continue your journey with Heliotrope Imaginal."*

> *"Each page in the microcourse follows the same format. You can watch the video or read the transcript, check key terms in the glossary, and complete short exercises in the activity zone. Use the progress checklist and reflection space to stay on track, then click 'Next' to continue."*

> *"The microcourse structure is designed for flexibility, pace yourself to allow for thoughtful reflection."*

> *"Next, you'll start by identifying your core strengths — especially imagination — the foundation for enhancing self-awareness."*`,
    glossary: [
      {"term": "Microcourse", "definition": "A short, focused learning program designed to be completed step by step."},
      {"term": "Workshop", "definition": "An interactive learning session where participants apply what they've learned."},
      {"term": "Self-Awareness Path", "definition": "The sequence of steps in the course: strengths, flow, well-being, and vision."},
      {"term": "Strengths", "definition": "The things you naturally do well that give you confidence and energy."},
      {"term": "Flow", "definition": "A state of peak focus and performance where work feels smooth and engaging."},
      {"term": "Well-Being", "definition": "The balance of physical, emotional, and mental health that helps you thrive."},
      {"term": "Vision / Potential", "definition": "A clear picture of what you want to achieve in the future."},
      {"term": "Glossary", "definition": "A quick-reference list of key terms with simple definitions (like this one)."},
      {"term": "Activity Zone", "definition": "A space in the course where you complete short exercises for practice."},
      {"term": "Progress Checklist", "definition": "A simple tracker that helps you see what you've completed and what's next."},
      {"term": "Reflection Space", "definition": "A section where you pause, think, and write down your insights."},
      {"term": "Pacing", "definition": "Adjusting the speed of learning to fit your schedule and style."}
    ]
  },
  {
    step_id: '1-3',
    title_match: 'Activities Overview',
    transcript_md: `> *"These modules will engage you in a series of reflective and self-expressive activities."*

> *"These activities follow a deliberate design arc — progressive, multi-dimensional, action-oriented, evidence-based, and future-focused."*

> *"As you progress, various insights tend to emerge at different paces — some immediate, others unfolding over time."*

> *"By the end, you'll walk away with digital resources: your Star Card, a holistic self-report, a growth plan, and a professional completion badge."*

> *"Now it's time to begin with your Star Strengths Self-Assessment."*`,
    glossary: [
      {"term": "Activities / Exercises", "definition": "Short, guided tasks that help you reflect, learn, and apply new insights."},
      {"term": "Design Arc", "definition": "A structured sequence where each step builds toward a bigger goal."},
      {"term": "Progressive Development", "definition": "Step-by-step growth that deepens understanding over time."},
      {"term": "Multi-Dimensional Approach", "definition": "Looking at yourself from different angles — strengths, flow, well-being, and vision."},
      {"term": "Action-Oriented", "definition": "Focused on taking steps and setting goals, not just reflection."},
      {"term": "Evidence-Based", "definition": "Grounded in research and measurable results."},
      {"term": "Future-Focused", "definition": "Aimed at shaping your potential and long-term growth."},
      {"term": "Insights", "definition": "Personal realizations or \"aha moments\" that help you understand yourself better."},
      {"term": "Star Card", "definition": "A one-page summary showing your strengths, flow, well-being, and vision."},
      {"term": "Holistic Self Report", "definition": "A detailed profile describing how you work and grow best."},
      {"term": "Completion Badge", "definition": "A digital recognition of finishing the course that you can share professionally."},
      {"term": "Growth Plan", "definition": "Your personal roadmap for future development steps."}
    ]
  },
  {
    step_id: '2-1',
    title_match: 'Star Strengths Assessment',
    transcript_md: `> *"Now, you'll map your core strengths and see how they come together."*

> *"The Star Self-Assessment maps your core strengths onto a personalized Star Card; you'll work with it during this microcourse and beyond."*

> *"Begin by answering twenty-two real-life scenarios. Your responses shape the first version of your Star Card."*

> *"This chart shows your unique balance of strengths. The percentages reflect tendencies, not judgments. High or low scores don't mean something is missing — they simply show how you tend to approach life."*

> *"Imagination is your fifth strength. It harmonizes and amplifies your other four core strengths — pointing upward to your limitless potential."*

> *"Here is your Star Card. It brings together your four core strengths with Imagination at the apex. But more is needed to complete it."*

> *"Next, you'll continue with Flow State, then Rounding Out. These steps will enrich your understanding and prepare you to complete your Star Card."*`,
    glossary: [
      {"term": "Star Assessment", "definition": "A short self-test that helps you identify your core strengths and preferences."},
      {"term": "Star Card", "definition": "A personalized digital profile that shows your strengths in a simple visual format, used during and after the microcourse."},
      {"term": "Core Strengths", "definition": "The four key areas of how you work: Thinking, Planning, Feeling, and Acting."},
      {"term": "Imagination (Apex Strength)", "definition": "The fifth strength that harmonizes and amplifies all others, pointing toward your potential."},
      {"term": "Unique Holistic Pattern", "definition": "The specific mix of strengths that makes you different from others."},
      {"term": "Pie Chart Visualization", "definition": "A simple graphic showing your personal balance of strengths."},
      {"term": "Percentages (%)", "definition": "Indicators of your tendencies and preferences — not measures of ability or value."},
      {"term": "Flow State Attributes", "definition": "Traits you will add later that describe when and how you perform at your best."},
      {"term": "Rounding Out", "definition": "The process of expanding and balancing your strengths for more flexibility."}
    ]
  },
  {
    step_id: '2-2',
    title_match: 'Flow Patterns',
    transcript_md: `> *"Welcome to Finding Your Flow — where focus and energy align."*

> *"Flow is when everything comes together — effort feels natural, and time disappears."*

> *"Flow fuels creativity, accelerates learning, and strengthens well-being."*

> *"Flow arises with clear goals, real-time feedback, and the right challenges."*

> *"In flow, the brain locks attention, calms stress, and boosts learning."*

> *"Notice the tasks, settings, and rhythms that naturally spark your flow."*

> *"Shape your attitudes, habits, environment, and time to invite flow more often."*

> *"Match important work to the times of day when your focus peaks."*

> *"Recall your best flow moments, then capture the triggers that made them possible."*

> *"Now it's your turn — a short assessment to map your flow and then to review Rounding Out next."*`,
    glossary: [
      {"term": "Flow", "definition": "A mental state of deep focus and enjoyment where effort feels natural and time seems to disappear."},
      {"term": "Immersion", "definition": "Being fully absorbed in a task, with little awareness of distractions."},
      {"term": "Creativity", "definition": "The ability to generate new and useful ideas or solutions."},
      {"term": "Performance", "definition": "How effectively you complete tasks or achieve results."},
      {"term": "Productivity", "definition": "Getting more done with focus and efficiency."},
      {"term": "Stress Reduction", "definition": "Lowering tension and pressure so you can stay calm and energized."},
      {"term": "Clear Goals", "definition": "Knowing exactly what you're aiming to achieve."},
      {"term": "Feedback", "definition": "Information on how you're doing, so you can adjust and improve."},
      {"term": "Challenge–Skill Balance", "definition": "The sweet spot where tasks are hard enough to be engaging but not overwhelming."},
      {"term": "Neuroscience of Flow", "definition": "The study of how brain systems create focus, reward motivation with dopamine, reduce stress, and speed up learning."},
      {"term": "Flow Triggers", "definition": "The conditions (tasks, settings, times, challenges) that naturally spark flow for you."},
      {"term": "Designing for Flow", "definition": "Setting up habits, environments, and schedules to increase your chances of experiencing flow."},
      {"term": "Flow Pattern", "definition": "Your personal map of when and how flow happens most often in your life."},
      {"term": "Flow Assessment", "definition": "A short reflection exercise that helps you track your flow and adds to your Star Card."}
    ]
  },
  {
    step_id: '3-1',
    title_match: 'Well-Being Ladder',
    transcript_md: `> *"Welcome to the Ladder of Well-Being — a simple tool to see where you are today and where you want to grow."*

> *"Well-being isn't just how you feel in the moment — it's the whole way you live and grow across all parts of life."*

> *"Choose the step you're on today, picture the step you'd like to reach in a year, and notice how each small climb makes a difference."*

> *"For over fifty years, people everywhere have used this ladder to reflect, reset, and take the next step upwards."*

> *"This is your ladder, your life. Mark your step today, imagine your best future, and commit to the small actions that will take you higher."*`,
    glossary: [
      {"term": "Well-Being", "definition": "More than just feeling good — it's the overall quality of your life, health, and growth."},
      {"term": "Whole-Person View", "definition": "Looking at life across all areas — physical, mental, emotional, and social — not just one part."},
      {"term": "Dimensions of Well-Being", "definition": "The six core areas that shape a fulfilling life (e.g., health, relationships, purpose)."},
      {"term": "Awareness and Action", "definition": "Knowing where you are now and taking steps to improve."},
      {"term": "Well-Being Ladder", "definition": "A reflection tool where each rung shows your current and future life satisfaction."},
      {"term": "Step / Rung", "definition": "Your position on the ladder today, and the next level you want to reach."},
      {"term": "Small Climbs", "definition": "Incremental improvements that add up to meaningful change over time."},
      {"term": "Cantril Ladder", "definition": "A well-being tool developed by psychologist Hadley Cantril in 1965, now used worldwide."},
      {"term": "Gallup Research", "definition": "Large-scale studies across 150+ countries that apply the ladder to measure well-being globally."},
      {"term": "Best Possible Life", "definition": "Imagining the highest, most fulfilling version of your life in the future."}
    ]
  },
  {
    step_id: '3-2',
    title_match: 'Rounding Out',
    transcript_md: `> *"Now that you've explored your strengths, flow, and well-being, it's time to look forward. This step helps you imagine the person you're becoming."*

> *"The choices you make today shape who you'll be tomorrow. By imagining your future self, you create a clearer path — one you're more likely to follow."*

> *"Future self-continuity is an emerging field of study. Research shows that when you feel connected to your future self, you gain authenticity, more positive emotion, less negative stress, and greater life satisfaction."*

> *"Select one or two images that capture who you imagine becoming. They can be literal or symbolic — choose what feels meaningful."*

> *"Now put your vision into words. Write a few sentences about the future self you imagine — guided by the prompts on screen."*

> *"End this step with one clear intention. Write a single sentence you want to carry forward."*

> *"You've pictured and described your future self. Now, carry this vision into your final reflection next."*`,
    glossary: [
      {"term": "Future Self", "definition": "The person you are becoming, shaped by today's choices and actions."},
      {"term": "Future Self-Continuity", "definition": "Feeling connected to your future self, which improves decision-making, authenticity, and life satisfaction."},
      {"term": "Authenticity", "definition": "Living in a way that feels true to your values and identity."},
      {"term": "Positive Affect", "definition": "Emotions such as happiness, optimism, and calm."},
      {"term": "Negative Affect", "definition": "Stress, worry, or frustration that lowers well-being."},
      {"term": "Life Satisfaction", "definition": "A measure of how content you feel with your life overall."},
      {"term": "Symbolic Image", "definition": "A picture (like a sunrise or bridge) that represents your vision of the future."},
      {"term": "Vision Statement", "definition": "A few sentences describing who you imagine becoming and how your life looks in alignment with strengths, flow, and well-being."},
      {"term": "Intention", "definition": "A clear and specific commitment that connects your vision to real-life next steps."},
      {"term": "Reflection", "definition": "Pausing to think about your experiences and insights, often to guide future action."}
    ]
  },
  {
    step_id: '6-1',
    title_match: 'Teamwork',
    transcript_md: `> *"Next, you'll join your teammates for a live facilitated online whiteboard practice session."*

> *"Whatever the purpose. Whatever stage — forming, storming, norming, or performing. Whatever space — virtual, hybrid, or co-located. This workshop meets your team where it is."*

> *"This workshop is an opportunity to practice as a team what you learned during your individual microcourse."*

> *"Each teammate places their Star Card on a shared canvas. You can instantly see the full range of strengths-flow across your team — visual, actionable, and ready to align."*

> *"Together, you'll align your strengths and flow states to solve challenges and create shared solutions."*

> *"Imagination is built into the brain's design for sensing, simulating, and allowing us to sync with others in shared vision."*

> *"This workshop gives your team more than insight — it gives you traction. You'll gain clarity, connection, and momentum."*

> *"Next Up – You'll meet your teammates and facilitator for a lively, colorful, interactive learning experience."*`,
    glossary: [
      {"term": "Facilitated Session", "definition": "A guided group activity led by a trained facilitator to help teams work together effectively."},
      {"term": "Whiteboard (Online)", "definition": "A digital collaboration space where teammates can share ideas, maps, and visuals in real time."},
      {"term": "Tuckman's Model", "definition": "A framework for team development stages: Forming, Storming, Norming, Performing."},
      {"term": "Strengths Mapping", "definition": "Plotting each person's strengths to find overlaps, gaps, and opportunities for balance."},
      {"term": "Dynamic Analysis", "definition": "Examining how team members communicate, collaborate, and share leadership."},
      {"term": "Shared Visioning", "definition": "Creating a common goal or purpose that aligns everyone's contributions."},
      {"term": "Star Card", "definition": "A one-page profile of an individual's strengths, flow, well-being, and vision."},
      {"term": "Strengths-Flow Fusion", "definition": "Combining individual strengths and flow states into a powerful team capability."},
      {"term": "Facilitated Exercises", "definition": "Structured activities designed to help teams practice and apply new skills together."},
      {"term": "Synchrony", "definition": "The alignment of team members' thoughts, actions, and rhythms during collaboration."},
      {"term": "Imaginative Thinking", "definition": "Using creativity and foresight to explore possibilities and improve decision-making."},
      {"term": "Team Benefits", "definition": "The outcomes of teamwork, including greater clarity, trust, connection, and momentum."}
    ]
  },
  {
    step_id: '7-1',
    title_match: 'HI Background',
    transcript_md: `> *"Heliotrope Imaginal's mission is empowering human potential to thrive in an AI-shaped world."*

> *"Across every field — from boardrooms to ballfields — we celebrate the power of people coming together, each unique, yet stronger as one."*

> *"At Heliotrope Imaginal, we believe the future belongs to those who dare to imagine boldly — as individuals, teams, and organizations. Our microcourse workshops help transform vision into value, and potential into progress."*

> *"Our methodology stack combines neuroscience, philosophy, and psychology principles and models to inform innovative, effective microcourse workshops for youth and adults."*

> *"It's not a different process — it's the same neural mechanism scaling outward. The imagination that drives one person's insight is the same force that enables teams to align — and societies to flourish."*

> *"Built through decades of practice, the AllStarTeams method harnessed imagination to self-efficacy and team growth across sectors, cultures, and causes."*

> *"At Heliotrope Imaginal, we believe the future belongs to those who dare to imagine boldly — as individuals, teams, and organizations. Our workshops help transform vision into value, and potential into progress."*`,
    glossary: [
      {"term": "Heliotrope Imaginal (HI)", "definition": "A learning and development company focused on strengthening human capabilities in an AI-shaped world."},
      {"term": "Human Potential", "definition": "The unique talents and abilities every person has to grow, create, and contribute."},
      {"term": "Microcourse-Workshop", "definition": "A short, structured learning program that combines individual self-study with team practice."},
      {"term": "Methodology Stack", "definition": "The integrated framework of science, philosophy, and practice used to guide HI's programs."},
      {"term": "Neuroscience", "definition": "The scientific study of the brain and nervous system, especially how imagination shapes learning and growth."},
      {"term": "Imagination", "definition": "The ability to form new ideas, envision possibilities, and create meaning."},
      {"term": "From Neurons to Nations", "definition": "The idea that imagination works the same way at every scale — from personal insight to team collaboration to societal change."},
      {"term": "Mental Synthesis", "definition": "The brain's ability to combine ideas and images into new creative possibilities."},
      {"term": "Team Visioning", "definition": "A process where groups create shared goals and align around a common future."},
      {"term": "Cultural Evolution", "definition": "The way societies grow and adapt through shared ideas and imagined futures."},
      {"term": "Self-Efficacy", "definition": "The belief in one's own ability to succeed and make an impact."},
      {"term": "Cross-Sector Application", "definition": "The use of HI's methods across different fields like education, business, health, and community development."},
      {"term": "Testimonials", "definition": "Real-world endorsements from leaders and organizations who have used AllStarTeams."}
    ]
  }
];

async function updateVideoContent() {
  try {
    console.log('🔍 Connecting to database...');
    
    // Check current state
    console.log('\n📊 Current AST video status:');
    const currentVideos = await sql`
      SELECT step_id, title, 
             CASE WHEN transcript_md IS NOT NULL AND LENGTH(transcript_md) > 0 
                  THEN LENGTH(transcript_md) 
                  ELSE 0 END as transcript_length,
             CASE WHEN glossary IS NOT NULL AND jsonb_typeof(glossary) = 'array' 
                  THEN jsonb_array_length(glossary) 
                  WHEN glossary IS NOT NULL 
                  THEN 1
                  ELSE 0 END as glossary_count
      FROM videos 
      WHERE workshop_type = 'allstarteams' 
      ORDER BY step_id
    `;
    
    currentVideos.forEach(video => {
      console.log(`  ${video.step_id}: ${video.title} (transcript: ${video.transcript_length} chars, glossary: ${video.glossary_count} terms)`);
    });

    console.log(`\n🔄 Processing ${videoUpdates.length} video updates...`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const update of videoUpdates) {
      try {
        // Find matching videos (there might be duplicates)
        const matchingVideos = await sql`
          SELECT id, title FROM videos 
          WHERE step_id = ${update.step_id} 
          AND workshop_type = 'allstarteams'
          AND title ILIKE ${`%${update.title_match}%`}
        `;
        
        if (matchingVideos.length === 0) {
          console.log(`⚠️  No matching video found for step ${update.step_id} with title containing "${update.title_match}"`);
          skippedCount++;
          continue;
        }
        
        for (const video of matchingVideos) {
          // Update the video with new content
          await sql`
            UPDATE videos 
            SET 
              transcript_md = ${update.transcript_md},
              glossary = ${JSON.stringify(update.glossary)}::jsonb
            WHERE id = ${video.id}
          `;
          
          console.log(`✅ Updated: ${update.step_id} - ${video.title}`);
          console.log(`   📝 Transcript: ${update.transcript_md.length} characters`);
          console.log(`   📚 Glossary: ${update.glossary.length} terms`);
          updatedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${update.step_id}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`\n📈 Update Summary:`);
    console.log(`✅ Successfully updated: ${updatedCount} videos`);
    console.log(`⚠️  Skipped: ${skippedCount} videos`);
    
    // Verify updates
    console.log('\n🔍 Verification - checking updated content:');
    const verificationResults = await sql`
      SELECT step_id, title,
             CASE WHEN transcript_md IS NOT NULL AND LENGTH(transcript_md) > 100 
                  THEN '✅ Has content' 
                  ELSE '❌ Missing/short' END as transcript_status,
             CASE WHEN glossary IS NOT NULL AND jsonb_typeof(glossary) = 'array' AND jsonb_array_length(glossary) >= 5 
                  THEN '✅ Has content' 
                  WHEN glossary IS NOT NULL AND jsonb_typeof(glossary) != 'array'
                  THEN '⚠️ Wrong format'
                  ELSE '❌ Missing/few terms' END as glossary_status
      FROM videos 
      WHERE workshop_type = 'allstarteams' 
      ORDER BY step_id
    `;
    
    verificationResults.forEach(video => {
      console.log(`  ${video.step_id}: ${video.title}`);
      console.log(`    📝 Transcript: ${video.transcript_status}`);
      console.log(`    📚 Glossary: ${video.glossary_status}`);
    });
    
    console.log('\n🎉 AST video content update completed!');
    console.log('\n🧪 Next steps:');
    console.log('1. Test the VideoTranscriptGlossary component in browser');
    console.log('2. Navigate to AST workshop pages');
    console.log('3. Verify transcript and glossary tabs appear');
    console.log('4. Check content formatting and display');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await sql.end();
  }
}

// Run the update
updateVideoContent().catch(console.error);