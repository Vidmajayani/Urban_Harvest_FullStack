const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: (req, file) => {
            const type = req.query.type || 'others';
            return `urban-harvest/${type}`;
        },
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif', 'jfif'],
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return uniqueSuffix;
        }
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper to handle multer errors
const handleUpload = (field) => (req, res, next) => {
    upload.single(field)(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

// POST /api/upload - Upload to Cloudinary
router.post('/', handleUpload('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Return the Cloudinary URL
        res.json({
            success: true,
            imageUrl: req.file.path, // This is the full secure URL from Cloudinary
            filename: req.file.filename,
            public_id: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error uploading to cloud storage' });
    }
});

// DELETE /api/upload - Delete from Cloudinary
router.delete('/', async (req, res) => {
    try {
        const { public_id } = req.query;
        if (!public_id) {
            return res.status(400).json({ error: 'No public_id provided' });
        }

        // Don't delete default images
        if (public_id.includes('default')) {
            return res.status(400).json({ error: 'Cannot delete default images' });
        }

        const result = await cloudinary.uploader.destroy(public_id);
        res.json({ success: true, result });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Error deleting from cloud storage' });
    }
});

// POST /api/upload/profile-image - Profile image update
router.post('/profile-image', handleUpload('image'), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Authentication required' });

        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const { runQuery } = require('../database/db');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

        const imageUrl = req.file.path; // Cloudinary URL

        // Update user in DB
        await runQuery(
            'UPDATE users SET profile_image = ? WHERE user_id = ?',
            [imageUrl, decoded.id]
        );

        res.json({
            success: true,
            imageUrl,
            message: 'Profile image updated successfully'
        });
    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({ error: 'Failed to upload profile image' });
    }
});

module.exports = router;
