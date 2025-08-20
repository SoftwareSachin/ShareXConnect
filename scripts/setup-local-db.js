#!/usr/bin/env node

/**
 * Script to set up PostgreSQL database for local development
 * This ensures the database works smoothly on local machines
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkPostgreSQL() {
  try {
    execSync('psql --version', { stdio: 'ignore' });
    log('✅ PostgreSQL is installed', colors.green);
    return true;
  } catch (error) {
    log('❌ PostgreSQL is not installed or not in PATH', colors.red);
    log('Please install PostgreSQL and try again', colors.yellow);
    log('Download from: https://www.postgresql.org/download/', colors.blue);
    return false;
  }
}

function setupDatabaseConnection() {
  const envPath = path.join(__dirname, '..', '.env');
  
  // Check if .env exists
  if (!fs.existsSync(envPath)) {
    log('Creating .env file for local development...', colors.blue);
    
    const defaultEnvContent = `# PostgreSQL Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/sharexconnect
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=sharexconnect

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production-minimum-32-characters

# Node Environment
NODE_ENV=development
PORT=5000
`;
    
    fs.writeFileSync(envPath, defaultEnvContent);
    log('✅ .env file created', colors.green);
  } else {
    log('✅ .env file already exists', colors.green);
  }
}

function createDatabase() {
  try {
    log('Creating database if it doesn\'t exist...', colors.blue);
    
    // Try to create database (will fail silently if it exists)
    try {
      execSync('createdb sharexconnect -U postgres', { stdio: 'ignore' });
      log('✅ Database "sharexconnect" created', colors.green);
    } catch (error) {
      // Database might already exist
      log('✅ Database "sharexconnect" already exists or accessible', colors.green);
    }
    
    return true;
  } catch (error) {
    log('❌ Failed to create database', colors.red);
    log('Please ensure PostgreSQL is running and you have the correct permissions', colors.yellow);
    return false;
  }
}

function runMigrations() {
  try {
    log('Running database migrations...', colors.blue);
    execSync('npm run db:push', { stdio: 'inherit' });
    log('✅ Database schema updated', colors.green);
    return true;
  } catch (error) {
    log('❌ Failed to run migrations', colors.red);
    return false;
  }
}

function startApplication() {
  try {
    log('Starting the application...', colors.blue);
    log('Run "npm run dev" to start the development server', colors.yellow);
    return true;
  } catch (error) {
    log('❌ Failed to start application', colors.red);
    return false;
  }
}

// Main setup function
async function main() {
  log(`${colors.bold}🚀 Setting up ShareXConnect database for local development${colors.reset}\n`);
  
  // Check prerequisites
  if (!checkPostgreSQL()) {
    process.exit(1);
  }
  
  // Setup steps
  setupDatabaseConnection();
  
  if (!createDatabase()) {
    process.exit(1);
  }
  
  if (!runMigrations()) {
    process.exit(1);
  }
  
  log(`\n${colors.bold}${colors.green}🎉 Database setup completed successfully!${colors.reset}\n`);
  log('Your ShareXConnect application is ready for development.', colors.green);
  log('Default admin login: admin@sharex.edu / AdminPassword123!', colors.blue);
  log('Default faculty login: faculty@sharex.edu / FacultyPassword123!', colors.blue);
  
  startApplication();
}

main().catch(error => {
  log(`❌ Setup failed: ${error.message}`, colors.red);
  process.exit(1);
});