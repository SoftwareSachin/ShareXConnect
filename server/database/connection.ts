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
      console.log('🔄 Running database migrations...');
      
      // Use simplified approach - just validate what we have
      await this.manualSchemaCheck();
      
    } catch (error) {
      console.error('❌ Database migrations failed:', error);
      throw error;
    }
  }

  private async manualSchemaCheck(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Auto-create schema if tables are missing
      await this.ensureSchemaExists(client);
      
      // Check if all tables exist
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'projects', 'college_domains', 'project_collaborators', 'project_comments', 'project_stars', 'project_reviews')
      `);
      
      const existingTables = tableCheck.rows.map(row => row.table_name);
      console.log(`📋 Found tables: ${existingTables.length > 0 ? existingTables.join(', ') : 'none'}`);
      
      if (existingTables.length >= 7) {
        console.log('✅ All required tables exist');
      } else {
        console.log('🔄 Auto-creating missing tables...');
        await this.createMissingTables(client);
      }
    } finally {
      client.release();
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
        // No demo college domains - only real ones added by admins

        // No demo admin users - only real users through signup
        
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

  private async ensureSchemaExists(client: any): Promise<void> {
    try {
      // Create enums if they don't exist
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
            CREATE TYPE role AS ENUM ('STUDENT', 'FACULTY', 'ADMIN', 'GUEST');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility') THEN
            CREATE TYPE visibility AS ENUM ('PRIVATE', 'INSTITUTION', 'PUBLIC');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
            CREATE TYPE project_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status') THEN
            CREATE TYPE review_status AS ENUM ('PENDING', 'COMPLETED');
          END IF;
        END
        $$;
      `);
      console.log('✅ Database enums ensured');
    } catch (error) {
      console.error('❌ Error creating enums:', error);
    }
  }

  private async createMissingTables(client: any): Promise<void> {
    try {
      // Create all tables with proper relationships
      await client.query(`
        -- College domains table
        CREATE TABLE IF NOT EXISTS college_domains (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          college_name VARCHAR(200) NOT NULL,
          domain VARCHAR(100) UNIQUE NOT NULL,
          admin_id UUID,
          is_verified BOOLEAN DEFAULT false NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        -- Users table
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(30) UNIQUE NOT NULL,
          email VARCHAR(320) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          role role NOT NULL,
          institution VARCHAR(100) NOT NULL,
          college_domain VARCHAR(100),
          is_verified BOOLEAN DEFAULT false NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        -- Projects table
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          category VARCHAR(100) NOT NULL,
          visibility visibility NOT NULL,
          status project_status NOT NULL,
          tech_stack TEXT[] DEFAULT '{}',
          github_url VARCHAR(500),
          demo_url VARCHAR(500),
          repository_structure TEXT,
          readme_content TEXT,
          license_type VARCHAR(50) DEFAULT 'MIT',
          contributing_guidelines TEXT,
          installation_instructions TEXT,
          api_documentation TEXT,
          owner_id UUID NOT NULL REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        -- Supporting tables
        CREATE TABLE IF NOT EXISTS project_collaborators (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS project_comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          content TEXT NOT NULL,
          project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS project_stars (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          UNIQUE(project_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS project_reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          grade INTEGER,
          feedback TEXT,
          status review_status NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
      console.log('✅ All database tables auto-created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseManager = new DatabaseManager();
export const db = databaseManager.getDrizzleInstance();