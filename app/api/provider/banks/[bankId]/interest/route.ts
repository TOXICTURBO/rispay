import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const updateInterestSchema = z.object({
  interestRate: z.number().min(0).max(100).nullable(),
});

export const PUT = withAuth(async (req: NextRequest, user) => {
  const { searchParams } = new URL(req.url);
  const bankId = searchParams.get('bankId') || req.url.split('/').slice(-2)[0];
  const body = await req.json();
  const { interestRate } = updateInterestSchema.parse(body);

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

  const updatedBank = await prisma.bank.update({
    where: { id: bankId },
    data: {
      interest_rate: interestRate,
    },
  });

  return NextResponse.json({
    success: true,
    bank: updatedBank,
  });
}, [UserRole.PROVIDER]);
