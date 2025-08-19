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
    originalFilename?: string
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
      
      // Store the original photo (originalFilename not supported in production schema)
      const result = await query(`
        INSERT INTO photo_storage (
          photo_hash, photo_data, mime_type, file_size, 
          width, height, uploaded_by, is_thumbnail, reference_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        photoHash,
        base64Data,
        mimeType,
        imageBuffer.length,
        width,
        height,
        uploadedBy,
        false,
        1 // Initialize with 1 since it's being referenced
      ]);
      
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
          console.log(`🔍 getUserStarCard: No profile picture found for user ${userId}, looking for StarCard by pattern`);
          
          // Enhanced fallback: Look for StarCards using size and dimension characteristics
          // StarCards are typically 800-900px wide, 1000-1300px tall, 100KB-300KB in size
          console.log(`🔍 getUserStarCard: Looking for StarCard-like images by dimensions for user ${userId}`);
          result = await query(`
            SELECT photo_data, photo_hash, mime_type, created_at, file_size, width, height, 'starcard_dimensions' as source
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
          
          // Fallback: Look for any reasonably-sized PNG if no StarCard dimensions found
          if (result.rows.length === 0) {
            console.log(`🔍 getUserStarCard: No StarCard dimensions found, checking for any medium PNG for user ${userId}`);
            result = await query(`
              SELECT photo_data, photo_hash, mime_type, created_at, file_size, width, height, 'medium_png' as source
              FROM photo_storage 
              WHERE uploaded_by = $1 
              AND is_thumbnail = false
              AND mime_type = 'image/png'
              AND file_size > 50000
              AND file_size < 1000000
              ORDER BY created_at DESC 
              LIMIT 1
            `, [parseInt(userId)]);
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
}

export const photoStorageService = new PhotoStorageService();