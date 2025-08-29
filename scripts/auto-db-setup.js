#!/usr/bin/env node
/**
 * Automatic Database Setup Script
 * Ensures all database components are created automatically
 */

const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function autoSetup() {
  console.log('🚀 Starting automatic database setup...');
  
  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Import and run the automated creation system
    const { runCompleteAutoDatabaseCreation } = require('../server/database/auto-create-all.js');
    await runCompleteAutoDatabaseCreation(pool);
    
    console.log('🎉 Automatic database setup completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Automatic database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  autoSetup();
}

module.exports = { autoSetup };