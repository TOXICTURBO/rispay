import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { linkBankSchema } from '@/lib/validation';
import { hashKey, generateSecureId } from '@/lib/hash';
import { UserRole } from '@prisma/client';

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { inviteCode } = linkBankSchema.parse(body);

  const inviteCodeHash = hashKey(inviteCode);

  // Find unused invite code
  const invite = await prisma.bankInviteCode.findUnique({
    where: { code_hash: inviteCodeHash },
    include: {
      bank: true,
    },
  });

  if (!invite || invite.used) {
    return NextResponse.json(
      { error: 'Invalid or already used invite code' },
      { status: 400 }
    );
  }

  // Check if user already linked to this bank
  const existingLink = await prisma.userBankLink.findUnique({
    where: {
      user_id_bank_id: {
        user_id: user.id,
        bank_id: invite.bank_id,
      },
    },
  });

  if (existingLink) {
    return NextResponse.json(
      { error: 'Bank already linked' },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    // Create link
    await tx.userBankLink.create({
      data: {
        id: generateSecureId(24),
        user_id: user.id,
        bank_id: invite.bank_id,
      },
    });

    // Mark invite as used
    await tx.bankInviteCode.update({
      where: { id: invite.id },
      data: {
        used: true,
        used_by_id: user.id,
        used_at: new Date(),
      },
    });
  });

  return NextResponse.json({
    success: true,
    bank: {
      id: invite.bank.id,
      name: invite.bank.name,
      code: invite.bank.code,
    },
  });
}, [UserRole.USER]);
