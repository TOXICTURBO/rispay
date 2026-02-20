import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { generateRegistrationKey, hashKey, generateSecureId } from '@/lib/hash';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const generateKeySchema = z.object({
  keyType: z.enum(['USER', 'PROVIDER']),
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const { keyType } = generateKeySchema.parse(body);

  const registrationKey = generateRegistrationKey();
  const keyHash = hashKey(registrationKey);

  await prisma.registrationKey.create({
    data: {
      id: generateSecureId(24),
      key_hash: keyHash,
      key_type: keyType,
      created_by_id: user.id,
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      id: generateSecureId(24),
      admin_id: user.id,
      action_type: 'KEY_GENERATED',
      details: {
        keyType,
        timestamp: new Date().toISOString(),
      },
    },
  });

  return NextResponse.json({
    success: true,
    registrationKey,
    keyType,
  });
}, [UserRole.ADMIN]);

export const GET = withAuth(async (req: NextRequest, user) => {
  const keys = await prisma.registrationKey.findMany({
    where: {
      created_by_id: user.id,
    },
    select: {
      id: true,
      key_type: true,
      used: true,
      used_at: true,
      created_at: true,
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 100,
  });

  return NextResponse.json({ keys });
}, [UserRole.ADMIN]);
