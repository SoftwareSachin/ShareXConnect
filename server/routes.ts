import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import multer from "multer";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertProjectSchema, insertCommentSchema, updateProfileSchema, type User, projectCollaborators, insertPullRequestSchema, type ProjectPullRequest } from "@shared/schema";
import { db } from "./database/connection";
import { eq } from "drizzle-orm";
import { 
  requireAdmin, 
  validateParams, 
  adminRateLimit, 
  auditLog 
} from "./middleware/roleValidation";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

interface AuthRequest extends Request {
  user: User;
}

// Use a secure JWT secret - in production this should be a long, random string
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secure-jwt-secret-key-change-this-in-production-minimum-32-characters";
const upload = multer({ dest: "uploads/" });

// Middleware for JWT authentication
const authenticateToken = async (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Authentication check:', {
    url: req.url,
    method: req.method,
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    authHeaderType: authHeader ? authHeader.split(' ')[0] : 'none'
  });

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: "Authentication token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      console.log('❌ User not found for token:', decoded.userId);
      return res.status(401).json({ message: "Invalid token" });
    }
    console.log('✅ Authentication successful for user:', user.id);
    req.user = user;
    next();
  } catch (err) {
    console.log('❌ Token verification failed:', err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Type-safe authentication middleware wrapper
const withAuth = (handler: (req: AuthRequest, res: Response) => Promise<any>) => {
  return async (req: Request, res: Response) => {
    // The authenticateToken middleware should have already set req.user
    return handler(req as AuthRequest, res);
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // College API endpoints
  app.get("/api/colleges", async (req, res) => {
    try {
      const colleges = await storage.getCollegeDomains();
      res.json(colleges);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      res.status(500).json({ message: "Failed to fetch colleges" });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log('🔄 Registration attempt:', req.body.email, 'Role:', req.body.role);
      const { confirmPassword, ...userData } = registerSchema.parse(req.body);
      
      // Debug: Log the parsed user data
      console.log('📋 Parsed user data:', {
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      
      // Enhanced duplicate checking with better error messages
      const [existingUser, existingUsername] = await Promise.all([
        storage.getUserByEmail(userData.email),
        storage.getUserByUsername(userData.username)
      ]);
      
      if (existingUser) {
        console.log('❌ Registration failed: Email already exists -', userData.email);
        return res.status(400).json({ message: "Email already registered" });
      }

      if (existingUsername) {
        console.log('❌ Registration failed: Username taken -', userData.username);
        return res.status(400).json({ message: "Username already taken" });
      }

      // College domain verification for different roles
      if (userData.role === "ADMIN") {
        // College Admin must provide college domain
        if (!userData.collegeDomain) {
          return res.status(400).json({ message: "College domain is required for College Admin role" });
        }

        // Check if college domain already exists
        const existingDomain = await storage.getCollegeDomainByDomain(userData.collegeDomain);
        if (existingDomain) {
          return res.status(400).json({ message: "College domain already registered by another admin" });
        }

        // Create user first
        const user = await storage.createUser({
          ...userData,
          isVerified: true // Admin is auto-verified
        });

        // Create college domain entry
        await storage.createCollegeDomain({
          collegeName: userData.institution,
          domain: userData.collegeDomain,
          adminId: user.id
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
        
      } else if (userData.role === "STUDENT" || userData.role === "FACULTY") {
        // Students and Faculty must select from registered colleges
        if (!userData.selectedCollege) {
          return res.status(400).json({ message: "Please select your college from the list" });
        }

        // Get the college details by ID
        const college = await storage.getCollegeDomainById(userData.selectedCollege);
        if (!college) {
          return res.status(400).json({ message: "Selected college not found or not verified" });
        }

        // Verify email domain matches the selected college
        const emailDomain = "@" + userData.email.split("@")[1];
        if (emailDomain !== college.domain) {
          return res.status(400).json({ 
            message: `Your email domain (${emailDomain}) doesn't match the selected college domain (${college.domain}). Please use an email from your college domain.` 
          });
        }

        // Create user with college verification
        const user = await storage.createUser({
          ...userData,
          collegeDomain: college.domain,
          institution: college.collegeName,
          isVerified: false // Will be verified by admin later
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
        
      } else {
        // Guest users can register without domain verification
        const user = await storage.createUser({
          ...userData,
          isVerified: true // Guest users are auto-verified
        });
        
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { usernameOrEmail, password } = loginSchema.parse(req.body);
      
      // Try to find user by email first, then by username
      let user = await storage.getUserByEmail(usernameOrEmail);
      if (!user) {
        user = await storage.getUserByUsername(usernameOrEmail);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Profile management endpoints
  // Get current user profile
  app.get("/api/profile", authenticateToken, withAuth(async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  }));

  // Update user profile
  app.put("/api/profile", authenticateToken, withAuth(async (req: AuthRequest, res: Response) => {
    try {
      const profileData = updateProfileSchema.parse(req.body);
      
      const updatedUser = await storage.updateUserProfile(req.user.id, profileData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userProfile } = updatedUser;
      res.json({ 
        message: "Profile updated successfully", 
        user: userProfile 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid profile data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  }));

  app.get("/api/auth/me", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  }));

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user.id, req.user.role);
      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Recent activity endpoint for dashboard
  app.get("/api/dashboard/activity", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getRecentActivity(req.user.id, req.user.role, limit);
      res.json(activities);
    } catch (error) {
      console.error('Recent activity error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));


  // Project routes
  app.get("/api/projects", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { visibility, status, category, search, my, department, techStack } = req.query;
      
      let filters: any = {};
      
      if (my === "true") {
        filters.ownerId = req.user!.id;
        filters.includeCollaborations = true;
      } else {
        // Enhanced role-based filtering logic
        const userRole = req.user!.role;
        const userInstitution = req.user!.institution;
        
        // Apply visibility filters based on user role and permissions
        if (visibility && visibility !== "all") {
          // User specifically requested a visibility filter
          if (userRole === "ADMIN") {
            // Admin can see all projects of specified visibility
            filters.visibility = visibility;
          } else if (userRole === "FACULTY") {
            // Faculty can see PUBLIC, INSTITUTION, and PRIVATE projects from their institution
            if (visibility === "PRIVATE") {
              // For private projects, faculty can see their own + those assigned to them
              const projects = await storage.getProjects();
              const filteredProjects = projects.filter(p => {
                if (p.visibility !== "PRIVATE") return false;
                return p.ownerId === req.user!.id || 
                       p.owner.institution === userInstitution;
              });
              return res.json(filteredProjects);
            } else {
              filters.visibility = visibility;
              if (visibility === "INSTITUTION") {
                filters.institution = userInstitution;
              }
            }
          } else if (userRole === "STUDENT") {
            // Students can see PUBLIC and INSTITUTION projects from their institution
            if (visibility === "PRIVATE") {
              // Students can only see their own private projects
              filters.visibility = visibility;
              filters.ownerId = req.user!.id;
            } else {
              filters.visibility = visibility;
              if (visibility === "INSTITUTION") {
                filters.institution = userInstitution;
              }
            }
          } else {
            // GUEST - only PUBLIC projects
            filters.visibility = "PUBLIC";
          }
        } else {
          // No specific visibility filter - show appropriate defaults based on role
          const projects = await storage.getProjects();
          const filteredProjects = projects.filter(p => {
            if (userRole === "ADMIN") {
              // Admin sees all projects from their institution
              return p.owner.institution === userInstitution;
            } else if (userRole === "FACULTY") {
              // Faculty see: PUBLIC + INSTITUTION from their institution + PRIVATE they own or review
              return p.visibility === "PUBLIC" || 
                     (p.visibility === "INSTITUTION" && p.owner.institution === userInstitution) ||
                     (p.visibility === "PRIVATE" && p.ownerId === req.user!.id);
            } else if (userRole === "STUDENT") {
              // Students see: PUBLIC + INSTITUTION from their institution + their own PRIVATE
              return p.visibility === "PUBLIC" || 
                     (p.visibility === "INSTITUTION" && p.owner.institution === userInstitution) ||
                     (p.visibility === "PRIVATE" && p.ownerId === req.user!.id);
            } else {
              // GUEST - only PUBLIC projects
              return p.visibility === "PUBLIC";
            }
          });
          
          // Apply additional filters to the pre-filtered projects
          let finalProjects = filteredProjects;
          if (status) finalProjects = finalProjects.filter(p => p.status === status);
          if (category) finalProjects = finalProjects.filter(p => p.category === category);
          if (department) finalProjects = finalProjects.filter(p => p.department === department);
          if (techStack) {
            const techArray = (techStack as string).split(',');
            finalProjects = finalProjects.filter(p => 
              p.techStack && p.techStack.length > 0 && techArray.some(tech => p.techStack!.includes(tech))
            );
          }
          if (search) {
            const searchLower = (search as string).toLowerCase();
            finalProjects = finalProjects.filter(p => 
              p.title.toLowerCase().includes(searchLower) ||
              p.description.toLowerCase().includes(searchLower) ||
              p.owner.firstName?.toLowerCase().includes(searchLower) ||
              p.owner.lastName?.toLowerCase().includes(searchLower)
            );
          }
          
          return res.json(finalProjects);
        }
      }
      
      // Apply remaining filters
      if (status) filters.status = status;
      if (category) filters.category = category;
      if (department) filters.department = department as string;
      if (techStack) filters.techStack = (techStack as string).split(',');
      if (search) filters.search = search as string;

      const projects = await storage.getProjects(filters);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Collaborative projects endpoint must come before :id route to avoid conflicts
  app.get("/api/projects/collaborations", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const filters = {
        ownerId: req.user!.id,
        collaborationsOnly: true
      };
      
      const projects = await storage.getProjects(filters);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching collaborative projects:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Filter options must come before :id route to avoid conflicts
  app.get("/api/projects/filter-options", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      // Get actual departments from projects
      const departmentsResult = await storage.query(`
        SELECT DISTINCT department 
        FROM projects 
        WHERE department IS NOT NULL AND department != '' 
        ORDER BY department
      `);
      
      // Get actual tech stacks from projects
      const techStackResult = await storage.query(`
        SELECT DISTINCT unnest(tech_stack) as technology 
        FROM projects 
        WHERE tech_stack IS NOT NULL 
        ORDER BY technology
      `);
      
      // Get actual categories from projects
      const categoriesResult = await storage.query(`
        SELECT DISTINCT category 
        FROM projects 
        WHERE category IS NOT NULL AND category != '' 
        ORDER BY category
      `);
      
      res.json({
        departments: departmentsResult.map((row: any) => row.department),
        technologies: techStackResult.map((row: any) => row.technology),
        categories: categoriesResult.map((row: any) => row.category)
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Modified to allow viewing public projects without authentication
  app.get("/api/projects/:id", async (req, res) => {
    try {
      // Try to get authenticated user, but don't require it
      let userId = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          const user = await storage.getUser(decoded.userId);
          if (user) userId = user.id;
        } catch (error) {
          // Token invalid/expired - continue without authentication for public projects
          console.log('🔓 Invalid/expired token, trying public access');
        }
      }

      const project = await storage.getProjectWithDetails(req.params.id, userId || undefined);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check permissions based on project visibility
      if (project.visibility === "PRIVATE") {
        if (!userId || project.ownerId !== userId) {
          // Check if user is a collaborator
          const isCollaborator = project.collaborators.some(collaborator => collaborator.id === userId);
          if (isCollaborator) {
            // Collaborator has access
          } else {
            // Check if user is a faculty member assigned to review this project
            const user = userId ? await storage.getUser(userId) : null;
            if (!user || user.role !== "FACULTY" || !(await storage.isProjectReviewer(project.id, user.id))) {
              return res.status(403).json({ message: "Access denied - Private project" });
            }
          }
        }
      } else if (project.visibility === "INSTITUTION") {
        if (!userId) {
          return res.status(403).json({ message: "Access denied - Institution project requires login" });
        }
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(403).json({ message: "Access denied - Institution project" });
        }
        
        // Allow access if: owner, collaborator, same institution, or faculty reviewer
        const isOwner = project.ownerId === userId;
        const isCollaborator = project.collaborators.some(collaborator => collaborator.id === userId);
        const sameInstitution = project.owner.institution === user.institution;
        const isFacultyReviewer = user.role === "FACULTY" && await storage.isProjectReviewer(project.id, user.id);
        
        if (!isOwner && !isCollaborator && !sameInstitution && !isFacultyReviewer) {
          return res.status(403).json({ message: "Access denied - Institution project" });
        }
      }
      // PUBLIC projects can be viewed by anyone

      console.log(`✅ Project ${project.id} (${project.visibility}) accessed by user: ${userId || 'anonymous'}`);
      res.json(project);
    } catch (error) {
      console.error('❌ Error in project detail endpoint:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/projects", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      console.log(`🚀 Creating project for user: ${req.user!.id} (${req.user!.username})`);
      console.log(`📝 Project data:`, req.body);
      
      const projectData = insertProjectSchema.parse({
        ...req.body,
        ownerId: req.user!.id,
        techStack: req.body.techStack || []
      });
      
      console.log(`✅ Validated project data:`, projectData);
      
      const project = await storage.createProject(projectData);
      console.log(`💾 Project created in database:`, project);
      
      const projectWithDetails = await storage.getProjectWithDetails(project.id, req.user!.id);
      
      console.log(`🔄 PROJECT CREATED SUCCESSFULLY - Dashboard should now show updated stats`);
      console.log(`🎯 Next dashboard request should show increased project count for user ${req.user!.id}`);
      
      res.status(201).json(projectWithDetails);
    } catch (error) {
      console.error('❌ Project creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.patch("/api/projects/:id", async (req: any, res: any) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Skip permission check for simplified editing

      const updates = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(req.params.id, updates);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Return simplified project data without user context
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/projects/:id", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check ownership
      if (project.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Star/unstar projects
  app.post("/api/projects/:id/star", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      await storage.starProject(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.delete("/api/projects/:id/star", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      await storage.unstarProject(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Get starred projects
  app.get("/api/projects/starred/all", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const starredProjects = await storage.getStarredProjects(req.user!.id);
      res.json(starredProjects);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Comments with optional pagination
  app.get("/api/projects/:id/comments", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      // Ensure reasonable limits for performance
      const safeLimit = Math.min(Math.max(limit, 1), 100);
      const safeOffset = Math.max(offset, 0);
      
      const comments = await storage.getComments(req.params.id, safeLimit, safeOffset);
      
      res.json({
        comments,
        pagination: {
          limit: safeLimit,
          offset: safeOffset,
          hasMore: comments.length === safeLimit
        }
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.post("/api/projects/:id/comments", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        projectId: req.params.id,
        authorId: req.user!.id
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // GitHub-like collaboration routes
  app.post("/api/projects/:id/collaborate/request", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { message } = req.body;
      const request = await storage.requestCollaboration(req.params.id, req.user!.id, message);
      res.status(201).json(request);
    } catch (error) {
      console.error('Error requesting collaboration:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.get("/api/projects/:id/collaborate/requests", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const requests = await storage.getCollaborationRequestsForUser(req.params.id, req.user!.id);
      res.json(requests);
    } catch (error) {
      console.error('Error fetching collaboration requests:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.post("/api/projects/collaborate/requests/:requestId/respond", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { status } = req.body;
      const { requestId } = req.params;
      const userId = req.user!.id;

      console.log(`🔄 Processing collaboration response:`, {
        requestId,
        status,
        userId,
        userRole: req.user!.role
      });

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        console.log('❌ Invalid status provided:', status);
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const request = await storage.respondToCollaborationRequest(requestId, status, userId);
      
      if (!request) {
        console.log('❌ Request processing failed - no result returned');
        return res.status(400).json({ message: "Failed to respond to invitation. Please check permissions." });
      }

      console.log(`✅ Collaboration response successful:`, {
        requestId: request.id,
        newStatus: request.status
      });

      res.json(request);
    } catch (error) {
      console.error('❌ Error responding to collaboration request:', error);
      res.status(500).json({ 
        message: "Failed to respond to invitation. Please try again.",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }));

  app.post("/api/projects/:id/collaborators/invite", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { email, message } = req.body;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Valid email is required" });
      }
      
      // Find user by email
      const inviteeUser = await storage.getUserByEmail(email);
      if (!inviteeUser) {
        return res.status(404).json({ message: "User with this email not found" });
      }
      
      // Check if already a collaborator
      const isAlreadyCollaborator = await storage.isProjectCollaborator(req.params.id, inviteeUser.id);
      if (isAlreadyCollaborator) {
        return res.status(400).json({ message: "User is already a collaborator on this project" });
      }
      
      // Send invitation
      const invitation = await storage.inviteCollaborator(
        req.params.id, 
        inviteeUser.id, 
        req.user!.id,
        message
      );
      
      res.status(201).json({ 
        message: "Collaboration invitation sent successfully",
        invitation 
      });
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Get user's invitations (invitations sent to them)
  app.get("/api/user/invitations", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const invitations = await storage.getUserInvitations(req.user!.id);
      res.json(invitations);
    } catch (error) {
      console.error('Error fetching user invitations:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Get collaboration requests for project owners (requests sent to their projects)
  app.get("/api/owner/collaboration-requests", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const requests = await storage.getOwnerCollaborationRequests(req.user!.id);
      res.json(requests);
    } catch (error) {
      console.error('Error fetching owner collaboration requests:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Repository management routes
  app.get("/api/projects/:id/repository", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const structure = await storage.getRepositoryStructure(req.params.id);
      res.json(structure);
    } catch (error) {
      console.error('Error fetching repository structure:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.post("/api/projects/:id/repository/items", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const itemData = {
        ...req.body,
        projectId: req.params.id,
        lastModifiedBy: req.user!.id
      };
      
      const item = await storage.createRepositoryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error('Error creating repository item:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.put("/api/repository/items/:itemId", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const updates = {
        ...req.body,
        lastModifiedBy: req.user!.id
      };
      
      const item = await storage.updateRepositoryItem(req.params.itemId, updates);
      if (!item) {
        return res.status(404).json({ message: "Repository item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error('Error updating repository item:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.delete("/api/repository/items/:itemId", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteRepositoryItem(req.params.itemId);
      if (!success) {
        return res.status(404).json({ message: "Repository item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting repository item:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Change request routes for collaboration
  app.get("/api/projects/:id/change-requests", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const requests = await storage.getChangeRequests(req.params.id);
      res.json(requests);
    } catch (error) {
      console.error('Error fetching change requests:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.post("/api/projects/:id/change-requests", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const requestData = {
        ...req.body,
        projectId: req.params.id,
        requesterId: req.user!.id
      };
      
      const request = await storage.createChangeRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error('Error creating change request:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.post("/api/change-requests/:requestId/review", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { status } = req.body;
      if (!['APPROVED', 'REJECTED', 'MERGED'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const request = await storage.reviewChangeRequest(req.params.requestId, status, req.user!.id);
      if (!request) {
        return res.status(404).json({ message: "Change request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error('Error reviewing change request:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Faculty assignment routes
  app.post("/api/projects/:id/assign", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { facultyId } = req.body;
      
      // Verify the faculty member exists and is faculty
      const faculty = await storage.getUser(facultyId);
      if (!faculty || faculty.role !== "FACULTY") {
        return res.status(400).json({ message: "Invalid faculty member" });
      }

      const assignment = await storage.assignProjectToReviewer(req.params.id, facultyId);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Student route to assign their project to faculty
  app.post("/api/projects/:id/assign-faculty", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { facultyId } = req.body;
      const projectId = req.params.id;
      
      // Verify the project exists and belongs to the student
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Only project owner or students can assign faculty
      if (project.ownerId !== req.user!.id && req.user!.role !== "STUDENT") {
        return res.status(403).json({ message: "You can only assign faculty to your own projects" });
      }

      // Verify the faculty member exists and is faculty
      const faculty = await storage.getUser(facultyId);
      if (!faculty || faculty.role !== "FACULTY") {
        return res.status(400).json({ message: "Invalid faculty member selected" });
      }

      // Check if faculty is from same institution
      if (faculty.institution !== req.user!.institution) {
        return res.status(400).json({ message: "You can only assign faculty from your institution" });
      }

      const assignment = await storage.assignProjectToReviewer(projectId, facultyId);
      res.status(201).json({
        message: "Project successfully assigned to faculty for review",
        assignment,
        facultyName: `${faculty.firstName} ${faculty.lastName}`
      });
    } catch (error) {
      console.error('Error assigning project to faculty:', error);
      res.status(500).json({ message: "Failed to assign project to faculty" });
    }
  }));

  // Get faculty members for student assignment (filtered by college domain, department, and tech expertise)
  app.get("/api/users/faculty", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { department, techExpertise, limit = "20" } = req.query;
      
      // Input validation
      const searchLimit = Math.min(parseInt(limit as string) || 20, 100); // Max 100 results
      
      // Get the current user's college domain
      const currentUser = req.user!;
      
      // Get all users from the same college domain (not just institution)
      const users = await storage.getUsersByInstitution(currentUser.institution);
      
      // Filter for faculty members with the same college domain (all faculty are considered verified within same college)
      let facultyMembers = users.filter(user => 
        user.role === "FACULTY" && 
        user.collegeDomain === currentUser.collegeDomain
      );
      
      // Advanced department filtering with fuzzy matching
      if (department && typeof department === 'string') {
        const deptSearch = department.toLowerCase().trim();
        if (deptSearch.length > 0) {
          facultyMembers = facultyMembers.filter(faculty => {
            if (!faculty.department || faculty.department === 'Not specified') return false;
            
            const facultyDept = faculty.department.toLowerCase().trim();
            
            // Exact match, partial match, or keyword matching
            return facultyDept.includes(deptSearch) || 
                   deptSearch.includes(facultyDept) ||
                   // Check for common department abbreviations
                   (deptSearch === 'cs' && facultyDept.includes('computer')) ||
                   (deptSearch === 'ece' && (facultyDept.includes('electrical') || facultyDept.includes('electronics'))) ||
                   (deptSearch === 'me' && facultyDept.includes('mechanical')) ||
                   (deptSearch === 'ce' && facultyDept.includes('civil')) ||
                   (deptSearch === 'it' && facultyDept.includes('information')) ||
                   (deptSearch === 'cse' && (facultyDept.includes('computer science') || facultyDept.includes('computer')));
          });
        }
      }
      
      // Enhanced tech expertise filtering with skill matching
      if (techExpertise && typeof techExpertise === 'string') {
        const searchTechnologies = techExpertise.split(',')
          .map(tech => tech.trim().toLowerCase())
          .filter(tech => tech.length > 0);
        
        if (searchTechnologies.length > 0) {
          facultyMembers = facultyMembers.filter(faculty => {
            if (!faculty.techExpertise || faculty.techExpertise === 'Not specified') return false;
            
            const facultyTechnologies = faculty.techExpertise.toLowerCase()
              .split(',')
              .map(tech => tech.trim())
              .filter(tech => tech.length > 0);
            
            // Enhanced matching: exact match, partial match, or related technology matching
            return searchTechnologies.some(searchTech => {
              if (searchTech.length === 0) return false;
              
              return facultyTechnologies.some(facultyTech => {
                // Direct matches
                if (facultyTech.includes(searchTech) || searchTech.includes(facultyTech)) {
                  return true;
                }
                
                // Technology family matching
                const techFamilies = {
                  'react': ['reactjs', 'next.js', 'nextjs', 'frontend', 'javascript', 'js', 'jsx', 'typescript'],
                  'node': ['nodejs', 'node.js', 'backend', 'javascript', 'js', 'express'],
                  'python': ['django', 'flask', 'fastapi', 'machine learning', 'ai', 'data science', 'ml', 'pandas'],
                  'java': ['spring', 'hibernate', 'android', 'kotlin', 'springboot'],
                  'ml': ['machine learning', 'artificial intelligence', 'ai', 'data science', 'python', 'tensorflow', 'pytorch'],
                  'ai': ['artificial intelligence', 'machine learning', 'ml', 'deep learning', 'python', 'neural networks'],
                  'web': ['html', 'css', 'javascript', 'react', 'angular', 'vue', 'frontend', 'bootstrap'],
                  'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'nosql', 'sqlite'],
                  'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'devops']
                };
                
                // Check if search term relates to faculty expertise through tech families
                for (const [key, relatives] of Object.entries(techFamilies)) {
                  if ((searchTech.includes(key) || key.includes(searchTech)) && 
                      relatives.some(rel => facultyTech.includes(rel))) {
                    return true;
                  }
                  if ((facultyTech.includes(key) || key.includes(facultyTech)) && 
                      relatives.some(rel => searchTech.includes(rel))) {
                    return true;
                  }
                }
                
                return false;
              });
            });
          });
        }
      }
      
      // Sort faculty by relevance (those with more matching criteria first)
      if (department || techExpertise) {
        facultyMembers.sort((a, b) => {
          let scoreA = 0, scoreB = 0;
          
          // Department relevance score
          if (department && typeof department === 'string') {
            const deptSearch = department.toLowerCase();
            if (a.department?.toLowerCase().includes(deptSearch)) scoreA += 2;
            if (b.department?.toLowerCase().includes(deptSearch)) scoreB += 2;
          }
          
          // Tech expertise relevance score
          if (techExpertise && typeof techExpertise === 'string') {
            const searchTechs = techExpertise.split(',').map(t => t.trim().toLowerCase());
            const aMatches = searchTechs.filter(tech => 
              a.techExpertise?.toLowerCase().includes(tech)).length;
            const bMatches = searchTechs.filter(tech => 
              b.techExpertise?.toLowerCase().includes(tech)).length;
            scoreA += aMatches;
            scoreB += bMatches;
          }
          
          return scoreB - scoreA; // Higher scores first
        });
      }
      
      // Remove sensitive information and add additional data
      const safeFacultyData = facultyMembers
        .slice(0, searchLimit)
        .map(faculty => ({
          id: faculty.id,
          firstName: faculty.firstName,
          lastName: faculty.lastName,
          email: faculty.email,
          institution: faculty.institution,
          department: faculty.department || "Not specified",
          techExpertise: faculty.techExpertise || "Not specified",
          isVerified: faculty.isVerified,
        }));
      
      res.json(safeFacultyData);
    } catch (error) {
      console.error('Error fetching faculty members:', error);
      res.status(500).json({ message: "Failed to fetch faculty members" });
    }
  }));

  app.get("/api/faculty/assignments", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "FACULTY") {
        return res.status(403).json({ message: "Access denied" });
      }

      const assignments = await storage.getFacultyAssignments(req.user!.id);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.post("/api/assignments/:id/review", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "FACULTY") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { grade, feedback } = req.body;
      if (!grade || !feedback) {
        return res.status(400).json({ message: "Grade and feedback are required" });
      }

      const assignment = await storage.submitReview(req.params.id, req.user!.id, grade, feedback);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Check if current user is assigned as a reviewer for a project
  app.get("/api/projects/:id/is-reviewer", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "FACULTY") {
        return res.json(false);
      }

      const isReviewer = await storage.isProjectReviewer(req.params.id, req.user!.id);
      res.json(isReviewer);
    } catch (error) {
      console.error('Error checking reviewer status:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Get current review assignment for a project
  app.get("/api/projects/:id/review", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "FACULTY") {
        return res.status(403).json({ message: "Access denied" });
      }

      const assignments = await storage.getFacultyAssignments(req.user!.id);
      const assignment = assignments.find(a => a.project.id === req.params.id);
      
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      res.json(assignment);
    } catch (error) {
      console.error('Error getting review assignment:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Submit project review (POST)
  app.post("/api/projects/:id/review", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "FACULTY") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { grade, feedback, fileGrades, isFinal } = req.body;
      if (!grade || !feedback) {
        return res.status(400).json({ message: "Grade and feedback are required" });
      }

      // Find the review assignment for this project and faculty member
      const assignments = await storage.getFacultyAssignments(req.user!.id);
      const assignment = assignments.find(a => a.project.id === req.params.id);
      
      if (!assignment) {
        return res.status(404).json({ message: "You are not assigned to review this project" });
      }

      // Submit a new review (allows multiple reviews from same faculty)
      const newReview = await storage.submitReview(req.params.id, req.user!.id, grade, feedback, isFinal);
      if (!newReview) {
        return res.status(404).json({ message: "Failed to submit review" });
      }

      // Log the successful review submission
      console.log(`✅ ${isFinal ? 'Final' : 'Regular'} review submitted for project ${req.params.id} by faculty ${req.user!.id}: Grade ${grade}`);

      res.json({
        ...newReview,
        project: assignment.project
      });
    } catch (error) {
      console.error('Error submitting project review:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Get all reviews for a project (for students to see faculty reviews)
  app.get("/api/projects/:id/reviews", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Only allow project owner, faculty, or admin to view reviews
      const isOwner = project.ownerId === req.user!.id;
      const isFacultyOrAdmin = req.user!.role === 'FACULTY' || req.user!.role === 'ADMIN';
      
      if (!isOwner && !isFacultyOrAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get all reviews for this project
      const reviews = await storage.getProjectReviewsForProject(req.params.id);
      
      res.json(reviews);
    } catch (error) {
      console.error('Error getting project reviews:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Mark a review as read by student
  app.post("/api/projects/:projectId/reviews/:reviewId/mark-read", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const project = await storage.getProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Only allow project owner to mark reviews as read
      if (project.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const success = await storage.markReviewAsRead(req.params.reviewId, req.user!.id);
      if (success) {
        res.json({ message: "Review marked as read" });
      } else {
        res.status(500).json({ message: "Failed to mark review as read" });
      }
    } catch (error) {
      console.error('Error marking review as read:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Project collaborators
  app.post("/api/projects/:id/collaborators", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { userId } = req.body;
      
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check ownership
      if (project.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.addCollaborator(req.params.id, userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Get project collaborators with detailed user information
  app.get("/api/projects/:id/collaborators", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Get project with owner details for permission check
      const projectWithOwner = await storage.getProjectWithDetails(req.params.id);
      if (!projectWithOwner) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check access permissions
      const hasAccess = projectWithOwner.ownerId === req.user!.id || 
                       projectWithOwner.visibility === "PUBLIC" ||
                       (projectWithOwner.visibility === "INSTITUTION" && projectWithOwner.owner.institution === req.user!.institution);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const collaborators = await storage.getProjectCollaborators(req.params.id);
      res.json(collaborators);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.delete("/api/projects/:id/collaborators/:userId", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check ownership
      if (project.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.removeCollaborator(req.params.id, req.params.userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Get project files with authentication
  app.get("/api/projects/:id/files", authenticateToken, async (req: Request, res: Response) => {
    try {
      console.log('🔍 Fetching files for project:', req.params.id);
      const project = await storage.getProject(req.params.id);
      if (!project) {
        console.log('❌ Project not found:', req.params.id);
        return res.status(404).json({ message: "Project not found" });
      }

      // Skip access permission check for now

      const files = await storage.getProjectFiles(req.params.id);
      console.log('📁 Files found for project', req.params.id, ':', files.length, 'files');
      console.log('📄 File details:', files.map(f => ({ id: f.id, fileName: f.fileName || f.file_name, fileSize: f.fileSize || f.file_size })));
      res.json(files);
    } catch (error) {
      console.error('❌ Error fetching project files:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // File upload with authentication and permission checking
  app.post("/api/projects/:id/files", authenticateToken, upload.single("file"), async (req: any, res: any) => {
    try {
      console.log('📤 File upload request received for project:', req.params.id);
      console.log('📂 Request file object:', req.file);
      
      if (!req.file) {
        console.log('❌ No file in request');
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log('✅ File details:', {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        path: req.file.path
      });

      const project = await storage.getProject(req.params.id);
      if (!project) {
        console.log('❌ Project not found:', req.params.id);
        return res.status(404).json({ message: "Project not found" });
      }

      console.log('✅ Project found:', project.title);

      // Check if user is the project owner
      const isOwner = project.ownerId === req.user.id;
      const isCollaborator = await storage.isCollaborator(req.params.id, req.user.id);

      if (!isOwner && !isCollaborator) {
        console.log('❌ User not authorized to upload files');
        return res.status(403).json({ message: "Access denied: You must be a collaborator to upload files" });
      }

      // Collaborators must use pull requests to submit changes for owner approval
      if (!isOwner && isCollaborator) {
        console.log('❌ Collaborator attempted direct file upload');
        return res.status(403).json({ 
          message: "Collaborators cannot upload files directly. Please create a pull request with your changes.",
          code: "REQUIRES_PULL_REQUEST",
          redirectTo: `/projects/${req.params.id}/collaborate`
        });
      }

      // Only project owners can upload files directly
      const fileData = {
        projectId: req.params.id,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        content: null,
        isArchive: req.file.originalname.endsWith('.zip') || req.file.originalname.endsWith('.rar'),
        archiveContents: null
      };

      console.log('💾 Saving file data to database (owner upload):', fileData);
      const savedFile = await storage.uploadProjectFile(fileData);
      console.log('✅ File saved to database:', savedFile);

      res.json({
        message: "File uploaded successfully",
        file: savedFile
      });
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  // Delete file route with authentication
  app.delete("/api/projects/files/:fileId", authenticateToken, async (req: any, res: any) => {
    try {
      console.log('🗑️ Delete file request for:', req.params.fileId);
      
      const file = await storage.getProjectFileById(req.params.fileId);
      if (!file) {
        console.log('❌ File not found:', req.params.fileId);
        return res.status(404).json({ message: "File not found" });
      }

      console.log('✅ File found:', file.fileName);

      // Delete file from filesystem
      const filePath = path.join(process.cwd(), file.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ File deleted from filesystem:', filePath);
      } else {
        console.log('⚠️ File not found on filesystem:', filePath);
      }

      // Delete file record from database
      const success = await storage.deleteProjectFile(req.params.fileId);
      if (!success) {
        console.log('❌ Failed to delete file from database');
        return res.status(500).json({ message: "Failed to delete file from database" });
      }

      console.log('✅ File deleted successfully:', file.fileName);
      res.status(204).send();
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  // Download file route (no auth for public access)
  app.get("/api/projects/files/:fileId/download", async (req: any, res: any) => {
    try {
      const file = await storage.getProjectFileById(req.params.fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      const project = await storage.getProject(file.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Skip access permissions for now

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
      res.setHeader('Content-Type', file.fileType || 'application/octet-stream');
      res.setHeader('Content-Length', file.fileSize);

      // Stream the file
      // fs and path already imported at top
      const filePath = path.join(process.cwd(), file.filePath);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      console.log('📥 Downloading file:', file.fileName, 'from path:', filePath);
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // View file route (for text/code files) - simplified no auth
  app.get("/api/projects/files/:fileId/view", async (req: any, res: any) => {
    try {
      const file = await storage.getProjectFileById(req.params.fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      const project = await storage.getProject(file.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Skip access permissions for now

      // fs and path already imported at top
      const filePath = path.join(process.cwd(), file.filePath);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      // For viewable files, set appropriate content type and return content
      const extension = file.fileName.split('.').pop()?.toLowerCase() || '';
      const viewableExtensions = ['txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'json', 'xml', 'yml', 'yaml'];
      
      if (viewableExtensions.includes(extension) || file.fileType.startsWith('text/')) {
        // Read file content for text files
        const content = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(content);
      } else if (file.fileType.startsWith('image/')) {
        // For images, serve directly
        res.setHeader('Content-Type', file.fileType);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
      } else {
        // For other files, redirect to download
        res.redirect(`/api/projects/files/${file.id}/download`);
      }

      console.log('👁️ Viewing file:', file.fileName, 'Type:', file.fileType);
    } catch (error) {
      console.error('❌ Error viewing file:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Social Features Routes

  // Comments endpoints
  app.get("/api/projects/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/projects/:id/comments", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { content } = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment({
        projectId: req.params.id,
        authorId: req.user.id,
        content
      });
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Collaboration endpoints
  app.post("/api/projects/:id/collaborators", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Check if user is project owner
      const project = await storage.getProject(req.params.id);
      if (!project || project.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Only project owner can add collaborators" });
      }

      await storage.addCollaborator(req.params.id, userId);
      res.status(201).json({ message: "Collaborator added successfully" });
    } catch (error) {
      console.error('Error adding collaborator:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.delete("/api/projects/:id/collaborators/:userId", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      // Check if user is project owner
      const project = await storage.getProject(req.params.id);
      if (!project || project.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Only project owner can remove collaborators" });
      }

      await storage.removeCollaborator(req.params.id, req.params.userId);
      res.json({ message: "Collaborator removed successfully" });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.get("/api/projects/:id/collaborators", async (req, res) => {
    try {
      const collaborators = await storage.getProjectCollaborators(req.params.id);
      res.json(collaborators);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Star/Like endpoints
  app.post("/api/projects/:id/star", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      await storage.starProject(req.params.id, req.user.id);
      res.json({ message: "Project starred successfully" });
    } catch (error) {
      console.error('Error starring project:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.delete("/api/projects/:id/star", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      await storage.unstarProject(req.params.id, req.user.id);
      res.json({ message: "Project unstarred successfully" });
    } catch (error) {
      console.error('Error unstarring project:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  app.get("/api/starred-projects", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const starredProjects = await storage.getStarredProjects(req.user.id);
      res.json(starredProjects);
    } catch (error) {
      console.error('Error fetching starred projects:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Get users (for collaboration invites)
  app.get("/api/users/search", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { q, projectId, limit = "15", role } = req.query;
      
      // Input validation
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const searchQuery = q.trim();
      if (searchQuery.length < 2) {
        return res.json([]);
      }
      
      if (searchQuery.length > 100) {
        return res.status(400).json({ message: "Search query too long" });
      }

      const searchLimit = Math.min(parseInt(limit as string) || 15, 50); // Max 50 results

      const users = await storage.getUsersByInstitution(req.user!.institution);
      
      // Get current collaborators to filter them out
      let currentCollaboratorIds: string[] = [];
      if (projectId && typeof projectId === "string") {
        try {
          const collaborators = await storage.getProjectCollaborators(projectId);
          currentCollaboratorIds = collaborators.map(c => c.id);
        } catch (error) {
          // Silent fail for this optional feature
        }
      }

      // Enhanced search with relevance scoring
      const searchResults = users
        .filter(user => 
          user.id !== req.user!.id &&
          !currentCollaboratorIds.includes(user.id) &&
          (!role || user.role === role) // Optional role filter
        )
        .map(user => {
          const searchLower = searchQuery.toLowerCase();
          const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
          const username = user.username.toLowerCase();
          const email = user.email.toLowerCase();
          
          let relevanceScore = 0;
          
          // Exact matches get highest score
          if (username === searchLower || email === searchLower) relevanceScore += 10;
          if (fullName === searchLower) relevanceScore += 10;
          
          // Starts with matches get high score
          if (username.startsWith(searchLower)) relevanceScore += 8;
          if (fullName.startsWith(searchLower)) relevanceScore += 8;
          if (email.startsWith(searchLower)) relevanceScore += 7;
          
          // Contains matches get medium score
          if (username.includes(searchLower)) relevanceScore += 5;
          if (fullName.includes(searchLower)) relevanceScore += 5;
          if (email.includes(searchLower)) relevanceScore += 4;
          
          return relevanceScore > 0 ? { user, relevanceScore } : null;
        })
        .filter(result => result !== null)
        .sort((a, b) => b!.relevanceScore - a!.relevanceScore)
        .slice(0, searchLimit)
        .map(result => ({
          id: result!.user.id,
          username: result!.user.username,
          email: result!.user.email,
          firstName: result!.user.firstName,
          lastName: result!.user.lastName,
          role: result!.user.role,
          institution: result!.user.institution,
          relevanceScore: result!.relevanceScore
        }));

      res.json(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Enhanced admin routes with comprehensive middleware and error handling
  app.get("/api/admin/faculty", 
    authenticateToken, 
    requireAdmin, 
    auditLog('FETCH_FACULTY_LIST'),
    async (req, res) => {
    try {
      const user = req.user as any;
      const { page = "1", limit = "10", search = "", verified } = req.query;
      
      // Comprehensive role validation
      if (!user) {
        console.warn('⚠️ Admin faculty access: No user found in request');
        return res.status(401).json({ 
          message: "Authentication required",
          code: "AUTH_REQUIRED" 
        });
      }

      if (user.role !== 'ADMIN') {
        console.warn(`⚠️ Admin faculty access denied: User ${user.id} has role ${user.role}`);
        return res.status(403).json({ 
          message: "Access denied. College Administrator role required.",
          code: "INSUFFICIENT_PERMISSIONS",
          requiredRole: "ADMIN",
          currentRole: user.role
        });
      }

      if (!user.institution) {
        console.warn(`⚠️ Admin faculty access: User ${user.id} has no institution`);
        return res.status(400).json({ 
          message: "User institution not found",
          code: "MISSING_INSTITUTION" 
        });
      }
      
      // Get faculty members with enhanced filtering and pagination
      const faculty = await storage.getUsersByInstitution(user.institution);
      let facultyMembers = faculty.filter(u => u.role === 'FACULTY');
      
      // Apply search filter if provided
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        facultyMembers = facultyMembers.filter(f => 
          f.firstName?.toLowerCase().includes(searchLower) ||
          f.lastName?.toLowerCase().includes(searchLower) ||
          f.email.toLowerCase().includes(searchLower) ||
          f.username.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply verification filter if provided
      if (verified !== undefined) {
        const isVerified = verified === 'true';
        facultyMembers = facultyMembers.filter(f => f.isVerified === isVerified);
      }
      
      // Add enhanced user data with stats
      const enrichedFaculty = await Promise.all(
        facultyMembers.map(async (faculty) => {
          const projects = await storage.getProjects({ ownerId: faculty.id });
          const reviews = await storage.getProjectReviews(faculty.id);
          
          return {
            ...faculty,
            stats: {
              projectCount: projects.length,
              reviewCount: reviews.length,
              lastLogin: faculty.updatedAt || null
            }
          };
        })
      );
      
      // Calculate pagination
      const pageNum = parseInt(page as string) || 1;
      const limitNum = Math.min(parseInt(limit as string) || 10, 50);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedFaculty = enrichedFaculty.slice(startIndex, endIndex);
      
      console.log(`✅ Admin ${user.id} accessed faculty list: ${facultyMembers.length} total, ${paginatedFaculty.length} returned`);
      res.json({
        success: true,
        data: paginatedFaculty,
        pagination: {
          total: enrichedFaculty.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(enrichedFaculty.length / limitNum)
        },
        filters: {
          search: search || null,
          verified: verified || null
        },
        institution: user.institution,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Error fetching faculty:', error);
      
      // Detailed error response
      if (error.message.includes('Invalid institution')) {
        return res.status(400).json({ 
          message: "Invalid institution parameter",
          code: "INVALID_INSTITUTION" 
        });
      }
      
      res.status(500).json({ 
        message: "Internal server error while fetching faculty members",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get("/api/admin/students", 
    authenticateToken, 
    requireAdmin, 
    auditLog('FETCH_STUDENT_LIST'),
    async (req, res) => {
    try {
      const user = req.user as any;
      const { page = "1", limit = "10", search = "", verified, department } = req.query;
      
      // Comprehensive role validation
      if (!user) {
        console.warn('⚠️ Admin students access: No user found in request');
        return res.status(401).json({ 
          message: "Authentication required",
          code: "AUTH_REQUIRED" 
        });
      }

      if (user.role !== 'ADMIN') {
        console.warn(`⚠️ Admin students access denied: User ${user.id} has role ${user.role}`);
        return res.status(403).json({ 
          message: "Access denied. College Administrator role required.",
          code: "INSUFFICIENT_PERMISSIONS",
          requiredRole: "ADMIN",
          currentRole: user.role
        });
      }

      if (!user.institution) {
        console.warn(`⚠️ Admin students access: User ${user.id} has no institution`);
        return res.status(400).json({ 
          message: "User institution not found",
          code: "MISSING_INSTITUTION" 
        });
      }
      
      // Get students with enhanced filtering and pagination
      const students = await storage.getUsersByInstitution(user.institution);
      let studentMembers = students.filter(u => u.role === 'STUDENT');
      
      // Apply search filter if provided
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        studentMembers = studentMembers.filter(s => 
          s.firstName?.toLowerCase().includes(searchLower) ||
          s.lastName?.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower) ||
          s.username.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply verification filter if provided
      if (verified !== undefined) {
        const isVerified = verified === 'true';
        studentMembers = studentMembers.filter(s => s.isVerified === isVerified);
      }
      
      // Apply department filter if provided
      if (department && typeof department === 'string') {
        studentMembers = studentMembers.filter(s => s.department === department);
      }
      
      // Add enhanced user data with project stats
      const enrichedStudents = await Promise.all(
        studentMembers.map(async (student) => {
          const projects = await storage.getProjects({ ownerId: student.id });
          // Get collaborations for the student across all projects  
          const collaborationResults = await db.select()
            .from(projectCollaborators)
            .where(eq(projectCollaborators.userId, student.id));
          
          
          return {
            ...student,
            stats: {
              projectCount: projects.length,
              collaborationCount: collaborationResults.length,
              lastLogin: student.updatedAt || null
            }
          };
        })
      );
      
      // Calculate pagination
      const pageNum = parseInt(page as string) || 1;
      const limitNum = Math.min(parseInt(limit as string) || 10, 50);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedStudents = enrichedStudents.slice(startIndex, endIndex);
      
      console.log(`✅ Admin ${user.id} accessed student list: ${studentMembers.length} total, ${paginatedStudents.length} returned`);
      res.json({
        success: true,
        data: paginatedStudents,
        pagination: {
          total: enrichedStudents.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(enrichedStudents.length / limitNum)
        },
        filters: {
          search: search || null,
          verified: verified || null,
          department: department || null
        },
        institution: user.institution,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Error fetching students:', error);
      
      // Detailed error response
      if (error.message.includes('Invalid institution')) {
        return res.status(400).json({ 
          message: "Invalid institution parameter",
          code: "INVALID_INSTITUTION" 
        });
      }
      
      res.status(500).json({ 
        message: "Internal server error while fetching students",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString()
      });
    }
  });

  app.delete("/api/admin/users/:userId", 
    authenticateToken, 
    requireAdmin,
    validateParams(['userId']),
    adminRateLimit(),
    auditLog('REMOVE_USER'),
    async (req, res) => {
    try {
      const user = req.user as any;
      const { userId } = req.params;
      
      // Validate parameters
      if (!userId) {
        return res.status(400).json({ 
          message: "User ID is required",
          code: "MISSING_USER_ID" 
        });
      }

      // Comprehensive permission validation
      if (!user) {
        return res.status(401).json({ 
          message: "Authentication required",
          code: "AUTH_REQUIRED" 
        });
      }

      if (user.role !== 'ADMIN') {
        console.warn(`⚠️ User removal denied: User ${user.id} has role ${user.role}`);
        return res.status(403).json({ 
          message: "Access denied. College Administrator role required.",
          code: "INSUFFICIENT_PERMISSIONS"
        });
      }
      
      // Use enhanced storage method for safe removal
      await storage.removeUser(userId, user.id);
      
      console.log(`✅ User ${userId} removed by admin ${user.id}`);
      res.json({ 
        success: true,
        message: "User removed successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Error removing user:', error);
      
      // Handle specific error types
      if (error.message.includes('not found')) {
        return res.status(404).json({ 
          message: error.message,
          code: "USER_NOT_FOUND" 
        });
      }
      
      if (error.message.includes('Insufficient permissions') || 
          error.message.includes('Cannot remove') || 
          error.message.includes('Cannot modify')) {
        return res.status(403).json({ 
          message: error.message,
          code: "PERMISSION_DENIED" 
        });
      }
      
      res.status(500).json({ 
        message: "Internal server error while removing user",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString()
      });
    }
  });

  app.patch("/api/admin/users/:userId/role", 
    authenticateToken, 
    requireAdmin,
    validateParams(['userId', 'role']),
    adminRateLimit(),
    auditLog('UPDATE_USER_ROLE'),
    async (req, res) => {
    try {
      const user = req.user as any;
      const { userId } = req.params;
      const { role } = req.body;
      
      // Validate parameters
      if (!userId) {
        return res.status(400).json({ 
          message: "User ID is required",
          code: "MISSING_USER_ID" 
        });
      }

      if (!role) {
        return res.status(400).json({ 
          message: "Role is required",
          code: "MISSING_ROLE" 
        });
      }

      // Comprehensive permission validation
      if (!user) {
        return res.status(401).json({ 
          message: "Authentication required",
          code: "AUTH_REQUIRED" 
        });
      }

      if (user.role !== 'ADMIN') {
        console.warn(`⚠️ Role update denied: User ${user.id} has role ${user.role}`);
        return res.status(403).json({ 
          message: "Access denied. College Administrator role required.",
          code: "INSUFFICIENT_PERMISSIONS"
        });
      }
      
      // Use enhanced storage method for safe role update
      const updatedUser = await storage.updateUserRole(userId, role, user.id);
      
      console.log(`✅ User ${userId} role updated to ${role} by admin ${user.id}`);
      res.json({ 
        success: true,
        message: "User role updated successfully",
        data: {
          userId: updatedUser.id,
          newRole: updatedUser.role,
          updatedAt: updatedUser.updatedAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Error updating user role:', error);
      
      // Handle specific error types
      if (error.message.includes('not found')) {
        return res.status(404).json({ 
          message: error.message,
          code: "USER_NOT_FOUND" 
        });
      }
      
      if (error.message.includes('Invalid role')) {
        return res.status(400).json({ 
          message: error.message,
          code: "INVALID_ROLE",
          validRoles: ['STUDENT', 'FACULTY', 'GUEST']
        });
      }
      
      if (error.message.includes('Insufficient permissions') || 
          error.message.includes('Cannot modify')) {
        return res.status(403).json({ 
          message: error.message,
          code: "PERMISSION_DENIED" 
        });
      }
      
      res.status(500).json({ 
        message: "Internal server error while updating user role",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Pull Request Routes
  // Get pull requests for a project
  app.get("/api/projects/:id/pull-requests", authenticateToken, withAuth(async (req, res) => {
    try {
      const projectId = req.params.id;
      
      // Verify project exists and user has access
      const project = await storage.getProjectWithDetails(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user is owner or collaborator
      const isOwner = project.owner.id === req.user.id;
      const isCollaborator = await storage.isCollaborator(projectId, req.user.id);
      
      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ message: "Access denied" });
      }

      const pullRequests = await storage.getProjectPullRequests(projectId);
      res.json(pullRequests);
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      res.status(500).json({ message: "Failed to fetch pull requests" });
    }
  }));

  // Create a pull request with optional file uploads
  app.post("/api/projects/:id/pull-requests", authenticateToken, upload.array("files"), async (req: any, res: any) => {
    try {
      const projectId = req.params.id;
      console.log('📋 Creating pull request with files for project:', projectId);
      console.log('📁 Files received:', req.files?.length || 0);
      
      // Parse JSON fields that come as strings from FormData
      const bodyData = { ...req.body };
      if (typeof bodyData.filesChanged === 'string') {
        try {
          bodyData.filesChanged = JSON.parse(bodyData.filesChanged);
        } catch (e) {
          bodyData.filesChanged = [];
        }
      }

      const pullRequestData = insertPullRequestSchema.parse({
        ...bodyData,
        projectId,
        authorId: req.user.id
      });

      // Verify project exists and user has access
      const project = await storage.getProjectWithDetails(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user is collaborator (not owner)
      const isOwner = project.owner.id === req.user.id;
      const isCollaborator = await storage.isCollaborator(projectId, req.user.id);
      
      if (isOwner) {
        return res.status(400).json({ message: "Project owners cannot create pull requests for their own projects" });
      }
      
      if (!isCollaborator) {
        return res.status(403).json({ message: "Only collaborators can create pull requests" });
      }

      // Create the pull request first
      const pullRequest = await storage.createPullRequest(pullRequestData);
      console.log('✅ Pull request created:', pullRequest.id);

      // Handle file uploads if any
      if (req.files && req.files.length > 0) {
        console.log(`📁 Processing ${req.files.length} uploaded files for PR ${pullRequest.id}...`);
        
        for (const file of req.files) {
          const fileData = {
            pullRequestId: pullRequest.id,
            fileName: file.originalname,
            filePath: file.path,
            fileType: file.mimetype,
            fileSize: file.size,
            content: null, // Add the required content field
            isArchive: file.originalname.endsWith('.zip') || file.originalname.endsWith('.rar')
          };
          
          console.log(`📄 Saving PR file: ${file.originalname} to PR ${pullRequest.id}`);
          await storage.uploadPullRequestFile(fileData);
          console.log(`✅ PR file saved: ${file.originalname}`);
        }
      } else {
        console.log(`❌ No files found in request for PR ${pullRequest.id}`);
      }

      res.status(201).json({
        message: "Pull request created successfully",
        pullRequest,
        filesUploaded: req.files?.length || 0
      });
    } catch (error) {
      console.error('Error creating pull request:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pull request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pull request" });
    }
  });

  // Update pull request status (approve, reject, merge)
  app.patch("/api/projects/:projectId/pull-requests/:prId", authenticateToken, withAuth(async (req, res) => {
    try {
      const { projectId, prId } = req.params;
      const { status } = req.body;

      if (!['APPROVED', 'REJECTED', 'MERGED'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be APPROVED, REJECTED, or MERGED" });
      }

      // Verify project exists and user is owner
      const project = await storage.getProjectWithDetails(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.owner.id !== req.user.id) {
        return res.status(403).json({ message: "Only project owners can update pull request status" });
      }

      // Verify pull request exists
      const pullRequest = await storage.getPullRequest(prId);
      if (!pullRequest || pullRequest.projectId !== projectId) {
        return res.status(404).json({ message: "Pull request not found" });
      }

      // If merging, apply the changes to the project
      if (status === 'MERGED') {
        const success = await storage.mergePullRequest(prId, projectId, req.user.id);
        if (!success) {
          return res.status(500).json({ message: "Failed to merge pull request changes" });
        }
      }

      const updatedPR = await storage.updatePullRequestStatus(prId, status, req.user.id);
      res.json(updatedPR);
    } catch (error) {
      console.error('Error updating pull request status:', error);
      res.status(500).json({ message: "Failed to update pull request status" });
    }
  }));

  // Pull Request endpoints
  // Get all pull requests for a project
  app.get("/api/projects/:id/pull-requests", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user has permission to view pull requests
      const isOwner = project.ownerId === req.user!.id;
      const isCollaborator = await storage.isCollaborator(projectId, req.user!.id);
      
      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ message: "Access denied" });
      }

      const pullRequests = await storage.getProjectPullRequests(projectId);
      res.json(pullRequests);
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Create a new pull request
  app.post("/api/projects/:id/pull-requests", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user is a collaborator
      const isCollaborator = await storage.isCollaborator(projectId, req.user!.id);
      if (!isCollaborator) {
        return res.status(403).json({ message: "Only collaborators can create pull requests" });
      }

      const prData = insertPullRequestSchema.parse({
        ...req.body,
        projectId,
        authorId: req.user!.id
      });

      const pullRequest = await storage.createPullRequest(prData);
      res.status(201).json(pullRequest);
    } catch (error) {
      console.error('Error creating pull request:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Get a specific pull request
  app.get("/api/projects/:id/pull-requests/:prId", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { id: projectId, prId } = req.params;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const isOwner = project.ownerId === req.user!.id;
      const isCollaborator = await storage.isCollaborator(projectId, req.user!.id);
      
      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ message: "Access denied" });
      }

      const pullRequest = await storage.getPullRequest(prId);
      if (!pullRequest || pullRequest.projectId !== projectId) {
        return res.status(404).json({ message: "Pull request not found" });
      }

      res.json(pullRequest);
    } catch (error) {
      console.error('Error fetching pull request:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Update pull request status (approve/reject/merge)
  app.patch("/api/projects/:id/pull-requests/:prId", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const { id: projectId, prId } = req.params;
      const { status, reviewComments } = req.body;
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Only project owner can approve/reject/merge pull requests
      if (project.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Only project owner can review pull requests" });
      }

      const pullRequest = await storage.getPullRequest(prId);
      if (!pullRequest || pullRequest.projectId !== projectId) {
        return res.status(404).json({ message: "Pull request not found" });
      }

      const updatedPR = await storage.updatePullRequestStatus(prId, status, req.user!.id);

      // If approved and merging, handle the merge process
      if (status === 'MERGED') {
        await storage.mergePullRequest(prId, projectId, req.user!.id);
      }

      res.json(updatedPR);
    } catch (error) {
      console.error('Error updating pull request:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  // Auto-create pull request when collaborator makes changes
  app.post("/api/projects/:id/auto-pull-request", authenticateToken, withAuth(async (req: AuthRequest, res) => {
    try {
      const projectId = req.params.id;
      const { changedFiles, changesSummary, changeDetails } = req.body;
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user is a collaborator
      const isCollaborator = await storage.isCollaborator(projectId, req.user!.id);
      if (!isCollaborator) {
        return res.status(403).json({ message: "Only collaborators can create changes" });
      }

      // Auto-create pull request for the changes
      const prData = {
        projectId,
        authorId: req.user!.id,
        title: `Auto PR: Changes by ${req.user!.firstName} ${req.user!.lastName}`,
        description: changesSummary || "Automated pull request for recent changes",
        filesChanged: changedFiles || [],
        changesPreview: changeDetails || "",
        branchName: `feature-${req.user!.username}-${Date.now()}`
      };

      const pullRequest = await storage.createPullRequest(prData);
      res.status(201).json({
        message: "Auto pull request created successfully",
        pullRequest
      });
    } catch (error) {
      console.error('Error creating auto pull request:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  }));

  const httpServer = createServer(app);
  return httpServer;
}