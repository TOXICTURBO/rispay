import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { creditDebitSchema } from '@/lib/validation';
import { generateSecureId } from '@/lib/hash';
import { UserRole } from '@prisma/client';

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { accountId, amount, memo } = creditDebitSchema.parse(body);

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { user: true },
  });

  if (!account) {
    return NextResponse.json(
      { error: 'Account not found' },
      { status: 404 }
    );
  }

  const newBalance = Number(account.balance) + amount;

  if (newBalance < 0) {
    return NextResponse.json(
      { error: 'Insufficient balance' },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: accountId },
      data: {
        balance: newBalance,
      },
    });

    // Create transaction record
    await tx.transaction.create({
      data: {
        id: generateSecureId(24),
        sender_account_id: accountId,
        receiver_account_id: accountId,
        amount: Math.abs(amount),
        bank_fee: 0,
        system_tax: 0,
        memo: memo || (amount > 0 ? 'Admin credit' : 'Admin debit'),
        status: 'COMPLETED',
      },
    });
  });

  return NextResponse.json({
    success: true,
    newBalance,
  });
}, [UserRole.ADMIN]);
