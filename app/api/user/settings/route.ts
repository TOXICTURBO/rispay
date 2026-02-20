import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const updateSettingsSchema = z.object({
  darkMode: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
});

export const GET = withAuth(async (req: NextRequest, user) => {
  const settings = await prisma.userSettings.findUnique({
    where: { user_id: user.id },
  });

  return NextResponse.json({
    settings: settings || {
      dark_mode: false,
      notifications_enabled: true,
    },
  });
}, [UserRole.USER]);

export const PUT = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const data = updateSettingsSchema.parse(body);

  const settings = await prisma.userSettings.upsert({
    where: { user_id: user.id },
    update: {
      dark_mode: data.darkMode,
      notifications_enabled: data.notificationsEnabled,
    },
    create: {
      user_id: user.id,
      dark_mode: data.darkMode ?? false,
      notifications_enabled: data.notificationsEnabled ?? true,
    },
  });

  return NextResponse.json({ success: true, settings });
}, [UserRole.USER]);
