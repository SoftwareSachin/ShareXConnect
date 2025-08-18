import { type User, type InsertUser, type Project, type InsertProject, type Comment, type InsertComment, type FacultyAssignment, type ProjectWithDetails, type DashboardStats, type ProjectCollaborator, type ProjectStar, type ProjectFile } from "@shared/schema";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { Role, Visibility, ProjectStatus, ReviewStatus } from "@prisma/client";

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
  // User operations with Prisma
  async getUser(id: string): Promise<User | undefined> {
    try {
      return await db.user.findUnique({
        where: { id }
      }) || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      return await db.user.findUnique({
        where: { email }
      }) || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return await db.user.findUnique({
        where: { username }
      }) || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const hashedPassword = await this.hashPassword(insertUser.password);
      return await db.user.create({
        data: {
          ...insertUser,
          password: hashedPassword
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUsersByInstitution(institution: string): Promise<User[]> {
    try {
      return await db.user.findMany({
        where: { institution }
      });
    } catch (error) {
      console.error('Error getting users by institution:', error);
      return [];
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getProject(id: string): Promise<Project | undefined> {
    try {
      return await db.project.findUnique({
        where: { id }
      }) || undefined;
    } catch (error) {
      console.error('Error getting project:', error);
      return undefined;
    }
  }

  async getProjectWithDetails(id: string, userId?: string): Promise<ProjectWithDetails | undefined> {
    try {
      const project = await db.project.findUnique({
        where: { id },
        include: {
          owner: true,
          collaborators: {
            include: {
              user: true
            }
          },
          stars: true,
          comments: true,
          facultyAssignments: true
        }
      });

      if (!project) return undefined;

      const collaborators = project.collaborators.map(c => c.user);
      const starCount = project.stars.length;
      const commentCount = project.comments.length;
      const isStarred = userId ? project.stars.some(star => star.userId === userId) : false;
      const assignment = project.facultyAssignments[0];

      return {
        ...project,
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
      const where: any = {};

      if (filters) {
        if (filters.ownerId) {
          where.ownerId = filters.ownerId;
        }
        if (filters.visibility) {
          where.visibility = filters.visibility as Visibility;
        }
        if (filters.status) {
          where.status = filters.status as ProjectStatus;
        }
        if (filters.category) {
          where.category = filters.category;
        }
        if (filters.search) {
          where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } }
          ];
        }
        if (filters.institution) {
          where.owner = {
            institution: filters.institution
          };
        }
      }

      const projects = await db.project.findMany({
        where,
        include: {
          owner: true,
          collaborators: {
            include: {
              user: true
            }
          },
          stars: true,
          comments: true,
          facultyAssignments: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return projects.map(project => ({
        ...project,
        collaborators: project.collaborators.map(c => c.user),
        starCount: project.stars.length,
        commentCount: project.comments.length,
        isStarred: false, // This will be set based on current user context
        assignment: project.facultyAssignments[0]
      }));
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      return await db.project.create({
        data: {
          ...project,
          visibility: project.visibility as Visibility,
          status: project.status as ProjectStatus,
        }
      });
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    try {
      const updateData: any = { ...updates };
      if (updates.visibility) {
        updateData.visibility = updates.visibility as Visibility;
      }
      if (updates.status) {
        updateData.status = updates.status as ProjectStatus;
      }
      
      return await db.project.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      console.error('Error updating project:', error);
      return undefined;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      await db.project.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  async addCollaborator(projectId: string, userId: string): Promise<void> {
    try {
      await db.projectCollaborator.create({
        data: {
          projectId,
          userId
        }
      });
    } catch (error) {
      console.error('Error adding collaborator:', error);
      throw error;
    }
  }

  async removeCollaborator(projectId: string, userId: string): Promise<void> {
    try {
      await db.projectCollaborator.deleteMany({
        where: {
          projectId,
          userId
        }
      });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw error;
    }
  }

  async getProjectCollaborators(projectId: string): Promise<User[]> {
    try {
      const collaborators = await db.projectCollaborator.findMany({
        where: { projectId },
        include: { user: true }
      });
      
      return collaborators.map(c => c.user);
    } catch (error) {
      console.error('Error getting project collaborators:', error);
      return [];
    }
  }

  async starProject(projectId: string, userId: string): Promise<void> {
    try {
      // Check if already starred
      const existing = await db.projectStar.findFirst({
        where: {
          projectId,
          userId
        }
      });
      
      if (!existing) {
        await db.projectStar.create({
          data: {
            projectId,
            userId
          }
        });
      }
    } catch (error) {
      console.error('Error starring project:', error);
      throw error;
    }
  }

  async unstarProject(projectId: string, userId: string): Promise<void> {
    try {
      await db.projectStar.deleteMany({
        where: {
          projectId,
          userId
        }
      });
    } catch (error) {
      console.error('Error unstarring project:', error);
      throw error;
    }
  }

  async getStarredProjects(userId: string): Promise<ProjectWithDetails[]> {
    try {
      const starredProjects = await db.projectStar.findMany({
        where: { userId },
        include: {
          project: {
            include: {
              owner: true,
              collaborators: {
                include: {
                  user: true
                }
              },
              stars: true,
              comments: true,
              facultyAssignments: true
            }
          }
        }
      });

      return starredProjects.map(star => ({
        ...star.project,
        collaborators: star.project.collaborators.map(c => c.user),
        starCount: star.project.stars.length,
        commentCount: star.project.comments.length,
        isStarred: true,
        assignment: star.project.facultyAssignments[0]
      }));
    } catch (error) {
      console.error('Error getting starred projects:', error);
      return [];
    }
  }

  async getComments(projectId: string): Promise<(Comment & { user: User })[]> {
    try {
      const comments = await db.comment.findMany({
        where: { projectId },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      });
      
      return comments as (Comment & { user: User })[];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    try {
      return await db.comment.create({
        data: comment
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async assignProjectToFaculty(projectId: string, facultyId: string): Promise<FacultyAssignment> {
    try {
      return await db.facultyAssignment.create({
        data: {
          projectId,
          facultyId,
          reviewStatus: "PENDING"
        }
      });
    } catch (error) {
      console.error('Error assigning project to faculty:', error);
      throw error;
    }
  }

  async getFacultyAssignments(facultyId: string): Promise<(FacultyAssignment & { project: ProjectWithDetails })[]> {
    try {
      const assignments = await db.facultyAssignment.findMany({
        where: { facultyId },
        include: {
          project: {
            include: {
              owner: true,
              collaborators: {
                include: {
                  user: true
                }
              },
              stars: true,
              comments: true,
              facultyAssignments: true
            }
          }
        }
      });
      
      return assignments.map(assignment => ({
        ...assignment,
        project: {
          ...assignment.project,
          collaborators: assignment.project.collaborators.map(c => c.user),
          starCount: assignment.project.stars.length,
          commentCount: assignment.project.comments.length,
          isStarred: false,
          assignment: assignment.project.facultyAssignments[0]
        }
      }));
    } catch (error) {
      console.error('Error getting faculty assignments:', error);
      return [];
    }
  }

  async submitReview(assignmentId: string, grade: string, feedback: string): Promise<FacultyAssignment | undefined> {
    try {
      return await db.facultyAssignment.update({
        where: { id: assignmentId },
        data: {
          grade,
          feedback,
          reviewStatus: "COMPLETED",
          reviewedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      return undefined;
    }
  }

  async getDashboardStats(userId: string, role: string): Promise<DashboardStats> {
    try {
      if (role === "STUDENT") {
        const totalCount = await db.project.count({
          where: { ownerId: userId }
        });
        
        const inReviewCount = await db.project.count({
          where: { 
            ownerId: userId, 
            status: "UNDER_REVIEW" 
          }
        });
        
        const approvedCount = await db.project.count({
          where: { 
            ownerId: userId, 
            status: "APPROVED" 
          }
        });
        
        const collaboratorsCount = await db.projectCollaborator.count({
          where: {
            project: {
              ownerId: userId
            }
          }
        });
        
        return {
          totalProjects: totalCount,
          inReview: inReviewCount,
          approved: approvedCount,
          collaborators: collaboratorsCount
        };
      } else if (role === "FACULTY") {
        const totalCount = await db.facultyAssignment.count({
          where: { facultyId: userId }
        });
        
        const inReviewCount = await db.facultyAssignment.count({
          where: { 
            facultyId: userId, 
            reviewStatus: "PENDING" 
          }
        });
        
        const approvedCount = await db.facultyAssignment.count({
          where: { 
            facultyId: userId, 
            reviewStatus: "COMPLETED" 
          }
        });
        
        return {
          totalProjects: totalCount,
          inReview: inReviewCount,
          approved: approvedCount,
          collaborators: 0
        };
      } else {
        // Admin stats - institution wide
        const totalCount = await db.project.count();
        const inReviewCount = await db.project.count({
          where: { status: "UNDER_REVIEW" }
        });
        const approvedCount = await db.project.count({
          where: { status: "APPROVED" }
        });
        const usersCount = await db.user.count();
        
        return {
          totalProjects: totalCount,
          inReview: inReviewCount,
          approved: approvedCount,
          collaborators: usersCount
        };
      }
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalProjects: 0,
        inReview: 0,
        approved: 0,
        collaborators: 0
      };
    }
  }
}

export const storage = new DatabaseStorage();
