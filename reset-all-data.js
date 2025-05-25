
/**
 * Reset All User Data Script
 * This script resets all user data in the database using the existing reset service
 */

import { ResetService } from './server/services/reset-service.js';
import { db } from './server/db.js';
import { users } from './shared/schema.js';

async function resetAllUserData() {
  console.log('=== RESETTING ALL USER DATA ===');
  
  try {
    // Get all users from the database
    const allUsers = await db.select({ id: users.id, username: users.username }).from(users);
    
    console.log(`Found ${allUsers.length} users to reset`);
    
    const results = [];
    
    // Reset each user's data
    for (const user of allUsers) {
      console.log(`\nResetting data for user ${user.id} (${user.username})...`);
      
      try {
        const resetResult = await ResetService.resetAllUserData(user.id);
        results.push({
          userId: user.id,
          username: user.username,
          success: resetResult.success,
          message: resetResult.message
        });
        
        if (resetResult.success) {
          console.log(`✅ Successfully reset user ${user.id} (${user.username})`);
        } else {
          console.log(`❌ Failed to reset user ${user.id} (${user.username}): ${resetResult.message}`);
        }
      } catch (error) {
        console.error(`❌ Error resetting user ${user.id} (${user.username}):`, error.message);
        results.push({
          userId: user.id,
          username: user.username,
          success: false,
          message: `Error: ${error.message}`
        });
      }
    }
    
    // Summary
    console.log('\n=== RESET SUMMARY ===');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Total users processed: ${results.length}`);
    console.log(`Successful resets: ${successful}`);
    console.log(`Failed resets: ${failed}`);
    
    if (failed > 0) {
      console.log('\nFailed resets:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`- User ${r.userId} (${r.username}): ${r.message}`);
      });
    }
    
    console.log('\n=== RESET COMPLETE ===');
    process.exit(0);
    
  } catch (error) {
    console.error('Fatal error during reset:', error);
    process.exit(1);
  }
}

// Run the reset
resetAllUserData();
