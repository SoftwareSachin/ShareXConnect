# ShareXConnect - Local Development Setup

This guide helps you set up ShareXConnect on your local machine with a robust PostgreSQL database that can handle unlimited users.

## Prerequisites

### 1. PostgreSQL Installation

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use chocolatey
choco install postgresql
```

**Mac:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Node.js
- Install Node.js 18+ from https://nodejs.org/

## Quick Setup

### 1. Clone and Install Dependencies
```bash
git clone <your-repo>
cd sharexconnect
npm install
```

### 2. Database Setup
```bash
# Create PostgreSQL database and user
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
CREATE DATABASE sharexconnect;
CREATE USER sharex_user WITH PASSWORD 'secure_password_123';
GRANT ALL PRIVILEGES ON DATABASE sharexconnect TO sharex_user;
\q
```

### 3. Environment Configuration
Create `.env` file in project root:
```bash
# PostgreSQL Database Configuration
DATABASE_URL=postgresql://sharex_user:secure_password_123@localhost:5432/sharexconnect
PGHOST=localhost
PGPORT=5432
PGUSER=sharex_user
PGPASSWORD=secure_password_123
PGDATABASE=sharexconnect

# JWT Secret (change this!)
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters-long

# Application Configuration
NODE_ENV=development
PORT=5000
```

### 4. Initialize Database Schema
```bash
npm run db:push
```

### 5. Start Development Server
```bash
npm run dev
```

## Database Features

### Robust Connection Pool
- **Maximum Connections**: 20 concurrent users
- **Minimum Connections**: 2 always maintained
- **Connection Timeout**: 10 seconds
- **Idle Timeout**: 30 seconds
- **Acquire Timeout**: 60 seconds

### Enhanced Security
- **Password Hashing**: bcrypt with 12 salt rounds
- **Transaction Support**: Atomic user creation
- **Error Handling**: Detailed PostgreSQL error messages
- **Connection Monitoring**: Real-time connection status

### Production-Ready Features
- **Graceful Shutdown**: Proper connection cleanup
- **Error Recovery**: Automatic reconnection handling
- **Performance Monitoring**: Connection pool metrics
- **SSL Support**: Configurable for production environments

## Default User Accounts

The application creates default accounts for testing:

**Admin Account:**
- Email: `admin@sharex.edu`
- Password: `AdminPassword123!`
- Role: Administrator

**Faculty Account:**
- Email: `faculty@sharex.edu`
- Password: `FacultyPassword123!`
- Role: Faculty

## Scaling for Production

### Database Optimization
```sql
-- Recommended PostgreSQL settings for production
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

### Environment Variables for Production
```bash
# Production Database (example)
DATABASE_URL=postgresql://username:password@your-db-host:5432/sharexconnect

# Strong JWT Secret
JWT_SECRET=generate-a-super-secure-random-string-for-production

# Production Mode
NODE_ENV=production
PORT=5000
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U sharex_user -d sharexconnect
```

### Port Conflicts
```bash
# Check what's using port 5000
lsof -i :5000

# Use different port
PORT=3000 npm run dev
```

### Permission Issues
```bash
# Fix PostgreSQL permissions
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE sharexconnect TO sharex_user;
```

## Performance Testing

Test the system with multiple concurrent users:

```bash
# Install artillery for load testing
npm install -g artillery

# Test registration endpoint
artillery quick --count 10 --num 5 http://localhost:5000/api/auth/register
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the application logs in console
3. Verify PostgreSQL is running and accessible
4. Ensure all environment variables are set correctly

The application is designed to handle unlimited user registrations and logins with proper database connection pooling and error handling.