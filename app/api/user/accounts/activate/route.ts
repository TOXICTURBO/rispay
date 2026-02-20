import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { activateAccountSchema } from '@/lib/validation';
import { hashKey } from '@/lib/hash';
import { UserRole } from '@prisma/client';

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { activationKey, accountId } = activateAccountSchema.parse(body);

  const activationKeyHash = hashKey(activationKey);

  // Find account
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account || account.user_id !== user.id) {
    return NextResponse.json(
      { error: 'Account not found or access denied' },
      { status: 404 }
    );
  }

  if (account.activation_key_hash !== activationKeyHash) {
    return NextResponse.json(
      { error: 'Invalid activation key' },
      { status: 400 }
    );
  }

  if (account.activated_at) {
    return NextResponse.json(
      { error: 'Account already activated' },
      { status: 400 }
    );
  }

  await prisma.account.update({
    where: { id: accountId },
    data: {
      activation_key_hash: null,
      activated_at: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}, [UserRole.USER]);
