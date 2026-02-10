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

        console.log('🧹 Cleaning SQL (removing comments)...');
        // Remove single-line comments (-- comment)
        let cleanSQL = schema.replace(/--.*$/gm, '');
        // Remove multi-line comments (/* comment */)
        cleanSQL = cleanSQL.replace(/\/\*[\s\S]*?\*\//g, '');

        // Extract and handle trigger blocks (DELIMITER $$ ... DELIMITER ;)
        const delimiterBlocks = [];
        const delimiterRegex = /DELIMITER \$\$([\s\S]*?)DELIMITER ;/g;
        let match;

        while ((match = delimiterRegex.exec(cleanSQL)) !== null) {
            delimiterBlocks.push(match[1]);
        }

        // Remove delimiter blocks from main SQL to split safely
        let mainSQL = cleanSQL.replace(/DELIMITER \$\$[\s\S]*?DELIMITER ;/g, '');

        // Execute main schema statements (tables, indexes, inserts)
        const statements = mainSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`🚀 Executing ${statements.length} logic statements...`);
        for (const statement of statements) {
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

        // Execute triggers
        if (delimiterBlocks.length > 0) {
            console.log(`⚡ Executing ${delimiterBlocks.length} trigger blocks...`);
            for (const block of delimiterBlocks) {
                const triggers = block
                    .split(/END\s*\$\$/i)
                    .map(t => t.trim())
                    .filter(t => t.length > 0 && t.toUpperCase().includes('CREATE TRIGGER'));

                for (const trigger of triggers) {
                    try {
                        await pool.query(trigger + ' END');
                    } catch (err) {
                        if (!err.message.includes('already exists')) {
                            console.warn('⚠️  Trigger warning:', err.message);
                        }
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
