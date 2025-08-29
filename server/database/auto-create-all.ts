/**
 * Complete Automated Database Creation System
 * Creates ALL database components automatically from schema
 */

import { Pool } from 'pg';
import * as schema from '@shared/schema';

export class AutoDatabaseCreator {
  private pool: Pool;
  
  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Main function to create everything automatically
   */
  async createAllComponents(): Promise<void> {
    console.log('🚀 Starting complete automated database creation...');
    
    try {
      // Step 1: Create all enums
      await this.createAllEnums();
      
      // Step 2: Create all tables
      await this.createAllTables();
      
      // Step 3: Create all indexes for performance
      await this.createAllIndexes();
      
      // Step 4: Add constraints and foreign keys
      await this.ensureConstraints();
      
      console.log('✅ Complete automated database creation finished successfully!');
      
    } catch (error) {
      console.error('❌ Automated database creation failed:', error);
      throw error;
    }
  }

  /**
   * Create all enums from schema
   */
  private async createAllEnums(): Promise<void> {
    console.log('🔧 Creating all enums...');
    
    const enumQueries = [
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
          CREATE TYPE role AS ENUM ('STUDENT', 'FACULTY', 'ADMIN', 'GUEST');
        END IF;
      END $$;`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility') THEN
          CREATE TYPE visibility AS ENUM ('PRIVATE', 'INSTITUTION', 'PUBLIC');
        END IF;
      END $$;`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
          CREATE TYPE project_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED');
        END IF;
      END $$;`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status') THEN
          CREATE TYPE review_status AS ENUM ('PENDING', 'COMPLETED');
        END IF;
      END $$;`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
          CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
        END IF;
      END $$;`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_type') THEN
          CREATE TYPE request_type AS ENUM ('REQUEST', 'INVITATION');
        END IF;
      END $$;`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'repo_item_type') THEN
          CREATE TYPE repo_item_type AS ENUM ('FILE', 'FOLDER');
        END IF;
      END $$;`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'change_type') THEN
          CREATE TYPE change_type AS ENUM ('ADD', 'MODIFY', 'DELETE', 'SUGGEST');
        END IF;
      END $$;`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'change_status') THEN
          CREATE TYPE change_status AS ENUM ('OPEN', 'APPROVED', 'REJECTED', 'MERGED');
        END IF;
      END $$;`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pull_request_status') THEN
          CREATE TYPE pull_request_status AS ENUM ('OPEN', 'APPROVED', 'REJECTED', 'MERGED', 'DRAFT');
        END IF;
      END $$;`,
      
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
          CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'UPLOAD', 'DOWNLOAD', 'COLLABORATE', 'REVIEW', 'COMMENT');
        END IF;
      END $$;`
    ];

    const client = await this.pool.connect();
    try {
      for (const query of enumQueries) {
        await client.query(query);
      }
      console.log('✅ All enums created successfully');
    } finally {
      client.release();
    }
  }

  /**
   * Create all tables from schema
   */
  private async createAllTables(): Promise<void> {
    console.log('🗃️ Creating all tables...');
    
    const client = await this.pool.connect();
    try {
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

      // Users table with all fields
      await client.query(`
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
          department VARCHAR(100),
          tech_expertise TEXT,
          profile_image_url VARCHAR(500),
          bio TEXT,
          location VARCHAR(100),
          github_url VARCHAR(500),
          linkedin_url VARCHAR(500),
          twitter_url VARCHAR(500),
          website_url VARCHAR(500),
          is_verified BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
          updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
        );
      `);

      // Projects table with all academic fields
      await client.query(`
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
          academic_level VARCHAR(100),
          department VARCHAR(100),
          course_subject VARCHAR(150),
          project_methodology TEXT,
          setup_instructions TEXT,
          repository_url VARCHAR(500),
          live_demo_url VARCHAR(500),
          source_code_repository TEXT,
          documentation_reports TEXT,
          images_assets TEXT,
          repository_structure TEXT,
          readme_content TEXT,
          license_type VARCHAR(50) DEFAULT 'MIT',
          contributing_guidelines TEXT,
          installation_instructions TEXT,
          api_documentation TEXT,
          star_count INTEGER DEFAULT 0 NOT NULL,
          allows_collaboration BOOLEAN DEFAULT TRUE NOT NULL,
          requires_approval_for_collaboration BOOLEAN DEFAULT TRUE NOT NULL,
          owner_id UUID NOT NULL,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
          updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
          search_vector TSVECTOR
        );
      `);

      // Project collaborators
      await client.query(`
        CREATE TABLE IF NOT EXISTS project_collaborators (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID NOT NULL,
          user_id UUID NOT NULL,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
          UNIQUE(project_id, user_id)
        );
      `);

      // Project stars
      await client.query(`
        CREATE TABLE IF NOT EXISTS project_stars (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID NOT NULL,
          user_id UUID NOT NULL,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
          UNIQUE(project_id, user_id)
        );
      `);

      // Project comments
      await client.query(`
        CREATE TABLE IF NOT EXISTS project_comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID NOT NULL,
          author_id UUID NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
          updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
        );
      `);

      // Project reviews
      await client.query(`
        CREATE TABLE IF NOT EXISTS project_reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID NOT NULL,
          reviewer_id UUID NOT NULL,
          status review_status NOT NULL,
          grade INTEGER,
          feedback TEXT,
          is_final BOOLEAN DEFAULT FALSE NOT NULL,
          is_read_by_student BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
          updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
        );
      `);

      // Project files
      await client.query(`
        CREATE TABLE IF NOT EXISTS project_files (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_type VARCHAR(50) NOT NULL,
          file_size INTEGER NOT NULL,
          content TEXT,
          is_archive BOOLEAN DEFAULT FALSE,
          archive_contents TEXT,
          uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
        );
      `);

      // Collaboration requests
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

      // Project repository
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

      // Project change requests
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

      // Project pull requests
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

      // Pull request files
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

      // Audit logs
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





      console.log('✅ All tables created successfully');
      
    } finally {
      client.release();
    }
  }

  /**
   * Create all foreign key constraints
   */
  private async ensureConstraints(): Promise<void> {
    console.log('🔗 Adding foreign key constraints...');
    
    const client = await this.pool.connect();
    try {
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
      
      console.log('✅ All constraints added successfully');
      
    } finally {
      client.release();
    }
  }

  /**
   * Create all performance indexes
   */
  private async createAllIndexes(): Promise<void> {
    console.log('⚡ Creating all performance indexes...');
    
    const client = await this.pool.connect();
    try {
      const indexes = [
        // Users indexes
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
        'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
        'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);',
        'CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution);',
        'CREATE INDEX IF NOT EXISTS idx_users_college_domain ON users(college_domain);',
        
        // Projects indexes
        'CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);',
        'CREATE INDEX IF NOT EXISTS idx_projects_visibility ON projects(visibility);',
        'CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);',
        'CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);',
        'CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);',
        'CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at);',
        'CREATE INDEX IF NOT EXISTS idx_projects_department ON projects(department);',
        'CREATE INDEX IF NOT EXISTS idx_projects_academic_level ON projects(academic_level);',
        'CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING gin(search_vector);',
        
        // Project collaborators indexes
        'CREATE INDEX IF NOT EXISTS idx_project_collaborators_project ON project_collaborators(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_collaborators_user ON project_collaborators(user_id);',
        
        // Project stars indexes
        'CREATE INDEX IF NOT EXISTS idx_project_stars_project ON project_stars(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_stars_user ON project_stars(user_id);',
        
        // Project comments indexes
        'CREATE INDEX IF NOT EXISTS idx_project_comments_project ON project_comments(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_comments_author ON project_comments(author_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_comments_created_at ON project_comments(created_at);',
        
        // Project reviews indexes
        'CREATE INDEX IF NOT EXISTS idx_project_reviews_project ON project_reviews(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_reviews_reviewer ON project_reviews(reviewer_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_reviews_status ON project_reviews(status);',
        
        // Project files indexes
        'CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_files_type ON project_files(file_type);',
        'CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_at ON project_files(uploaded_at);',
        'CREATE INDEX IF NOT EXISTS idx_project_files_name ON project_files(file_name);',
        
        // Collaboration requests indexes
        'CREATE INDEX IF NOT EXISTS idx_collaboration_requests_project ON collaboration_requests(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_collaboration_requests_requester ON collaboration_requests(requester_id);',
        'CREATE INDEX IF NOT EXISTS idx_collaboration_requests_status ON collaboration_requests(status);',
        'CREATE INDEX IF NOT EXISTS idx_collaboration_requests_created_at ON collaboration_requests(created_at);',
        
        // Project repository indexes
        'CREATE INDEX IF NOT EXISTS idx_project_repository_project ON project_repository(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_repository_parent ON project_repository(parent_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_repository_path ON project_repository(path);',
        'CREATE INDEX IF NOT EXISTS idx_project_repository_type ON project_repository(type);',
        
        // Project change requests indexes
        'CREATE INDEX IF NOT EXISTS idx_project_change_requests_project ON project_change_requests(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_change_requests_requester ON project_change_requests(requester_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_change_requests_status ON project_change_requests(status);',
        'CREATE INDEX IF NOT EXISTS idx_project_change_requests_created_at ON project_change_requests(created_at);',
        
        // Project pull requests indexes
        'CREATE INDEX IF NOT EXISTS idx_project_pull_requests_project ON project_pull_requests(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_pull_requests_author ON project_pull_requests(author_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_pull_requests_status ON project_pull_requests(status);',
        'CREATE INDEX IF NOT EXISTS idx_project_pull_requests_created_at ON project_pull_requests(created_at);',
        
        // Pull request files indexes
        'CREATE INDEX IF NOT EXISTS idx_pull_request_files_pr ON pull_request_files(pull_request_id);',
        'CREATE INDEX IF NOT EXISTS idx_pull_request_files_type ON pull_request_files(file_type);',
        
        // Audit logs indexes
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);',
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);',
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);',

        // Project pull requests indexes
        'CREATE INDEX IF NOT EXISTS idx_project_pull_requests_project ON project_pull_requests(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_pull_requests_author ON project_pull_requests(author_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_pull_requests_status ON project_pull_requests(status);',
        'CREATE INDEX IF NOT EXISTS idx_project_pull_requests_created_at ON project_pull_requests(created_at);',

        // Pull request files indexes
        'CREATE INDEX IF NOT EXISTS idx_pull_request_files_pull_request ON pull_request_files(pull_request_id);',
        'CREATE INDEX IF NOT EXISTS idx_pull_request_files_name ON pull_request_files(file_name);',
        'CREATE INDEX IF NOT EXISTS idx_pull_request_files_type ON pull_request_files(file_type);',

        // Project change requests indexes
        'CREATE INDEX IF NOT EXISTS idx_project_change_requests_project ON project_change_requests(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_change_requests_requester ON project_change_requests(requester_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_change_requests_status ON project_change_requests(status);',
        'CREATE INDEX IF NOT EXISTS idx_project_change_requests_type ON project_change_requests(change_type);',
        'CREATE INDEX IF NOT EXISTS idx_project_change_requests_created_at ON project_change_requests(created_at);',

        // Project repository indexes
        'CREATE INDEX IF NOT EXISTS idx_project_repository_project ON project_repository(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_repository_parent ON project_repository(parent_id);',
        'CREATE INDEX IF NOT EXISTS idx_project_repository_path ON project_repository(path);',
        'CREATE INDEX IF NOT EXISTS idx_project_repository_type ON project_repository(type);',
        'CREATE INDEX IF NOT EXISTS idx_project_repository_modified_by ON project_repository(last_modified_by);',

        // Collaboration requests indexes
        'CREATE INDEX IF NOT EXISTS idx_collaboration_requests_project ON collaboration_requests(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_collaboration_requests_requester ON collaboration_requests(requester_id);',
        'CREATE INDEX IF NOT EXISTS idx_collaboration_requests_invitee ON collaboration_requests(invitee_id);',
        'CREATE INDEX IF NOT EXISTS idx_collaboration_requests_sender ON collaboration_requests(sender_id);',
        'CREATE INDEX IF NOT EXISTS idx_collaboration_requests_status ON collaboration_requests(status);',
        'CREATE INDEX IF NOT EXISTS idx_collaboration_requests_type ON collaboration_requests(type);',

        // College domains indexes
        'CREATE INDEX IF NOT EXISTS idx_college_domains_domain ON college_domains(domain);',
        'CREATE INDEX IF NOT EXISTS idx_college_domains_verified ON college_domains(is_verified);',
        'CREATE INDEX IF NOT EXISTS idx_college_domains_admin ON college_domains(admin_id);'
      ];

      for (const indexQuery of indexes) {
        try {
          await client.query(indexQuery);
        } catch (error: any) {
          // Ignore if index already exists
          if (!error.message.includes('already exists')) {
            console.warn(`⚠️ Index warning: ${error.message}`);
          }
        }
      }
      
      console.log('✅ All performance indexes created successfully');
      
    } finally {
      client.release();
    }
  }
}

/**
 * Main function to run complete automated database creation
 */
export async function runCompleteAutoDatabaseCreation(pool: Pool): Promise<void> {
  const creator = new AutoDatabaseCreator(pool);
  await creator.createAllComponents();
}