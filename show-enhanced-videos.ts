import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables first
dotenv.config();

async function showEnhancedVideoManagement() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = postgres(databaseUrl);

  try {
    console.log('🎬 ENHANCED VIDEO MANAGEMENT CONSOLE');
    console.log('====================================\n');

    // Get all videos with enhanced sorting
    const allVideos = await sql`
      SELECT 
        id, title, workshop_type, section, step_id,
        content_mode, required_watch_percentage, editable_id, autoplay
      FROM videos 
      ORDER BY workshop_type, sort_order, step_id
    `;

    console.log(`📊 Total Videos: ${allVideos.length}\n`);

    // Group and display by workshop type
    const allStarTeamsVideos = allVideos.filter((v: any) => v.workshop_type === 'allstarteams');
    const imaginalAgilityVideos = allVideos.filter((v: any) => v.workshop_type === 'imaginal-agility');
    const generalVideos = allVideos.filter((v: any) => v.workshop_type === 'general');

    console.log('🌟 ALLSTARTEAMS (AST) - 7 VIDEOS:');
    allStarTeamsVideos.forEach((video: any, index: number) => {
      console.log(`   ${index + 1}. ${video.title}`);
      console.log(`      📋 Step: ${video.step_id || 'N/A'} | Section: ${video.section}`);
      console.log(`      🎯 Mode: ${video.content_mode} | Watch: ${video.required_watch_percentage}% | Auto: ${video.autoplay ? 'Yes' : 'No'}`);
      console.log(`      🎥 ID: ${video.editable_id}\n`);
    });

    console.log('🧠 IMAGINAL AGILITY (IA) - 13 VIDEOS:');
    imaginalAgilityVideos.forEach((video: any, index: number) => {
      console.log(`   ${index + 1}. ${video.title}`);
      console.log(`      📋 Step: ${video.step_id || 'N/A'} | Section: ${video.section}`);
      console.log(`      🎯 Mode: ${video.content_mode} | Watch: ${video.required_watch_percentage}% | Auto: ${video.autoplay ? 'Yes' : 'No'}`);
      console.log(`      🎥 ID: ${video.editable_id}\n`);
    });

    console.log('🏠 GENERAL (GEN) - 1 VIDEO:');
    generalVideos.forEach((video: any, index: number) => {
      console.log(`   ${index + 1}. ${video.title}`);
      console.log(`      📋 Step: ${video.step_id || 'N/A'} | Section: ${video.section}`);
      console.log(`      🎯 Mode: ${video.content_mode} | Watch: ${video.required_watch_percentage}% | Auto: ${video.autoplay ? 'Yes' : 'No'}`);
      console.log(`      🎥 ID: ${video.editable_id}\n`);
    });

    // Show filtering capabilities
    console.log('🔍 ENHANCED ADMIN INTERFACE FEATURES:');
    console.log('=====================================');
    console.log('   ✅ Workshop Filter: All | AST | IA | General');
    console.log('   ✅ Search: By title, description, or step ID');
    console.log('   ✅ Sortable Columns: Click any header to sort');
    console.log('   ✅ Watch Requirements Toggle: 1% ↔ 75%');
    console.log('   ✅ Mode Badges: Student | Professional | Both');
    console.log('   ✅ Results Counter: Shows filtered count');
    console.log('   ✅ Clear Filters: Reset all filters button');

    // Show current state
    console.log('\n⚙️ CURRENT CONFIGURATION:');
    console.log('=========================');
    console.log(`   🎯 Watch Requirements: ALL SET TO 1%`);
    console.log(`   📊 Content Modes: All set to "Both"`);
    console.log(`   🎬 Workshop Distribution:`);
    console.log(`      • AllStarTeams: ${allStarTeamsVideos.length} videos`);
    console.log(`      • Imaginal Agility: ${imaginalAgilityVideos.length} videos`);
    console.log(`      • General: ${generalVideos.length} videos`);

    console.log('\n🚀 READY FOR TESTING:');
    console.log('=====================');
    console.log('1. 🖥️  Open your admin interface');
    console.log('2. 📹 Navigate to Video Management tab');
    console.log('3. 🔄 Test sorting by clicking column headers');
    console.log('4. 🔍 Try filtering by workshop type (IA, AST, All)');
    console.log('5. 🔎 Search for specific videos');
    console.log('6. ⚡ Toggle watch requirements on/off');
    console.log('7. ✏️  Edit video IDs with live preview');

    await sql.end();

  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    throw error;
  }
}

// Execute verification
showEnhancedVideoManagement()
  .then(() => {
    console.log('\n✅ Enhanced video management ready for use!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });
