const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const type = req.query.type || 'products';
        // Map types to Cloudinary folders
        const folderMap = {
            'products': 'urban-harvest/products',
            'events': 'urban-harvest/events',
            'workshops': 'urban-harvest/workshops',
            'subscription-boxes': 'urban-harvest/subscription-boxes',
            'profiles': 'urban-harvest/profiles'
        };

        return {
            folder: folderMap[type] || 'urban-harvest/others',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif', 'jfif'],
            public_id: `img-${Date.now()}-${Math.round(Math.random() * 1E4)}`,
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Optimization
        };
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper to handle multer errors
const handleUpload = (field) => (req, res, next) => {
    upload.single(field)(req, res, (err) => {
        if (err) {
            console.error('Multer/Cloudinary Error:', err);
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

// POST /api/upload?type=products - Upload to Cloudinary
router.post('/', handleUpload('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Cloudinary returns the full URL in req.file.path
        res.json({
            success: true,
            imageUrl: req.file.path,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error uploading to cloud' });
    }
});

// POST /api/upload/profile-image - Upload profile image to Cloudinary
router.post('/profile-image', handleUpload('image'), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Authentication required' });

        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const { runQuery } = require('../database/db');

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

        const imageUrl = req.file.path; // Cloudinary URL

        // Update user's profile image in database
        await runQuery(
            'UPDATE users SET profile_image = ? WHERE user_id = ?',
            [imageUrl, decoded.id]
        );

        res.json({
            success: true,
            imageUrl,
            message: 'Profile image updated with Cloudinary'
        });
    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({ error: 'Failed to upload profile image to cloud' });
    }
});

// DELETE route stays mostly for frontend compatibility, 
// though deleting from Cloudinary requires more setup
router.delete('/', (req, res) => {
    res.json({ success: true, message: 'Cloudinary handle: Deleting old local logic skip' });
});

module.exports = router;
