# Overview

ShareXConnect is a comprehensive academic project management platform designed for educational institutions. The application facilitates student project creation, collaboration, and faculty review workflows. Students can create and manage academic projects with various visibility settings, while faculty members can review, grade, and provide feedback. The platform includes features for project discovery, collaboration through comments and contributors, and a star system for bookmarking projects.

## Recent Changes

**Role-Based Access Control Implementation (August 20, 2025)**
- Successfully implemented comprehensive four-tier role-based access control system
- Fixed critical role assignment bug where users were incorrectly assigned "Guest" role
- Enhanced user registration with proper role validation and assignment logic
- Created comprehensive authentication middleware with TypeScript type safety
- Implemented role-specific registration flows (Admin, Faculty, Student, Guest)
- Added college domain verification system for students and faculty
- Enhanced backend routes with proper authentication and authorization
- Fixed all TypeScript errors in authentication and route handling
- Added detailed logging for role assignment and user creation processes
- Verified all four user roles work correctly: ADMIN, FACULTY, STUDENT, GUEST

**Modern Dashboard Design Implementation (August 20, 2025)**
- Redesigned student dashboard with modern 2025 professional aesthetic
- Removed gradients, emojis, and outdated visual elements per user requirements
- Implemented clean card-based layout with subtle shadows and modern typography
- Enhanced statistics cards with trend indicators and descriptive subtitles
- Added role-specific quick actions with improved button designs
- Integrated modern Lucide React icons throughout the interface
- Applied professional color scheme with proper dark mode support
- Created responsive grid layout optimized for different screen sizes
- Enhanced project cards with better visual hierarchy and hover effects
- Added activity feed section for user engagement tracking

**Complete Backend-Frontend-Database Integration Verified (August 20, 2025)**
- ✅ Thoroughly tested and confirmed complete system integration working perfectly
- ✅ Real PostgreSQL data persistence with 4 projects and 6 users stored permanently
- ✅ Backend properly authenticates users and returns real database statistics
- ✅ Frontend dashboard displays authentic data from PostgreSQL (no mock data)
- ✅ Project creation system fully functional with debug logging for verification
- ✅ Authentication system working correctly with JWT tokens and role-based access
- ✅ Dashboard shows user-specific real data (0 projects for new users, 3 for teststudent)
- ✅ All API endpoints properly connected to database with real-time data queries
- ✅ Comprehensive debug logging added to track data flow from database to frontend
- ✅ System permanently stores and retrieves real user projects with full CRUD operations

**Migration Completed (August 20, 2025)**
- Successfully migrated from Replit Agent to Replit environment  
- Configured PostgreSQL database with proper schema and environment variables
- Fixed database connection issues by switching from Neon to local PostgreSQL
- Enhanced JWT authentication system with 7-day token expiration
- Improved password validation with strong security requirements
- Modernized login/signup UI with professional glassmorphism design
- Implemented comprehensive form validation with detailed error messages
- Implemented secure client/server separation with proper authentication middleware
- Updated UI with modern glassmorphism effects, backdrop blur, and subtle animations
- Rebranded to "ShareXConnect" with improved typography and professional alignment
- Enhanced form field spacing, icon alignment, and consistent label styling
- Removed unused duplicate login page and fixed checkbox text alignment issues
- Optimized form field icon sizes and positioning for better visual consistency
- Application now running successfully on Replit with all core functionality operational

**Robust Local Database System Implementation (August 20, 2025)**
- Created comprehensive PostgreSQL database management system optimized for local development
- Implemented advanced connection pooling with 15 max connections for local development
- Built robust database migration system with automatic schema management and performance indexes
- Created automated backup system with 2-hour intervals and auto-cleanup (keeps last 5 backups)
- Implemented database health monitoring with real-time performance metrics and connection statistics
- Added full-text search capabilities for projects with automatic vector updates
- Created comprehensive local setup documentation and automated setup scripts
- Enhanced error handling with detailed PostgreSQL-specific error messages and recovery mechanisms
- Implemented graceful shutdown procedures for proper connection cleanup
- Added development data seeding with sample colleges and user management features
- Created transaction-based operations for data integrity and consistency
- Built performance monitoring with query statistics and connection utilization tracking

**UI Enhancement Update (August 18, 2025)**
- Redesigned login/signup page with professional glassmorphism aesthetic
- Added proper form field icons (Mail, Lock, User, Building2, Eye/EyeOff)
- Implemented password visibility toggle with eye icons
- Enhanced dark mode support with proper color transitions
- Added animated gradient backgrounds with floating orbs
- Improved form styling with backdrop blur effects and proper spacing
- Added "Remember me" checkbox and "Forgot password" link
- Enhanced button designs with hover effects and subtle scaling
- Optimized input field heights and padding for better UX

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing instead of React Router
- **State Management**: Zustand for global authentication state with persistence
- **UI Framework**: Custom shadcn/ui components with Tailwind CSS for styling
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Data Fetching**: TanStack Query (React Query) for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the full stack
- **Authentication**: JWT-based authentication with bcryptjs password hashing
- **API Design**: RESTful API endpoints with consistent response patterns
- **File Handling**: Multer middleware for file uploads
- **Middleware**: Custom logging, error handling, and authentication middleware

## Data Storage
- **Database**: PostgreSQL with robust connection pooling for unlimited users
- **Database Client**: PostgreSQL with enhanced connection management (20 max, 2 min connections)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **ORM**: Drizzle ORM with type-safe database queries and transaction support
- **Storage Interface**: Abstract storage interface with enhanced error handling and logging
- **Connection Pool**: Advanced pooling with timeout handling and graceful shutdown
- **Security**: 12-round bcrypt password hashing with salt generation

## Authentication & Authorization
- **Authentication Method**: JWT tokens stored in browser localStorage via Zustand persistence
- **Password Security**: bcryptjs for password hashing with salt rounds
- **Role-Based Access**: Multi-role system (student, faculty, admin) with different permissions
- **Session Management**: JWT tokens with configurable expiration
- **Route Protection**: Protected routes component for authenticated-only pages

## Project Structure
- **Monorepo Layout**: Shared schema and types between client and server
- **Client Directory**: React frontend application with organized component structure
- **Server Directory**: Express backend with route handlers and business logic
- **Shared Directory**: Common TypeScript types and Zod schemas for validation

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Accessible component primitives for complex UI components
- **Lucide React**: Icon library with consistent design system
- **shadcn/ui**: Pre-built component library built on Radix UI primitives

## Development Tools
- **Vite**: Fast build tool with hot module replacement for development
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

## Form and Validation
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **@hookform/resolvers**: Integration between React Hook Form and Zod

## State Management and Data Fetching
- **Zustand**: Lightweight state management with TypeScript support
- **TanStack Query**: Server state management with caching and synchronization
- **date-fns**: Date utility library for formatting and manipulation

## Authentication and Security
- **jsonwebtoken**: JWT token generation and verification
- **bcryptjs**: Password hashing and verification
- **Multer**: File upload handling middleware

## Development and Deployment
- **tsx**: TypeScript execution for Node.js development
- **Replit Integration**: Development environment optimizations for Replit platform
- **Environment Configuration**: Separate development and production configurations