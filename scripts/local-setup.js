#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 ShareXConnect Local Development Setup\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('Creating .env file from template...\n');
  fs.copyFileSync('.env.example', '.env');
}

console.log('Please configure your local PostgreSQL database:\n');

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function setup() {
  try {
    const username = await askQuestion('PostgreSQL username (default: postgres): ') || 'postgres';
    const password = await askQuestion('PostgreSQL password: ');
    const host = await askQuestion('Database host (default: localhost): ') || 'localhost';
    const port = await askQuestion('Database port (default: 5432): ') || '5432';
    const database = await askQuestion('Database name (default: sharexconnect): ') || 'sharexconnect';
    
    const databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${database}`;
    
    console.log('\nUpdating .env file...');
    
    // Read current .env
    let envContent = fs.readFileSync('.env', 'utf8');
    
    // Update DATABASE_URL
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL="${databaseUrl}"`
    );
    
    // Generate JWT secret if not present
    if (!envContent.includes('JWT_SECRET=') || envContent.includes('your-super-secure-jwt-secret-key')) {
      const jwtSecret = require('crypto').randomBytes(64).toString('hex');
      envContent = envContent.replace(
        /JWT_SECRET=.*/,
        `JWT_SECRET="${jwtSecret}"`
      );
    }
    
    fs.writeFileSync('.env', envContent);
    
    console.log('✅ Environment configuration updated\n');
    
    console.log('Running database setup...');
    
    // Run database push
    exec('npm run db:push', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Database setup failed:', error.message);
        console.error('\nPlease ensure:');
        console.error('1. PostgreSQL is running');
        console.error('2. Database exists (createdb ' + database + ')');
        console.error('3. User has correct permissions\n');
        rl.close();
        return;
      }
      
      if (stderr) {
        console.error('Warning:', stderr);
      }
      
      console.log(stdout);
      console.log('✅ Database schema created successfully!\n');
      
      console.log('🎉 Setup completed! You can now run:');
      console.log('   npm run dev\n');
      console.log('Default login credentials will be created on first startup:');
      console.log('   Admin: admin@sharex.edu / AdminPassword123!');
      console.log('   Faculty: faculty@sharex.edu / FacultyPassword123!\n');
      
      rl.close();
    });
    
  } catch (error) {
    console.error('Setup failed:', error.message);
    rl.close();
  }
}

setup();