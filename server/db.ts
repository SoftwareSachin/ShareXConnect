import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { Pool as NodePool } from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure for both Neon (cloud) and local PostgreSQL
let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzleNode>;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please check your .env file or run: node setup-database.js"
  );
}

const databaseUrl = process.env.DATABASE_URL;

// Detect if using Neon database (cloud) or local PostgreSQL
if (databaseUrl.includes('neon.tech') || databaseUrl.includes('neon.database')) {
  // Neon (serverless) setup
  console.log('🌐 Using Neon serverless database connection');
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
} else {
  // Local PostgreSQL setup
  console.log('🐘 Using local PostgreSQL database connection');
  const pool = new NodePool({ 
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  // Test connection
  pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
  });
  
  pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
  });
  
  db = drizzleNode(pool, { schema });
}

export { db };

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down database connection...');
  process.exit(0);
});