
import fetch from 'node-fetch';

async function createStudentInvites() {
  try {
    console.log('Creating 5 student invites...\n');
    
    // Student invite data
    const students = [
      { email: 'test1@example.com', name: 'Test Student 1' },
      { email: 'test2@example.com', name: 'Test Student 2' },
      { email: 'test3@example.com', name: 'Test Student 3' },
      { email: 'test4@example.com', name: 'Test Student 4' },
      { email: 'test5@example.com', name: 'Test Student 5' }
    ];
    
    // First, login as admin to get session
    console.log('Logging in as admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('Login failed with status:', loginResponse.status);
      console.error('Error response:', errorText);
      throw new Error(`Failed to login as admin: ${loginResponse.status} - ${errorText}`);
    }
    
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Login successful!\n');
    
    // Create each student invite
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      console.log(`Creating invite for ${student.name} (${student.email})...`);
      
      const inviteResponse = await fetch('http://localhost:5000/api/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        },
        body: JSON.stringify({
          email: student.email,
          role: 'student',
          name: student.name
        })
      });
      
      if (!inviteResponse.ok) {
        const error = await inviteResponse.text();
        console.error(`Failed to create invite for ${student.name}:`, error);
        continue;
      }
      
      const result = await inviteResponse.json();
      
      if (result.success) {
        console.log(`✅ Invite created for ${student.name}`);
        console.log(`   Email: ${student.email}`);
        console.log(`   Invite Code: ${result.invite.formattedCode || result.invite.inviteCode}`);
        console.log(`   Role: student\n`);
      } else {
        console.error(`❌ Failed to create invite for ${student.name}:`, result.error);
      }
    }
    
    console.log('Student invite creation completed!');
    
  } catch (error) {
    console.error('Error creating student invites:', error);
  }
}

createStudentInvites();
