import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { setPrimaryAccountSchema } from '@/lib/validation';
import { UserRole } from '@prisma/client';

export const PUT = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { accountId } = setPrimaryAccountSchema.parse(body);

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

  if (!account.activated_at) {
    return NextResponse.json(
      { error: 'Account not activated' },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    // Remove primary flag from all accounts in this bank
    await tx.account.updateMany({
      where: {
        user_id: user.id,
        bank_id: account.bank_id,
      },
      data: {
        is_primary: false,
      },
    });

    // Set this account as primary
    await tx.account.update({
      where: { id: accountId },
      data: {
        is_primary: true,
      },
    });
  });

  return NextResponse.json({ success: true });
}, [UserRole.USER]);
