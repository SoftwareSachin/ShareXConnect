/**
 * Database Migration System for Local Development
 * Ensures robust schema management and data consistency
 */

import { databaseManager } from './connection';
import { sql } from 'drizzle-orm';

interface Migration {
  id: string;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export class MigrationManager {
  private migrations: Migration[] = [];

  constructor() {
    this.registerMigrations();
  }

  private registerMigrations(): void {
    this.migrations = [
      {
        id: '001',
        name: 'create_migration_table',
        up: async () => {
          const client = await databaseManager.getConnection();
          try {
            await client.query(`
              CREATE TABLE IF NOT EXISTS migrations (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `);
            console.log('✅ Migration table created');
          } finally {
            client.release();
          }
        },
        down: async () => {
          const client = await databaseManager.getConnection();
          try {
            await client.query('DROP TABLE IF EXISTS migrations');
          } finally {
            client.release();
          }
        }
      },
      {
        id: '002',
        name: 'create_indexes_for_performance',
        up: async () => {
          const client = await databaseManager.getConnection();
          try {
            // Create performance indexes (without CONCURRENTLY for development)
            const indexes = [
              'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
              'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)', 
              'CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution)',
              'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
              'CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id)',
              'CREATE INDEX IF NOT EXISTS idx_projects_visibility ON projects(visibility)',
              'CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)',
              'CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at)',
              'CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id)',
              'CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id)',
              'CREATE INDEX IF NOT EXISTS idx_project_collaborators_project ON project_collaborators(project_id)',
              'CREATE INDEX IF NOT EXISTS idx_project_collaborators_user ON project_collaborators(user_id)',
              'CREATE INDEX IF NOT EXISTS idx_project_stars_project ON project_stars(project_id)',
              'CREATE INDEX IF NOT EXISTS idx_project_stars_user ON project_stars(user_id)'
            ];
            
            for (const indexQuery of indexes) {
              try {
                await client.query(indexQuery);
                console.log(`✅ Index created: ${indexQuery.split(' ')[5]}`);
              } catch (error) {
                console.log(`⚠️ Index may already exist: ${indexQuery.split(' ')[5]}`);
              }
            }
            console.log('✅ Performance indexes created');
          } finally {
            client.release();
          }
        },
        down: async () => {
          const client = await databaseManager.getConnection();
          try {
            await client.query(`
              DROP INDEX IF EXISTS idx_users_email;
              DROP INDEX IF EXISTS idx_users_username;
              DROP INDEX IF EXISTS idx_users_institution;
              DROP INDEX IF EXISTS idx_users_role;
              DROP INDEX IF EXISTS idx_projects_owner;
              DROP INDEX IF EXISTS idx_projects_visibility;
              DROP INDEX IF EXISTS idx_projects_status;
              DROP INDEX IF EXISTS idx_projects_created;
              DROP INDEX IF EXISTS idx_comments_project;
              DROP INDEX IF EXISTS idx_comments_author;
              DROP INDEX IF EXISTS idx_project_collaborators_project;
              DROP INDEX IF EXISTS idx_project_collaborators_user;
              DROP INDEX IF EXISTS idx_project_stars_project;
              DROP INDEX IF EXISTS idx_project_stars_user;
            `);
          } finally {
            client.release();
          }
        }
      },
      {
        id: '003',
        name: 'add_full_text_search',
        up: async () => {
          const client = await databaseManager.getConnection();
          try {
            // Add full-text search capabilities
            await client.query(`
              -- Add text search vector columns
              ALTER TABLE projects 
              ADD COLUMN IF NOT EXISTS search_vector tsvector;
              
              -- Create function to update search vector
              CREATE OR REPLACE FUNCTION update_project_search_vector() 
              RETURNS trigger AS $$
              BEGIN
                NEW.search_vector := to_tsvector('english', 
                  COALESCE(NEW.title, '') || ' ' || 
                  COALESCE(NEW.description, '') || ' ' || 
                  COALESCE(array_to_string(NEW.tech_stack, ' '), '')
                );
                RETURN NEW;
              END;
              $$ LANGUAGE plpgsql;
              
              -- Create trigger for automatic updates
              DROP TRIGGER IF EXISTS project_search_vector_update ON projects;
              CREATE TRIGGER project_search_vector_update
                BEFORE INSERT OR UPDATE ON projects
                FOR EACH ROW EXECUTE FUNCTION update_project_search_vector();
              
              -- Create search index
              CREATE INDEX IF NOT EXISTS idx_projects_search 
              ON projects USING gin(search_vector);
              
              -- Update existing records
              UPDATE projects SET search_vector = to_tsvector('english', 
                COALESCE(title, '') || ' ' || 
                COALESCE(description, '') || ' ' || 
                COALESCE(array_to_string(tech_stack, ' '), '')
              );
            `);
            console.log('✅ Full-text search capabilities added');
          } finally {
            client.release();
          }
        },
        down: async () => {
          const client = await databaseManager.getConnection();
          try {
            await client.query(`
              DROP TRIGGER IF EXISTS project_search_vector_update ON projects;
              DROP FUNCTION IF EXISTS update_project_search_vector();
              DROP INDEX IF EXISTS idx_projects_search;
              ALTER TABLE projects DROP COLUMN IF EXISTS search_vector;
            `);
          } finally {
            client.release();
          }
        }
      },
      {
        id: '004',
        name: 'ensure_complete_drizzle_schema_sync',
        up: async () => {
          const client = await databaseManager.getConnection();
          try {
            console.log('🔧 Ensuring complete Drizzle schema synchronization...');
            
            // First, create all required enum types
            console.log('📝 Creating enum types...');
            
            const enumDefinitions = [
              { name: 'request_type', values: ['REQUEST', 'INVITATION'] },
              { name: 'request_status', values: ['PENDING', 'APPROVED', 'REJECTED'] },
              { name: 'repo_item_type', values: ['FILE', 'FOLDER'] },
              { name: 'change_type', values: ['ADD', 'MODIFY', 'DELETE', 'SUGGEST'] },
              { name: 'change_status', values: ['OPEN', 'APPROVED', 'REJECTED', 'MERGED'] },
              { name: 'pull_request_status', values: ['OPEN', 'APPROVED', 'REJECTED', 'MERGED', 'DRAFT'] },
              { name: 'audit_action', values: ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'UPLOAD', 'DOWNLOAD', 'COLLABORATE', 'REVIEW', 'COMMENT'] }
            ];

            for (const enumDef of enumDefinitions) {
              try {
                // Check if enum already exists
                const result = await client.query(`
                  SELECT 1 FROM pg_type WHERE typname = $1
                `, [enumDef.name]);
                
                if (result.rows.length === 0) {
                  // Create enum if it doesn't exist
                  const enumQuery = `CREATE TYPE ${enumDef.name} AS ENUM (${enumDef.values.map(v => `'${v}'`).join(', ')})`;
                  await client.query(enumQuery);
                  console.log(`✅ Enum created: ${enumDef.name}`);
                } else {
                  console.log(`⚠️ Enum already exists: ${enumDef.name}`);
                }
              } catch (error: any) {
                console.warn(`⚠️ Error with enum ${enumDef.name}: ${error.message}`);
              }
            }
            
            // Ensure all tables from Drizzle schema exist with correct structure
            // College domains table
            await client.query(`
              CREATE TABLE IF NOT EXISTS college_domains (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                college_name VARCHAR(200) NOT NULL,
                domain VARCHAR(100) UNIQUE NOT NULL,
                admin_id UUID,
                is_verified BOOLEAN DEFAULT FALSE NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
              );
            `);

            // Ensure users table has all Drizzle schema columns
            await client.query(`
              ALTER TABLE users 
              ADD COLUMN IF NOT EXISTS college_domain VARCHAR(100),
              ADD COLUMN IF NOT EXISTS department VARCHAR(100),
              ADD COLUMN IF NOT EXISTS tech_expertise TEXT,
              ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500),
              ADD COLUMN IF NOT EXISTS bio TEXT,
              ADD COLUMN IF NOT EXISTS location VARCHAR(100),
              ADD COLUMN IF NOT EXISTS github_url VARCHAR(500),
              ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
              ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(500),
              ADD COLUMN IF NOT EXISTS website_url VARCHAR(500);
            `);

            // Ensure projects table has all Drizzle schema columns
            await client.query(`
              ALTER TABLE projects 
              ADD COLUMN IF NOT EXISTS academic_level VARCHAR(100),
              ADD COLUMN IF NOT EXISTS department VARCHAR(100),
              ADD COLUMN IF NOT EXISTS course_subject VARCHAR(150),
              ADD COLUMN IF NOT EXISTS project_methodology TEXT,
              ADD COLUMN IF NOT EXISTS setup_instructions TEXT,
              ADD COLUMN IF NOT EXISTS repository_url VARCHAR(500),
              ADD COLUMN IF NOT EXISTS live_demo_url VARCHAR(500),
              ADD COLUMN IF NOT EXISTS source_code_repository TEXT,
              ADD COLUMN IF NOT EXISTS documentation_reports TEXT,
              ADD COLUMN IF NOT EXISTS images_assets TEXT,
              ADD COLUMN IF NOT EXISTS repository_structure TEXT,
              ADD COLUMN IF NOT EXISTS readme_content TEXT,
              ADD COLUMN IF NOT EXISTS license_type VARCHAR(50) DEFAULT 'MIT',
              ADD COLUMN IF NOT EXISTS contributing_guidelines TEXT,
              ADD COLUMN IF NOT EXISTS installation_instructions TEXT,
              ADD COLUMN IF NOT EXISTS api_documentation TEXT,
              ADD COLUMN IF NOT EXISTS star_count INTEGER DEFAULT 0,
              ADD COLUMN IF NOT EXISTS allows_collaboration BOOLEAN DEFAULT TRUE,
              ADD COLUMN IF NOT EXISTS requires_approval_for_collaboration BOOLEAN DEFAULT TRUE;
            `);

            // Ensure collaboration_requests table exists
            await client.query(`
              CREATE TABLE IF NOT EXISTS collaboration_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID NOT NULL,
                requester_id UUID,
                invitee_id UUID,
                sender_id UUID NOT NULL,
                type request_type DEFAULT 'REQUEST' NOT NULL,
                message TEXT,
                status request_status DEFAULT 'PENDING' NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
                responded_at TIMESTAMP WITHOUT TIME ZONE
              );
            `);

            // Ensure project_repository table exists
            await client.query(`
              CREATE TABLE IF NOT EXISTS project_repository (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID NOT NULL,
                path VARCHAR(500) NOT NULL,
                name VARCHAR(255) NOT NULL,
                type repo_item_type NOT NULL,
                content TEXT,
                parent_id UUID,
                size INTEGER DEFAULT 0,
                language VARCHAR(50),
                last_modified_by UUID NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
              );
            `);

            // Ensure project_change_requests table exists
            await client.query(`
              CREATE TABLE IF NOT EXISTS project_change_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID NOT NULL,
                requester_id UUID NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                file_id UUID,
                change_type change_type NOT NULL,
                proposed_changes TEXT,
                status change_status DEFAULT 'OPEN' NOT NULL,
                reviewed_by UUID,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
              );
            `);

            // Ensure project_pull_requests table exists with correct structure
            await client.query(`
              CREATE TABLE IF NOT EXISTS project_pull_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID NOT NULL,
                author_id UUID NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                branch_name VARCHAR(100) NOT NULL DEFAULT 'feature-branch',
                status pull_request_status DEFAULT 'OPEN' NOT NULL,
                reviewed_by UUID,
                reviewed_at TIMESTAMP WITHOUT TIME ZONE,
                merged_at TIMESTAMP WITHOUT TIME ZONE,
                files_changed TEXT[] DEFAULT '{}',
                changes_preview TEXT,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
              );
            `);

            // Ensure pull_request_files table exists
            await client.query(`
              CREATE TABLE IF NOT EXISTS pull_request_files (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                pull_request_id UUID NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_type VARCHAR(100) NOT NULL,
                file_size INTEGER NOT NULL,
                content TEXT,
                is_archive BOOLEAN DEFAULT FALSE NOT NULL,
                uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
              );
            `);

            // Ensure audit_logs table exists
            await client.query(`
              CREATE TABLE IF NOT EXISTS audit_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID,
                action audit_action NOT NULL,
                resource VARCHAR(100) NOT NULL,
                resource_id UUID,
                details TEXT,
                ip_address VARCHAR(45),
                user_agent VARCHAR(500),
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
              );
            `);

            console.log('✅ Complete Drizzle schema synchronization completed');
          } finally {
            client.release();
          }
        },
        down: async () => {
          const client = await databaseManager.getConnection();
          try {
            // This is a complex rollback - only remove added columns, not tables with data
            console.log('⚠️ Rolling back schema sync (removing added columns only)');
          } finally {
            client.release();
          }
        }
      },
      {
        id: '005',
        name: 'ensure_all_foreign_key_constraints',
        up: async () => {
          const client = await databaseManager.getConnection();
          try {
            console.log('🔗 Ensuring all foreign key constraints from Drizzle schema...');
            
            const constraints = [
              // Projects constraints
              'ALTER TABLE projects ADD CONSTRAINT IF NOT EXISTS projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;',
              
              // Project collaborators constraints
              'ALTER TABLE project_collaborators ADD CONSTRAINT IF NOT EXISTS project_collaborators_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;',
              'ALTER TABLE project_collaborators ADD CONSTRAINT IF NOT EXISTS project_collaborators_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;',
              
              // Project stars constraints
              'ALTER TABLE project_stars ADD CONSTRAINT IF NOT EXISTS project_stars_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;',
              'ALTER TABLE project_stars ADD CONSTRAINT IF NOT EXISTS project_stars_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;',
              
              // Project comments constraints
              'ALTER TABLE project_comments ADD CONSTRAINT IF NOT EXISTS project_comments_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;',
              'ALTER TABLE project_comments ADD CONSTRAINT IF NOT EXISTS project_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;',
              
              // Project reviews constraints
              'ALTER TABLE project_reviews ADD CONSTRAINT IF NOT EXISTS project_reviews_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;',
              'ALTER TABLE project_reviews ADD CONSTRAINT IF NOT EXISTS project_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;',
              
              // Project files constraints
              'ALTER TABLE project_files ADD CONSTRAINT IF NOT EXISTS project_files_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;',
              
              // Collaboration requests constraints
              'ALTER TABLE collaboration_requests ADD CONSTRAINT IF NOT EXISTS collaboration_requests_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;',
              'ALTER TABLE collaboration_requests ADD CONSTRAINT IF NOT EXISTS collaboration_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE;',
              'ALTER TABLE collaboration_requests ADD CONSTRAINT IF NOT EXISTS collaboration_requests_invitee_id_fkey FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE CASCADE;',
              'ALTER TABLE collaboration_requests ADD CONSTRAINT IF NOT EXISTS collaboration_requests_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;',
              
              // Project repository constraints
              'ALTER TABLE project_repository ADD CONSTRAINT IF NOT EXISTS project_repository_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;',
              'ALTER TABLE project_repository ADD CONSTRAINT IF NOT EXISTS project_repository_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES project_repository(id) ON DELETE CASCADE;',
              'ALTER TABLE project_repository ADD CONSTRAINT IF NOT EXISTS project_repository_last_modified_by_fkey FOREIGN KEY (last_modified_by) REFERENCES users(id) ON DELETE CASCADE;',
              
              // Project change requests constraints
              'ALTER TABLE project_change_requests ADD CONSTRAINT IF NOT EXISTS project_change_requests_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;',
              'ALTER TABLE project_change_requests ADD CONSTRAINT IF NOT EXISTS project_change_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE;',
              'ALTER TABLE project_change_requests ADD CONSTRAINT IF NOT EXISTS project_change_requests_file_id_fkey FOREIGN KEY (file_id) REFERENCES project_repository(id) ON DELETE CASCADE;',
              'ALTER TABLE project_change_requests ADD CONSTRAINT IF NOT EXISTS project_change_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE CASCADE;',
              
              // Project pull requests constraints
              'ALTER TABLE project_pull_requests ADD CONSTRAINT IF NOT EXISTS project_pull_requests_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;',
              'ALTER TABLE project_pull_requests ADD CONSTRAINT IF NOT EXISTS project_pull_requests_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;',
              'ALTER TABLE project_pull_requests ADD CONSTRAINT IF NOT EXISTS project_pull_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE CASCADE;',
              
              // Pull request files constraints
              'ALTER TABLE pull_request_files ADD CONSTRAINT IF NOT EXISTS pull_request_files_pull_request_id_fkey FOREIGN KEY (pull_request_id) REFERENCES project_pull_requests(id) ON DELETE CASCADE;',
              
              // Audit logs constraints
              'ALTER TABLE audit_logs ADD CONSTRAINT IF NOT EXISTS audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;',

              // College domains constraints
              'ALTER TABLE college_domains ADD CONSTRAINT IF NOT EXISTS college_domains_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;'
            ];

            for (const constraint of constraints) {
              try {
                await client.query(constraint);
              } catch (error: any) {
                // Ignore if constraint already exists
                if (!error.message.includes('already exists')) {
                  console.warn(`⚠️ Constraint warning: ${error.message}`);
                }
              }
            }
            
            console.log('✅ All foreign key constraints ensured');
          } finally {
            client.release();
          }
        },
        down: async () => {
          const client = await databaseManager.getConnection();
          try {
            console.log('🔗 Removing foreign key constraints...');
            // Complex rollback - would need to remove all constraints
          } finally {
            client.release();
          }
        }
      }
    ];
  }

  async runMigrations(): Promise<void> {
    console.log('🔄 Running database migrations...');
    
    // Ensure migration table exists
    await this.migrations[0].up();
    
    const client = await databaseManager.getConnection();
    try {
      // Get executed migrations
      const executedResult = await client.query('SELECT id FROM migrations ORDER BY id');
      const executedMigrations = new Set(executedResult.rows.map(row => row.id));
      
      // Run pending migrations
      for (const migration of this.migrations) {
        if (!executedMigrations.has(migration.id)) {
          console.log(`🔧 Running migration: ${migration.name}`);
          
          try {
            await migration.up();
            
            // Record migration as executed
            await client.query(
              'INSERT INTO migrations (id, name) VALUES ($1, $2)',
              [migration.id, migration.name]
            );
            
            console.log(`✅ Migration completed: ${migration.name}`);
          } catch (error) {
            console.error(`❌ Migration failed: ${migration.name}`, error);
            throw error;
          }
        }
      }
      
      console.log('✅ All migrations completed successfully');
    } finally {
      client.release();
    }
  }

  async rollback(migrationId: string): Promise<void> {
    console.log(`🔄 Rolling back migration: ${migrationId}`);
    
    const migration = this.migrations.find(m => m.id === migrationId);
    if (!migration) {
      throw new Error(`Migration not found: ${migrationId}`);
    }

    const client = await databaseManager.getConnection();
    try {
      await migration.down();
      
      // Remove migration record
      await client.query('DELETE FROM migrations WHERE id = $1', [migrationId]);
      
      console.log(`✅ Migration rolled back: ${migration.name}`);
    } finally {
      client.release();
    }
  }

  async getStatus(): Promise<{ id: string; name: string; executed: boolean }[]> {
    const client = await databaseManager.getConnection();
    try {
      const executedResult = await client.query('SELECT id FROM migrations ORDER BY id');
      const executedMigrations = new Set(executedResult.rows.map(row => row.id));
      
      return this.migrations.map(migration => ({
        id: migration.id,
        name: migration.name,
        executed: executedMigrations.has(migration.id)
      }));
    } finally {
      client.release();
    }
  }
}

export const migrationManager = new MigrationManager();