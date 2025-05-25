import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Database connection string
const connectionString = process.env.DATABASE_URL || '';

// Check if the connection string is available
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a postgres connection
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // How long a connection can stay idle before being closed
  connect_timeout: 10, // How long to wait for a connection
});

// Initialize the database with drizzle
export const db = drizzle(client, { schema });

// Function to test database connection
export async function connectToDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Simple query to test the connection
    const result = await client`SELECT NOW()`;
    
    console.log('Database connection successful:', result[0].now);
    return true;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    throw error;
  }
}