import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export const GET = withAuth(async (req: NextRequest, user) => {
  const accounts = await prisma.account.findMany({
    where: {
      user_id: user.id,
      activated_at: { not: null },
    },
    include: {
      bank: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
    orderBy: [
      { is_primary: 'desc' },
      { created_at: 'desc' },
    ],
  });

  return NextResponse.json({ accounts });
}, [UserRole.USER]);
