-- ============================================
-- URBAN HARVEST - MYSQL DATABASE SCHEMA
-- Professional DB Integration for Assignment
-- ============================================
-- Features:
-- - Normalized relational design
-- - Foreign key constraints for data integrity
-- - Optimized indexes for query performance
-- - DB-level validation (NOT NULL, UNIQUE, CHECK constraints)
-- - Auto-increment primary keys
-- - Triggers for automatic rating calculations
-- ============================================

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS subscription_reviews;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS subscription_box_items;
DROP TABLE IF EXISTS subscription_boxes;
DROP TABLE IF EXISTS hero_slides;
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS workshop_reviews;
DROP TABLE IF EXISTS event_reviews;
DROP TABLE IF EXISTS push_subscriptions;
DROP TABLE IF EXISTS product_reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS product_details;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS workshop_requirements;
DROP TABLE IF EXISTS workshop_outcomes;
DROP TABLE IF EXISTS workshops;
DROP TABLE IF EXISTS event_expectations;
DROP TABLE IF EXISTS event_highlights;
DROP TABLE IF EXISTS event_agenda;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS instructors;
DROP TABLE IF EXISTS organizers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ============================================
-- USER MANAGEMENT TABLE
-- ============================================

-- 1. USERS TABLE (Customers + Admins Combined)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    phone VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PUSH SUBSCRIPTIONS TABLE (for PWA notifications)
-- ============================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    endpoint VARCHAR(512) NOT NULL,
    `keys` TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MASTER DATA TABLES
-- ============================================

-- 2. CATEGORIES TABLE (Centralized Categories)
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    category_type ENUM('event', 'workshop', 'product') NOT NULL,
    description TEXT,
    INDEX idx_categories_type (category_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ORGANIZERS TABLE (Event Organizers)
CREATE TABLE IF NOT EXISTS organizers (
    organizer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    image VARCHAR(255),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. INSTRUCTORS TABLE (Workshop Instructors)
CREATE TABLE IF NOT EXISTS instructors (
    instructor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    image VARCHAR(255),
    bio TEXT,
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MAIN CONTENT TABLES
-- ============================================

-- 5. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    organizer_id INT NOT NULL,
    created_by_user INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    event_date DATE NOT NULL,
    event_time VARCHAR(20) NOT NULL,
    location VARCHAR(200) NOT NULL,
    image VARCHAR(255),
    price DECIMAL(10,2) DEFAULT 0.00,
    total_spots INT DEFAULT 0,
    spots_left INT DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    FOREIGN KEY (organizer_id) REFERENCES organizers(organizer_id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by_user) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_events_category (category_id),
    INDEX idx_events_date (event_date),
    INDEX idx_events_organizer (organizer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. WORKSHOPS TABLE
CREATE TABLE IF NOT EXISTS workshops (
    workshop_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    instructor_id INT NOT NULL,
    created_by_user INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    workshop_date DATE NOT NULL,
    workshop_time VARCHAR(50) NOT NULL,
    duration VARCHAR(20),
    location VARCHAR(200) NOT NULL,
    image VARCHAR(255),
    price DECIMAL(10,2) DEFAULT 0.00,
    total_spots INT DEFAULT 0,
    spots_left INT DEFAULT 0,
    level ENUM('Beginner', 'Intermediate', 'Advanced'),
    rating DECIMAL(2,1) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by_user) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_workshops_category (category_id),
    INDEX idx_workshops_date (workshop_date),
    INDEX idx_workshops_instructor (instructor_id),
    INDEX idx_workshops_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    created_by_user INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    image VARCHAR(255),
    description TEXT NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0.0,
    reviews_count INT DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    origin VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by_user) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_products_category (category_id),
    INDEX idx_products_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ADDITIONAL CONTENT TABLES
-- ============================================

-- 8. FAQS TABLE
CREATE TABLE IF NOT EXISTS faqs (
    faq_id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by_user INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_faqs_active (is_active),
    INDEX idx_faqs_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS testimonials (
    testimonial_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_role VARCHAR(100),
    customer_image VARCHAR(255),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    testimonial_text TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by_user INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_testimonials_featured (is_featured),
    INDEX idx_testimonials_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. HERO_SLIDES TABLE
CREATE TABLE IF NOT EXISTS hero_slides (
    slide_id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    cta_text VARCHAR(50),
    cta_link VARCHAR(255),
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by_user INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_hero_slides_active (is_active),
    INDEX idx_hero_slides_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRANSACTION TABLES
-- ============================================

-- 11. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    customer_name VARCHAR(100),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    delivery_address TEXT,
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(100),
    delivery_zip VARCHAR(10),
    payment_method ENUM('card', 'paypal', 'cash') DEFAULT 'card',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_orders_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT,
    workshop_id INT,
    booking_type ENUM('event', 'workshop') NOT NULL,
    customer_name VARCHAR(100),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    special_requests TEXT,
    quantity INT DEFAULT 1,
    total_amount DECIMAL(10,2) DEFAULT 0,
    payment_method ENUM('card', 'paypal', 'cash') DEFAULT 'card',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (workshop_id) REFERENCES workshops(workshop_id) ON DELETE CASCADE,
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_event (event_id),
    INDEX idx_bookings_workshop (workshop_id),
    CHECK (
        (event_id IS NOT NULL AND workshop_id IS NULL) OR 
        (event_id IS NULL AND workshop_id IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. PRODUCT_REVIEWS TABLE
CREATE TABLE IF NOT EXISTS product_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    order_id INT,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL,
    INDEX idx_product_reviews_product (product_id),
    INDEX idx_product_reviews_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. EVENT_REVIEWS TABLE
CREATE TABLE IF NOT EXISTS event_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    booking_id INT,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    verified_attendance BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    INDEX idx_event_reviews_event (event_id),
    INDEX idx_event_reviews_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. WORKSHOP_REVIEWS TABLE
CREATE TABLE IF NOT EXISTS workshop_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    workshop_id INT NOT NULL,
    booking_id INT,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    verified_attendance BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (workshop_id) REFERENCES workshops(workshop_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    INDEX idx_workshop_reviews_workshop (workshop_id),
    INDEX idx_workshop_reviews_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EVENT DETAIL TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS event_agenda (
    agenda_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    time VARCHAR(20) NOT NULL,
    activity VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    INDEX idx_event_agenda_event (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_highlights (
    highlight_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    highlight_text VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    INDEX idx_event_highlights_event (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_expectations (
    expectation_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    expectation_text TEXT NOT NULL,
    order_index INT DEFAULT 0,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    INDEX idx_event_expectations_event (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- WORKSHOP DETAIL TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS workshop_outcomes (
    outcome_id INT AUTO_INCREMENT PRIMARY KEY,
    workshop_id INT NOT NULL,
    outcome_text TEXT NOT NULL,
    order_index INT DEFAULT 0,
    FOREIGN KEY (workshop_id) REFERENCES workshops(workshop_id) ON DELETE CASCADE,
    INDEX idx_workshop_outcomes_workshop (workshop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS workshop_requirements (
    requirement_id INT AUTO_INCREMENT PRIMARY KEY,
    workshop_id INT NOT NULL,
    requirement_text VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    FOREIGN KEY (workshop_id) REFERENCES workshops(workshop_id) ON DELETE CASCADE,
    INDEX idx_workshop_requirements_workshop (workshop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRODUCT DETAIL TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS product_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    detail_key VARCHAR(100) NOT NULL,
    detail_value TEXT,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    INDEX idx_product_details_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUBSCRIPTION BOX SYSTEM TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_boxes (
    box_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    frequency ENUM('weekly', 'bi-weekly', 'monthly') DEFAULT 'monthly',
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(2,1) DEFAULT 0.0,
    reviews_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_subscription_boxes_active (is_active),
    INDEX idx_subscription_boxes_frequency (frequency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscription_box_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    box_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    FOREIGN KEY (box_id) REFERENCES subscription_boxes(box_id) ON DELETE CASCADE,
    INDEX idx_subscription_box_items_box (box_id),
    INDEX idx_subscription_box_items_order (box_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    box_id INT NOT NULL,
    order_id INT,
    start_date DATE NOT NULL,
    next_delivery_date DATE,
    status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (box_id) REFERENCES subscription_boxes(box_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL,
    INDEX idx_subscriptions_user (user_id),
    INDEX idx_subscriptions_box (box_id),
    INDEX idx_subscriptions_order (order_id),
    INDEX idx_subscriptions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscription_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_id INT NOT NULL,
    user_id INT NOT NULL,
    box_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (box_id) REFERENCES subscription_boxes(box_id) ON DELETE CASCADE,
    INDEX idx_subscription_reviews_subscription (subscription_id),
    INDEX idx_subscription_reviews_user (user_id),
    INDEX idx_subscription_reviews_box (box_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FAVORITES/WISHLIST TABLE
-- ============================================

-- Favorites Table (User's saved items across all types)
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM('product', 'event', 'workshop', 'subscription_box') NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, item_type, item_id),
    INDEX idx_favorites_user (user_id),
    INDEX idx_favorites_type (item_type),
    INDEX idx_favorites_item (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DATA: Categories
-- ============================================

INSERT INTO categories (category_name, category_type, description) VALUES 
('Community', 'event', 'Community building and social events'),
('Education', 'event', 'Educational lectures and talks'),
('Volunteering', 'event', 'Volunteer opportunities and service projects'),
('Gardening', 'workshop', 'Gardening and agriculture workshops'),
('DIY', 'workshop', 'Do-it-yourself and craft workshops'),
('Sustainability', 'workshop', 'Sustainability and eco-friendly living workshops'),
('Food', 'product', 'Organic food and produce'),
('Lifestyle', 'product', 'Eco-friendly lifestyle products'),
('Garden Supplies', 'product', 'Gardening tools and supplies')
ON DUPLICATE KEY UPDATE category_name=category_name;

-- ============================================
-- RATING AUTO-CALCULATION TRIGGERS
-- ============================================

DELIMITER $$

-- PRODUCT REVIEWS TRIGGERS
CREATE TRIGGER update_product_rating_insert
AFTER INSERT ON product_reviews
FOR EACH ROW
BEGIN
    UPDATE products
    SET 
        rating = (SELECT ROUND(AVG(rating), 1) FROM product_reviews WHERE product_id = NEW.product_id),
        reviews_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = NEW.product_id)
    WHERE product_id = NEW.product_id;
END$$

CREATE TRIGGER update_product_rating_update
AFTER UPDATE ON product_reviews
FOR EACH ROW
BEGIN
    UPDATE products
    SET 
        rating = (SELECT ROUND(AVG(rating), 1) FROM product_reviews WHERE product_id = NEW.product_id),
        reviews_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = NEW.product_id)
    WHERE product_id = NEW.product_id;
END$$

CREATE TRIGGER update_product_rating_delete
AFTER DELETE ON product_reviews
FOR EACH ROW
BEGIN
    UPDATE products
    SET 
        rating = COALESCE((SELECT ROUND(AVG(rating), 1) FROM product_reviews WHERE product_id = OLD.product_id), 0.0),
        reviews_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = OLD.product_id)
    WHERE product_id = OLD.product_id;
END$$

-- EVENT REVIEWS TRIGGERS
CREATE TRIGGER update_event_rating_insert
AFTER INSERT ON event_reviews
FOR EACH ROW
BEGIN
    UPDATE events SET rating = (SELECT ROUND(AVG(rating), 1) FROM event_reviews WHERE event_id = NEW.event_id) WHERE event_id = NEW.event_id;
END$$

CREATE TRIGGER update_event_rating_update
AFTER UPDATE ON event_reviews
FOR EACH ROW
BEGIN
    UPDATE events SET rating = (SELECT ROUND(AVG(rating), 1) FROM event_reviews WHERE event_id = NEW.event_id) WHERE event_id = NEW.event_id;
END$$

CREATE TRIGGER update_event_rating_delete
AFTER DELETE ON event_reviews
FOR EACH ROW
BEGIN
    UPDATE events SET rating = COALESCE((SELECT ROUND(AVG(rating), 1) FROM event_reviews WHERE event_id = OLD.event_id), 0.0) WHERE event_id = OLD.event_id;
END$$

-- WORKSHOP REVIEWS TRIGGERS
CREATE TRIGGER update_workshop_rating_insert
AFTER INSERT ON workshop_reviews
FOR EACH ROW
BEGIN
    UPDATE workshops SET rating = (SELECT ROUND(AVG(rating), 1) FROM workshop_reviews WHERE workshop_id = NEW.workshop_id) WHERE workshop_id = NEW.workshop_id;
END$$

CREATE TRIGGER update_workshop_rating_update
AFTER UPDATE ON workshop_reviews
FOR EACH ROW
BEGIN
    UPDATE workshops SET rating = (SELECT ROUND(AVG(rating), 1) FROM workshop_reviews WHERE workshop_id = NEW.workshop_id) WHERE workshop_id = NEW.workshop_id;
END$$

CREATE TRIGGER update_workshop_rating_delete
AFTER DELETE ON workshop_reviews
FOR EACH ROW
BEGIN
    UPDATE workshops SET rating = COALESCE((SELECT ROUND(AVG(rating), 1) FROM workshop_reviews WHERE workshop_id = OLD.workshop_id), 0.0) WHERE workshop_id = OLD.workshop_id;
END$$

-- SUBSCRIPTION BOX REVIEWS TRIGGERS
CREATE TRIGGER update_subscription_box_rating_insert
AFTER INSERT ON subscription_reviews
FOR EACH ROW
BEGIN
    UPDATE subscription_boxes 
    SET 
        rating = (SELECT ROUND(AVG(rating), 1) FROM subscription_reviews WHERE box_id = NEW.box_id),
        reviews_count = (SELECT COUNT(*) FROM subscription_reviews WHERE box_id = NEW.box_id)
    WHERE box_id = NEW.box_id;
END$$

CREATE TRIGGER update_subscription_box_rating_update
AFTER UPDATE ON subscription_reviews
FOR EACH ROW
BEGIN
    UPDATE subscription_boxes 
    SET 
        rating = (SELECT ROUND(AVG(rating), 1) FROM subscription_reviews WHERE box_id = NEW.box_id),
        reviews_count = (SELECT COUNT(*) FROM subscription_reviews WHERE box_id = NEW.box_id)
    WHERE box_id = NEW.box_id;
END$$

CREATE TRIGGER update_subscription_box_rating_delete
AFTER DELETE ON subscription_reviews
FOR EACH ROW
BEGIN
    UPDATE subscription_boxes 
    SET 
        rating = COALESCE((SELECT ROUND(AVG(rating), 1) FROM subscription_reviews WHERE box_id = OLD.box_id), 0.0),
        reviews_count = (SELECT COUNT(*) FROM subscription_reviews WHERE box_id = OLD.box_id)
    WHERE box_id = OLD.box_id;
END$$

DELIMITER ;

-- ============================================
-- END OF SCHEMA
-- ============================================
