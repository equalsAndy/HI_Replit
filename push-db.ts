import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

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
  
  // Create a Postgres client with explicit URL string
  const queryClient = postgres(databaseUrl, { ssl: { rejectUnauthorized: false } });
  
  // Create a Drizzle client
  const db = drizzle(queryClient, { schema });
  
  try {
    console.log('Pushing schema to database...');
    
    // Create tables if they don't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(20) NOT NULL DEFAULT 'participant',
        organization TEXT,
        job_title TEXT,
        profile_picture TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS invites (
        id SERIAL PRIMARY KEY,
        invite_code VARCHAR(12) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'participant',
        name TEXT,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP,
        used_at TIMESTAMP,
        used_by INTEGER
      );
      
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR(255) PRIMARY KEY,
        sess TEXT NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS workshop_participation (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        workshop_id INTEGER NOT NULL,
        progress TEXT,
        completed BOOLEAN DEFAULT FALSE,
        started_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP,
        last_accessed_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS user_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        assessment_type VARCHAR(50) NOT NULL,
        results TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Schema push completed successfully');
    
    // Check if admin user exists
    const adminUsers = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, 'admin'));
    
    if (adminUsers.length === 0) {
      console.log('Creating default admin user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      
      // Insert admin user
      await db.insert(schema.users).values({
        username: 'admin',
        password: hashedPassword,
        name: 'Administrator',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Default admin user created with username: admin and password: Admin123!');
    } else {
      console.log('Admin user already exists');
    }
    
    // Create a test facilitator and a test participant if they don't exist
    const testUsers = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, 'facilitator'));
    
    if (testUsers.length === 0) {
      console.log('Creating test facilitator user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Facilitator123!', salt);
      
      // Insert facilitator user
      await db.insert(schema.users).values({
        username: 'facilitator',
        password: hashedPassword,
        name: 'Test Facilitator',
        email: 'facilitator@example.com',
        role: 'facilitator',
        organization: 'Heliotrope Imaginal',
        jobTitle: 'Workshop Facilitator',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Test facilitator user created with username: facilitator and password: Facilitator123!');
    }
    
    const participantUsers = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, 'participant'));
    
    if (participantUsers.length === 0) {
      console.log('Creating test participant user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Participant123!', salt);
      
      // Insert participant user
      await db.insert(schema.users).values({
        username: 'participant',
        password: hashedPassword,
        name: 'Test Participant',
        email: 'participant@example.com',
        role: 'participant',
        organization: 'Test Company',
        jobTitle: 'Workshop Participant',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Test participant user created with username: participant and password: Participant123!');
    }
    
    // Create some test invite codes
    const testInvites = await db.select()
      .from(schema.invites)
      .limit(1);
    
    if (testInvites.length === 0) {
      console.log('Creating test invite codes...');
      
      // Insert invite codes
      await db.insert(schema.invites).values([
        {
          inviteCode: 'ABCD1234EFGH',
          email: 'new.facilitator@example.com',
          role: 'facilitator',
          name: 'New Facilitator',
          createdBy: 1, // Admin user ID
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        },
        {
          inviteCode: 'WXYZ5678MNOP',
          email: 'new.participant@example.com',
          role: 'participant',
          name: 'New Participant',
          createdBy: 1, // Admin user ID
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      ]);
      
      console.log('Test invite codes created:');
      console.log('- ABCD-1234-EFGH (for facilitator)');
      console.log('- WXYZ-5678-MNOP (for participant)');
    }
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error during database setup:', error);
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