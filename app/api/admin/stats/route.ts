import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export const GET = withAuth(async () => {
  const [
    totalUsers,
    totalProviders,
    totalBanks,
    totalAccounts,
    totalTransactions,
    systemSettings,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'PROVIDER' } }),
    prisma.bank.count(),
    prisma.account.count(),
    prisma.transaction.count(),
    prisma.systemSettings.findFirst(),
  ]);

  const totalVaultBalance = await prisma.bank.aggregate({
    _sum: {
      vault_balance: true,
    },
  });

  const totalAccountBalance = await prisma.account.aggregate({
    _sum: {
      balance: true,
    },
  });

  return NextResponse.json({
    stats: {
      totalUsers,
      totalProviders,
      totalBanks,
      totalAccounts,
      totalTransactions,
      totalVaultBalance: Number(totalVaultBalance._sum.vault_balance || 0),
      totalAccountBalance: Number(totalAccountBalance._sum.balance || 0),
      adminWalletBalance: Number(systemSettings?.admin_wallet_balance || 0),
      systemSettings: {
        maxBankFeeCap: Number(systemSettings?.max_bank_fee_cap || 0),
        globalTaxPercentage: Number(systemSettings?.global_tax_percentage || 0),
        inflationRate: Number(systemSettings?.inflation_rate || 0),
        taxEnabled: systemSettings?.tax_enabled ?? true,
        inflationEnabled: systemSettings?.inflation_enabled ?? false,
      },
    },
  });
}, [UserRole.ADMIN]);
