import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { photoStorageService } from '../services/photo-storage-service.js';
const router = express.Router();
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
        const results = {
            success: true,
            message: 'StarCard saved successfully'
        };
        if (saveToDatabase && userId) {
            try {
                console.log('🎯 StarCard Auto-Save: Saving to database for user:', userId);
                const existingStarCard = await photoStorageService.getUserStarCard(userId.toString());
                if (existingStarCard) {
                    console.log('🔄 Found existing StarCard, will replace it');
                }
                const photoId = await photoStorageService.storePhoto(imageData, userId, true);
                results.photoId = photoId;
                results.replaced = !!existingStarCard;
                results.message += ` (Database ID: ${photoId}${existingStarCard ? ', replaced existing' : ''})`;
                console.log('✅ StarCard saved to database with ID:', photoId);
            }
            catch (error) {
                console.error('❌ Database save failed:', error);
                results.databaseError = error instanceof Error ? error.message : 'Database save failed';
            }
        }
        if (saveToTempComms) {
            try {
                console.log('🎯 StarCard Auto-Save: Saving to tempcomms folder');
                const tempCommsDir = path.join(process.cwd(), 'tempClaudecomms');
                await fs.mkdir(tempCommsDir, { recursive: true });
                const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
                const imageBuffer = Buffer.from(base64Data, 'base64');
                const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
                const finalFilename = filename || `starcard-auto-${timestamp}.png`;
                const filePath = path.join(tempCommsDir, finalFilename);
                await fs.writeFile(filePath, imageBuffer);
                results.filePath = filePath;
                results.message += ` (Saved to: ${finalFilename})`;
                console.log('✅ StarCard saved to tempcomms:', filePath);
            }
            catch (error) {
                console.error('❌ TempComms save failed:', error);
                results.tempCommsError = error instanceof Error ? error.message : 'TempComms save failed';
            }
        }
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
            }
            catch (error) {
                console.error('❌ Default save failed:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to save StarCard',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        res.json(results);
    }
    catch (error) {
        console.error('❌ StarCard Auto-Save error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/saved/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
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
    }
    catch (error) {
        console.error('❌ Error getting saved StarCards:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve StarCards',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
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
        res.json({
            success: true,
            message: 'StarCard marked as reviewed',
            userId,
            reviewedAt: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error marking StarCard as reviewed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark StarCard as reviewed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/find-user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { Pool } = await import('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        const result = await pool.query('SELECT id, name, username FROM users WHERE LOWER(username) = LOWER($1)', [username]);
        await pool.end();
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `User with username '${username}' not found`
            });
        }
        const user = result.rows[0];
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                username: user.username
            }
        });
    }
    catch (error) {
        console.error('❌ Error finding user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to find user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/get-png/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        console.log(`🎯 Getting StarCard PNG for user ID: ${userId}`);
        const { Pool } = await import('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        const userResult = await pool.query('SELECT id, name, username FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            await pool.end();
            return res.status(404).json({
                success: false,
                message: `User ${userId} not found`
            });
        }
        const user = userResult.rows[0];
        console.log(`👤 Found user: ${user.name || user.username} (ID: ${user.id})`);
        const photoResult = await pool.query(`
      SELECT id, photo_data, photo_hash, mime_type, file_size, width, height, created_at
      FROM photo_storage 
      WHERE uploaded_by = $1 
      AND is_thumbnail = false
      ORDER BY created_at DESC 
      LIMIT 1
    `, [userId]);
        await pool.end();
        if (photoResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No StarCard PNG found for user ${userId} (${user.name || user.username})`
            });
        }
        const photo = photoResult.rows[0];
        console.log(`📸 Found StarCard PNG:`, {
            id: photo.id,
            size: `${photo.file_size} bytes`,
            dimensions: `${photo.width}x${photo.height}`,
            type: photo.mime_type,
            created: photo.created_at
        });
        const fs = await import('fs/promises');
        const path = await import('path');
        const tempCommsDir = path.join(process.cwd(), 'tempClaudecomms');
        await fs.mkdir(tempCommsDir, { recursive: true });
        const base64Data = photo.photo_data.includes(',')
            ? photo.photo_data.split(',')[1]
            : photo.photo_data;
        const buffer = Buffer.from(base64Data, 'base64');
        const extension = photo.mime_type.split('/')[1] || 'png';
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
        const username = user.username || 'unknown';
        const filename = `user-${userId}-${username}-starcard-${timestamp}.${extension}`;
        const filePath = path.join(tempCommsDir, filename);
        await fs.writeFile(filePath, buffer);
        console.log(`✅ StarCard PNG saved to: ${filename}`);
        res.json({
            success: true,
            message: `StarCard PNG retrieved for ${user.name || user.username}`,
            user: user.name || user.username,
            username: user.username,
            userId: userId,
            filename: filename,
            fileSize: photo.file_size,
            dimensions: `${photo.width}x${photo.height}`,
            created: photo.created_at
        });
    }
    catch (error) {
        console.error('❌ Error getting StarCard PNG:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get StarCard PNG',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/admin/download/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        console.log(`🔐 Admin downloading StarCard PNG for user ID: ${userId}`);
        const { Pool } = await import('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        const userResult = await pool.query('SELECT id, name, username FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            await pool.end();
            return res.status(404).json({
                success: false,
                message: `User ${userId} not found`
            });
        }
        const user = userResult.rows[0];
        const photoResult = await pool.query(`
      SELECT id, photo_data, photo_hash, mime_type, file_size, width, height, created_at
      FROM photo_storage 
      WHERE uploaded_by = $1 
      AND is_thumbnail = false
      ORDER BY created_at DESC 
      LIMIT 1
    `, [userId]);
        await pool.end();
        if (photoResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No StarCard PNG found in database for ${user.name || user.username} (ID: ${userId})`
            });
        }
        const photo = photoResult.rows[0];
        const base64Data = photo.photo_data.includes(',')
            ? photo.photo_data.split(',')[1]
            : photo.photo_data;
        const buffer = Buffer.from(base64Data, 'base64');
        const extension = photo.mime_type.split('/')[1] || 'png';
        const username = user.username || 'user';
        const filename = `${username}-starcard-${user.id}.${extension}`;
        res.setHeader('Content-Type', photo.mime_type);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        console.log(`✅ Admin downloading: ${filename} (${photo.file_size} bytes)`);
        res.send(buffer);
    }
    catch (error) {
        console.error('❌ Admin download error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download StarCard PNG',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/admin/list-available', async (req, res) => {
    try {
        console.log('🔐 Admin listing users with StarCard PNGs');
        const { Pool } = await import('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.username,
        ps.id as photo_id,
        ps.file_size,
        ps.width,
        ps.height,
        ps.created_at,
        ps.mime_type
      FROM users u
      JOIN photo_storage ps ON ps.uploaded_by = u.id
      WHERE ps.is_thumbnail = false
      ORDER BY ps.created_at DESC
    `);
        await pool.end();
        const usersWithStarCards = result.rows.map(row => ({
            userId: row.id,
            name: row.name,
            username: row.username,
            starCard: {
                photoId: row.photo_id,
                fileSize: row.file_size,
                dimensions: `${row.width}x${row.height}`,
                mimeType: row.mime_type,
                createdAt: row.created_at
            }
        }));
        res.json({
            success: true,
            message: `Found ${usersWithStarCards.length} users with StarCard PNGs`,
            users: usersWithStarCards
        });
    }
    catch (error) {
        console.error('❌ Admin list error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list StarCard PNGs',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
export default router;
