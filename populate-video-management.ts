import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Video data from your live database
const existingVideos = [
  { id: 170, title: "Introduction", description: "Welcome to the AllStarTeams workshop", url: "https://www.youtube.com/embed/pp2wrqE8r2o?enablejsapi=1&autoplay=1&rel=0", workshop_type: "allstarteams", section: "introduction", sort_order: 1, editable_id: "pp2wrqE8r2o", step_id: "1-1", autoplay: true },
  { id: 171, title: "Intro to Star Strengths", description: "Introduction to understanding your strengths", url: "https://www.youtube.com/embed/TN5b8jx7KSI?enablejsapi=1&autoplay=1&rel=0", workshop_type: "allstarteams", section: "introduction", sort_order: 2, editable_id: "TN5b8jx7KSI", step_id: "2-1", autoplay: true },
  { id: 172, title: "Review Your Star Card", description: "Understanding your personal Star Profile", url: "https://www.youtube.com/embed/JJWb058M-sY?enablejsapi=1&autoplay=1&rel=0", workshop_type: "allstarteams", section: "assessment", sort_order: 4, editable_id: "JJWb058M-sY", step_id: "2-3", autoplay: true },
  { id: 173, title: "Intro to Flow", description: "Introduction to Flow concepts", url: "https://www.youtube.com/embed/6szJ9q_g87E?enablejsapi=1&autoplay=1&rel=0", workshop_type: "allstarteams", section: "flow", sort_order: 6, editable_id: "6szJ9q_g87E", step_id: "3-1", autoplay: true },
  { id: 174, title: "Rounding Out", description: "Developing a well-rounded approach", url: "https://www.youtube.com/embed/BBAx5dNZw6Y?enablejsapi=1&autoplay=1&rel=0", workshop_type: "allstarteams", section: "development", sort_order: 8, editable_id: "BBAx5dNZw6Y", step_id: "3-3", autoplay: true },
  { id: 175, title: "Ladder of Well-being", description: "Understanding the Well-being Ladder concept", url: "https://www.youtube.com/embed/SjEfwPEl65U?enablejsapi=1&autoplay=1&rel=0", workshop_type: "allstarteams", section: "wellbeing", sort_order: 10, editable_id: "SjEfwPEl65U", step_id: "4-1", autoplay: true },
  { id: 176, title: "Your Future Self", description: "Envisioning and planning for your future", url: "https://www.youtube.com/embed/9Q5JMKoSFVk?enablejsapi=1&autoplay=1&rel=0", workshop_type: "allstarteams", section: "future", sort_order: 13, editable_id: "9Q5JMKoSFVk", step_id: "4-4", autoplay: true },
  { id: 177, title: "Landing Page Introduction", description: "Main introduction video for the landing page", url: "https://www.youtube.com/embed/nFQPqSwzOLw?enablejsapi=1", workshop_type: "general", section: "home", sort_order: 0, editable_id: "nFQPqSwzOLw", step_id: null, autoplay: false },
  { id: 178, title: "Introduction to Imaginal Agility", description: "Welcome to the Imaginal Agility workshop", url: "https://www.youtube.com/embed/k3mDEAbUwZ4?enablejsapi=1&autoplay=1&rel=0", workshop_type: "imaginal-agility", section: "introduction", sort_order: 1, editable_id: "k3mDEAbUwZ4", step_id: "ia-1-1", autoplay: true },
  { id: 179, title: "The Triple Challenge", description: "Understanding the AI Triple Challenge", url: "https://www.youtube.com/embed/EsExXeKFiKg?enablejsapi=1&autoplay=1&rel=0", workshop_type: "imaginal-agility", section: "challenge", sort_order: 2, editable_id: "EsExXeKFiKg", step_id: "ia-2-1", autoplay: true },
  { id: 180, title: "Imaginal Agility Solution", description: "Core solution framework", url: "https://www.youtube.com/embed/l3XVwPGE6UY?enablejsapi=1&autoplay=1&rel=0", workshop_type: "imaginal-agility", section: "solution", sort_order: 3, editable_id: "l3XVwPGE6UY", step_id: "ia-3-1", autoplay: true },
  { id: 181, title: "Teamwork Preparation", description: "Preparing for effective teamwork using imagination", url: "https://www.youtube.com/embed/hOV2zaWVxeU?enablejsapi=1&autoplay=1&rel=0", workshop_type: "imaginal-agility", section: "teamwork", sort_order: 5, editable_id: "hOV2zaWVxeU", step_id: "ia-5-1", autoplay: true },
  { id: 182, title: "Teamwork Preparation", description: "Preparing for effective teamwork using imagination", url: "https://www.youtube.com/embed/hOV2zaWVxeU?enablejsapi=1&autoplay=1&rel=0", workshop_type: "imaginal-agility", section: "teamwork", sort_order: 6, editable_id: "hOV2zaWVxeU", step_id: "ia-6-1", autoplay: true },
  { id: 183, title: "Discernment Guide", description: "Developing discernment in AI collaboration", url: "https://www.youtube.com/embed/U7pQjMYKk_s?enablejsapi=1&autoplay=1&rel=0", workshop_type: "imaginal-agility", section: "discernment", sort_order: 7, editable_id: "U7pQjMYKk_s", step_id: "ia-7-1", autoplay: true },
  { id: 184, title: "The Neuroscience", description: "Understanding the neuroscience of imagination", url: "https://www.youtube.com/embed/43Qs7OvToeI?enablejsapi=1&autoplay=1&rel=0", workshop_type: "imaginal-agility", section: "neuroscience", sort_order: 8, editable_id: "43Qs7OvToeI", step_id: "ia-8-1", autoplay: true },
  { id: 185, title: "IAWS Orientation Video", description: "Introduction to the Imaginal Agility workshop", url: "https://www.youtube.com/embed/1Belekdly70?enablejsapi=1", workshop_type: "imaginal-agility", section: "introduction", sort_order: 10, editable_id: "1Belekdly70", step_id: null, autoplay: false },
  { id: 186, title: "AI Triple Challenge", description: "Understanding the challenges ahead", url: "https://www.youtube.com/embed/zIFGKPMN9t8?enablejsapi=1", workshop_type: "imaginal-agility", section: "workshop", sort_order: 11, editable_id: "zIFGKPMN9t8", step_id: null, autoplay: false },
  { id: 187, title: "Imaginal Agility Solution", description: "Core solution framework", url: "https://www.youtube.com/embed/BLh502BlZLE?enablejsapi=1", workshop_type: "imaginal-agility", section: "workshop", sort_order: 12, editable_id: "BLh502BlZLE", step_id: null, autoplay: false },
  { id: 188, title: "5 Capabilities (5Cs)", description: "Guide to the five core capabilities", url: "https://www.youtube.com/embed/8wXSL3om6Ig?enablejsapi=1", workshop_type: "imaginal-agility", section: "assessment", sort_order: 13, editable_id: "8wXSL3om6Ig", step_id: null, autoplay: false }
];

function getSmartDefaults(video: any) {
  const { workshop_type, section, step_id, title } = video;
  
  // Determine content mode based on video characteristics
  let contentMode = 'both'; // Default for most videos
  let requiredWatchPercentage = 75; // Default watch requirement
  
  // AllStarTeams workshop logic
  if (workshop_type === 'allstarteams') {
    if (section === 'introduction') {
      // Introduction videos - easier requirements
      contentMode = 'both';
      requiredWatchPercentage = 60;
    } else if (section === 'assessment') {
      // Assessment videos - higher requirements for professionals
      contentMode = 'both';
      requiredWatchPercentage = 80;
    } else if (section === 'future') {
      // Future Self video - high engagement needed
      contentMode = 'both';
      requiredWatchPercentage = 90;
    } else {
      // Flow, development, wellbeing - standard requirements
      contentMode = 'both';
      requiredWatchPercentage = 75;
    }
  }
  
  // Imaginal Agility workshop logic
  else if (workshop_type === 'imaginal-agility') {
    if (section === 'introduction') {
      // IA introduction videos
      contentMode = 'both';
      requiredWatchPercentage = 65;
    } else if (section === 'challenge' || section === 'solution') {
      // Core IA concepts - higher requirements
      contentMode = 'both';
      requiredWatchPercentage = 85;
    } else if (section === 'teamwork') {
      // Teamwork videos - moderate requirements
      contentMode = 'both';
      requiredWatchPercentage = 70;
    } else if (section === 'discernment' || section === 'neuroscience') {
      // Advanced topics - highest requirements
      contentMode = 'both';
      requiredWatchPercentage = 90;
    } else {
      // Other IA videos
      contentMode = 'both';
      requiredWatchPercentage = 75;
    }
  }
  
  // General/landing page videos
  else if (workshop_type === 'general') {
    contentMode = 'both';
    requiredWatchPercentage = 50; // Lower requirement for promotional videos
  }
  
  return { contentMode, requiredWatchPercentage };
}

async function populateVideoManagement() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = postgres(databaseUrl);

  try {
    console.log('🎬 Populating Video Management System with Live Data');
    console.log('====================================================\n');

    // First, ensure the enhanced columns exist
    console.log('📋 Ensuring enhanced schema fields exist...');
    
    try {
      await sql`
        ALTER TABLE videos 
        ADD COLUMN IF NOT EXISTS content_mode VARCHAR(20) DEFAULT 'both' NOT NULL
      `;
      console.log('✅ Ensured content_mode column exists');
    } catch (error) {
      console.log('ℹ️  content_mode column already exists');
    }

    try {
      await sql`
        ALTER TABLE videos 
        ADD COLUMN IF NOT EXISTS required_watch_percentage INTEGER DEFAULT 75 NOT NULL
      `;
      console.log('✅ Ensured required_watch_percentage column exists');
    } catch (error) {
      console.log('ℹ️  required_watch_percentage column already exists');
    }

    console.log('\n🔄 Processing video data...\n');

    let updatedCount = 0;
    let createdCount = 0;

    for (const videoData of existingVideos) {
      const { contentMode, requiredWatchPercentage } = getSmartDefaults(videoData);
      
      try {
        // Check if video exists by ID
        const existingVideo = await sql`
          SELECT id FROM videos WHERE id = ${videoData.id}
        `;

        if (existingVideo.length > 0) {
          // Update existing video
          await sql`
            UPDATE videos 
            SET 
              content_mode = ${contentMode},
              required_watch_percentage = ${requiredWatchPercentage},
              updated_at = NOW()
            WHERE id = ${videoData.id}
          `;
          
          console.log(`📝 Updated: ${videoData.title}`);
          console.log(`   Mode: ${contentMode} | Watch Req: ${requiredWatchPercentage}% | Step: ${videoData.step_id || 'N/A'}`);
          updatedCount++;
        } else {
          // Create new video record
          await sql`
            INSERT INTO videos (
              id, title, description, url, editable_id, workshop_type, 
              section, step_id, autoplay, sort_order, content_mode, 
              required_watch_percentage, created_at, updated_at
            ) VALUES (
              ${videoData.id},
              ${videoData.title},
              ${videoData.description || null},
              ${videoData.url},
              ${videoData.editable_id || null},
              ${videoData.workshop_type},
              ${videoData.section},
              ${videoData.step_id || null},
              ${videoData.autoplay},
              ${videoData.sort_order},
              ${contentMode},
              ${requiredWatchPercentage},
              NOW(),
              NOW()
            )
          `;
          
          console.log(`✨ Created: ${videoData.title}`);
          console.log(`   Mode: ${contentMode} | Watch Req: ${requiredWatchPercentage}% | Step: ${videoData.step_id || 'N/A'}`);
          createdCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${videoData.title}:`, error);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Updated: ${updatedCount} videos`);
    console.log(`   Created: ${createdCount} videos`);
    console.log(`   Total: ${updatedCount + createdCount} videos processed`);

    // Show breakdown by workshop type
    console.log('\n🎯 Video Distribution:');
    const allStarTeamsCount = existingVideos.filter(v => v.workshop_type === 'allstarteams').length;
    const imaginalAgilityCount = existingVideos.filter(v => v.workshop_type === 'imaginal-agility').length;
    const generalCount = existingVideos.filter(v => v.workshop_type === 'general').length;
    
    console.log(`   AllStarTeams: ${allStarTeamsCount} videos`);
    console.log(`   Imaginal Agility: ${imaginalAgilityCount} videos`);
    console.log(`   General: ${generalCount} videos`);

    // Show smart defaults applied
    console.log('\n⚙️ Smart Defaults Applied:');
    console.log('   📚 AllStarTeams Introduction: 60% watch requirement');
    console.log('   📊 AllStarTeams Assessment: 80% watch requirement');
    console.log('   🔮 AllStarTeams Future Self: 90% watch requirement');
    console.log('   🧠 IA Core Concepts: 85% watch requirement');
    console.log('   🎯 IA Advanced Topics: 90% watch requirement');
    console.log('   🏠 General/Landing: 50% watch requirement');

    // Final verification
    const finalCount = await sql`SELECT COUNT(*) as count FROM videos`;
    console.log(`\n🔍 Final verification: ${finalCount[0].count} total videos in database`);

    console.log('\n🎉 Video Management System Successfully Populated!');
    console.log('\n🚀 Ready for Enhanced Features:');
    console.log('   ✅ Student vs Professional mode support');
    console.log('   ✅ Configurable watch requirements');
    console.log('   ✅ Progress-based menu unlocking');
    console.log('   ✅ Enhanced admin interface');
    console.log('   ✅ Live YouTube ID editing');

    await sql.end();

  } catch (error) {
    console.error('❌ Population failed:', error);
    await sql.end();
    throw error;
  }
}

// Execute the population
populateVideoManagement()
  .then(() => {
    console.log('\nPopulation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Population failed:', error);
    process.exit(1);
  });
