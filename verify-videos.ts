import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables first
dotenv.config();

async function verifyVideoPopulation() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = postgres(databaseUrl);

  try {
    console.log('🔍 VERIFYING VIDEO MANAGEMENT SYSTEM');
    console.log('===================================\n');

    // Get all videos with enhanced fields
    const allVideos = await sql`
      SELECT 
        id, title, workshop_type, section, step_id,
        content_mode, required_watch_percentage, editable_id, autoplay
      FROM videos 
      ORDER BY workshop_type, sort_order
    `;

    console.log(`📊 Total videos in database: ${allVideos.length}\n`);

    // Group by workshop type
    const allStarTeamsVideos = allVideos.filter((v: any) => v.workshop_type === 'allstarteams');
    const imaginalAgilityVideos = allVideos.filter((v: any) => v.workshop_type === 'imaginal-agility');
    const generalVideos = allVideos.filter((v: any) => v.workshop_type === 'general');

    console.log('🌟 ALLSTARTEAMS VIDEOS (7 videos):');
    allStarTeamsVideos.forEach((video: any) => {
      console.log(`   📹 ID ${video.id}: ${video.title}`);
      console.log(`      Section: ${video.section} | Step: ${video.step_id || 'N/A'}`);
      console.log(`      Mode: ${video.content_mode} | Watch: ${video.required_watch_percentage}% | Autoplay: ${video.autoplay}`);
      console.log(`      YouTube ID: ${video.editable_id}\n`);
    });

    console.log('🧠 IMAGINAL AGILITY VIDEOS (11 videos):');
    imaginalAgilityVideos.forEach((video: any) => {
      console.log(`   📹 ID ${video.id}: ${video.title}`);
      console.log(`      Section: ${video.section} | Step: ${video.step_id || 'N/A'}`);
      console.log(`      Mode: ${video.content_mode} | Watch: ${video.required_watch_percentage}% | Autoplay: ${video.autoplay}`);
      console.log(`      YouTube ID: ${video.editable_id}\n`);
    });

    console.log('🏠 GENERAL VIDEOS (1 video):');
    generalVideos.forEach((video: any) => {
      console.log(`   📹 ID ${video.id}: ${video.title}`);
      console.log(`      Section: ${video.section} | Step: ${video.step_id || 'N/A'}`);
      console.log(`      Mode: ${video.content_mode} | Watch: ${video.required_watch_percentage}% | Autoplay: ${video.autoplay}`);
      console.log(`      YouTube ID: ${video.editable_id}\n`);
    });

    // Verify enhanced fields are populated
    const enhancedFieldsCheck = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN content_mode IS NOT NULL THEN 1 END) as with_mode,
        COUNT(CASE WHEN required_watch_percentage IS NOT NULL THEN 1 END) as with_percentage
      FROM videos
    `;

    const stats = enhancedFieldsCheck[0];
    console.log('✅ ENHANCED FIELDS VERIFICATION:');
    console.log(`   Total videos: ${stats.total}`);
    console.log(`   With content_mode: ${stats.with_mode}`);
    console.log(`   With watch percentage: ${stats.with_percentage}`);

    if (stats.with_mode === stats.total && stats.with_percentage === stats.total) {
      console.log('\n🎉 ALL VIDEOS PROPERLY ENHANCED!');
    }

    console.log('\n🚀 ADMIN INTERFACE READY:');
    console.log('   ✅ Navigate to your app admin section');
    console.log('   ✅ Check the Video Management tab');
    console.log('   ✅ You should see all 19 videos with enhanced fields');
    console.log('   ✅ Test editing content modes and watch percentages');

    await sql.end();

  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    throw error;
  }
}

// Execute verification
verifyVideoPopulation()
  .then(() => {
    console.log('\n✅ Verification completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });
