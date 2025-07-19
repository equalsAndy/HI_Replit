#!/usr/bin/env node
/**
 * Simple database table check script
 * This will verify if our coaching tables exist in the database
 */

import "dotenv/config";

async function checkCoachingTables() {
  try {
    // Import database connection
    const { db } = await import('./server/db.ts');
    
    console.log('🔍 Checking coaching system tables...');
    
    const tablesToCheck = [
      'coach_knowledge_base',
      'user_profiles_extended', 
      'coaching_sessions',
      'connection_suggestions',
      'vector_embeddings'
    ];
    
    for (const tableName of tablesToCheck) {
      try {
        const result = await db.execute(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}'
          );
        `);
        
        const exists = result.rows[0].exists;
        if (exists) {
          console.log(`✅ ${tableName} - EXISTS`);
        } else {
          console.log(`❌ ${tableName} - MISSING`);
        }
      } catch (error) {
        console.log(`❌ ${tableName} - ERROR: ${error.message}`);
      }
    }
    
    console.log('\n🎯 Table check complete!');
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  } finally {
    process.exit(0);
  }
}

checkCoachingTables();
