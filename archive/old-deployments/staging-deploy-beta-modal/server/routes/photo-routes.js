import express from 'express';
import { photoStorageService } from '../services/photo-storage-service';
import { safeConsoleLog } from '../../shared/photo-data-filter';
const photoRouter = express.Router();
photoRouter.get('/:id', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error serving photo:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
photoRouter.get('/:id/thumbnail', async (req, res) => {
    try {
        const photoId = parseInt(req.params.id);
        if (isNaN(photoId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid photo ID'
            });
        }
        const thumbnailResult = await photoStorageService.getPhoto(photoId);
        if (thumbnailResult && thumbnailResult.isThumbnail) {
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
    }
    catch (error) {
        console.error('Error serving photo thumbnail:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
photoRouter.get('/:id/metadata', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error serving photo metadata:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
photoRouter.post('/', async (req, res) => {
    try {
        const { photoData } = req.body;
        if (!photoData || typeof photoData !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Photo data is required'
            });
        }
        if (!photoData.match(/^data:image\/[a-zA-Z]*;base64,/)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid photo data format'
            });
        }
        const userId = req.session?.userId;
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
    }
    catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload photo'
        });
    }
});
photoRouter.delete('/:id', async (req, res) => {
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
        const userId = req.session?.userId;
        const userRole = req.session?.userRole;
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
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Failed to delete photo'
            });
        }
    }
    catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
export default photoRouter;
