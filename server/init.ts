import { db } from './db';
import { storage } from './storage';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test database connection
    await db.select().from(users).limit(1);
    console.log('✅ Database connection successful');
    
    // Check if admin user exists
    const adminUser = await storage.getUserByEmail('admin@sharex.edu');
    
    if (!adminUser) {
      console.log('👤 Creating default admin user...');
      
      // Create default admin user for testing
      const defaultAdmin = await storage.createUser({
        username: 'admin',
        email: 'admin@sharex.edu',
        password: 'AdminPassword123!',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        institution: 'ShareX University'
      });
      
      console.log(`✅ Default admin created: ${defaultAdmin.email}`);
      console.log('   Username: admin');
      console.log('   Password: AdminPassword123!');
    }
    
    // Check if faculty user exists
    const facultyUser = await storage.getUserByEmail('faculty@sharex.edu');
    
    if (!facultyUser) {
      console.log('👨‍🏫 Creating default faculty user...');
      
      const defaultFaculty = await storage.createUser({
        username: 'professor',
        email: 'faculty@sharex.edu', 
        password: 'FacultyPassword123!',
        firstName: 'John',
        lastName: 'Professor',
        role: 'FACULTY',
        institution: 'ShareX University'
      });
      
      console.log(`✅ Default faculty created: ${defaultFaculty.email}`);
      console.log('   Username: professor');
      console.log('   Password: FacultyPassword123!');
    }
    
    console.log('🎉 Database initialization completed!\n');
    
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Please check your database connection and try again.\n');
    
    if (error.message.includes('does not exist')) {
      console.log('💡 Suggestion: Run "npm run db:push" to create database tables');
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