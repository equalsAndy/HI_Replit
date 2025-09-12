#!/usr/bin/env node

import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

console.log('🔧 Fixing glossary format from string to array...');

async function fixGlossaryFormat() {
  try {
    // Get all AST videos with string-type glossaries that need fixing
    const videos = await sql`
      SELECT id, step_id, title, glossary 
      FROM videos 
      WHERE workshop_type = 'allstarteams' 
      AND glossary IS NOT NULL 
      AND jsonb_typeof(glossary) = 'string'
    `;
    
    console.log(`Found ${videos.length} videos with glossaries that need format fixing`);
    
    let fixedCount = 0;
    
    for (const video of videos) {
      try {
        // Parse the stringified JSON back to an array
        const glossaryArray = JSON.parse(video.glossary);
        
        if (Array.isArray(glossaryArray)) {
          // Update with the proper array format
          await sql`
            UPDATE videos 
            SET glossary = ${sql.json(glossaryArray)}
            WHERE id = ${video.id}
          `;
          
          console.log(`✅ Fixed: ${video.step_id} - ${video.title} (${glossaryArray.length} terms)`);
          fixedCount++;
        } else {
          console.log(`⚠️  Skipped: ${video.step_id} - ${video.title} (not an array)`);
        }
        
      } catch (error) {
        console.error(`❌ Error fixing ${video.step_id}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} glossary formats`);
    
    // Verify the fixes
    console.log('\n🔍 Verification after fix:');
    const verification = await sql`
      SELECT step_id, title,
             jsonb_typeof(glossary) as type,
             CASE WHEN jsonb_typeof(glossary) = 'array' 
                  THEN jsonb_array_length(glossary)
                  ELSE 0 END as term_count
      FROM videos 
      WHERE workshop_type = 'allstarteams' 
      AND glossary IS NOT NULL
      ORDER BY step_id
    `;
    
    verification.forEach(video => {
      const status = video.type === 'array' ? '✅' : '❌';
      console.log(`  ${status} ${video.step_id}: ${video.title} (type: ${video.type}, terms: ${video.term_count})`);
    });
    
  } catch (error) {
    console.error('❌ Fix script failed:', error);
  } finally {
    await sql.end();
  }
}

fixGlossaryFormat().catch(console.error);