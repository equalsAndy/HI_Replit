import { db } from './server/db';
import { videos } from './shared/schema';

async function addVideoManagementFields() {
  try {
    console.log('🎬 Adding video management enhancement fields...');

    // Add content_mode column (student, professional, both)
    await db.execute(`
      ALTER TABLE videos 
      ADD COLUMN IF NOT EXISTS content_mode VARCHAR(20) DEFAULT 'both' NOT NULL
    `);
    console.log('✅ Added content_mode column');

    // Add required_watch_percentage column  
    await db.execute(`
      ALTER TABLE videos 
      ADD COLUMN IF NOT EXISTS required_watch_percentage INTEGER DEFAULT 75 NOT NULL
    `);
    console.log('✅ Added required_watch_percentage column');

    // Verify the changes by querying existing videos
    const sampleVideos = await db.select().from(videos).limit(1);
    
    if (sampleVideos.length > 0) {
      console.log('🔍 Sample video with new fields:', {
        id: sampleVideos[0].id,
        title: sampleVideos[0].title,
        contentMode: (sampleVideos[0] as any).contentMode || 'both',
        requiredWatchPercentage: (sampleVideos[0] as any).requiredWatchPercentage || 75
      });
    }

    console.log('🎉 Video management enhancement migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Execute the migration
addVideoManagementFields()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
