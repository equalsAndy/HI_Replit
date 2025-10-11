/**
 * Upload Reflection Talia training documents to PostgreSQL
 * Run with: NODE_ENV=development node upload-reflection-docs.js
 */

import { readFileSync } from 'fs';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'server/.env.development' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function uploadDocuments() {
  console.log('🤖 Uploading Reflection Talia training documents...');

  const documents = [
    {
      title: 'Reflection Talia Training Doc',
      file: 'coaching-data/AST_Talia/talia_training_doc.md',
      category: 'Talia_Training'
    },
    {
      title: 'AST Workshop Compendium 2025',  
      file: 'coaching-data/AST_Talia/AST_Compendium.md',
      category: 'coaching_system'
    },
    {
      title: 'Talia AI Coach Training Manual',
      file: 'coaching-data/AST_Talia/Talia Role Documents/reflection_talia_training_doc.md', 
      category: 'coaching_system'
    },
    {
      title: 'Strengths-Based Coaching Principles',
      file: 'coaching-data/AST_Talia/Flow Attributes by Strength Quadrant .txt',
      category: 'Strengths Development'
    }
  ];

  for (const doc of documents) {
    try {
      console.log(`📄 Processing: ${doc.title}`);
      
      // Read file content
      const content = readFileSync(doc.file, 'utf-8');
      const fileSize = Buffer.byteLength(content, 'utf-8');
      
      // Insert into database
      const result = await pool.query(
        `INSERT INTO training_documents 
         (title, content, document_type, category, file_size, original_filename, uploaded_by, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id`,
        [
          doc.title,
          content,
          'document',
          doc.category,
          fileSize,
          doc.file.split('/').pop(),
          1, // uploaded_by user 1 (admin)
          'active'
        ]
      );

      console.log(`✅ Uploaded: ${doc.title} (ID: ${result.rows[0].id}, Size: ${fileSize} bytes)`);
      
    } catch (error) {
      if (error.code === '23505') {
        console.log(`⚠️  Document "${doc.title}" already exists, skipping...`);
      } else {
        console.error(`❌ Failed to upload ${doc.title}:`, error.message);
      }
    }
  }

  await pool.end();
  console.log('🎯 Document upload complete!');
}

uploadDocuments().catch(console.error);