import { db } from './db';
import { storage } from './storage';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { pool } from './db';
import { runCompleteAutoDatabaseCreation } from './database/auto-create-all';

export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Step 1: Run complete automated database creation
    console.log('🚀 Running automated database component creation...');
    await runCompleteAutoDatabaseCreation(pool);
    
    // Step 2: Test database connection
    await db.select().from(users).limit(1);
    console.log('✅ Database connection successful');
    
    // Verify all tables exist
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      const tableCount = result.rows.length;
      console.log(`📊 Database has ${tableCount} tables: ${result.rows.map((r: any) => r.table_name).join(', ')}`);
    } finally {
      client.release();
    }
    
    // No demo users - only real users through signup
    
    // No demo faculty - only real users through signup
    
    console.log('🎉 Database initialization completed!\n');
    
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Please check your database connection and try again.\n');
    
    if (error.message.includes('does not exist')) {
      console.log('💡 All database components will be created automatically');
      // Try to create everything automatically
      try {
        await runCompleteAutoDatabaseCreation(pool);
        console.log('✅ Automated database creation completed successfully!');
      } catch (autoError: any) {
        console.error('❌ Automated database creation also failed:', autoError.message);
      }
    }
    
    throw error;
  }
}

export async function healthCheck() {
  try {
    // Test database connection
    await db.select().from(users).limit(1);
    return { database: 'healthy' };
  } catch (error: any) {
    console.error('Database health check failed:', error.message);
    return { database: 'unhealthy', error: error.message };
  }
}