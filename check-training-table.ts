#!/usr/bin/env npx tsx
import "dotenv/config";
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkTrainingTable() {
  try {
    // Check table structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'training_documents'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Training Documents Table Structure:');
    console.log('====================================');
    tableInfo.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check existing documents
    const existingDocs = await pool.query('SELECT title, document_type FROM training_documents');
    console.log('\n📄 Existing Documents:');
    console.log('======================');
    existingDocs.rows.forEach(doc => {
      console.log(`  - ${doc.title} (${doc.document_type})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTrainingTable();