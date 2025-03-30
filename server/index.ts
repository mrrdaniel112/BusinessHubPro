import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import createMemoryStore from "memorystore";
import helmet from "helmet";
import crypto from "crypto";
import { securityMiddleware } from "./services/security";
import fs from "fs";
import path from "path";

// Create backups directory if it doesn't exist
const backupsDir = path.join(__dirname, "../backups");
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production",
  crossOriginEmbedderPolicy: process.env.NODE_ENV === "production",
  crossOriginOpenerPolicy: process.env.NODE_ENV === "production",
  crossOriginResourcePolicy: process.env.NODE_ENV === "production",
}));

// Increase JSON body size limit to 10MB for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Generate a strong session secret or use environment variable
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Create memory store for session persistence
const MemoryStore = createMemoryStore(session);

// Configure session middleware with enhanced security
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // Set to false for GDPR compliance
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Prevents client-side JS from reading the cookie
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 24 hours (shorter for security)
  }
}));

// Apply rate limiting to all requests
app.use(securityMiddleware.rateLimit);

// Apply CSRF protection to non-GET requests
app.use(securityMiddleware.csrfCheck);

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

(async () => {
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
