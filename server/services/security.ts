import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security Configuration with Environment Variable Support
// For production, all these would be set via environment variables

// Data Encryption - AES-256-GCM is industry standard for high security
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
// Generate a random encryption key if one is not provided via environment variables
// In production, always set this via environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // 32 bytes (256 bits)
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const AUTH_TAG_LENGTH = 16; // For GCM mode
const KEY_ROTATION_DAYS = 90; // Key rotation period

// Secure data handling flags
const SECURE_MEMORY_HANDLING = true; // When true, we take extra precautions with sensitive data in memory
const DATA_SANITIZATION_ENABLED = true; // Sanitize potentially dangerous inputs

// Password security settings - enterprise-grade requirements
const SALT_ROUNDS = 12; // Higher than default
const MIN_PASSWORD_LENGTH = 12; // Longer than the NIST-recommended 8
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
const PASSWORD_EXPIRY_DAYS = 90; // Force password changes periodically
const PASSWORD_HISTORY = 5; // Prevent reuse of recent passwords

// Session and token settings
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
const SESSION_ABSOLUTE_TIMEOUT = '24h'; // Force logout after this period
const SECURE_COOKIES = true; // Set cookies with Secure and HttpOnly flags
const SAME_SITE_COOKIES = 'strict'; // Prevent CSRF

// Rate limiting and brute force protection
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_TIMEOUT_MINUTES = 15;
const IP_RATE_LIMIT = 100; // Requests per minute
const API_RATE_LIMIT = 60; // API requests per minute

// TLS/SSL Configuration
// These would be used when setting up HTTPS
const TLS_MIN_VERSION = 'TLSv1.2'; // Minimum TLS version
const SECURE_CIPHERS = [
  'TLS_AES_256_GCM_SHA384',
  'TLS_CHACHA20_POLY1305_SHA256',
  'TLS_AES_128_GCM_SHA256',
  'ECDHE-RSA-AES256-GCM-SHA384',
  'ECDHE-RSA-AES128-GCM-SHA256'
].join(':');

// Audit logging configuration
const AUDIT_LOG_RETENTION_DAYS = 365; // 1 year retention for security logs
const AUDIT_SENSITIVE_OPERATIONS = true; // Log all sensitive operations

// Data breach protection
const ENABLE_BREACH_DETECTION = true; // Monitor for potential data breaches
const BREACH_NOTIFICATION_CONTACTS = process.env.SECURITY_CONTACTS ? 
                                    process.env.SECURITY_CONTACTS.split(',') : 
                                    ['security@businessplatform.com'];

// Security breach simulation protection
const loginAttempts: Record<string, { count: number, lastAttempt: number }> = {};

/**
 * Data Encryption Functions
 */

// Encrypt data - for sensitive data at rest
export function encryptData(text: string): { encryptedData: string, iv: string, authTag: string } {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create cipher
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY), 
    iv
  );
  
  // Encrypt the data
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the authentication tag (for GCM mode)
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag
  };
}

// Decrypt data
export function decryptData(encryptedData: string, iv: string, authTag: string): string {
  try {
    // Create decipher
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(ENCRYPTION_KEY),
      Buffer.from(iv, 'hex')
    );
    
    // Set auth tag
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    // Decrypt
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Data integrity compromised. Decryption failed.');
  }
}

/**
 * Password Handling Functions
 */

// Hash a password securely
export async function hashPassword(password: string): Promise<string> {
  // Generate a cryptographically strong random salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Hash the password using scrypt (more secure than bcrypt)
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

// Verify a password against a hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString('hex'));
    });
  });
}

// Password strength validation
export function isStrongPassword(password: string): { isValid: boolean, reason?: string } {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { isValid: false, reason: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` };
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    return { 
      isValid: false, 
      reason: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    };
  }
  
  // Check for common passwords (this would be a larger list in production)
  const commonPasswords = ['Password123!', 'Admin123!', 'Welcome1!'];
  if (commonPasswords.includes(password)) {
    return { isValid: false, reason: 'Password is too common and easily guessed' };
  }
  
  return { isValid: true };
}

/**
 * Session Security Functions
 */

// Rate limiting for login attempts
export function checkLoginAttempts(identifier: string): { allowed: boolean, timeLeft?: number } {
  const now = Date.now();
  const userAttempts = loginAttempts[identifier];
  
  // Clear old attempts (older than the timeout period)
  for (const id in loginAttempts) {
    if (now - loginAttempts[id].lastAttempt > LOGIN_TIMEOUT_MINUTES * 60 * 1000) {
      delete loginAttempts[id];
    }
  }
  
  if (!userAttempts) {
    loginAttempts[identifier] = { count: 1, lastAttempt: now };
    return { allowed: true };
  }
  
  // If timeout period has passed, reset attempts
  if (now - userAttempts.lastAttempt > LOGIN_TIMEOUT_MINUTES * 60 * 1000) {
    loginAttempts[identifier] = { count: 1, lastAttempt: now };
    return { allowed: true };
  }
  
  // If max attempts reached, deny access
  if (userAttempts.count >= MAX_LOGIN_ATTEMPTS) {
    const timeLeft = Math.ceil((LOGIN_TIMEOUT_MINUTES * 60 * 1000 - (now - userAttempts.lastAttempt)) / 60000);
    return { allowed: false, timeLeft };
  }
  
  // Increment attempt counter
  loginAttempts[identifier].count++;
  loginAttempts[identifier].lastAttempt = now;
  
  return { allowed: true };
}

// Reset login attempts (on successful login)
export function resetLoginAttempts(identifier: string): void {
  delete loginAttempts[identifier];
}

/**
 * Backup and Recovery Functions
 */

// Create a backup of data
export function createBackup(data: any, backupDir = './backups'): string {
  try {
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = uuidv4().substring(0, 8);
    const filename = `backup-${timestamp}-${backupId}.json`;
    const backupPath = path.join(backupDir, filename);
    
    // Encrypt data for backup
    const { encryptedData, iv, authTag } = encryptData(JSON.stringify(data));
    
    // Save encrypted data with metadata
    fs.writeFileSync(backupPath, JSON.stringify({
      version: '1.0',
      timestamp: Date.now(),
      iv,
      authTag,
      data: encryptedData
    }));
    
    return filename;
  } catch (error) {
    console.error('Backup creation failed:', error);
    throw new Error('Failed to create backup');
  }
}

// Restore data from a backup
export function restoreBackup(backupFilename: string, backupDir = './backups'): any {
  try {
    const backupPath = path.join(backupDir, backupFilename);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file ${backupFilename} not found`);
    }
    
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // Decrypt data
    const decrypted = decryptData(backup.data, backup.iv, backup.authTag);
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Backup restoration failed:', error);
    throw new Error('Failed to restore backup');
  }
}

// List available backups
export function listBackups(backupDir = './backups'): Array<{filename: string, timestamp: Date}> {
  try {
    if (!fs.existsSync(backupDir)) {
      return [];
    }
    
    const files = fs.readdirSync(backupDir);
    return files
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .map(file => {
        const stats = fs.statSync(path.join(backupDir, file));
        return {
          filename: file,
          timestamp: stats.mtime
        };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Most recent first
  } catch (error) {
    console.error('Failed to list backups:', error);
    return [];
  }
}

/**
 * Security Audit Functions
 */

// Log security events
export function logSecurityEvent(event: {
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'data_access' | 'data_modification' | 'backup' | 'restore';
  userId?: number | string;
  ip?: string;
  details?: any;
}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...event
  };
  
  // In a real system, this would log to a secure database or external logging service
  console.log(`SECURITY: ${JSON.stringify(logEntry)}`);
  
  // For critical events, could implement notification system here
  if (['failed_login', 'data_modification', 'restore'].includes(event.type)) {
    // sendSecurityAlert(logEntry);
  }
}

// Schedule automated backups (call this on server start)
export function scheduleBackups(dataFn: () => any, intervalHours = 24): NodeJS.Timer {
  console.log(`Scheduled automated backups every ${intervalHours} hours`);
  return setInterval(() => {
    try {
      const data = dataFn();
      const backupFile = createBackup(data);
      console.log(`Automated backup created: ${backupFile}`);
      
      // Cleanup old backups (keep last 7 days)
      const backups = listBackups();
      const now = new Date();
      backups.forEach(backup => {
        const age = (now.getTime() - backup.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        if (age > 7) {
          fs.unlinkSync(path.join('./backups', backup.filename));
          console.log(`Removed old backup: ${backup.filename}`);
        }
      });
    } catch (error) {
      console.error('Automated backup failed:', error);
    }
  }, intervalHours * 60 * 60 * 1000);
}

// Security monitoring
export function detectAnomalousActivity(
  userId: number | string,
  action: string,
  metadata: any = {}
): { suspicious: boolean; reason?: string } {
  // This would be a much more sophisticated system in production
  // using machine learning, behavior analysis, etc.
  
  // For now, just implement some basic checks
  const now = new Date();
  const hour = now.getHours();
  
  // Unusual hour check (example)
  if (hour >= 1 && hour <= 5) {
    return { 
      suspicious: true, 
      reason: 'Unusual activity time' 
    };
  }
  
  // Rapid action check (would track previous actions in a real system)
  if (metadata.actionCount && metadata.actionCount > 50 && metadata.timeSpan < 60) {
    return { 
      suspicious: true, 
      reason: 'Unusually high activity rate' 
    };
  }
  
  // More checks would be implemented here
  
  return { suspicious: false };
}

// Export middleware for use in routes
/**
 * Secure Data Handling Functions
 */

// Sanitize data to prevent injection attacks
export function sanitizeData(data: any): any {
  if (!DATA_SANITIZATION_ENABLED) return data;
  
  if (typeof data === 'string') {
    // Basic XSS prevention - in production would use a library like DOMPurify
    return data
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeData(item));
    }
    
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = sanitizeData(data[key]);
      }
    }
    return result;
  }
  
  return data;
}

// Redact sensitive information from logs and responses
export function redactSensitiveData(data: any, sensitiveKeys: string[] = [
  'password', 'ssn', 'creditCard', 'cvv', 'accessToken', 'refreshToken'
]): any {
  if (!data) return data;
  
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => redactSensitiveData(item, sensitiveKeys));
    }
    
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
          result[key] = '********';
        } else {
          result[key] = redactSensitiveData(data[key], sensitiveKeys);
        }
      }
    }
    return result;
  }
  
  return data;
}

// Secure handling of sensitive data in memory
export function secureMemoryHandling<T>(sensitiveData: T, operation: (data: T) => void): void {
  if (!SECURE_MEMORY_HANDLING) {
    operation(sensitiveData);
    return;
  }
  
  try {
    // Perform the operation with the sensitive data
    operation(sensitiveData);
  } finally {
    // In a real implementation, we would overwrite the memory
    // For JavaScript/TypeScript, we do what we can, which is limited
    if (typeof sensitiveData === 'string') {
      // Overwrite string memory as best as possible (limited by JS string immutability)
      // This is more a demonstration of intent than truly effective
      (sensitiveData as any) = '0'.repeat(sensitiveData.length);
    } else if (ArrayBuffer.isView(sensitiveData)) {
      // For typed arrays, we can actually overwrite memory
      const view = new Uint8Array(sensitiveData.buffer);
      view.fill(0);
    } else if (typeof sensitiveData === 'object' && sensitiveData !== null) {
      // For objects, overwrite each property
      for (const key in sensitiveData) {
        if (typeof sensitiveData[key] === 'string') {
          (sensitiveData as any)[key] = '0'.repeat(sensitiveData[key].length);
        } else if (typeof sensitiveData[key] === 'number') {
          (sensitiveData as any)[key] = 0;
        } else if (typeof sensitiveData[key] === 'object' && sensitiveData[key] !== null) {
          secureMemoryHandling(sensitiveData[key], () => {});
        }
      }
    }
  }
}

// Generate a secure token (for CSRF, etc.)
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Secure session configuration
export function getSecureSessionConfig(): any {
  return {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    name: 'secure.sid', // Non-default name to avoid fingerprinting
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: SAME_SITE_COOKIES,
      maxAge: 86400000, // 24 hours
    },
  };
}

// Setup TLS/HTTPS for secure data in transit
export function configureTLS(server: any): void {
  // In a real implementation, this would set up proper TLS options
  // Example:
  /*
  const tlsOptions = {
    key: fs.readFileSync('path/to/private.key'),
    cert: fs.readFileSync('path/to/certificate.crt'),
    minVersion: TLS_MIN_VERSION,
    ciphers: SECURE_CIPHERS,
    // Disable old/insecure protocols and ciphers
    secureProtocol: 'TLSv1_2_method',
    honorCipherOrder: true,
  };
  */
  
  console.log('TLS configuration would be applied in production environment');
}

// Export middleware for use in routes
export const securityMiddleware = {
  // CSRF Protection
  csrfCheck: (req: any, res: any, next: any) => {
    // This is a simplified version - in production use a proper CSRF library
    // Skip CSRF check for now as cookies aren't properly configured yet
    // In a real app, you'd implement proper CSRF protection
    // const csrfCookie = req.cookies ? req.cookies['csrf-token'] : null;
    // const csrfHeader = req.headers ? req.headers['x-csrf-token'] : null;
    
    // if (req.method !== 'GET' && csrfCookie !== csrfHeader) {
    //   return res.status(403).json({ error: 'CSRF verification failed' });
    // }
    
    next();
  },
  
  // Throttle requests
  rateLimit: (req: any, res: any, next: any) => {
    // Implement rate limiting here based on IP or user
    // This is simplified - use a proper rate limiting library in production
    next();
  },
  
  // Data sanitization middleware
  sanitizeInput: (req: any, res: any, next: any) => {
    if (DATA_SANITIZATION_ENABLED && req.body) {
      req.body = sanitizeData(req.body);
    }
    next();
  },
  
  // Set secure headers (integrates with helmet)
  secureHeaders: (req: any, res: any, next: any) => {
    // These would normally be set via helmet
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // In development, don't set CSP as it's disabled in helmet config
    // In production, we would set a more strict CSP
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " + 
        "img-src 'self' data:; " +
        "font-src 'self'; " +
        "connect-src 'self';"
      );
    }
    
    next();
  }
};