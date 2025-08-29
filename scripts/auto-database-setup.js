#!/usr/bin/env node

/**
 * Automatic Database Setup Script
 * Ensures complete database schema synchronization
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting automatic database setup...');

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`📋 Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database schema...');
    
    // Step 1: Generate Drizzle types
    console.log('📝 Generating database types...');
    await runCommand('npx', ['drizzle-kit', 'generate']);
    
    // Step 2: Force push schema
    console.log('💾 Pushing schema to database...');
    await runCommand('npm', ['run', 'db:push', '--', '--force']);
    
    // Step 3: Verify setup
    console.log('✅ Database setup completed successfully!');
    console.log('🎉 All tables and columns are now synchronized.');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };