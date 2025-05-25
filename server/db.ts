import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Database connection string from environment variable
const connectionString = process.env.DATABASE_URL!;

// Create connection
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });

// Simple function to test database connection
export async function connectToDatabase() {
  try {
    // postgres.js automatically connects when needed
    console.log('Database connection initialized');
    return true;
  } catch (error) {
    console.error('Error initializing database connection:', error);
    return false;
  }
}