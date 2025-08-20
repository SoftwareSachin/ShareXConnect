#!/usr/bin/env node

/**
 * Local Database Setup Script for ShareXConnect
 * Automates PostgreSQL setup for local development
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function log(message) {
  console.log(`🔧 ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

function error(message) {
  console.log(`❌ ${message}`);
}

function executeCommand(command, description) {
  try {
    log(description);
    execSync(command, { stdio: 'inherit' });
    success(`${description} completed`);
    return true;
  } catch (err) {
    error(`${description} failed: ${err.message}`);
    return false;
  }
}

async function checkPrerequisites() {
  log('Checking prerequisites...');
  
  // Check Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    success(`Node.js found: ${nodeVersion}`);
  } catch (err) {
    error('Node.js not found. Please install Node.js 18+ from https://nodejs.org/');
    process.exit(1);
  }
  
  // Check PostgreSQL
  try {
    const pgVersion = execSync('psql --version', { encoding: 'utf8' }).trim();
    success(`PostgreSQL found: ${pgVersion}`);
    return true;
  } catch (err) {
    log('PostgreSQL not found locally. Checking for Docker...');
    
    try {
      const dockerVersion = execSync('docker --version', { encoding: 'utf8' }).trim();
      success(`Docker found: ${dockerVersion}`);
      return false; // PostgreSQL not local, but Docker available
    } catch (dockerErr) {
      error('Neither PostgreSQL nor Docker found.');
      error('Please install PostgreSQL or Docker to continue.');
      process.exit(1);
    }
  }
}

async function setupPostgreSQLLocal() {
  log('Setting up local PostgreSQL database...');
  
  const dbName = 'sharexconnect_dev';
  const username = process.env.USER || 'dev_user';
  
  // Create database
  try {
    executeCommand(`createdb ${dbName}`, `Creating database: ${dbName}`);
  } catch (err) {
    log('Database might already exist, continuing...');
  }
  
  // Create .env file
  const envContent = `# ShareXConnect Local Development Environment
DATABASE_URL=postgresql://${username}@localhost:5432/${dbName}
JWT_SECRET=local-development-jwt-secret-change-in-production-minimum-32-chars
NODE_ENV=development

# Database Pool Settings
DB_POOL_MAX=15
DB_POOL_MIN=2
DB_POOL_TIMEOUT=30000
`;
  
  fs.writeFileSync('.env', envContent);
  success('.env file created with local PostgreSQL configuration');
  
  return `postgresql://${username}@localhost:5432/${dbName}`;
}

async function setupPostgreSQLDocker() {
  log('Setting up PostgreSQL with Docker...');
  
  const containerName = 'sharexconnect-postgres';
  const dbName = 'sharexconnect_dev';
  const username = 'dev_user';
  const password = 'dev_password';
  
  // Stop existing container if running
  try {
    execSync(`docker stop ${containerName}`, { stdio: 'ignore' });
    execSync(`docker rm ${containerName}`, { stdio: 'ignore' });
  } catch (err) {
    // Container doesn't exist, continue
  }
  
  // Start PostgreSQL container
  const dockerCommand = `docker run --name ${containerName} \
    -e POSTGRES_DB=${dbName} \
    -e POSTGRES_USER=${username} \
    -e POSTGRES_PASSWORD=${password} \
    -p 5432:5432 \
    -d postgres:15`;
  
  if (executeCommand(dockerCommand, 'Starting PostgreSQL Docker container')) {
    // Wait for PostgreSQL to be ready
    log('Waiting for PostgreSQL to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Create .env file
    const envContent = `# ShareXConnect Local Development Environment
DATABASE_URL=postgresql://${username}:${password}@localhost:5432/${dbName}
JWT_SECRET=local-development-jwt-secret-change-in-production-minimum-32-chars
NODE_ENV=development

# Database Pool Settings
DB_POOL_MAX=15
DB_POOL_MIN=2
DB_POOL_TIMEOUT=30000
`;
    
    fs.writeFileSync('.env', envContent);
    success('.env file created with Docker PostgreSQL configuration');
    
    return `postgresql://${username}:${password}@localhost:5432/${dbName}`;
  }
  
  return null;
}

async function testConnection(databaseUrl) {
  log('Testing database connection...');
  
  try {
    const testCommand = `psql "${databaseUrl}" -c "SELECT version();"`;
    execSync(testCommand, { stdio: 'pipe' });
    success('Database connection successful');
    return true;
  } catch (err) {
    error('Database connection failed');
    return false;
  }
}

async function setupSchema() {
  log('Setting up database schema...');
  
  // Install dependencies if needed
  if (!fs.existsSync('node_modules')) {
    executeCommand('npm install', 'Installing dependencies');
  }
  
  // Push schema to database
  if (executeCommand('npm run db:push', 'Pushing database schema')) {
    success('Database schema setup completed');
    return true;
  }
  
  return false;
}

async function createSampleData() {
  const createSample = await question('Would you like to create sample data for development? (y/N): ');
  
  if (createSample.toLowerCase() === 'y' || createSample.toLowerCase() === 'yes') {
    log('Creating sample data...');
    
    // This would run the seeding script
    executeCommand('npm run seed:dev', 'Creating sample colleges and users');
    success('Sample data created');
  }
}

async function main() {
  console.log('🌟 ShareXConnect Local Database Setup\n');
  
  const hasLocalPostgreSQL = await checkPrerequisites();
  
  let databaseUrl;
  
  if (hasLocalPostgreSQL) {
    const useLocal = await question('Use local PostgreSQL installation? (Y/n): ');
    
    if (useLocal.toLowerCase() !== 'n' && useLocal.toLowerCase() !== 'no') {
      databaseUrl = await setupPostgreSQLLocal();
    } else {
      databaseUrl = await setupPostgreSQLDocker();
    }
  } else {
    databaseUrl = await setupPostgreSQLDocker();
  }
  
  if (!databaseUrl) {
    error('Failed to setup database');
    process.exit(1);
  }
  
  // Test connection
  if (!(await testConnection(databaseUrl))) {
    error('Database setup failed - connection test unsuccessful');
    process.exit(1);
  }
  
  // Setup schema
  if (!(await setupSchema())) {
    error('Schema setup failed');
    process.exit(1);
  }
  
  // Create sample data
  await createSampleData();
  
  // Final instructions
  console.log('\n🎉 Local database setup completed successfully!\n');
  console.log('Next steps:');
  console.log('  1. Start the development server: npm run dev');
  console.log('  2. Visit http://localhost:5000');
  console.log('  3. Check database health: http://localhost:5000/health');
  console.log('  4. Create your first admin user via the signup page\n');
  
  console.log('Database Information:');
  console.log(`  URL: ${databaseUrl}`);
  console.log(`  Health endpoint: http://localhost:5000/health`);
  console.log(`  Backup directory: ./backups/\n`);
  
  console.log('Useful commands:');
  console.log('  npm run dev          - Start development server');
  console.log('  npm run db:push      - Update database schema');
  console.log('  npm run db:studio    - Open database GUI (if available)');
  console.log('  docker logs sharexconnect-postgres - View PostgreSQL logs (Docker)');
  
  rl.close();
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n🔄 Setup interrupted');
  rl.close();
  process.exit(0);
});

main().catch((err) => {
  error(`Setup failed: ${err.message}`);
  rl.close();
  process.exit(1);
});