/**
 * Database Connection Module - MySQL Edition
 * Provides helper functions for database operations
 * Automatically creates database if it doesn't exist
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'urban_harvest_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
};

let pool;

/**
 * Initialize database connection
 * Creates database if it doesn't exist
 */
async function initializeDatabase() {
    try {
        // First, connect without specifying a database
        const tempConnection = await mysql.createConnection({
            host: DB_CONFIG.host,
            user: DB_CONFIG.user,
            password: DB_CONFIG.password
        });

        // Create database if it doesn't exist
        await tempConnection.query(
            `CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``
        );

        console.log(`✅ Database '${DB_CONFIG.database}' ready`);

        await tempConnection.end();

        // Now create the connection pool with the database selected
        pool = mysql.createPool(DB_CONFIG);

        console.log('✅ Connected to MySQL database');

        return pool;
    } catch (err) {
        console.error('❌ Error initializing database:', err.message);
        process.exit(1);
    }
}

/**
 * Get the connection pool
 * Initializes if not already done
 */
async function getPool() {
    if (!pool) {
        await initializeDatabase();
    }
    return pool;
}

/**
 * Helper function to run queries (INSERT, UPDATE, DELETE)
 * Returns { lastID, changes } for compatibility with SQLite code
 */
async function runQuery(sql, params = []) {
    const connection = await getPool();
    const [result] = await connection.execute(sql, params);

    return {
        lastID: result.insertId || 0,
        changes: result.affectedRows || 0
    };
}

/**
 * Helper function to get a single row (SELECT)
 */
async function getOne(sql, params = []) {
    const connection = await getPool();
    const [rows] = await connection.execute(sql, params);
    return rows[0] || null;
}

/**
 * Helper function to get multiple rows (SELECT)
 */
async function getAll(sql, params = []) {
    const connection = await getPool();
    const [rows] = await connection.execute(sql, params);
    return rows;
}

// Initialize database on module load
initializeDatabase();

// Export helper functions
module.exports = {
    getPool,
    runQuery,
    getOne,
    getAll
};
