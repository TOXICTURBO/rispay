import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export const GET = withAuth(async (req: NextRequest, user) => {
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Get user's account IDs
  const accounts = await prisma.account.findMany({
    where: { user_id: user.id },
    select: { id: true },
  });

  const accountIds = accounts.map((a) => a.id);

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { sender_account_id: { in: accountIds } },
        { receiver_account_id: { in: accountIds } },
      ],
    },
    include: {
      sender_account: {
        include: {
          bank: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      },
      receiver_account: {
        include: {
          bank: {
            select: {
              name: true,
              code: true,
            },
          },
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
    take: limit,
    skip: offset,
  });

  return NextResponse.json({ transactions });
}, [UserRole.USER]);
