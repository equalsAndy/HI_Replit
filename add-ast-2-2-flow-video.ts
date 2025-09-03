import { storage } from './server/storage';

// Flow Patterns video data for AST-2-2
const flowVideoData = {
  title: "Flow Patterns",
  description: "Understanding your personal flow patterns and how to optimize them",
  url: "https://www.youtube.com/embed/KGv31SFLKC0?enablejsapi=1&autoplay=1&rel=0",
  editableId: "KGv31SFLKC0",
  workshopType: "allstarteams",
  section: "flow",
  stepId: "2-2",
  autoplay: true,
  sortOrder: 3,
  
  // Transcript as markdown
  transcriptMd: `
# Flow Patterns Video Transcript

1. *"Welcome to Finding Your Flow — where focus and energy align."*
2. *"Flow is when everything comes together — effort feels natural, and time disappears."*
3. *"Flow fuels creativity, accelerates learning, and strengthens well-being."*
4. *"Flow arises with clear goals, real-time feedback, and the right challenges."*
5. *"In flow, the brain locks attention, calms stress, and boosts learning."*
6. *"Notice the tasks, settings, and rhythms that naturally spark your flow."*
7. *"Shape your attitudes, habits, environment, and time to invite flow more often."*
8. *"Match important work to the times of day when your focus peaks."*
9. *"Recall your best flow moments, then capture the triggers that made them possible."*
10. *"Now it's your turn — a short assessment to map your flow and then to review Rounding Out next."*
  `,
  
  // Glossary as structured JSON
  glossary: [
    { term: "Flow", definition: "A mental state of deep focus and enjoyment where effort feels natural and time seems to disappear." },
    { term: "Immersion", definition: "Being fully absorbed in a task, with little awareness of distractions." },
    { term: "Creativity", definition: "The ability to generate new and useful ideas or solutions." },
    { term: "Performance", definition: "How effectively you complete tasks or achieve results." },
    { term: "Productivity", definition: "Getting more done with focus and efficiency." },
    { term: "Stress Reduction", definition: "Lowering tension and pressure so you can stay calm and energized." },
    { term: "Clear Goals", definition: "Knowing exactly what you're aiming to achieve." },
    { term: "Feedback", definition: "Information on how you're doing, so you can adjust and improve." },
    { term: "Challenge–Skill Balance", definition: "The sweet spot where tasks are hard enough to be engaging but not overwhelming." },
    { term: "Neuroscience of Flow", definition: "The study of how brain systems create focus, reward motivation with dopamine, reduce stress, and speed up learning." },
    { term: "Flow Triggers", definition: "The conditions (tasks, settings, times, challenges) that naturally spark flow for you." },
    { term: "Designing for Flow", definition: "Setting up habits, environments, and schedules to increase your chances of experiencing flow." },
    { term: "Flow Pattern", definition: "Your personal map of when and how flow happens most often in your life." },
    { term: "Flow Assessment", definition: "A short reflection exercise that helps you track your flow and adds to your Star Card." }
  ]
};

async function addFlowVideo() {
  try {
    console.log('Adding AST 2-2 Flow Patterns video...');
    
    // Check if video already exists with this stepId
    const existingVideos = await storage.getAllVideos();
    const existing = existingVideos.find(v => v.stepId === '2-2' && v.workshopType === 'allstarteams');
    
    if (existing) {
      console.log('Video already exists. Updating...');
      await storage.updateVideo(existing.id, flowVideoData);
      console.log('Video updated successfully!');
    } else {
      console.log('Creating new video entry...');
      const newVideo = await storage.createVideo(flowVideoData);
      console.log(`Flow Patterns video added successfully with ID: ${newVideo.id}`);
    }
    
    // Verify the video was added with all data
    const verification = await storage.getAllVideos();
    const addedVideo = verification.find(v => v.stepId === '2-2' && v.workshopType === 'allstarteams');
    
    if (addedVideo) {
      console.log('Verification successful!');
      console.log('Video details:', {
        title: addedVideo.title,
        stepId: addedVideo.stepId,
        hasTranscript: !!addedVideo.transcriptMd,
        hasGlossary: !!addedVideo.glossary && addedVideo.glossary.length > 0,
        glossaryTerms: addedVideo.glossary?.length || 0
      });
    } else {
      console.log('Warning: Could not verify video was added correctly');
    }
    
  } catch (error) {
    console.error('Error adding Flow video:', error);
  }
}

// Execute the function
addFlowVideo()
  .then(() => console.log('Flow video addition completed'))
  .catch(console.error);
