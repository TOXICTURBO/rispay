import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { setPinSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/hash';
import { UserRole } from '@prisma/client';

export const PUT = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { pin } = setPinSchema.parse(body);

  const pinHash = await hashPassword(pin);

  await prisma.userSettings.upsert({
    where: { user_id: user.id },
    update: {
      transaction_pin_hash: pinHash,
    },
    create: {
      user_id: user.id,
      transaction_pin_hash: pinHash,
      dark_mode: false,
      notifications_enabled: true,
    },
  });

  return NextResponse.json({ success: true });
}, [UserRole.USER]);
