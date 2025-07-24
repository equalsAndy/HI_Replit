#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables first
dotenv.config();

async function setAllVideosTo1Percent() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = postgres(databaseUrl);
  console.log('🎯 Setting all videos to 1% watch requirement...');
  
  try {
    // Update all videos to 1% watch requirement
    const result = await sql`
      UPDATE videos 
      SET required_watch_percentage = 1, 
          updated_at = NOW()
      WHERE required_watch_percentage != 1 OR required_watch_percentage IS NULL
    `;
    
    console.log(`✅ Updated ${result.count} videos to 1% watch requirement`);
    
    // Show current state
    const allVideos = await sql`
      SELECT 
        title, 
        step_id, 
        workshop_type, 
        required_watch_percentage
      FROM videos 
      ORDER BY workshop_type, step_id
    `;
    
    console.log('\n📋 Current Video Watch Requirements:');
    console.log('=====================================');
    
    const astVideos = allVideos.filter((v: any) => v.workshop_type === 'allstarteams');
    const iaVideos = allVideos.filter((v: any) => v.workshop_type === 'imaginal-agility');
    const genVideos = allVideos.filter((v: any) => v.workshop_type === 'general');
    
    console.log('\n🌟 ALLSTARTEAMS VIDEOS:');
    astVideos.forEach((video: any) => {
      console.log(`   ${video.step_id || 'N/A'}: ${video.title} - ${video.required_watch_percentage}%`);
    });
    
    console.log('\n🧠 IMAGINAL AGILITY VIDEOS:');
    iaVideos.forEach((video: any) => {
      console.log(`   ${video.step_id || 'N/A'}: ${video.title} - ${video.required_watch_percentage}%`);
    });
    
    if (genVideos.length > 0) {
      console.log('\n🏠 GENERAL VIDEOS:');
      genVideos.forEach((video: any) => {
        console.log(`   ${video.step_id || 'N/A'}: ${video.title} - ${video.required_watch_percentage}%`);
      });
    }
    
    console.log('\n🎉 All videos now require only 1% watch time to unlock next step!');
    console.log('🔧 Next: Update admin interface to use text input instead of slider');
    
  } catch (error) {
    console.error('❌ Error updating videos:', error);
  } finally {
    await sql.end();
  }
}

// Run the function
setAllVideosTo1Percent();
