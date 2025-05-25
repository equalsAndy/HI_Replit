import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Create postgres client
const client = postgres(process.env.DATABASE_URL!);

// Create drizzle database instance
export const db = drizzle(client, { schema });

// Connect to the database
export async function connectToDatabase() {
  try {
    // Test the connection
    await client`SELECT 1`;
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    return false;
  }
}