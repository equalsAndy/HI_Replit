import crypto from 'crypto';
import sharp from 'sharp';
import { Pool } from 'pg';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
const query = (text, params) => pool.query(text, params);
export class PhotoStorageService {
    async storePhoto(base64Data, uploadedBy, generateThumbnail = true) {
        try {
            const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
            if (!matches) {
                throw new Error('Invalid base64 image data format');
            }
            const mimeType = matches[1];
            const imageData = matches[2];
            const imageBuffer = Buffer.from(imageData, 'base64');
            const photoHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
            const existingPhoto = await query('SELECT id FROM photo_storage WHERE photo_hash = $1', [photoHash]);
            if (existingPhoto.rows.length > 0) {
                return existingPhoto.rows[0].id;
            }
            let width;
            let height;
            try {
                const metadata = await sharp(imageBuffer).metadata();
                width = metadata.width;
                height = metadata.height;
            }
            catch (error) {
                console.warn('Could not get image dimensions:', error);
            }
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
                1
            ]);
            const photoId = result.rows[0].id;
            if (generateThumbnail && width && height && (width > 200 || height > 200)) {
                try {
                    await this.generateThumbnail(photoId, imageBuffer, mimeType, uploadedBy);
                }
                catch (error) {
                    console.warn('Failed to generate thumbnail:', error);
                }
            }
            return photoId;
        }
        catch (error) {
            console.error('Error storing photo:', error);
            throw new Error(`Failed to store photo: ${error.message}`);
        }
    }
    async getPhoto(photoId) {
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
        }
        catch (error) {
            console.error('Error retrieving photo:', error);
            return null;
        }
    }
    async getPhotoMetadata(photoId) {
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
        }
        catch (error) {
            console.error('Error retrieving photo metadata:', error);
            return null;
        }
    }
    async generateThumbnail(originalPhotoId, imageBuffer, mimeType, uploadedBy) {
        try {
            const thumbnailBuffer = await sharp(imageBuffer)
                .resize(200, 200, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .jpeg({ quality: 80 })
                .toBuffer();
            const thumbnailBase64 = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
            const thumbnailHash = crypto.createHash('sha256').update(thumbnailBuffer).digest('hex');
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
                0
            ]);
            return result.rows[0].id;
        }
        catch (error) {
            console.error('Error generating thumbnail:', error);
            return null;
        }
    }
    async deletePhoto(photoId) {
        try {
            await query(`
        DELETE FROM photo_storage 
        WHERE id = $1 OR original_photo_id = $1
      `, [photoId]);
            return true;
        }
        catch (error) {
            console.error('Error deleting photo:', error);
            return false;
        }
    }
    async cleanupUnusedPhotos() {
        try {
            const result = await query(`
        SELECT cleanup_unused_photos()
      `);
            return result.rows[0].cleanup_unused_photos || 0;
        }
        catch (error) {
            console.error('Error cleaning up unused photos:', error);
            return 0;
        }
    }
    getPhotoUrl(photoId, thumbnail = false) {
        const baseUrl = '/api/photos';
        return thumbnail ? `${baseUrl}/${photoId}/thumbnail` : `${baseUrl}/${photoId}`;
    }
    async getUserStarCard(userId) {
        try {
            const result = await query(`
        SELECT photo_data, photo_hash, mime_type
        FROM photo_storage 
        WHERE uploaded_by = $1 
        AND is_thumbnail = false
        ORDER BY created_at DESC 
        LIMIT 1
      `, [parseInt(userId)]);
            if (result.rows.length === 0) {
                return null;
            }
            const photo = result.rows[0];
            const fs = await import('fs/promises');
            const path = await import('path');
            const crypto = await import('crypto');
            const storageDir = path.join(process.cwd(), 'storage', 'star-cards');
            await fs.mkdir(storageDir, { recursive: true });
            const extension = photo.mime_type.split('/')[1] || 'png';
            const filename = `user-${userId}-starcard-${photo.photo_hash.substring(0, 8)}.${extension}`;
            const filePath = path.join(storageDir, filename);
            try {
                await fs.access(filePath);
            }
            catch {
                const base64Data = photo.photo_data.includes(',')
                    ? photo.photo_data.split(',')[1]
                    : photo.photo_data;
                const buffer = Buffer.from(base64Data, 'base64');
                await fs.writeFile(filePath, buffer);
            }
            return {
                filePath: filePath,
                photoData: photo.photo_data
            };
        }
        catch (error) {
            console.error('Error getting user StarCard:', error);
            return null;
        }
    }
}
export const photoStorageService = new PhotoStorageService();
