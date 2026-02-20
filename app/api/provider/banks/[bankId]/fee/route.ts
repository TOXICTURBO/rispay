import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { updateBankFeeSchema } from '@/lib/validation';
import { UserRole } from '@prisma/client';

export const PUT = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { bankId, feePercentage } = updateBankFeeSchema.parse(body);

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

  // Check against admin cap
  const settings = await prisma.systemSettings.findFirst();
  const maxCap = Number(settings?.max_bank_fee_cap || 5.0);

  if (feePercentage > maxCap) {
    return NextResponse.json(
      { error: `Fee exceeds maximum cap of ${maxCap}%` },
      { status: 400 }
    );
  }

  const updatedBank = await prisma.bank.update({
    where: { id: bankId },
    data: {
      base_fee_percentage: feePercentage,
    },
  });

  return NextResponse.json({
    success: true,
    bank: updatedBank,
  });
}, [UserRole.PROVIDER]);
