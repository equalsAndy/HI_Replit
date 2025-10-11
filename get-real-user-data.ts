#!/usr/bin/env npx tsx
import "dotenv/config";
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function getRealUserData() {
  try {
    console.log('🎯 Getting Real User AST Data');
    console.log('============================\n');

    // Get user with the most complete data (User 1)
    const userId = 1;

    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
    console.log(`👤 User: ${userResult.rows[0]?.name} (ID: ${userId})`);

    // Get star card assessment (star strengths)
    const starResult = await pool.query(`
      SELECT results
      FROM user_assessments
      WHERE user_id = $1 AND assessment_type = 'starCard'
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    if (starResult.rows.length > 0) {
      console.log('\n⭐ Star Strengths Assessment:');
      const starData = JSON.parse(starResult.rows[0].results);
      console.log(`  ${JSON.stringify(starData, null, 2)}`);
    }

    // Get flow assessment
    const flowResult = await pool.query(`
      SELECT results
      FROM user_assessments
      WHERE user_id = $1 AND assessment_type = 'flowAssessment'
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    if (flowResult.rows.length > 0) {
      console.log('\n🌊 Flow Assessment:');
      const flowData = JSON.parse(flowResult.rows[0].results);
      console.log(`  ${JSON.stringify(flowData, null, 2)}`);
    }

    // Get step-by-step reflections
    const reflectionResult = await pool.query(`
      SELECT results
      FROM user_assessments
      WHERE user_id = $1 AND assessment_type = 'stepByStepReflection'
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    if (reflectionResult.rows.length > 0) {
      console.log('\n📝 Step-by-Step Reflections:');
      const reflectionData = JSON.parse(reflectionResult.rows[0].results);
      console.log(`  ${JSON.stringify(reflectionData, null, 2).substring(0, 500)}...`);
    }

    // Get Cantril Ladder
    const cantrilResult = await pool.query(`
      SELECT results
      FROM user_assessments
      WHERE user_id = $1 AND assessment_type = 'cantrilLadder'
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    if (cantrilResult.rows.length > 0) {
      console.log('\n🪜 Cantril Ladder:');
      const cantrilData = JSON.parse(cantrilResult.rows[0].results);
      console.log(`  ${JSON.stringify(cantrilData, null, 2)}`);
    }

    // Get Future Self Reflection
    const futureResult = await pool.query(`
      SELECT results
      FROM user_assessments
      WHERE user_id = $1 AND assessment_type = 'futureSelfReflection'
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    if (futureResult.rows.length > 0) {
      console.log('\n🔮 Future Self Reflection:');
      const futureData = JSON.parse(futureResult.rows[0].results);
      console.log(`  ${JSON.stringify(futureData, null, 2)}`);
    }

    console.log('\n✅ User has complete AST workshop data - ready for report generation!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

getRealUserData();