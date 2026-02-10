const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base directory for images (client/public/Images)
const baseImagesDir = path.join(__dirname, '../../client/public/Images');

// Ensure base directories exist
['products', 'events', 'workshops', 'subscription-boxes', 'profiles'].forEach(type => {
    const dir = path.join(baseImagesDir, type);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.query.type || 'products'; // Default to products
        const uploadDir = path.join(baseImagesDir, type);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
    // Expanded list of allowed types (strictly static for profile context)
    const allowedTypes = /jpeg|jpg|png|webp|avif|jfif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed! (JPG, PNG, WEBP, AVIF, JFIF)'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper to handle multer errors in routes
const handleUpload = (field) => (req, res, next) => {
    upload.single(field)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Image size must be less than 5MB' });
            }
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

// POST /api/upload?type=products&oldImage=/Images/products/old.jpg - Upload single image
router.post('/', handleUpload('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const type = req.query.type || 'products';
        const oldImage = req.query.oldImage; // Old image path to delete

        // Delete old image if provided
        const defaultImages = [
            '/Images/products/default.jpg',
            '/Images/events/default.jpg',
            '/Images/workshops/default.jpg',
            '/Images/subscription-boxes/default.jpg'
        ];

        if (oldImage && !defaultImages.includes(oldImage)) {
            const oldImagePath = path.join(__dirname, '../../client/public', oldImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
                console.log(`Deleted old image: ${oldImage}`);
            }
        }

        const imageUrl = `/Images/${type}/${req.file.filename}`;

        res.json({
            success: true,
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error uploading file' });
    }
});

// DELETE /api/upload?imageUrl=/Images/products/123.jpg - Delete uploaded image
router.delete('/', (req, res) => {
    try {
        const imageUrl = req.query.imageUrl;

        if (!imageUrl) {
            return res.status(400).json({ error: 'No image URL provided' });
        }

        // Don't delete default images
        const defaultImages = [
            '/Images/products/default.jpg',
            '/Images/events/default.jpg',
            '/Images/workshops/default.jpg',
            '/Images/subscription-boxes/default.jpg'
        ];

        if (defaultImages.includes(imageUrl)) {
            return res.status(400).json({ error: 'Cannot delete default images' });
        }

        const imagePath = path.join(__dirname, '../../client/public', imageUrl);

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log(`Deleted orphan image: ${imageUrl}`);
            res.json({ success: true, message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Error deleting file' });
    }
});

// POST /api/upload/profile-image - Upload profile image (requires authentication)
router.post('/profile-image', handleUpload('image'), async (req, res) => {
    try {
        console.log('📸 Profile image upload request received');

        // Check if user is authenticated
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const { runQuery } = require('../database/db');

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        // Ensure profiles directory exists
        const profilesDir = path.join(baseImagesDir, 'profiles');
        if (!fs.existsSync(profilesDir)) {
            fs.mkdirSync(profilesDir, { recursive: true });
        }

        // Move file to profiles directory and rename
        const oldPath = req.file.path;
        const extension = path.extname(req.file.originalname).toLowerCase();
        const newFilename = `profile-${decoded.id}-${Date.now()}${extension}`;
        const newPath = path.join(profilesDir, newFilename);

        fs.renameSync(oldPath, newPath);

        const imageUrl = `/Images/profiles/${newFilename}`;

        // Get old profile image to delete
        const oldImageResult = await runQuery(
            'SELECT profile_image FROM users WHERE user_id = ?',
            [decoded.id]
        );

        // Update user's profile image in database
        await runQuery(
            'UPDATE users SET profile_image = ? WHERE user_id = ?',
            [imageUrl, decoded.id]
        );

        // Delete old profile image if it exists and isn't a default one
        if (oldImageResult.length > 0 && oldImageResult[0].profile_image) {
            const oldImg = oldImageResult[0].profile_image;
            if (!oldImg.includes('default')) {
                const oldImagePath = path.join(__dirname, '../../client/public', oldImg);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log(`Deleted old profile image: ${oldImg}`);
                }
            }
        }

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
