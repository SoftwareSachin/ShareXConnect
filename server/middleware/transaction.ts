import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { Pool } from '@neondatabase/serverless';

// Transaction context interface
interface TransactionContext {
  tx: any; // Drizzle transaction object
  client: any;
  isActive: boolean;
  rollbackReason?: string;
}

// Add transaction context to request
declare global {
  namespace Express {
    interface Request {
      transaction?: TransactionContext;
    }
  }
}

// Transaction management service
class TransactionManager {
  // Start a new transaction for the request
  async startTransaction(req: Request): Promise<TransactionContext> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const tx = db.transaction(async (tx) => {
        // This will be the transaction object
        return tx;
      });

      const context: TransactionContext = {
        tx,
        client,
        isActive: true
      };

      req.transaction = context;
      console.log('🔄 Transaction started for request:', req.path);
      
      return context;
    } catch (error) {
      client.release();
      throw error;
    }
  }

  // Commit the transaction
  async commitTransaction(req: Request): Promise<void> {
    const context = req.transaction;
    if (!context || !context.isActive) {
      return;
    }

    try {
      await context.client.query('COMMIT');
      context.isActive = false;
      console.log('✅ Transaction committed for request:', req.path);
    } catch (error) {
      console.error('❌ Transaction commit failed:', error);
      await this.rollbackTransaction(req, 'Commit failed');
      throw error;
    } finally {
      context.client.release();
    }
  }

  // Rollback the transaction
  async rollbackTransaction(req: Request, reason?: string): Promise<void> {
    const context = req.transaction;
    if (!context || !context.isActive) {
      return;
    }

    try {
      await context.client.query('ROLLBACK');
      context.isActive = false;
      context.rollbackReason = reason;
      console.log('🔄 Transaction rolled back for request:', req.path, reason ? `- ${reason}` : '');
    } catch (error) {
      console.error('❌ Transaction rollback failed:', error);
    } finally {
      context.client.release();
    }
  }

  // Check if request has active transaction
  hasActiveTransaction(req: Request): boolean {
    return !!(req.transaction?.isActive);
  }
}

export const transactionManager = new TransactionManager();

// Middleware to wrap request in transaction
export function withTransaction(req: Request, res: Response, next: NextFunction) {
  // Only use transactions for write operations
  const writeOperations = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!writeOperations.includes(req.method)) {
    return next();
  }

  // Skip for certain endpoints that don't need transactions
  const skipPaths = ['/health', '/api/auth/logout', '/api/search'];
  if (skipPaths.some(path => req.path.includes(path))) {
    return next();
  }

  transactionManager.startTransaction(req)
    .then(() => {
      // Hook into response to handle transaction completion
      const originalSend = res.send;
      res.send = function(data) {
        const statusCode = this.statusCode;
        
        // Auto-commit successful operations
        if (statusCode >= 200 && statusCode < 400) {
          transactionManager.commitTransaction(req)
            .then(() => {
              originalSend.call(this, data);
            })
            .catch((error) => {
              console.error('Transaction commit error:', error);
              this.status(500).json({
                error: 'TRANSACTION_ERROR',
                message: 'Failed to complete operation',
                timestamp: new Date().toISOString()
              });
            });
        } else {
          // Auto-rollback failed operations
          transactionManager.rollbackTransaction(req, `HTTP ${statusCode}`)
            .then(() => {
              originalSend.call(this, data);
            })
            .catch((error) => {
              console.error('Transaction rollback error:', error);
              originalSend.call(this, data);
            });
        }
        
        return this;
      };

      next();
    })
    .catch((error) => {
      console.error('Failed to start transaction:', error);
      res.status(500).json({
        error: 'TRANSACTION_START_ERROR',
        message: 'Failed to initialize operation',
        timestamp: new Date().toISOString()
      });
    });
}

// Manual transaction control helpers
export const transactionHelpers = {
  // Execute multiple operations in a transaction
  async withTransaction<T>(operations: () => Promise<T>): Promise<T> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await operations();
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Rollback current request transaction
  async rollback(req: Request, reason?: string): Promise<void> {
    await transactionManager.rollbackTransaction(req, reason);
  },

  // Commit current request transaction
  async commit(req: Request): Promise<void> {
    await transactionManager.commitTransaction(req);
  },

  // Check if transaction is active
  isActive(req: Request): boolean {
    return transactionManager.hasActiveTransaction(req);
  }
};

// Transaction-aware database operations
export const txOperations = {
  // Execute query within current transaction or normal connection
  async query(req: Request, queryFn: (db: any) => Promise<any>): Promise<any> {
    if (req.transaction?.isActive) {
      return queryFn(req.transaction.tx);
    }
    return queryFn(db);
  },

  // Batch operations with transaction
  async batch(operations: Array<() => Promise<any>>): Promise<any[]> {
    return transactionHelpers.withTransaction(async () => {
      const results = [];
      for (const operation of operations) {
        results.push(await operation());
      }
      return results;
    });
  }
};

// Transaction monitoring middleware
export function transactionMonitor(req: Request, res: Response, next: NextFunction) {
  if (!req.transaction) {
    return next();
  }

  const startTime = Date.now();
  
  // Monitor transaction duration
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const context = req.transaction;
    
    console.log(`🔍 Transaction summary for ${req.method} ${req.path}:`, {
      duration: `${duration}ms`,
      status: res.statusCode,
      committed: context?.isActive === false && !context?.rollbackReason,
      rolledBack: !!context?.rollbackReason,
      reason: context?.rollbackReason
    });

    return originalSend.call(this, data);
  };

  next();
}