#!/usr/bin/env npx tsx
import "dotenv/config";
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkASTData() {
  try {
    console.log('🔍 Checking AST Workshop Data Structure');
    console.log('=====================================\n');

    // Check what tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE '%assess%' 
        OR table_name LIKE '%workshop%'
        OR table_name LIKE '%user%'
      ORDER BY table_name
    `);

    console.log('📊 Relevant Tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Check users table
    const usersResult = await pool.query(`
      SELECT id, name FROM users LIMIT 5
    `);
    
    console.log('\n👥 Sample Users:');
    usersResult.rows.forEach(user => {
      console.log(`  ${user.id}: ${user.name}`);
    });

    // Check workshop_step_data for AST data
    const astDataResult = await pool.query(`
      SELECT user_id, step_id, COUNT(*) as records
      FROM workshop_step_data 
      WHERE workshop_type = 'ast'
      GROUP BY user_id, step_id
      ORDER BY user_id, step_id
      LIMIT 10
    `);

    console.log('\n📝 AST Workshop Step Data:');
    if (astDataResult.rows.length > 0) {
      astDataResult.rows.forEach(row => {
        console.log(`  User ${row.user_id}, Step ${row.step_id}: ${row.records} records`);
      });
    } else {
      console.log('  No AST workshop data found');
    }

    // Check user_workshop_progress for assessments
    const progressResult = await pool.query(`
      SELECT user_id, step_id, response_data
      FROM user_workshop_progress 
      WHERE step_id IN ('2-2', '3-2') -- Star strengths and flow assessments
      LIMIT 5
    `);

    console.log('\n🎯 Assessment Data in user_workshop_progress:');
    if (progressResult.rows.length > 0) {
      progressResult.rows.forEach(row => {
        console.log(`  User ${row.user_id}, Step ${row.step_id}:`);
        console.log(`    ${JSON.stringify(row.response_data).substring(0, 100)}...`);
      });
    } else {
      console.log('  No assessment data found in user_workshop_progress');
    }

    // Check navigation_progress for completed users
    const navResult = await pool.query(`
      SELECT user_id, completed_steps
      FROM navigation_progress
      WHERE array_length(completed_steps, 1) > 5
      LIMIT 5
    `);

    console.log('\n🧭 Users with Significant Progress:');
    if (navResult.rows.length > 0) {
      navResult.rows.forEach(row => {
        console.log(`  User ${row.user_id}: ${row.completed_steps.length} steps completed`);
      });
    } else {
      console.log('  No users with significant progress found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkASTData();