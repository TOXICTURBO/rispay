import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { UserRole, type Transaction } from '@prisma/client';

export const GET = withAuth(async (req: NextRequest, user) => {
  // Get user's account IDs
  const accounts = await prisma.account.findMany({
    where: { user_id: user.id },
    select: { id: true },
  });

  const accountIds = accounts.map((a) => a.id);

  if (accountIds.length === 0) {
    return NextResponse.json({
      totalSent: 0,
      totalReceived: 0,
      largestTransaction: null,
      dailyAverage: 0,
      transactions30Days: [],
    });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get transactions for this month
  const monthlyTransactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { sender_account_id: { in: accountIds } },
        { receiver_account_id: { in: accountIds } },
      ],
      created_at: { gte: startOfMonth },
      status: 'COMPLETED',
    },
  });

  // Calculate totals
  let totalSent = 0;
  let totalReceived = 0;
  let largestAmount = 0;
  let largestTransaction: Transaction | null = null;

  monthlyTransactions.forEach((tx) => {
    const amount = Number(tx.amount);
    const isSent = accountIds.includes(tx.sender_account_id);
    const isReceived = accountIds.includes(tx.receiver_account_id);

    if (isSent && !isReceived) {
      totalSent += amount;
    } else if (isReceived && !isSent) {
      totalReceived += amount;
    }

    if (amount > largestAmount) {
      largestAmount = amount;
      largestTransaction = tx;
    }
  });

  // Get 30-day transaction data for chart
  const transactions30Days = await prisma.transaction.findMany({
    where: {
      OR: [
        { sender_account_id: { in: accountIds } },
        { receiver_account_id: { in: accountIds } },
      ],
      created_at: { gte: thirtyDaysAgo },
      status: 'COMPLETED',
    },
    select: {
      amount: true,
      created_at: true,
      sender_account_id: true,
      receiver_account_id: true,
    },
    orderBy: {
      created_at: 'asc',
    },
  });

  // Group by day
  const dailyData: Record<string, { sent: number; received: number }> = {};
  transactions30Days.forEach((tx) => {
    const date = tx.created_at.toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { sent: 0, received: 0 };
    }

    const amount = Number(tx.amount);
    if (accountIds.includes(tx.sender_account_id)) {
      dailyData[date].sent += amount;
    }
    if (accountIds.includes(tx.receiver_account_id)) {
      dailyData[date].received += amount;
    }
  });

  const dailyAverage = totalSent / 30;

  const largestTransactionPayload: { id: string; amount: number; date: Date } | null =
    largestTransaction === null
      ? null
      : {
          id: largestTransaction.id,
          amount: Number(largestTransaction.amount),
          date: largestTransaction.created_at,
        };

  return NextResponse.json({
    totalSent,
    totalReceived,
    largestTransaction: largestTransactionPayload,
    dailyAverage,
    transactions30Days: Object.entries(dailyData).map(([date, data]) => ({
      date,
      sent: data.sent,
      received: data.received,
    })),
  });
}, [UserRole.USER]);
