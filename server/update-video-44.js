import { storage } from './storage';

async function updateStep44Video() {
  try {
    console.log('🎥 Updating step 4-4 video...');
    
    // New video details
    const newVideoId = '9Q5JMKoSFVk';
    const newUrl = `https://www.youtube.com/embed/${newVideoId}?enablejsapi=1&autoplay=1&rel=0`;
    
    console.log(`New video ID: ${newVideoId}`);
    console.log(`New URL: ${newUrl}`);
    
    // Get all AllStarTeams videos
    const allstarVideos = await storage.getVideosByWorkshop('allstarteams');
    console.log(`Found ${allstarVideos.length} AllStarTeams videos`);
    
    // Find the step 4-4 video
    const step44Video = allstarVideos.find(video => video.stepId === '4-4');
    
    if (!step44Video) {
      console.log('❌ No video found for step 4-4. Creating new record...');
      
      // Create new video record
      const newVideo = await storage.createVideo({
        title: \"Your Future Self\",
        description: \"Envisioning and planning for your future\",
        url: newUrl,
        editableId: newVideoId,
        workshopType: \"allstarteams\",
        section: \"future\",
        stepId: \"4-4\",
        autoplay: true,
        sortOrder: 13
      });
      
      console.log('✅ Created new video record:', newVideo);
    } else {
      console.log('📹 Found existing video:', {
        id: step44Video.id,
        title: step44Video.title,
        currentVideoId: step44Video.editableId,
        currentUrl: step44Video.url
      });
      
      // Update existing video
      const updatedVideo = await storage.updateVideo(step44Video.id, {
        url: newUrl,
        editableId: newVideoId
      });
      
      console.log('✅ Updated video successfully:', updatedVideo);
    }
    
    // Verify the update
    const verifyVideos = await storage.getVideosByWorkshop('allstarteams');
    const verifyVideo = verifyVideos.find(video => video.stepId === '4-4');
    
    if (verifyVideo) {
      console.log('🔍 Verification - Current video record:');
      console.log(`- Title: ${verifyVideo.title}`);
      console.log(`- Video ID: ${verifyVideo.editableId}`);
      console.log(`- URL: ${verifyVideo.url}`);
      console.log(`- Step ID: ${verifyVideo.stepId}`);
      console.log(`- Workshop: ${verifyVideo.workshopType}`);
    }
    
    console.log('🎉 Step 4-4 video update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating step 4-4 video:', error);
    throw error;
  }
}

// Run the update
updateStep44Video()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });