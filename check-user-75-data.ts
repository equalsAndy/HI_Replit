/**
 * Script to check User 75's AST 5-2 assessment profile data
 * Run with: tsx check-user-75-data.ts
 */

import pg from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

const { Pool } = pg;

// Create PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkUser75Data() {
  const client = await pool.connect();
  
  try {
    console.log('=== Checking User 75 Assessment Profile Data ===\n');
    
    // First, verify user 75 exists
    const userCheck = await client.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [75]
    );
    
    if (userCheck.rows.length === 0) {
      console.log('❌ User 75 does not exist in the database');
      return;
    }
    
    console.log('✅ User 75 exists:');
    console.log(`   Name: ${userCheck.rows[0].name}`);
    console.log(`   Email: ${userCheck.rows[0].email}\n`);
    
    // Check for assessment profile data
    console.log('--- Checking user_assessments table ---');
    const assessmentProfile = await client.query(
      `SELECT * FROM user_assessments 
       WHERE user_id = $1 AND assessment_type = 'assessmentProfile'
       ORDER BY created_at DESC`,
      [75]
    );
    
    if (assessmentProfile.rows.length === 0) {
      console.log('❌ No assessment profile data found for user 75');
    } else {
      console.log(`✅ Found ${assessmentProfile.rows.length} assessment profile record(s):\n`);
      
      assessmentProfile.rows.forEach((record: any, index: number) => {
        console.log(`Record #${index + 1}:`);
        console.log(`  ID: ${record.id}`);
        console.log(`  Created: ${record.created_at}`);
        console.log(`  Results:\n`);
        
        try {
          const results = JSON.parse(record.results);
          
          // MBTI
          console.log(`  🧠 MBTI:`);
          console.log(`     Familiarity: ${results.mbti_familiarity || 'Not set'}`);
          console.log(`     Result: ${results.mbti_result || 'Not set'}`);
          
          // Enneagram
          console.log(`\n  🎯 Enneagram:`);
          console.log(`     Familiarity: ${results.enneagram_familiarity || 'Not set'}`);
          console.log(`     Result: ${results.enneagram_result || 'Not set'}`);
          
          // CliftonStrengths
          console.log(`\n  💪 CliftonStrengths:`);
          console.log(`     Familiarity: ${results.clifton_familiarity || 'Not set'}`);
          console.log(`     Result: ${results.clifton_result || 'Not set'}`);
          
          // DISC
          console.log(`\n  📊 DISC:`);
          console.log(`     Familiarity: ${results.disc_familiarity || 'Not set'}`);
          console.log(`     Result: ${results.disc_result || 'Not set'}`);
          
          console.log('\n  Raw JSON:');
          console.log(JSON.stringify(results, null, 2));
        } catch (error: any) {
          console.log(`  ⚠️ Error parsing results: ${error.message}`);
          console.log(`  Raw data: ${record.results}`);
        }
        console.log('\n' + '='.repeat(60) + '\n');
      });
    }
    
    // Also check for any other assessment types for user 75
    console.log('--- Checking all assessment types for user 75 ---');
    const allAssessments = await client.query(
      `SELECT assessment_type, created_at 
       FROM user_assessments 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [75]
    );
    
    if (allAssessments.rows.length === 0) {
      console.log('❌ No assessments of any type found for user 75');
    } else {
      console.log(`\n✅ Found ${allAssessments.rows.length} total assessment(s):\n`);
      allAssessments.rows.forEach((assessment: any, index: number) => {
        console.log(`  ${index + 1}. ${assessment.assessment_type} (${assessment.created_at})`);
      });
    }
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the check
checkUser75Data();
