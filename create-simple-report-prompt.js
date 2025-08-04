#!/usr/bin/env node

import "dotenv/config";
import { Pool } from 'pg';
import fs from 'fs/promises';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createSimpleReportPrompt() {
  try {
    console.log('🔄 Creating ultra-simple report prompt to eliminate consultation mode...');
    
    const simplePrompt = `You are Report Talia. Write complete development reports immediately.

IMMEDIATE ACTION: Generate the complete Personal Development Report right now using the user data provided. Start with "# Your Personal Development Report" and write the full report.

DO NOT:
- Ask questions
- Explain your approach
- Provide analysis about methodology
- Say you are in any kind of mode

ONLY: Write the complete report immediately.

Report Format:
- Personal Reports: 2nd person ("You have...")
- Professional Reports: 3rd person ("[Name] demonstrates...")
- Include user's actual data and specific examples
- Write 2500+ words in one complete response

User data will be provided. Generate the report immediately when requested.`;
    
    console.log(`📄 Simple prompt content: ${simplePrompt.length} characters`);
    
    // Update the database document
    const updateResult = await pool.query(
      'UPDATE training_documents SET content = $1, updated_at = NOW() WHERE title = $2',
      [simplePrompt, 'Talia Report Generation Prompt']
    );
    
    if (updateResult.rowCount === 1) {
      console.log('✅ Database document updated with simple prompt!');
      
      // Verify the update
      const verifyResult = await pool.query(
        'SELECT content, updated_at FROM training_documents WHERE title = $1',
        ['Talia Report Generation Prompt']
      );
      
      const updated = verifyResult.rows[0];
      console.log(`📊 Updated content length: ${updated.content.length} characters`);
      console.log(`⏰ Updated at: ${updated.updated_at}`);
      
      console.log('✅ SIMPLE DIRECT PROMPT INSTALLED');
      console.log('   This eliminates all template complexity and consultation triggers');
      
    } else {
      console.log('❌ Database update failed - no rows affected');
    }
    
  } catch (error) {
    console.error('❌ Error updating prompt database:', error);
  } finally {
    await pool.end();
  }
}

createSimpleReportPrompt().catch(console.error);