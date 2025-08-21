import { z } from "zod";
import { sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  text,
  timestamp,
  pgEnum,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["STUDENT", "FACULTY", "ADMIN", "GUEST"]);
export const visibilityEnum = pgEnum("visibility", ["PRIVATE", "INSTITUTION", "PUBLIC"]);
export const projectStatusEnum = pgEnum("project_status", ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED"]);
export const reviewStatusEnum = pgEnum("review_status", ["PENDING", "COMPLETED"]);

// College domains table - for verification
export const collegeDomains = pgTable("college_domains", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  collegeName: varchar("college_name", { length: 200 }).notNull(),
  domain: varchar("domain", { length: 100 }).unique().notNull(), // e.g., "@skit.ac.in"
  adminId: uuid("admin_id"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 30 }).unique().notNull(),
  email: varchar("email", { length: 320 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  role: roleEnum("role").notNull(),
  institution: varchar("institution", { length: 100 }).notNull(),
  collegeDomain: varchar("college_domain", { length: 100 }), // for students/faculty verification
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects table
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  visibility: visibilityEnum("visibility").notNull(),
  status: projectStatusEnum("status").notNull(),
  techStack: text("tech_stack").array().default([]),
  githubUrl: varchar("github_url", { length: 500 }),
  demoUrl: varchar("demo_url", { length: 500 }),
  // New GitHub-like repository fields
  repositoryStructure: text("repository_structure"),
  readmeContent: text("readme_content"),
  licenseType: varchar("license_type", { length: 50 }).default("MIT"),
  contributingGuidelines: text("contributing_guidelines"),
  installationInstructions: text("installation_instructions"),
  apiDocumentation: text("api_documentation"),
  ownerId: uuid("owner_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project collaborators table
export const projectCollaborators = pgTable("project_collaborators", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Project stars table
export const projectStars = pgTable("project_stars", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comments table
export const projectComments = pgTable("project_comments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project reviews table
export const projectReviews = pgTable("project_reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: reviewStatusEnum("status").notNull(),
  grade: integer("grade"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  collaborations: many(projectCollaborators),
  stars: many(projectStars),
  comments: many(projectComments),
  reviews: many(projectReviews),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  collaborators: many(projectCollaborators),
  stars: many(projectStars),
  comments: many(projectComments),
  reviews: many(projectReviews),
}));

export const projectCollaboratorsRelations = relations(projectCollaborators, ({ one }) => ({
  project: one(projects, {
    fields: [projectCollaborators.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectCollaborators.userId],
    references: [users.id],
  }),
}));

export const projectStarsRelations = relations(projectStars, ({ one }) => ({
  project: one(projects, {
    fields: [projectStars.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectStars.userId],
    references: [users.id],
  }),
}));

export const projectCommentsRelations = relations(projectComments, ({ one }) => ({
  project: one(projects, {
    fields: [projectComments.projectId],
    references: [projects.id],
  }),
  author: one(users, {
    fields: [projectComments.authorId],
    references: [users.id],
  }),
}));

export const projectReviewsRelations = relations(projectReviews, ({ one }) => ({
  project: one(projects, {
    fields: [projectReviews.projectId],
    references: [projects.id],
  }),
  reviewer: one(users, {
    fields: [projectReviews.reviewerId],
    references: [users.id],
  }),
}));



// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type ProjectComment = typeof projectComments.$inferSelect;
export type InsertProjectComment = typeof projectComments.$inferInsert;
export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
export type ProjectStar = typeof projectStars.$inferSelect;
export type ProjectReview = typeof projectReviews.$inferSelect;
export type InsertProjectReview = typeof projectReviews.$inferInsert;

// Authentication schemas with robust validation for production use
export const loginSchema = z.object({
  usernameOrEmail: z.string()
    .min(1, "Username or email is required")
    .max(320, "Username or email is too long"),
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
  role: z.enum(["STUDENT", "FACULTY", "ADMIN", "GUEST"], {
    required_error: "Please select a role",
  }),
  institution: z.string()
    .min(1, "Institution is required")
    .max(100, "Institution name must be less than 100 characters"),
  collegeDomain: z.string().optional(), // Required for College Admin role
  selectedCollege: z.string().optional(), // Required for Student/Faculty roles
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === "ADMIN" && !data.collegeDomain) {
    return false;
  }
  if ((data.role === "STUDENT" || data.role === "FACULTY") && !data.selectedCollege) {
    return false;
  }
  return true;
}, {
  message: "Please complete all required fields for your selected role",
  path: ["root"],
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
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
