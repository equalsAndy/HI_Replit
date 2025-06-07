/**
 * Test script to create flow assessment data for admin user
 */
import { db } from './server/db';
import * as schema from './shared/schema';
import { eq, and } from 'drizzle-orm';

async function createFlowAssessmentData() {
  try {
    const userId = 1; // Admin user
    
    // Create sample flow assessment data
    const assessmentData = {
      answers: {
        1: 4, // Often
        2: 3, // Sometimes
        3: 5, // Always
        4: 4, // Often
        5: 3, // Sometimes
        6: 4, // Often
        7: 5, // Always
        8: 3, // Sometimes
        9: 4, // Often
        10: 3 // Sometimes
      },
      flowScore: 38, // Total score
      completed: true,
      completedAt: new Date().toISOString()
    };

    // Check if assessment already exists
    const existingAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'flowAssessment')
        )
      );

    if (existingAssessment.length > 0) {
      // Update existing
      console.log('Updating existing flow assessment...');
      await db
        .update(schema.userAssessments)
        .set({
          results: JSON.stringify(assessmentData)
        })
        .where(eq(schema.userAssessments.id, existingAssessment[0].id));
      
      console.log('✅ Flow assessment updated successfully');
    } else {
      // Create new
      console.log('Creating new flow assessment...');
      await db.insert(schema.userAssessments).values({
        userId,
        assessmentType: 'flowAssessment',
        results: JSON.stringify(assessmentData)
      });
      
      console.log('✅ Flow assessment created successfully');
    }

    // Verify the data was saved
    const savedAssessment = await db
      .select()
      .from(schema.userAssessments)
      .where(
        and(
          eq(schema.userAssessments.userId, userId),
          eq(schema.userAssessments.assessmentType, 'flowAssessment')
        )
      );

    if (savedAssessment.length > 0) {
      const results = JSON.parse(savedAssessment[0].results);
      console.log('✅ Verification successful - Flow assessment data:', results);
    } else {
      console.log('❌ Verification failed - No assessment found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

createFlowAssessmentData();