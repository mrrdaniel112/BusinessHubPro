import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import * as speakeasy from 'speakeasy';
import crypto from 'crypto';

// Generate verification token for email
export async function createVerificationToken(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.update(users)
    .set({
      emailVerificationToken: token,
      emailVerificationExpires: expires
    })
    .where(eq(users.id, userId));

  return token;
}

// Verify email token
export async function verifyEmailToken(token: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.emailVerificationToken, token)
  });

  if (!user || !user.emailVerificationExpires) {
    return false;
  }

  if (new Date() > new Date(user.emailVerificationExpires)) {
    return false;
  }

  await db.update(users)
    .set({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    })
    .where(eq(users.id, user.id));

  return true;
}

// Setup 2FA for a user
export async function setup2FA(userId: number): Promise<{ secret: string; backupCodes: string[] }> {
  const secret = speakeasy.generateSecret();
  const backupCodes = Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex')
  );

  await db.update(users)
    .set({
      twoFactorSecret: secret.base32,
      twoFactorBackupCodes: JSON.stringify(backupCodes),
      twoFactorEnabled: true
    })
    .where(eq(users.id, userId));

  return {
    secret: secret.base32,
    backupCodes
  };
}

// Verify 2FA code
export async function verify2FACode(userId: number, code: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  if (!user?.twoFactorSecret) {
    return false;
  }

  // Check if it's a backup code
  if (user.twoFactorBackupCodes) {
    const backupCodes = JSON.parse(user.twoFactorBackupCodes);
    const backupIndex = backupCodes.indexOf(code);
    
    if (backupIndex !== -1) {
      // Remove used backup code
      backupCodes.splice(backupIndex, 1);
      await db.update(users)
        .set({ twoFactorBackupCodes: JSON.stringify(backupCodes) })
        .where(eq(users.id, userId));
      return true;
    }
  }

  // Verify TOTP code
  return speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 1 // Allow 30 seconds window
  });
} 