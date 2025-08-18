import { type User, type InsertUser, type Project, type InsertProject, type Comment, type InsertComment, type FacultyAssignment, type InsertFacultyAssignment, type ProjectWithDetails, type DashboardStats, type ProjectCollaborator, type ProjectStar, type ProjectFile } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private comments: Map<string, Comment>;
  private facultyAssignments: Map<string, FacultyAssignment>;
  private projectCollaborators: Map<string, ProjectCollaborator>;
  private projectStars: Map<string, ProjectStar>;
  private projectFiles: Map<string, ProjectFile>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.comments = new Map();
    this.facultyAssignments = new Map();
    this.projectCollaborators = new Map();
    this.projectStars = new Map();
    this.projectFiles = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await this.hashPassword(insertUser.password);
    const user: User = { 
      ...insertUser, 
      id, 
      password: hashedPassword,
      createdAt: new Date(),
      role: insertUser.role as "student" | "faculty" | "admin"
    };
    this.users.set(id, user);
    return user;
  }

  async getUsersByInstitution(institution: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.institution === institution);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectWithDetails(id: string, userId?: string): Promise<ProjectWithDetails | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const owner = await this.getUser(project.ownerId);
    if (!owner) return undefined;

    const collaborators = await this.getProjectCollaborators(id);
    const starCount = Array.from(this.projectStars.values())
      .filter(star => star.projectId === id).length;
    const commentCount = Array.from(this.comments.values())
      .filter(comment => comment.projectId === id).length;
    
    let isStarred = false;
    if (userId) {
      isStarred = Array.from(this.projectStars.values())
        .some(star => star.projectId === id && star.userId === userId);
    }

    const assignment = Array.from(this.facultyAssignments.values())
      .find(a => a.projectId === id);

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
    let projects = Array.from(this.projects.values());

    if (filters) {
      if (filters.ownerId) {
        projects = projects.filter(p => p.ownerId === filters.ownerId);
      }
      if (filters.visibility) {
        projects = projects.filter(p => p.visibility === filters.visibility);
      }
      if (filters.status) {
        projects = projects.filter(p => p.status === filters.status);
      }
      if (filters.category) {
        projects = projects.filter(p => p.category === filters.category);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        projects = projects.filter(p => 
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          (p.techStack && p.techStack.some(tech => tech.toLowerCase().includes(search)))
        );
      }
      if (filters.institution) {
        const institutionUsers = await this.getUsersByInstitution(filters.institution);
        const institutionUserIds = new Set(institutionUsers.map(u => u.id));
        projects = projects.filter(p => institutionUserIds.has(p.ownerId));
      }
    }

    const projectDetails = await Promise.all(
      projects.map(p => this.getProjectWithDetails(p.id))
    );

    return projectDetails.filter(p => p !== undefined) as ProjectWithDetails[];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const newProject: Project = { 
      ...project, 
      id, 
      createdAt: now,
      updatedAt: now,
      visibility: project.visibility as "private" | "institution" | "public",
      status: project.status as "draft" | "submitted" | "under_review" | "approved",
      techStack: project.techStack || []
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject: Project = {
      ...project,
      ...updates,
      updatedAt: new Date(),
      visibility: (updates.visibility || project.visibility) as "private" | "institution" | "public",
      status: (updates.status || project.status) as "draft" | "submitted" | "under_review" | "approved",
      techStack: updates.techStack || project.techStack || []
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  async addCollaborator(projectId: string, userId: string): Promise<void> {
    const id = randomUUID();
    const collaborator: ProjectCollaborator = {
      id,
      projectId,
      userId,
      addedAt: new Date()
    };
    this.projectCollaborators.set(id, collaborator);
  }

  async removeCollaborator(projectId: string, userId: string): Promise<void> {
    const collaborators = Array.from(this.projectCollaborators.entries());
    for (const [id, collaborator] of collaborators) {
      if (collaborator.projectId === projectId && collaborator.userId === userId) {
        this.projectCollaborators.delete(id);
        break;
      }
    }
  }

  async getProjectCollaborators(projectId: string): Promise<User[]> {
    const collaboratorIds = Array.from(this.projectCollaborators.values())
      .filter(c => c.projectId === projectId)
      .map(c => c.userId);
    
    const collaborators = await Promise.all(
      collaboratorIds.map(id => this.getUser(id))
    );
    
    return collaborators.filter(u => u !== undefined) as User[];
  }

  async starProject(projectId: string, userId: string): Promise<void> {
    // Check if already starred
    const existing = Array.from(this.projectStars.values())
      .find(star => star.projectId === projectId && star.userId === userId);
    
    if (!existing) {
      const id = randomUUID();
      const star: ProjectStar = {
        id,
        projectId,
        userId,
        createdAt: new Date()
      };
      this.projectStars.set(id, star);
    }
  }

  async unstarProject(projectId: string, userId: string): Promise<void> {
    const stars = Array.from(this.projectStars.entries());
    for (const [id, star] of stars) {
      if (star.projectId === projectId && star.userId === userId) {
        this.projectStars.delete(id);
        break;
      }
    }
  }

  async getStarredProjects(userId: string): Promise<ProjectWithDetails[]> {
    const starredProjectIds = Array.from(this.projectStars.values())
      .filter(star => star.userId === userId)
      .map(star => star.projectId);
    
    const projects = await Promise.all(
      starredProjectIds.map(id => this.getProjectWithDetails(id, userId))
    );
    
    return projects.filter(p => p !== undefined) as ProjectWithDetails[];
  }

  async getComments(projectId: string): Promise<(Comment & { user: User })[]> {
    const comments = Array.from(this.comments.values())
      .filter(comment => comment.projectId === projectId);
    
    const commentsWithUsers = await Promise.all(
      comments.map(async comment => {
        const user = await this.getUser(comment.userId);
        return user ? { ...comment, user } : null;
      })
    );
    
    return commentsWithUsers.filter(c => c !== null) as (Comment & { user: User })[];
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const newComment: Comment = { 
      ...comment, 
      id, 
      createdAt: new Date()
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  async assignProjectToFaculty(projectId: string, facultyId: string): Promise<FacultyAssignment> {
    const id = randomUUID();
    const assignment: FacultyAssignment = {
      id,
      projectId,
      facultyId,
      assignedAt: new Date(),
      reviewStatus: "pending",
      grade: null,
      feedback: null,
      reviewedAt: null
    };
    this.facultyAssignments.set(id, assignment);
    return assignment;
  }

  async getFacultyAssignments(facultyId: string): Promise<(FacultyAssignment & { project: ProjectWithDetails })[]> {
    const assignments = Array.from(this.facultyAssignments.values())
      .filter(assignment => assignment.facultyId === facultyId);
    
    const assignmentsWithProjects = await Promise.all(
      assignments.map(async assignment => {
        const project = await this.getProjectWithDetails(assignment.projectId);
        return project ? { ...assignment, project } : null;
      })
    );
    
    return assignmentsWithProjects.filter(a => a !== null) as (FacultyAssignment & { project: ProjectWithDetails })[];
  }

  async submitReview(assignmentId: string, grade: string, feedback: string): Promise<FacultyAssignment | undefined> {
    const assignment = this.facultyAssignments.get(assignmentId);
    if (!assignment) return undefined;

    const updatedAssignment = {
      ...assignment,
      grade,
      feedback,
      reviewStatus: "completed" as const,
      reviewedAt: new Date()
    };
    this.facultyAssignments.set(assignmentId, updatedAssignment);
    return updatedAssignment;
  }

  async getDashboardStats(userId: string, role: string): Promise<DashboardStats> {
    if (role === "student") {
      const userProjects = Array.from(this.projects.values())
        .filter(p => p.ownerId === userId);
      
      return {
        totalProjects: userProjects.length,
        inReview: userProjects.filter(p => p.status === "under_review").length,
        approved: userProjects.filter(p => p.status === "approved").length,
        collaborators: Array.from(this.projectCollaborators.values())
          .filter(c => userProjects.some(p => p.id === c.projectId)).length
      };
    } else if (role === "faculty") {
      const assignments = Array.from(this.facultyAssignments.values())
        .filter(a => a.facultyId === userId);
      
      return {
        totalProjects: assignments.length,
        inReview: assignments.filter(a => a.reviewStatus === "pending").length,
        approved: assignments.filter(a => a.reviewStatus === "completed").length,
        collaborators: 0
      };
    } else {
      // Admin stats - institution wide
      return {
        totalProjects: this.projects.size,
        inReview: Array.from(this.projects.values()).filter(p => p.status === "under_review").length,
        approved: Array.from(this.projects.values()).filter(p => p.status === "approved").length,
        collaborators: this.users.size
      };
    }
  }
}

export const storage = new MemStorage();
