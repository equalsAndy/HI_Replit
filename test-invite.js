// Simple test script to test the invite creation functionality
const fetch = require('node-fetch');

async function testInviteCreation() {
  try {
    // First, login as admin to get a session
    console.log('Logging in as admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'password'
      }),
      credentials: 'include'
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.error('Login failed:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData);

    // Store the cookies from the login response
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Now, create an invite
    console.log('\nCreating a new invite...');
    const inviteResponse = await fetch('http://localhost:5000/api/admin/invites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        email: 'test@example.com',
        role: 'participant',
        name: 'Test User'
      }),
      credentials: 'include'
    });

    const inviteData = await inviteResponse.json();
    console.log('Invite creation response:', inviteData);

    // Get all invites
    console.log('\nGetting all invites...');
    const allInvitesResponse = await fetch('http://localhost:5000/api/admin/invites', {
      method: 'GET',
      headers: {
        'Cookie': cookies
      },
      credentials: 'include'
    });

    const allInvitesData = await allInvitesResponse.json();
    console.log('All invites:', allInvitesData);

  } catch (error) {
    console.error('Error in test:', error);
  }
}

testInviteCreation();