import { userManagementService } from './server/services/user-management-service.js';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // First, check if admin user already exists
    const existingUser = await userManagementService.getUserByUsername('admin');
    
    if (existingUser.success) {
      console.log('Admin user already exists:', existingUser.user);
      return;
    }
    
    // Create the admin user
    const result = await userManagementService.createUser({
      username: 'admin',
      password: 'password',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      organization: 'AllStar Teams',
      jobTitle: 'Administrator',
      profilePicture: null
    });
    
    if (result.success) {
      console.log('Admin user created successfully:', result.user);
    } else {
      console.error('Failed to create admin user:', result.error);
    }
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
  
  process.exit(0);
}

createAdminUser();
