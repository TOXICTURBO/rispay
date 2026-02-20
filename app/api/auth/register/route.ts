import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation';
import { prisma } from '@/lib/db';
import { hashPassword, hashKey, generateSecureId } from '@/lib/hash';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationKey, username, password } = registerSchema.parse(body);

    // Hash the registration key to check against database
    const keyHash = hashKey(registrationKey);

    // Find unused registration key
    const regKey = await prisma.registrationKey.findUnique({
      where: { key_hash: keyHash },
    });

    if (!regKey || regKey.used) {
      return NextResponse.json(
        { error: 'Invalid or already used registration key' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const userId = generateSecureId(24);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          id: userId,
          username,
          password_hash: passwordHash,
          role: regKey.key_type === 'USER' ? 'USER' : 'PROVIDER',
        },
      });

      // Mark registration key as used
      await tx.registrationKey.update({
        where: { id: regKey.id },
        data: {
          used: true,
          used_by_id: newUser.id,
          used_at: new Date(),
        },
      });

      // Create user settings
      await tx.userSettings.create({
        data: {
          user_id: newUser.id,
          dark_mode: false,
          notifications_enabled: true,
        },
      });

      return newUser;
    });

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
