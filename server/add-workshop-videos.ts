import { storage } from './storage';

async function addWorkshopVideos() {
  const allStarTeamsVideos = [
    {
      title: "Introduction",
      description: "Welcome to the AllStarTeams workshop",
      url: "https://www.youtube.com/embed/pp2wrqE8r2o?enablejsapi=1&autoplay=1&rel=0",
      editableId: "pp2wrqE8r2o",
      workshopType: "allstarteams",
      section: "introduction",
      stepId: "1-1",
      autoplay: true,
      sortOrder: 1
    },
    {
      title: "Intro to Star Strengths",
      description: "Introduction to understanding your strengths",
      url: "https://www.youtube.com/embed/TN5b8jx7KSI?enablejsapi=1&autoplay=1&rel=0",
      editableId: "TN5b8jx7KSI",
      workshopType: "allstarteams",
      section: "introduction",
      stepId: "2-1",
      autoplay: true,
      sortOrder: 2
    },
    {
      title: "Review Your Star Card",
      description: "Understanding your personal Star Profile",
      url: "https://www.youtube.com/embed/JJWb058M-sY?enablejsapi=1&autoplay=1&rel=0",
      editableId: "JJWb058M-sY",
      workshopType: "allstarteams",
      section: "assessment",
      stepId: "2-3",
      autoplay: true,
      sortOrder: 4
    },
    {
      title: "Intro to Flow",
      description: "Introduction to Flow concepts",
      url: "https://www.youtube.com/embed/6szJ9q_g87E?enablejsapi=1&autoplay=1&rel=0",
      editableId: "6szJ9q_g87E",
      workshopType: "allstarteams",
      section: "flow",
      stepId: "3-1",
      autoplay: true,
      sortOrder: 6
    },
    {
      title: "Rounding Out",
      description: "Developing a well-rounded approach",
      url: "https://www.youtube.com/embed/BBAx5dNZw6Y?enablejsapi=1&autoplay=1&rel=0",
      editableId: "BBAx5dNZw6Y",
      workshopType: "allstarteams",
      section: "development",
      stepId: "3-3",
      autoplay: true,
      sortOrder: 8
    },
    {
      title: "Ladder of Well-being",
      description: "Understanding the Well-being Ladder concept",
      url: "https://www.youtube.com/embed/SjEfwPEl65U?enablejsapi=1&autoplay=1&rel=0",
      editableId: "SjEfwPEl65U",
      workshopType: "allstarteams",
      section: "wellbeing",
      stepId: "4-1",
      autoplay: true,
      sortOrder: 10
    },
    {
      title: "Your Future Self",
      description: "Envisioning and planning for your future",
      url: "https://www.youtube.com/embed/N9uCPe3xF5A?enablejsapi=1&autoplay=1&rel=0",
      editableId: "N9uCPe3xF5A",
      workshopType: "allstarteams",
      section: "future",
      stepId: "4-4",
      autoplay: true,
      sortOrder: 13
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

    // Imaginal Agility step-specific videos
    {
      title: "Introduction to Imaginal Agility",
      description: "Welcome to the Imaginal Agility workshop",
      url: "https://www.youtube.com/embed/k3mDEAbUwZ4?enablejsapi=1&autoplay=1&rel=0",
      editableId: "k3mDEAbUwZ4",
      workshopType: "imaginal-agility",
      section: "introduction",
      stepId: "ia-1-1",
      autoplay: true,
      sortOrder: 1
    },
    {
      title: "The Triple Challenge",
      description: "Understanding the AI Triple Challenge",
      url: "https://www.youtube.com/embed/EsExXeKFiKg?enablejsapi=1&autoplay=1&rel=0",
      editableId: "EsExXeKFiKg",
      workshopType: "imaginal-agility",
      section: "challenge",
      stepId: "ia-2-1",
      autoplay: true,
      sortOrder: 2
    },
    {
      title: "Imaginal Agility Solution",
      description: "Core solution framework",
      url: "https://www.youtube.com/embed/l3XVwPGE6UY?enablejsapi=1&autoplay=1&rel=0",
      editableId: "l3XVwPGE6UY",
      workshopType: "imaginal-agility",
      section: "solution",
      stepId: "ia-3-1",
      autoplay: true,
      sortOrder: 3
    },
    {
      title: "Teamwork Preparation",
      description: "Preparing for effective teamwork using imagination",
      url: "https://www.youtube.com/embed/hOV2zaWVxeU?enablejsapi=1&autoplay=1&rel=0",
      editableId: "hOV2zaWVxeU",
      workshopType: "imaginal-agility",
      section: "teamwork",
      stepId: "ia-5-1",
      autoplay: true,
      sortOrder: 5
    },
    {
      title: "Teamwork Preparation",
      description: "Preparing for effective teamwork using imagination",
      url: "https://www.youtube.com/embed/hOV2zaWVxeU?enablejsapi=1&autoplay=1&rel=0",
      editableId: "hOV2zaWVxeU",
      workshopType: "imaginal-agility",
      section: "teamwork",
      stepId: "ia-6-1",
      autoplay: true,
      sortOrder: 6
    },
    {
      title: "Discernment Guide",
      description: "Developing discernment in AI collaboration",
      url: "https://www.youtube.com/embed/U7pQjMYKk_s?enablejsapi=1&autoplay=1&rel=0",
      editableId: "U7pQjMYKk_s",
      workshopType: "imaginal-agility",
      section: "discernment",
      stepId: "ia-7-1",
      autoplay: true,
      sortOrder: 7
    },
    {
      title: "The Neuroscience",
      description: "Understanding the neuroscience of imagination",
      url: "https://www.youtube.com/embed/43Qs7OvToeI?enablejsapi=1&autoplay=1&rel=0",
      editableId: "43Qs7OvToeI",
      workshopType: "imaginal-agility",
      section: "neuroscience",
      stepId: "ia-8-1",
      autoplay: true,
      sortOrder: 8
    },

    // General Imaginal Agility videos (without stepId)
    {
      title: "IAWS Orientation Video",
      description: "Introduction to the Imaginal Agility workshop",
      url: "https://www.youtube.com/embed/1Belekdly70?enablejsapi=1",
      editableId: "1Belekdly70", 
      workshopType: "imaginal-agility",
      section: "introduction",
      sortOrder: 10
    },
    {
      title: "AI Triple Challenge",
      description: "Understanding the challenges ahead",
      url: "https://www.youtube.com/embed/zIFGKPMN9t8?enablejsapi=1",
      editableId: "zIFGKPMN9t8",
      workshopType: "imaginal-agility", 
      section: "workshop",
      sortOrder: 11
    },
    {
      title: "Imaginal Agility Solution",
      description: "Core solution framework",
      url: "https://www.youtube.com/embed/BLh502BlZLE?enablejsapi=1",
      editableId: "BLh502BlZLE",
      workshopType: "imaginal-agility",
      section: "workshop",
      sortOrder: 12
    },
    {
      title: "5 Capabilities (5Cs)",
      description: "Guide to the five core capabilities",
      url: "https://www.youtube.com/embed/8wXSL3om6Ig?enablejsapi=1",
      editableId: "8wXSL3om6Ig",
      workshopType: "imaginal-agility",
      section: "assessment",
      sortOrder: 13
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