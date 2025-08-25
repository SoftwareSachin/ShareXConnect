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
  type CollaborationRequest,
  type InsertCollaborationRequest,
  type ProjectRepositoryItem,
  type InsertProjectRepositoryItem,
  type ProjectChangeRequest,
  type InsertProjectChangeRequest,
  users,
  projects,
  projectCollaborators,
  projectStars,
  projectComments,
  projectReviews,
  projectFiles,
  collaborationRequests,
  projectRepository,
  projectChangeRequests,
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
  updateUserProfile(id: string, profileData: Partial<User>): Promise<User | undefined>;
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
    department?: string;
    techStack?: string[];
  }): Promise<ProjectWithDetails[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Project collaboration
  addCollaborator(projectId: string, userId: string): Promise<void>;
  removeCollaborator(projectId: string, userId: string): Promise<void>;
  getProjectCollaborators(projectId: string): Promise<(User & { addedAt: string; isOwner?: boolean })[]>;
  isProjectCollaborator(projectId: string, userId: string): Promise<boolean>;

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
  getProjectReviewsForProject(projectId: string): Promise<(ProjectReview & { reviewer: any })[]>;
  submitReview(projectId: string, reviewerId: string, grade: string, feedback: string, isFinal?: boolean): Promise<ProjectReview | undefined>;
  markReviewAsRead(reviewId: string, studentId: string): Promise<boolean>;
  isProjectReviewer(projectId: string, reviewerId: string): Promise<boolean>;

  // Dashboard statistics
  getDashboardStats(userId: string, role: string): Promise<DashboardStats>;
  getRecentActivity(userId: string, role: string, limit: number): Promise<ActivityItem[]>;

  // College domain operations
  getCollegeDomains(): Promise<any[]>;
  
  // Raw SQL query support for dynamic filtering
  query(sql: string): Promise<any[]>;
  getCollegeDomainByDomain(domain: string): Promise<any | undefined>;
  getCollegeDomainById(id: string): Promise<any | undefined>;
  createCollegeDomain(data: { collegeName: string; domain: string; adminId: string }): Promise<any>;
  verifyCollegeDomain(domain: string): Promise<boolean>;

  // Project files operations
  getProjectFiles(projectId: string): Promise<any[]>;
  getProjectFileById(fileId: string): Promise<any | undefined>;
  uploadProjectFile(fileData: any): Promise<any>;

  // GitHub-like collaboration operations
  requestCollaboration(projectId: string, requesterId: string, message: string): Promise<CollaborationRequest>;
  inviteCollaborator(projectId: string, inviteeId: string, senderId: string, message?: string): Promise<CollaborationRequest>;
  getCollaborationRequests(projectId: string): Promise<(CollaborationRequest & { requester?: User; invitee?: User; sender: User })[]>;
  getUserInvitations(userId: string): Promise<(CollaborationRequest & { project: Project; sender: User })[]>;
  getOwnerCollaborationRequests(ownerId: string): Promise<(CollaborationRequest & { project: Project; requester: User })[]>;
  respondToCollaborationRequest(requestId: string, status: 'APPROVED' | 'REJECTED', reviewerId: string): Promise<CollaborationRequest | undefined>;
  addCollaboratorByEmail(projectId: string, email: string, ownerId: string): Promise<void>;
  
  // Repository file management
  createRepositoryItem(item: InsertProjectRepositoryItem): Promise<ProjectRepositoryItem>;
  updateRepositoryItem(id: string, updates: Partial<InsertProjectRepositoryItem>): Promise<ProjectRepositoryItem | undefined>;
  deleteRepositoryItem(id: string): Promise<boolean>;
  getRepositoryStructure(projectId: string): Promise<ProjectRepositoryItem[]>;
  
  // Change request system for collaboration
  createChangeRequest(request: InsertProjectChangeRequest): Promise<ProjectChangeRequest>;
  getChangeRequests(projectId: string): Promise<(ProjectChangeRequest & { requester: User; reviewer?: User })[]>;
  reviewChangeRequest(requestId: string, status: 'APPROVED' | 'REJECTED' | 'MERGED', reviewerId: string): Promise<ProjectChangeRequest | undefined>;
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
          isVerified: (insertUser.role === 'ADMIN' || insertUser.role === 'FACULTY') ? true : (insertUser.isVerified || false),
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

  async updateUserProfile(id: string, profileData: Partial<User>): Promise<User | undefined> {
    try {
      // Filter out fields that shouldn't be updated via profile
      const { id: _, password, createdAt, updatedAt, isVerified, role, ...allowedFields } = profileData;
      
      const result = await db.update(users)
        .set({
          ...allowedFields,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();
      
      return result[0] || undefined;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUsersByInstitution(institution: string): Promise<User[]> {
    try {
      if (!institution || typeof institution !== 'string') {
        throw new Error('Invalid institution parameter');
      }
      
      // Fetch users with available columns only
      const institutionUsers = await db.select()
        .from(users)
        .where(eq(users.institution, institution))
        .orderBy(desc(users.createdAt));
      
      console.log(`📊 Fetched ${institutionUsers.length} users for institution: ${institution}`);
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

  // Method to safely remove user with validation and cleanup
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

      // Get user's projects and collaborations before removal
      const userProjects = await this.getProjects({ ownerId: userId });
      const collaborations = await db.select()
        .from(projectCollaborators)
        .where(eq(projectCollaborators.userId, userId));

      // Remove user using transaction with proper cleanup
      await db.transaction(async (tx) => {
        // Remove from project collaborations
        await tx.delete(projectCollaborators)
          .where(eq(projectCollaborators.userId, userId));
        
        // Remove project stars
        await tx.delete(projectStars)
          .where(eq(projectStars.userId, userId));
        
        // Update projects owned by user to mark as archived or transfer ownership
        if (userProjects.length > 0) {
          for (const project of userProjects) {
            // Mark projects as archived instead of deleting them
            await tx.update(projects)
              .set({ 
                status: 'ARCHIVED' as any,
                updatedAt: new Date(),
                // Keep project data but mark as former user
                description: `${project.description}\n\n[Note: Original owner account was removed]`
              })
              .where(eq(projects.id, project.id));
          }
        }
        
        // Remove project comments by the user
        await tx.delete(projectComments)
          .where(eq(projectComments.authorId, userId));
        
        // Remove project reviews by the user (if faculty)
        await tx.delete(projectReviews)
          .where(eq(projectReviews.reviewerId, userId));
        
        // Finally remove the user
        await tx.delete(users).where(eq(users.id, userId));
      });

      console.log(`✅ User removed with cleanup: ${userId} (${targetUser.email}) by admin ${adminUserId}`);
      console.log(`📊 Cleanup summary: ${userProjects.length} projects archived, ${collaborations.length} collaborations removed`);
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
    department?: string;
    techStack?: string[];
    includeCollaborations?: boolean;
  }): Promise<ProjectWithDetails[]> {
    try {
      let query = db
        .select()
        .from(projects)
        .innerJoin(users, eq(projects.ownerId, users.id));

      const conditions = [];

      if (filters?.ownerId) {
        if (filters.includeCollaborations) {
          // Include both owned projects and collaborations
          const collaborationCondition = sql`EXISTS (
            SELECT 1 FROM ${projectCollaborators} 
            WHERE ${projectCollaborators.projectId} = ${projects.id} 
            AND ${projectCollaborators.userId} = ${filters.ownerId}
          )`;
          conditions.push(
            or(
              eq(projects.ownerId, filters.ownerId),
              collaborationCondition
            )
          );
        } else {
          conditions.push(eq(projects.ownerId, filters.ownerId));
        }
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
      if (filters?.department) {
        conditions.push(eq(projects.department, filters.department));
      }
      if (filters?.techStack && filters.techStack.length > 0) {
        // Check if any of the requested tech stacks are in the project's tech stack array
        const techStackConditions = filters.techStack.map(tech => 
          sql`${projects.techStack} @> ARRAY[${tech}]`
        );
        conditions.push(or(...techStackConditions));
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
      // Check if already a collaborator
      const existing = await db
        .select()
        .from(projectCollaborators)
        .where(and(
          eq(projectCollaborators.projectId, projectId),
          eq(projectCollaborators.userId, userId)
        ))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(projectCollaborators).values({
          projectId,
          userId
        });
        console.log(`✅ User ${userId} added as collaborator to project ${projectId}`);
      } else {
        console.log(`ℹ️ User ${userId} is already a collaborator on project ${projectId}`);
      }
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

  async getProjectCollaborators(projectId: string): Promise<(User & { addedAt: string; isOwner?: boolean })[]> {
    try {
      // Get the project owner first
      const project = await this.getProject(projectId);
      if (!project) {
        return [];
      }

      // Get all collaborators
      const results = await db
        .select({
          user: users,
          addedAt: projectCollaborators.createdAt,
        })
        .from(projectCollaborators)
        .innerJoin(users, eq(projectCollaborators.userId, users.id))
        .where(eq(projectCollaborators.projectId, projectId));
      
      // Include the project owner as well
      const owner = await this.getUser(project.ownerId);
      const collaborators = results.map(result => ({
        ...result.user,
        addedAt: result.addedAt.toISOString(),
        isOwner: false
      }));

      // Add owner to the list
      if (owner) {
        collaborators.unshift({
          ...owner,
          addedAt: project.createdAt.toISOString(),
          isOwner: true
        });
      }

      return collaborators;
    } catch (error) {
      console.error('Error getting project collaborators:', error);
      return [];
    }
  }

  async isProjectCollaborator(projectId: string, userId: string): Promise<boolean> {
    try {
      const result = await db.select()
        .from(projectCollaborators)
        .where(and(
          eq(projectCollaborators.projectId, projectId),
          eq(projectCollaborators.userId, userId)
        ))
        .limit(1);
      
      return result.length > 0;
    } catch (error) {
      console.error('Error checking project collaboration:', error);
      return false;
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
        // Insert the star record
        await db.insert(projectStars).values({
          projectId,
          userId
        });

        // Update the star count in the projects table
        await db
          .update(projects)
          .set({ 
            starCount: sql`${projects.starCount} + 1`,
            updatedAt: new Date()
          })
          .where(eq(projects.id, projectId));

        console.log(`⭐ User ${userId} starred project ${projectId}`);
      }
    } catch (error) {
      console.error('Error starring project:', error);
      throw error;
    }
  }

  async unstarProject(projectId: string, userId: string): Promise<void> {
    try {
      // Check if the star exists first
      const existing = await db
        .select()
        .from(projectStars)
        .where(and(
          eq(projectStars.projectId, projectId),
          eq(projectStars.userId, userId)
        ))
        .limit(1);

      if (existing.length > 0) {
        // Remove the star record
        await db
          .delete(projectStars)
          .where(and(
            eq(projectStars.projectId, projectId),
            eq(projectStars.userId, userId)
          ));

        // Update the star count in the projects table
        await db
          .update(projects)
          .set({ 
            starCount: sql`GREATEST(${projects.starCount} - 1, 0)`, // Ensure it doesn't go below 0
            updatedAt: new Date()
          })
          .where(eq(projects.id, projectId));

        console.log(`🔄 User ${userId} unstarred project ${projectId}`);
      }
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

  async getProjectReviewsForProject(projectId: string): Promise<(ProjectReview & { reviewer: any, letterGrade?: string })[]> {
    try {
      const reviews = await db
        .select()
        .from(projectReviews)
        .innerJoin(users, eq(projectReviews.reviewerId, users.id))
        .where(eq(projectReviews.projectId, projectId));

      return reviews.map(result => {
        const review = result.project_reviews;
        const feedback = review.feedback || '';
        
        // Extract original letter grade from feedback if stored with | separator
        let letterGrade = '';
        let actualFeedback = feedback;
        
        if (feedback.includes('|')) {
          const parts = feedback.split('|');
          letterGrade = parts[0];
          actualFeedback = parts.slice(1).join('|');
        } else {
          // Convert numeric grade back to letter grade
          const grade = review.grade || 0;
          if (grade >= 97) letterGrade = 'A+';
          else if (grade >= 93) letterGrade = 'A';
          else if (grade >= 90) letterGrade = 'A-';
          else if (grade >= 87) letterGrade = 'B+';
          else if (grade >= 83) letterGrade = 'B';
          else if (grade >= 80) letterGrade = 'B-';
          else if (grade >= 77) letterGrade = 'C+';
          else if (grade >= 73) letterGrade = 'C';
          else if (grade >= 70) letterGrade = 'C-';
          else if (grade >= 67) letterGrade = 'D+';
          else if (grade >= 63) letterGrade = 'D';
          else if (grade >= 60) letterGrade = 'D-';
          else letterGrade = 'F';
        }

        return {
          ...review,
          feedback: actualFeedback,
          letterGrade,
          isReadByStudent: review.isReadByStudent || false,
          reviewer: {
            id: result.users.id,
            firstName: result.users.firstName,
            lastName: result.users.lastName,
            email: result.users.email,
            institution: result.users.institution,
            department: result.users.department
          }
        };
      });
    } catch (error) {
      console.error('Error getting project reviews:', error);
      return [];
    }
  }

  async getProjectReviews(reviewerId: string): Promise<(ProjectReview & { project: ProjectWithDetails })[]> {
    return this.getFacultyAssignments(reviewerId);
  }

  async isProjectReviewer(projectId: string, reviewerId: string): Promise<boolean> {
    try {
      const result = await db
        .select()
        .from(projectReviews)
        .where(
          and(
            eq(projectReviews.projectId, projectId),
            eq(projectReviews.reviewerId, reviewerId)
          )
        )
        .limit(1);
      
      return result.length > 0;
    } catch (error) {
      console.error('Error checking if user is project reviewer:', error);
      return false;
    }
  }

  async submitReview(projectId: string, reviewerId: string, grade: string, feedback: string, isFinal: boolean = false): Promise<ProjectReview | undefined> {
    try {
      // Check if this project already has a final review
      if (isFinal) {
        const existingFinalReview = await db
          .select()
          .from(projectReviews)
          .where(and(
            eq(projectReviews.projectId, projectId),
            eq(projectReviews.isFinal, true)
          ))
          .limit(1);
        
        if (existingFinalReview.length > 0) {
          console.log(`❌ Project ${projectId} already has a final review`);
          throw new Error("This project already has a final review. No more reviews can be submitted.");
        }
      }

      // Convert letter grades to numeric values for database storage
      const gradeMapping: Record<string, number> = {
        'A+': 97, 'A': 93, 'A-': 90,
        'B+': 87, 'B': 83, 'B-': 80,
        'C+': 77, 'C': 73, 'C-': 70,
        'D+': 67, 'D': 63, 'D-': 60,
        'F': 0
      };
      
      const numericGrade = gradeMapping[grade] || parseInt(grade) || 0;
      
      // CREATE a new review instead of updating existing one
      // This allows faculty to submit multiple reviews (but only one final review)
      const result = await db
        .insert(projectReviews)
        .values({
          projectId,
          reviewerId,
          grade: numericGrade,
          feedback: `${grade}|${feedback}`, // Store original grade with feedback
          status: "COMPLETED",
          isFinal,
          isReadByStudent: false
        })
        .returning();
      
      // If this is a final review, update the project status to APPROVED and mark all pending reviews as completed
      if (isFinal && result[0]) {
        // Update project status to APPROVED
        await db
          .update(projects)
          .set({ 
            status: "APPROVED",
            updatedAt: new Date()
          })
          .where(eq(projects.id, projectId));
        
        // Update all pending review assignments for this project to COMPLETED
        await db
          .update(projectReviews)
          .set({ 
            status: "COMPLETED",
            updatedAt: new Date()
          })
          .where(and(
            eq(projectReviews.projectId, projectId),
            eq(projectReviews.status, "PENDING")
          ));
        
        console.log(`✅ Project ${projectId} marked as APPROVED due to final review`);
        console.log(`✅ All pending reviews for project ${projectId} marked as COMPLETED`);
      }
      
      console.log(`✅ ${isFinal ? 'Final' : 'Regular'} review created for project ${projectId} by faculty ${reviewerId}: Grade ${grade}`);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }

  async markReviewAsRead(reviewId: string, studentId: string): Promise<boolean> {
    try {
      // Update the review to mark it as read by student
      const result = await db
        .update(projectReviews)
        .set({
          isReadByStudent: true,
          updatedAt: new Date()
        })
        .where(eq(projectReviews.id, reviewId))
        .returning();
      
      if (result.length > 0) {
        console.log(`✅ Review ${reviewId} marked as read by student ${studentId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking review as read:', error);
      return false;
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

        // Approved projects (projects with final reviews)
        const approvedResults = await db
          .select({ count: count() })
          .from(projects)
          .innerJoin(projectReviews, eq(projects.id, projectReviews.projectId))
          .where(and(
            eq(projects.ownerId, userId),
            eq(projectReviews.isFinal, true)
          ));
        
        const approved = approvedResults[0]?.count || 0;

        // Projects where user is collaborating (not counting own projects)
        const collaborationResults = await db
          .select({ count: count() })
          .from(projectCollaborators)
          .where(eq(projectCollaborators.userId, userId));
        
        const collaborators = collaborationResults[0]?.count || 0;

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
        // Count distinct projects assigned to this faculty (total assignments)
        const totalResults = await db
          .selectDistinct({ projectId: projectReviews.projectId })
          .from(projectReviews)
          .where(eq(projectReviews.reviewerId, userId));
        
        const totalProjects = totalResults.length;

        // Pending reviews (distinct projects with pending status)
        const inReviewResults = await db
          .selectDistinct({ projectId: projectReviews.projectId })
          .from(projectReviews)
          .where(and(
            eq(projectReviews.reviewerId, userId),
            eq(projectReviews.status, "PENDING")
          ));
        
        const inReview = inReviewResults.length;

        // Completed reviews (distinct projects with completed status or final reviews)
        const approvedResults = await db
          .selectDistinct({ projectId: projectReviews.projectId })
          .from(projectReviews)
          .where(and(
            eq(projectReviews.reviewerId, userId),
            or(
              eq(projectReviews.status, "COMPLETED"),
              eq(projectReviews.isFinal, true)
            )
          ));
        
        const approved = approvedResults.length;

        console.log(`📊 Faculty ${userId} stats: {totalProjects: ${totalProjects}, inReview: ${inReview}, approved: ${approved}}`);

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

  // Raw SQL query support for dynamic filtering
  async query(sql: string): Promise<any[]> {
    try {
      const result = await db.execute(sql);
      return result.rows || [];
    } catch (error) {
      console.error('Error executing query:', error);
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

  async deleteProjectFile(fileId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(projectFiles)
        .where(eq(projectFiles.id, fileId));
      
      console.log(`🗑️ Project file deleted: ${fileId}`);
      return true;
    } catch (error) {
      console.error('Error deleting project file:', error);
      return false;
    }
  }

  // GitHub-like collaboration operations
  async requestCollaboration(projectId: string, requesterId: string, message: string): Promise<CollaborationRequest> {
    try {
      const [request] = await db
        .insert(collaborationRequests)
        .values({
          projectId,
          requesterId,
          senderId: requesterId,
          type: "REQUEST",
          message,
          status: "PENDING"
        })
        .returning();
      
      console.log(`🤝 Collaboration request submitted for project ${projectId} by user ${requesterId}`);
      return request;
    } catch (error) {
      console.error('Error creating collaboration request:', error);
      throw error;
    }
  }

  async inviteCollaborator(projectId: string, inviteeId: string, senderId: string, message?: string): Promise<CollaborationRequest> {
    try {
      const [invitation] = await db
        .insert(collaborationRequests)
        .values({
          projectId,
          inviteeId,
          senderId,
          type: "INVITATION",
          message: message || `You've been invited to collaborate on this project`,
          status: "PENDING"
        })
        .returning();
      
      console.log(`📨 Collaboration invitation sent for project ${projectId} to user ${inviteeId} by ${senderId}`);
      return invitation;
    } catch (error) {
      console.error('Error creating collaboration invitation:', error);
      throw error;
    }
  }

  async getCollaborationRequestsForUser(projectId: string, currentUserId: string): Promise<(CollaborationRequest & { requester?: User; invitee?: User; sender: User })[]> {
    try {
      // Check if the current user is the project owner
      const [project] = await db
        .select({ ownerId: projects.ownerId })
        .from(projects)
        .where(eq(projects.id, projectId));

      if (!project) {
        return [];
      }

      const isProjectOwner = project.ownerId === currentUserId;

      let whereConditions;

      if (isProjectOwner) {
        // Project owner should only see incoming requests (type = REQUEST and status = PENDING)
        whereConditions = and(
          eq(collaborationRequests.projectId, projectId),
          eq(collaborationRequests.type, "REQUEST"),
          eq(collaborationRequests.status, "PENDING")
        );
      } else {
        // Regular users should only see invitations sent to them (type = INVITATION, inviteeId = currentUserId, status = PENDING)
        whereConditions = and(
          eq(collaborationRequests.projectId, projectId),
          eq(collaborationRequests.type, "INVITATION"),
          eq(collaborationRequests.inviteeId, currentUserId),
          eq(collaborationRequests.status, "PENDING")
        );
      }

      const requests = await db
        .select()
        .from(collaborationRequests)
        .where(whereConditions)
        .orderBy(desc(collaborationRequests.createdAt));

      const enrichedRequests = [];
      for (const requestData of requests) {
        let requester, invitee, sender;

        // Get requester if this is a REQUEST
        if (requestData.requesterId) {
          const [requesterData] = await db
            .select()
            .from(users)
            .where(eq(users.id, requestData.requesterId));
          requester = requesterData;
        }

        // Get invitee if this is an INVITATION
        if (requestData.inviteeId) {
          const [inviteeData] = await db
            .select()
            .from(users)
            .where(eq(users.id, requestData.inviteeId));
          invitee = inviteeData;
        }

        // Get sender
        const [senderData] = await db
          .select()
          .from(users)
          .where(eq(users.id, requestData.senderId));
        sender = senderData;

        enrichedRequests.push({
          ...requestData,
          requester,
          invitee,
          sender
        });
      }

      return enrichedRequests;
    } catch (error) {
      console.error('Error getting collaboration requests for user:', error);
      return [];
    }
  }

  // Keep the original method for backward compatibility
  async getCollaborationRequests(projectId: string): Promise<(CollaborationRequest & { requester?: User; invitee?: User; sender: User })[]> {
    try {
      const requests = await db
        .select()
        .from(collaborationRequests)
        .leftJoin(users, eq(collaborationRequests.requesterId, users.id))
        .where(eq(collaborationRequests.projectId, projectId))
        .orderBy(desc(collaborationRequests.createdAt));

      const enrichedRequests = [];
      for (const request of requests) {
        const requestData = request.collaboration_requests;
        let requester, invitee, sender;

        // Get requester if this is a REQUEST
        if (requestData.requesterId) {
          const [requesterData] = await db
            .select()
            .from(users)
            .where(eq(users.id, requestData.requesterId));
          requester = requesterData;
        }

        // Get invitee if this is an INVITATION
        if (requestData.inviteeId) {
          const [inviteeData] = await db
            .select()
            .from(users)
            .where(eq(users.id, requestData.inviteeId));
          invitee = inviteeData;
        }

        // Get sender
        const [senderData] = await db
          .select()
          .from(users)
          .where(eq(users.id, requestData.senderId));
        sender = senderData;

        enrichedRequests.push({
          ...requestData,
          requester,
          invitee,
          sender
        });
      }

      return enrichedRequests;
    } catch (error) {
      console.error('Error getting collaboration requests:', error);
      return [];
    }
  }

  async getUserInvitations(userId: string): Promise<(CollaborationRequest & { project: Project; sender: User })[]> {
    try {
      const invitations = await db
        .select({
          request: collaborationRequests,
          project: projects,
          sender: users
        })
        .from(collaborationRequests)
        .innerJoin(projects, eq(collaborationRequests.projectId, projects.id))
        .innerJoin(users, eq(collaborationRequests.senderId, users.id))
        .where(
          and(
            eq(collaborationRequests.inviteeId, userId),
            eq(collaborationRequests.type, "INVITATION"),
            eq(collaborationRequests.status, "PENDING")
          )
        )
        .orderBy(desc(collaborationRequests.createdAt));

      return invitations.map(result => ({
        ...result.request,
        project: result.project,
        sender: result.sender
      }));
    } catch (error) {
      console.error('Error getting user invitations:', error);
      return [];
    }
  }

  async getOwnerCollaborationRequests(ownerId: string): Promise<(CollaborationRequest & { project: Project; requester: User })[]> {
    try {
      const requests = await db
        .select({
          request: collaborationRequests,
          project: projects,
          requester: users
        })
        .from(collaborationRequests)
        .innerJoin(projects, eq(collaborationRequests.projectId, projects.id))
        .innerJoin(users, eq(collaborationRequests.requesterId, users.id))
        .where(
          and(
            eq(projects.ownerId, ownerId),
            eq(collaborationRequests.type, "REQUEST"),
            eq(collaborationRequests.status, "PENDING")
          )
        )
        .orderBy(desc(collaborationRequests.createdAt));

      return requests.map(result => ({
        ...result.request,
        project: result.project,
        requester: result.requester
      }));
    } catch (error) {
      console.error('Error getting owner collaboration requests:', error);
      return [];
    }
  }

  async respondToCollaborationRequest(requestId: string, status: 'APPROVED' | 'REJECTED', reviewerId: string): Promise<CollaborationRequest | undefined> {
    try {
      console.log(`🔍 Processing collaboration response: ${requestId} -> ${status} by user ${reviewerId}`);
      
      // Get the request details first
      const [existingRequest] = await db
        .select()
        .from(collaborationRequests)
        .where(eq(collaborationRequests.id, requestId));

      if (!existingRequest) {
        console.error(`❌ Collaboration request not found: ${requestId}`);
        throw new Error('Collaboration request not found');
      }

      console.log(`📋 Found request:`, {
        type: existingRequest.type,
        status: existingRequest.status,
        requesterId: existingRequest.requesterId,
        inviteeId: existingRequest.inviteeId,
        senderId: existingRequest.senderId
      });

      // Check if already responded
      if (existingRequest.status !== 'PENDING') {
        console.error(`❌ Request already ${existingRequest.status}: ${requestId}`);
        throw new Error(`This collaboration ${existingRequest.type.toLowerCase()} has already been ${existingRequest.status.toLowerCase()}`);
      }

      // Validate permissions based on request type
      if (existingRequest.type === 'REQUEST') {
        // For requests: Only project owner can approve/reject
        const [project] = await db
          .select({ ownerId: projects.ownerId })
          .from(projects)
          .where(eq(projects.id, existingRequest.projectId));
        
        if (!project || project.ownerId !== reviewerId) {
          console.error(`❌ Permission denied: User ${reviewerId} cannot respond to REQUEST from project owned by ${project?.ownerId}`);
          throw new Error('Only project owner can respond to collaboration requests');
        }
      } else if (existingRequest.type === 'INVITATION') {
        // For invitations: Only the invited user can approve/reject
        if (existingRequest.inviteeId !== reviewerId) {
          console.error(`❌ Permission denied: User ${reviewerId} cannot respond to INVITATION for user ${existingRequest.inviteeId}`);
          throw new Error('Only the invited user can respond to this invitation');
        }
      }

      console.log(`✅ Permission check passed for ${existingRequest.type}`);

      const [updatedRequest] = await db
        .update(collaborationRequests)
        .set({
          status,
          respondedAt: new Date()
        })
        .where(eq(collaborationRequests.id, requestId))
        .returning();

      if (!updatedRequest) {
        console.error(`❌ Failed to update collaboration request: ${requestId}`);
        throw new Error('Failed to update collaboration request');
      }

      console.log(`✅ Request status updated to ${status}`);

      // If approved, add as collaborator
      if (status === 'APPROVED' && updatedRequest) {
        // For requests: add the requester
        // For invitations: add the invitee
        const collaboratorId = existingRequest.type === 'REQUEST' 
          ? existingRequest.requesterId 
          : existingRequest.inviteeId;
        
        if (collaboratorId) {
          await this.addCollaborator(updatedRequest.projectId, collaboratorId);
          console.log(`✅ Collaboration ${existingRequest.type.toLowerCase()} ${requestId} approved - user added as collaborator`);
        } else {
          console.error(`❌ No collaborator ID found for ${existingRequest.type}`);
        }
      } else {
        console.log(`❌ Collaboration ${existingRequest.type.toLowerCase()} ${requestId} rejected`);
      }

      return updatedRequest;
    } catch (error) {
      console.error('❌ Error in respondToCollaborationRequest:', {
        requestId,
        status,
        reviewerId,
        error: error instanceof Error ? error.message : error
      });
      throw error; // Re-throw the error instead of returning undefined
    }
  }

  async addCollaboratorByEmail(projectId: string, email: string, ownerId: string): Promise<void> {
    try {
      // Find user by email
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('User with this email not found');
      }

      // Check if already a collaborator
      const existing = await db
        .select()
        .from(projectCollaborators)
        .where(and(
          eq(projectCollaborators.projectId, projectId),
          eq(projectCollaborators.userId, user.id)
        ))
        .limit(1);

      if (existing.length === 0) {
        await this.addCollaborator(projectId, user.id);
        console.log(`👥 User ${user.email} added as collaborator to project ${projectId}`);
      }
    } catch (error) {
      console.error('Error adding collaborator by email:', error);
      throw error;
    }
  }

  // Repository file management
  async createRepositoryItem(item: InsertProjectRepositoryItem): Promise<ProjectRepositoryItem> {
    try {
      const [newItem] = await db
        .insert(projectRepository)
        .values(item)
        .returning();
      
      console.log(`📁 Repository item created: ${newItem.path}/${newItem.name}`);
      return newItem;
    } catch (error) {
      console.error('Error creating repository item:', error);
      throw error;
    }
  }

  async updateRepositoryItem(id: string, updates: Partial<InsertProjectRepositoryItem>): Promise<ProjectRepositoryItem | undefined> {
    try {
      const [updated] = await db
        .update(projectRepository)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(projectRepository.id, id))
        .returning();
      
      console.log(`📝 Repository item updated: ${id}`);
      return updated;
    } catch (error) {
      console.error('Error updating repository item:', error);
      return undefined;
    }
  }

  async deleteRepositoryItem(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(projectRepository)
        .where(eq(projectRepository.id, id));
      
      console.log(`🗑️ Repository item deleted: ${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting repository item:', error);
      return false;
    }
  }

  async getRepositoryStructure(projectId: string): Promise<ProjectRepositoryItem[]> {
    try {
      const items = await db
        .select()
        .from(projectRepository)
        .where(eq(projectRepository.projectId, projectId))
        .orderBy(projectRepository.path, projectRepository.name);

      console.log(`📂 Retrieved ${items.length} repository items for project ${projectId}`);
      return items;
    } catch (error) {
      console.error('Error getting repository structure:', error);
      return [];
    }
  }

  // Change request system for collaboration
  async createChangeRequest(request: InsertProjectChangeRequest): Promise<ProjectChangeRequest> {
    try {
      const [newRequest] = await db
        .insert(projectChangeRequests)
        .values(request)
        .returning();
      
      console.log(`🔄 Change request created: ${newRequest.title} for project ${newRequest.projectId}`);
      return newRequest;
    } catch (error) {
      console.error('Error creating change request:', error);
      throw error;
    }
  }

  async getChangeRequests(projectId: string): Promise<(ProjectChangeRequest & { requester: User; reviewer?: User })[]> {
    try {
      const requests = await db
        .select()
        .from(projectChangeRequests)
        .innerJoin(users, eq(projectChangeRequests.requesterId, users.id))
        .leftJoin(
          users as any,
          eq(projectChangeRequests.reviewedBy, users.id)
        )
        .where(eq(projectChangeRequests.projectId, projectId))
        .orderBy(desc(projectChangeRequests.createdAt));

      return requests.map(result => ({
        ...result.project_change_requests,
        requester: result.users,
        reviewer: undefined
      }));
    } catch (error) {
      console.error('Error getting change requests:', error);
      return [];
    }
  }

  async reviewChangeRequest(requestId: string, status: 'APPROVED' | 'REJECTED' | 'MERGED', reviewerId: string): Promise<ProjectChangeRequest | undefined> {
    try {
      const [updatedRequest] = await db
        .update(projectChangeRequests)
        .set({
          status,
          reviewedBy: reviewerId,
          updatedAt: new Date()
        })
        .where(eq(projectChangeRequests.id, requestId))
        .returning();

      console.log(`📋 Change request ${requestId} ${status} by reviewer ${reviewerId}`);
      return updatedRequest;
    } catch (error) {
      console.error('Error reviewing change request:', error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();