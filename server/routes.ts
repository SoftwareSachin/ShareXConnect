import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { z } from "zod";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertProjectSchema, insertCommentSchema, type User } from "@shared/schema";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const upload = multer({ dest: "uploads/" });

// Middleware for JWT authentication
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.sendStatus(401);
    }
    req.user = user;
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const user = await storage.createUser(userData);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user.id, req.user.role);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Project routes
  app.get("/api/projects", authenticateToken, async (req, res) => {
    try {
      const { visibility, status, category, search, my } = req.query;
      
      let filters: any = {};
      
      if (my === "true") {
        filters.ownerId = req.user.id;
      } else {
        // Apply visibility rules based on user role and institution
        if (req.user.role === "admin") {
          filters.institution = req.user.institution;
        } else if (visibility) {
          filters.visibility = visibility;
        } else {
          // Default: show public + institution projects for the user's institution
          const projects = await storage.getProjects();
          const filteredProjects = projects.filter(p => 
            p.visibility === "public" || 
            (p.visibility === "institution" && p.owner.institution === req.user.institution) ||
            p.ownerId === req.user.id
          );
          return res.json(filteredProjects);
        }
      }
      
      if (status) filters.status = status;
      if (category) filters.category = category;
      if (search) filters.search = search as string;

      const projects = await storage.getProjects(filters);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/projects/:id", authenticateToken, async (req, res) => {
    try {
      const project = await storage.getProjectWithDetails(req.params.id, req.user.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check permissions
      if (project.visibility === "private" && project.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      if (project.visibility === "institution" && project.owner.institution !== req.user.institution && project.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/projects", authenticateToken, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        ownerId: req.user.id,
        techStack: req.body.techStack || []
      });
      
      const project = await storage.createProject(projectData);
      const projectWithDetails = await storage.getProjectWithDetails(project.id, req.user.id);
      
      res.status(201).json(projectWithDetails);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/projects/:id", authenticateToken, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check ownership
      if (project.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(req.params.id, updates);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      const projectWithDetails = await storage.getProjectWithDetails(updatedProject.id, req.user.id);
      res.json(projectWithDetails);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/projects/:id", authenticateToken, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check ownership
      if (project.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Star/unstar projects
  app.post("/api/projects/:id/star", authenticateToken, async (req, res) => {
    try {
      await storage.starProject(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/projects/:id/star", authenticateToken, async (req, res) => {
    try {
      await storage.unstarProject(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get starred projects
  app.get("/api/projects/starred/all", authenticateToken, async (req, res) => {
    try {
      const starredProjects = await storage.getStarredProjects(req.user.id);
      res.json(starredProjects);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Comments
  app.get("/api/projects/:id/comments", authenticateToken, async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/projects/:id/comments", authenticateToken, async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        projectId: req.params.id,
        userId: req.user.id
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Faculty assignment routes
  app.post("/api/projects/:id/assign", authenticateToken, async (req, res) => {
    try {
      const { facultyId } = req.body;
      
      // Verify the faculty member exists and is faculty
      const faculty = await storage.getUser(facultyId);
      if (!faculty || faculty.role !== "faculty") {
        return res.status(400).json({ message: "Invalid faculty member" });
      }

      const assignment = await storage.assignProjectToFaculty(req.params.id, facultyId);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/faculty/assignments", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== "faculty") {
        return res.status(403).json({ message: "Access denied" });
      }

      const assignments = await storage.getFacultyAssignments(req.user.id);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/assignments/:id/review", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== "faculty") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { grade, feedback } = req.body;
      if (!grade || !feedback) {
        return res.status(400).json({ message: "Grade and feedback are required" });
      }

      const assignment = await storage.submitReview(req.params.id, grade, feedback);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Project collaborators
  app.post("/api/projects/:id/collaborators", authenticateToken, async (req, res) => {
    try {
      const { userId } = req.body;
      
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check ownership
      if (project.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.addCollaborator(req.params.id, userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/projects/:id/collaborators/:userId", authenticateToken, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check ownership
      if (project.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.removeCollaborator(req.params.id, req.params.userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // File upload
  app.post("/api/projects/:id/files", authenticateToken, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check ownership or collaboration
      if (project.ownerId !== req.user.id) {
        const collaborators = await storage.getProjectCollaborators(req.params.id);
        const isCollaborator = collaborators.some(c => c.id === req.user.id);
        if (!isCollaborator) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      res.json({
        message: "File uploaded successfully",
        file: {
          name: req.file.originalname,
          size: req.file.size,
          path: req.file.path
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get users (for collaboration invites)
  app.get("/api/users/search", authenticateToken, async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string" || q.length < 2) {
        return res.json([]);
      }

      const users = await storage.getUsersByInstitution(req.user.institution);
      const filteredUsers = users
        .filter(user => 
          user.id !== req.user.id &&
          (user.username.toLowerCase().includes(q.toLowerCase()) ||
           user.email.toLowerCase().includes(q.toLowerCase()) ||
           `${user.firstName} ${user.lastName}`.toLowerCase().includes(q.toLowerCase()))
        )
        .slice(0, 10)
        .map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }));

      res.json(filteredUsers);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
