import { 
  type User, 
  type InsertUser, 
  type Project, 
  type InsertProject, 
  type ProjectComment, 
  type InsertProjectComment, 
  type Comment,
  type InsertComment,
  type FacultyAssignment,
  type ProjectReview, 
  type ProjectCollaborator, 
  type ProjectStar,
  type ProjectFile,
  type InsertProjectFile,
  users,
  projects,
  projectCollaborators,
  projectStars,
  projectComments,
  projectReviews,
  projectFiles,
  collegeDomains
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { databaseManager, db } from "./database/connection";
import { eq, and, or, ilike, desc, count, sql } from "drizzle-orm";

// Extended types for frontend use
export type ProjectWithDetails = Project & {
  owner: User;
  collaborators: User[];
  starCount: number;
  commentCount: number;
  isStarred?: boolean;
  review?: ProjectReview;
};

export type DashboardStats = {
  totalProjects: number;
  inReview: number;
  approved: number;
  collaborators: number;
};

export type ActivityItem = {
  id: string;
  type: 'project_created' | 'project_updated' | 'comment_added' | 'collaboration_started' | 'review_completed';
  title: string;
  description: string;
  timestamp: Date;
  projectId?: string;
  userId: string;
};

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByInstitution(institution: string): Promise<User[]>;

  // Authentication
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;

  // Project operations
  getProject(id: string): Promise<Project | undefined>;
  getProjectWithDetails(id: string, userId?: string): Promise<ProjectWithDetails | undefined>;
  getProjects(filters?: { 
    ownerId?: string; 
    visibility?: string; 
    status?: string; 
    category?: string;
    search?: string;
    institution?: string;
  }): Promise<ProjectWithDetails[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Project collaboration
  addCollaborator(projectId: string, userId: string): Promise<void>;
  removeCollaborator(projectId: string, userId: string): Promise<void>;
  getProjectCollaborators(projectId: string): Promise<User[]>;

  // Star operations
  starProject(projectId: string, userId: string): Promise<void>;
  unstarProject(projectId: string, userId: string): Promise<void>;
  getStarredProjects(userId: string): Promise<ProjectWithDetails[]>;

  // Comment operations
  getComments(projectId: string, limit?: number, offset?: number): Promise<(ProjectComment & { author: User })[]>;
  createComment(comment: InsertProjectComment): Promise<ProjectComment>;

  // Faculty assignment operations
  assignProjectToReviewer(projectId: string, reviewerId: string): Promise<ProjectReview>;
  getProjectReviews(reviewerId: string): Promise<(ProjectReview & { project: ProjectWithDetails })[]>;
  submitReview(reviewId: string, grade: string, feedback: string): Promise<ProjectReview | undefined>;

  // Dashboard statistics
  getDashboardStats(userId: string, role: string): Promise<DashboardStats>;
  getRecentActivity(userId: string, role: string, limit: number): Promise<ActivityItem[]>;

  // College domain operations
  getCollegeDomains(): Promise<any[]>;
  getCollegeDomainByDomain(domain: string): Promise<any | undefined>;
  getCollegeDomainById(id: string): Promise<any | undefined>;
  createCollegeDomain(data: { collegeName: string; domain: string; adminId: string }): Promise<any>;
  verifyCollegeDomain(domain: string): Promise<boolean>;

  // Project files operations
  getProjectFiles(projectId: string): Promise<any[]>;
  getProjectFileById(fileId: string): Promise<any | undefined>;
  uploadProjectFile(fileData: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Enhanced user creation with better error handling and validation
      const hashedPassword = await this.hashPassword(insertUser.password);
      
      // Use transaction for atomicity to prevent partial user creation
      const result = await db.transaction(async (tx) => {
        // Validate that role is provided - this should never be undefined due to Zod validation
        if (!insertUser.role) {
          throw new Error('User role is required and must be specified');
        }
        
        console.log(`🔄 Creating user with role: ${insertUser.role} for email: ${insertUser.email}`);
        
        return await tx.insert(users).values({
          ...insertUser,
          password: hashedPassword,
          isVerified: insertUser.role === 'ADMIN' ? true : (insertUser.isVerified || false),
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
      });
      
      console.log(`✅ User created successfully: ${result[0].email} (${result[0].role})`);
      return result[0];
    } catch (error: any) {
      console.error('❌ Error creating user:', error);
      
      // Enhanced error messages for common issues
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        if (error.detail?.includes('email')) {
          throw new Error('Email address is already registered');
        }
        if (error.detail?.includes('username')) {
          throw new Error('Username is already taken');
        }
        throw new Error('User with this information already exists');
      }
      
      if (error.code === '23502') { // NOT NULL constraint violation
        throw new Error('Required user information is missing');
      }
      
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async getUsersByInstitution(institution: string): Promise<User[]> {
    try {
      if (!institution || typeof institution !== 'string') {
        throw new Error('Invalid institution parameter');
      }
      
      const institutionUsers = await db.select().from(users).where(eq(users.institution, institution));
      console.log(`📊 Found ${institutionUsers.length} users for institution: ${institution}`);
      return institutionUsers;
    } catch (error) {
      console.error('❌ Error fetching users by institution:', error);
      throw new Error(`Failed to fetch users for institution: ${institution}`);
    }
  }

  // Enhanced method to validate user permissions
  async validateUserPermission(userId: string, requiredRole: string, institution?: string): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        console.warn(`⚠️ Permission validation failed: User ${userId} not found`);
        return false;
      }

      // Check role permission
      if (user.role !== requiredRole) {
        console.warn(`⚠️ Permission denied: User ${userId} has role ${user.role}, required ${requiredRole}`);
        return false;
      }

      // Check institution if specified
      if (institution && user.institution !== institution) {
        console.warn(`⚠️ Institution mismatch: User ${userId} belongs to ${user.institution}, required ${institution}`);
        return false;
      }

      console.log(`✅ Permission validated: User ${userId} has required access`);
      return true;
    } catch (error) {
      console.error('❌ Error validating user permission:', error);
      return false;
    }
  }

  // Method to safely update user role with validation
  async updateUserRole(userId: string, newRole: string, adminUserId: string): Promise<User> {
    try {
      const targetUser = await this.getUser(userId);
      const adminUser = await this.getUser(adminUserId);

      if (!targetUser) {
        throw new Error('Target user not found');
      }

      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      // Validate admin permissions
      if (adminUser.role !== 'ADMIN') {
        throw new Error('Insufficient permissions to update user role');
      }

      // Validate same institution
      if (targetUser.institution !== adminUser.institution) {
        throw new Error('Cannot modify users from different institutions');
      }

      // Prevent modifying other admins
      if (targetUser.role === 'ADMIN' && targetUser.id !== adminUserId) {
        throw new Error('Cannot modify other administrators');
      }

      // Validate new role
      const validRoles = ['STUDENT', 'FACULTY', 'GUEST'];
      if (!validRoles.includes(newRole)) {
        throw new Error(`Invalid role: ${newRole}`);
      }

      // Update user role using transaction
      const result = await db.transaction(async (tx) => {
        return await tx.update(users)
          .set({ 
            role: newRole as any, 
            updatedAt: new Date() 
          })
          .where(eq(users.id, userId))
          .returning();
      });

      if (!result || result.length === 0) {
        throw new Error('Failed to update user role');
      }

      console.log(`✅ User role updated: ${userId} -> ${newRole} by admin ${adminUserId}`);
      return result[0];
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      throw error;
    }
  }

  // Method to safely remove user with validation
  async removeUser(userId: string, adminUserId: string): Promise<boolean> {
    try {
      const targetUser = await this.getUser(userId);
      const adminUser = await this.getUser(adminUserId);

      if (!targetUser) {
        throw new Error('Target user not found');
      }

      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      // Validate admin permissions
      if (adminUser.role !== 'ADMIN') {
        throw new Error('Insufficient permissions to remove user');
      }

      // Validate same institution
      if (targetUser.institution !== adminUser.institution) {
        throw new Error('Cannot remove users from different institutions');
      }

      // Prevent removing other admins
      if (targetUser.role === 'ADMIN') {
        throw new Error('Cannot remove other administrators');
      }

      // Prevent self-removal
      if (targetUser.id === adminUserId) {
        throw new Error('Cannot remove yourself');
      }

      // Remove user using transaction
      await db.transaction(async (tx) => {
        await tx.delete(users).where(eq(users.id, userId));
      });

      console.log(`✅ User removed: ${userId} by admin ${adminUserId}`);
      return true;
    } catch (error) {
      console.error('❌ Error removing user:', error);
      throw error;
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      // Use salt rounds of 12 for strong security (recommended for production)
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('🔒 Password hashed successfully with salt rounds: 12');
      return hashedPassword;
    } catch (error) {
      console.error('❌ Password hashing error:', error);
      throw new Error('Failed to secure password');
    }
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(password, hashedPassword);
      console.log(`🔐 Password verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);
      return isValid;
    } catch (error) {
      console.error('❌ Password verification error:', error);
      return false;
    }
  }

  // Project operations
  async getProject(id: string): Promise<Project | undefined> {
    try {
      const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting project:', error);
      return undefined;
    }
  }

  async getProjectWithDetails(id: string, userId?: string): Promise<ProjectWithDetails | undefined> {
    try {
      // Get project with owner
      const projectWithOwner = await db
        .select()
        .from(projects)
        .innerJoin(users, eq(projects.ownerId, users.id))
        .where(eq(projects.id, id))
        .limit(1);

      if (!projectWithOwner.length) return undefined;

      const project = projectWithOwner[0].projects;
      const owner = projectWithOwner[0].users;

      // Get collaborators
      const collaboratorResults = await db
        .select()
        .from(projectCollaborators)
        .innerJoin(users, eq(projectCollaborators.userId, users.id))
        .where(eq(projectCollaborators.projectId, id));
      
      const collaborators = collaboratorResults.map(result => result.users);

      // Get star count and user star status
      const starResults = await db
        .select({ count: count() })
        .from(projectStars)
        .where(eq(projectStars.projectId, id));
      
      const starCount = starResults[0]?.count || 0;
      
      let isStarred = false;
      if (userId) {
        const userStar = await db
          .select()
          .from(projectStars)
          .where(and(eq(projectStars.projectId, id), eq(projectStars.userId, userId)))
          .limit(1);
        isStarred = userStar.length > 0;
      }

      // Get comment count
      const commentResults = await db
        .select({ count: count() })
        .from(projectComments)
        .where(eq(projectComments.projectId, id));
      
      const commentCount = commentResults[0]?.count || 0;

      // Get project review
      const reviewResults = await db
        .select()
        .from(projectReviews)
        .where(eq(projectReviews.projectId, id))
        .limit(1);
      
      const review = reviewResults[0] || undefined;

      return {
        ...project,
        owner,
        collaborators,
        starCount,
        commentCount,
        isStarred,
        review
      };
    } catch (error) {
      console.error('Error getting project with details:', error);
      return undefined;
    }
  }

  async getProjects(filters?: { 
    ownerId?: string; 
    visibility?: string; 
    status?: string; 
    category?: string;
    search?: string;
    institution?: string;
  }): Promise<ProjectWithDetails[]> {
    try {
      let query = db
        .select()
        .from(projects)
        .innerJoin(users, eq(projects.ownerId, users.id));

      const conditions = [];

      if (filters?.ownerId) {
        conditions.push(eq(projects.ownerId, filters.ownerId));
      }
      if (filters?.visibility) {
        conditions.push(eq(projects.visibility, filters.visibility as any));
      }
      if (filters?.status) {
        conditions.push(eq(projects.status, filters.status as any));
      }
      if (filters?.category) {
        conditions.push(eq(projects.category, filters.category));
      }
      if (filters?.search) {
        conditions.push(
          or(
            ilike(projects.title, `%${filters.search}%`),
            ilike(projects.description, `%${filters.search}%`)
          )
        );
      }
      if (filters?.institution) {
        conditions.push(eq(users.institution, filters.institution));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const results = await query.orderBy(desc(projects.createdAt));

      // Build ProjectWithDetails for each project
      const projectsWithDetails: ProjectWithDetails[] = [];
      
      for (const result of results) {
        const project = result.projects;
        const owner = result.users;

        // Get collaborators for this project
        const collaboratorResults = await db
          .select()
          .from(projectCollaborators)
          .innerJoin(users, eq(projectCollaborators.userId, users.id))
          .where(eq(projectCollaborators.projectId, project.id));
        
        const collaborators = collaboratorResults.map(cr => cr.users);

        // Get star count
        const starResults = await db
          .select({ count: count() })
          .from(projectStars)
          .where(eq(projectStars.projectId, project.id));
        
        const starCount = starResults[0]?.count || 0;

        // Get comment count
        const commentResults = await db
          .select({ count: count() })
          .from(projectComments)
          .where(eq(projectComments.projectId, project.id));
        
        const commentCount = commentResults[0]?.count || 0;

        // Get faculty review
        const reviewResults = await db
          .select()
          .from(projectReviews)
          .where(eq(projectReviews.projectId, project.id))
          .limit(1);
        
        const review = reviewResults[0] || undefined;

        projectsWithDetails.push({
          ...project,
          owner,
          collaborators,
          starCount,
          commentCount,
          isStarred: false, // Will be set per user context
          review
        });
      }

      return projectsWithDetails;
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      console.log(`💾 Inserting project into database:`, project);
      
      // Check before count
      const beforeCount = await db.select({ count: count() }).from(projects).where(eq(projects.ownerId, project.ownerId));
      console.log(`📊 BEFORE: User ${project.ownerId} had ${beforeCount[0]?.count || 0} projects`);
      
      const result = await db.insert(projects).values(project).returning();
      console.log(`✅ Project successfully saved to database:`, result[0]);
      
      // Check after count
      const afterCount = await db.select({ count: count() }).from(projects).where(eq(projects.ownerId, project.ownerId));
      console.log(`📊 AFTER: User ${project.ownerId} now has ${afterCount[0]?.count || 0} projects`);
      console.log(`🎯 DASHBOARD SHOULD UPDATE FROM ${beforeCount[0]?.count || 0} TO ${afterCount[0]?.count || 0}`);
      
      return result[0];
    } catch (error) {
      console.error('❌ Error creating project in database:', error);
      throw error;
    }
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    try {
      const result = await db
        .update(projects)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();
      
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating project:', error);
      return undefined;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      await db.delete(projects).where(eq(projects.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  // Collaboration methods
  async addCollaborator(projectId: string, userId: string): Promise<void> {
    try {
      await db.insert(projectCollaborators).values({
        projectId,
        userId
      });
    } catch (error) {
      console.error('Error adding collaborator:', error);
      throw error;
    }
  }

  async removeCollaborator(projectId: string, userId: string): Promise<void> {
    try {
      await db
        .delete(projectCollaborators)
        .where(and(
          eq(projectCollaborators.projectId, projectId),
          eq(projectCollaborators.userId, userId)
        ));
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw error;
    }
  }

  async getProjectCollaborators(projectId: string): Promise<User[]> {
    try {
      const results = await db
        .select()
        .from(projectCollaborators)
        .innerJoin(users, eq(projectCollaborators.userId, users.id))
        .where(eq(projectCollaborators.projectId, projectId));
      
      return results.map(result => result.users);
    } catch (error) {
      console.error('Error getting project collaborators:', error);
      return [];
    }
  }

  // Star operations
  async starProject(projectId: string, userId: string): Promise<void> {
    try {
      // Check if already starred
      const existing = await db
        .select()
        .from(projectStars)
        .where(and(
          eq(projectStars.projectId, projectId),
          eq(projectStars.userId, userId)
        ))
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(projectStars).values({
          projectId,
          userId
        });
      }
    } catch (error) {
      console.error('Error starring project:', error);
      throw error;
    }
  }

  async unstarProject(projectId: string, userId: string): Promise<void> {
    try {
      await db
        .delete(projectStars)
        .where(and(
          eq(projectStars.projectId, projectId),
          eq(projectStars.userId, userId)
        ));
    } catch (error) {
      console.error('Error unstarring project:', error);
      throw error;
    }
  }

  async getStarredProjects(userId: string): Promise<ProjectWithDetails[]> {
    try {
      const starredProjects = await db
        .select()
        .from(projectStars)
        .innerJoin(projects, eq(projectStars.projectId, projects.id))
        .innerJoin(users, eq(projects.ownerId, users.id))
        .where(eq(projectStars.userId, userId));

      const projectsWithDetails: ProjectWithDetails[] = [];

      for (const result of starredProjects) {
        const project = result.projects;
        const owner = result.users;

        // Get collaborators
        const collaboratorResults = await db
          .select()
          .from(projectCollaborators)
          .innerJoin(users, eq(projectCollaborators.userId, users.id))
          .where(eq(projectCollaborators.projectId, project.id));
        
        const collaborators = collaboratorResults.map(cr => cr.users);

        // Get star count
        const starResults = await db
          .select({ count: count() })
          .from(projectStars)
          .where(eq(projectStars.projectId, project.id));
        
        const starCount = starResults[0]?.count || 0;

        // Get comment count
        const commentResults = await db
          .select({ count: count() })
          .from(projectComments)
          .where(eq(projectComments.projectId, project.id));
        
        const commentCount = commentResults[0]?.count || 0;

        // Get faculty review
        const reviewResults = await db
          .select()
          .from(projectReviews)
          .where(eq(projectReviews.projectId, project.id))
          .limit(1);
        
        const review = reviewResults[0] || undefined;

        projectsWithDetails.push({
          ...project,
          owner,
          collaborators,
          starCount,
          commentCount,
          isStarred: true,
          review
        });
      }

      return projectsWithDetails;
    } catch (error) {
      console.error('Error getting starred projects:', error);
      return [];
    }
  }

  // Comment operations
  async getComments(projectId: string, limit: number = 50, offset: number = 0): Promise<(Comment & { author: User })[]> {
    try {
      console.log(`📥 Fetching comments for project ${projectId} (limit: ${limit}, offset: ${offset})`);
      
      const results = await db
        .select()
        .from(projectComments)
        .innerJoin(users, eq(projectComments.authorId, users.id))
        .where(eq(projectComments.projectId, projectId))
        .orderBy(desc(projectComments.createdAt))
        .limit(limit)
        .offset(offset);
      
      const comments = results.map(result => ({
        ...result.project_comments,
        author: result.users
      }));
      
      console.log(`✅ Retrieved ${comments.length} comments for project ${projectId}`);
      return comments;
    } catch (error) {
      console.error('❌ Error getting comments:', error);
      return [];
    }
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    try {
      const result = await db.insert(projectComments).values(comment).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // Faculty assignment operations
  async assignProjectToReviewer(projectId: string, reviewerId: string): Promise<FacultyAssignment> {
    try {
      const result = await db.insert(projectReviews).values({
        projectId,
        reviewerId,
        status: "PENDING"
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error assigning project to faculty:', error);
      throw error;
    }
  }

  async getFacultyAssignments(reviewerId: string): Promise<(FacultyAssignment & { project: ProjectWithDetails })[]> {
    try {
      const reviews = await db
        .select()
        .from(projectReviews)
        .innerJoin(projects, eq(projectReviews.projectId, projects.id))
        .innerJoin(users, eq(projects.ownerId, users.id))
        .where(eq(projectReviews.reviewerId, reviewerId));

      const reviewsWithDetails: (FacultyAssignment & { project: ProjectWithDetails })[] = [];

      for (const result of reviews) {
        const review = result.project_reviews;
        const project = result.projects;
        const owner = result.users;

        // Get project details
        const projectDetails = await this.getProjectWithDetails(project.id);
        
        if (projectDetails) {
          reviewsWithDetails.push({
            ...review,
            project: projectDetails
          });
        }
      }

      return reviewsWithDetails;
    } catch (error) {
      console.error('Error getting faculty assignments:', error);
      return [];
    }
  }

  async getProjectReviews(reviewerId: string): Promise<(ProjectReview & { project: ProjectWithDetails })[]> {
    return this.getFacultyAssignments(reviewerId);
  }

  async submitReview(reviewId: string, grade: string, feedback: string): Promise<ProjectReview | undefined> {
    try {
      const result = await db
        .update(projectReviews)
        .set({
          grade: parseInt(grade) || 0,
          feedback,
          status: "COMPLETED",
          updatedAt: new Date()
        })
        .where(eq(projectReviews.id, reviewId))
        .returning();
      
      return result[0] || undefined;
    } catch (error) {
      console.error('Error submitting review:', error);
      return undefined;
    }
  }

  // Dashboard statistics
  async getDashboardStats(userId: string, role: string): Promise<DashboardStats> {
    try {
      console.log(`🔍 Getting dashboard stats for user: ${userId}, role: ${role}`);
      
      if (role === "STUDENT") {
        // Total projects count
        const totalResults = await db
          .select({ count: count() })
          .from(projects)
          .where(eq(projects.ownerId, userId));
        
        const totalProjects = totalResults[0]?.count || 0;
        console.log(`📊 Student ${userId} - Total projects: ${totalProjects}`);

        // Projects under review
        const inReviewResults = await db
          .select({ count: count() })
          .from(projects)
          .where(and(
            eq(projects.ownerId, userId),
            eq(projects.status, "UNDER_REVIEW")
          ));
        
        const inReview = inReviewResults[0]?.count || 0;

        // Approved projects
        const approvedResults = await db
          .select({ count: count() })
          .from(projects)
          .where(and(
            eq(projects.ownerId, userId),
            eq(projects.status, "APPROVED")
          ));
        
        const approved = approvedResults[0]?.count || 0;

        // Collaborators count (total across all user's projects)
        const collaboratorResults = await db
          .select({ count: count() })
          .from(projectCollaborators)
          .innerJoin(projects, eq(projectCollaborators.projectId, projects.id))
          .where(eq(projects.ownerId, userId));
        
        const collaborators = collaboratorResults[0]?.count || 0;

        console.log(`📊 Student ${userId} stats: {totalProjects: ${totalProjects}, inReview: ${inReview}, approved: ${approved}, collaborators: ${collaborators}}`);
        
        // Real-time verification of stats calculation
        console.log(`🔍 Real-time verification for user ${userId}:`);
        console.log(`   - Total projects query result: ${totalProjects}`);
        console.log(`   - In review projects: ${inReview}`);
        console.log(`   - Approved projects: ${approved}`);
        console.log(`   - Collaborators: ${collaborators}`);
        
        return {
          totalProjects,
          inReview,
          approved,
          collaborators
        };
      } else if (role === "FACULTY") {
        // Total assignments
        const totalResults = await db
          .select({ count: count() })
          .from(projectReviews)
          .where(eq(projectReviews.reviewerId, userId));
        
        const totalProjects = totalResults[0]?.count || 0;

        // Pending reviews
        const inReviewResults = await db
          .select({ count: count() })
          .from(projectReviews)
          .where(and(
            eq(projectReviews.reviewerId, userId),
            eq(projectReviews.status, "PENDING")
          ));
        
        const inReview = inReviewResults[0]?.count || 0;

        // Completed reviews
        const approvedResults = await db
          .select({ count: count() })
          .from(projectReviews)
          .where(and(
            eq(projectReviews.reviewerId, userId),
            eq(projectReviews.status, "COMPLETED")
          ));
        
        const approved = approvedResults[0]?.count || 0;

        return {
          totalProjects,
          inReview,
          approved,
          collaborators: 0
        };
      } else {
        // Admin stats - institution wide
        const user = await this.getUser(userId);
        if (!user) {
          return { totalProjects: 0, inReview: 0, approved: 0, collaborators: 0 };
        }

        const totalResults = await db
          .select({ count: count() })
          .from(projects)
          .innerJoin(users, eq(projects.ownerId, users.id))
          .where(eq(users.institution, user.institution));
        
        const totalProjects = totalResults[0]?.count || 0;

        const inReviewResults = await db
          .select({ count: count() })
          .from(projects)
          .innerJoin(users, eq(projects.ownerId, users.id))
          .where(and(
            eq(users.institution, user.institution),
            eq(projects.status, "UNDER_REVIEW")
          ));
        
        const inReview = inReviewResults[0]?.count || 0;

        const approvedResults = await db
          .select({ count: count() })
          .from(projects)
          .innerJoin(users, eq(projects.ownerId, users.id))
          .where(and(
            eq(users.institution, user.institution),
            eq(projects.status, "APPROVED")
          ));
        
        const approved = approvedResults[0]?.count || 0;

        return {
          totalProjects,
          inReview,
          approved,
          collaborators: 0
        };
      }
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return { totalProjects: 0, inReview: 0, approved: 0, collaborators: 0 };
    }
  }

  async getRecentActivity(userId: string, role: string, limit: number): Promise<ActivityItem[]> {
    try {
      const activities: ActivityItem[] = [];
      
      if (role === "STUDENT") {
        // Get recent project activities for student
        const recentProjects = await db
          .select()
          .from(projects)
          .where(eq(projects.ownerId, userId))
          .orderBy(desc(projects.updatedAt))
          .limit(limit);

        for (const project of recentProjects) {
          activities.push({
            id: project.id,
            type: 'project_updated',
            title: `Updated "${project.title}"`,
            description: `Made changes to ${project.category} project`,
            timestamp: project.updatedAt || project.createdAt,
            projectId: project.id,
            userId: project.ownerId
          });
        }

        // Get recent comments on user's projects
        const recentComments = await db
          .select()
          .from(projectComments)
          .innerJoin(projects, eq(projectComments.projectId, projects.id))
          .innerJoin(users, eq(projectComments.authorId, users.id))
          .where(eq(projects.ownerId, userId))
          .orderBy(desc(projectComments.createdAt))
          .limit(Math.floor(limit / 2));

        for (const result of recentComments) {
          const comment = result.project_comments;
          const project = result.projects;
          const user = result.users;
          
          activities.push({
            id: comment.id,
            type: 'comment_added',
            title: `${user.firstName} commented on "${project.title}"`,
            description: comment.content.slice(0, 100) + (comment.content.length > 100 ? '...' : ''),
            timestamp: comment.createdAt,
            projectId: project.id,
            userId: comment.authorId
          });
        }
        
      } else if (role === "FACULTY") {
        // Get recent faculty assignments
        const recentAssignments = await db
          .select()
          .from(projectReviews)
          .innerJoin(projects, eq(projectReviews.projectId, projects.id))
          .innerJoin(users, eq(projects.ownerId, users.id))
          .where(eq(projectReviews.reviewerId, userId))
          .orderBy(desc(projectReviews.createdAt))
          .limit(limit);

        for (const result of recentAssignments) {
          const review = result.project_reviews;
          const project = result.projects;
          const student = result.users;
          
          activities.push({
            id: review.id,
            type: review.status === 'COMPLETED' ? 'review_completed' : 'project_updated',
            title: review.status === 'COMPLETED' 
              ? `Completed review for "${project.title}"`
              : `New assignment: "${project.title}"`,
            description: `Project by ${student.firstName} ${student.lastName}`,
            timestamp: review.updatedAt || review.createdAt,
            projectId: project.id,
            userId: review.reviewerId
          });
        }
        
      } else {
        // Admin role - get institution-wide activities
        const user = await this.getUser(userId);
        if (user) {
          const recentProjects = await db
            .select()
            .from(projects)
            .innerJoin(users, eq(projects.ownerId, users.id))
            .where(eq(users.institution, user.institution))
            .orderBy(desc(projects.createdAt))
            .limit(limit);

          for (const result of recentProjects) {
            const project = result.projects;
            const owner = result.users;
            
            activities.push({
              id: project.id,
              type: 'project_created',
              title: `"${project.title}" created`,
              description: `New ${project.category} project by ${owner.firstName} ${owner.lastName}`,
              timestamp: project.createdAt,
              projectId: project.id,
              userId: project.ownerId
            });
          }
        }
      }

      // Sort all activities by timestamp and return the most recent
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
        
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  // College domain operations
  async getCollegeDomains(): Promise<any[]> {
    try {
      const result = await db.select().from(collegeDomains);
      return result;
    } catch (error) {
      console.error('Error getting college domains:', error);
      return [];
    }
  }

  async getCollegeDomainByDomain(domain: string): Promise<any | undefined> {
    try {
      const result = await db
        .select()
        .from(collegeDomains)
        .where(eq(collegeDomains.domain, domain))
        .limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting college domain by domain:', error);
      return undefined;
    }
  }

  async getCollegeDomainById(id: string): Promise<any | undefined> {
    try {
      const result = await db
        .select()
        .from(collegeDomains)
        .where(eq(collegeDomains.id, id))
        .limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting college domain by ID:', error);
      return undefined;
    }
  }

  async createCollegeDomain(data: { collegeName: string; domain: string; adminId: string }): Promise<any> {
    try {
      const result = await db
        .insert(collegeDomains)
        .values({
          collegeName: data.collegeName,
          domain: data.domain,
          adminId: data.adminId,
          isVerified: true, // Auto-verify when created by admin
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error creating college domain:', error);
      throw error;
    }
  }

  async verifyCollegeDomain(domain: string): Promise<boolean> {
    try {
      const result = await db
        .select()
        .from(collegeDomains)
        .where(and(
          eq(collegeDomains.domain, domain),
          eq(collegeDomains.isVerified, true)
        ))
        .limit(1);
      return result.length > 0;
    } catch (error) {
      console.error('Error verifying college domain:', error);
      return false;
    }
  }

  // Project files operations
  async getProjectFiles(projectId: string): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(projectFiles)
        .where(eq(projectFiles.projectId, projectId))
        .orderBy(projectFiles.uploadedAt);
      return result;
    } catch (error) {
      console.error('Error getting project files:', error);
      return [];
    }
  }

  async getProjectFileById(fileId: string): Promise<any | undefined> {
    try {
      const result = await db
        .select()
        .from(projectFiles)
        .where(eq(projectFiles.id, fileId))
        .limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting project file by ID:', error);
      return undefined;
    }
  }

  async uploadProjectFile(fileData: any): Promise<any> {
    try {
      const result = await db
        .insert(projectFiles)
        .values({
          projectId: fileData.projectId,
          fileName: fileData.fileName,
          filePath: fileData.filePath,
          fileType: fileData.fileType,
          fileSize: fileData.fileSize,
          content: fileData.content,
          isArchive: fileData.isArchive || false,
          archiveContents: fileData.archiveContents
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error uploading project file:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();