import cron from 'node-cron';
import { prisma } from './db';
import { generateSecureId } from './hash';

/**
 * Monthly inflation job
 * Runs on the 1st of every month at midnight
 */
export function setupInflationJob() {
  cron.schedule('0 0 1 * *', async () => {
    console.log('Running inflation job...');

    const settings = await prisma.systemSettings.findFirst();
    if (!settings || !settings.inflation_enabled) {
      console.log('Inflation is disabled, skipping...');
      return;
    }

    const inflationRate = Number(settings.inflation_rate);
    if (inflationRate <= 0) {
      console.log('Inflation rate is 0, skipping...');
      return;
    }

    const banks = await prisma.bank.findMany();
    const vaultChanges: Record<string, { before: number; after: number }> = {};

    await prisma.$transaction(async (tx) => {
      for (const bank of banks) {
        const currentBalance = Number(bank.vault_balance);
        const reduction = currentBalance * (inflationRate / 100);
        const newBalance = currentBalance - reduction;

        await tx.bank.update({
          where: { id: bank.id },
          data: {
            vault_balance: newBalance,
          },
        });

        vaultChanges[bank.id] = {
          before: currentBalance,
          after: newBalance,
        };
      }

      // Log inflation run
      await tx.inflationLog.create({
        data: {
          id: generateSecureId(24),
          previous_rate: inflationRate,
          new_rate: inflationRate,
          vault_changes: vaultChanges,
        },
      });
    });

    console.log('Inflation job completed');
  });
}

/**
 * Monthly interest payout job
 * Runs on the 1st of every month at 1 AM
 */
export function setupInterestJob() {
  cron.schedule('0 1 1 * *', async () => {
    console.log('Running interest payout job...');

    const banks = await prisma.bank.findMany({
      where: {
        interest_rate: { not: null },
      },
    });

    for (const bank of banks) {
      const interestRate = Number(bank.interest_rate);
      if (interestRate <= 0) continue;

      const accounts = await prisma.account.findMany({
        where: {
          bank_id: bank.id,
          activated_at: { not: null },
        },
      });

      let totalInterestPayout = 0;

      // Calculate total interest needed
      for (const account of accounts) {
        const balance = Number(account.balance);
        if (balance > 0) {
          totalInterestPayout += balance * (interestRate / 100);
        }
      }

      const vaultBalance = Number(bank.vault_balance);

      if (vaultBalance < totalInterestPayout) {
        console.log(
          `Bank ${bank.code}: Insufficient vault balance for interest payout. Skipping...`
        );
        continue;
      }

      await prisma.$transaction(async (tx) => {
        // Deduct from vault
        await tx.bank.update({
          where: { id: bank.id },
          data: {
            vault_balance: {
              decrement: totalInterestPayout,
            },
          },
        });

        // Add interest to each account
        for (const account of accounts) {
          const balance = Number(account.balance);
          if (balance > 0) {
            const interest = balance * (interestRate / 100);
            await tx.account.update({
              where: { id: account.id },
              data: {
                balance: {
                  increment: interest,
                },
              },
            });
          }
        }
      });

      console.log(`Interest payout completed for bank ${bank.code}`);
    }

    console.log('Interest payout job completed');
  });
}

/**
 * Initialize all scheduled jobs
 */
export function initializeCronJobs() {
  // Only run cron jobs in production
  if (process.env.NODE_ENV === 'production') {
    try {
      setupInflationJob();
      setupInterestJob();
      console.log('Cron jobs initialized');
    } catch (error) {
      console.error('Error initializing cron jobs:', error);
      // Don't fail the server if cron jobs fail to initialize
    }
  } else {
    console.log('Cron jobs disabled in development');
  }
}
