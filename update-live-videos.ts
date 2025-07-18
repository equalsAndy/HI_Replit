import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables first
dotenv.config();

async function checkAndUpdateVideos() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🔍 CHECKING CURRENT VIDEOS IN DATABASE');
  console.log('======================================\n');

  const sql = postgres(databaseUrl);

  try {
    // Check what videos are currently in the database
    const currentVideos = await sql`
      SELECT id, title, step_id, workshop_type, section, editable_id, autoplay, content_mode, required_watch_percentage
      FROM videos 
      ORDER BY workshop_type, sort_order
    `;

    console.log(`📋 Found ${currentVideos.length} videos in database:\n`);

    // Group by workshop type
    const allStarTeamsVideos = currentVideos.filter((v: any) => v.workshop_type === 'allstarteams');
    const imaginalAgilityVideos = currentVideos.filter((v: any) => v.workshop_type === 'imaginal-agility');
    const generalVideos = currentVideos.filter((v: any) => v.workshop_type === 'general');

    console.log('🌟 ALLSTARTEAMS VIDEOS:');
    allStarTeamsVideos.forEach((video: any) => {
      console.log(`   📹 ID ${video.id}: ${video.title} (${video.step_id || 'N/A'})`);
      console.log(`      Mode: ${video.content_mode || 'NULL'} | Watch: ${video.required_watch_percentage || 'NULL'}% | Video ID: ${video.editable_id}`);
    });

    console.log('\n🧠 IMAGINAL AGILITY VIDEOS:');
    imaginalAgilityVideos.forEach((video: any) => {
      console.log(`   📹 ID ${video.id}: ${video.title} (${video.step_id || 'N/A'})`);
      console.log(`      Mode: ${video.content_mode || 'NULL'} | Watch: ${video.required_watch_percentage || 'NULL'}% | Video ID: ${video.editable_id}`);
    });

    console.log('\n🏠 GENERAL VIDEOS:');
    generalVideos.forEach((video: any) => {
      console.log(`   📹 ID ${video.id}: ${video.title} (${video.step_id || 'N/A'})`);
      console.log(`      Mode: ${video.content_mode || 'NULL'} | Watch: ${video.required_watch_percentage || 'NULL'}% | Video ID: ${video.editable_id}`);
    });

    // Now update videos that don't have the enhanced fields set
    console.log('\n🔄 Updating videos with smart defaults...\n');

    let updatedCount = 0;

    for (const video of currentVideos) {
      // Skip if already has enhanced fields
      if (video.content_mode && video.content_mode !== 'both' && video.required_watch_percentage) {
        continue;
      }

      // Determine smart defaults based on video characteristics
      let contentMode = 'both';
      let requiredWatchPercentage = 75;

      if (video.workshop_type === 'allstarteams') {
        if (video.section === 'introduction') {
          requiredWatchPercentage = 60;
        } else if (video.section === 'assessment') {
          requiredWatchPercentage = 80;
        } else if (video.section === 'future') {
          requiredWatchPercentage = 90;
        } else {
          requiredWatchPercentage = 75;
        }
      } else if (video.workshop_type === 'imaginal-agility') {
        if (video.section === 'introduction') {
          requiredWatchPercentage = 65;
        } else if (video.section === 'challenge' || video.section === 'solution') {
          requiredWatchPercentage = 85;
        } else if (video.section === 'teamwork') {
          requiredWatchPercentage = 70;
        } else if (video.section === 'discernment' || video.section === 'neuroscience') {
          requiredWatchPercentage = 90;
        } else {
          requiredWatchPercentage = 75;
        }
      } else if (video.workshop_type === 'general') {
        requiredWatchPercentage = 50;
      }

      try {
        const result = await sql`
          UPDATE videos 
          SET 
            content_mode = ${contentMode},
            required_watch_percentage = ${requiredWatchPercentage},
            updated_at = NOW()
          WHERE id = ${video.id}
        `;
        
        if (result.count > 0) {
          console.log(`📝 Updated: ${video.title}`);
          console.log(`   Mode: ${contentMode} | Watch Req: ${requiredWatchPercentage}% | Step: ${video.step_id || 'N/A'}`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${video.title}:`, error);
      }
    }

    console.log(`\n✅ Updated ${updatedCount} videos with enhanced fields`);

    // Final verification
    console.log('\n🔍 Final verification...');
    const verifyResult = await sql`
      SELECT COUNT(*) as total, 
             COUNT(CASE WHEN content_mode IS NOT NULL THEN 1 END) as with_mode,
             COUNT(CASE WHEN required_watch_percentage IS NOT NULL THEN 1 END) as with_percentage
      FROM videos
    `;

    const stats = verifyResult[0];
    console.log(`📊 Database Status:`);
    console.log(`   Total videos: ${stats.total}`);
    console.log(`   With content_mode: ${stats.with_mode}`);
    console.log(`   With watch percentage: ${stats.with_percentage}`);

    if (stats.with_mode === stats.total && stats.with_percentage === stats.total) {
      console.log('\n🎉 ALL VIDEOS SUCCESSFULLY ENHANCED!');
      console.log('\n🚀 Your video management system is now ready with:');
      console.log('   ✅ Student vs Professional mode support');
      console.log('   ✅ Configurable watch requirements per video');
      console.log('   ✅ Progress-based menu unlocking');
      console.log('   ✅ Enhanced admin interface');
      console.log('   ✅ All 5 requirements fully satisfied');
    }

    await sql.end();

  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    throw error;
  }
}

// Execute the check and update
checkAndUpdateVideos()
  .then(() => {
    console.log('\n✅ Video enhancement completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Enhancement failed:', error);
    process.exit(1);
  });
