import crypto from 'crypto';
import sharp from 'sharp';
import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper function to match the old query interface
const query = (text: string, params?: any[]) => pool.query(text, params);

export interface PhotoMetadata {
  id: number;
  photoHash: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  uploadedBy?: number;
  isThumbnail: boolean;
  originalPhotoId?: number;
  imageType?: ImageType;
  attribution?: string;
  sourceUrl?: string;
}

export enum ImageType {
  PROFILE_PICTURE = 'profile_picture',
  STARCARD_GENERATED = 'starcard_generated',
  WORKSHOP_VISUALIZATION = 'workshop_visualization',
  WORKSHOP_UPLOAD = 'workshop_upload',
  GENERAL_UPLOAD = 'general_upload'
}

export interface StoredPhoto extends PhotoMetadata {
  photoData: string; // Base64 encoded
}

export class PhotoStorageService {
  
  /**
   * Store a photo and return its reference ID
   * Automatically handles deduplication and thumbnail generation
   */
  async storePhoto(
    base64Data: string,
    uploadedBy?: number,
    generateThumbnail: boolean = true,
    originalFilename?: string,
    imageType: ImageType = ImageType.GENERAL_UPLOAD,
    attribution?: string,
    sourceUrl?: string
  ): Promise<number> {
    try {
      // Parse the base64 data
      const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 image data format');
      }
      
      const mimeType = matches[1];
      const imageData = matches[2];
      const imageBuffer = Buffer.from(imageData, 'base64');
      
      // Generate hash for deduplication
      const photoHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
      
      // Check if photo already exists
      const existingPhoto = await query(
        'SELECT id FROM photo_storage WHERE photo_hash = $1',
        [photoHash]
      );
      
      if (existingPhoto.rows.length > 0) {
        // Photo already exists, return existing ID
        return existingPhoto.rows[0].id;
      }
      
      // Get image dimensions using sharp
      let width: number | undefined;
      let height: number | undefined;

      try {
        const metadata = await sharp(imageBuffer).metadata();
        width = metadata.width;
        height = metadata.height;
      } catch (error) {
        console.warn('Could not get image dimensions:', error);
      }

      // VALIDATION: Warn if image_type doesn't match expected dimensions
      if (imageType === ImageType.STARCARD_GENERATED) {
        if (width && height) {
          // StarCards should be roughly 800x1000-1300px (portrait, taller than wide)
          if (width < 600 || width > 1000 || height < 1000 || height > 1400) {
            console.warn(`⚠️ Image type is 'starcard_generated' but dimensions ${width}x${height} are unusual for StarCard`);
            console.warn(`   Expected: 600-1000px wide, 1000-1400px tall. Verify this is correct.`);
          }
        }
      } else if (imageType === ImageType.PROFILE_PICTURE) {
        if (width && height) {
          // Profile pictures are typically smaller and squarish
          if (width > 1000 || height > 1000) {
            console.warn(`⚠️ Image type is 'profile_picture' but dimensions ${width}x${height} are unusually large`);
            console.warn(`   Profile pictures are typically < 1000px. This might be a StarCard.`);
          }
        }
      }
      
      // Check if we have the enhanced schema with image_type and attribution fields
      let hasEnhancedSchema = false;
      try {
        await query(`SELECT image_type FROM photo_storage LIMIT 1`);
        hasEnhancedSchema = true;
      } catch (error) {
        // Enhanced fields don't exist, use basic schema
        hasEnhancedSchema = false;
      }

      let result;
      if (hasEnhancedSchema) {
        // Store with enhanced fields
        result = await query(`
          INSERT INTO photo_storage (
            photo_hash, photo_data, mime_type, file_size,
            width, height, uploaded_by, is_thumbnail, reference_count,
            image_type, attribution, source_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING id
        `, [
          photoHash, base64Data, mimeType, imageBuffer.length,
          width, height, uploadedBy, false, 1,
          imageType, attribution, sourceUrl
        ]);
      } else {
        // Store with basic schema (backward compatibility)
        result = await query(`
          INSERT INTO photo_storage (
            photo_hash, photo_data, mime_type, file_size,
            width, height, uploaded_by, is_thumbnail, reference_count
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, [
          photoHash, base64Data, mimeType, imageBuffer.length,
          width, height, uploadedBy, false, 1
        ]);
      }
      
      const photoId = result.rows[0].id;
      
      // Generate thumbnail if requested and image is large enough
      if (generateThumbnail && width && height && (width > 200 || height > 200)) {
        try {
          await this.generateThumbnail(photoId, imageBuffer, mimeType, uploadedBy);
        } catch (error) {
          console.warn('Failed to generate thumbnail:', error);
          // Don't fail the main operation if thumbnail generation fails
        }
      }
      
      return photoId;
      
    } catch (error) {
      console.error('Error storing photo:', error);
      throw new Error(`Failed to store photo: ${error.message}`);
    }
  }
  
  /**
   * Retrieve a photo by its ID
   */
  async getPhoto(photoId: number): Promise<StoredPhoto | null> {
    try {
      const result = await query(`
        UPDATE photo_storage 
        SET last_accessed = CURRENT_TIMESTAMP 
        WHERE id = $1
        RETURNING *
      `, [photoId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        photoHash: row.photo_hash,
        photoData: row.photo_data,
        mimeType: row.mime_type,
        fileSize: row.file_size,
        width: row.width,
        height: row.height,
        uploadedBy: row.uploaded_by,
        isThumbnail: row.is_thumbnail,
        originalPhotoId: row.original_photo_id
      };
      
    } catch (error) {
      console.error('Error retrieving photo:', error);
      return null;
    }
  }
  
  /**
   * Get photo metadata without the actual photo data
   */
  async getPhotoMetadata(photoId: number): Promise<PhotoMetadata | null> {
    try {
      const result = await query(`
        SELECT id, photo_hash, mime_type, file_size, width, height, 
               uploaded_by, is_thumbnail, original_photo_id
        FROM photo_storage 
        WHERE id = $1
      `, [photoId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        photoHash: row.photo_hash,
        mimeType: row.mime_type,
        fileSize: row.file_size,
        width: row.width,
        height: row.height,
        uploadedBy: row.uploaded_by,
        isThumbnail: row.is_thumbnail,
        originalPhotoId: row.original_photo_id
      };
      
    } catch (error) {
      console.error('Error retrieving photo metadata:', error);
      return null;
    }
  }
  
  /**
   * Generate a thumbnail for a photo
   */
  private async generateThumbnail(
    originalPhotoId: number,
    imageBuffer: Buffer,
    mimeType: string,
    uploadedBy?: number
  ): Promise<number | null> {
    try {
      // Generate thumbnail (200x200 max, maintain aspect ratio)
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(200, 200, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      const thumbnailBase64 = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
      const thumbnailHash = crypto.createHash('sha256').update(thumbnailBuffer).digest('hex');
      
      // Get thumbnail dimensions
      const metadata = await sharp(thumbnailBuffer).metadata();
      
      const result = await query(`
        INSERT INTO photo_storage (
          photo_hash, photo_data, mime_type, file_size, 
          width, height, uploaded_by, is_thumbnail, original_photo_id, reference_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
        thumbnailHash,
        thumbnailBase64,
        'image/jpeg',
        thumbnailBuffer.length,
        metadata.width,
        metadata.height,
        uploadedBy,
        true,
        originalPhotoId,
        0 // Thumbnails don't count as references initially
      ]);
      
      return result.rows[0].id;
      
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }
  
  /**
   * Delete a photo and its references
   */
  async deletePhoto(photoId: number): Promise<boolean> {
    try {
      // Delete the photo and any thumbnails
      await query(`
        DELETE FROM photo_storage 
        WHERE id = $1 OR original_photo_id = $1
      `, [photoId]);
      
      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  }
  
  /**
   * Clean up unused photos (photos with zero references)
   */
  async cleanupUnusedPhotos(): Promise<number> {
    try {
      const result = await query(`
        SELECT cleanup_unused_photos()
      `);
      
      return result.rows[0].cleanup_unused_photos || 0;
    } catch (error) {
      console.error('Error cleaning up unused photos:', error);
      return 0;
    }
  }
  
  /**
   * Get a URL path for accessing a photo via API
   */
  getPhotoUrl(photoId: number, thumbnail: boolean = false): string {
    const baseUrl = '/api/photos';
    return thumbnail ? `${baseUrl}/${photoId}/thumbnail` : `${baseUrl}/${photoId}`;
  }

  /**
   * Get user's StarCard image for reports
   * Handles both development and production database schemas
   */
  async getUserStarCard(userId: string): Promise<{ filePath: string; photoData: string } | null> {
    try {
      console.log(`🖼️ getUserStarCard: Looking for StarCard for user ${userId}`);
      
      // Check if we're in production schema (has photo_storage table)
      let hasPhotoStorage = false;
      try {
        await query(`SELECT 1 FROM photo_storage LIMIT 1`);
        hasPhotoStorage = true;
        console.log(`🔍 getUserStarCard: Using production schema (photo_storage)`);
      } catch (error) {
        console.log(`🔍 getUserStarCard: Using development schema (star_cards)`);
        hasPhotoStorage = false;
      }
      
      let result;
      
      if (hasPhotoStorage) {
        // PRODUCTION SCHEMA: Use photo_storage table
        // First, try to get the user's profile picture (this should be their StarCard)
        result = await query(`
          SELECT ps.photo_data, ps.photo_hash, ps.mime_type, ps.created_at, 'profile_picture' as source
          FROM photo_storage ps 
          JOIN users u ON u.profile_picture_id = ps.id
          WHERE u.id = $1 
          AND ps.is_thumbnail = false
        `, [parseInt(userId)]);

        if (result.rows.length === 0) {
          console.log(`🔍 getUserStarCard: No profile picture found for user ${userId}, looking for StarCard by image_type`);

          // FIXED: Use image_type field instead of dimension-based heuristics
          // This prevents confusion between StarCards and other images (visualizations, uploads, etc.)
          console.log(`🔍 getUserStarCard: Looking for image_type='starcard_generated' for user ${userId}`);
          result = await query(`
            SELECT photo_data, photo_hash, mime_type, created_at, file_size, width, height, 'starcard_type' as source
            FROM photo_storage
            WHERE uploaded_by = $1
            AND is_thumbnail = false
            AND image_type = 'starcard_generated'
            ORDER BY created_at DESC
            LIMIT 1
          `, [parseInt(userId)]);

          // Final fallback: Look for StarCards using BOTH type and dimensions (safety check)
          if (result.rows.length === 0) {
            console.log(`🔍 getUserStarCard: No typed StarCard found, trying dimension-based fallback with WARNING for user ${userId}`);
            result = await query(`
              SELECT photo_data, photo_hash, mime_type, created_at, file_size, width, height, 'fallback_dimensions' as source
              FROM photo_storage
              WHERE uploaded_by = $1
              AND is_thumbnail = false
              AND mime_type = 'image/png'
              AND file_size > 100000
              AND file_size < 500000
              AND width > 600
              AND width < 1000
              AND height > 1000
              AND height < 1400
              ORDER BY created_at DESC
              LIMIT 1
            `, [parseInt(userId)]);

            if (result.rows.length > 0) {
              console.warn(`⚠️ WARNING: Using dimension-based fallback for user ${userId} - this may not be the actual StarCard!`);
              console.warn(`⚠️ Consider updating image_type to 'starcard_generated' for this image to prevent confusion.`);
            }
          }
        }
      } else {
        // DEVELOPMENT SCHEMA: Use star_cards table or users.profile_picture
        console.log(`🔍 getUserStarCard: Checking star_cards table for user ${userId}`);
        
        // First, try the star_cards table
        result = await query(`
          SELECT image_url as photo_data, 'star_cards' as source, created_at
          FROM star_cards 
          WHERE user_id = $1 
          AND image_url IS NOT NULL
          ORDER BY created_at DESC 
          LIMIT 1
        `, [parseInt(userId)]);
        
        if (result.rows.length === 0) {
          console.log(`🔍 getUserStarCard: No star_cards found, checking users.profile_picture for user ${userId}`);
          
          // Fallback: Check users.profile_picture field
          result = await query(`
            SELECT profile_picture as photo_data, 'profile_picture_text' as source, updated_at as created_at
            FROM users 
            WHERE id = $1 
            AND profile_picture IS NOT NULL 
            AND profile_picture != ''
          `, [parseInt(userId)]);
        }
      }

      if (result.rows.length === 0) {
        console.log(`❌ getUserStarCard: No StarCard found for user ${userId} (checked all methods: ${hasPhotoStorage ? 'profile_picture_id + fallback_starcard' : 'star_cards + profile_picture_text'})`);
        return null;
      }

      const photo = result.rows[0];
      console.log(`✅ getUserStarCard: Found StarCard for user ${userId} via ${photo.source} (created: ${photo.created_at})`);
      console.log(`🔍 getUserStarCard: Photo data length: ${photo.photo_data ? photo.photo_data.length : 'NULL'} characters`);
      
      // Enhanced logging for debugging image selection
      if (photo.file_size) {
        console.log(`📊 getUserStarCard: File size: ${Math.round(photo.file_size / 1024)}KB`);
      }
      if (photo.width && photo.height) {
        console.log(`📐 getUserStarCard: Dimensions: ${photo.width}x${photo.height}px`);
      }
      if (photo.width && photo.height) {
        console.log(`📊 getUserStarCard: Aspect ratio: ${(photo.width / photo.height).toFixed(2)} (${photo.width > photo.height ? 'landscape' : photo.height > photo.width ? 'portrait' : 'square'})`);
      }
      
      // Warn if using fallback methods
      if (photo.source === 'fallback_png') {
        console.warn(`⚠️ getUserStarCard: Using fallback PNG for user ${userId} - may not be actual StarCard`);
      }
      
      // Validate photo data format
      if (!photo.photo_data) {
        console.log(`❌ getUserStarCard: Photo data is NULL or empty for user ${userId}`);
        return null;
      }
      
      // Check if it's a valid base64 data URL
      const isDataUrl = photo.photo_data.startsWith('data:image/');
      const isBase64 = photo.photo_data.includes(';base64,');
      console.log(`🔍 getUserStarCard: Photo format - isDataUrl: ${isDataUrl}, isBase64: ${isBase64}`);
      
      // Create a temporary file path for the StarCard
      const fs = await import('fs/promises');
      const path = await import('path');
      const crypto = await import('crypto');
      
      const storageDir = path.join(process.cwd(), 'storage', 'star-cards');
      await fs.mkdir(storageDir, { recursive: true });
      
      // Generate filename based on photo hash
      const extension = photo.mime_type.split('/')[1] || 'png';
      const filename = `user-${userId}-starcard-${photo.photo_hash.substring(0, 8)}.${extension}`;
      const filePath = path.join(storageDir, filename);
      
      // Write the photo data to file if it doesn't exist
      try {
        await fs.access(filePath);
      } catch {
        // Extract base64 data and write to file
        const base64Data = photo.photo_data.includes(',') 
          ? photo.photo_data.split(',')[1] 
          : photo.photo_data;
        const buffer = Buffer.from(base64Data, 'base64');
        await fs.writeFile(filePath, buffer);
      }

      console.log(`✅ getUserStarCard: Successfully created temp file for user ${userId}: ${filePath}`);
      console.log(`📊 getUserStarCard: Returning data - filePath: ${filePath}, photoData length: ${photo.photo_data.length}`);
      
      return {
        filePath: filePath,
        photoData: photo.photo_data
      };
    } catch (error) {
      console.error(`❌ getUserStarCard: Error getting StarCard for user ${userId}:`, error);
      console.error('❌ getUserStarCard: Error details:', {
        message: error.message,
        stack: error.stack?.substring(0, 500)
      });
      return null;
    }
  }

  /**
   * Store a StarCard image generated from user's assessment data
   * FIXED: Added safeguards to prevent profile picture/StarCard confusion
   */
  async storeStarCard(userId: number, base64Data: string, starCardData: any): Promise<number> {
    console.log(`📊 Storing StarCard for user ${userId}`);

    const photoId = await this.storePhoto(
      base64Data,
      userId,
      true, // generateThumbnail
      `starcard-user-${userId}-${Date.now()}.png`,
      ImageType.STARCARD_GENERATED,
      `Generated StarCard for user ${userId}`,
      undefined // no source URL for generated images
    );

    // SAFEGUARD: Ensure this StarCard is NOT accidentally set as profile picture
    // Check if user's profile_picture_id points to a StarCard (shouldn't happen, but prevent it)
    try {
      const profileCheck = await query(`
        SELECT profile_picture_id FROM users WHERE id = $1
      `, [userId]);

      if (profileCheck.rows.length > 0) {
        const profilePictureId = profileCheck.rows[0].profile_picture_id;

        // If profile_picture_id points to a starcard_generated image, clear it
        if (profilePictureId) {
          const imageTypeCheck = await query(`
            SELECT image_type FROM photo_storage WHERE id = $1
          `, [profilePictureId]);

          if (imageTypeCheck.rows.length > 0 && imageTypeCheck.rows[0].image_type === 'starcard_generated') {
            console.warn(`⚠️ WARNING: User ${userId}'s profile_picture_id points to a StarCard! Clearing it.`);
            await query(`UPDATE users SET profile_picture_id = NULL WHERE id = $1`, [userId]);
          }
        }
      }
    } catch (safeguardError) {
      console.warn(`⚠️ Could not verify profile picture safety for user ${userId}:`, safeguardError);
    }

    // Also update the star_cards table with the image reference
    try {
      await query(`
        INSERT INTO star_cards (user_id, thinking, acting, feeling, planning, image_url, state)
        VALUES ($1, $2, $3, $4, $5, $6, 'generated')
        ON CONFLICT (user_id)
        DO UPDATE SET
          thinking = EXCLUDED.thinking,
          acting = EXCLUDED.acting,
          feeling = EXCLUDED.feeling,
          planning = EXCLUDED.planning,
          image_url = EXCLUDED.image_url,
          state = EXCLUDED.state,
          updated_at = NOW()
      `, [
        userId,
        starCardData.thinking || 25,
        starCardData.acting || 25,
        starCardData.feeling || 25,
        starCardData.planning || 25,
        `/api/photos/${photoId}` // Reference to the stored photo
      ]);

      console.log(`✅ StarCard data saved to star_cards table for user ${userId} (photo_id: ${photoId})`);
    } catch (error) {
      console.warn(`⚠️ Failed to update star_cards table for user ${userId}:`, error);
      // Don't fail the photo storage if star_cards table update fails
    }

    return photoId;
  }

  /**
   * Store a profile picture for a user
   * FIXED: Added safeguards to prevent profile picture/StarCard confusion
   */
  async storeProfilePicture(userId: number, base64Data: string): Promise<number> {
    console.log(`👤 Storing profile picture for user ${userId}`);

    const photoId = await this.storePhoto(
      base64Data,
      userId,
      true, // generateThumbnail
      `profile-picture-user-${userId}-${Date.now()}.jpg`,
      ImageType.PROFILE_PICTURE,
      `Profile picture for user ${userId}`,
      undefined
    );

    // Update the user's profile_picture_id (if the field exists)
    try {
      await query(`UPDATE users SET profile_picture_id = $1 WHERE id = $2`, [photoId, userId]);
      console.log(`✅ Profile picture ID updated for user ${userId} (photo_id: ${photoId})`);

      // SAFEGUARD: Mark old profile pictures as general uploads to prevent accumulation
      // This ensures only ONE profile picture per user is marked as PROFILE_PICTURE type
      try {
        const updateOldResult = await query(`
          UPDATE photo_storage
          SET image_type = 'general_upload'
          WHERE uploaded_by = $1
            AND image_type = 'profile_picture'
            AND id != $2
        `, [userId, photoId]);

        if (updateOldResult.rowCount && updateOldResult.rowCount > 0) {
          console.log(`🧹 Marked ${updateOldResult.rowCount} old profile picture(s) as general uploads for user ${userId}`);
        }
      } catch (cleanupError) {
        console.warn(`⚠️ Could not clean up old profile pictures for user ${userId}:`, cleanupError);
      }

    } catch (error) {
      // If profile_picture_id field doesn't exist, try the legacy profile_picture field
      try {
        await query(`UPDATE users SET profile_picture = $1 WHERE id = $2`, [base64Data, userId]);
        console.log(`✅ Legacy profile picture updated for user ${userId}`);
      } catch (legacyError) {
        console.warn(`⚠️ Could not update profile picture for user ${userId}:`, legacyError);
      }
    }

    return photoId;
  }

  /**
   * Store visualization images from workshop exercises with attribution
   */
  async storeVisualizationImage(
    userId: number,
    imageUrl: string,
    attribution: string,
    context: string = 'workshop_visualization'
  ): Promise<number> {
    console.log(`🖼️ Downloading and storing visualization image for user ${userId}: ${imageUrl}`);

    try {
      // Download the image from the URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Determine MIME type from response or URL
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const base64Data = `data:${contentType};base64,${buffer.toString('base64')}`;

      const photoId = await this.storePhoto(
        base64Data,
        userId,
        true, // generateThumbnail
        `visualization-${userId}-${Date.now()}.jpg`,
        ImageType.WORKSHOP_VISUALIZATION,
        attribution,
        imageUrl // Original source URL
      );

      console.log(`✅ Visualization image stored with ID ${photoId} for user ${userId}`);
      return photoId;

    } catch (error) {
      console.error(`❌ Failed to download and store visualization image for user ${userId}:`, error);
      throw new Error(`Failed to store visualization image: ${error.message}`);
    }
  }

  /**
   * Store workshop uploaded images
   */
  async storeWorkshopUpload(userId: number, base64Data: string, filename?: string): Promise<number> {
    console.log(`📤 Storing workshop upload for user ${userId}`);

    return await this.storePhoto(
      base64Data,
      userId,
      true, // generateThumbnail
      filename || `workshop-upload-${userId}-${Date.now()}.jpg`,
      ImageType.WORKSHOP_UPLOAD,
      `Workshop upload by user ${userId}`,
      undefined
    );
  }

  /**
   * Get StarCard image for a user (for reports)
   */
  async getUserStarCardImage(userId: number): Promise<StoredPhoto | null> {
    try {
      // First try to get from star_cards table
      const starCardResult = await query(`
        SELECT sc.image_url, sc.created_at
        FROM star_cards sc
        WHERE sc.user_id = $1
        ORDER BY sc.updated_at DESC
        LIMIT 1
      `, [userId]);

      if (starCardResult.rows.length > 0) {
        const imageUrl = starCardResult.rows[0].image_url;
        // Extract photo ID from URL path like /api/photos/123
        const photoIdMatch = imageUrl.match(/\/api\/photos\/(\d+)/);
        if (photoIdMatch) {
          const photoId = parseInt(photoIdMatch[1]);
          return await this.getPhoto(photoId);
        }
      }

      // Fallback: Try to find StarCard images by type
      try {
        const result = await query(`
          SELECT * FROM photo_storage
          WHERE uploaded_by = $1 AND image_type = $2
          ORDER BY created_at DESC
          LIMIT 1
        `, [userId, ImageType.STARCARD_GENERATED]);

        if (result.rows.length > 0) {
          const row = result.rows[0];
          return {
            id: row.id,
            photoHash: row.photo_hash,
            photoData: row.photo_data,
            mimeType: row.mime_type,
            fileSize: row.file_size,
            width: row.width,
            height: row.height,
            uploadedBy: row.uploaded_by,
            isThumbnail: row.is_thumbnail,
            originalPhotoId: row.original_photo_id,
            imageType: row.image_type,
            attribution: row.attribution,
            sourceUrl: row.source_url
          };
        }
      } catch (error) {
        console.log(`📝 Enhanced schema not available, using fallback method`);
      }

      // Final fallback: Use the existing getUserStarCard method
      const fallbackResult = await this.getUserStarCard(userId.toString());
      if (fallbackResult) {
        return {
          id: 0, // Not from photo_storage table
          photoHash: '',
          photoData: fallbackResult.photoData,
          mimeType: 'image/png',
          fileSize: 0,
          uploadedBy: userId,
          isThumbnail: false,
          imageType: ImageType.STARCARD_GENERATED,
          attribution: 'Legacy StarCard'
        };
      }

      return null;
    } catch (error) {
      console.error(`❌ Error getting StarCard image for user ${userId}:`, error);
      return null;
    }
  }
}

export const photoStorageService = new PhotoStorageService();