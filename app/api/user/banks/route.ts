import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export const GET = withAuth(async (req: NextRequest, user) => {
  const links = await prisma.userBankLink.findMany({
    where: {
      user_id: user.id,
    },
    include: {
      bank: {
        select: {
          id: true,
          name: true,
          code: true,
          maintenance_mode: true,
        },
      },
    },
  });

  return NextResponse.json({ banks: links.map((link) => link.bank) });
}, [UserRole.USER]);
