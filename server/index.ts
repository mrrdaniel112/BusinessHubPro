import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import createMemoryStore from "memorystore";
import helmet from "helmet";
import crypto from "crypto";
import { 
  securityMiddleware, 
  getSecureSessionConfig, 
  sanitizeData, 
  redactSensitiveData,
  configureTLS,
  scheduleBackups
} from "./services/security";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create backups directory if it doesn't exist
const backupsDir = path.join(__dirname, "../backups");
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const app = express();

// Security headers with advanced protection
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Needed for shadcn
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  // Advanced security options
  crossOriginEmbedderPolicy: process.env.NODE_ENV === "production",
  crossOriginOpenerPolicy: process.env.NODE_ENV === "production",
  crossOriginResourcePolicy: process.env.NODE_ENV === "production",
  hsts: {
    maxAge: 15552000, // 180 days in seconds
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Input sanitization for all requests to prevent injection attacks
app.use(securityMiddleware.sanitizeInput);

// Increase JSON body size limit to 10MB for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Enhanced session security config
const sessionConfig = getSecureSessionConfig();
const MemoryStore = createMemoryStore(session);
sessionConfig.store = new MemoryStore({
  checkPeriod: 86400000 // prune expired entries every 24h
});

// Apply secure session configuration
app.use(session(sessionConfig));

// Apply rate limiting to all requests
app.use(securityMiddleware.rateLimit);

// Apply CSRF protection to non-GET requests
app.use(securityMiddleware.csrfCheck);

// Set secure HTTP headers for all responses
app.use(securityMiddleware.secureHeaders);

// Configure server for TLS (would be activated in production)
// This is just configuration - actual TLS setup would be done via
// reverse proxy or direct HTTPS setup
if (process.env.NODE_ENV === 'production') {
  // Schedule daily backups in production
  const backupInterval = 24; // hours
  scheduleBackups(() => {
    // This would return all application data
    return { message: "Full application data backup" };
  }, backupInterval);
  
  console.log("Using Gmail SMTP configuration");
}

// Enhanced request logging with security redaction
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Capture JSON responses for logging
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Log request completion with security redaction
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Build the basic log line
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Redact sensitive information before logging
      if (capturedJsonResponse) {
        // List of sensitive fields to redact
        const redactedResponse = redactSensitiveData(capturedJsonResponse, [
          'password', 'token', 'secret', 'key', 'auth', 'credit', 'card', 
          'ssn', 'social', 'security', 'license', 'credentials', 'apiKey',
          'passcode', 'pin', 'cvv', 'banking', 'routing', 'account'
        ]);
        
        logLine += ` :: ${JSON.stringify(redactedResponse)}`;
      }

      // Truncate long log lines
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Enhanced error handling with security in mind
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    
    // Security best practice: Don't expose internal error details to clients
    const publicMessage = process.env.NODE_ENV === 'production' 
      ? "An error occurred while processing your request." 
      : (err.message || "Internal Server Error");
      
    // Include error code for traceability without exposing implementation details
    const errorId = crypto.randomBytes(6).toString('hex');
    
    // For security monitoring
    const errorDetails = {
      errorId,
      path: req.path,
      method: req.method,
      ip: req.ip,
      statusCode: status,
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
      timestamp: new Date().toISOString()
    };
    
    // Log detailed error for server-side debugging
    console.error(`[ERROR ${errorId}]`, JSON.stringify(redactSensitiveData(errorDetails)));
    
    // Security best practice: Generic error response
    res.status(status).json({ 
      message: publicMessage,
      error: process.env.NODE_ENV === 'production' ? undefined : err.name,
      errorId // For support reference
    });
    
    // We don't re-throw in production to prevent crash
    if (process.env.NODE_ENV !== 'production') {
      throw err;
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
