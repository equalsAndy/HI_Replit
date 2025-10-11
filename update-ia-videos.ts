import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Updated IA video mappings extracted from content mapping
const iaVideoUpdates = [
  // From YouTube links in the content mapping
  { step_id: "ia-3-4", title: "Higher Purpose Reflection", youtube_id: "Kjy3lBW06Gs" },
  { step_id: "ia-3-5", title: "Inspiration Moments", youtube_id: "vGIYaL7jTJo" }, 
  { step_id: "ia-3-6", title: "The Unimaginable", youtube_id: "F1qGAW4OofQ" },
  
  // Placeholder videos (keeping existing as fallback)
  { step_id: "ia-4-1", title: "Advanced Ladder Overview", youtube_id: "7__r4FVj-EI" },
  { step_id: "ia-4-2", title: "Autoflow Mindful Prompts", youtube_id: "7__r4FVj-EI" },
  { step_id: "ia-4-3", title: "Visualization Stretch", youtube_id: "7__r4FVj-EI" },
  { step_id: "ia-4-4", title: "Higher Purpose Uplift", youtube_id: "7__r4FVj-EI" },
  { step_id: "ia-4-5", title: "Inspiration Support", youtube_id: "7__r4FVj-EI" },
  { step_id: "ia-4-6", title: "Nothing is Unimaginable", youtube_id: "7__r4FVj-EI" },
  
  // Additional sections from content mapping
  { step_id: "ia-5-1", title: "HaiQ", youtube_id: "7__r4FVj-EI" },
  { step_id: "ia-5-2", title: "ROI 2.0", youtube_id: "7__r4FVj-EI" },
  { step_id: "ia-5-3", title: "Course Completion Badge", youtube_id: "7__r4FVj-EI" },
  { step_id: "ia-5-4", title: "Imaginal Agility Compendium", youtube_id: "7__r4FVj-EI" },
  { step_id: "ia-5-5", title: "Community of Practice", youtube_id: "7__r4FVj-EI" },
  
  { step_id: "ia-6-1", title: "Quarterly Orientation", youtube_id: "7__r4FVj-EI" },
  { step_id: "ia-6-2", title: "Quarterly Practices", youtube_id: "7__r4FVj-EI" },
  
  { step_id: "ia-7-1", title: "The Neuroscience of Imagination", youtube_id: "7__r4FVj-EI" },
  { step_id: "ia-7-2", title: "About Heliotrope Imaginal", youtube_id: "7__r4FVj-EI" }
];

// New videos to add based on content mapping
const newIAVideos = [
  // I4C Model Section
  { 
    title: "I4C Prism Overview", 
    description: "Understanding the I4C model and five core capabilities",
    step_id: "ia-2-1", 
    section: "i4c-model",
    sort_order: 20,
    youtube_id: "7__r4FVj-EI", // Placeholder - needs actual video
    workshop_type: "imaginal-agility",
    autoplay: true
  },
  
  // Ladder of Imagination Section - Real Videos
  {
    title: "Ladder Overview",
    description: "Introduction to the five modes of imagination",
    step_id: "ia-3-1",
    section: "ladder",
    sort_order: 21,
    youtube_id: "7__r4FVj-EI", // Placeholder - needs actual video from IAWS SOLO I4C LADDER.mp4
    workshop_type: "imaginal-agility",
    autoplay: true
  },
  {
    title: "Autoflow Practice",
    description: "Developing awareness of Autoflow thinking",
    step_id: "ia-3-2",
    section: "ladder",
    sort_order: 22,
    youtube_id: "7__r4FVj-EI", // Placeholder - needs actual video from IAWS SOLO AUTOFLOW V.mp4
    workshop_type: "imaginal-agility",
    autoplay: true
  },
  {
    title: "Visualization Exercise",
    description: "Visualizing your potential through symbolic insight",
    step_id: "ia-3-3",
    section: "ladder",
    sort_order: 23,
    youtube_id: "7__r4FVj-EI", // Placeholder - needs actual video from IAWS SOLO VISUALIZAT.mp4
    workshop_type: "imaginal-agility",
    autoplay: true
  }
];

function generateEmbedUrl(videoId: string, autoplay: boolean = false): string {
  const autoplayParam = autoplay ? '&autoplay=1' : '';
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0${autoplayParam}`;
}

async function updateVideoManagement() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = postgres(databaseUrl);

  try {
    console.log('🎬 UPDATING VIDEO MANAGEMENT SYSTEM');
    console.log('=====================================\n');

    // Step 1: Set all watch requirements to 1%
    console.log('🔄 Setting all watch requirements to 1%...\n');
    
    const watchUpdateResult = await sql`
      UPDATE videos 
      SET required_watch_percentage = 1
      WHERE required_watch_percentage != 1
    `;
    
    console.log(`✅ Updated ${watchUpdateResult.count} videos to 1% watch requirement\n`);

    // Step 2: Update existing IA videos with new YouTube IDs
    console.log('🔄 Updating existing IA videos with new YouTube IDs...\n');
    
    let updatedCount = 0;
    for (const update of iaVideoUpdates) {
      try {
        const newUrl = generateEmbedUrl(update.youtube_id, true);
        
        const result = await sql`
          UPDATE videos 
          SET 
            editable_id = ${update.youtube_id},
            url = ${newUrl},
            updated_at = NOW()
          WHERE step_id = ${update.step_id} 
          AND workshop_type = 'imaginal-agility'
        `;
        
        if (result.count > 0) {
          console.log(`📝 Updated ${update.step_id}: ${update.title} → ${update.youtube_id}`);
          updatedCount++;
        } else {
          console.log(`ℹ️  No video found for ${update.step_id} - ${update.title}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${update.step_id}:`, error);
      }
    }

    console.log(`\n✅ Updated ${updatedCount} existing IA videos\n`);

    // Step 3: Add new IA videos
    console.log('🆕 Adding new IA videos from content mapping...\n');
    
    let createdCount = 0;
    for (const newVideo of newIAVideos) {
      try {
        // Check if video already exists
        const existing = await sql`
          SELECT id FROM videos 
          WHERE step_id = ${newVideo.step_id} 
          AND workshop_type = ${newVideo.workshop_type}
        `;

        if (existing.length === 0) {
          const embedUrl = generateEmbedUrl(newVideo.youtube_id, newVideo.autoplay);
          
          await sql`
            INSERT INTO videos (
              title, description, url, editable_id, workshop_type, 
              section, step_id, autoplay, sort_order, content_mode, 
              required_watch_percentage, created_at, updated_at
            ) VALUES (
              ${newVideo.title},
              ${newVideo.description},
              ${embedUrl},
              ${newVideo.youtube_id},
              ${newVideo.workshop_type},
              ${newVideo.section},
              ${newVideo.step_id},
              ${newVideo.autoplay},
              ${newVideo.sort_order},
              'both',
              1,
              NOW(),
              NOW()
            )
          `;
          
          console.log(`✨ Created: ${newVideo.step_id} - ${newVideo.title}`);
          createdCount++;
        } else {
          console.log(`ℹ️  Video already exists: ${newVideo.step_id} - ${newVideo.title}`);
        }
      } catch (error) {
        console.error(`❌ Error creating ${newVideo.step_id}:`, error);
      }
    }

    console.log(`\n✅ Created ${createdCount} new IA videos\n`);

    // Step 4: Summary and verification
    console.log('📊 FINAL SUMMARY');
    console.log('================\n');

    const allVideos = await sql`
      SELECT 
        workshop_type,
        COUNT(*) as count,
        AVG(required_watch_percentage) as avg_watch_req
      FROM videos 
      GROUP BY workshop_type
      ORDER BY workshop_type
    `;

    allVideos.forEach((row: any) => {
      console.log(`   ${row.workshop_type}: ${row.count} videos (avg watch: ${Math.round(row.avg_watch_req)}%)`);
    });

    const iaVideos = await sql`
      SELECT step_id, title, editable_id, required_watch_percentage
      FROM videos 
      WHERE workshop_type = 'imaginal-agility'
      ORDER BY step_id
    `;

    console.log('\n🧠 IMAGINAL AGILITY VIDEOS:');
    iaVideos.forEach((video: any) => {
      console.log(`   ${video.step_id}: ${video.title} (${video.editable_id}) - ${video.required_watch_percentage}%`);
    });

    console.log('\n🎉 VIDEO MANAGEMENT SYSTEM UPDATED!');
    console.log('\n🚀 Enhanced Features Active:');
    console.log('   ✅ All videos set to 1% watch requirement');
    console.log('   ✅ IA videos updated with content mapping IDs');
    console.log('   ✅ New IA content structure added');
    console.log('   ✅ Admin interface ready for testing');
    console.log('   ✅ Sortable and filterable video list');

    await sql.end();

  } catch (error) {
    console.error('❌ Update failed:', error);
    await sql.end();
    throw error;
  }
}

// Execute the update
updateVideoManagement()
  .then(() => {
    console.log('\nUpdate completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Update failed:', error);
    process.exit(1);
  });
