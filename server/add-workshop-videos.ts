
import { storage } from './storage';

async function addWorkshopVideos() {
  const allStarTeamsVideos = [
    {
      title: "Welcome to AllStarTeams",
      description: "Introduction to the AllStarTeams workshop journey",
      url: "https://www.youtube.com/embed/lcjao1ob55A?enablejsapi=1",
      editableId: "lcjao1ob55A",
      workshopType: "allstarteams",
      section: "introduction",
      sortOrder: 1
    },
    {
      title: "Understanding Your STAR Assessment",
      description: "Guide to completing your STAR self-assessment",
      url: "https://www.youtube.com/embed/star-assessment",
      editableId: "star-assessment",
      workshopType: "allstarteams", 
      section: "assessment",
      sortOrder: 2
    },
    {
      title: "Flow and Performance",
      description: "Introduction to flow states and peak performance",
      url: "https://www.youtube.com/embed/flow-intro",
      editableId: "flow-intro",
      workshopType: "allstarteams",
      section: "workshop",
      sortOrder: 3
    },
    {
      title: "Creating Your Star Card",
      description: "Guide to completing your personal Star Card", 
      url: "https://www.youtube.com/embed/star-card",
      editableId: "star-card",
      workshopType: "allstarteams",
      section: "workshop",
      sortOrder: 4
    },
    {
      title: "Team Workshop Preview",
      description: "Overview of the upcoming team workshop phase",
      url: "https://www.youtube.com/embed/team-preview",
      editableId: "team-preview", 
      workshopType: "allstarteams",
      section: "team-workshop",
      sortOrder: 5
    }
  ];

  const imaginalAgilityVideos = [
    {
      title: "Welcome to Imaginal Agility",
      description: "Introduction to the Imaginal Agility workshop",
      url: "https://www.youtube.com/embed/welcome-ia",
      editableId: "welcome-ia",
      workshopType: "imaginal-agility",
      section: "introduction",
      sortOrder: 1
    },
    {
      title: "The Triple Challenge",
      description: "Understanding the challenges ahead",
      url: "https://www.youtube.com/embed/triple-challenge",
      editableId: "triple-challenge",
      workshopType: "imaginal-agility",
      section: "workshop",
      sortOrder: 2
    },
    {
      title: "5Cs Assessment Guide",
      description: "Guide to completing the 5Cs assessment",
      url: "https://www.youtube.com/embed/5cs-guide",
      editableId: "5cs-guide",
      workshopType: "imaginal-agility",
      section: "assessment",
      sortOrder: 3
    },
    {
      title: "Imagination in Action",
      description: "Applying imagination to organizational challenges",
      url: "https://www.youtube.com/embed/imagination-action",
      editableId: "imagination-action",
      workshopType: "imaginal-agility",
      section: "workshop",
      sortOrder: 4
    },
    {
      title: "Team Workshop Overview",
      description: "Preview of the team workshop phase",
      url: "https://www.youtube.com/embed/team-overview",
      editableId: "team-overview",
      workshopType: "imaginal-agility",
      section: "team-workshop",
      sortOrder: 5
    }
  ];

  try {
    // First delete all existing videos to remove duplicates
    const existingVideos = await storage.getAllVideos();
    for (const video of existingVideos) {
      await storage.deleteVideo(video.id);  
    }

    // Add AllStarTeams videos
    for (const video of allStarTeamsVideos) {
      await storage.createVideo(video);
      console.log(`Added video: ${video.title}`);
    }

    // Add Imaginal Agility videos 
    for (const video of imaginalAgilityVideos) {
      await storage.createVideo(video);
      console.log(`Added video: ${video.title}`);
    }

    console.log('All videos have been added successfully');
  } catch (error) {
    console.error('Error adding videos:', error);
  }
}

// Execute the function
addWorkshopVideos()
  .then(() => console.log('Video addition completed'))
  .catch(console.error);
