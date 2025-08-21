import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { uuid, varchar, text, timestamp, pgTable, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Audit action types
export const auditActionEnum = pgEnum("audit_action", [
  'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 
  'UPLOAD', 'DOWNLOAD', 'COLLABORATE', 'REVIEW', 'COMMENT'
]);

// Audit log table
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id"),
  action: auditActionEnum("action").notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  resourceId: uuid("resource_id"),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;

// Audit logging service
class AuditService {
  async log(entry: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        userId: entry.userId,
        action: entry.action as any,
        resource: entry.resource,
        resourceId: entry.resourceId,
        details: entry.details ? JSON.stringify(entry.details) : null,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      });
    } catch (error) {
      console.error('📝 Failed to create audit log:', error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  // Project-related audit logging
  async logProjectAction(
    action: string,
    projectId: string,
    userId?: string,
    details?: any,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'PROJECT',
      resourceId: projectId,
      details,
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent'],
    });
  }

  // User-related audit logging
  async logUserAction(
    action: string,
    userId?: string,
    details?: any,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'USER',
      resourceId: userId,
      details,
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent'],
    });
  }

  // File-related audit logging
  async logFileAction(
    action: string,
    fileId: string,
    userId?: string,
    details?: any,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'FILE',
      resourceId: fileId,
      details,
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent'],
    });
  }

  // Collaboration audit logging
  async logCollaborationAction(
    action: string,
    projectId: string,
    userId?: string,
    details?: any,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'COLLABORATION',
      resourceId: projectId,
      details,
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent'],
    });
  }
}

export const auditService = new AuditService();

// Middleware to automatically log certain actions
export function auditMiddleware(
  action: string,
  resource: string,
  getResourceId?: (req: Request) => string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const resourceId = getResourceId ? getResourceId(req) : undefined;

    // Log the action after the request completes
    const originalSend = res.send;
    res.send = function(data) {
      // Only log successful operations
      if (res.statusCode < 400) {
        auditService.log({
          userId: user?.id,
          action,
          resource,
          resourceId,
          details: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }
      return originalSend.call(this, data);
    };

    next();
  };
}

// Pre-built audit middlewares for common actions
export const auditMiddlewares = {
  projectView: auditMiddleware('VIEW', 'PROJECT', req => req.params.id),
  projectCreate: auditMiddleware('CREATE', 'PROJECT'),
  projectUpdate: auditMiddleware('UPDATE', 'PROJECT', req => req.params.id),
  projectDelete: auditMiddleware('DELETE', 'PROJECT', req => req.params.id),
  fileUpload: auditMiddleware('UPLOAD', 'FILE'),
  fileDownload: auditMiddleware('DOWNLOAD', 'FILE', req => req.params.id),
  userLogin: auditMiddleware('LOGIN', 'USER'),
  userLogout: auditMiddleware('LOGOUT', 'USER'),
  collaboration: auditMiddleware('COLLABORATE', 'PROJECT', req => req.params.id),
};