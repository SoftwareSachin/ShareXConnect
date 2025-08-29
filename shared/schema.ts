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
export const requestStatusEnum = pgEnum("request_status", ["PENDING", "APPROVED", "REJECTED"]);
export const requestTypeEnum = pgEnum("request_type", ["REQUEST", "INVITATION"]);
export const repoItemTypeEnum = pgEnum("repo_item_type", ["FILE", "FOLDER"]);
export const changeTypeEnum = pgEnum("change_type", ["ADD", "MODIFY", "DELETE", "SUGGEST"]);
export const changeStatusEnum = pgEnum("change_status", ["OPEN", "APPROVED", "REJECTED", "MERGED"]);
export const pullRequestStatusEnum = pgEnum("pull_request_status", ["OPEN", "APPROVED", "REJECTED", "MERGED", "DRAFT"]);

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
  department: varchar("department", { length: 100 }), // for faculty
  techExpertise: text("tech_expertise"), // for faculty - comma separated or JSON array of technologies
  // Profile fields
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  bio: text("bio"),
  location: varchar("location", { length: 100 }),
  githubUrl: varchar("github_url", { length: 500 }),
  linkedinUrl: varchar("linkedin_url", { length: 500 }),
  twitterUrl: varchar("twitter_url", { length: 500 }),
  websiteUrl: varchar("website_url", { length: 500 }),
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
  // Academic-specific fields
  academicLevel: varchar("academic_level", { length: 100 }), // Undergraduate, Graduate, PhD, etc.
  department: varchar("department", { length: 100 }),
  courseSubject: varchar("course_subject", { length: 150 }),
  projectMethodology: text("project_methodology"),
  setupInstructions: text("setup_instructions"),
  repositoryUrl: varchar("repository_url", { length: 500 }),
  liveDemoUrl: varchar("live_demo_url", { length: 500 }),
  sourceCodeRepository: text("source_code_repository"),
  documentationReports: text("documentation_reports"),
  imagesAssets: text("images_assets"), // JSON array of image URLs/paths
  // GitHub-like repository fields
  repositoryStructure: text("repository_structure"),
  readmeContent: text("readme_content"),
  licenseType: varchar("license_type", { length: 50 }).default("MIT"),
  contributingGuidelines: text("contributing_guidelines"),
  installationInstructions: text("installation_instructions"),
  apiDocumentation: text("api_documentation"),
  // Star system enhancement
  starCount: integer("star_count").default(0).notNull(),
  // Collaboration settings
  allowsCollaboration: boolean("allows_collaboration").default(true).notNull(),
  requiresApprovalForCollaboration: boolean("requires_approval_for_collaboration").default(true).notNull(),
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
  isFinal: boolean("is_final").default(false).notNull(),
  isReadByStudent: boolean("is_read_by_student").default(false).notNull(),
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
  collaborationRequests: many(collaborationRequests),
  changeRequests: many(projectChangeRequests),
  repositoryModifications: many(projectRepository),
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
  files: many(projectFiles),
  collaborationRequests: many(collaborationRequests),
  repository: many(projectRepository),
  changeRequests: many(projectChangeRequests),
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

// Project files table for uploaded code, documentation, images, etc.
export const projectFiles = pgTable("project_files", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileSize: integer("file_size").notNull(),
  content: text("content"),
  isArchive: boolean("is_archive").default(false),
  archiveContents: text("archive_contents"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, {
    fields: [projectFiles.projectId],
    references: [projects.id],
  }),
}));

// Collaboration requests table - for GitHub-like collaboration workflow
export const collaborationRequests = pgTable("collaboration_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  requesterId: uuid("requester_id").references(() => users.id, { onDelete: "cascade" }), // User requesting to join (nullable for invitations)
  inviteeId: uuid("invitee_id").references(() => users.id, { onDelete: "cascade" }), // User being invited (nullable for requests)
  senderId: uuid("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(), // Person creating the request/invitation
  type: requestTypeEnum("type").default("REQUEST").notNull(), // REQUEST or INVITATION
  message: text("message"),
  status: requestStatusEnum("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

// Project repository structure for GitHub-like file management
export const projectRepository = pgTable("project_repository", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  path: varchar("path", { length: 500 }).notNull(), // file/folder path
  name: varchar("name", { length: 255 }).notNull(),
  type: repoItemTypeEnum("type").notNull(),
  content: text("content"), // file content for code files
  parentId: uuid("parent_id"), // for nested structure - will be self-referencing
  size: integer("size").default(0), // file size in bytes
  language: varchar("language", { length: 50 }), // programming language for syntax highlighting
  lastModifiedBy: uuid("last_modified_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project change requests/suggestions for collaboration
export const projectChangeRequests = pgTable("project_change_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  requesterId: uuid("requester_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  fileId: uuid("file_id").references(() => projectRepository.id), // specific file being changed
  changeType: changeTypeEnum("change_type").notNull(),
  proposedChanges: text("proposed_changes"), // diff or new content
  status: changeStatusEnum("status").default("OPEN").notNull(),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations for new tables
export const collaborationRequestsRelations = relations(collaborationRequests, ({ one }) => ({
  project: one(projects, {
    fields: [collaborationRequests.projectId],
    references: [projects.id],
  }),
  requester: one(users, {
    fields: [collaborationRequests.requesterId],
    references: [users.id],
  }),
  invitee: one(users, {
    fields: [collaborationRequests.inviteeId],
    references: [users.id],
  }),
  sender: one(users, {
    fields: [collaborationRequests.senderId],
    references: [users.id],
  }),
}));

export const projectRepositoryRelations = relations(projectRepository, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectRepository.projectId],
    references: [projects.id],
  }),
  parent: one(projectRepository, {
    fields: [projectRepository.parentId],
    references: [projectRepository.id],
  }),
  children: many(projectRepository),
  lastModifier: one(users, {
    fields: [projectRepository.lastModifiedBy],
    references: [users.id],
  }),
}));

// Project pull requests table for collaboration
export const projectPullRequests = pgTable("project_pull_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  branchName: varchar("branch_name", { length: 100 }).notNull().default("feature-branch"),
  status: pullRequestStatusEnum("status").default("OPEN").notNull(),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  mergedAt: timestamp("merged_at"),
  filesChanged: text("files_changed").array().default([]), // array of file names/paths
  changesPreview: text("changes_preview"), // summary of changes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectChangeRequestsRelations = relations(projectChangeRequests, ({ one }) => ({
  project: one(projects, {
    fields: [projectChangeRequests.projectId],
    references: [projects.id],
  }),
  requester: one(users, {
    fields: [projectChangeRequests.requesterId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [projectChangeRequests.reviewedBy],
    references: [users.id],
  }),
  file: one(projectRepository, {
    fields: [projectChangeRequests.fileId],
    references: [projectRepository.id],
  }),
}));

// Pull request files table for file uploads in PRs
export const pullRequestFiles = pgTable("pull_request_files", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pullRequestId: uuid("pull_request_id").references(() => projectPullRequests.id, { onDelete: "cascade" }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  content: text("content"), // Optional file content for text files
  isArchive: boolean("is_archive").default(false).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const projectPullRequestsRelations = relations(projectPullRequests, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectPullRequests.projectId],
    references: [projects.id],
  }),
  author: one(users, {
    fields: [projectPullRequests.authorId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [projectPullRequests.reviewedBy],
    references: [users.id],
  }),
  files: many(pullRequestFiles),
}));

export const pullRequestFilesRelations = relations(pullRequestFiles, ({ one }) => ({
  pullRequest: one(projectPullRequests, {
    fields: [pullRequestFiles.pullRequestId],
    references: [projectPullRequests.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type ProjectComment = typeof projectComments.$inferSelect;
export type InsertProjectComment = typeof projectComments.$inferInsert;
export type Comment = ProjectComment; // Alias for storage layer compatibility
export type InsertComment = InsertProjectComment; // Alias for storage layer compatibility
export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
export type ProjectStar = typeof projectStars.$inferSelect;
export type ProjectReview = typeof projectReviews.$inferSelect;
export type InsertProjectReview = typeof projectReviews.$inferInsert;
export type FacultyAssignment = ProjectReview; // Alias for storage layer compatibility
export type ProjectFile = typeof projectFiles.$inferSelect;

// Audit log table for tracking important actions
export const auditActionEnum = pgEnum("audit_action", [
  "CREATE", "UPDATE", "DELETE", "VIEW", "LOGIN", "LOGOUT", 
  "UPLOAD", "DOWNLOAD", "COLLABORATE", "REVIEW", "COMMENT"
]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  action: auditActionEnum("action").notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  resourceId: uuid("resource_id"),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type InsertProjectFile = typeof projectFiles.$inferInsert;
export type CollaborationRequest = typeof collaborationRequests.$inferSelect;
export type InsertCollaborationRequest = typeof collaborationRequests.$inferInsert;
export type ProjectRepositoryItem = typeof projectRepository.$inferSelect;
export type InsertProjectRepositoryItem = typeof projectRepository.$inferInsert;
export type ProjectChangeRequest = typeof projectChangeRequests.$inferSelect;
export type InsertProjectChangeRequest = typeof projectChangeRequests.$inferInsert;
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
  // Faculty-specific fields
  department: z.string().optional(), // Required for Faculty role
  techExpertise: z.string().optional(), // Required for Faculty role
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
  if (data.role === "FACULTY" && (!data.department || !data.techExpertise)) {
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
  assignedReviewerId: z.string().optional(),
  // Academic fields
  academicLevel: z.string().optional(),
  department: z.string().optional(),
  courseSubject: z.string().optional(),
  projectMethodology: z.string().optional(),
  setupInstructions: z.string().optional(),
  repositoryUrl: z.string().url("Invalid repository URL").optional().or(z.literal("")),
  liveDemoUrl: z.string().url("Invalid live demo URL").optional().or(z.literal("")),
  sourceCodeRepository: z.string().optional(),
  documentationReports: z.string().optional(),
  imagesAssets: z.string().optional(),
  // GitHub-like repository fields
  repositoryStructure: z.string().optional(),
  readmeContent: z.string().optional(),
  licenseType: z.string().optional(),
  contributingGuidelines: z.string().optional(),
  installationInstructions: z.string().optional(),
  apiDocumentation: z.string().optional(),
});

export const insertCommentSchema = z.object({
  projectId: z.string(),
  authorId: z.string(),
  content: z.string().min(1, "Comment content is required").max(1000, "Comment is too long"),
});

// User profile update schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  location: z.string().max(100, "Location too long").optional(),
  department: z.string().max(100, "Department too long").optional(),
  techExpertise: z.string().optional(),
  profileImageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Invalid website URL").optional().or(z.literal("")),
});

// Extended types for frontend use
export type ProjectWithDetails = Project & {
  owner: User;
  collaborators: User[];
  starCount: number;
  commentCount: number;
  isStarred?: boolean;
  assignment?: ProjectReview;
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
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

// Pull request types
export type ProjectPullRequest = typeof projectPullRequests.$inferSelect;
export type InsertProjectPullRequest = typeof projectPullRequests.$inferInsert;
export type PullRequestFile = typeof pullRequestFiles.$inferSelect;
export type InsertPullRequestFile = typeof pullRequestFiles.$inferInsert;

// Pull request validation schema
export const insertPullRequestSchema = z.object({
  projectId: z.string(),
  authorId: z.string(),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description is too long"),
  branchName: z.string().min(1, "Branch name is required").max(100, "Branch name is too long"),
  filesChanged: z.array(z.string()).default([]),
  changesPreview: z.string().optional(),
});
