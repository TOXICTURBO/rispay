import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export const GET = withAuth(async (req: NextRequest, user) => {
  // Get user's account IDs
  const accounts = await prisma.account.findMany({
    where: { user_id: user.id },
    select: { id: true },
  });

  const accountIds = accounts.map((a) => a.id);

  // Get all unique tags for user's transactions
  const tagsResult = await prisma.transaction.findMany({
    where: {
      OR: [
        { sender_account_id: { in: accountIds } },
        { receiver_account_id: { in: accountIds } },
      ],
      tag: {
        not: null,
      },
    },
    select: {
      tag: true,
    },
    distinct: ['tag'],
  });

  const tags = tagsResult
    .map((t) => t.tag)
    .filter((tag) => tag !== null)
    .sort();

  return NextResponse.json({ tags });
}, [UserRole.USER]);
