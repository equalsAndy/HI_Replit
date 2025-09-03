import { db } from './server/db.js';
import { readFileSync } from 'fs';
import { sql } from 'drizzle-orm';

async function addFlowVideo() {
  try {
    console.log('Adding AST 2-2 Flow Patterns video to database...');
    
    // Read the SQL file
    const sqlContent = readFileSync('./sql/add-ast-2-2-flow-video.sql', 'utf8');
    
    // Split by semicolon to handle multiple statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.includes('INSERT') || statement.includes('SELECT')) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const result = await db.execute(sql.raw(statement));
        console.log('✅ Statement executed successfully');
      }
    }
    
    console.log('✅ Flow Patterns video added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding Flow video:', error);
    console.error('Full error:', error.message);
  } finally {
    process.exit(0);
  }
}

// Execute the function
addFlowVideo();
