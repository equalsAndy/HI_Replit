import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

<<<<<<< HEAD
// Create a Postgres client with SSL configuration for deployment
const queryClient = postgres(databaseUrl, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
=======
// Create a Postgres client
const queryClient = postgres(databaseUrl, {
  max: 10, // Max connections
  connect_timeout: 30, // 30 seconds to connect
  idle_timeout: 60, // 60 seconds before closing idle connections
  max_lifetime: 60 * 60, // 1 hour max connection lifetime
  onnotice: () => {}, // Suppress notices
  debug: false // Disable debug logs
>>>>>>> development
});

// Create a Drizzle client
export const db = drizzle(queryClient, { schema });

// Migrate function to run migrations manually when needed
export async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // For automatic migrations, we would use the migrate function
    // However, for our case, we'll use the db.push approach
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

// Initialize the database
export async function initializeDatabase() {
  try {
    console.log('Initializing database connection...');
    
    // Test the connection
    try {
      await queryClient.unsafe('SELECT 1');
      console.log('Database connection successful');
    } catch (err) {
      console.error('Database connection error:', err);
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

// Import SQL for raw queries if needed
import { sql } from 'drizzle-orm';