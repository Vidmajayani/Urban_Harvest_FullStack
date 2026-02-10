/**
 * MySQL Database Initialization Script
 * Automatically creates tables from mysql_schema.sql on first run
 */

const fs = require('fs');
const path = require('path');
const { getPool } = require('./db');

async function initializeSchema() {
    try {
        const pool = await getPool();
        const schemaPath = path.join(__dirname, 'mysql_schema.sql');

        console.log('📋 Reading MySQL schema file...');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('🔨 Creating database tables...');

        // Disable foreign key checks to allow table creation in any order
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');

        // Split the schema into individual statements
        // Handle DELIMITER changes for triggers
        let currentSQL = schema;

        // Extract and handle trigger blocks separately
        const delimiterMatch = currentSQL.match(/DELIMITER \$\$(.*?)DELIMITER ;/s);
        let triggerBlock = '';
        if (delimiterMatch) {
            triggerBlock = delimiterMatch[1];
            currentSQL = currentSQL.replace(/DELIMITER \$\$.*?DELIMITER ;/s, '');
        }

        // Execute main schema statements (tables, indexes, inserts)
        const statements = currentSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^DELIMITER/));

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await pool.query(statement);
                } catch (err) {
                    // Ignore "already exists" errors
                    if (!err.message.includes('already exists') &&
                        !err.message.includes('Duplicate entry')) {
                        console.warn('⚠️  Warning executing statement:', err.message);
                    }
                }
            }
        }

        // Execute triggers if they exist
        if (triggerBlock) {
            const triggers = triggerBlock
                .split(/END\s*\$\$/i)
                .map(t => t.trim())
                .filter(t => t.length > 0 && t.toUpperCase().includes('CREATE TRIGGER'));

            for (const trigger of triggers) {
                try {
                    await pool.query(trigger + ' END');
                } catch (err) {
                    // Triggers might already exist
                    if (!err.message.includes('already exists')) {
                        console.warn('⚠️  Trigger warning:', err.message);
                    }
                }
            }
        }

        // Re-enable foreign key checks
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ Database schema initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Error initializing schema:', error.message);
        // Re-enable foreign key checks even on error
        try {
            const pool = await getPool();
            await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        } catch (e) {
            // Ignore
        }
        throw error;
    }
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeSchema()
        .then(() => {
            console.log('✅ Schema initialization complete');
            process.exit(0);
        })
        .catch((err) => {
            console.error('❌ Schema initialization failed:', err);
            process.exit(1);
        });
}

module.exports = { initializeSchema };
