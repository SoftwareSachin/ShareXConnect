import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter configurations
const rateLimiters = {
  // General API requests
  general: new RateLimiterMemory({
    keyPrefix: 'general',
    points: 100, // Number of requests
    duration: 60, // Per 60 seconds
  }),

  // Authentication attempts
  auth: new RateLimiterMemory({
    keyPrefix: 'auth',
    points: 5, // 5 attempts
    duration: 60 * 15, // Per 15 minutes
    blockDuration: 60 * 15, // Block for 15 minutes
  }),

  // Project creation
  createProject: new RateLimiterMemory({
    keyPrefix: 'create_project',
    points: 10, // 10 projects
    duration: 60 * 60, // Per hour
  }),

  // File uploads
  fileUpload: new RateLimiterMemory({
    keyPrefix: 'file_upload',
    points: 20, // 20 files
    duration: 60 * 60, // Per hour
  }),

  // Comments and reviews
  comments: new RateLimiterMemory({
    keyPrefix: 'comments',
    points: 30, // 30 comments
    duration: 60 * 60, // Per hour
  }),

  // Search queries
  search: new RateLimiterMemory({
    keyPrefix: 'search',
    points: 100, // 100 searches
    duration: 60 * 60, // Per hour
  })
};

// Rate limiting middleware factory
export function rateLimit(type: keyof typeof rateLimiters = 'general') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const limiter = rateLimiters[type];
    const key = req.ip + ':' + ((req as any).user?.id || 'anonymous');

    try {
      await limiter.consume(key);
      next();
    } catch (rateLimiterRes: any) {
      const remainingPoints = rateLimiterRes?.remainingPoints || 0;
      const msBeforeNext = rateLimiterRes?.msBeforeNext || 0;

      console.warn(`🚦 Rate limit exceeded for ${type}:`, {
        ip: req.ip,
        userId: (req as any).user?.id || 'anonymous',
        path: req.path,
        remainingPoints,
        msBeforeNext
      });

      res.set({
        'Retry-After': Math.round(msBeforeNext / 1000) || 1,
        'X-RateLimit-Limit': limiter.points,
        'X-RateLimit-Remaining': remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
      });

      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Too many ${type} requests. Please try again later.`,
        retryAfter: Math.round(msBeforeNext / 1000),
        timestamp: new Date().toISOString()
      });
    }
  };
}

// Permission checking middleware
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    if (!allowedRoles.includes(user.role)) {
      console.warn('🔒 Unauthorized access attempt:', {
        userId: user.id,
        role: user.role,
        requiredRoles: allowedRoles,
        path: req.path,
        method: req.method
      });

      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
}

// Project ownership/collaboration check
export function requireProjectAccess(allowOwnerOnly: boolean = false) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const projectId = req.params.id || req.params.projectId || req.body.projectId;

    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    if (!projectId) {
      return res.status(400).json({
        error: 'MISSING_PROJECT_ID',
        message: 'Project ID is required',
        timestamp: new Date().toISOString()
      });
    }

    try {
      const { storage } = require('../storage');
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({
          error: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user is the owner
      const isOwner = project.ownerId === user.id;
      
      // For admin users, allow access to everything
      if (user.role === 'ADMIN') {
        (req as any).project = project;
        (req as any).isProjectOwner = isOwner;
        return next();
      }

      // If owner-only access is required
      if (allowOwnerOnly && !isOwner) {
        return res.status(403).json({
          error: 'OWNER_ONLY',
          message: 'Only project owner can perform this action',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user is a collaborator (if not owner-only)
      if (!allowOwnerOnly && !isOwner) {
        const isCollaborator = await storage.isProjectCollaborator(projectId, user.id);
        
        if (!isCollaborator) {
          return res.status(403).json({
            error: 'ACCESS_DENIED',
            message: 'You do not have access to this project',
            timestamp: new Date().toISOString()
          });
        }
      }

      (req as any).project = project;
      (req as any).isProjectOwner = isOwner;
      next();
    } catch (error) {
      console.error('🚨 Project access check error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Failed to verify project access',
        timestamp: new Date().toISOString()
      });
    }
  };
}

// Institution verification middleware
export function requireInstitutionVerified() {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'UNVERIFIED_USER',
        message: 'Please verify your institutional email to access this feature',
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'"
  });
  
  next();
}

// CORS middleware
export function corsHeaders(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000'];
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  
  res.set({
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
}

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const user = (req as any).user;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    };

    console[logLevel](`📊 ${req.method} ${req.path} - ${res.statusCode} in ${duration}ms`, logData);
  });

  next();
}