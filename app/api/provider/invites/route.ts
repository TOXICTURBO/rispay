import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { generateBankInviteCode, hashKey, generateSecureId } from '@/lib/hash';
import { generateInviteCodeSchema } from '@/lib/validation';
import { UserRole } from '@prisma/client';

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { bankId } = generateInviteCodeSchema.parse(body);

  // Verify bank belongs to this provider
  const bank = await prisma.bank.findUnique({
    where: { id: bankId },
  });

  if (!bank || bank.provider_id !== user.id) {
    return NextResponse.json(
      { error: 'Bank not found or access denied' },
      { status: 403 }
    );
  }

  const inviteCode = generateBankInviteCode(bank.code);
  const codeHash = hashKey(inviteCode);

  await prisma.bankInviteCode.create({
    data: {
      id: generateSecureId(24),
      code_hash: codeHash,
      bank_id: bankId,
      created_by_id: user.id,
    },
  });

  return NextResponse.json({
    success: true,
    inviteCode,
  });
}, [UserRole.PROVIDER]);

export const GET = withAuth(async (req: NextRequest, user) => {
  const invites = await prisma.bankInviteCode.findMany({
    where: {
      created_by_id: user.id,
    },
    include: {
      bank: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 100,
  });

  return NextResponse.json({ invites });
}, [UserRole.PROVIDER]);
