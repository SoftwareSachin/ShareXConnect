import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { z } from 'zod';

// Enhanced error response interface
interface ValidationErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
  statusCode: number;
}

// Create standardized error response
export function createErrorResponse(
  error: string,
  message: string,
  statusCode: number = 400,
  req: Request,
  details?: any
): ValidationErrorResponse {
  return {
    error,
    message,
    details,
    timestamp: new Date().toISOString(),
    path: req.path,
    statusCode
  };
}

// Validation middleware factory
export function validateRequest(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        const result = schema.body.safeParse(req.body);
        if (!result.success) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Invalid request body',
            400,
            req,
            result.error.errors
          );
          return res.status(400).json(errorResponse);
        }
        req.body = result.data;
      }

      // Validate query parameters
      if (schema.query) {
        const result = schema.query.safeParse(req.query);
        if (!result.success) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Invalid query parameters',
            400,
            req,
            result.error.errors
          );
          return res.status(400).json(errorResponse);
        }
        req.query = result.data;
      }

      // Validate path parameters
      if (schema.params) {
        const result = schema.params.safeParse(req.params);
        if (!result.success) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Invalid path parameters',
            400,
            req,
            result.error.errors
          );
          return res.status(400).json(errorResponse);
        }
        req.params = result.data;
      }

      next();
    } catch (error) {
      console.error('🚨 Validation middleware error:', error);
      const errorResponse = createErrorResponse(
        'INTERNAL_ERROR',
        'Internal validation error',
        500,
        req
      );
      res.status(500).json(errorResponse);
    }
  };
}

// Common validation schemas
export const commonSchemas = {
  // UUID parameter validation
  uuidParam: z.object({
    id: z.string().uuid('Invalid UUID format')
  }),

  // Pagination validation
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),

  // Project creation validation
  createProject: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().min(1, 'Description is required'),
    category: z.string().min(1, 'Category is required').max(100),
    visibility: z.enum(['PRIVATE', 'INSTITUTION', 'PUBLIC']),
    status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED']),
    techStack: z.array(z.string()).default([]),
    githubUrl: z.string().url('Invalid GitHub URL').optional(),
    demoUrl: z.string().url('Invalid demo URL').optional(),
    academicLevel: z.string().max(100).optional(),
    department: z.string().max(100).optional(),
    courseSubject: z.string().max(150).optional(),
    projectMethodology: z.string().optional(),
    setupInstructions: z.string().optional(),
    allowsCollaboration: z.boolean().default(true),
    requiresApprovalForCollaboration: z.boolean().default(true)
  }),

  // User registration validation
  registerUser: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(30),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letter')
      .regex(/[a-z]/, 'Password must contain lowercase letter')
      .regex(/[0-9]/, 'Password must contain number')
      .regex(/[!@#$%^&*]/, 'Password must contain special character'),
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    role: z.enum(['STUDENT', 'FACULTY', 'ADMIN', 'GUEST']),
    institution: z.string().min(1, 'Institution is required').max(100)
  }),

  // User login validation
  loginUser: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  }),

  // Comment validation
  createComment: z.object({
    content: z.string().min(1, 'Comment content is required').max(2000, 'Comment too long'),
    parentId: z.string().uuid().optional()
  }),

  // Collaboration request validation
  createCollaborationRequest: z.object({
    projectId: z.string().uuid('Invalid project ID'),
    message: z.string().min(1, 'Message is required').max(500, 'Message too long')
  }),

  // Review validation
  createReview: z.object({
    projectId: z.string().uuid('Invalid project ID'),
    grade: z.number().min(0).max(100).optional(),
    feedback: z.string().min(1, 'Feedback is required'),
    status: z.enum(['PENDING', 'COMPLETED'])
  }),

  // Search validation
  search: z.object({
    q: z.string().min(1, 'Search query is required').max(200),
    category: z.string().optional(),
    department: z.string().optional(),
    visibility: z.enum(['PRIVATE', 'INSTITUTION', 'PUBLIC']).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20)
  }),

  // File upload validation
  fileUpload: z.object({
    fileName: z.string().min(1, 'File name is required').max(255),
    fileType: z.string().min(1, 'File type is required'),
    fileSize: z.number().min(1, 'File size must be positive').max(50 * 1024 * 1024, 'File too large (50MB max)'),
    projectId: z.string().uuid('Invalid project ID')
  })
};

// Error handling middleware
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('🚨 API Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    userId: (req as any).user?.id || 'anonymous'
  });

  // Handle different error types
  if (error instanceof ZodError) {
    const errorResponse = createErrorResponse(
      'VALIDATION_ERROR',
      'Request validation failed',
      400,
      req,
      error.errors
    );
    return res.status(400).json(errorResponse);
  }

  if (error.code === '23505') { // PostgreSQL unique constraint violation
    const errorResponse = createErrorResponse(
      'DUPLICATE_ENTRY',
      'Resource already exists',
      409,
      req,
      { constraint: error.constraint }
    );
    return res.status(409).json(errorResponse);
  }

  if (error.code === '23503') { // PostgreSQL foreign key violation
    const errorResponse = createErrorResponse(
      'REFERENCE_ERROR',
      'Referenced resource not found',
      400,
      req,
      { constraint: error.constraint }
    );
    return res.status(400).json(errorResponse);
  }

  if (error.code === '23502') { // PostgreSQL not null violation
    const errorResponse = createErrorResponse(
      'MISSING_FIELD',
      'Required field is missing',
      400,
      req,
      { column: error.column }
    );
    return res.status(400).json(errorResponse);
  }

  // Default error response
  const errorResponse = createErrorResponse(
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
    500,
    req,
    process.env.NODE_ENV === 'production' ? undefined : error.stack
  );
  
  res.status(500).json(errorResponse);
}

// Request sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Remove potential XSS and injection attempts
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    } else if (Array.isArray(obj)) {
      return obj.map(sanitize);
    } else if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
}