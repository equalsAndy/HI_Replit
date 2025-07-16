/**
 * Test script to verify the reset function is working properly
 * This script directly tests the database operations for the reset functionality
 * It will run 5 test iterations to verify reliability
 */

import pg from 'pg';
const { Client } = pg;

// Database connection info from environment variables
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function createStarCardData(userId) {
  // Generate random star card data
  const thinking = Math.floor(Math.random() * 30) + 10; // 10-40
  const feeling = Math.floor(Math.random() * 30) + 10;  // 10-40
  const acting = Math.floor(Math.random() * 30) + 10;   // 10-40
  const planning = Math.floor(Math.random() * 30) + 10; // 10-40
  
  const results = JSON.stringify({ thinking, feeling, acting, planning });
  
  console.log(`Creating star card data for user ${userId}:`, { thinking, feeling, acting, planning });
  
  // Insert directly into the database
  const query = `
    INSERT INTO user_assessments (user_id, assessment_type, results)
    VALUES ($1, $2, $3)
    RETURNING id;
  `;
  
  const res = await client.query(query, [userId, 'starCard', results]);
  console.log(`Created star card with ID: ${res.rows[0].id}`);
  return res.rows[0].id;
}

async function verifyStarCardExists(userId) {
  const query = `
    SELECT * FROM user_assessments 
    WHERE user_id = $1 AND assessment_type = 'starCard';
  `;
  
  const res = await client.query(query, [userId]);
  return {
    exists: res.rows.length > 0,
    data: res.rows.length > 0 ? res.rows[0] : null
  };
}

async function deleteStarCardData(userId) {
  console.log(`Deleting star card data for user ${userId}`);
  
  // This is the same operation our reset service performs
  const query = `
    DELETE FROM user_assessments 
    WHERE user_id = $1 AND assessment_type = 'starCard';
  `;
  
  const res = await client.query(query, [userId]);
  const deletedCount = res.rowCount;
  
  console.log(`Deleted ${deletedCount} star card records for user ${userId}`);
  return deletedCount;
}

async function runTest(userId, testNumber) {
  console.log(`\n=== TEST RUN ${testNumber} ===`);
  
  try {
    // Step 1: Create star card data
    const newCardId = await createStarCardData(userId);
    
    // Step 2: Verify data exists
    const beforeCheck = await verifyStarCardExists(userId);
    console.log(`Star card exists before delete: ${beforeCheck.exists}`);
    
    if (!beforeCheck.exists) {
      console.error('ERROR: Star card was not created successfully.');
      return false;
    }
    
    // Step 3: Execute the delete operation (same as reset service)
    const deletedCount = await deleteStarCardData(userId);
    
    // Step 4: Verify data is deleted
    const afterCheck = await verifyStarCardExists(userId);
    console.log(`Star card exists after delete: ${afterCheck.exists}`);
    
    // Step 5: Determine test result
    const testPassed = !afterCheck.exists && deletedCount > 0;
    console.log(`Test ${testNumber} result: ${testPassed ? 'PASSED' : 'FAILED'}`);
    
    return testPassed;
  } catch (error) {
    console.error(`Error in test run ${testNumber}:`, error);
    return false;
  }
}

async function main() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Clean up any existing star card data first
    await client.query(`DELETE FROM user_assessments WHERE user_id = 15 AND assessment_type = 'starCard'`);
    console.log('Cleaned up existing test data');
    
    // Use test user ID 15 (participant1)
    const userId = 15;
    
    // Run the test 5 times
    const results = [];
    for (let i = 1; i <= 5; i++) {
      const passed = await runTest(userId, i);
      results.push(passed);
    }
    
    // Print overall results
    console.log('\n=== TEST SUMMARY ===');
    results.forEach((passed, index) => {
      console.log(`Test ${index + 1}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const passedCount = results.filter(r => r).length;
    const allPassed = results.every(r => r);
    console.log(`\nResults: ${passedCount}/5 tests passed`);
    console.log(`Overall test result: ${allPassed ? 'PASSED' : 'FAILED'}`);
    
  } catch (error) {
    console.error('Error in main:', error);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

main();