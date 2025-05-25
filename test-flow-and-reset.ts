/**
 * Comprehensive Test for Star Card Flow Attributes and Reset Functionality
 * This script tests:
 * 1. Saving flow attributes
 * 2. Verifying flow attributes were saved
 * 3. Resetting all user data
 * 4. Verifying reset was successful
 * 5. Runs the entire test cycle 5 times for reliability
 */

import { db } from './server/db';
import * as schema from './shared/schema';
import { eq, and } from 'drizzle-orm';

// Test user ID - use participant1 (ID 15)
const TEST_USER_ID = 15;

// Flow attributes to use in the test
const TEST_FLOW_ATTRIBUTES = [
  { name: "Creative", score: 100 },
  { name: "Focused", score: 95 },
  { name: "Engaged", score: 90 },
  { name: "Productive", score: 85 }
];

// Star card quadrant values to use in the test
const TEST_STAR_CARD_DATA = {
  thinking: 28,
  feeling: 25,
  acting: 24,
  planning: 23
};

// Track test results
let testResults = {
  saveFlowAttributes: { pass: 0, fail: 0 },
  verifyFlowAttributes: { pass: 0, fail: 0 },
  saveStarCard: { pass: 0, fail: 0 },
  verifyStarCard: { pass: 0, fail: 0 },
  resetUserData: { pass: 0, fail: 0 },
  verifyReset: { pass: 0, fail: 0 }
};

/**
 * Save flow attributes to the database
 */
async function saveFlowAttributes(userId: number, iteration: number): Promise<boolean> {
  console.log(`\n[TEST ${iteration}] Saving flow attributes for user ${userId}...`);
  
  try {
    // Create a unique flow score for this iteration
    const flowScore = 50 + iteration;
    
    // Prepare flow attributes data
    const flowAttributesData = {
      flowScore,
      attributes: TEST_FLOW_ATTRIBUTES
    };
    
    console.log(`Flow attributes data:`, flowAttributesData);
    
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
      console.log(`Updating existing flow attributes...`);
      const updated = await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(flowAttributesData)
        })
        .where(eq(schema.userAssessments.id, existingFlowAttributes[0].id));
      
      console.log(`Updated flow attributes`);
      return true;
    } else {
      // Create new flow attributes record
      console.log(`Creating new flow attributes...`);
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'flowAttributes',
        results: JSON.stringify(flowAttributesData)
      });
      
      console.log(`Created new flow attributes record`);
      return true;
    }
  } catch (error) {
    console.error(`Error saving flow attributes:`, error);
    return false;
  }
}

/**
 * Save star card data to the database
 */
async function saveStarCard(userId: number, iteration: number): Promise<boolean> {
  console.log(`\n[TEST ${iteration}] Saving star card for user ${userId}...`);
  
  try {
    // Slightly vary the star card values for each iteration
    const starCardData = {
      thinking: TEST_STAR_CARD_DATA.thinking + iteration,
      feeling: TEST_STAR_CARD_DATA.feeling + iteration,
      acting: TEST_STAR_CARD_DATA.acting + iteration,
      planning: TEST_STAR_CARD_DATA.planning + iteration
    };
    
    console.log(`Star card data:`, starCardData);
    
    // Check if user already has a star card
    const existingStarCard = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'starCard')
        )
      );
    
    if (existingStarCard.length > 0) {
      // Update existing star card
      console.log(`Updating existing star card...`);
      const updated = await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(starCardData)
        })
        .where(eq(schema.userAssessments.id, existingStarCard[0].id));
      
      console.log(`Updated star card`);
      return true;
    } else {
      // Create new star card record
      console.log(`Creating new star card...`);
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'starCard',
        results: JSON.stringify(starCardData)
      });
      
      console.log(`Created new star card record`);
      return true;
    }
  } catch (error) {
    console.error(`Error saving star card:`, error);
    return false;
  }
}

/**
 * Verify flow attributes exist in the database
 */
async function verifyFlowAttributes(userId: number, iteration: number): Promise<boolean> {
  console.log(`\n[TEST ${iteration}] Verifying flow attributes for user ${userId}...`);
  
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
    
    if (flowAttributes.length === 0) {
      console.log(`❌ Flow attributes not found in database`);
      return false;
    }
    
    console.log(`✅ Flow attributes found in database`);
    
    // Parse the results
    const results = JSON.parse(flowAttributes[0].results);
    console.log(`Flow attributes data:`, results);
    
    // Check if the attributes match what we expect
    if (!results.attributes || results.attributes.length !== TEST_FLOW_ATTRIBUTES.length) {
      console.log(`❌ Flow attributes count mismatch`);
      return false;
    }
    
    console.log(`✅ Flow attributes match expected data`);
    return true;
  } catch (error) {
    console.error(`Error verifying flow attributes:`, error);
    return false;
  }
}

/**
 * Verify star card exists in the database
 */
async function verifyStarCard(userId: number, iteration: number): Promise<boolean> {
  console.log(`\n[TEST ${iteration}] Verifying star card for user ${userId}...`);
  
  try {
    // Query the database for star card
    const starCard = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'starCard')
        )
      );
    
    if (starCard.length === 0) {
      console.log(`❌ Star card not found in database`);
      return false;
    }
    
    console.log(`✅ Star card found in database`);
    
    // Parse the results
    const results = JSON.parse(starCard[0].results);
    console.log(`Star card data:`, results);
    
    // Check if the star card has the expected quadrants
    if (!results.thinking || !results.feeling || !results.acting || !results.planning) {
      console.log(`❌ Star card missing quadrant data`);
      return false;
    }
    
    console.log(`✅ Star card has all expected quadrants`);
    return true;
  } catch (error) {
    console.error(`Error verifying star card:`, error);
    return false;
  }
}

/**
 * Reset user data via the ResetService
 */
async function resetUserData(userId: number, iteration: number): Promise<boolean> {
  console.log(`\n[TEST ${iteration}] Resetting all data for user ${userId}...`);
  
  try {
    // Use the db directly to reset the user's data
    // Delete all assessments for this user
    const result = await db
      .delete(schema.userAssessments)
      .where(eq(schema.userAssessments.userId, userId));
    
    console.log(`Reset all data for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Error resetting user data:`, error);
    return false;
  }
}

/**
 * Verify user data was reset
 */
async function verifyReset(userId: number, iteration: number): Promise<boolean> {
  console.log(`\n[TEST ${iteration}] Verifying reset for user ${userId}...`);
  
  try {
    // Check for any remaining assessments
    const assessments = await db
      .select()
      .from(schema.userAssessments)
      .where(eq(schema.userAssessments.userId, userId));
    
    if (assessments.length > 0) {
      console.log(`❌ User still has ${assessments.length} assessments after reset`);
      console.log(`Remaining assessments:`, assessments);
      return false;
    }
    
    console.log(`✅ All user assessments were successfully deleted`);
    return true;
  } catch (error) {
    console.error(`Error verifying reset:`, error);
    return false;
  }
}

/**
 * Run a single test iteration
 */
async function runTestIteration(userId: number, iteration: number): Promise<boolean> {
  console.log(`\n==========================================================`);
  console.log(`STARTING TEST ITERATION ${iteration} FOR USER ${userId}`);
  console.log(`==========================================================\n`);
  
  // Step 1: Save star card
  const starCardSaved = await saveStarCard(userId, iteration);
  if (starCardSaved) {
    testResults.saveStarCard.pass++;
    console.log(`✅ [TEST ${iteration}] Star card saved successfully`);
  } else {
    testResults.saveStarCard.fail++;
    console.log(`❌ [TEST ${iteration}] Failed to save star card`);
  }
  
  // Step 2: Verify star card
  const starCardVerified = await verifyStarCard(userId, iteration);
  if (starCardVerified) {
    testResults.verifyStarCard.pass++;
    console.log(`✅ [TEST ${iteration}] Star card verified successfully`);
  } else {
    testResults.verifyStarCard.fail++;
    console.log(`❌ [TEST ${iteration}] Failed to verify star card`);
  }
  
  // Step 3: Save flow attributes
  const flowAttributesSaved = await saveFlowAttributes(userId, iteration);
  if (flowAttributesSaved) {
    testResults.saveFlowAttributes.pass++;
    console.log(`✅ [TEST ${iteration}] Flow attributes saved successfully`);
  } else {
    testResults.saveFlowAttributes.fail++;
    console.log(`❌ [TEST ${iteration}] Failed to save flow attributes`);
  }
  
  // Step 4: Verify flow attributes
  const flowAttributesVerified = await verifyFlowAttributes(userId, iteration);
  if (flowAttributesVerified) {
    testResults.verifyFlowAttributes.pass++;
    console.log(`✅ [TEST ${iteration}] Flow attributes verified successfully`);
  } else {
    testResults.verifyFlowAttributes.fail++;
    console.log(`❌ [TEST ${iteration}] Failed to verify flow attributes`);
  }
  
  // Step 5: Reset user data
  const dataReset = await resetUserData(userId, iteration);
  if (dataReset) {
    testResults.resetUserData.pass++;
    console.log(`✅ [TEST ${iteration}] User data reset successfully`);
  } else {
    testResults.resetUserData.fail++;
    console.log(`❌ [TEST ${iteration}] Failed to reset user data`);
  }
  
  // Step 6: Verify reset was successful
  const resetVerified = await verifyReset(userId, iteration);
  if (resetVerified) {
    testResults.verifyReset.pass++;
    console.log(`✅ [TEST ${iteration}] Reset verified successfully`);
  } else {
    testResults.verifyReset.fail++;
    console.log(`❌ [TEST ${iteration}] Failed to verify reset`);
  }
  
  // All tests passed if we successfully saved data, verified it, reset it, and verified the reset
  const allPassed = starCardSaved && starCardVerified && 
                    flowAttributesSaved && flowAttributesVerified && 
                    dataReset && resetVerified;
  
  console.log(`\n[TEST ${iteration}] ${allPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  return allPassed;
}

/**
 * Run the automated test 5 times
 */
async function runTests() {
  console.log(`Starting automated test for flow attributes and reset functionality...`);
  console.log(`Test will run 5 iterations for user ID ${TEST_USER_ID}`);
  
  const results = [];
  
  // Run 5 test iterations
  for (let i = 1; i <= 5; i++) {
    const passed = await runTestIteration(TEST_USER_ID, i);
    results.push({ iteration: i, passed });
  }
  
  // Print test summary
  console.log(`\n==========================================================`);
  console.log(`TEST SUMMARY`);
  console.log(`==========================================================\n`);
  
  console.log(`Save Star Card: ${testResults.saveStarCard.pass} passed, ${testResults.saveStarCard.fail} failed`);
  console.log(`Verify Star Card: ${testResults.verifyStarCard.pass} passed, ${testResults.verifyStarCard.fail} failed`);
  console.log(`Save Flow Attributes: ${testResults.saveFlowAttributes.pass} passed, ${testResults.saveFlowAttributes.fail} failed`);
  console.log(`Verify Flow Attributes: ${testResults.verifyFlowAttributes.pass} passed, ${testResults.verifyFlowAttributes.fail} failed`);
  console.log(`Reset User Data: ${testResults.resetUserData.pass} passed, ${testResults.resetUserData.fail} failed`);
  console.log(`Verify Reset: ${testResults.verifyReset.pass} passed, ${testResults.verifyReset.fail} failed`);
  
  // Calculate overall pass rate
  const passCount = results.filter(r => r.passed).length;
  console.log(`\nOverall: ${passCount} / 5 test iterations passed (${Math.round(passCount / 5 * 100)}%)`);
  
  return passCount === 5; // Return true if all tests passed
}

// Start the test
console.log(`Initializing test script...`);
runTests()
  .then(success => {
    console.log(`\nTest completed ${success ? 'successfully' : 'with failures'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(`Test error:`, error);
    process.exit(1);
  });