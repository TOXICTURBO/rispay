import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimit(`login:${clientId}:${username}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const user = await authenticateUser(username, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const token = generateToken(user);
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
