#!/usr/bin/env node

import "dotenv/config";
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkPromptDatabase() {
  try {
    console.log('🔍 Checking unified prompt document in database...');
    
    const promptResult = await pool.query(
      'SELECT id, title, content, status, updated_at FROM training_documents WHERE title = $1',
      ['Talia Report Generation Prompt']
    );
    
    if (promptResult.rows.length === 0) {
      console.log('❌ No unified prompt document found!');
      return;
    }
    
    const prompt = promptResult.rows[0];
    console.log('✅ Found unified prompt document:');
    console.log(`   ID: ${prompt.id}`);
    console.log(`   Title: ${prompt.title}`);
    console.log(`   Status: ${prompt.status}`);
    console.log(`   Updated: ${prompt.updated_at}`);
    console.log(`   Content length: ${prompt.content.length} characters`);
    
    // Check if it contains the old negative prohibitions
    if (prompt.content.includes('Do NOT say "As Report Talia in admin consultation mode"')) {
      console.log('❌ STILL CONTAINS OLD NEGATIVE PROHIBITIONS');
      console.log('   The document has NOT been updated with positive instructions');
    } else if (prompt.content.includes('PRIMARY FUNCTION: COMPREHENSIVE REPORT GENERATION')) {
      console.log('✅ CONTAINS NEW POSITIVE INSTRUCTIONS');
      console.log('   The document has been successfully updated');
    } else {
      console.log('⚠️ UNCLEAR STATUS - need to examine content');
    }
    
    // Check which personas are using this document
    console.log('\n🎭 Checking which personas use this document...');
    const personaResult = await pool.query(
      'SELECT id, name, training_documents, enabled FROM talia_personas WHERE $1 = ANY(training_documents)',
      [prompt.id]
    );
    
    if (personaResult.rows.length > 0) {
      personaResult.rows.forEach(persona => {
        console.log(`   ${persona.name} (${persona.id}): ${persona.enabled ? 'ENABLED' : 'DISABLED'}`);
      });
    } else {
      console.log('   No personas found using this document!');
    }
    
    // Show first 1000 characters of current content
    console.log('\n📄 Current content preview (first 1000 chars):');
    console.log('---');
    console.log(prompt.content.substring(0, 1000));
    console.log('---');
    
  } catch (error) {
    console.error('❌ Error checking prompt database:', error);
  } finally {
    await pool.end();
  }
}

checkPromptDatabase().catch(console.error);