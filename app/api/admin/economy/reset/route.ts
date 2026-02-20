import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { resetEconomySchema } from '@/lib/validation';
import { generateSecureId } from '@/lib/hash';
import { verifyPassword } from '@/lib/hash';
import { UserRole } from '@prisma/client';

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { password } = resetEconomySchema.parse(body);

  // Verify admin password
  const adminUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!adminUser) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  const isValidPassword = await verifyPassword(password, adminUser.password_hash);
  if (!isValidPassword) {
    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  }

  // Reset economy
  await prisma.$transaction(async (tx) => {
    // Reset all account balances
    await tx.account.updateMany({
      data: {
        balance: 0,
      },
    });

    // Reset all bank vault balances
    await tx.bank.updateMany({
      data: {
        vault_balance: 0,
      },
    });

    // Reset admin wallet
    await tx.systemSettings.updateMany({
      data: {
        admin_wallet_balance: 0,
      },
    });

    // Archive transactions (mark as archived or delete - keeping for now)
    // In production, you might want to move to an archive table
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      id: generateSecureId(24),
      admin_id: user.id,
      action_type: 'ECONOMY_RESET',
      details: {
        timestamp: new Date().toISOString(),
      },
    },
  });

  return NextResponse.json({ success: true });
}, [UserRole.ADMIN]);
