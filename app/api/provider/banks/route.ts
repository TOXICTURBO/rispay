import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export const GET = withAuth(async (req: NextRequest, user) => {
  const banks = await prisma.bank.findMany({
    where: {
      provider_id: user.id,
    },
    include: {
      _count: {
        select: {
          accounts: true,
          user_bank_links: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return NextResponse.json({ banks });
}, [UserRole.PROVIDER]);
