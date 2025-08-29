/**
 * Enhanced role-based access control middleware with comprehensive validation
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

export interface AuthRequest extends Request {
  user?: any;
}

// Enhanced middleware factory for role-based access control
export function requireRole(allowedRoles: string | string[], options: {
  checkInstitution?: boolean;
  allowSameInstitution?: boolean;
  logAccess?: boolean;
} = {}) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      // Authentication check
      if (!user) {
        console.warn('🚫 Role middleware: No authenticated user found');
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
          timestamp: new Date().toISOString()
        });
      }

      // Role validation
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const hasValidRole = rolesArray.includes(user.role);

      if (!hasValidRole) {
        console.warn(`🚫 Role access denied: User ${user.id} (${user.role}) attempted to access ${rolesArray.join('/')} restricted resource`);
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${rolesArray.join(' or ')}`,
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: rolesArray,
          currentRole: user.role,
          timestamp: new Date().toISOString()
        });
      }

      // Institution validation for admin operations
      if (options.checkInstitution && !user.institution) {
        console.warn(`🚫 Institution validation failed: User ${user.id} has no institution`);
        return res.status(400).json({
          success: false,
          message: 'User institution not found',
          code: 'MISSING_INSTITUTION',
          timestamp: new Date().toISOString()
        });
      }

      // Additional validation using storage layer
      if (options.allowSameInstitution && user.institution) {
        // Pass the required role instead of user's current role for proper validation
        const requiredRole = Array.isArray(allowedRoles) ? allowedRoles[0] : allowedRoles;
        const isValid = await storage.validateUserPermission(user.id, requiredRole, user.institution);
        if (!isValid) {
          console.warn(`🚫 Storage validation failed: User ${user.id} failed institution validation`);
          return res.status(403).json({
            success: false,
            message: 'Permission validation failed',
            code: 'VALIDATION_FAILED',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Success logging
      if (options.logAccess) {
        console.log(`✅ Role access granted: User ${user.id} (${user.role}) accessing ${rolesArray.join('/')} resource`);
      }

      next();
    } catch (error: any) {
      console.error('❌ Role validation middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during role validation',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
}

// Middleware for protecting admin-only routes
export const requireAdmin = requireRole('ADMIN', {
  checkInstitution: true,
  allowSameInstitution: true,
  logAccess: true
});

// Middleware for protecting faculty and admin routes
export const requireFacultyOrAdmin = requireRole(['FACULTY', 'ADMIN'], {
  checkInstitution: true,
  logAccess: true
});

// Middleware for protecting student routes
export const requireStudent = requireRole('STUDENT', {
  logAccess: true
});

// Enhanced parameter validation middleware
export function validateParams(requiredParams: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const missingParams: string[] = [];
      
      for (const param of requiredParams) {
        const value = req.params[param] || req.body[param];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          missingParams.push(param);
        }
      }

      if (missingParams.length > 0) {
        console.warn(`🚫 Parameter validation failed: Missing ${missingParams.join(', ')}`);
        return res.status(400).json({
          success: false,
          message: `Missing required parameters: ${missingParams.join(', ')}`,
          code: 'MISSING_PARAMETERS',
          missingParams,
          timestamp: new Date().toISOString()
        });
      }

      next();
    } catch (error: any) {
      console.error('❌ Parameter validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Parameter validation error',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
}

// Enhanced rate limiting for admin operations
export function adminRateLimit() {
  const attempts = new Map<string, { count: number; lastAttempt: number }>();
  const WINDOW_MS = 60000; // 1 minute
  const MAX_ATTEMPTS = 10; // 10 operations per minute

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next();
      }

      const now = Date.now();
      const userAttempts = attempts.get(userId);

      if (!userAttempts) {
        attempts.set(userId, { count: 1, lastAttempt: now });
        return next();
      }

      // Reset if window has passed
      if (now - userAttempts.lastAttempt > WINDOW_MS) {
        attempts.set(userId, { count: 1, lastAttempt: now });
        return next();
      }

      // Check if limit exceeded
      if (userAttempts.count >= MAX_ATTEMPTS) {
        console.warn(`🚫 Rate limit exceeded: User ${userId} exceeded ${MAX_ATTEMPTS} operations per minute`);
        return res.status(429).json({
          success: false,
          message: 'Too many operations. Please wait before trying again.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((WINDOW_MS - (now - userAttempts.lastAttempt)) / 1000),
          timestamp: new Date().toISOString()
        });
      }

      // Increment counter
      userAttempts.count++;
      userAttempts.lastAttempt = now;
      attempts.set(userId, userAttempts);

      next();
    } catch (error: any) {
      console.error('❌ Rate limiting error:', error);
      next(); // Don't block on rate limiting errors
    }
  };
}

// Enhanced audit logging middleware
export function auditLog(operation: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    const startTime = Date.now();
    
    // Log request
    console.log(`🔍 AUDIT: ${operation} initiated by user ${user?.id} (${user?.role}) at ${new Date().toISOString()}`);
    console.log(`📊 Request details: ${req.method} ${req.path}`, {
      params: req.params,
      body: req.body ? Object.keys(req.body) : [],
      ip: req.ip
    });

    // Override res.json to log response
    const originalJson = res.json;
    res.json = function(body) {
      const duration = Date.now() - startTime;
      console.log(`🔍 AUDIT: ${operation} completed in ${duration}ms with status ${res.statusCode}`);
      
      if (res.statusCode >= 400) {
        console.log(`❌ AUDIT: ${operation} failed:`, body);
      } else {
        console.log(`✅ AUDIT: ${operation} succeeded`);
      }
      
      return originalJson.call(this, body);
    };

    next();
  };
}