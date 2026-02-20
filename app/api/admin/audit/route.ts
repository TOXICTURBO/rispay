import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export const GET = withAuth(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

  const logs = await prisma.auditLog.findMany({
    include: {
      admin: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
    skip,
    take: limit,
  });

  const total = await prisma.auditLog.count();

  return NextResponse.json({
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}, [UserRole.ADMIN]);
