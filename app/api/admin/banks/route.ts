import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { createBankSchema } from '@/lib/validation';
import { generateSecureId } from '@/lib/hash';
import { UserRole } from '@prisma/client';

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { name, code, providerId } = createBankSchema.parse(body);

  // Verify provider exists and is a PROVIDER role
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
  });

  if (!provider || provider.role !== 'PROVIDER') {
    return NextResponse.json(
      { error: 'Invalid provider' },
      { status: 400 }
    );
  }

  // Check if bank code already exists
  const existingBank = await prisma.bank.findUnique({
    where: { code },
  });

  if (existingBank) {
    return NextResponse.json(
      { error: 'Bank code already exists' },
      { status: 400 }
    );
  }

  const bank = await prisma.bank.create({
    data: {
      id: generateSecureId(24),
      name,
      code,
      provider_id: providerId,
      vault_balance: 0,
      base_fee_percentage: 0,
      maintenance_mode: false,
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      id: generateSecureId(24),
      admin_id: user.id,
      action_type: 'BANK_CREATED',
      details: {
        bankId: bank.id,
        bankName: bank.name,
        bankCode: bank.code,
        providerId,
        timestamp: new Date().toISOString(),
      },
    },
  });

  return NextResponse.json({
    success: true,
    bank: {
      id: bank.id,
      name: bank.name,
      code: bank.code,
      providerId: bank.provider_id,
    },
  });
}, [UserRole.ADMIN]);

export const GET = withAuth(async (req: NextRequest) => {
  const banks = await prisma.bank.findMany({
    include: {
      provider: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return NextResponse.json({ banks });
}, [UserRole.ADMIN]);
