#!/usr/bin/env node
import "dotenv/config";
import { db } from './server/db.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCoachingMigration() {
  try {
    console.log('🔄 Starting coaching system migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', 'add_coaching_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
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
          // If error is "table already exists", that's fine
          if (error.message && error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1}: Table already exists (skipping)`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error);
            throw error;
          }
        }
      }
    }
    
    console.log('✅ Coaching system migration completed successfully!');
    console.log('');
    console.log('🎯 New tables available:');
    console.log('   • coach_knowledge_base - For AST methodology and coaching content');
    console.log('   • user_profiles_extended - For team connections and collaboration');
    console.log('   • coaching_sessions - For AI coaching conversations');
    console.log('   • connection_suggestions - For team member recommendations');
    console.log('   • vector_embeddings - For semantic search references');
    console.log('');
    console.log('🚀 Ready for coaching system development!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runCoachingMigration();
