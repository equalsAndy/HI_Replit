// Test script to check the PUT user endpoint, simulating the client app implementation
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
      }),
      credentials: 'include'
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

// Test the update user endpoint using the app's apiRequest pattern
const testUpdateUserLikeApp = async () => {
  try {
    const cookie = await getCookie();
    if (!cookie) {
      console.error('Failed to get authentication cookie');
      return;
    }
    
    const userId = 1; // User ID to update
    const data = {
      name: 'System Administrator',
      isTestUser: true
    };

    console.log('🌐 Making PUT request to:', `/api/admin/users/${userId}`);
    console.log('🌐 Request body:', JSON.stringify(data, null, 2));
    
    const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Type:', response.headers.get('content-type'));
    
    try {
      const responseData = await response.json();
      console.log('API Response Body:', responseData);
    } catch (e) {
      const text = await response.text();
      console.error('Response is not valid JSON:', e.message);
      console.log('Raw response:', text);
    }
  } catch (err) {
    console.error('Error testing API:', err);
  }
};

// Execute the test
testUpdateUserLikeApp();
