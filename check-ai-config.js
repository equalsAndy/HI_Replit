#!/usr/bin/env node
import "dotenv/config";
import { db } from './server/db.ts';

async function checkAIConfig() {
  try {
    console.log('Checking AI Configuration table...');
    
    // Get existing feature names
    const features = await db.execute(`
      SELECT feature_name, enabled 
      FROM ai_configuration 
      ORDER BY feature_name
    `);
    console.log('Existing features:', features);
    
    // Check constraints
    const constraints = await db.execute(`
      SELECT conname, consrc 
      FROM pg_constraint 
      WHERE conrelid = 'ai_configuration'::regclass
        AND contype = 'c'
    `);
    console.log('Table constraints:', constraints);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAIConfig();