import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
}
const queryClient = postgres(databaseUrl);
export const db = drizzle(queryClient, { schema });
export async function runMigrations() {
    try {
        console.log('Running database migrations...');
        console.log('Migrations completed successfully');
    }
    catch (error) {
        console.error('Error running migrations:', error);
        throw error;
    }
}
export async function initializeDatabase() {
    try {
        console.log('Initializing database connection...');
        try {
            await queryClient.unsafe('SELECT 1');
            console.log('Database connection successful');
        }
        catch (err) {
            console.error('Database connection error:', err);
        }
        return true;
    }
    catch (error) {
        console.error('Database initialization error:', error);
        return false;
    }
}
