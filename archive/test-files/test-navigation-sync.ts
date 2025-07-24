/**
 * Test script to sync navigation progress for admin user
 * This will update the database to reflect the actual current step based on assessment data
 */

import { NavigationSyncService } from './server/services/navigation-sync-service.js';

async function testNavigationSync() {
  try {
    console.log('🔄 Testing navigation sync for admin user (ID: 1)');
    
    // Sync the admin user's progress
    const success = await NavigationSyncService.syncUserProgress(1);
    
    if (success) {
      console.log('✅ Navigation progress synced successfully for admin user');
    } else {
      console.log('❌ Failed to sync navigation progress for admin user');
    }
    
    // Test syncing all users
    console.log('\n🔄 Testing bulk sync for all users');
    const syncedCount = await NavigationSyncService.syncAllUsersProgress();
    console.log(`✅ Bulk sync completed: ${syncedCount} users synced`);
    
  } catch (error) {
    console.error('❌ Error during navigation sync test:', error);
  }
}

// Run the test
testNavigationSync();