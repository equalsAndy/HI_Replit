#!/usr/bin/env node
import "dotenv/config";
import { db } from './server/db.ts';

async function checkSchema() {
  try {
    console.log('Checking existing database schema...');
    
    // Check for existing coaching tables
    const coachingTables = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%coaching%'
    `);
    console.log('Existing coaching tables:', coachingTables);
    
    // Check for existing vector extension
    const extensions = await db.execute(`
      SELECT extname 
      FROM pg_extension 
      WHERE extname = 'vector'
    `);
    console.log('Vector extension:', extensions.length > 0 ? 'Installed' : 'Not installed');
    
    // Check for existing ai_configuration table
    const aiConfig = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ai_configuration'
    `);
    console.log('AI Configuration columns:', aiConfig.map(col => col.column_name));
    
  } catch (error) {
    console.error('Error checking schema:', error.message);
  } finally {
    process.exit(0);
  }
}

checkSchema();