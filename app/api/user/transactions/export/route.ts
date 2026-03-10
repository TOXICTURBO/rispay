import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export const GET = withAuth(async (req: NextRequest, user) => {
  const searchParams = req.nextUrl.searchParams;
  const format = searchParams.get('format') || 'json'; // 'json' or 'csv'
  const tag = searchParams.get('tag');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Get user's account IDs
  const accounts = await prisma.account.findMany({
    where: { user_id: user.id },
    select: { id: true },
  });

  const accountIds = accounts.map((a) => a.id);

  const where: any = {
    OR: [
      { sender_account_id: { in: accountIds } },
      { receiver_account_id: { in: accountIds } },
    ],
  };

  // Add filters
  if (tag) {
    where.tag = tag;
  }

  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) {
      where.created_at.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.created_at.lte = end;
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      sender_account: {
        include: {
          bank: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
      receiver_account: {
        include: {
          bank: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
    orderBy: {
      created_at: 'asc',
    },
  });

  if (format === 'csv') {
    // Generate CSV
    const headers = [
      'Date',
      'Type',
      'Amount',
      'Bank Fee',
      'Tax',
      'Total Deducted',
      'Other Party',
      'Status',
      'Memo',
      'Tag',
    ];

    const rows = transactions.map((tx) => {
      const isSent = accountIds.includes(tx.sender_account_id);
      const otherParty = isSent
        ? tx.receiver_account.user.username
        : tx.sender_account.user.username;

      return [
        new Date(tx.created_at).toISOString().split('T')[0],
        isSent ? 'Sent' : 'Received',
        Number(tx.amount).toFixed(2),
        Number(tx.fee).toFixed(2),
        Number(tx.tax).toFixed(2),
        Number(tx.amount) + Number(tx.fee) + Number(tx.tax),
        otherParty,
        tx.status,
        tx.memo || '',
        tx.tag || '',
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === 'string' && cell.includes(',')
              ? `"${cell}"`
              : cell
          )
          .join(',')
      ),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  // Default: JSON format
  const jsonData = transactions.map((tx) => {
    const isSent = accountIds.includes(tx.sender_account_id);
    return {
      id: tx.id,
      date: tx.created_at,
      type: isSent ? 'sent' : 'received',
      amount: Number(tx.amount),
      bankFee: Number(tx.fee),
      tax: Number(tx.tax),
      totalDeducted: Number(tx.amount) + Number(tx.fee) + Number(tx.tax),
      otherParty: isSent
        ? tx.receiver_account.user.username
        : tx.sender_account.user.username,
      status: tx.status,
      memo: tx.memo,
      tag: tx.tag,
      bankName: isSent
        ? tx.sender_account.bank.name
        : tx.receiver_account.bank.name,
    };
  });

  return new NextResponse(JSON.stringify(jsonData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}, [UserRole.USER]);
