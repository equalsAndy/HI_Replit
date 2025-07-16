/**
 * Test Flow Attributes Functionality with TypeScript
 */
import { db } from './server/db';
import { eq, and } from 'drizzle-orm';
import * as schema from './shared/schema';

// Test user ID (using session user ID 15)
const TEST_USER_ID = 15;

// Function to save flow attributes directly to the database
async function saveFlowAttributes(userId: number) {
  console.log(`Saving flow attributes for user ${userId}...`);
  
  // Sample flow attributes data
  const flowAttributesData = {
    flowScore: 52,
    attributes: [
      { name: "Creative", score: 100 },
      { name: "Focused", score: 95 },
      { name: "Engaged", score: 90 },
      { name: "Productive", score: 85 }
    ]
  };
  
  try {
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
    
    console.log('Existing flow attributes:', existingFlowAttributes);
    
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
      const inserted = await db
        .insert(schema.userAssessments)
        .values({
          userId,
          assessmentType: 'flowAttributes',
          results: JSON.stringify(flowAttributesData)
        })
        .returning();
      
      console.log('Inserted flow attributes:', inserted);
      return inserted.length > 0;
    }
  } catch (error) {
    console.error('Error saving flow attributes:', error);
    return false;
  }
}

// Function to verify flow attributes exist in database
async function verifyFlowAttributes(userId: number) {
  console.log(`Verifying flow attributes for user ${userId}...`);
  
  try {
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
    
    console.log('Retrieved flow attributes:', flowAttributes);
    
    if (flowAttributes.length === 0) {
      console.error('❌ Flow attributes not found in database');
      return false;
    }
    
    console.log('✅ Flow attributes found in database');
    
    // Parse the results
    const storedData = JSON.parse(flowAttributes[0].results);
    console.log('Parsed flow attributes data:', storedData);
    
    return true;
  } catch (error) {
    console.error('Error verifying flow attributes:', error);
    return false;
  }
}

// Function to delete flow attributes
async function deleteFlowAttributes(userId: number) {
  console.log(`Deleting flow attributes for user ${userId}...`);
  
  try {
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
  } catch (error) {
    console.error('Error deleting flow attributes:', error);
    return false;
  }
}

// Main function to run the test
async function main() {
  console.log('Starting flow attributes database test...');
  
  try {
    // First, clean up any existing flow attributes
    await deleteFlowAttributes(TEST_USER_ID);
    
    // Save flow attributes
    const saveSuccess = await saveFlowAttributes(TEST_USER_ID);
    
    if (!saveSuccess) {
      console.error('❌ TEST FAILED: Could not save flow attributes');
      return;
    }
    
    // Verify flow attributes
    const verifySuccess = await verifyFlowAttributes(TEST_USER_ID);
    
    if (!verifySuccess) {
      console.error('❌ TEST FAILED: Could not verify flow attributes');
      return;
    }
    
    console.log('✅ TEST PASSED: Successfully saved and verified flow attributes');
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
console.log('Initializing database connection...');
db.connect()
  .then(() => {
    console.log('Database connection successful');
    return main();
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  });