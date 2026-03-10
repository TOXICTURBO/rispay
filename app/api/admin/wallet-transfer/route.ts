import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { generateSecureId } from '@/lib/hash';
import { UserRole } from '@prisma/client';

const walletTransferSchema = z.object({
  recipientUsername: z.string().min(1),
  amount: z.number().positive(),
  memo: z.string().optional(),
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { recipientUsername, amount, memo } = walletTransferSchema.parse(body);

  // Get system settings for admin wallet balance
  const settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    return NextResponse.json(
      { error: 'System settings not found' },
      { status: 500 }
    );
  }

  // Check admin wallet balance
  const adminBalance = Number(settings.admin_wallet_balance);
  if (adminBalance < amount) {
    return NextResponse.json(
      { error: 'Insufficient admin wallet balance' },
      { status: 400 }
    );
  }

  // Find recipient
  const recipient = await prisma.user.findUnique({
    where: { username: recipientUsername },
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

  if (!recipient || recipient.accounts.length === 0) {
    return NextResponse.json(
      { error: 'Recipient not found or has no active account' },
      { status: 404 }
    );
  }

  const recipientAccount = recipient.accounts[0];

  // Perform atomic transaction
  const transaction = await prisma.$transaction(async (tx) => {
    // Deduct from admin wallet
    await tx.systemSettings.update({
      where: { id: 'default' },
      data: {
        admin_wallet_balance: {
          decrement: amount,
        },
      },
    });

    // Create transaction record (admin as sender, using special system account)
    const txRecord = await tx.transaction.create({
      data: {
        id: generateSecureId(24),
        sender_account_id: user.id, // Use admin user ID as placeholder
        receiver_account_id: recipientAccount.id,
        amount,
        bank_fee: 0, // No fee for admin transfers
        system_tax: 0, // No tax for admin transfers
        memo: memo || 'Admin wallet transfer',
        status: 'COMPLETED',
      },
    });

    // Credit recipient account
    await tx.account.update({
      where: { id: recipientAccount.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    // Log audit
    await tx.auditLog.create({
      data: {
        id: generateSecureId(24),
        admin_id: user.id,
        action_type: 'ADMIN_WALLET_TRANSFER',
        details: {
          recipient: recipientUsername,
          amount,
          accountId: recipientAccount.id,
          memo,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return txRecord;
  });

  return NextResponse.json({
    success: true,
    transaction,
    message: `Successfully transferred $${amount} from admin wallet to ${recipientUsername}`,
  });
}, [UserRole.ADMIN]);

export const GET = withAuth(async () => {
  const settings = await prisma.systemSettings.findFirst();
  return NextResponse.json({
    adminWalletBalance: settings?.admin_wallet_balance || 0,
  });
}, [UserRole.ADMIN]);
