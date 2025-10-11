// Test script to check the PUT user endpoint
import fetch from 'node-fetch';

// Function to get a cookie from the response
const getCookie = async () => {
  try {
    const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'Heliotrope@2025'
      })
    });
    
    // Get the set-cookie header
    const cookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Cookie:', cookieHeader);
    return cookieHeader;
  } catch (err) {
    console.error('Error logging in:', err);
    return null;
  }
};

// Test the update user endpoint
const testUpdateUser = async () => {
  try {
    const cookie = await getCookie();
    if (!cookie) {
      console.error('Failed to get authentication cookie');
      return;
    }
    
    const userId = 1; // User ID to update
    
    const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Cookie': cookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'System Administrator',
        isTestUser: true
      })
    });
    
    const data = await response.text(); // get raw text response
    console.log('API Response Status:', response.status);
    console.log('API Response Type:', response.headers.get('content-type'));
    console.log('API Response:', data.substring(0, 500) + '...'); // Show first 500 chars
    
    try {
      const json = JSON.parse(data);
      console.log('User updated:', json.user ? 'Yes' : 'No');
    } catch (e) {
      console.error('Response is not valid JSON:', e.message);
    }
  } catch (err) {
    console.error('Error testing API:', err);
  }
};

// Execute the test
testUpdateUser();
