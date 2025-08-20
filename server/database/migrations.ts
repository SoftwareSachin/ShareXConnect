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