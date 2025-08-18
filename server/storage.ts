import { type User, type InsertUser, type Project, type InsertProject, type Comment, type InsertComment, type FacultyAssignment, type InsertFacultyAssignment, type ProjectWithDetails, type DashboardStats, type ProjectCollaborator, type ProjectStar, type ProjectFile, users, projects, comments, facultyAssignments, projectCollaborators, projectStars, projectFiles } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq, and, like, or, desc, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(insertUser.password);
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword
    }).returning();
    return user;
  }

  async getUsersByInstitution(institution: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.institution, institution));
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectWithDetails(id: string, userId?: string): Promise<ProjectWithDetails | undefined> {
    const project = await this.getProject(id);
    if (!project) return undefined;

    const owner = await this.getUser(project.ownerId);
    if (!owner) return undefined;

    const collaborators = await this.getProjectCollaborators(id);
    
    const [starCountResult] = await db.select({ count: count() })
      .from(projectStars)
      .where(eq(projectStars.projectId, id));
    const starCount = starCountResult?.count || 0;

    const [commentCountResult] = await db.select({ count: count() })
      .from(comments)
      .where(eq(comments.projectId, id));
    const commentCount = commentCountResult?.count || 0;
    
    let isStarred = false;
    if (userId) {
      const [star] = await db.select()
        .from(projectStars)
        .where(and(eq(projectStars.projectId, id), eq(projectStars.userId, userId)));
      isStarred = !!star;
    }

    const [assignment] = await db.select()
      .from(facultyAssignments)
      .where(eq(facultyAssignments.projectId, id));

    return {
      ...project,
      owner,
      collaborators,
      starCount,
      commentCount,
      isStarred,
      assignment
    };
  }

  async getProjects(filters?: { 
    ownerId?: string; 
    visibility?: string; 
    status?: string; 
    category?: string;
    search?: string;
    institution?: string;
  }): Promise<ProjectWithDetails[]> {
    let query = db.select().from(projects).$dynamic();

    if (filters) {
      if (filters.ownerId) {
        query = query.where(eq(projects.ownerId, filters.ownerId));
      }
      if (filters.visibility) {
        query = query.where(eq(projects.visibility, filters.visibility));
      }
      if (filters.status) {
        query = query.where(eq(projects.status, filters.status));
      }
      if (filters.category) {
        query = query.where(eq(projects.category, filters.category));
      }
      if (filters.search) {
        const search = `%${filters.search.toLowerCase()}%`;
        query = query.where(
          or(
            like(projects.title, search),
            like(projects.description, search)
          )
        );
      }
    }

    const projectsList = await query.orderBy(desc(projects.createdAt));

    const projectDetails = await Promise.all(
      projectsList.map(p => this.getProjectWithDetails(p.id))
    );

    return projectDetails.filter(p => p !== undefined) as ProjectWithDetails[];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db.update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  async addCollaborator(projectId: string, userId: string): Promise<void> {
    await db.insert(projectCollaborators).values({
      projectId,
      userId
    });
  }

  async removeCollaborator(projectId: string, userId: string): Promise<void> {
    await db.delete(projectCollaborators)
      .where(and(
        eq(projectCollaborators.projectId, projectId),
        eq(projectCollaborators.userId, userId)
      ));
  }

  async getProjectCollaborators(projectId: string): Promise<User[]> {
    const collaborators = await db.select({ user: users })
      .from(projectCollaborators)
      .innerJoin(users, eq(projectCollaborators.userId, users.id))
      .where(eq(projectCollaborators.projectId, projectId));
    
    return collaborators.map(c => c.user);
  }

  async starProject(projectId: string, userId: string): Promise<void> {
    // Check if already starred
    const [existing] = await db.select()
      .from(projectStars)
      .where(and(
        eq(projectStars.projectId, projectId),
        eq(projectStars.userId, userId)
      ));
    
    if (!existing) {
      await db.insert(projectStars).values({
        projectId,
        userId
      });
    }
  }

  async unstarProject(projectId: string, userId: string): Promise<void> {
    await db.delete(projectStars)
      .where(and(
        eq(projectStars.projectId, projectId),
        eq(projectStars.userId, userId)
      ));
  }

  async getStarredProjects(userId: string): Promise<ProjectWithDetails[]> {
    const starredProjects = await db.select({ projectId: projectStars.projectId })
      .from(projectStars)
      .where(eq(projectStars.userId, userId));
    
    const projects = await Promise.all(
      starredProjects.map(star => this.getProjectWithDetails(star.projectId, userId))
    );
    
    return projects.filter(p => p !== undefined) as ProjectWithDetails[];
  }

  async getComments(projectId: string): Promise<(Comment & { user: User })[]> {
    const commentsWithUsers = await db.select({ 
      comment: comments,
      user: users 
    })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.projectId, projectId))
      .orderBy(desc(comments.createdAt));
    
    return commentsWithUsers.map(row => ({ ...row.comment, user: row.user }));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async assignProjectToFaculty(projectId: string, facultyId: string): Promise<FacultyAssignment> {
    const [assignment] = await db.insert(facultyAssignments).values({
      projectId,
      facultyId,
      reviewStatus: "pending"
    }).returning();
    return assignment;
  }

  async getFacultyAssignments(facultyId: string): Promise<(FacultyAssignment & { project: ProjectWithDetails })[]> {
    const assignments = await db.select()
      .from(facultyAssignments)
      .where(eq(facultyAssignments.facultyId, facultyId));
    
    const assignmentsWithProjects = await Promise.all(
      assignments.map(async assignment => {
        const project = await this.getProjectWithDetails(assignment.projectId);
        return project ? { ...assignment, project } : null;
      })
    );
    
    return assignmentsWithProjects.filter(a => a !== null) as (FacultyAssignment & { project: ProjectWithDetails })[];
  }

  async submitReview(assignmentId: string, grade: string, feedback: string): Promise<FacultyAssignment | undefined> {
    const [updatedAssignment] = await db.update(facultyAssignments)
      .set({
        grade,
        feedback,
        reviewStatus: "completed",
        reviewedAt: new Date()
      })
      .where(eq(facultyAssignments.id, assignmentId))
      .returning();
    
    return updatedAssignment;
  }

  async getDashboardStats(userId: string, role: string): Promise<DashboardStats> {
    if (role === "student") {
      const [totalCount] = await db.select({ count: count() })
        .from(projects)
        .where(eq(projects.ownerId, userId));
      
      const [inReviewCount] = await db.select({ count: count() })
        .from(projects)
        .where(and(eq(projects.ownerId, userId), eq(projects.status, "under_review")));
      
      const [approvedCount] = await db.select({ count: count() })
        .from(projects)
        .where(and(eq(projects.ownerId, userId), eq(projects.status, "approved")));
      
      const [collaboratorsCount] = await db.select({ count: count() })
        .from(projectCollaborators)
        .innerJoin(projects, eq(projectCollaborators.projectId, projects.id))
        .where(eq(projects.ownerId, userId));
      
      return {
        totalProjects: totalCount?.count || 0,
        inReview: inReviewCount?.count || 0,
        approved: approvedCount?.count || 0,
        collaborators: collaboratorsCount?.count || 0
      };
    } else if (role === "faculty") {
      const [totalCount] = await db.select({ count: count() })
        .from(facultyAssignments)
        .where(eq(facultyAssignments.facultyId, userId));
      
      const [inReviewCount] = await db.select({ count: count() })
        .from(facultyAssignments)
        .where(and(eq(facultyAssignments.facultyId, userId), eq(facultyAssignments.reviewStatus, "pending")));
      
      const [approvedCount] = await db.select({ count: count() })
        .from(facultyAssignments)
        .where(and(eq(facultyAssignments.facultyId, userId), eq(facultyAssignments.reviewStatus, "completed")));
      
      return {
        totalProjects: totalCount?.count || 0,
        inReview: inReviewCount?.count || 0,
        approved: approvedCount?.count || 0,
        collaborators: 0
      };
    } else {
      // Admin stats - institution wide
      const [totalCount] = await db.select({ count: count() }).from(projects);
      const [inReviewCount] = await db.select({ count: count() })
        .from(projects)
        .where(eq(projects.status, "under_review"));
      const [approvedCount] = await db.select({ count: count() })
        .from(projects)
        .where(eq(projects.status, "approved"));
      const [usersCount] = await db.select({ count: count() }).from(users);
      
      return {
        totalProjects: totalCount?.count || 0,
        inReview: inReviewCount?.count || 0,
        approved: approvedCount?.count || 0,
        collaborators: usersCount?.count || 0
      };
    }
  }
}

export const storage = new DatabaseStorage();
