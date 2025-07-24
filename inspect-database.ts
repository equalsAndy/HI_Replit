import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables first
dotenv.config();

async function inspectDatabaseSchema() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🔍 DATABASE SCHEMA INSPECTION');
  console.log('==============================\n');

  const sql = postgres(databaseUrl);

  try {
    // Check the videos table structure
    const tableInfo = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'videos' 
      ORDER BY ordinal_position
    `;

    console.log('📋 VIDEOS TABLE STRUCTURE:');
    console.log('==========================');
    tableInfo.forEach((col: any) => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
      const defaultVal = col.column_default ? ` [default: ${col.column_default}]` : '';
      console.log(`   ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
    });

    // Check if any other tables exist
    const allTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('\n🗂️  ALL TABLES IN DATABASE:');
    console.log('===========================');
    allTables.forEach((table: any) => {
      console.log(`   📁 ${table.table_name}`);
    });

    // Check if there are any videos at all (maybe in different state)
    const videoCount = await sql`SELECT COUNT(*) as count FROM videos`;
    console.log(`\n📊 Total videos in database: ${videoCount[0].count}`);

    // Check users table to verify we're in the right database
    try {
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`👥 Total users in database: ${userCount[0].count}`);
    } catch (error) {
      console.log('👥 Users table not accessible or doesn\'t exist');
    }

    await sql.end();

    console.log('\n✅ Database inspection completed!');
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Access the admin interface at your app URL');
    console.log('2. Navigate to video management section');
    console.log('3. Add videos using the enhanced interface');
    console.log('4. Test student vs professional mode switching');
    console.log('5. Verify progress tracking unlocks menu items');

  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    throw error;
  }
}

// Execute the inspection
inspectDatabaseSchema()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Inspection failed:', error);
    process.exit(1);
  });
