import { 
  type User, 
  type InsertUser, 
  type Project, 
  type InsertProject, 
  type Comment, 
  type InsertComment, 
  type FacultyAssignment, 
  type ProjectCollaborator, 
  type ProjectStar,
  users,
  projects,
  projectCollaborators,
  projectStars,
  comments,
  facultyAssignments,
  collegeDomains
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq, and, or, ilike, desc, count, sql } from "drizzle-orm";

// Extended types for frontend use
export type ProjectWithDetails = Project & {
  owner: User;
  collaborators: User[];
  starCount: number;
  commentCount: number;
  isStarred?: boolean;
  assignment?: FacultyAssignment;
};

export type DashboardStats = {
  totalProjects: number;
  inReview: number;
  approved: number;
  collaborators: number;
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
  getComments(projectId: string): Promise<(Comment & { user: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Faculty assignment operations
  assignProjectToFaculty(projectId: string, facultyId: string): Promise<FacultyAssignment>;
  getFacultyAssignments(facultyId: string): Promise<(FacultyAssignment & { project: ProjectWithDetails })[]>;
  submitReview(assignmentId: string, grade: string, feedback: string): Promise<FacultyAssignment | undefined>;

  // Dashboard statistics
  getDashboardStats(userId: string, role: string): Promise<DashboardStats>;

  // College domain operations
  getCollegeDomains(): Promise<any[]>;
  getCollegeDomainByDomain(domain: string): Promise<any | undefined>;
  getCollegeDomainById(id: string): Promise<any | undefined>;
  createCollegeDomain(data: { collegeName: string; domain: string; adminId: string }): Promise<any>;
  verifyCollegeDomain(domain: string): Promise<boolean>;
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
        return await tx.insert(users).values({
          ...insertUser,
          password: hashedPassword,
          isVerified: insertUser.role === 'ADMIN' ? true : false, // Auto-verify admin users
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
      return await db.select().from(users).where(eq(users.institution, institution));
    } catch (error) {
      console.error('Error getting users by institution:', error);
      return [];
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
        .from(comments)
        .where(eq(comments.projectId, id));
      
      const commentCount = commentResults[0]?.count || 0;

      // Get faculty assignment
      const assignmentResults = await db
        .select()
        .from(facultyAssignments)
        .where(eq(facultyAssignments.projectId, id))
        .limit(1);
      
      const assignment = assignmentResults[0] || undefined;

      return {
        ...project,
        owner,
        collaborators,
        starCount,
        commentCount,
        isStarred,
        assignment
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
          .from(comments)
          .where(eq(comments.projectId, project.id));
        
        const commentCount = commentResults[0]?.count || 0;

        // Get faculty assignment
        const assignmentResults = await db
          .select()
          .from(facultyAssignments)
          .where(eq(facultyAssignments.projectId, project.id))
          .limit(1);
        
        const assignment = assignmentResults[0] || undefined;

        projectsWithDetails.push({
          ...project,
          owner,
          collaborators,
          starCount,
          commentCount,
          isStarred: false, // Will be set per user context
          assignment
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
      const result = await db.insert(projects).values(project).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating project:', error);
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
          .from(comments)
          .where(eq(comments.projectId, project.id));
        
        const commentCount = commentResults[0]?.count || 0;

        // Get faculty assignment
        const assignmentResults = await db
          .select()
          .from(facultyAssignments)
          .where(eq(facultyAssignments.projectId, project.id))
          .limit(1);
        
        const assignment = assignmentResults[0] || undefined;

        projectsWithDetails.push({
          ...project,
          owner,
          collaborators,
          starCount,
          commentCount,
          isStarred: true,
          assignment
        });
      }

      return projectsWithDetails;
    } catch (error) {
      console.error('Error getting starred projects:', error);
      return [];
    }
  }

  // Comment operations
  async getComments(projectId: string): Promise<(Comment & { user: User })[]> {
    try {
      const results = await db
        .select()
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.projectId, projectId))
        .orderBy(desc(comments.createdAt));
      
      return results.map(result => ({
        ...result.comments,
        user: result.users
      }));
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    try {
      const result = await db.insert(comments).values(comment).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // Faculty assignment operations
  async assignProjectToFaculty(projectId: string, facultyId: string): Promise<FacultyAssignment> {
    try {
      const result = await db.insert(facultyAssignments).values({
        projectId,
        facultyId,
        reviewStatus: "PENDING"
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error assigning project to faculty:', error);
      throw error;
    }
  }

  async getFacultyAssignments(facultyId: string): Promise<(FacultyAssignment & { project: ProjectWithDetails })[]> {
    try {
      const assignments = await db
        .select()
        .from(facultyAssignments)
        .innerJoin(projects, eq(facultyAssignments.projectId, projects.id))
        .innerJoin(users, eq(projects.ownerId, users.id))
        .where(eq(facultyAssignments.facultyId, facultyId));

      const assignmentsWithDetails: (FacultyAssignment & { project: ProjectWithDetails })[] = [];

      for (const result of assignments) {
        const assignment = result.faculty_assignments;
        const project = result.projects;
        const owner = result.users;

        // Get project details
        const projectDetails = await this.getProjectWithDetails(project.id);
        
        if (projectDetails) {
          assignmentsWithDetails.push({
            ...assignment,
            project: projectDetails
          });
        }
      }

      return assignmentsWithDetails;
    } catch (error) {
      console.error('Error getting faculty assignments:', error);
      return [];
    }
  }

  async submitReview(assignmentId: string, grade: string, feedback: string): Promise<FacultyAssignment | undefined> {
    try {
      const result = await db
        .update(facultyAssignments)
        .set({
          grade,
          feedback,
          reviewStatus: "COMPLETED",
          reviewedAt: new Date()
        })
        .where(eq(facultyAssignments.id, assignmentId))
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
      if (role === "STUDENT") {
        // Total projects count
        const totalResults = await db
          .select({ count: count() })
          .from(projects)
          .where(eq(projects.ownerId, userId));
        
        const totalProjects = totalResults[0]?.count || 0;

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
          .from(facultyAssignments)
          .where(eq(facultyAssignments.facultyId, userId));
        
        const totalProjects = totalResults[0]?.count || 0;

        // Pending reviews
        const inReviewResults = await db
          .select({ count: count() })
          .from(facultyAssignments)
          .where(and(
            eq(facultyAssignments.facultyId, userId),
            eq(facultyAssignments.reviewStatus, "PENDING")
          ));
        
        const inReview = inReviewResults[0]?.count || 0;

        // Completed reviews
        const approvedResults = await db
          .select({ count: count() })
          .from(facultyAssignments)
          .where(and(
            eq(facultyAssignments.facultyId, userId),
            eq(facultyAssignments.reviewStatus, "COMPLETED")
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
}

export const storage = new DatabaseStorage();