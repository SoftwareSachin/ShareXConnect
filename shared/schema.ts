import { z } from "zod";
import type { User, Project, Comment, FacultyAssignment, ProjectCollaborator, ProjectStar, ProjectFile } from "@prisma/client";

// Re-export Prisma types for consistency
export type { User, Project, Comment, FacultyAssignment, ProjectCollaborator, ProjectStar, ProjectFile };

// Authentication schemas with robust validation for production use
export const loginSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .max(320, "Email address is too long"),
  password: z.string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .max(320, "Email address is too long"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  confirmPassword: z.string(),
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s-']+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s-']+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  role: z.enum(["STUDENT", "FACULTY", "ADMIN"], {
    required_error: "Please select a role",
  }),
  institution: z.string()
    .min(1, "Institution is required")
    .max(100, "Institution name must be less than 100 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Project schemas
export const insertProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description is too long"),
  category: z.string().min(1, "Category is required"),
  visibility: z.enum(["PRIVATE", "INSTITUTION", "PUBLIC"]),
  status: z.enum(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED"]),
  techStack: z.array(z.string()).default([]),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  demoUrl: z.string().url("Invalid demo URL").optional().or(z.literal("")),
  ownerId: z.string(),
});

export const insertCommentSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  content: z.string().min(1, "Comment content is required").max(1000, "Comment is too long"),
});

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

// Type definitions
export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
