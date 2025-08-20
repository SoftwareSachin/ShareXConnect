# ShareXConnect - Local Development Setup

This guide helps you set up ShareXConnect for robust local development with PostgreSQL.

## Prerequisites

### Required Software
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **PostgreSQL 14+** - [Download from postgresql.org](https://www.postgresql.org/download/)
- **Git** - [Download from git-scm.com](https://git-scm.com/)

### Optional but Recommended
- **pgAdmin** - GUI for PostgreSQL management
- **VS Code** - IDE with PostgreSQL extensions

## Quick Start (5 minutes)

### 1. Clone and Install
```bash
git clone <repository-url>
cd sharexconnect
npm install
```

### 2. Database Setup

#### Option A: Use Existing PostgreSQL Instance
If you have PostgreSQL running locally:
```bash
# Create database
createdb sharexconnect_dev

# Set environment variable
echo "DATABASE_URL=postgresql://username:password@localhost:5432/sharexconnect_dev" > .env
```

#### Option B: Docker PostgreSQL (Recommended)
```bash
# Start PostgreSQL with Docker
docker run --name sharexconnect-postgres \
  -e POSTGRES_DB=sharexconnect_dev \
  -e POSTGRES_USER=dev_user \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5432:5432 \
  -d postgres:15

# Set environment variable
echo "DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/sharexconnect_dev" > .env
```

### 3. Initialize and Run
```bash
# Push database schema
npm run db:push

# Start development server
npm run dev
```

Visit http://localhost:5000 - ShareXConnect is ready!

## Detailed Setup Guide

### Environment Configuration

Create `.env` file with these variables:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Secret (generate your own for security)
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters

# Environment
NODE_ENV=development

# Optional: Database Pool Settings
DB_POOL_MAX=15
DB_POOL_MIN=2
DB_POOL_TIMEOUT=30000
```

### Database Schema Management

#### Push Schema Changes
```bash
npm run db:push
```

#### Generate Migrations
```bash
npm run db:generate
```

#### Reset Database (Development Only)
```bash
npm run db:reset
```

### Development Features

#### Automatic Database Backups
- Backups created every 2 hours during development
- Stored in `./backups/` directory
- Auto-cleanup keeps last 5 backups

#### Database Health Monitoring
Visit `/health` endpoint to see:
- Connection pool status
- Performance metrics
- Database connectivity
- Query statistics

#### Sample Data
On first run, the system creates:
- Sample colleges (MIT, Stanford, Harvard)
- Admin user accounts
- Development data for testing

### Database Management Commands

#### Create Manual Backup
```bash
node -e "
const { backupManager } = require('./server/database/backup');
backupManager.createBackup('my-backup').then(path => 
  console.log('Backup created:', path)
);
"
```

#### List Backups
```bash
node -e "
const { backupManager } = require('./server/database/backup');
backupManager.listBackups().then(backups => 
  console.table(backups)
);
"
```

#### Restore Backup
```bash
node -e "
const { backupManager } = require('./server/database/backup');
backupManager.restoreBackup('backup-name').then(() => 
  console.log('Backup restored successfully')
);
"
```

### Performance Optimization

#### Database Indexes
The system automatically creates indexes for:
- User lookups (email, username, institution)
- Project queries (owner, visibility, status)
- Comments and collaborations
- Full-text search capabilities

#### Connection Pooling
Optimized settings for local development:
- **Maximum connections**: 15
- **Minimum connections**: 2
- **Idle timeout**: 30 seconds
- **Connection timeout**: 10 seconds

#### Query Performance
- Full-text search on project titles and descriptions
- Optimized joins for project details
- Efficient pagination and filtering

### Troubleshooting

#### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux
```

#### Port Conflicts
```bash
# Check what's using port 5000
lsof -i :5000

# Use different port
PORT=3000 npm run dev
```

#### Schema Issues
```bash
# Reset and rebuild schema
npm run db:reset
npm run db:push
```

#### Permission Errors
```bash
# Fix PostgreSQL permissions
sudo -u postgres createuser --superuser $USER
sudo -u postgres createdb $USER
```

### Development Workflow

#### 1. Daily Development
```bash
# Start development server
npm run dev

# In another terminal, watch database logs
tail -f logs/database.log
```

#### 2. Schema Changes
```bash
# Modify schema in shared/schema.ts
# Push changes to database
npm run db:push

# If conflicts arise, force push
npm run db:push --force
```

#### 3. Testing Role-Based Access
The system includes four user types:
- **Students**: Full project creation and collaboration
- **Faculty**: Review and grading capabilities
- **College Admin**: User management for their institution
- **Guest**: Read-only access to public projects

#### 4. Data Management
```bash
# Export development data
node -e "
const { backupManager } = require('./server/database/backup');
backupManager.exportDevelopmentData().then(path => 
  console.log('Data exported:', path)
);
"

# Import sample data
npm run seed:dev
```

### Production Considerations

#### Environment Variables
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:secure_password@prod_host:5432/prod_db
JWT_SECRET=very-long-random-string-for-production
```

#### Database Settings
- Increase connection pool size
- Enable SSL connections
- Set up read replicas if needed
- Configure backup schedules

#### Security
- Use strong JWT secrets
- Enable PostgreSQL SSL
- Implement rate limiting
- Set up monitoring and alerts

### Getting Help

#### Check System Status
```bash
curl http://localhost:5000/health | jq
```

#### Database Metrics
```bash
node -e "
const { databaseManager } = require('./server/database/connection');
databaseManager.getPerformanceMetrics().then(metrics => 
  console.table(metrics)
);
"
```

#### Common Issues
1. **Database connection refused**: Check PostgreSQL is running
2. **Schema errors**: Run `npm run db:push`
3. **Permission denied**: Check database user permissions
4. **Port in use**: Change PORT environment variable

## Support

For additional help:
- Check the application logs in the terminal
- Visit `/health` endpoint for system status
- Review PostgreSQL logs for database issues
- Use pgAdmin for database management

The system is designed to be robust and self-healing for local development. Most issues resolve automatically with proper PostgreSQL setup.