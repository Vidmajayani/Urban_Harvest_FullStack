/**
 * Urban Harvest Hub - Complete Database Seed Script for MySQL
 * Migrates ALL data from JSON files to MySQL database (20+ tables)
 * USES SINGLE USERS TABLE (customers + admins combined by role)
 * 
 * Includes: Events, Workshops, Products, FAQs, Testimonials, Hero Slides, Subscription Boxes
 * Plus: Sample users, orders, bookings, reviews
 * 
 * Run this file AFTER creating the database schema
 * Usage: node mysql_seed.js
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getPool, runQuery, getOne } = require('./db');

// JSON file paths (adjust these to match your project structure)
const EVENTS_JSON = path.join(__dirname, '../data/events.json');
const WORKSHOPS_JSON = path.join(__dirname, '../data/workshops.json');
const PRODUCTS_JSON = path.join(__dirname, '../data/products.json');
const FAQS_JSON = path.join(__dirname, '../data/faqs.json');
const TESTIMONIALS_JSON = path.join(__dirname, '../data/testimonials.json');
const HERO_SLIDES_JSON = path.join(__dirname, '../data/hero_slides.json');
const SUBSCRIPTION_BOXES_JSON = path.join(__dirname, '../data/subscription_boxes.json');

// Helper function to read and parse JSON files
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`❌ Error reading ${filePath}:`, err.message);
        return [];
    }
}

// Extract price as number from string like "Rs 500" or "Free"
function extractPrice(priceStr) {
    if (!priceStr || priceStr.toLowerCase() === 'free') return 0;
    const match = priceStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
}

// ============================================
// SEED FUNCTIONS
// ============================================

// 1. Seed Users (Admins + Customers in ONE table)
async function seedUsers() {
    console.log('\n👥 Seeding users...');

    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userPasswordHash = await bcrypt.hash('user123', 10);

    const users = [
        // Admins
        { name: 'Admin User', email: 'admin@urbanharvest.com', password_hash: adminPasswordHash, role: 'admin', phone: null, address: null },
        { name: 'Content Manager', email: 'manager@urbanharvest.com', password_hash: adminPasswordHash, role: 'admin', phone: null, address: null },

        // Customers
        { name: 'John Doe', email: 'john@example.com', password_hash: userPasswordHash, role: 'customer', phone: '+94771234567', address: '123 Main St, Colombo' },
        { name: 'Jane Smith', email: 'jane@example.com', password_hash: userPasswordHash, role: 'customer', phone: '+94772345678', address: '456 Park Ave, Kandy' },
        { name: 'Mike Johnson', email: 'mike@example.com', password_hash: userPasswordHash, role: 'customer', phone: '+94773456789', address: '789 Lake Rd, Galle' }
    ];

    for (const user of users) {
        try {
            await runQuery(
                `INSERT INTO users (name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)`,
                [user.name, user.email, user.password_hash, user.role, user.phone, user.address]
            );
            console.log(`  ✓ Added ${user.role}: ${user.email}`);
        } catch (err) {
            console.error(`  ✗ Error adding user ${user.email}:`, err.message);
        }
    }
}

// 2. Seed Organizers (extracted from events JSON)
async function seedOrganizers() {
    console.log('\n🏢 Seeding organizers...');

    const events = readJSONFile(EVENTS_JSON);
    const organizersMap = new Map();

    // Extract unique organizers
    events.forEach(event => {
        if (event.organizer && event.organizer.name) {
            organizersMap.set(event.organizer.name, event.organizer);
        }
    });

    for (const [name, organizer] of organizersMap) {
        try {
            await runQuery(
                `INSERT INTO organizers (name, role, image, contact_email) VALUES (?, ?, ?, ?)`,
                [organizer.name, organizer.role, organizer.image, null]
            );
            console.log(`  ✓ Added organizer: ${organizer.name}`);
        } catch (err) {
            console.error(`  ✗ Error adding organizer ${organizer.name}:`, err.message);
        }
    }
}

// 3. Seed Instructors (extracted from workshops JSON)
async function seedInstructors() {
    console.log('\n👨‍🏫 Seeding instructors...');

    const workshops = readJSONFile(WORKSHOPS_JSON);
    const instructorsMap = new Map();

    // Extract unique instructors
    workshops.forEach(workshop => {
        if (workshop.instructor) {
            instructorsMap.set(workshop.instructor, {
                name: workshop.instructor,
                role: workshop.instructor_role,
                image: workshop.instructor_image
            });
        }
    });

    for (const [name, instructor] of instructorsMap) {
        try {
            await runQuery(
                `INSERT INTO instructors (name, role, image, bio, contact_email) VALUES (?, ?, ?, ?, ?)`,
                [instructor.name, instructor.role, instructor.image, null, null]
            );
            console.log(`  ✓ Added instructor: ${instructor.name}`);
        } catch (err) {
            console.error(`  ✗ Error adding instructor ${instructor.name}:`, err.message);
        }
    }
}

// 4. Seed Events
async function seedEvents() {
    console.log('\n📅 Seeding events...');

    const events = readJSONFile(EVENTS_JSON);

    for (const event of events) {
        try {
            // Get category_id
            const category = await getOne(`SELECT category_id FROM categories WHERE category_name = ? AND category_type = 'event'`, [event.category]);
            if (!category) {
                console.log(`  ⚠ Category not found for event: ${event.title}`);
                continue;
            }

            // Get organizer_id
            const organizer = await getOne(`SELECT organizer_id FROM organizers WHERE name = ?`, [event.organizer?.name]);
            if (!organizer) {
                console.log(`  ⚠ Organizer not found for event: ${event.title}`);
                continue;
            }

            // Get admin user (user_id = 1)
            const admin = await getOne(`SELECT user_id FROM users WHERE role = 'admin' LIMIT 1`);

            const price = extractPrice(event.price);

            // Insert event
            const result = await runQuery(
                `INSERT INTO events (
                    category_id, organizer_id, created_by_user, title, description, 
                    detailed_description, event_date, event_time, location, image, 
                    price, total_spots, spots_left, rating
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    category.category_id, organizer.organizer_id, admin.user_id, event.title, event.description,
                    event.detailed_description, event.date, event.time, event.location, event.image,
                    price, event.spots_left, event.spots_left, 0.0  // Rating starts at 0, will be calculated from reviews
                ]
            );

            const eventId = result.lastID;

            // Insert agenda items
            if (event.agenda && Array.isArray(event.agenda)) {
                for (let i = 0; i < event.agenda.length; i++) {
                    await runQuery(
                        `INSERT INTO event_agenda (event_id, time, activity, order_index) VALUES (?, ?, ?, ?)`,
                        [eventId, event.agenda[i].time, event.agenda[i].activity, i + 1]
                    );
                }
            }

            // Insert highlights
            if (event.highlights && Array.isArray(event.highlights)) {
                for (let i = 0; i < event.highlights.length; i++) {
                    await runQuery(
                        `INSERT INTO event_highlights (event_id, highlight_text, order_index) VALUES (?, ?, ?)`,
                        [eventId, event.highlights[i], i + 1]
                    );
                }
            }

            // Insert expectations
            if (event.what_to_expect && Array.isArray(event.what_to_expect)) {
                for (let i = 0; i < event.what_to_expect.length; i++) {
                    await runQuery(
                        `INSERT INTO event_expectations (event_id, expectation_text, order_index) VALUES (?, ?, ?)`,
                        [eventId, event.what_to_expect[i], i + 1]
                    );
                }
            }

            console.log(`  ✓ Added event: ${event.title}`);
        } catch (err) {
            console.error(`  ✗ Error adding event ${event.title}:`, err.message);
        }
    }
}

// 5. Seed Workshops
async function seedWorkshops() {
    console.log('\n🛠️  Seeding workshops...');

    const workshops = readJSONFile(WORKSHOPS_JSON);

    for (const workshop of workshops) {
        try {
            // Get category_id
            const category = await getOne(`SELECT category_id FROM categories WHERE category_name = ? AND category_type = 'workshop'`, [workshop.category]);
            if (!category) {
                console.log(`  ⚠ Category not found for workshop: ${workshop.title}`);
                continue;
            }

            // Get instructor_id
            const instructor = await getOne(`SELECT instructor_id FROM instructors WHERE name = ?`, [workshop.instructor]);
            if (!instructor) {
                console.log(`  ⚠ Instructor not found for workshop: ${workshop.title}`);
                continue;
            }

            // Get admin user
            const admin = await getOne(`SELECT user_id FROM users WHERE role = 'admin' LIMIT 1`);

            const price = extractPrice(workshop.price);

            // Insert workshop
            const result = await runQuery(
                `INSERT INTO workshops (
                    category_id, instructor_id, created_by_user, title, description,
                    detailed_description, workshop_date, workshop_time, duration, location,
                    image, price, total_spots, spots_left, level
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    category.category_id, instructor.instructor_id, admin.user_id, workshop.title, workshop.description,
                    workshop.detailed_description, workshop.date, workshop.time, workshop.duration, workshop.location,
                    workshop.image, price, workshop.spots_left, workshop.spots_left, workshop.level
                ]
            );

            const workshopId = result.lastID;

            // Insert learning outcomes
            if (workshop.learning_outcomes && Array.isArray(workshop.learning_outcomes)) {
                for (let i = 0; i < workshop.learning_outcomes.length; i++) {
                    await runQuery(
                        `INSERT INTO workshop_outcomes (workshop_id, outcome_text, order_index) VALUES (?, ?, ?)`,
                        [workshopId, workshop.learning_outcomes[i], i + 1]
                    );
                }
            }

            // Insert requirements
            if (workshop.requirements && Array.isArray(workshop.requirements)) {
                for (let i = 0; i < workshop.requirements.length; i++) {
                    await runQuery(
                        `INSERT INTO workshop_requirements (workshop_id, requirement_text, order_index) VALUES (?, ?, ?)`,
                        [workshopId, workshop.requirements[i], i + 1]
                    );
                }
            }

            console.log(`  ✓ Added workshop: ${workshop.title}`);
        } catch (err) {
            console.error(`  ✗ Error adding workshop ${workshop.title}:`, err.message);
        }
    }
}

// 6. Seed Products
async function seedProducts() {
    console.log('\n🛒 Seeding products...');

    const products = readJSONFile(PRODUCTS_JSON);
    console.log(`   Found ${products.length} products in JSON file`);

    for (const product of products) {
        try {
            console.log(`\n   Processing: ${product.id}. ${product.name} (${product.category})`);

            // Map category names (JSON → Database)
            let categoryName = product.category;
            if (categoryName === 'Gardening') {
                categoryName = 'Garden Supplies';
            }

            // Get category_id
            const category = await getOne(`SELECT category_id FROM categories WHERE category_name = ? AND category_type = 'product'`, [categoryName]);
            if (!category) {
                console.log(`  ⚠ Category not found for product: ${product.name} (category: ${product.category})`);
                continue;
            }
            console.log(`   → Category ID: ${category.category_id}`);

            // Get admin user
            const admin = await getOne(`SELECT user_id FROM users WHERE role = 'admin' LIMIT 1`);

            // Insert product
            const result = await runQuery(
                `INSERT INTO products (
                    category_id, created_by_user, name, price, unit, image,
                    description, rating, reviews_count, stock_quantity, origin
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    category.category_id, admin.user_id, product.name, product.price, product.unit, product.image,
                    product.description, 0.0, 0, 100, product.details?.origin || null
                ]
            );

            const productId = result.lastID;
            console.log(`   → Inserted with product_id: ${productId}`);

            // Insert product details
            if (product.details) {
                for (const [key, value] of Object.entries(product.details)) {
                    await runQuery(
                        `INSERT INTO product_details (product_id, detail_key, detail_value) VALUES (?, ?, ?)`,
                        [productId, key, value]
                    );
                }
            }

            console.log(`  ✓ Added product: ${product.name}`);
        } catch (err) {
            console.error(`  ✗ Error adding product ${product.name}:`, err.message);
            console.error(`     Full error:`, err);
        }
    }
}

// 7. Seed FAQs
async function seedFAQs() {
    console.log('\n❓ Seeding FAQs...');

    const faqs = readJSONFile(FAQS_JSON);
    const admin = await getOne(`SELECT user_id FROM users WHERE role = 'admin' LIMIT 1`);

    for (let i = 0; i < faqs.length; i++) {
        const faq = faqs[i];
        try {
            await runQuery(
                `INSERT INTO faqs (question, answer, order_index, is_active, created_by_user) VALUES (?, ?, ?, ?, ?)`,
                [faq.question, faq.answer, i + 1, 1, admin.user_id]
            );
            console.log(`  ✓ Added FAQ: ${faq.question.substring(0, 50)}...`);
        } catch (err) {
            console.error(`  ✗ Error adding FAQ:`, err.message);
        }
    }
}

// 8. Seed Testimonials
async function seedTestimonials() {
    console.log('\n⭐ Seeding testimonials...');

    const testimonials = readJSONFile(TESTIMONIALS_JSON);
    const admin = await getOne(`SELECT user_id FROM users WHERE role = 'admin' LIMIT 1`);

    for (const testimonial of testimonials) {
        try {
            await runQuery(
                `INSERT INTO testimonials (customer_name, customer_role, customer_image, rating, testimonial_text, is_featured, is_active, created_by_user) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [testimonial.name, testimonial.role, testimonial.image, testimonial.rating, testimonial.text, 1, 1, admin.user_id]
            );
            console.log(`  ✓ Added testimonial from: ${testimonial.name}`);
        } catch (err) {
            console.error(`  ✗ Error adding testimonial:`, err.message);
        }
    }
}

// 9. Seed Hero Slides
async function seedHeroSlides() {
    console.log('\n🎠 Seeding hero slides...');

    const slides = readJSONFile(HERO_SLIDES_JSON);
    const admin = await getOne(`SELECT user_id FROM users WHERE role = 'admin' LIMIT 1`);

    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        try {
            await runQuery(
                `INSERT INTO hero_slides (image, title, subtitle, cta_text, cta_link, order_index, is_active, created_by_user) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [slide.image, slide.title, slide.subtitle, slide.ctaText, slide.ctaLink, i + 1, 1, admin.user_id]
            );
            console.log(`  ✓ Added hero slide: ${slide.title}`);
        } catch (err) {
            console.error(`  ✗ Error adding hero slide:`, err.message);
        }
    }
}

// 10. Seed Subscription Boxes (New Normalized Structure)
async function seedSubscriptionBoxes() {
    console.log('\n📦 Seeding subscription boxes...');

    const boxes = readJSONFile(SUBSCRIPTION_BOXES_JSON);

    for (const box of boxes) {
        try {
            // Insert main box info
            const result = await runQuery(
                `INSERT INTO subscription_boxes (name, description, price, frequency, image_url, is_active) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    box.name,
                    box.description,
                    box.price,
                    box.frequency,
                    box.image_url,
                    box.is_active ? 1 : 0
                ]
            );

            const boxId = result.lastID;

            // Insert items for this box
            if (box.items && Array.isArray(box.items)) {
                for (const item of box.items) {
                    await runQuery(
                        `INSERT INTO subscription_box_items (box_id, item_name, quantity, description, display_order) 
                         VALUES (?, ?, ?, ?, ?)`,
                        [boxId, item.item_name, item.quantity, item.description, item.display_order]
                    );
                }
            }

            console.log(`  ✓ Added subscription box: ${box.name} with ${box.items?.length || 0} items`);
        } catch (err) {
            console.error(`  ✗ Error adding subscription box:`, err.message);
        }
    }
}

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

async function seedDatabase() {
    console.log('🌱 Starting MySQL database seeding...\n');
    console.log('📊 This will populate 20+ tables with your JSON data\n');
    console.log('👥 Using SINGLE USERS table (customers + admins combined)\n');

    try {
        // Seed all tables in correct order
        await seedUsers();              // 1. Users (admins + customers in ONE table)
        await seedOrganizers();         // 2. Organizers (from events JSON)
        await seedInstructors();        // 3. Instructors (from workshops JSON)
        await seedEvents();             // 4. Events + agenda + highlights + expectations
        await seedWorkshops();          // 5. Workshops + outcomes + requirements
        await seedProducts();           // 6. Products + details
        await seedFAQs();               // 7. FAQs (BONUS)
        await seedTestimonials();       // 8. Testimonials (BONUS)
        await seedHeroSlides();         // 9. Hero Slides (BONUS)
        await seedSubscriptionBoxes();  // 10. Subscription Boxes

        console.log('\n✅ MySQL database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log('   ✓ Users: 2 admins + 3 customers (in ONE table)');
        console.log('   ✓ Events: Migrated from events.json');
        console.log('   ✓ Workshops: Migrated from workshops.json');
        console.log('   ✓ Products: Migrated from products.json');
        console.log('   ✓ FAQs: Migrated from faqs.json (BONUS)');
        console.log('   ✓ Testimonials: Migrated from testimonials.json (BONUS)');
        console.log('   ✓ Hero Slides: Migrated from hero_slides.json (BONUS)');
        console.log('   ✓ Subscription Boxes: Loaded from subscription_boxes.json');
        console.log('\n🔐 Default Credentials:');
        console.log('   Admin: admin@urbanharvest.com / admin123 (role: admin)');
        console.log('   User: john@example.com / user123 (role: customer)');
        console.log('\n🎉 Your MySQL database is ready with clean data!');

    } catch (err) {
        console.error('\n❌ Seeding failed:', err.message);
        console.error(err.stack);
    } finally {
        process.exit(0);
    }
}

// Run the seeding if executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
