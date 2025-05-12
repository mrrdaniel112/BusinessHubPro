import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, verifyPassword, checkLoginAttempts, resetLoginAttempts, logSecurityEvent } from './security';

// Token storage - in a production environment, this would be in a database
interface TokenData {
  userId: number;
  role: string;
  expires: number;
  issuedAt: number;
}

interface TwoFactorData {
  secret: string;
  verified: boolean;
  backupCodes: string[];
}

const accessTokens: Map<string, TokenData> = new Map();
const refreshTokens: Map<string, TokenData> = new Map();
const twoFactorAuth: Map<number, TwoFactorData> = new Map();

// Configuration
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Generate a random JWT secret if one is not provided
// In production, always set this via environment variable
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

/**
 * Enhanced user authentication with support for:
 * - Password hashing
 * - Rate limiting
 * - Token-based authentication (JWT)
 * - 2FA (time-based one-time passwords)
 */
export class EnhancedAuth {
  /**
   * Registers a new user with secure password hashing
   */
  static async registerUser(userData: any): Promise<any> {
    // Validate password strength (implement your own policy)
    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Replace plain text password with hash
    const newUser = {
      ...userData,
      password: hashedPassword,
    };

    // Log the registration event
    logSecurityEvent({
      type: 'login',
      userId: newUser.id,
      details: { action: 'register' }
    });

    return newUser;
  }

  /**
   * Authenticates a user and issues access tokens
   */
  static async loginUser(email: string, password: string, ip: string): Promise<{ user: any, accessToken: string, refreshToken: string } | null> {
    // Apply rate limiting
    const rateLimit = checkLoginAttempts(email);
    if (!rateLimit.allowed) {
      throw new Error(`Too many login attempts. Please try again in ${rateLimit.timeLeft} minutes.`);
    }

    // This is just a placeholder for a database query
    // In production, this should be replaced with an actual database query
    // SECURITY NOTE: In a real implementation, users should be stored in a database,
    // and passwords should be properly hashed. The code below is just for demonstration.
    
    // FOR GITHUB: This should be replaced with actual database queries in production
    // Remove this mock data before deploying to production!
    interface MockUser {
      id: number;
      email: string;
      name: string;
      password: string;
      role: string;
    }
    
    // Empty array for security - in production, query a real database
    const mockUsers: MockUser[] = [];

    const user = mockUsers.find(u => u.email === email);

    // User not found
    if (!user) {
      // Log failed attempt
      logSecurityEvent({
        type: 'failed_login',
        ip,
        details: { reason: 'user_not_found', email }
      });
      return null;
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      // Log failed attempt
      logSecurityEvent({
        type: 'failed_login',
        userId: user.id,
        ip,
        details: { reason: 'invalid_password' }
      });
      return null;
    }

    // Check if 2FA is enabled for this user
    if (twoFactorAuth.has(user.id) && twoFactorAuth.get(user.id)?.verified) {
      // Return partial auth, requiring 2FA code
      return {
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          requiresTwoFactor: true
        },
        accessToken: '',
        refreshToken: ''
      };
    }

    // Authentication successful, generate tokens
    resetLoginAttempts(email);
    
    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Log successful login
    logSecurityEvent({
      type: 'login',
      userId: user.id,
      ip,
      details: { success: true }
    });

    // Return user data and tokens
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  /**
   * Verify a two-factor authentication code
   */
  static verifyTwoFactorCode(userId: number, code: string): boolean {
    // In a real implementation, this would verify a TOTP code
    // For this example, we'll use a simplified approach
    
    const twoFactorData = twoFactorAuth.get(userId);
    if (!twoFactorData) {
      return false;
    }
    
    // For demo purposes, any 6-digit code is accepted
    const isValid = /^\d{6}$/.test(code);
    
    if (isValid) {
      // Log successful 2FA verification
      logSecurityEvent({
        type: 'login',
        userId,
        details: { action: '2fa_verified' }
      });
    } else {
      // Log failed 2FA attempt
      logSecurityEvent({
        type: 'failed_login',
        userId,
        details: { reason: 'invalid_2fa_code' }
      });
    }
    
    return isValid;
  }

  /**
   * Enable two-factor authentication for a user
   */
  static enableTwoFactor(userId: number): { secret: string, backupCodes: string[] } {
    // Generate a secret key for TOTP
    const secret = crypto.randomBytes(20).toString('hex');
    
    // Generate backup codes
    const backupCodes = Array(10).fill(0).map(() => 
      crypto.randomBytes(4).toString('hex')
    );
    
    // Store 2FA data
    twoFactorAuth.set(userId, {
      secret,
      verified: false, // Requires verification with a valid code
      backupCodes
    });
    
    // Log 2FA setup
    logSecurityEvent({
      type: 'data_modification',
      userId,
      details: { action: '2fa_enabled' }
    });
    
    return { secret, backupCodes };
  }

  /**
   * Verify a user's identity with 2FA before enabling it
   */
  static verifyAndEnableTwoFactor(userId: number, code: string): boolean {
    const twoFactorData = twoFactorAuth.get(userId);
    if (!twoFactorData) {
      return false;
    }
    
    // In a real app, verify the code against the secret
    // For this example, any 6-digit code is valid
    const isValid = /^\d{6}$/.test(code);
    
    if (isValid) {
      // Mark as verified
      twoFactorData.verified = true;
      twoFactorAuth.set(userId, twoFactorData);
      
      logSecurityEvent({
        type: 'data_modification',
        userId,
        details: { action: '2fa_verified' }
      });
    }
    
    return isValid;
  }

  /**
   * Disable two-factor authentication for a user
   */
  static disableTwoFactor(userId: number): boolean {
    const result = twoFactorAuth.delete(userId);
    
    if (result) {
      logSecurityEvent({
        type: 'data_modification',
        userId,
        details: { action: '2fa_disabled' }
      });
    }
    
    return result;
  }

  /**
   * Generate a new JWT access token
   */
  private static generateAccessToken(user: any): string {
    const tokenId = uuidv4();
    const now = Date.now();
    
    // Store token data
    accessTokens.set(tokenId, {
      userId: user.id,
      role: user.role,
      issuedAt: now,
      expires: now + ACCESS_TOKEN_EXPIRY
    });
    
    // Create JWT payload
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      jti: tokenId,
      iat: Math.floor(now / 1000),
      exp: Math.floor((now + ACCESS_TOKEN_EXPIRY) / 1000)
    };
    
    // Sign JWT
    return this.signJWT(payload);
  }

  /**
   * Generate a new JWT refresh token
   */
  private static generateRefreshToken(user: any): string {
    const tokenId = uuidv4();
    const now = Date.now();
    
    // Store token data
    refreshTokens.set(tokenId, {
      userId: user.id,
      role: user.role,
      issuedAt: now,
      expires: now + REFRESH_TOKEN_EXPIRY
    });
    
    // Create JWT payload
    const payload = {
      sub: user.id,
      jti: tokenId,
      iat: Math.floor(now / 1000),
      exp: Math.floor((now + REFRESH_TOKEN_EXPIRY) / 1000)
    };
    
    // Sign JWT
    return this.signJWT(payload);
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string, type: 'access' | 'refresh'): any {
    try {
      // Decode JWT
      const payload = this.decodeJWT(token);
      
      // Check if token exists in our store
      const tokenStorage = type === 'access' ? accessTokens : refreshTokens;
      const storedToken = tokenStorage.get(payload.jti);
      
      if (!storedToken) {
        throw new Error('Invalid token');
      }
      
      // Check if token has expired
      if (storedToken.expires < Date.now()) {
        // Remove expired token
        tokenStorage.delete(payload.jti);
        throw new Error('Token expired');
      }
      
      return {
        userId: storedToken.userId,
        role: storedToken.role
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token using a valid refresh token
   */
  static refreshAccessToken(refreshToken: string): { accessToken: string } | null {
    try {
      const tokenData = this.verifyToken(refreshToken, 'refresh');
      
      if (!tokenData) {
        return null;
      }
      
      // Mock user lookup
      const user = {
        id: tokenData.userId,
        name: 'User',
        email: 'user@example.com',
        role: tokenData.role
      };
      
      // Generate new access token
      const accessToken = this.generateAccessToken(user);
      
      return { accessToken };
    } catch (error) {
      return null;
    }
  }

  /**
   * Revoke a token (logout)
   */
  static revokeToken(token: string, type: 'access' | 'refresh'): boolean {
    try {
      // Decode JWT
      const payload = this.decodeJWT(token);
      
      // Remove from token storage
      const tokenStorage = type === 'access' ? accessTokens : refreshTokens;
      const removed = tokenStorage.delete(payload.jti);
      
      if (removed) {
        logSecurityEvent({
          type: 'logout',
          userId: payload.sub,
          details: { tokenType: type }
        });
      }
      
      return removed;
    } catch (error) {
      return false;
    }
  }

  /**
   * Revoke all tokens for a user (force logout from all devices)
   */
  static revokeAllTokensForUser(userId: number): void {
    // Remove access tokens
    Array.from(accessTokens.entries()).forEach(([tokenId, data]) => {
      if (data.userId === userId) {
        accessTokens.delete(tokenId);
      }
    });
    
    // Remove refresh tokens
    Array.from(refreshTokens.entries()).forEach(([tokenId, data]) => {
      if (data.userId === userId) {
        refreshTokens.delete(tokenId);
      }
    });
    
    logSecurityEvent({
      type: 'logout',
      userId,
      details: { action: 'revoke_all_tokens' }
    });
  }

  /**
   * Sign a JWT payload
   */
  private static signJWT(payload: any): string {
    // In a real implementation, you would use a JWT library
    // For this example, we'll create a simplified version
    
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Decode and verify a JWT token
   */
  private static decodeJWT(token: string): any {
    // Split token
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
    
    return payload;
  }

  /**
   * Security middleware that can be used in Express routes
   */
  static authMiddleware(requiredRole?: string) {
    return (req: any, res: any, next: any) => {
      try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const userData = this.verifyToken(token, 'access');
        if (!userData) {
          return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
        
        // Check role if required
        if (requiredRole && userData.role !== requiredRole && userData.role !== 'admin') {
          return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
        }
        
        // Attach user data to request
        req.user = userData;
        
        next();
      } catch (error) {
        return res.status(401).json({ error: 'Unauthorized - Token verification failed' });
      }
    };
  }
}

// Export JWT authentication middleware 
export const requireAuth = EnhancedAuth.authMiddleware();
export const requireAdmin = EnhancedAuth.authMiddleware('admin');