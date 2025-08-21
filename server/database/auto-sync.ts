/**
 * Automatic Database Schema Synchronization System
 * Ensures all tables and columns are always created without missing anything
 */

import { spawn } from 'child_process';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

export class AutoDatabaseSync {
  private pool: Pool;
  
  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Main automatic synchronization method
   * This ensures all schema changes are applied automatically
   */
  async autoSync(): Promise<void> {
    console.log('🔄 Starting automatic database schema synchronization...');
    
    try {
      // Step 1: Force push schema using Drizzle
      await this.forcePushSchema();
      
      // Step 2: Validate all required tables exist
      await this.validateAllTables();
      
      // Step 3: Validate all required columns exist
      await this.validateAllColumns();
      
      // Step 4: Create any missing indexes
      await this.ensureIndexes();
      
      console.log('✅ Automatic database synchronization completed successfully!');
      
    } catch (error) {
      console.error('❌ Automatic database synchronization failed:', error);
      
      // Attempt recovery
      await this.attemptRecovery();
      throw error;
    }
  }

  /**
   * Force push all schema changes using Drizzle
   */
  private async forcePushSchema(): Promise<void> {
    console.log('📋 Force pushing schema changes...');
    
    return new Promise((resolve, reject) => {
      const process = spawn('npm', ['run', 'db:push', '--', '--force'], {
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Schema push completed successfully');
          resolve();
        } else {
          console.error('❌ Schema push failed:', errorOutput);
          reject(new Error(`Schema push failed with code ${code}: ${errorOutput}`));
        }
      });

      // Auto-confirm any prompts by sending 'y'
      setTimeout(() => {
        process.stdin.write('y\n');
      }, 1000);
    });
  }

  /**
   * Validate that all required tables exist
   */
  private async validateAllTables(): Promise<void> {
    console.log('🔍 Validating all required tables...');
    
    const requiredTables = [
      'users',
      'college_domains', 
      'projects',
      'project_collaborators',
      'project_comments',
      'project_stars', 
      'project_reviews',
      'project_files',
      'collaboration_requests',
      'project_repository',
      'project_change_requests',
      'audit_logs'
    ];

    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      const existingTables = result.rows.map(row => row.table_name);
      console.log(`📊 Found ${existingTables.length} tables: ${existingTables.join(', ')}`);
      
      const missingTables = requiredTables.filter(table => !existingTables.includes(table));
      
      if (missingTables.length > 0) {
        console.error(`❌ Missing tables: ${missingTables.join(', ')}`);
        throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
      }
      
      console.log('✅ All required tables exist');
      
    } finally {
      client.release();
    }
  }

  /**
   * Validate that all required columns exist in projects table
   */
  private async validateAllColumns(): Promise<void> {
    console.log('🔍 Validating all required columns...');
    
    const requiredProjectColumns = [
      'id', 'title', 'description', 'category', 'visibility', 'status', 
      'tech_stack', 'github_url', 'demo_url', 'academic_level', 'department',
      'course_subject', 'project_methodology', 'setup_instructions', 
      'repository_url', 'live_demo_url', 'source_code_repository',
      'documentation_reports', 'images_assets', 'repository_structure',
      'readme_content', 'license_type', 'contributing_guidelines',
      'installation_instructions', 'api_documentation', 'star_count',
      'allows_collaboration', 'requires_approval_for_collaboration',
      'owner_id', 'created_at', 'updated_at'
    ];

    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND table_schema = 'public'
        ORDER BY column_name
      `);
      
      const existingColumns = result.rows.map(row => row.column_name);
      console.log(`📊 Projects table has ${existingColumns.length} columns`);
      
      const missingColumns = requiredProjectColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.error(`❌ Missing columns in projects table: ${missingColumns.join(', ')}`);
        throw new Error(`Missing required columns in projects table: ${missingColumns.join(', ')}`);
      }
      
      console.log('✅ All required columns exist in projects table');
      
    } finally {
      client.release();
    }
  }

  /**
   * Ensure all performance indexes exist
   */
  private async ensureIndexes(): Promise<void> {
    console.log('🔍 Ensuring performance indexes...');
    
    const indexQueries = [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username)', 
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_owner ON projects(owner_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_visibility ON projects(visibility)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_status ON projects(status)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_files_project ON project_files(project_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collaboration_requests_project ON collaboration_requests(project_id)'
    ];

    const client = await this.pool.connect();
    try {
      for (const query of indexQueries) {
        try {
          await client.query(query);
        } catch (error: any) {
          // Ignore if index already exists
          if (!error.message.includes('already exists')) {
            console.warn(`⚠️ Index creation warning: ${error.message}`);
          }
        }
      }
      
      console.log('✅ Performance indexes ensured');
      
    } finally {
      client.release();
    }
  }

  /**
   * Attempt recovery if synchronization fails
   */
  private async attemptRecovery(): Promise<void> {
    console.log('🔄 Attempting automatic recovery...');
    
    try {
      // Try alternative schema push without force
      await this.alternativeSchemaPush();
      
      // Re-validate after recovery
      await this.validateAllTables();
      await this.validateAllColumns();
      
      console.log('✅ Automatic recovery successful');
      
    } catch (error) {
      console.error('❌ Automatic recovery failed:', error);
      console.log('💡 Manual intervention may be required');
    }
  }

  /**
   * Alternative schema push method
   */
  private async alternativeSchemaPush(): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn('npm', ['run', 'db:push'], {
        stdio: 'pipe',
        shell: true
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Alternative schema push failed with code ${code}`));
        }
      });
    });
  }
}

/**
 * Main function to run automatic database synchronization
 */
export async function runAutoDatabaseSync(pool: Pool): Promise<void> {
  const autoSync = new AutoDatabaseSync(pool);
  await autoSync.autoSync();
}