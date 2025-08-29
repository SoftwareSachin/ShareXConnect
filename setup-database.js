#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up ShareXConnect Database...\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('📋 Creating .env file from template...');
  if (fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created. Please update it with your database credentials.\n');
  } else {
    console.log('❌ .env.example not found. Please create .env file manually.\n');
    process.exit(1);
  }
}

// Check if DATABASE_URL is configured
const envContent = fs.readFileSync('.env', 'utf8');
if (envContent.includes('postgresql://username:password@localhost')) {
  console.log('⚠️  Please update DATABASE_URL in .env file with your actual PostgreSQL credentials.\n');
  console.log('Example: DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/sharexconnect"\n');
  process.exit(1);
}

console.log('🔄 Running database setup...');

// Run database push
exec('npm run db:push', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Make sure PostgreSQL is running and DATABASE_URL is correct in .env file');
    return;
  }
  
  if (stderr) {
    console.error('Warning:', stderr);
  }
  
  console.log(stdout);
  console.log('✅ Database setup completed successfully!\n');
  console.log('🎉 ShareXConnect is ready to run!');
  console.log('   Run: npm run dev');
});