/**
 * Real-time Schema Validation System
 * Continuously monitors and validates database schema integrity
 */

import { Pool } from 'pg';

interface SchemaValidationResult {
  isValid: boolean;
  missingTables: string[];
  missingColumns: { [table: string]: string[] };
  errors: string[];
}

export class SchemaValidator {
  private pool: Pool;
  
  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Complete schema validation
   */
  async validateCompleteSchema(): Promise<SchemaValidationResult> {
    const result: SchemaValidationResult = {
      isValid: true,
      missingTables: [],
      missingColumns: {},
      errors: []
    };

    try {
      // Validate all required tables
      const tableValidation = await this.validateRequiredTables();
      result.missingTables = tableValidation.missingTables;
      
      if (tableValidation.missingTables.length > 0) {
        result.isValid = false;
        result.errors.push(`Missing tables: ${tableValidation.missingTables.join(', ')}`);
      }

      // Validate all required columns for each table
      const columnValidation = await this.validateRequiredColumns();
      result.missingColumns = columnValidation;
      
      if (Object.keys(columnValidation).length > 0) {
        result.isValid = false;
        for (const [table, columns] of Object.entries(columnValidation)) {
          result.errors.push(`Missing columns in ${table}: ${columns.join(', ')}`);
        }
      }

      return result;
      
    } catch (error: any) {
      result.isValid = false;
      result.errors.push(`Validation error: ${error.message}`);
      return result;
    }
  }

  /**
   * Validate that all required tables exist
   */
  private async validateRequiredTables(): Promise<{ missingTables: string[] }> {
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
      `);
      
      const existingTables = result.rows.map(row => row.table_name);
      const missingTables = requiredTables.filter(table => !existingTables.includes(table));
      
      return { missingTables };
      
    } finally {
      client.release();
    }
  }

  /**
   * Validate that all required columns exist
   */
  private async validateRequiredColumns(): Promise<{ [table: string]: string[] }> {
    const tableSchemas = {
      users: [
        'id', 'username', 'email', 'password', 'first_name', 'last_name',
        'role', 'institution', 'college_domain', 'is_verified', 'created_at', 'updated_at'
      ],
      projects: [
        'id', 'title', 'description', 'category', 'visibility', 'status',
        'tech_stack', 'github_url', 'demo_url', 'academic_level', 'department',
        'course_subject', 'project_methodology', 'setup_instructions',
        'repository_url', 'live_demo_url', 'source_code_repository',
        'documentation_reports', 'images_assets', 'repository_structure',
        'readme_content', 'license_type', 'contributing_guidelines',
        'installation_instructions', 'api_documentation', 'star_count',
        'allows_collaboration', 'requires_approval_for_collaboration',
        'owner_id', 'created_at', 'updated_at'
      ],
      project_files: [
        'id', 'project_id', 'file_name', 'file_path', 'file_type',
        'file_size', 'content', 'is_archive', 'archive_contents', 'uploaded_at'
      ]
    };

    const missingColumns: { [table: string]: string[] } = {};
    const client = await this.pool.connect();
    
    try {
      for (const [tableName, requiredColumns] of Object.entries(tableSchemas)) {
        const result = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
        `, [tableName]);
        
        const existingColumns = result.rows.map(row => row.column_name);
        const missing = requiredColumns.filter(col => !existingColumns.includes(col));
        
        if (missing.length > 0) {
          missingColumns[tableName] = missing;
        }
      }
      
      return missingColumns;
      
    } finally {
      client.release();
    }
  }

  /**
   * Real-time monitoring function
   */
  async startContinuousMonitoring(): Promise<void> {
    console.log('🔍 Starting continuous schema monitoring...');
    
    const checkInterval = 30000; // Check every 30 seconds
    
    const monitor = async () => {
      try {
        const validation = await this.validateCompleteSchema();
        
        if (!validation.isValid) {
          console.warn('⚠️ Schema validation failed:');
          validation.errors.forEach(error => console.warn(`  - ${error}`));
          
          // Attempt automatic fix
          console.log('🔧 Attempting automatic schema repair...');
          const { runAutoDatabaseSync } = await import('./auto-sync');
          await runAutoDatabaseSync(this.pool);
          console.log('✅ Automatic schema repair completed');
        }
        
      } catch (error) {
        console.error('❌ Schema monitoring error:', error);
      }
    };
    
    // Initial check
    await monitor();
    
    // Set up interval monitoring
    setInterval(monitor, checkInterval);
  }
}

export async function runSchemaValidation(pool: Pool): Promise<SchemaValidationResult> {
  const validator = new SchemaValidator(pool);
  return await validator.validateCompleteSchema();
}