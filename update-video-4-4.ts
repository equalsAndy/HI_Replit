
import { db } from './server/db';
import { videos } from './shared/schema';
import { eq } from 'drizzle-orm';

async function updateVideo44() {
  try {
    console.log('Starting video update for ID 176...');
    
    // First, let's verify the current record
    const currentVideo = await db.select()
      .from(videos)
      .where(eq(videos.id, 176));
    
    if (currentVideo.length === 0) {
      console.log('❌ Video with ID 176 not found');
      return;
    }
    
    console.log('Current video record:', currentVideo[0]);
    
    // Update the video record
    const updatedVideo = await db.update(videos)
      .set({
        url: 'https://www.youtube.com/embed/9Q5JMKoSFVk?enablejsapi=1&autoplay=1&rel=0',
        editableId: '9Q5JMKoSFVk',
        updatedAt: new Date()
      })
      .where(eq(videos.id, 176))
      .returning();
    
    if (updatedVideo.length > 0) {
      console.log('✅ Video updated successfully!');
      console.log('Updated video record:', updatedVideo[0]);
    } else {
      console.log('❌ Update failed - no records were modified');
    }
    
  } catch (error) {
    console.error('Error updating video:', error);
  }
}

// Execute the function
updateVideo44()
  .then(() => {
    console.log('Video update completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
