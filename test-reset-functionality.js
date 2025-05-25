/**
 * Test Reset Functionality
 * This script tests if the reset functionality is working correctly
 * It will attempt to reset a test user's data and verify the result
 */

import fetch from 'node-fetch';
const API_URL = 'http://localhost:3000';
const TEST_USER_ID = 15; // Using test user ID 15, update this if needed

async function testResetFunctionality() {
  console.log('Starting reset functionality test...');
  
  try {
    // First, check if the user has any data
    const beforeReset = await fetch(`${API_URL}/api/user/${TEST_USER_ID}/assessments`);
    const beforeResetData = await beforeReset.json();
    
    console.log('User data before reset:', 
      beforeResetData.success ? 
        `Found ${beforeResetData.userAssessments?.length || 0} assessments` : 
        'No user data found');
    
    // Now reset the user's data
    console.log(`Attempting to reset user ${TEST_USER_ID} data...`);
    const resetResponse = await fetch(`${API_URL}/api/reset/user/${TEST_USER_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const resetResult = await resetResponse.json();
    console.log('Reset result:', resetResult);
    
    if (resetResult.success) {
      console.log('Reset appears successful, now verifying...');
      
      // Check if the data was actually reset
      const afterReset = await fetch(`${API_URL}/api/user/${TEST_USER_ID}/assessments`);
      const afterResetData = await afterReset.json();
      
      console.log('User data after reset:', 
        afterResetData.success ? 
          `Found ${afterResetData.userAssessments?.length || 0} assessments` : 
          'No user data found');
      
      // Get star card specific assessments
      const starCardAssessments = afterResetData.userAssessments?.filter(
        a => a.assessmentType === 'starCard'
      ) || [];
      
      // Get flow attributes specific assessments
      const flowAttributesAssessments = afterResetData.userAssessments?.filter(
        a => a.assessmentType === 'flowAttributes'
      ) || [];
      
      console.log(`After reset: Found ${starCardAssessments.length} star card assessments`);
      console.log(`After reset: Found ${flowAttributesAssessments.length} flow attributes assessments`);
      
      if (starCardAssessments.length === 0 && flowAttributesAssessments.length === 0) {
        console.log('✅ TEST PASSED: Reset functionality is working correctly');
      } else {
        console.log('❌ TEST FAILED: Some data was not properly reset');
      }
    } else {
      console.log('❌ TEST FAILED: Reset API returned failure');
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testResetFunctionality();