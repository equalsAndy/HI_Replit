
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
      url: "https://www.youtube.com/embed/1Belekdly70?enablejsapi=1",
      editableId: "1Belekdly70",
      workshopType: "allstarteams", 
      section: "assessment",
      sortOrder: 2
    },
    {
      title: "Flow and Performance",
      description: "Introduction to flow states and peak performance",
      url: "https://www.youtube.com/embed/zIFGKPMN9t8?enablejsapi=1",
      editableId: "zIFGKPMN9t8",
      workshopType: "allstarteams",
      section: "workshop",
      sortOrder: 3
    },
    {
      title: "Creating Your Star Card",
      description: "Guide to completing your personal Star Card", 
      url: "https://www.youtube.com/embed/BLh502BlZLE?enablejsapi=1",
      editableId: "BLh502BlZLE",
      workshopType: "allstarteams",
      section: "workshop",
      sortOrder: 4
    },
    {
      title: "Team Workshop Preview",
      description: "Overview of the upcoming team workshop phase",
      url: "https://www.youtube.com/embed/8wXSL3om6Ig?enablejsapi=1",
      editableId: "8wXSL3om6Ig", 
      workshopType: "allstarteams",
      section: "team-workshop",
      sortOrder: 5
    }
  ];

  const imaginalAgilityVideos = [
    {
      title: "IAWS Orientation Video",
      description: "Introduction to the Imaginal Agility workshop",
      url: "https://www.youtube.com/embed/1Belekdly70?enablejsapi=1",
      editableId: "1Belekdly70", 
      workshopType: "imaginal-agility",
      section: "introduction",
      sortOrder: 1
    },
    {
      title: "AI Triple Challenge",
      description: "Understanding the challenges ahead",
      url: "https://www.youtube.com/embed/zIFGKPMN9t8?enablejsapi=1",
      editableId: "zIFGKPMN9t8",
      workshopType: "imaginal-agility", 
      section: "workshop",
      sortOrder: 2
    },
    {
      title: "Imaginal Agility Solution",
      description: "Core solution framework",
      url: "https://www.youtube.com/embed/BLh502BlZLE?enablejsapi=1",
      editableId: "BLh502BlZLE",
      workshopType: "imaginal-agility",
      section: "workshop",
      sortOrder: 3
    },
    {
      title: "5 Capabilities (5Cs)",
      description: "Guide to the five core capabilities",
      url: "https://www.youtube.com/embed/8wXSL3om6Ig?enablejsapi=1",
      editableId: "8wXSL3om6Ig",
      workshopType: "imaginal-agility",
      section: "assessment",
      sortOrder: 4
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
