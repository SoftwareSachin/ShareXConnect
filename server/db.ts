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

// PostgreSQL connection for Replit environment
console.log('🐘 Using PostgreSQL database connection');
const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: false, // Disable SSL for local Replit PostgreSQL
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err.message);
});

db = drizzle(pool, { schema });

export { db };

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down database connection...');
  process.exit(0);
});