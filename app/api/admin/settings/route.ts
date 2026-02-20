import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { systemSettingsSchema, creditDebitSchema, resetEconomySchema } from '@/lib/validation';
import { generateSecureId } from '@/lib/hash';
import { verifyPassword } from '@/lib/hash';
import { UserRole } from '@prisma/client';

// Get system settings
export const GET = withAuth(async () => {
  let settings = await prisma.systemSettings.findFirst();

  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: {
        id: 'default',
        max_bank_fee_cap: 5.0,
        global_tax_percentage: 1.0,
        inflation_rate: 0.0,
        tax_enabled: true,
        inflation_enabled: false,
        admin_wallet_balance: 0,
        vault_transfer_fee: 0.5,
      },
    });
  }

  return NextResponse.json({ settings });
}, [UserRole.ADMIN]);

// Update system settings
export const PUT = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const data = systemSettingsSchema.parse(body);

  const updateData: Record<string, unknown> = {};
  if (data.maxBankFeeCap !== undefined) updateData.max_bank_fee_cap = data.maxBankFeeCap;
  if (data.globalTaxPercentage !== undefined) updateData.global_tax_percentage = data.globalTaxPercentage;
  if (data.inflationRate !== undefined) updateData.inflation_rate = data.inflationRate;
  if (data.taxEnabled !== undefined) updateData.tax_enabled = data.taxEnabled;
  if (data.inflationEnabled !== undefined) updateData.inflation_enabled = data.inflationEnabled;

  const settings = await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: updateData,
    create: {
      id: 'default',
      max_bank_fee_cap: data.maxBankFeeCap ?? 5.0,
      global_tax_percentage: data.globalTaxPercentage ?? 1.0,
      inflation_rate: data.inflationRate ?? 0.0,
      tax_enabled: data.taxEnabled ?? true,
      inflation_enabled: data.inflationEnabled ?? false,
      admin_wallet_balance: 0,
      vault_transfer_fee: 0.5,
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      id: generateSecureId(24),
      admin_id: user.id,
      action_type: 'SETTINGS_UPDATED',
      details: {
        changes: data,
        timestamp: new Date().toISOString(),
      },
    },
  });

  return NextResponse.json({ success: true, settings });
}, [UserRole.ADMIN]);
