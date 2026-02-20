import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './db';
import { verifyPassword } from './hash';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
}

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(user: AuthUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify JWT token and return payload
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get authenticated user from request
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, username: true, role: true },
  });

  return user;
}

/**
 * Authenticate user with username and password
 */
export async function authenticateUser(
  username: string,
  password: string
): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) return null;

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) return null;

  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

/**
 * Set auth cookie
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.delete('auth_token');
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Middleware to require specific role
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthUser> {
  const user = await requireAuth(request);
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
}
