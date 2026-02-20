import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { requestAccountSchema } from '@/lib/validation';
import { generateRequestCode, hashKey, generateSecureId } from '@/lib/hash';
import { UserRole } from '@prisma/client';

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { bankId } = requestAccountSchema.parse(body);

  // Verify bank is linked to user
  const link = await prisma.userBankLink.findUnique({
    where: {
      user_id_bank_id: {
        user_id: user.id,
        bank_id: bankId,
      },
    },
  });

  if (!link) {
    return NextResponse.json(
      { error: 'Bank not linked' },
      { status: 400 }
    );
  }

  // Generate request code
  const requestCode = generateRequestCode();
  const requestCodeHash = hashKey(requestCode);

  await prisma.accountRequest.create({
    data: {
      id: generateSecureId(24),
      request_code_hash: requestCodeHash,
      user_id: user.id,
      bank_id: bankId,
    },
  });

  return NextResponse.json({
    success: true,
    requestCode,
  });
}, [UserRole.USER]);
