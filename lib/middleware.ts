import { NextRequest, NextResponse } from 'next/server';
import { requireRole, getAuthUser } from './auth';
import { UserRole } from '@prisma/client';

/**
 * Create API route handler with role-based access control
 */
export function withAuth(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
  allowedRoles?: UserRole[]
) {
  return async (req: NextRequest) => {
    try {
      const user = allowedRoles
        ? await requireRole(req, allowedRoles)
        : await getAuthUser(req);

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      return await handler(req, user);
    } catch (error: any) {
      if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
        return NextResponse.json(
          { error: error.message },
          { status: error.message === 'Unauthorized' ? 401 : 403 }
        );
      }
      console.error('API error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
