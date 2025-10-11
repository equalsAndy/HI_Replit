#!/usr/bin/env node
import "dotenv/config";
import { db } from './server/db.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAITrainingMigration() {
  try {
    console.log('🔄 Starting AI Training System migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', '0005_add_ai_training_system_fixed.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded');
    
    // Split the SQL into individual statements, handling DO blocks properly
    const statements = [];
    let currentStatement = '';
    let inDoBlock = false;
    
    const lines = migrationSQL.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      // Track DO blocks
      if (trimmedLine.startsWith('DO $$')) {
        inDoBlock = true;
        currentStatement += line + '\n';
        continue;
      }
      
      if (inDoBlock && trimmedLine === '$$;') {
        currentStatement += line + '\n';
        statements.push(currentStatement.trim());
        currentStatement = '';
        inDoBlock = false;
        continue;
      }
      
      // Add line to current statement
      currentStatement += line + '\n';
      
      // If not in DO block and line ends with semicolon, complete statement
      if (!inDoBlock && trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Add final statement if exists
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          await db.execute(statement);
          console.log(`✅ Statement ${i + 1} completed successfully`);
        } catch (error) {
          // If error is "already exists", that's fine
          if (error.message && (
            error.message.includes('already exists') ||
            error.message.includes('extension "vector" already exists') ||
            error.message.includes('column') && error.message.includes('already exists')
          )) {
            console.log(`⚠️  Statement ${i + 1}: Already exists (skipping)`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error);
            console.log(`Statement content: ${statement.substring(0, 200)}...`);
            throw error;
          }
        }
      }
    }
    
    console.log('✅ AI Training System migration completed successfully!');
    console.log('');
    console.log('🎯 New capabilities enabled:');
    console.log('   • PostgreSQL pgvector extension for embeddings');
    console.log('   • training_documents - For uploading coaching/report documents');
    console.log('   • document_chunks - For vector embeddings and similarity search');
    console.log('   • document_processing_jobs - For background embedding generation');
    console.log('   • coaching_conversations - For multi-turn coaching context');
    console.log('   • coaching_messages - For conversation history');
    console.log('   • report_generation_context - For enhanced report tracking');
    console.log('');
    console.log('🚀 Ready for RAG-powered AI coaching and enhanced reports!');
    console.log('📝 Sample training documents inserted for testing');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runAITrainingMigration();