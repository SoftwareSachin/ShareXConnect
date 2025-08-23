# ShareXConnect Database Documentation

## Overview
This document provides a complete reference for all database components used in the ShareXConnect academic project platform.

## Database Statistics
- **Total Tables**: 13
- **Total Enums**: 9
- **Foreign Key Relationships**: 19
- **Unique Constraints**: 4
- **Performance Indexes**: 55

---

## Enums

### 1. role
**Values**: `STUDENT`, `FACULTY`, `ADMIN`, `GUEST`
**Usage**: User account types and permissions

### 2. visibility
**Values**: `PRIVATE`, `INSTITUTION`, `PUBLIC`
**Usage**: Project visibility levels

### 3. project_status
**Values**: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`
**Usage**: Project lifecycle states

### 4. review_status
**Values**: `PENDING`, `COMPLETED`
**Usage**: Faculty review process status

### 5. request_status
**Values**: `PENDING`, `APPROVED`, `REJECTED`
**Usage**: Collaboration request workflow

### 6. repo_item_type
**Values**: `FILE`, `FOLDER`
**Usage**: Repository structure items

### 7. change_type
**Values**: `ADD`, `MODIFY`, `DELETE`, `SUGGEST`
**Usage**: Types of changes in collaborative editing

### 8. change_status
**Values**: `OPEN`, `APPROVED`, `REJECTED`, `MERGED`
**Usage**: Change request workflow states

### 9. audit_action
**Values**: `CREATE`, `UPDATE`, `DELETE`, `VIEW`, `LOGIN`, `LOGOUT`, `UPLOAD`, `DOWNLOAD`, `COLLABORATE`, `REVIEW`, `COMMENT`
**Usage**: System activity tracking

---

## Tables

### 1. users (14 columns)
**Purpose**: User account management with roles and verification

| Column | Type | Length | Nullable | Default | Description |
|--------|------|--------|----------|---------|-------------|
| id | uuid | - | NO | gen_random_uuid() | Primary key |
| username | varchar | 30 | NO | - | Unique username |
| email | varchar | 320 | NO | - | Unique email address |
| password | varchar | 255 | NO | - | Hashed password |
| first_name | varchar | 50 | NO | - | User's first name |
| last_name | varchar | 50 | NO | - | User's last name |
| role | role enum | - | NO | - | User role (STUDENT/FACULTY/ADMIN/GUEST) |
| institution | varchar | 100 | NO | - | Educational institution |
| college_domain | varchar | 100 | YES | - | Institution domain for verification |
| is_verified | boolean | - | NO | false | Account verification status |
| created_at | timestamp | - | NO | now() | Account creation time |
| updated_at | timestamp | - | NO | now() | Last update time |
| department | varchar | 100 | YES | - | Faculty department |
| tech_expertise | text | - | YES | - | Faculty technical expertise |

### 2. projects (32 columns)
**Purpose**: Core project data with academic and collaboration features

| Column | Type | Length | Nullable | Default | Description |
|--------|------|--------|----------|---------|-------------|
| id | uuid | - | NO | gen_random_uuid() | Primary key |
| title | varchar | 200 | NO | - | Project title |
| description | text | - | NO | - | Project description |
| category | varchar | 100 | NO | - | Project category |
| visibility | visibility enum | - | NO | - | Project visibility level |
| status | project_status enum | - | NO | - | Project status |
| tech_stack | text[] | - | YES | {} | Technology stack array |
| github_url | varchar | 500 | YES | - | GitHub repository URL |
| demo_url | varchar | 500 | YES | - | Live demo URL |
| repository_structure | text | - | YES | - | Repository structure description |
| readme_content | text | - | YES | - | README file content |
| license_type | varchar | 50 | YES | MIT | Project license |
| contributing_guidelines | text | - | YES | - | Contribution guidelines |
| installation_instructions | text | - | YES | - | Setup instructions |
| api_documentation | text | - | YES | - | API documentation |
| owner_id | uuid | - | NO | - | Foreign key to users |
| created_at | timestamp | - | NO | now() | Creation time |
| updated_at | timestamp | - | NO | now() | Last update time |
| search_vector | tsvector | - | YES | - | Full-text search index |
| academic_level | varchar | 100 | YES | - | Academic level (Undergraduate, Graduate, etc.) |
| department | varchar | 100 | YES | - | Academic department |
| course_subject | varchar | 150 | YES | - | Course subject |
| project_methodology | text | - | YES | - | Research methodology |
| setup_instructions | text | - | YES | - | Project setup guide |
| repository_url | varchar | 500 | YES | - | Repository URL |
| live_demo_url | varchar | 500 | YES | - | Live demo URL |
| source_code_repository | text | - | YES | - | Source code repository info |
| documentation_reports | text | - | YES | - | Documentation and reports |
| images_assets | text | - | YES | - | Image assets (JSON array) |
| star_count | integer | - | NO | 0 | Number of stars |
| allows_collaboration | boolean | - | NO | true | Collaboration enabled |
| requires_approval_for_collaboration | boolean | - | NO | true | Approval required for collaboration |

### 3. college_domains (7 columns)
**Purpose**: Institution verification system

| Column | Type | Length | Nullable | Default | Description |
|--------|------|--------|----------|---------|-------------|
| id | uuid | - | NO | gen_random_uuid() | Primary key |
| college_name | varchar | 200 | NO | - | Institution name |
| domain | varchar | 100 | NO | - | Email domain (e.g., @mit.edu) |
| admin_id | uuid | - | YES | - | Domain administrator |
| is_verified | boolean | - | NO | false | Verification status |
| created_at | timestamp | - | NO | now() | Creation time |
| updated_at | timestamp | - | NO | now() | Last update time |

### 4. project_collaborators (4 columns)
**Purpose**: Track project collaboration relationships

| Column | Type | Length | Nullable | Default | Description |
|--------|------|--------|----------|---------|-------------|
| id | uuid | - | NO | gen_random_uuid() | Primary key |
| project_id | uuid | - | NO | - | Foreign key to projects |
| user_id | uuid | - | NO | - | Foreign key to users |
| created_at | timestamp | - | NO | now() | Collaboration start time |

### 5. project_comments (6 columns)
**Purpose**: Project discussion and feedback system

| Column | Type | Length | Nullable | Default | Description |
|--------|------|--------|----------|---------|-------------|
| id | uuid | - | NO | gen_random_uuid() | Primary key |
| content | text | - | NO | - | Comment content |
| project_id | uuid | - | NO | - | Foreign key to projects |
| author_id | uuid | - | NO | - | Foreign key to users |
| created_at | timestamp | - | NO | now() | Creation time |
| updated_at | timestamp | - | NO | now() | Last update time |

### 6. project_stars (4 columns)
**Purpose**: Project favoriting system

| Column | Type | Length | Nullable | Default | Description |
|--------|------|--------|----------|---------|-------------|
| id | uuid | - | NO | gen_random_uuid() | Primary key |
| project_id | uuid | - | NO | - | Foreign key to projects |
| user_id | uuid | - | NO | - | Foreign key to users |
| created_at | timestamp | - | NO | now() | Star time |

### 7. project_reviews (8 columns)
**Purpose**: Faculty review and grading system

| Column | Type | Length | Nullable | Default | Description |
|--------|------|--------|----------|---------|-------------|
| id | uuid | - | NO | gen_random_uuid() | Primary key |
| project_id | uuid | - | NO | - | Foreign key to projects |
| reviewer_id | uuid | - | NO | - | Foreign key to users (faculty) |
| grade | integer | - | YES | - | Numeric grade |
| feedback | text | - | YES | - | Review feedback |
| status | review_status enum | - | NO | - | Review status |
| created_at | timestamp | - | NO | now() | Review creation time |
| updated_at | timestamp | - | NO | now() | Last update time |

### 8. project_files (10 columns)
**Purpose**: File upload and management system

| Column | Type | Length | Nullable | Default | Description |
|--------|------|--------|----------|---------|-------------|
| id | uuid | - | NO | gen_random_uuid() | Primary key |
| project_id | uuid | - | NO | - | Foreign key to projects |
| file_name | varchar | 255 | NO | - | Original file name |
| file_path | varchar | 500 | NO | - | Storage file path |
| file_type | varchar | 50 | NO | - | File type/extension |
| file_size | integer | - | NO | - | File size in bytes |
| content | text | - | YES | - | Text file content |
| is_archive | boolean | - | YES | false | Is compressed archive |
| archive_contents | text | - | YES | - | Archive contents listing |
| uploaded_at | timestamp | - | NO | now() | Upload time |

### 9. collaboration_requests (7 columns)
**Purpose**: GitHub-style collaboration workflow

| Column | Type | Length | Nullable | Default | Description |
|--------|------|--------|----------|---------|-------------|
| id | uuid | - | NO | gen_random_uuid() | Primary key |
| project_id | uuid | - | NO | - | Foreign key to projects |
| requester_id | uuid | - | NO | - | Foreign key to users |
| message | text | - | YES | - | Request message |
| status | request_status enum | - | NO | PENDING | Request status |
| created_at | timestamp | - | NO | now() | Request time |
| responded_at | timestamp | - | YES | - | Response time |

### 10. project_repository (12 columns)
**Purpose**: Repository file structure and version control

| Column | Type | Length | Nullable | Default | Description |
|--------|------|--------|----------|---------|-------------|
| id | uuid | - | NO | gen_random_uuid() | Primary key |
| project_id | uuid | - | NO | - | Foreign key to projects |
| path | varchar | 500 | NO | - | File/folder path |
| name | varchar | 255 | NO | - | File/folder name |
| type | repo_item_type enum | - | NO | - | FILE or FOLDER |
| content | text | - | YES | - | File content |
| parent_id | uuid | - | YES | - | Parent folder ID |
| size | integer | - | YES | 0 | File size in bytes |
| language | varchar | 50 | YES | - | Programming language |
| last_modified_by | uuid | - | NO | - | Foreign key to users |
| created_at | timestamp | - | NO | now() | Creation time |
| updated_at | timestamp | - | NO | now() | Last modification time |

### 11. project_change_requests (12 columns)
**Purpose**: Change management and collaborative editing

| Column | Type | Length | Nullable | Default | Description |
|--------|------|--------|----------|---------|-------------|
| id | uuid | - | NO | gen_random_uuid() | Primary key |
| project_id | uuid | - | NO | - | Foreign key to projects |
| requester_id | uuid | - | NO | - | Foreign key to users |
| title | varchar | 200 | NO | - | Change request title |
| description | text | - | NO | - | Change description |
| file_id | uuid | - | YES | - | Foreign key to project_repository |
| change_type | change_type enum | - | NO | - | Type of change |
| proposed_changes | text | - | YES | - | Proposed changes content |
| status | change_status enum | - | NO | OPEN | Change status |
| reviewed_by | uuid | - | YES | - | Foreign key to users (reviewer) |
| created_at | timestamp | - | NO | now() | Request creation time |
| updated_at | timestamp | - | NO | now() | Last update time |

### 12. audit_logs (9 columns)
**Purpose**: System activity and security tracking

| Column | Type | Length | Nullable | Default | Description |
|--------|------|--------|----------|---------|-------------|
| id | uuid | - | NO | gen_random_uuid() | Primary key |
| user_id | uuid | - | YES | - | Foreign key to users |
| action | audit_action enum | - | NO | - | Action performed |
| resource | varchar | 100 | NO | - | Resource affected |
| resource_id | uuid | - | YES | - | Resource ID |
| details | text | - | YES | - | Additional details |
| ip_address | varchar | 45 | YES | - | User IP address |
| user_agent | varchar | 500 | YES | - | Browser user agent |
| created_at | timestamp | - | NO | now() | Action time |

### 13. migrations (3 columns)
**Purpose**: Database version control and migration tracking

| Column | Type | Length | Nullable | Default | Description |
|--------|------|--------|----------|---------|-------------|
| id | varchar | 255 | NO | - | Migration ID |
| name | varchar | 255 | NO | - | Migration name |
| executed_at | timestamp | - | YES | CURRENT_TIMESTAMP | Execution time |

---

## Foreign Key Relationships

### Users as Primary Entity
- `projects.owner_id` → `users.id`
- `project_collaborators.user_id` → `users.id`
- `project_comments.author_id` → `users.id`
- `project_stars.user_id` → `users.id`
- `project_reviews.reviewer_id` → `users.id`
- `collaboration_requests.requester_id` → `users.id`
- `project_repository.last_modified_by` → `users.id`
- `project_change_requests.requester_id` → `users.id`
- `project_change_requests.reviewed_by` → `users.id`
- `audit_logs.user_id` → `users.id`

### Projects as Central Hub
- `project_collaborators.project_id` → `projects.id`
- `project_comments.project_id` → `projects.id`
- `project_stars.project_id` → `projects.id`
- `project_reviews.project_id` → `projects.id`
- `project_files.project_id` → `projects.id`
- `collaboration_requests.project_id` → `projects.id`
- `project_repository.project_id` → `projects.id`
- `project_change_requests.project_id` → `projects.id`

### Self-Referencing
- `project_repository.parent_id` → `project_repository.id`

### Cross-Table References
- `project_change_requests.file_id` → `project_repository.id`

---

## Unique Constraints

1. **college_domains.domain** - Ensures unique institution domains
2. **users.email** - Prevents duplicate email addresses
3. **users.username** - Ensures unique usernames
4. **project_stars(project_id, user_id)** - Prevents duplicate stars from same user

---

## Performance Indexes

### Users Table (6 indexes)
- `idx_users_email` - Email lookups
- `idx_users_username` - Username searches
- `idx_users_institution` - Institution filtering
- `idx_users_role` - Role-based queries
- `idx_users_verified` - Verification status
- `idx_users_college_domain` - Domain-based filtering

### Projects Table (6 indexes)
- `idx_projects_owner` - Owner-based queries
- `idx_projects_visibility` - Visibility filtering
- `idx_projects_status` - Status-based searches
- `idx_projects_created` - Time-based sorting
- `idx_projects_category` - Category filtering
- `idx_projects_search` - Full-text search (GIN index)

### Project Relationships (8 indexes)
- `idx_project_collaborators_project` - Project collaborator lookups
- `idx_project_collaborators_user` - User collaboration history
- `idx_project_stars_project` - Project star counts
- `idx_project_stars_user` - User starred projects
- `idx_comments_project` - Project comments
- `idx_comments_author` - User comment history
- `idx_comments_created` - Comment chronology
- `idx_reviews_project` - Project reviews
- `idx_reviews_reviewer` - Reviewer activity
- `idx_reviews_status` - Review status filtering

### Repository Management (3 indexes)
- `idx_project_repository_project` - Project file listings
- `idx_project_repository_parent` - Folder structure navigation
- `idx_project_repository_path` - Path-based file lookups

### Collaboration Workflow (6 indexes)
- `idx_collaboration_requests_project` - Project collaboration requests
- `idx_collaboration_requests_requester` - User request history
- `idx_collaboration_requests_status` - Request status filtering
- `idx_project_change_requests_project` - Project change requests
- `idx_project_change_requests_requester` - User change history
- `idx_project_change_requests_status` - Change status filtering

### File Management (2 indexes)
- `idx_project_files_project` - Project file listings
- `idx_project_files_type` - File type filtering

### Audit and Security (4 indexes)
- `idx_audit_logs_user` - User activity tracking
- `idx_audit_logs_action` - Action-based filtering
- `idx_audit_logs_resource` - Resource-based queries
- `idx_audit_logs_created` - Time-based audit trails

### Institution Management (1 index)
- `idx_college_domains_verified` - Verified domain filtering

---

## Sample Data

### College Domains (3 records)
- Massachusetts Institute of Technology (@mit.edu) - Verified
- Stanford University (@stanford.edu) - Verified  
- Harvard University (@harvard.edu) - Verified

---

## Database Connection Settings

### Development Environment
- **Max Connections**: 15
- **Min Connections**: 2
- **Idle Timeout**: 30 seconds
- **Connection Timeout**: 10 seconds
- **Statement Timeout**: 60 seconds
- **Query Timeout**: 30 seconds

### Production Environment  
- **Max Connections**: 25
- **Min Connections**: 5
- **SSL**: Enabled with reject unauthorized: false
- **Keep Alive**: Enabled

---

## Common Queries

### User Management
```sql
-- Find user by email or username
SELECT * FROM users WHERE email = $1 OR username = $1;

-- Get user with role verification
SELECT * FROM users WHERE id = $1 AND role = $2;
```

### Project Operations
```sql
-- Get projects with owner info
SELECT p.*, u.username, u.first_name, u.last_name 
FROM projects p 
JOIN users u ON p.owner_id = u.id 
WHERE p.visibility = 'PUBLIC';

-- Project with stats
SELECT p.*, 
       COUNT(DISTINCT pc.user_id) as collaborator_count,
       COUNT(DISTINCT ps.user_id) as star_count,
       COUNT(DISTINCT cm.id) as comment_count
FROM projects p
LEFT JOIN project_collaborators pc ON p.id = pc.project_id
LEFT JOIN project_stars ps ON p.id = ps.project_id  
LEFT JOIN project_comments cm ON p.id = cm.project_id
WHERE p.id = $1
GROUP BY p.id;
```

### Collaboration Queries
```sql
-- User's starred projects
SELECT p.* FROM projects p
JOIN project_stars ps ON p.id = ps.project_id
WHERE ps.user_id = $1;

-- Pending collaboration requests
SELECT cr.*, p.title, u.username
FROM collaboration_requests cr
JOIN projects p ON cr.project_id = p.id
JOIN users u ON cr.requester_id = u.id
WHERE cr.status = 'PENDING';
```

### Search Operations
```sql
-- Full-text search on projects
SELECT * FROM projects 
WHERE search_vector @@ plainto_tsquery('english', $1);

-- Filter by institution
SELECT p.* FROM projects p
JOIN users u ON p.owner_id = u.id
WHERE u.institution = $1 AND p.visibility != 'PRIVATE';
```

---

This documentation covers all database components used in the ShareXConnect academic project platform. The system supports user management, project collaboration, file management, academic workflows, and comprehensive audit trails.