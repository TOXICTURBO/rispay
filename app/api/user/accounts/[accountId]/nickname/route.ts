import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { updateAccountNicknameSchema } from '@/lib/validation';
import { UserRole } from '@prisma/client';

export const PUT = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { accountId, nickname } = updateAccountNicknameSchema.parse(body);

  // Verify account belongs to user
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account || account.user_id !== user.id) {
    return NextResponse.json(
      { error: 'Account not found or access denied' },
      { status: 404 }
    );
  }

  await prisma.account.update({
    where: { id: accountId },
    data: {
      nickname: nickname || null,
    },
  });

  return NextResponse.json({ success: true });
}, [UserRole.USER]);
