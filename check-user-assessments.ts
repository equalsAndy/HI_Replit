#!/usr/bin/env npx tsx
import "dotenv/config";
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkUserAssessments() {
  try {
    console.log('🔍 Checking User Assessments Table');
    console.log('=================================\n');

    // Check table structure
    const structureResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_assessments'
      ORDER BY ordinal_position
    `);

    console.log('📊 user_assessments Table Structure:');
    structureResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });

    // Check what assessment data exists
    const assessmentsResult = await pool.query(`
      SELECT user_id, assessment_type, created_at
      FROM user_assessments
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('\n📝 Recent Assessments:');
    if (assessmentsResult.rows.length > 0) {
      assessmentsResult.rows.forEach(row => {
        console.log(`  User ${row.user_id}: ${row.assessment_type} (${row.created_at})`);
      });
    } else {
      console.log('  No assessments found');
    }

    // Check for star strengths specifically
    const starResult = await pool.query(`
      SELECT user_id, assessment_scores
      FROM user_assessments
      WHERE assessment_type = 'star_strengths'
      LIMIT 3
    `);

    console.log('\n⭐ Star Strengths Assessments:');
    if (starResult.rows.length > 0) {
      starResult.rows.forEach(row => {
        console.log(`  User ${row.user_id}:`);
        console.log(`    ${JSON.stringify(row.assessment_scores, null, 2)}`);
      });
    } else {
      console.log('  No star strengths assessments found');
    }

    // Check workshop_step_data for AST reflections
    const workshopResult = await pool.query(`
      SELECT user_id, step_id, responses
      FROM workshop_step_data
      WHERE workshop_type = 'ast'
      ORDER BY user_id, step_id
      LIMIT 5
    `);

    console.log('\n📚 AST Workshop Step Data:');
    if (workshopResult.rows.length > 0) {
      workshopResult.rows.forEach(row => {
        console.log(`  User ${row.user_id}, Step ${row.step_id}:`);
        console.log(`    ${JSON.stringify(row.responses).substring(0, 100)}...`);
      });
    } else {
      console.log('  No AST workshop step data found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUserAssessments();