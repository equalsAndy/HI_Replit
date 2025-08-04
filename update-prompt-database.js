#!/usr/bin/env node

import "dotenv/config";
import { Pool } from 'pg';
import fs from 'fs/promises';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function updatePromptDatabase() {
  try {
    console.log('🔄 Updating unified prompt document in database...');
    
    // Read the updated content from the file
    const updatedContent = await fs.readFile(
      '/Users/bradtopliff/Desktop/HI_Replit/coaching-data/AST_Talia/talia_report_generation_prompt.md',
      'utf8'
    );
    
    console.log(`📄 Loaded updated content: ${updatedContent.length} characters`);
    
    // Verify it contains the positive instructions
    if (updatedContent.includes('PRIMARY FUNCTION: COMPREHENSIVE REPORT GENERATION')) {
      console.log('✅ Content contains positive instructions');
    } else {
      console.log('❌ Content does not contain expected positive instructions');
      return;
    }
    
    // Update the database document
    const updateResult = await pool.query(
      'UPDATE training_documents SET content = $1, updated_at = NOW() WHERE title = $2',
      [updatedContent, 'Talia Report Generation Prompt']
    );
    
    if (updateResult.rowCount === 1) {
      console.log('✅ Database document updated successfully!');
      
      // Verify the update
      const verifyResult = await pool.query(
        'SELECT content, updated_at FROM training_documents WHERE title = $1',
        ['Talia Report Generation Prompt']
      );
      
      const updated = verifyResult.rows[0];
      console.log(`📊 Updated content length: ${updated.content.length} characters`);
      console.log(`⏰ Updated at: ${updated.updated_at}`);
      
      // Check for the key indicators
      if (updated.content.includes('PRIMARY FUNCTION: COMPREHENSIVE REPORT GENERATION')) {
        console.log('✅ POSITIVE INSTRUCTIONS CONFIRMED IN DATABASE');
      } else {
        console.log('❌ POSITIVE INSTRUCTIONS NOT FOUND');
      }
      
      if (updated.content.includes('Do NOT say "As Report Talia in admin consultation mode"')) {
        console.log('⚠️ OLD NEGATIVE PROHIBITIONS STILL PRESENT');
      } else {
        console.log('✅ NEGATIVE PROHIBITIONS REMOVED');
      }
      
    } else {
      console.log('❌ Database update failed - no rows affected');
    }
    
  } catch (error) {
    console.error('❌ Error updating prompt database:', error);
  } finally {
    await pool.end();
  }
}

updatePromptDatabase().catch(console.error);