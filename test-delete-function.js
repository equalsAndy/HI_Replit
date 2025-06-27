/**
 * Test script to verify the fixed deleteUserData function
 */
import { userManagementService } from './server/services/user-management-service.js';

async function testDeleteFunction() {
  try {
    console.log('🧪 Testing admin user data delete function...\n');
    
    // Test deleting data for user ID 1 (admin user)
    const result = await userManagementService.deleteUserData(1);
    
    console.log('✅ Delete function completed with result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n📊 Deletion Summary:');
      console.log(`- User Assessments: ${result.deletedData.userAssessments} records`);
      console.log(`- Navigation Progress Table: ${result.deletedData.navigationProgressTable} records`);
      console.log(`- Navigation Progress Field: ${result.deletedData.navigationProgressField ? 'Cleared' : 'Not cleared'}`);
      console.log(`- Workshop Participation: ${result.deletedData.workshopParticipation} records`);
      console.log(`- Growth Plans: ${result.deletedData.growthPlans} records`);
      console.log(`- Final Reflections: ${result.deletedData.finalReflections} records`);
      console.log(`- Discernment Progress: ${result.deletedData.discernmentProgress} records`);
      console.log(`\n${result.summary}`);
    } else {
      console.error('❌ Delete function failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testDeleteFunction();