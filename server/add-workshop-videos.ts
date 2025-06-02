import { storage } from './storage';

async function addWorkshopVideos() {
  const allStarTeamsVideos = [
    {
      title: "Intro to Strengths",
      description: "Introduction to understanding your strengths",
      url: "https://www.youtube.com/embed/ao04eaeDIFQ?enablejsapi=1",
      editableId: "ao04eaeDIFQ",
      workshopType: "allstarteams",
      section: "introduction",
      sortOrder: 1
    },
    {
      title: "Your Star Profile",
      description: "Understanding your personal Star Profile",
      url: "https://www.youtube.com/embed/x6h7LDtdnJw?enablejsapi=1",
      editableId: "x6h7LDtdnJw",
      workshopType: "allstarteams",
      section: "assessment",
      sortOrder: 2
    },
    {
      title: "Intro to Flow",
      description: "Introduction to flow states and performance",
      url: "https://www.youtube.com/embed/JxdhWd8agmE?enablejsapi=1",
      editableId: "JxdhWd8agmE",
      workshopType: "allstarteams",
      section: "flow",
      sortOrder: 3
    },
    {
      title: "Rounding Out",
      description: "Developing a well-rounded approach",
      url: "https://www.youtube.com/embed/srLM8lHPj40?enablejsapi=1",
      editableId: "srLM8lHPj40",
      workshopType: "allstarteams",
      section: "development",
      sortOrder: 4
    },
    {
      title: "Ladder of Well-being",
      description: "Understanding the Well-being Ladder concept",
      url: "https://www.youtube.com/embed/yidsMx8B678?enablejsapi=1",
      editableId: "yidsMx8B678",
      workshopType: "allstarteams",
      section: "wellbeing",
      sortOrder: 5
    },
    {
      title: "Your Future Self",
      description: "Envisioning and planning for your future",
      url: "https://www.youtube.com/embed/_VsH5NO9jyg?enablejsapi=1",
      editableId: "_VsH5NO9jyg",
      workshopType: "allstarteams",
      section: "future",
      sortOrder: 6
    }
  ];

  const imaginalAgilityVideos = [
    // Landing page video
    {
      title: "Landing Page Introduction",
      description: "Main introduction video for the landing page",
      url: "https://www.youtube.com/embed/nFQPqSwzOLw?enablejsapi=1",
      editableId: "nFQPqSwzOLw",
      workshopType: "general",
      section: "home",
      sortOrder: 0
    },

    // Imaginal Agility videos
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