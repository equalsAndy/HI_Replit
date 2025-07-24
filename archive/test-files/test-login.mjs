import fetch from 'node-fetch';
import fs from 'fs';

async function testLogin() {
  try {
    console.log('Testing admin login...');
    
    // Attempt login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'password'
      })
    });
    
    // Get cookies from response
    const cookies = loginResponse.headers.raw()['set-cookie'];
    
    if (cookies) {
      console.log('Authentication cookies received');
      fs.writeFileSync('cookies.txt', cookies.join('\n'));
      console.log('Cookies saved to cookies.txt');
    } else {
      console.log('No cookies received from server');
    }
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.success) {
      console.log('Login successful!');
      
      // Test profile endpoint with the cookie
      const profileResponse = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          Cookie: cookies[0]
        }
      });
      
      const profileData = await profileResponse.json();
      console.log('Profile response:', profileData);
      
      if (profileData.success) {
        console.log('Profile retrieved successfully!');
      } else {
        console.log('Failed to retrieve profile:', profileData.error);
      }
    } else {
      console.log('Login failed:', loginData.error);
    }
  } catch (error) {
    console.error('Error testing login:', error);
  }
}

testLogin();