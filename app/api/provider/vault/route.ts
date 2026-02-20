import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { vaultTransferSchema } from '@/lib/validation';
import { generateSecureId } from '@/lib/hash';
import { UserRole } from '@prisma/client';

export const GET = withAuth(async (req: NextRequest, user) => {
  const banks = await prisma.bank.findMany({
    where: {
      provider_id: user.id,
    },
    select: {
      id: true,
      name: true,
      code: true,
      vault_balance: true,
      _count: {
        select: {
          accounts: true,
        },
      },
    },
  });

  const totalVault = banks.reduce(
    (sum, bank) => sum + Number(bank.vault_balance),
    0
  );

  return NextResponse.json({
    banks,
    totalVaultBalance: totalVault,
  });
}, [UserRole.PROVIDER]);

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { bankId, accountId, amount } = vaultTransferSchema.parse(body);

  // Verify bank belongs to provider
  const bank = await prisma.bank.findUnique({
    where: { id: bankId },
  });

  if (!bank || bank.provider_id !== user.id) {
    return NextResponse.json(
      { error: 'Bank not found or access denied' },
      { status: 403 }
    );
  }

  // Verify account belongs to this bank
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account || account.bank_id !== bankId) {
    return NextResponse.json(
      { error: 'Account not found or does not belong to this bank' },
      { status: 404 }
    );
  }

  if (Number(bank.vault_balance) < amount) {
    return NextResponse.json(
      { error: 'Insufficient vault balance' },
      { status: 400 }
    );
  }

  // Get system settings for vault transfer fee
  const settings = await prisma.systemSettings.findFirst();
  const vaultTransferFee = Number(settings?.vault_transfer_fee || 0.5);
  const feeAmount = amount * (vaultTransferFee / 100);

  await prisma.$transaction(async (tx) => {
    // Deduct from vault (including fee)
    await tx.bank.update({
      where: { id: bankId },
      data: {
        vault_balance: {
          decrement: amount + feeAmount,
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

    // Add fee to admin wallet
    await tx.systemSettings.updateMany({
      data: {
        admin_wallet_balance: {
          increment: feeAmount,
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
        system_tax: feeAmount,
        memo: 'Vault transfer',
        status: 'COMPLETED',
      },
    });
  });

  return NextResponse.json({ success: true });
}, [UserRole.PROVIDER]);
