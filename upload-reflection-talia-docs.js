/**
 * Script to upload Reflection Talia training documents to PostgreSQL database
 */

import { readFileSync } from 'fs';
import { db } from './server/db.ts';

async function uploadReflectionTaliaDocuments() {
  console.log('🤖 Starting Reflection Talia document upload...');

  const documents = [
    {
      title: 'Reflection Talia Training Doc',
      file: '/Users/bradtopliff/Desktop/HI_Replit/coaching-data/AST_Talia/talia_training_doc.md',
      category: 'Talia_Training',
      description: 'Complete training manual for Reflection Talia AI coaching system'
    },
    {
      title: 'AST Workshop Compendium 2025',
      file: '/Users/bradtopliff/Desktop/HI_Replit/coaching-data/AST_Talia/AST_Compendium.md',
      category: 'coaching_system',
      description: 'Comprehensive AST workshop methodology and theoretical foundations'
    },
    {
      title: 'Talia AI Coach Training Manual',
      file: '/Users/bradtopliff/Desktop/HI_Replit/coaching-data/AST_Talia/Talia Role Documents/reflection_talia_training_doc.md',
      category: 'coaching_system',
      description: 'Specialized role training for AST assessment completion support'
    },
    {
      title: 'Strengths-Based Coaching Principles',
      file: '/Users/bradtopliff/Desktop/HI_Replit/coaching-data/AST_Talia/Flow Attributes by Strength Quadrant .txt',
      category: 'Strengths Development',
      description: 'Flow attributes mapping by strength quadrant for coaching insights'
    }
  ];

  for (const doc of documents) {
    try {
      console.log(`📄 Processing: ${doc.title}`);
      
      // Read file content
      const content = readFileSync(doc.file, 'utf-8');
      const fileSize = Buffer.byteLength(content, 'utf-8');
      
      // Insert into PostgreSQL with reflection_talia persona assignment
      const result = await db.execute(
        `INSERT INTO training_documents 
         (title, content, document_type, category, file_size, original_filename, assigned_personas, enabled, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id`,
        [
          doc.title,
          content,
          'document',
          doc.category,
          fileSize,
          doc.file.split('/').pop(),
          JSON.stringify(['reflection_talia']), // Assign to reflection_talia persona
          true
        ]
      );

      const documentId = result[0].id;
      console.log(`✅ Uploaded: ${doc.title} (ID: ${documentId}, Size: ${fileSize} bytes)`);
      
    } catch (error) {
      console.error(`❌ Failed to upload ${doc.title}:`, error.message);
    }
  }

  console.log('🎯 Reflection Talia document upload complete!');
  process.exit(0);
}

// Run the upload
uploadReflectionTaliaDocuments().catch(error => {
  console.error('💥 Upload script failed:', error);
  process.exit(1);
});