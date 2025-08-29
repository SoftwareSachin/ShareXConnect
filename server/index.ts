import express, { type Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { databaseManager } from "./database/connection";
import { migrationManager } from "./database/migrations";
import { backupManager } from "./database/backup";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Enhanced health check endpoint with database metrics
app.get("/health", async (req, res) => {
  try {
    const isHealthy = await databaseManager.healthCheck();
    const stats = await databaseManager.getStats();
    const metrics = await databaseManager.getPerformanceMetrics();
    
    res.json({
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      database: {
        connected: isHealthy,
        connections: {
          total: stats.totalConnections,
          idle: stats.idleConnections,
          waiting: stats.waitingConnections
        },
        performance: {
          activeQueries: metrics.activeQueries,
          avgQueryTime: metrics.avgQueryTime,
          utilization: metrics.connectionUtilization,
          errors: metrics.errors
        }
      },
      environment: process.env.NODE_ENV,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ 
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
});

(async () => {
  try {
    // Initialize enhanced database system
    console.log('🔄 Initializing database system...');
    await databaseManager.initialize();
    
    // Run database migrations
    console.log('🔄 Running database migrations...');
    await migrationManager.runMigrations();
    
    // Start automatic backups for local development
    if (process.env.NODE_ENV === 'development') {
      console.log('💾 Starting automatic backup system...');
      backupManager.startAutomaticBackups(120); // Every 2 hours
    }
    
    const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    log(`🌟 ShareXConnect is ready!`);
    log(`   Local: http://localhost:${port}`);
    log(`   Health: http://localhost:${port}/health`);
  });
  
  } catch (error: any) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
})();
