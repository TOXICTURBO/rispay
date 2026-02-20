import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { sendMoneySchema } from '@/lib/validation';
import { generateSecureId } from '@/lib/hash';
import { verifyPassword } from '@/lib/hash';
import { rateLimit } from '@/lib/rateLimit';
import { UserRole } from '@prisma/client';

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { recipient, amount, senderAccountId, memo, pin } = sendMoneySchema.parse(body);

  // Rate limiting for transfers
  if (!rateLimit(`transfer:${user.id}`, 10, 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many transfer attempts. Please wait a moment.' },
      { status: 429 }
    );
  }

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

  // Verify PIN
  const userSettings = await prisma.userSettings.findUnique({
    where: { user_id: user.id },
  });

  if (!userSettings || !userSettings.transaction_pin_hash) {
    return NextResponse.json(
      { error: 'Transaction PIN not set' },
      { status: 400 }
    );
  }

  const isValidPin = await verifyPassword(pin, userSettings.transaction_pin_hash);
  if (!isValidPin) {
    return NextResponse.json(
      { error: 'Invalid PIN' },
      { status: 401 }
    );
  }

  // Check maintenance mode
  if (senderAccount.bank.maintenance_mode) {
    return NextResponse.json(
      { error: 'Bank is in maintenance mode' },
      { status: 400 }
    );
  }

  // Find receiver account
  let receiverAccount = await prisma.account.findUnique({
    where: { id: recipient },
    include: {
      user: true,
      bank: true,
    },
  });

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

  if (!receiverAccount || !receiverAccount.activated_at) {
    return NextResponse.json(
      { error: 'Recipient account not found or not activated' },
      { status: 404 }
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
  const currentBalance = Number(senderAccount.balance);

  if (currentBalance < totalDeducted) {
    return NextResponse.json(
      { error: 'Insufficient balance' },
      { status: 400 }
    );
  }

  // Execute transaction atomically
  const transaction = await prisma.$transaction(async (tx) => {
    // Deduct from sender
    await tx.account.update({
      where: { id: senderAccountId },
      data: {
        balance: {
          decrement: totalDeducted,
        },
      },
    });

    // Add to receiver
    await tx.account.update({
      where: { id: receiverAccount.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    // Add bank fee to vault
    if (bankFee > 0) {
      await tx.bank.update({
        where: { id: senderAccount.bank_id },
        data: {
          vault_balance: {
            increment: bankFee,
          },
        },
      });
    }

    // Add tax to admin wallet
    if (tax > 0) {
      await tx.systemSettings.updateMany({
        data: {
          admin_wallet_balance: {
            increment: tax,
          },
        },
      });
    }

    // Create transaction record
    const txRecord = await tx.transaction.create({
      data: {
        id: generateSecureId(24),
        sender_account_id: senderAccountId,
        receiver_account_id: receiverAccount.id,
        amount,
        bank_fee: bankFee,
        system_tax: tax,
        memo: memo || null,
        status: 'COMPLETED',
      },
    });

    return txRecord;
  });

  return NextResponse.json({
    success: true,
    transaction: {
      id: transaction.id,
      amount,
      bankFee,
      tax,
      totalDeducted,
    },
  });
}, [UserRole.USER]);
