/**
 * Test script to validate the new 'student' role functionality
 * This script tests:
 * 1. Schema validation accepts all valid roles including 'student'
 * 2. Schema validation rejects invalid roles
 * 3. TypeScript type safety with UserRole type
 */

import { insertUserSchema, UserRoles, type UserRole } from './shared/schema.js';
import { z } from 'zod';

async function testRoleValidation() {
  console.log('🧪 Testing User Role Schema Validation\n');

  // Test 1: Validate all defined roles are accepted
  console.log('✅ Test 1: Valid Role Acceptance');
  const validRoles: UserRole[] = ['admin', 'facilitator', 'participant', 'student'];
  
  for (const role of validRoles) {
    try {
      const testUser = {
        username: `test_${role}`,
        password: 'testpassword123',
        name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        email: `test_${role}@example.com`,
        role: role
      };
      
      const validatedUser = insertUserSchema.parse(testUser);
      console.log(`  ✓ Role '${role}' accepted: ${validatedUser.role}`);
    } catch (error) {
      console.log(`  ✗ Role '${role}' rejected: ${error}`);
    }
  }

  // Test 2: Validate invalid roles are rejected
  console.log('\n❌ Test 2: Invalid Role Rejection');
  const invalidRoles = ['teacher', 'manager', 'user', 'guest', ''];
  
  for (const role of invalidRoles) {
    try {
      const testUser = {
        username: `test_invalid`,
        password: 'testpassword123',
        name: 'Test Invalid',
        email: 'test_invalid@example.com',
        role: role
      };
      
      const validatedUser = insertUserSchema.parse(testUser);
      console.log(`  ✗ Invalid role '${role}' was incorrectly accepted`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(`  ✓ Role '${role}' correctly rejected`);
      } else {
        console.log(`  ? Role '${role}' rejected with unexpected error: ${error}`);
      }
    }
  }

  // Test 3: Default role behavior
  console.log('\n🔧 Test 3: Default Role Behavior');
  try {
    const testUserWithoutRole = {
      username: 'test_default',
      password: 'testpassword123',
      name: 'Test Default',
      email: 'test_default@example.com'
      // No role specified - should default to 'participant'
    };
    
    const validatedUser = insertUserSchema.parse(testUserWithoutRole);
    console.log(`  ✓ Default role applied: ${validatedUser.role}`);
  } catch (error) {
    console.log(`  ✗ Default role test failed: ${error}`);
  }

  // Test 4: UserRoles constant validation
  console.log('\n📋 Test 4: UserRoles Constant Validation');
  console.log(`  Available roles: [${UserRoles.join(', ')}]`);
  console.log(`  Student role included: ${UserRoles.includes('student')}`);
  console.log(`  Total role count: ${UserRoles.length}`);

  console.log('\n🎉 Role validation testing complete!');
}

// Run the test
testRoleValidation().catch(console.error);