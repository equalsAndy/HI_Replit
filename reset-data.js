/**
 * Data Reset Tool for AllStarTeams Workshop
 * This script uses direct SQL commands to reset user workshop data
 * Use this when the reset API is not working
 */
import pg from 'pg';
const { Client } = pg;

// Connect to the database using environment variables
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Main function to reset user data
async function resetUserData(userId) {
  console.log(`\n=== STARTING DATA RESET FOR USER ${userId} ===`);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // 1. Check if user has any star card data
    const checkQuery = `
      SELECT * FROM user_assessments 
      WHERE user_id = $1 AND assessment_type = 'starCard';
    `;
    
    const checkResult = await client.query(checkQuery, [userId]);
    
    if (checkResult.rows.length === 0) {
      console.log(`No star card data found for user ${userId}`);
    } else {
      console.log(`Found ${checkResult.rows.length} star card records for user ${userId}`);
      
      // Display the data before deleting
      checkResult.rows.forEach(row => {
        const parsed = JSON.parse(row.results);
        console.log(`Record ID ${row.id}: thinking=${parsed.thinking}, feeling=${parsed.feeling}, acting=${parsed.acting}, planning=${parsed.planning}`);
      });
      
      // 2. Delete star card data
      const deleteStarCardQuery = `
        DELETE FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'starCard';
      `;
      
      const deleteResult = await client.query(deleteStarCardQuery, [userId]);
      console.log(`Deleted ${deleteResult.rowCount} star card records for user ${userId}`);
    }
    
    // 3. Check if user has any flow attributes data
    const checkFlowQuery = `
      SELECT * FROM user_assessments 
      WHERE user_id = $1 AND assessment_type = 'flowAttributes';
    `;
    
    const checkFlowResult = await client.query(checkFlowQuery, [userId]);
    
    if (checkFlowResult.rows.length === 0) {
      console.log(`No flow attributes data found for user ${userId}`);
    } else {
      console.log(`Found ${checkFlowResult.rows.length} flow attribute records for user ${userId}`);
      
      // 4. Delete flow attributes data
      const deleteFlowQuery = `
        DELETE FROM user_assessments 
        WHERE user_id = $1 AND assessment_type = 'flowAttributes';
      `;
      
      const deleteFlowResult = await client.query(deleteFlowQuery, [userId]);
      console.log(`Deleted ${deleteFlowResult.rowCount} flow attribute records for user ${userId}`);
    }
    
    console.log(`\n=== DATA RESET COMPLETE FOR USER ${userId} ===`);
    return true;
  } catch (error) {
    console.error('Error resetting user data:', error);
    return false;
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

// Get user ID from command line arguments
const userId = process.argv[2] ? parseInt(process.argv[2]) : null;

if (!userId) {
  console.error('Please provide a user ID as a command line argument. Example: node reset-data.js 15');
  process.exit(1);
}

// Run the reset function
resetUserData(userId).then(success => {
  if (success) {
    console.log('Reset completed successfully.');
    process.exit(0);
  } else {
    console.error('Reset failed.');
    process.exit(1);
  }
});