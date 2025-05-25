/**
 * Test Flow Attributes Functionality
 * This script tests the ability to save and retrieve flow attributes
 * It will run 5 test cycles to verify reliability
 */
import fetch from 'node-fetch';
import { db } from './server/db.js';
import { eq, and } from 'drizzle-orm';
import * as schema from './shared/schema.js';

// Test user ID (can be changed as needed)
const TEST_USER_ID = 15;

// Get current timestamp for unique test data
const timestamp = new Date().toISOString();

// Function to create random flow attributes
function generateFlowAttributes(iteration) {
  // Create a list of sample flow attributes
  const allAttributes = [
    "Creative", "Energized", "Focused", "Engaged", "Optimistic", 
    "Challenged", "Present", "Productive", "Inspired", "Confident",
    "Curious", "Determined", "Passionate", "Purposeful", "Connected"
  ];
  
  // Select 4 random attributes for this test
  const selectedAttributes = [];
  while (selectedAttributes.length < 4) {
    const randomIndex = Math.floor(Math.random() * allAttributes.length);
    const attr = allAttributes[randomIndex];
    if (!selectedAttributes.includes(attr)) {
      selectedAttributes.push(attr);
    }
  }
  
  // Random flow score between 45 and 60
  const flowScore = Math.floor(Math.random() * 16) + 45;
  
  // Format attributes for API
  const attributes = selectedAttributes.map((name, index) => ({
    name,
    score: 100 - (index * 5) // Scores from 100 to 85
  }));
  
  return {
    flowScore,
    attributes,
    testInfo: {
      iteration,
      timestamp
    }
  };
}

// Function to verify flow attributes exist in database
async function verifyFlowAttributes(userId, testData) {
  console.log(`Verifying flow attributes for user ${userId}...`);
  
  // Query the database for flow attributes
  const flowAttributes = await db
    .select()
    .from(schema.userAssessments)
    .where(
      and(
        eq(schema.userAssessments.userId, userId),
        eq(schema.userAssessments.assessmentType, 'flowAttributes')
      )
    );
  
  if (flowAttributes.length === 0) {
    console.error('❌ Flow attributes not found in database');
    return false;
  }
  
  console.log('✅ Flow attributes found in database');
  
  // Parse the results
  const storedData = JSON.parse(flowAttributes[0].results);
  console.log('Stored flow attributes:', storedData);
  
  // Verify the data matches what we expected
  const attributesMatch = storedData.attributes.length === testData.attributes.length;
  
  if (!attributesMatch) {
    console.error('❌ Attribute count mismatch');
    return false;
  }
  
  console.log('✅ Attribute count matches');
  return true;
}

// Function to delete flow attributes
async function deleteFlowAttributes(userId) {
  console.log(`Deleting flow attributes for user ${userId}...`);
  
  const deleted = await db
    .delete(schema.userAssessments)
    .where(
      and(
        eq(schema.userAssessments.userId, userId),
        eq(schema.userAssessments.assessmentType, 'flowAttributes')
      )
    )
    .returning();
  
  console.log(`Deleted ${deleted.length} flow attributes records`);
  return deleted.length > 0;
}

// Function to save flow attributes
async function saveFlowAttributes(userId, flowAttributesData) {
  console.log(`Saving flow attributes for user ${userId}...`);
  console.log('Data:', flowAttributesData);
  
  try {
    // Make a direct database call instead of using the API
    // Check if user already has flow attributes
    const existingFlowAttributes = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'flowAttributes')
        )
      );
    
    if (existingFlowAttributes.length > 0) {
      // Update existing flow attributes
      console.log('Updating existing flow attributes...');
      const updated = await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(flowAttributesData)
        })
        .where(eq(schema.userAssessments.id, existingFlowAttributes[0].id))
        .returning();
      
      console.log('Updated flow attributes:', updated);
      return updated.length > 0;
    } else {
      // Create new flow attributes record
      console.log('Creating new flow attributes...');
      const inserted = await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'flowAttributes',
        results: JSON.stringify(flowAttributesData)
      }).returning();
      
      console.log('Inserted flow attributes:', inserted);
      return inserted.length > 0;
    }
  } catch (error) {
    console.error('Error saving flow attributes:', error);
    return false;
  }
}

// Run a single test iteration
async function runTest(userId, iteration) {
  console.log(`\n========== TEST ${iteration} ==========`);
  
  // Generate test data
  const testData = generateFlowAttributes(iteration);
  console.log(`Test ${iteration} data:`, testData);
  
  // Delete any existing flow attributes
  await deleteFlowAttributes(userId);
  
  // Save flow attributes
  const saveSuccess = await saveFlowAttributes(userId, testData);
  
  if (!saveSuccess) {
    console.error(`❌ Test ${iteration} FAILED: Could not save flow attributes`);
    return false;
  }
  
  // Verify flow attributes
  const verifySuccess = await verifyFlowAttributes(userId, testData);
  
  if (!verifySuccess) {
    console.error(`❌ Test ${iteration} FAILED: Could not verify flow attributes`);
    return false;
  }
  
  console.log(`✅ Test ${iteration} PASSED`);
  return true;
}

// Main function to run tests
async function main() {
  console.log('Starting flow attributes tests...');
  
  // Run 5 test iterations
  const results = [];
  for (let i = 1; i <= 5; i++) {
    const success = await runTest(TEST_USER_ID, i);
    results.push({ iteration: i, success });
  }
  
  // Print summary
  console.log('\n========== TEST SUMMARY ==========');
  const passed = results.filter(r => r.success).length;
  console.log(`Passed: ${passed} / 5`);
  
  // Cleanup
  console.log('\nCleaning up test data...');
  await deleteFlowAttributes(TEST_USER_ID);
  
  console.log('Tests completed');
  
  // Exit with success code if all passed
  process.exit(passed === 5 ? 0 : 1);
}

// Connect to database and run tests
console.log('Initializing database connection...');
db.connect()
  .then(() => {
    console.log('Database connection successful');
    return main();
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
    process.exit(1);
  });