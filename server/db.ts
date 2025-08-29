import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";

// Database connection for PostgreSQL
let db: ReturnType<typeof drizzle>;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please check your .env file or run: node setup-database.js"
  );
}

const databaseUrl = process.env.DATABASE_URL;

// Robust PostgreSQL connection for both local and production environments
console.log('🐘 Using PostgreSQL database connection');

// Enhanced connection configuration for reliability and performance
const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' && !databaseUrl.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false,
  // Connection pool settings for high concurrency
  max: 20, // Maximum pool size for handling multiple concurrent users
  min: 2,  // Minimum pool size to maintain active connections
  idleTimeoutMillis: 30000, // 30 seconds idle timeout
  connectionTimeoutMillis: 10000, // 10 seconds connection timeout
  // acquireTimeoutMillis removed - not valid in node-postgres Pool config
  // Simplified configuration - removing unsupported options for node-postgres
});

// Enhanced connection event handlers for monitoring
pool.on('connect', (client) => {
  console.log('✅ New PostgreSQL client connected');
});

pool.on('acquire', () => {
  console.log('🔄 Database connection acquired from pool');
});

pool.on('error', (err, client) => {
  console.error('❌ PostgreSQL pool error:', err.message);
  console.error('Error details:', err);
});

pool.on('remove', () => {
  console.log('🗑️ Database connection removed from pool');
});

// Test initial connection and create database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('🎯 Database connection test successful');
    client.release();
  } catch (err) {
    console.error('💥 Database connection test failed:', err);
    throw err;
  }
};

// Initialize database connection
testConnection();

db = drizzle(pool, { schema });

export { db, pool };

// Enhanced graceful shutdown for database connections
const gracefulShutdown = async () => {
  console.log('🔄 Shutting down database connections...');
  try {
    await pool.end();
    console.log('✅ Database pool closed successfully');
  } catch (err) {
    console.error('❌ Error closing database pool:', err);
  } finally {
    process.exit(0);
  }
};

// Handle multiple shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('beforeExit', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});