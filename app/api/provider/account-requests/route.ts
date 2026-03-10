import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { generateActivationKey, hashKey, generateSecureId } from '@/lib/hash';
import { UserRole } from '@prisma/client';

const processAccountRequestSchema = z.object({
  requestCode: z.string(),
});

export const GET = withAuth(async (req: NextRequest, user) => {
  // Get all banks owned by this provider
  const banks = await prisma.bank.findMany({
    where: {
      provider_id: user.id,
    },
    select: {
      id: true,
    },
  });

  const bankIds = banks.map((b) => b.id);

  const requests = await prisma.accountRequest.findMany({
    where: {
      bank_id: { in: bankIds },
      used: false,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
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
  });

  return NextResponse.json({ requests });
}, [UserRole.PROVIDER]);

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { requestCode } = processAccountRequestSchema.parse(body);

  const requestCodeHash = hashKey(requestCode);

  // Find account request
  const accountRequest = await prisma.accountRequest.findUnique({
    where: { request_code_hash: requestCodeHash },
    include: {
      bank: true,
    },
  });

  if (!accountRequest || accountRequest.used) {
    return NextResponse.json(
      { error: 'Invalid or already used request code' },
      { status: 400 }
    );
  }

  // Verify bank belongs to provider
  if (accountRequest.bank.provider_id !== user.id) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  // Generate activation key
  const activationKey = generateActivationKey();
  const activationKeyHash = hashKey(activationKey);
  const newAccountId = generateSecureId(24);

  // Create account and set activation key (atomic transaction)
  const result = await prisma.$transaction(async (tx) => {
    // Create new account with activation key
    const newAccount = await tx.account.create({
      data: {
        id: newAccountId,
        user_id: accountRequest.user_id,
        bank_id: accountRequest.bank_id,
        balance: 0,
        is_primary: false,
        activation_key_hash: activationKeyHash,
      },
    });

    // Mark request as used
    await tx.accountRequest.update({
      where: { id: accountRequest.id },
      data: {
        used: true,
        processed_by_id: user.id,
      },
    });

    return newAccount;
  });

  return NextResponse.json({
    success: true,
    accountId: result.id,
    activationKey,
  });
}, [UserRole.PROVIDER]);
