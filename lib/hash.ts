import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Hash a registration key or invite code using SHA-256
 * Keys should be hashed before storage for security
 */
export function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Generate a secure random string of specified length
 */
export function generateSecureId(length: number = 24): string {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
}

/**
 * Generate a 32-character registration key
 */
export function generateRegistrationKey(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate a bank invite code: BANKCODE-RANDOM6
 */
export function generateBankInviteCode(bankCode: string): string {
  const randomPart = crypto.randomBytes(3).toString('hex').substring(0, 6).toUpperCase();
  return `${bankCode}-${randomPart}`;
}

/**
 * Generate a 6-character request code for account creation
 */
export function generateRequestCode(): string {
  return crypto.randomBytes(3).toString('hex').substring(0, 6).toUpperCase();
}

/**
 * Generate a 32-character activation key
 */
export function generateActivationKey(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate avatar color from username hash
 * Returns a hex color string
 */
export function getAvatarColor(username: string): string {
  const hash = crypto.createHash('md5').update(username).digest('hex');
  const hue = parseInt(hash.substring(0, 2), 16) % 360;
  const saturation = 65 + (parseInt(hash.substring(2, 4), 16) % 20); // 65-85%
  const lightness = 45 + (parseInt(hash.substring(4, 6), 16) % 15); // 45-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
