import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create initial admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created:', admin.username);

  // Create default system settings
  const settings = await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
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

  console.log('System settings created');

  // Create user settings for admin
  await prisma.userSettings.upsert({
    where: { user_id: admin.id },
    update: {},
    create: {
      user_id: admin.id,
      dark_mode: false,
      notifications_enabled: true,
    },
  });

  console.log('Seed completed!');
  console.log('Admin credentials:');
  console.log('Username: admin');
  console.log('Password: ' + adminPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
