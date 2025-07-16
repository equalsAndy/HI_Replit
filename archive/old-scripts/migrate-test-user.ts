import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

// Load environment variables
dotenv.config();

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function main() {
  console.log('Connecting to PostgreSQL database...');
  
  // Create a Postgres client with the database URL
  const queryClient = postgres(databaseUrl);
  const db = drizzle(queryClient);
  
  try {
    console.log('Adding isTestUser column to users table...');
    
    // Check if the column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
        AND column_name = 'is_test_user'
    `;
    
    const columnExists = await queryClient.unsafe(checkColumnQuery);
    
    if (columnExists.length === 0) {
      // Add the is_test_user column
      await queryClient.unsafe(`
        ALTER TABLE users
        ADD COLUMN is_test_user BOOLEAN NOT NULL DEFAULT FALSE
      `);
      
      console.log('Added is_test_user column to users table');
      
      // Set initial test users based on username patterns
      await queryClient.unsafe(`
        UPDATE users
        SET is_test_user = TRUE
        WHERE username IN ('admin', 'participant', 'facilitator')
          OR username LIKE 'participant%'
          OR username LIKE 'facilitator%'
          OR username LIKE 'user%'
      `);
      
      console.log('Updated test user status for existing users');
    } else {
      console.log('is_test_user column already exists');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the database connection
    await queryClient.end();
    console.log('Database connection closed');
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});