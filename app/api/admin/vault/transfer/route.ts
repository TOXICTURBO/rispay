import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { vaultTransferSchema } from '@/lib/validation';
import { generateSecureId } from '@/lib/hash';
import { UserRole } from '@prisma/client';

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { bankId, accountId, amount } = vaultTransferSchema.parse(body);

  const bank = await prisma.bank.findUnique({
    where: { id: bankId },
  });

  if (!bank) {
    return NextResponse.json(
      { error: 'Bank not found' },
      { status: 404 }
    );
  }

  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    return NextResponse.json(
      { error: 'Account not found' },
      { status: 404 }
    );
  }

  if (Number(bank.vault_balance) < amount) {
    return NextResponse.json(
      { error: 'Insufficient vault balance' },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    // Deduct from vault (admin transfers are fee-free)
    await tx.bank.update({
      where: { id: bankId },
      data: {
        vault_balance: {
          decrement: amount,
        },
      },
    });

    // Add to account
    await tx.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    // Create transaction record
    await tx.transaction.create({
      data: {
        id: generateSecureId(24),
        sender_account_id: accountId,
        receiver_account_id: accountId,
        amount,
        bank_fee: 0,
        system_tax: 0,
        memo: 'Admin vault transfer',
        status: 'COMPLETED',
      },
    });
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      id: generateSecureId(24),
      admin_id: user.id,
      action_type: 'VAULT_TRANSFER',
      details: {
        bankId,
        accountId,
        amount,
        timestamp: new Date().toISOString(),
      },
    },
  });

  return NextResponse.json({ success: true });
}, [UserRole.ADMIN]);
