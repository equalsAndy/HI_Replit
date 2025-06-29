import { db } from './db';
import { videos } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

async function updateStep44Video() {
  try {
    console.log('🎥 Updating step 4-4 video...');
    
    // New video details
    const newVideoId = '9Q5JMKoSFVk';
    const newUrl = `https://www.youtube.com/embed/${newVideoId}?enablejsapi=1&autoplay=1&rel=0`;
    
    console.log(`New video ID: ${newVideoId}`);
    console.log(`New URL: ${newUrl}`);
    
    // Find the existing video for step 4-4
    const existingVideo = await db
      .select()
      .from(videos)
      .where(
        and(
          eq(videos.stepId, '4-4'),
          eq(videos.workshopType, 'allstarteams')
        )
      );
    
    if (existingVideo.length === 0) {
      console.log('❌ No video found for step 4-4. Creating new record...');
      
      // Create new video record
      const newVideo = await db.insert(videos).values({
        title: "Your Future Self",
        description: "Envisioning and planning for your future",
        url: newUrl,
        editableId: newVideoId,
        workshopType: "allstarteams",
        section: "future",
        stepId: "4-4",
        autoplay: true,
        sortOrder: 13,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      console.log('✅ Created new video record:', newVideo[0]);
    } else {
      console.log('📹 Found existing video:', existingVideo[0]);
      console.log(`Current video ID: ${existingVideo[0].editableId}`);
      
      // Update existing video
      const updatedVideo = await db
        .update(videos)
        .set({
          url: newUrl,
          editableId: newVideoId,
          updatedAt: new Date()
        })
        .where(eq(videos.id, existingVideo[0].id))
        .returning();
      
      console.log('✅ Updated video successfully:', updatedVideo[0]);
    }
    
    // Verify the update
    const verifyVideo = await db
      .select()
      .from(videos)
      .where(
        and(
          eq(videos.stepId, '4-4'),
          eq(videos.workshopType, 'allstarteams')
        )
      );
    
    console.log('🔍 Verification - Current video record:');
    console.log(`- Title: ${verifyVideo[0].title}`);
    console.log(`- Video ID: ${verifyVideo[0].editableId}`);
    console.log(`- URL: ${verifyVideo[0].url}`);
    console.log(`- Step ID: ${verifyVideo[0].stepId}`);
    console.log(`- Workshop: ${verifyVideo[0].workshopType}`);
    
    console.log('🎉 Step 4-4 video update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating step 4-4 video:', error);
    throw error;
  }
}

// Export for use
export { updateStep44Video };

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateStep44Video()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}