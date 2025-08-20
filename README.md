# ShareXConnect - Academic Project Management Platform

ShareXConnect is a comprehensive academic project management platform designed for educational institutions. Students can create and manage academic projects with various visibility settings, while faculty members can review, grade, and provide feedback.

## Features

- **Student Portal**: Create, manage, and collaborate on academic projects
- **Faculty Dashboard**: Review and grade student projects
- **Project Collaboration**: Add collaborators and manage project visibility
- **Secure Authentication**: JWT-based authentication with password hashing
- **Real-time Features**: Comments, stars, and project tracking
- **Role-based Access**: Different permissions for students, faculty, and admins

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sharexconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env file with your database credentials
   # Update DATABASE_URL with your PostgreSQL connection string
   
   # Run automated database setup
   node setup-database.js
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5000
   ```

## Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/sharexconnect"
JWT_SECRET="your-super-secure-jwt-secret-key"
NODE_ENV="development"
PORT=5000
```

## Database Setup

The application uses PostgreSQL with Drizzle ORM. Run these commands to set up your database:

```bash
# Create database tables
npm run db:push

# Reset database (if needed)
npm run db:push -- --force
```

## User Roles

- **STUDENT**: Can create and manage their own projects, collaborate with others
- **FACULTY**: Can review and grade assigned projects, access faculty dashboard
- **ADMIN**: Full access to institution-wide projects and user management

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Projects
- `GET /api/projects` - List projects (with filters)
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Collaboration
- `POST /api/projects/:id/star` - Star/bookmark project
- `POST /api/projects/:id/comments` - Add comment
- `POST /api/projects/:id/collaborators` - Add collaborator

## Development

### Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express.js backend
│   ├── db.ts             # Database configuration
│   ├── routes.ts         # API route handlers
│   └── storage.ts        # Database operations
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and validation
└── uploads/              # File upload directory
```

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- React Query for data fetching
- Zustand for state management

**Backend:**
- Node.js with Express.js
- TypeScript for type safety
- Drizzle ORM with PostgreSQL
- JWT authentication
- bcryptjs for password hashing

## Troubleshooting

### Database Connection Issues

1. **PostgreSQL not running**
   ```bash
   # Start PostgreSQL service
   sudo service postgresql start
   # or
   brew services start postgresql
   ```

2. **Database doesn't exist**
   ```bash
   # Create database manually
   createdb sharexconnect
   ```

3. **Permission errors**
   ```bash
   # Create user and grant permissions
   sudo -u postgres createuser --interactive
   sudo -u postgres createdb sharexconnect
   ```

### Common Errors

- **"JWT_SECRET not found"**: Make sure `.env` file exists with JWT_SECRET
- **"Database URL not set"**: Update DATABASE_URL in `.env` file
- **"Port already in use"**: Change PORT in `.env` or stop other services on port 5000

## Production Deployment

1. **Environment variables**
   - Set strong JWT_SECRET
   - Configure production DATABASE_URL
   - Set NODE_ENV=production

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Run in production**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure no TypeScript errors
5. Submit a pull request

## License

This project is licensed under the MIT License.