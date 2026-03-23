/**
 * Transcript Image Upload Routes
 * ===============================
 * Handles image uploads for the rich text transcript editor.
 * Images are stored on the server filesystem under /uploads/transcript-images/.
 *
 * Mounted at /api/admin/transcript-images
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Resolve upload directory relative to project root
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'transcript-images');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for disk storage with unique filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed. Use: ${allowed.join(', ')}`));
    }
  },
});

// POST / — Upload a single image
router.post('/', requireAuth, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image file provided' });
  }

  const imageUrl = `/uploads/transcript-images/${req.file.filename}`;
  console.log(`[transcript-images] Uploaded: ${req.file.originalname} -> ${imageUrl}`);

  return res.json({
    success: true,
    url: imageUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
  });
});

export default router;
