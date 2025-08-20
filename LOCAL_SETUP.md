# ShareXConnect - Local Development Setup Guide

This guide will help you set up ShareXConnect on your local machine with a robust PostgreSQL database.

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn** package manager

## Quick Setup (Automated)

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd sharexconnect
   npm install
   ```

2. **Run automated setup**
   ```bash
   node scripts/local-setup.js
   ```
   
   This will:
   - Create `.env` file from template
   - Prompt for PostgreSQL credentials
   - Generate secure JWT secret
   - Create database tables
   - Set up default admin and faculty accounts

3. **Start the application**
   ```bash
   npm run dev
   ```

## Manual Setup (Step by Step)

### 1. Environment Configuration

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/sharexconnect"
JWT_SECRET="your-super-secure-jwt-secret-key"
NODE_ENV="development"
PORT=5000
```

### 2. PostgreSQL Database Setup

**Option A: Create database manually**
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE sharexconnect;
CREATE USER sharex_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sharexconnect TO sharex_user;
\q
```

**Option B: Using createdb command**
```bash
createdb sharexconnect
```

### 3. Database Schema Setup

```bash
# Create tables and schema
npm run db:push

# If you need to reset/force update
npm run db:push -- --force
```

### 4. Start Development Server

```bash
npm run dev
```

The application will:
- Connect to your PostgreSQL database
- Create default admin and faculty accounts
- Start the server on http://localhost:5000

## Default Accounts

After first startup, these accounts will be created:

**Admin Account:**
- Email: `admin@sharex.edu`
- Username: `admin`
- Password: `AdminPassword123!`

**Faculty Account:**
- Email: `faculty@sharex.edu`
- Username: `professor`
- Password: `FacultyPassword123!`

## Useful Commands

```bash
# Development server
npm run dev

# Database operations
npm run db:push                 # Apply schema changes
npm run db:push -- --force      # Force apply schema changes
npm run db:studio               # Open Drizzle Studio (database GUI)

# Database utilities
node setup-database.js          # Initialize database with setup checks
node scripts/local-setup.js     # Full interactive setup

# Health check
curl http://localhost:5000/health
```

## Troubleshooting

### Database Connection Issues

**Error: "DATABASE_URL must be set"**
- Check that `.env` file exists and contains DATABASE_URL
- Verify PostgreSQL credentials are correct

**Error: "database does not exist"**
```bash
# Create the database
createdb sharexconnect
# or
sudo -u postgres createdb sharexconnect
```

**Error: "password authentication failed"**
- Check PostgreSQL user permissions
- Update DATABASE_URL with correct username/password
- Reset PostgreSQL user password if needed

**Error: "connection refused"**
```bash
# Start PostgreSQL service
sudo service postgresql start
# or on macOS with Homebrew:
brew services start postgresql
```

### Application Issues

**Error: "JWT_SECRET not found"**
- Generate a secure JWT secret and add to `.env`
- Use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

**Error: "Port already in use"**
- Change PORT in `.env` file
- Or kill process using the port: `lsof -ti:5000 | xargs kill`

**TypeScript compilation errors**
```bash
# Check for type errors
npm run check
```

## Production Deployment

### Environment Variables (Required)
```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
NODE_ENV="production"
PORT=5000
```

### Build and Deploy
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Database Schema

The application uses these main tables:
- `users` - User accounts (students, faculty, admin)
- `projects` - Academic projects
- `project_stars` - Project bookmarks/favorites
- `comments` - Project comments
- `collaborators` - Project collaboration relationships
- `assignments` - Faculty project assignments

## Features by User Role

### Students
- Create and manage academic projects
- Collaborate with other students
- Comment on projects
- Star/bookmark interesting projects

### Faculty
- Review assigned student projects
- Provide grades and feedback
- Access institution-wide projects
- Manage project assignments

### Admin
- Full access to all institution projects
- User management capabilities
- System administration features

## API Testing

Test the authentication system:

```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@university.edu",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "STUDENT",
    "institution": "Test University"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "SecurePass123!"
  }'

# Use token for authenticated requests
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure PostgreSQL is running and accessible
4. Check the application logs for detailed error messages
5. Run the health check: `curl http://localhost:5000/health`