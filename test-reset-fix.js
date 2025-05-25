// Test script using common JS require to test reset functionality
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000';
const TEST_USER_ID = 15; // Test user ID

async function testReset() {
  console.log('Starting reset test for user ID:', TEST_USER_ID);
  
  try {
    // Perform the reset
    const resetResponse = await fetch(`${API_URL}/api/reset/user/${TEST_USER_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const resetResult = await resetResponse.json();
    console.log('Reset API response:', resetResult);
    
    if (resetResult.success) {
      console.log('✅ Reset API reports success');
    } else {
      console.log('❌ Reset API reports failure');
      console.log('Error message:', resetResult.message || 'No error message provided');
    }
  } catch (error) {
    console.error('Error during reset test:', error.message);
  }
}

testReset();