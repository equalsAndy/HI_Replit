#!/usr/bin/env node
import "dotenv/config";
import { db } from './server/db.ts';

async function runSimpleAIMigration() {
  try {
    console.log('🔄 Starting simplified AI Training System setup...');
    
    // Check if main tables exist
    console.log('📊 Checking existing tables...');
    const existingTables = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('training_documents', 'document_chunks', 'report_generation_context')
    `);
    
    console.log('Existing training tables:', existingTables.map(t => t.table_name));
    
    if (existingTables.length >= 3) {
      console.log('✅ All AI training tables already exist!');
      
      // Just update the AI configuration with RAG settings
      console.log('🔧 Updating AI configuration with RAG settings...');
      await db.execute(`
        UPDATE ai_configuration SET
          embedding_model = 'text-embedding-ada-002',
          context_chunk_limit = CASE 
            WHEN feature_name = 'coaching' THEN 3
            WHEN feature_name = 'holistic_reports' THEN 8
            ELSE 5
          END,
          similarity_threshold = CASE 
            WHEN feature_name = 'coaching' THEN 0.75
            WHEN feature_name = 'holistic_reports' THEN 0.65
            ELSE 0.70
          END,
          max_context_tokens = CASE 
            WHEN feature_name = 'coaching' THEN 6000
            WHEN feature_name = 'holistic_reports' THEN 12000
            ELSE 8000
          END,
          updated_at = NOW()
        WHERE feature_name IN ('coaching', 'holistic_reports', 'global', 'reflection_assistance')
      `);
      
      // Check if sample documents exist
      const sampleDocs = await db.execute(`
        SELECT COUNT(*) as count 
        FROM training_documents 
        WHERE title IN ('Strengths-Based Coaching Principles', 'Holistic Report Template - Executive Summary')
      `);
      
      if (sampleDocs[0].count < 2) {
        console.log('📝 Adding sample training documents...');
        
        // Add sample documents
        await db.execute(`
          INSERT INTO training_documents (title, content, document_type, category, tags, version, status)
          SELECT 
            'Strengths-Based Coaching Principles',
            'Strengths-based coaching focuses on identifying and developing an individual''s natural talents and abilities rather than attempting to fix weaknesses. Key principles include:

1. **Discovery Over Development**: Help people discover their existing strengths rather than trying to build new ones from scratch.

2. **Energy and Engagement**: When people use their strengths, they feel more energized and engaged in their work.

3. **Unique Contribution**: Each person has a unique combination of strengths that creates their distinct value proposition.

4. **Growth Through Strengths**: The greatest potential for growth exists in areas of greatest strength.

**Coaching Questions for Strength Discovery:**
- When do you feel most energized at work?
- What activities make you lose track of time?
- What do people consistently come to you for help with?
- When have you felt most successful and confident?',
            'coaching_guide',
            'Strengths Development',
            ARRAY['strengths', 'coaching', 'development', 'energy', 'engagement'],
            '1.0',
            'active'
          WHERE NOT EXISTS (
            SELECT 1 FROM training_documents WHERE title = 'Strengths-Based Coaching Principles'
          )
        `);
        
        await db.execute(`
          INSERT INTO training_documents (title, content, document_type, category, tags, version, status)
          SELECT
            'Holistic Report Template - Executive Summary',
            'A comprehensive holistic development report should include the following sections:

**EXECUTIVE SUMMARY**
- Brief overview of individual''s key strengths and development areas
- Primary insights from assessments and workshops
- Top 3 development recommendations
- Expected outcomes and timeline

**STRENGTHS ANALYSIS**
- Detailed breakdown of top strengths with scores
- How strengths manifest in workplace behaviors
- Unique strength combinations and their advantages

**ACTION PLAN**
- 90-day immediate focus areas
- 6-month development goals
- 12-month vision and objectives
- Specific activities and resources',
            'report_template',
            'Report Generation',
            ARRAY['holistic', 'report', 'template', 'executive', 'development'],
            '1.0',
            'active'
          WHERE NOT EXISTS (
            SELECT 1 FROM training_documents WHERE title = 'Holistic Report Template - Executive Summary'
          )
        `);
      }
      
      console.log('✅ AI Training System setup completed successfully!');
      console.log('');
      console.log('🎯 Available capabilities:');
      console.log('   • PostgreSQL pgvector extension for embeddings');
      console.log('   • training_documents - For uploading coaching/report documents'); 
      console.log('   • document_chunks - For vector embeddings and similarity search');
      console.log('   • Enhanced AI configuration with RAG settings');
      console.log('   • Sample training documents for testing');
      console.log('');
      console.log('🚀 Ready for Phase 1 document training implementation!');
      
    } else {
      console.log('⚠️  Not all training tables exist. Please run the full migration first.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runSimpleAIMigration();