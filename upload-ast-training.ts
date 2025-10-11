#!/usr/bin/env npx tsx
import "dotenv/config";
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

interface TrainingDocument {
  title: string;
  filename: string;
  document_type: string;
  description: string;
}

const astTrainingDocuments: TrainingDocument[] = [
  {
    title: "Talia AI Coach Training Manual",
    filename: "talia_training_doc.md",
    document_type: "coaching_guide",
    description: "Complete system for individual development reports using AllStarTeams methodology"
  },
  {
    title: "AST Workshop Questions Database",
    filename: "ast_workshop_questions_database.md",
    document_type: "assessment_framework",
    description: "Comprehensive inventory of all AST workshop questions and assessments"
  },
  {
    title: "AST Workshop Compendium 2025",
    filename: "AST_Compendium.md",
    document_type: "coaching_guide",
    description: "Philosophical foundations, psychological frameworks, and practical applications of AST"
  },
  {
    title: "Daniel Chen Personal Report (Sample)",
    filename: "daniel_chen_personal_report.md",
    document_type: "report_template",
    description: "Sample personal development report demonstrating Talia's coaching approach"
  },
  {
    title: "Daniel Chen Professional Profile (Sample)",
    filename: "daniel_chen_professional_profile.md",
    document_type: "report_template",
    description: "Sample professional profile report for team collaboration"
  },
  {
    title: "Emily Rodriguez Personal Report (Sample)",
    filename: "emily_rodriguez_personal_report.md",
    document_type: "report_template",
    description: "Sample personal development report with different strengths profile"
  },
  {
    title: "Emily Rodriguez Professional Profile (Sample)",
    filename: "emily_rodriguez_professional_profile.md",
    document_type: "report_template",
    description: "Sample professional profile with different working style patterns"
  }
];

async function uploadASTTrainingDocuments() {
  console.log('📚 Uploading AST Training Documents to Database');
  console.log('==============================================\n');

  try {
    const basePath = '/Users/bradtopliff/Desktop/HI_Replit/coaching-data/AST_Talia';
    
    for (const doc of astTrainingDocuments) {
      console.log(`📄 Uploading: ${doc.title}`);
      
      try {
        // Read file content
        const filePath = join(basePath, doc.filename);
        const content = readFileSync(filePath, 'utf-8');
        
        // Check if document already exists
        const existingDoc = await pool.query(
          'SELECT id FROM training_documents WHERE title = $1',
          [doc.title]
        );
        
        if (existingDoc.rows.length > 0) {
          console.log(`  ⚠️  Document already exists, skipping...`);
          continue;
        }
        
        // Insert document
        await pool.query(`
          INSERT INTO training_documents (
            id, title, content, document_type, category, status, original_filename, created_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, 'active', $5, NOW()
          )
        `, [
          doc.title,
          content,
          doc.document_type,
          'coaching_system',
          doc.filename
        ]);
        
        console.log(`  ✅ Successfully uploaded (${content.length} characters)`);
        
      } catch (error) {
        console.log(`  ❌ Failed to upload: ${error.message}`);
      }
    }
    
    // Verify uploads
    console.log('\n📊 Upload Summary');
    console.log('=================');
    
    const totalDocs = await pool.query(`
      SELECT COUNT(*) as count FROM training_documents 
      WHERE category = 'coaching_system'
    `);
    
    const docsByType = await pool.query(`
      SELECT document_type, COUNT(*) as count 
      FROM training_documents 
      WHERE category = 'coaching_system'
      GROUP BY document_type
      ORDER BY count DESC
    `);
    
    console.log(`Total AST Training Documents: ${totalDocs.rows[0].count}`);
    console.log('\nDocuments by Type:');
    docsByType.rows.forEach(row => {
      console.log(`  - ${row.document_type}: ${row.count}`);
    });
    
    console.log('\n✅ AST Training Documents Upload Complete!');
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
  } finally {
    await pool.end();
  }
}

uploadASTTrainingDocuments();