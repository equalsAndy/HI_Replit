import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from './shared/schema';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });
  
  console.log('Creating schema...');
  
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT,
        logo_url TEXT,
        primary_color TEXT DEFAULT 'indigo'
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT,
        title TEXT,
        organization TEXT,
        avatar_url TEXT,
        progress INTEGER DEFAULT 0,
        application_id INTEGER REFERENCES applications(id)
      );

      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        results JSONB,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        options JSONB NOT NULL,
        category TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        ranking JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS star_cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        thinking INTEGER DEFAULT 0,
        acting INTEGER DEFAULT 0,
        feeling INTEGER DEFAULT 0,
        planning INTEGER DEFAULT 0,
        created_at TEXT,
        image_url TEXT,
        state TEXT DEFAULT 'empty'
      );

      CREATE TABLE IF NOT EXISTS flow_attributes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        attributes JSONB NOT NULL,
        flow_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS visualizations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        wellbeing_level INTEGER,
        wellbeing_factors TEXT,
        one_year_vision TEXT,
        specific_changes TEXT,
        quarterly_progress TEXT,
        quarterly_actions TEXT,
        potential_image_urls JSONB,
        image_meaning TEXT,
        future_vision TEXT,
        optimized_flow TEXT,
        happy_life_achievements TEXT,
        future_statement TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Schema created successfully');
  } catch (error) {
    console.error('Error creating schema:', error);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
