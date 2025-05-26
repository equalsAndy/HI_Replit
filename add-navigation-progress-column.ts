
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './shared/schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function addNavigationProgressColumn() {
  try {
    console.log('Adding navigation_progress column to users table...');
    
    // Add the column if it doesn't exist
    await client`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS navigation_progress TEXT
    `;
    
    console.log('Successfully added navigation_progress column');
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Error adding navigation_progress column:', error);
    await client.end();
    process.exit(1);
  }
}

addNavigationProgressColumn();
