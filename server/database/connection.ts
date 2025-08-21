/**
 * Robust PostgreSQL Database Connection Manager
 * Optimized for local development and production environments
 */

import { Pool, PoolClient, PoolConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

// Enhanced connection configuration for local and production environments
export class DatabaseManager {
  private pool: Pool;
  private db: ReturnType<typeof drizzle>;
  private isInitialized = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  constructor() {
    this.pool = this.createConnectionPool();
    this.db = drizzle(this.pool, { schema });
    this.setupEventHandlers();
  }

  private createConnectionPool(): Pool {
    const isProduction = process.env.NODE_ENV === 'production';
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Enhanced pool configuration for different environments
    const poolConfig: PoolConfig = {
      connectionString: databaseUrl,
      // Local development settings
      max: isProduction ? 25 : 15, // Maximum connections
      min: isProduction ? 5 : 2,   // Minimum connections
      idleTimeoutMillis: 30000,    // 30 seconds
      connectionTimeoutMillis: 10000, // 10 seconds
      // Enhanced for local development
      keepAlive: true,
      keepAliveInitialDelayMillis: 0,
      // Statement timeout for long queries
      statement_timeout: 60000,    // 60 seconds
      query_timeout: 30000,        // 30 seconds
      // SSL configuration
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };

    console.log(`🐘 Configuring PostgreSQL pool for ${isProduction ? 'production' : 'local development'}`);
    console.log(`📊 Pool settings: ${poolConfig.max} max, ${poolConfig.min} min connections`);

    return new Pool(poolConfig);
  }

  private setupEventHandlers(): void {
    // Connection event handlers
    this.pool.on('connect', (client: PoolClient) => {
      console.log('✅ New PostgreSQL client connected');
    });

    this.pool.on('acquire', (client: PoolClient) => {
      console.log('🔄 Database connection acquired from pool');
    });

    this.pool.on('remove', (client: PoolClient) => {
      console.log('🗑️ Database connection removed from pool');
    });

    this.pool.on('error', (error: Error, client: PoolClient) => {
      console.error('❌ PostgreSQL pool error:', error.message);
      console.error('Error details:', error);
      this.handleConnectionError(error);
    });

    // Graceful shutdown handler
    process.on('SIGINT', () => this.gracefulShutdown());
    process.on('SIGTERM', () => this.gracefulShutdown());
  }

  private async handleConnectionError(error: Error): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Maximum reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(async () => {
      try {
        await this.testConnection();
        console.log('✅ Database reconnection successful');
        this.reconnectAttempts = 0;
      } catch (err) {
        console.error('❌ Reconnection failed:', err);
        await this.handleConnectionError(error);
      }
    }, delay);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('📋 Database already initialized');
      return;
    }

    try {
      console.log('🔄 Initializing database...');
      
      // Test connection
      await this.testConnection();
      
      // Run migrations if needed
      await this.runMigrations();
      
      // Seed initial data for local development
      if (process.env.NODE_ENV === 'development') {
        await this.seedDevelopmentData();
      }

      this.isInitialized = true;
      console.log('🎉 Database initialization completed!');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async testConnection(): Promise<void> {
    const client = await this.pool.connect();
    try {
      console.log('🎯 Database connection test successful');
      const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
      console.log('📅 Database time:', result.rows[0].current_time);
      console.log('🗄️ PostgreSQL version:', result.rows[0].pg_version.split(' ')[0]);
      
      // Test pool status
      console.log(`📊 Pool status: ${this.pool.totalCount} total, ${this.pool.idleCount} idle, ${this.pool.waitingCount} waiting`);
    } finally {
      client.release();
    }
  }

  private async runMigrations(): Promise<void> {
    try {
      console.log('🔄 Checking database schema...');
      
      const client = await this.pool.connect();
      try {
        // Check if tables exist
        const tableCheck = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('users', 'colleges', 'projects', 'comments')
        `);
        
        const existingTables = tableCheck.rows.map(row => row.table_name);
        console.log(`📋 Found tables: ${existingTables.length > 0 ? existingTables.join(', ') : 'none'}`);
        
        if (tableCheck.rows.length === 0) {
          console.log('🔧 No tables found, schema needs to be created');
          console.log('💡 Run "npm run db:push" to create schema');
        } else if (tableCheck.rows.length < 4) {
          console.log('⚠️ Some tables missing, schema may need updates');
          console.log('💡 Run "npm run db:push" to update schema');
        } else {
          console.log('✅ All required tables exist');
        }
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Migration check failed:', error);
      throw error;
    }
  }

  private async seedDevelopmentData(): Promise<void> {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    try {
      console.log('🌱 Seeding development data...');
      
      const client = await this.pool.connect();
      try {
        // Check if college domains exist
        const collegeCheck = await client.query('SELECT COUNT(*) FROM college_domains');
        
        if (parseInt(collegeCheck.rows[0].count) === 0) {
          console.log('🏫 Creating sample college domains...');
          
          // Insert sample college domains using proper schema
          await client.query(`
            INSERT INTO college_domains (college_name, domain, is_verified, created_at, updated_at) VALUES
            ('Massachusetts Institute of Technology', 'mit.edu', true, NOW(), NOW()),
            ('Stanford University', 'stanford.edu', true, NOW(), NOW()),
            ('Harvard University', 'harvard.edu', true, NOW(), NOW())
            ON CONFLICT (domain) DO NOTHING
          `);
          
          console.log('✅ Sample college domains created');
        }

        // Check if admin users exist
        const adminCheck = await client.query('SELECT COUNT(*) FROM users WHERE role = $1', ['ADMIN']);
        
        if (parseInt(adminCheck.rows[0].count) === 0) {
          console.log('👤 Creating sample admin users...');
          
          // This would normally use the storage layer with proper password hashing
          console.log('💡 Use the signup page to create admin users');
        }
        
        console.log('✅ Development data seeding completed');
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Development data seeding failed:', error);
      // Don't throw - seeding is optional
    }
  }

  async getConnection(): Promise<PoolClient> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.pool.connect();
  }

  getDrizzleInstance() {
    return this.db;
  }

  getPool(): Pool {
    return this.pool;
  }

  async getStats(): Promise<{
    totalConnections: number;
    idleConnections: number;
    waitingConnections: number;
    isHealthy: boolean;
  }> {
    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingConnections: this.pool.waitingCount,
      isHealthy: this.isInitialized && this.pool.totalCount > 0
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }

  async gracefulShutdown(): Promise<void> {
    console.log('🔄 Shutting down database connections...');
    try {
      await this.pool.end();
      console.log('✅ Database pool closed successfully');
    } catch (error) {
      console.error('❌ Error during database shutdown:', error);
    }
  }

  // Transaction wrapper for safe operations
  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const tx = drizzle(client, { schema });
      const result = await callback(tx);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Monitoring and metrics
  async getPerformanceMetrics(): Promise<{
    activeQueries: number;
    avgQueryTime: number;
    connectionUtilization: number;
    errors: number;
  }> {
    const client = await this.pool.connect();
    try {
      const activeQueries = await client.query(`
        SELECT COUNT(*) as count 
        FROM pg_stat_activity 
        WHERE state = 'active' AND query NOT LIKE '%pg_stat_activity%'
      `);

      const stats = await client.query(`
        SELECT 
          COALESCE(AVG(mean_exec_time), 0) as avg_query_time,
          SUM(calls) as total_queries
        FROM pg_stat_statements 
        WHERE query NOT LIKE '%pg_stat_%'
        LIMIT 1
      `);

      return {
        activeQueries: parseInt(activeQueries.rows[0].count),
        avgQueryTime: parseFloat(stats.rows[0]?.avg_query_time || '0'),
        connectionUtilization: (this.pool.totalCount - this.pool.idleCount) / this.pool.totalCount * 100,
        errors: this.reconnectAttempts
      };
    } catch (error) {
      // Return default metrics if pg_stat_statements is not available
      return {
        activeQueries: 0,
        avgQueryTime: 0,
        connectionUtilization: 0,
        errors: this.reconnectAttempts
      };
    } finally {
      client.release();
    }
  }
}

// Export singleton instance
export const databaseManager = new DatabaseManager();
export const db = databaseManager.getDrizzleInstance();