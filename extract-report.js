#!/usr/bin/env node

/**
 * Extract report from database and save to file
 */

import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const REPORT_ID = 'b48e05b3-06a8-4edd-835e-1ace92bd25ef';

async function extractReport() {
  try {
    console.log('🔍 Extracting report from database...');
    
    const result = await pool.query(`
      SELECT 
        id,
        user_id,
        report_type,
        generation_status,
        LENGTH(html_content) as html_length,
        LENGTH((report_data::json->>'professionalProfile')::text) as content_length,
        html_content,
        (report_data::json->>'professionalProfile')::text as content,
        generated_at
      FROM holistic_reports 
      WHERE id = $1
    `, [REPORT_ID]);

    if (result.rows.length === 0) {
      console.log('❌ Report not found');
      process.exit(1);
    }

    const report = result.rows[0];
    
    console.log('\n📊 Report Details:');
    console.log('  ID:', report.id);
    console.log('  User:', report.user_id);
    console.log('  Type:', report.report_type);
    console.log('  Status:', report.generation_status);
    console.log('  Generated:', report.generated_at);
    console.log('  HTML Length:', report.html_length, 'chars');
    console.log('  Content Length:', report.content_length, 'chars');

    // Save HTML version
    if (report.html_content) {
      const htmlPath = path.join(__dirname, 'GENERATED-REPORT.html');
      await fs.writeFile(htmlPath, report.html_content, 'utf8');
      console.log('\n✅ HTML saved to:', htmlPath);
    }

    // Save content version
    if (report.content) {
      const contentPath = path.join(__dirname, 'GENERATED-REPORT-CONTENT.txt');
      await fs.writeFile(contentPath, report.content, 'utf8');
      console.log('✅ Content saved to:', contentPath);
    }

    // Show preview
    console.log('\n📝 Content Preview (first 500 chars):');
    console.log(report.content?.substring(0, 500) || 'No content');
    console.log('...\n');

    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

extractReport();
