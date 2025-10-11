import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables first
dotenv.config();

async function troubleshootAdminInterface() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = postgres(databaseUrl);

  try {
    console.log('🔍 TROUBLESHOOTING ADMIN INTERFACE');
    console.log('===================================\n');

    // Check current videos in database
    const videoCount = await sql`SELECT COUNT(*) as count FROM videos`;
    console.log(`📊 Database Status: ${videoCount[0].count} videos found\n`);

    // Check if enhanced fields exist and have data
    const enhancedFields = await sql`
      SELECT 
        content_mode,
        required_watch_percentage,
        COUNT(*) as count
      FROM videos
      GROUP BY content_mode, required_watch_percentage
      ORDER BY content_mode, required_watch_percentage
    `;

    console.log('📋 Enhanced Fields Status:');
    enhancedFields.forEach((row: any) => {
      console.log(`   Mode: ${row.content_mode} | Watch %: ${row.required_watch_percentage} | Count: ${row.count}`);
    });

    // Sample of current video data
    const sampleVideos = await sql`
      SELECT id, title, workshop_type, step_id, content_mode, required_watch_percentage
      FROM videos 
      ORDER BY workshop_type, id
      LIMIT 5
    `;

    console.log('\n📹 Sample Videos (first 5):');
    sampleVideos.forEach((video: any) => {
      console.log(`   ${video.id}: ${video.title} (${video.workshop_type})`);
      console.log(`      Mode: ${video.content_mode} | Watch: ${video.required_watch_percentage}% | Step: ${video.step_id || 'N/A'}`);
    });

    await sql.end();

    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('=========================');
    console.log('1. 🌐 Open your browser to: http://localhost:8080');
    console.log('2. 🔐 Log in with admin credentials');
    console.log('3. 📹 Navigate to Admin → Video Management');
    console.log('4. 🔄 Hard refresh (Ctrl+F5 or Cmd+Shift+R)');
    console.log('5. 🔍 Look for these NEW features:');
    console.log('   • Search bar at the top');
    console.log('   • Workshop filter dropdown (All | AST | IA | General)');
    console.log('   • Watch Requirements toggle switch');
    console.log('   • Clickable column headers for sorting');
    console.log('   • Badge-style workshop types (AST, IA, GEN)');
    console.log('   • Results counter showing "X of Y videos"');
    console.log('\n💡 If you still see the old interface:');
    console.log('   • Clear browser cache');
    console.log('   • Open in incognito/private window');
    console.log('   • Check browser console for errors (F12)');

  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    throw error;
  }
}

// Execute troubleshooting
troubleshootAdminInterface()
  .then(() => {
    console.log('\n✅ Troubleshooting completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Troubleshooting failed:', error);
    process.exit(1);
  });
