/**
 * Urban Harvest Hub - Main Server File
 * Express REST API with MySQL Database (XAMPP)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const workshopsRoutes = require('./routes/workshops');
const productsRoutes = require('./routes/products');
const bookingsRoutes = require('./routes/bookings');
const ordersRoutes = require('./routes/orders');
const categoriesRoutes = require('./routes/categories');
const organizersRoutes = require('./routes/organizers');
const instructorsRoutes = require('./routes/instructors');
const uploadRoutes = require('./routes/upload');
const productReviewsRoutes = require('./routes/product-reviews');
const eventReviewsRoutes = require('./routes/event-reviews');
const workshopReviewsRoutes = require('./routes/workshop-reviews');
const testimonialsRoutes = require('./routes/testimonials');
const heroSlidesRoutes = require('./routes/hero-slides');
const subscriptionBoxesRoutes = require('./routes/subscription-boxes');
const subscriptionsRoutes = require('./routes/subscriptions');
const subscriptionReviewsRoutes = require('./routes/subscription-reviews');
const favoritesRoutes = require('./routes/favorites');
const notificationsRoutes = require('./routes/notifications');
const cartRoutes = require('./routes/cart');
const { initializeSchema } = require('./database/init-db');
const { seedDatabase } = require('./database/mysql_seed');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// DATABASE INITIALIZATION
// ============================================
// Initialize schema on startup (creates tables if they don't exist)
// NOTE: Commented out after initial setup - XAMPP MySQL persists tables between restarts
// Only uncomment if you need to recreate the database schema
// initializeSchema().catch(err => {
//     console.error('❌ Failed to initialize database schema:', err);
//     // Don't exit - allow server to start even if schema init fails
//     // This allows for manual troubleshooting
// });

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// 1. Helmet - Adds security headers (disable CSP to allow images)
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP to allow images from same origin
    crossOriginResourcePolicy: false // Allow cross-origin images
}));

// 2. CORS - Restrict to frontend origin only
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);

        // Allowed origins for development and production
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:3000',
            process.env.CLIENT_URL // Production URL from environment variable
        ].filter(Boolean); // Remove undefined values

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 3. Rate Limiting - Prevent brute force attacks
const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // 5 attempts per 5 minutes
    message: {
        error: 'Too many login attempts',
        details: 'You have exceeded the maximum number of login attempts (5 attempts per 5 minutes).',
        action: 'Please wait 5 minutes before trying again.',
        retryAfter: '5 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Reset counter on successful login
    // Custom handler for better error response
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many login attempts',
            message: 'You have tried to login too many times. Please wait 5 minutes before trying again.',
            details: {
                maxAttempts: 5,
                windowMinutes: 5
            }
        });
    }
});

// ============================================
// GENERAL MIDDLEWARE
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (images) from client's public directory - MUST BE BEFORE LOGGING
const path = require('path');
const imagesPath = path.join(__dirname, '../client/public/Images');
console.log('📁 Serving static images from:', imagesPath);
app.use('/Images', express.static(imagesPath));

// Serve uploaded files from server/uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
console.log('📁 Serving uploads from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Serve test HTML file
app.use(express.static(__dirname));

// Request logging middleware (AFTER static files so images don't clutter logs)
app.use((req, res, next) => {
    // Only log API requests, not static files
    if (req.path.startsWith('/api') || req.path === '/') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    }
    next();
});

// ============================================
// API ROUTES
// ============================================

// Auth routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/workshops', workshopsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/organizers', organizersRoutes);
app.use('/api/instructors', instructorsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/product-reviews', productReviewsRoutes);
app.use('/api/event-reviews', eventReviewsRoutes);
app.use('/api/workshop-reviews', workshopReviewsRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/hero-slides', heroSlidesRoutes);
app.use('/api/subscription-boxes', subscriptionBoxesRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/subscription-reviews', subscriptionReviewsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/cart', cartRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Urban Harvest Hub API is running',
        timestamp: new Date().toISOString()
    });
});

// Database Seeding Endpoint (Temporary)

app.get('/api/seed', async (req, res) => {
    try {
        await initializeSchema();
        await seedDatabase();
        res.json({ message: 'Database seeded successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Seeding failed', details: error.message });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Urban Harvest Hub API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth (signup, login, me)',
            events: '/api/events',
            workshops: '/api/workshops',
            products: '/api/products',
            orders: '/api/orders',
            bookings: '/api/bookings',
            health: '/api/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 ========================================');
    console.log('🚀 Urban Harvest Hub API Server [v2.0 - DEBUG]');
    console.log(`🚀 Running on: http://localhost:${PORT}`);
    console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('🚀 ========================================');
    console.log('📊 Available endpoints:');
    console.log(`   POST   /api/auth/signup`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/auth/me`);
    console.log(`   GET    /api/events`);
    console.log(`   GET    /api/events/:id`);
    console.log(`   POST   /api/events (admin)`);
    console.log(`   GET    /api/workshops`);
    console.log(`   GET    /api/workshops/:id`);
    console.log(`   POST   /api/workshops (admin)`);
    console.log(`   GET    /api/products`);
    console.log(`   GET    /api/products/:id`);
    console.log(`   POST   /api/products (admin)`);
    console.log(`   POST   /api/bookings`);
    console.log(`   GET    /api/bookings`);
    console.log('🚀 ========================================');
});

module.exports = app;
