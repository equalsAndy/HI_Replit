import express, { Request, Response } from 'express';
import { photoStorageService } from '../services/photo-storage-service';
import { safeConsoleLog } from '../../shared/photo-data-filter';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

// Simple auth middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

const photoRouter = express.Router();

/**
 * GET /api/photos/:id - Get a photo by ID
 * Returns the actual photo data
 */
photoRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const photoId = parseInt(req.params.id);
    
    if (isNaN(photoId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid photo ID'
      });
    }
    
    const photo = await photoStorageService.getPhoto(photoId);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }
    
    // Set appropriate caching headers
    res.set({
      'Content-Type': photo.mimeType,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'ETag': photo.photoHash
    });
    
    // Check if client has cached version
    if (req.headers['if-none-match'] === photo.photoHash) {
      return res.status(304).end();
    }
    
    // Return the photo data directly (base64)
    const base64Data = photo.photoData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    res.send(buffer);
    
  } catch (error) {
    console.error('Error serving photo:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/photos/:id/thumbnail - Get a thumbnail version of a photo
 */
photoRouter.get('/:id/thumbnail', async (req: Request, res: Response) => {
  try {
    const photoId = parseInt(req.params.id);
    
    if (isNaN(photoId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid photo ID'
      });
    }
    
    // First try to find an existing thumbnail
    const thumbnailResult = await photoStorageService.getPhoto(photoId);
    
    if (thumbnailResult && thumbnailResult.isThumbnail) {
      // This is already a thumbnail
      res.set({
        'Content-Type': thumbnailResult.mimeType,
        'Cache-Control': 'public, max-age=31536000',
        'ETag': thumbnailResult.photoHash
      });
      
      if (req.headers['if-none-match'] === thumbnailResult.photoHash) {
        return res.status(304).end();
      }
      
      const base64Data = thumbnailResult.photoData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      return res.send(buffer);
    }
    
    // Look for a thumbnail of this photo
    // This would require a query to find thumbnails by original_photo_id
    // For now, just return the original photo (could be optimized later)
    const photo = await photoStorageService.getPhoto(photoId);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }
    
    res.set({
      'Content-Type': photo.mimeType,
      'Cache-Control': 'public, max-age=31536000',
      'ETag': photo.photoHash
    });
    
    if (req.headers['if-none-match'] === photo.photoHash) {
      return res.status(304).end();
    }
    
    const base64Data = photo.photoData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    res.send(buffer);
    
  } catch (error) {
    console.error('Error serving photo thumbnail:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/photos/:id/metadata - Get photo metadata without the actual photo data
 */
photoRouter.get('/:id/metadata', async (req: Request, res: Response) => {
  try {
    const photoId = parseInt(req.params.id);
    
    if (isNaN(photoId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid photo ID'
      });
    }
    
    const metadata = await photoStorageService.getPhotoMetadata(photoId);
    
    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }
    
    res.json({
      success: true,
      metadata
    });
    
  } catch (error) {
    console.error('Error serving photo metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/photos - Upload a new photo
 * Expects { photoData: "data:image/...;base64,..." }
 */
photoRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { photoData } = req.body;
    
    if (!photoData || typeof photoData !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Photo data is required'
      });
    }
    
    // Validate base64 format
    if (!photoData.match(/^data:image\/[a-zA-Z]*;base64,/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid photo data format'
      });
    }
    
    const userId = (req.session as any)?.userId;
    
    safeConsoleLog('Storing photo for user:', userId);
    
    const photoId = await photoStorageService.storePhoto(photoData, userId);
    
    const metadata = await photoStorageService.getPhotoMetadata(photoId);
    
    res.json({
      success: true,
      photoId,
      photoUrl: photoStorageService.getPhotoUrl(photoId),
      thumbnailUrl: photoStorageService.getPhotoUrl(photoId, true),
      metadata
    });
    
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload photo'
    });
  }
});

/**
 * DELETE /api/photos/:id - Delete a photo
 */
photoRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const photoId = parseInt(req.params.id);
    
    if (isNaN(photoId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid photo ID'
      });
    }
    
    // Check if user has permission to delete this photo
    const metadata = await photoStorageService.getPhotoMetadata(photoId);
    
    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }
    
    const userId = (req.session as any)?.userId;
    const userRole = (req.session as any)?.userRole;
    
    // Only allow deletion if user uploaded it or is admin
    if (metadata.uploadedBy !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Permission denied'
      });
    }
    
    const deleted = await photoStorageService.deletePhoto(photoId);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Photo deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete photo'
      });
    }
    
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/photos/starcard - Save StarCard (WITHOUT changing profile picture)
 * Expects { imageData: "data:image/...;base64,...", filename: "..." }
 */
photoRouter.post('/starcard', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { imageData, filename } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    console.log(`🖼️ Saving StarCard for user ${userId} (NOT changing profile picture)...`);

    // Store the StarCard image with StarCard-specific filename
    const starCardFilename = filename || `Star_Card-user-${userId}-${Date.now()}.png`;
    const photoId = await photoStorageService.storePhoto(imageData, userId, true, starCardFilename);
    
    // DO NOT update user's profile picture - this was the bug!
    // The star card should just be saved, not set as profile picture
    
    console.log(`✅ StarCard saved as photo ID ${photoId} (profile picture unchanged)`);

    res.json({
      success: true,
      message: 'StarCard saved successfully',
      photoId: photoId
    });

  } catch (error) {
    console.error('❌ Error saving StarCard:', error);
    res.status(500).json({
      error: 'Failed to save StarCard',
      message: error.message
    });
  }
});

export default photoRouter;