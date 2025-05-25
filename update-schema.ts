import { sql } from 'drizzle-orm';
import { db } from './server/db';

async function updateDatabaseSchema() {
  try {
    console.log('Starting database schema update...');
    
    // Check if role column exists in users table
    const checkRoleColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    // Add role column if it doesn't exist
    if (checkRoleColumn.length === 0) {
      console.log('Adding role column to users table...');
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'participant'
      `);
      console.log('Role column added successfully');
    } else {
      console.log('Role column already exists');
    }
    
    // Check if job_title column exists in users table
    const checkJobTitleColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'job_title'
    `);
    
    // Add job_title column if it doesn't exist
    if (checkJobTitleColumn.length === 0) {
      console.log('Adding job_title column to users table...');
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN job_title TEXT
      `);
      console.log('Job title column added successfully');
    } else {
      console.log('Job title column already exists');
    }
    
    // Check if profile_picture column exists in users table
    const checkProfilePictureColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'profile_picture'
    `);
    
    // Add profile_picture column if it doesn't exist
    if (checkProfilePictureColumn.length === 0) {
      console.log('Adding profile_picture column to users table...');
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN profile_picture TEXT
      `);
      console.log('Profile picture column added successfully');
    } else {
      console.log('Profile picture column already exists');
    }
    
    // Check if invites table exists
    const checkInvitesTable = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'invites'
    `);
    
    // Create invites table if it doesn't exist
    if (checkInvitesTable.length === 0) {
      console.log('Creating invites table...');
      await db.execute(sql`
        CREATE TABLE invites (
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
        )
      `);
      console.log('Invites table created successfully');
    } else {
      console.log('Invites table already exists');
    }
    
    console.log('Database schema update completed successfully');
  } catch (error) {
    console.error('Error updating database schema:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
updateDatabaseSchema();