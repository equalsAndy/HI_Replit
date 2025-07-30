import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { photoStorageService } from '../services/photo-storage-service.js';

const router = express.Router();

/**
 * Auto-save StarCard PNG to database or filesystem
 */
router.post('/auto-save', async (req, res) => {
  try {
    console.log('🎯 StarCard Auto-Save: Request received');
    
    const { imageData, userId, saveToDatabase, saveToTempComms, filename } = req.body;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    const results: any = {
      success: true,
      message: 'StarCard saved successfully'
    };

    // Save to database if requested
    if (saveToDatabase && userId) {
      try {
        console.log('🎯 StarCard Auto-Save: Saving to database for user:', userId);
        
        // Check if user already has a StarCard and mark it for replacement
        const existingStarCard = await photoStorageService.getUserStarCard(userId.toString());
        
        if (existingStarCard) {
          console.log('🔄 Found existing StarCard, will replace it');
          // Note: The storePhoto method already handles deduplication via hash
          // If the new image is different, it will create a new entry
          // The old one will have its reference count decremented
        }
        
        const photoId = await photoStorageService.storePhoto(imageData, userId, true);
        results.photoId = photoId;
        results.replaced = !!existingStarCard;
        results.message += ` (Database ID: ${photoId}${existingStarCard ? ', replaced existing' : ''})`;
        console.log('✅ StarCard saved to database with ID:', photoId);
      } catch (error) {
        console.error('❌ Database save failed:', error);
        results.databaseError = error instanceof Error ? error.message : 'Database save failed';
      }
    }

    // Save to tempcomms if requested
    if (saveToTempComms) {
      try {
        console.log('🎯 StarCard Auto-Save: Saving to tempcomms folder');
        
        // Create tempClaudecomms directory if it doesn't exist
        const tempCommsDir = path.join(process.cwd(), 'tempClaudecomms');
        await fs.mkdir(tempCommsDir, { recursive: true });

        // Extract base64 data and convert to buffer
        const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
        const finalFilename = filename || `starcard-auto-${timestamp}.png`;
        const filePath = path.join(tempCommsDir, finalFilename);

        // Write file
        await fs.writeFile(filePath, imageBuffer);
        
        results.filePath = filePath;
        results.message += ` (Saved to: ${finalFilename})`;
        console.log('✅ StarCard saved to tempcomms:', filePath);
      } catch (error) {
        console.error('❌ TempComms save failed:', error);
        results.tempCommsError = error instanceof Error ? error.message : 'TempComms save failed';
      }
    }

    // If neither option was selected, default to tempcomms
    if (!saveToDatabase && !saveToTempComms) {
      console.log('🎯 StarCard Auto-Save: No save option specified, defaulting to tempcomms');
      try {
        const tempCommsDir = path.join(process.cwd(), 'tempClaudecomms');
        await fs.mkdir(tempCommsDir, { recursive: true });

        const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
        const finalFilename = `starcard-default-${timestamp}.png`;
        const filePath = path.join(tempCommsDir, finalFilename);

        await fs.writeFile(filePath, imageBuffer);
        
        results.filePath = filePath;
        results.message = `StarCard saved to tempcomms: ${finalFilename}`;
        console.log('✅ StarCard saved to tempcomms (default):', filePath);
      } catch (error) {
        console.error('❌ Default save failed:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to save StarCard',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json(results);

  } catch (error) {
    console.error('❌ StarCard Auto-Save error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get user's saved StarCards from database
 */
router.get('/saved/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // This would get all StarCards for a user
    // For now, just get the most recent one
    const starCard = await photoStorageService.getUserStarCard(userId);
    
    if (!starCard) {
      return res.json({
        success: false,
        message: 'No saved StarCards found'
      });
    }

    res.json({
      success: true,
      starCard: {
        filePath: starCard.filePath,
        hasImage: !!starCard.photoData
      }
    });

  } catch (error) {
    console.error('❌ Error getting saved StarCards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve StarCards',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Mark StarCard as reviewed/completed
 */
router.post('/reviewed', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log('🎯 StarCard marked as reviewed for user:', userId);
    
    // For now, just return success. In the future, you might want to:
    // - Update a starcard_status table
    // - Add a reviewed_at timestamp
    // - Track completion status
    
    res.json({
      success: true,
      message: 'StarCard marked as reviewed',
      userId,
      reviewedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error marking StarCard as reviewed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark StarCard as reviewed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;