import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🚀 Starting holistic reports migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '0003_add_holistic_reports.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Holistic reports migration completed successfully!');
    
    // Verify the table was created
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'holistic_reports'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ holistic_reports table created successfully');
    } else {
      console.log('❌ holistic_reports table not found after migration');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // If table already exists, that's okay
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Table already exists - migration skipped');
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);