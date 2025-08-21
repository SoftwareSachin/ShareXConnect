# ShareXConnect - Academic Project Platform

## Project Overview
ShareXConnect is a comprehensive academic platform designed for educational institutions to showcase, collaborate on, and review student and faculty projects. Built with modern web technologies for security, scalability, and ease of use.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy + JWT
- **File Storage**: Project file upload system with archive support
- **Deployment**: Configured for Replit environment

## Database Schema
The application uses PostgreSQL with the following core tables:
- `users` - User authentication and profiles (students, faculty, admins)
- `college_domains` - Verified educational institution domains
- `projects` - Core project information with academic fields
- `project_files` - File uploads, documentation, and archives
- `project_collaborators` - Project team members
- `project_comments` - Project discussions and feedback  
- `project_stars` - Project favorites/bookmarks
- `project_reviews` - Faculty grading and feedback system

## Recent Changes
### Migration to Replit Environment (August 21, 2025)
- ✅ Created PostgreSQL database with all required environment variables
- ✅ Auto-created all database tables with proper relationships
- ✅ Set up database migrations and indexing for performance
- ✅ Seeded development data (sample college domains)
- ✅ Added missing `project_files` table for file upload system
- ✅ Verified application startup and database connectivity

### Fixed Project Form Field Mappings (August 21, 2025)
- ✅ Fixed Department field mapping from `repositoryStructure` to `department`
- ✅ Fixed Course/Subject field mapping from `readmeContent` to `courseSubject`
- ✅ Fixed Project Methodology field mapping from `contributingGuidelines` to `projectMethodology`  
- ✅ Added missing fields to TypeScript form schema
- ✅ Confirmed project detail view displays these academic fields correctly

### Fixed Database Schema Mismatch (August 21, 2025)
- ✅ Added missing `academic_level` column to projects table
- ✅ Added missing `department` column to projects table  
- ✅ Added missing `course_subject` column to projects table
- ✅ Added missing `project_methodology` column to projects table
- ✅ Added missing `setup_instructions` column to projects table
- ✅ Added other missing academic columns (repository_url, live_demo_url, etc.)
- ✅ Resolved internal server error during project creation

## User Preferences
- Language: English
- Communication: Clear, professional, technical when needed
- Focus: Academic platform features and security best practices

## Development Setup
1. Database: PostgreSQL automatically configured via Replit
2. Environment: All required secrets available in environment
3. Commands:
   - `npm run dev` - Start development server
   - `npm run db:push` - Push schema changes to database
   - `npm run build` - Production build

## Key Features
- Institution-verified user registration
- Project showcase with GitHub integration
- Faculty review and grading system
- File upload and archive management
- Role-based access control (Student/Faculty/Admin)
- Project collaboration tools
- Academic-specific metadata tracking

## Security Features
- Password hashing with bcrypt
- JWT-based session management
- SQL injection prevention via Drizzle ORM
- Role-based authorization middleware
- Input validation with Zod schemas
- Environment variable protection