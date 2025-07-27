import dotenv from 'dotenv';
import path from 'path';

// Load the appropriate .env file based on NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

async function createFeedbackTable() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const queryClient = postgres(databaseUrl);
  const db = drizzle(queryClient);

  try {
    // Try to query the feedback table
    const result = await db.execute('SELECT COUNT(*) FROM feedback');
    console.log('✅ Feedback table exists with', result.rows[0].count, 'records');
  } catch (error: any) {
    console.log('❌ Feedback table does not exist:', error.message);
    console.log('Creating feedback table...');
    
    // Create the feedback table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        workshop_type VARCHAR(20) NOT NULL,
        page_context VARCHAR(20) NOT NULL,
        target_page VARCHAR(100),
        feedback_type VARCHAR(20) NOT NULL,
        priority VARCHAR(10) NOT NULL DEFAULT 'low',
        message TEXT NOT NULL,
        experience_rating INTEGER,
        status VARCHAR(20) NOT NULL DEFAULT 'new',
        tags JSONB DEFAULT '[]',
        system_info JSONB NOT NULL,
        admin_notes TEXT,
        jira_ticket_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    try {
      await db.execute(createTableSQL);
      console.log('✅ Feedback table created successfully');
      
      // Create indexes
      await db.execute('CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id)');
      await db.execute('CREATE INDEX IF NOT EXISTS idx_feedback_workshop_type ON feedback(workshop_type)');
      await db.execute('CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status)');
      await db.execute('CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at)');
      console.log('✅ Indexes created successfully');
      
    } catch (createError: any) {
      console.log('❌ Failed to create feedback table:', createError.message);
    }
  }
  
  await queryClient.end();
  process.exit(0);
}

createFeedbackTable();