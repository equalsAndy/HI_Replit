/**
 * Direct Database Test for Flow Attributes
 * This script bypasses the API and directly tests database operations
 * for saving and retrieving flow attributes
 */
import { db } from './server/db.js';
import * as schema from './shared/schema.js';
import { eq, and } from 'drizzle-orm';

// Test user ID
const TEST_USER_ID = 15;

// Perform direct database operation to save flow attributes
async function directSaveFlowAttributes(userId) {
  console.log(`Saving flow attributes directly to database for user ${userId}`);
  
  // Generate test data with 4 attributes
  const attributes = [
    { name: "Creative", score: 100 },
    { name: "Focused", score: 95 },
    { name: "Engaged", score: 90 },
    { name: "Productive", score: 85 }
  ];
  
  const flowScore = 52; // Random score between 45-60
  
  const flowAttributesData = {
    flowScore,
    attributes
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
      console.log('Updating existing flow attributes');
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
      console.log('Creating new flow attributes');
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

// Verify flow attributes were saved
async function verifyFlowAttributes(userId) {
  console.log(`Verifying flow attributes for user ${userId}`);
  
  try {
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
    
    // Parse results to verify content
    const parsedResults = JSON.parse(flowAttributes[0].results);
    console.log('Parsed flow attributes:', parsedResults);
    
    return {
      success: true,
      data: parsedResults
    };
  } catch (error) {
    console.error('Error verifying flow attributes:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Main function
async function main() {
  console.log('Running direct flow attributes test');
  
  try {
    // Save flow attributes
    const saveResult = await directSaveFlowAttributes(TEST_USER_ID);
    console.log('Save result:', saveResult);
    
    if (!saveResult) {
      console.error('❌ Failed to save flow attributes');
      return;
    }
    
    // Verify flow attributes
    const verifyResult = await verifyFlowAttributes(TEST_USER_ID);
    console.log('Verify result:', verifyResult);
    
    if (verifyResult.success) {
      console.log('✅ Successfully saved and verified flow attributes');
    } else {
      console.error('❌ Failed to verify flow attributes');
    }
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Close database connection
    console.log('Test completed, closing database connection');
  }
}

// Run the test
console.log('Connecting to database...');
db.connect()
  .then(() => {
    console.log('Database connected successfully');
    return main();
  })
  .catch(error => {
    console.error('Database connection error:', error);
  });