import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const previewSchema = z.object({
  senderAccountId: z.string(),
  recipient: z.string(),
  amount: z.number().positive(),
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { senderAccountId, recipient, amount } = previewSchema.parse(body);

  // Verify sender account belongs to user
  const senderAccount = await prisma.account.findUnique({
    where: { id: senderAccountId },
    include: {
      bank: true,
    },
  });

  if (!senderAccount || senderAccount.user_id !== user.id) {
    return NextResponse.json(
      { error: 'Invalid sender account' },
      { status: 400 }
    );
  }

  if (!senderAccount.activated_at) {
    return NextResponse.json(
      { error: 'Account not activated' },
      { status: 400 }
    );
  }

  // Find receiver account (by username or account ID)
  let receiverAccount = await prisma.account.findUnique({
    where: { id: recipient },
    include: {
      user: true,
      bank: true,
    },
  });

  // If not found by ID, try finding by username
  if (!receiverAccount) {
    const receiverUser = await prisma.user.findUnique({
      where: { username: recipient },
      include: {
        accounts: {
          where: {
            is_primary: true,
            activated_at: { not: null },
          },
          include: {
            bank: true,
          },
        },
      },
    });

    if (receiverUser && receiverUser.accounts.length > 0) {
      receiverAccount = receiverUser.accounts[0];
    }
  }

  if (!receiverAccount) {
    return NextResponse.json(
      { error: 'Recipient not found' },
      { status: 404 }
    );
  }

  // Check maintenance mode
  if (senderAccount.bank.maintenance_mode) {
    return NextResponse.json(
      { error: 'Bank is in maintenance mode' },
      { status: 400 }
    );
  }

  // Get system settings
  const settings = await prisma.systemSettings.findFirst();

  // Calculate fees
  const bankFeePercentage = Number(senderAccount.bank.base_fee_percentage);
  const bankFee = amount * (bankFeePercentage / 100);

  const taxPercentage = settings?.tax_enabled
    ? Number(settings.global_tax_percentage)
    : 0;
  const tax = amount * (taxPercentage / 100);

  const totalDeducted = amount + bankFee + tax;
  const receiverReceives = amount;

  return NextResponse.json({
    preview: {
      amount,
      bankFeePercentage,
      bankFee,
      taxPercentage,
      tax,
      totalDeducted,
      receiverReceives,
      senderBalance: Number(senderAccount.balance),
      receiverUsername: receiverAccount.user.username,
      receiverAccountId: receiverAccount.id,
    },
  });
}, [UserRole.USER]);
