import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  registrationKey: z.string().length(32),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6),
});

export const sendMoneySchema = z.object({
  recipient: z.string().min(1),
  amount: z.number().positive().max(1000000),
  senderAccountId: z.string(),
  memo: z.string().max(200).optional(),
  pin: z.string().length(4),
});

export const createBankSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/),
  providerId: z.string(),
});

export const updateBankFeeSchema = z.object({
  bankId: z.string(),
  feePercentage: z.number().min(0).max(100),
});

export const vaultTransferSchema = z.object({
  bankId: z.string(),
  accountId: z.string(),
  amount: z.number().positive(),
});

export const systemSettingsSchema = z.object({
  maxBankFeeCap: z.number().min(0).max(100).optional(),
  globalTaxPercentage: z.number().min(0).max(100).optional(),
  inflationRate: z.number().min(0).max(100).optional(),
  taxEnabled: z.boolean().optional(),
  inflationEnabled: z.boolean().optional(),
});

export const creditDebitSchema = z.object({
  accountId: z.string(),
  amount: z.number(),
  memo: z.string().max(200).optional(),
});

export const linkBankSchema = z.object({
  inviteCode: z.string(),
});

export const requestAccountSchema = z.object({
  bankId: z.string(),
});

export const activateAccountSchema = z.object({
  activationKey: z.string().length(32),
  accountId: z.string(),
});

export const setPrimaryAccountSchema = z.object({
  accountId: z.string(),
});

export const updateAccountNicknameSchema = z.object({
  accountId: z.string(),
  nickname: z.string().max(50).optional(),
});

export const setPinSchema = z.object({
  pin: z.string().length(4).regex(/^\d+$/),
});

export const generateInviteCodeSchema = z.object({
  bankId: z.string(),
});

export const processAccountRequestSchema = z.object({
  requestCode: z.string(),
  accountId: z.string(),
});

export const generateActivationKeySchema = z.object({
  accountId: z.string(),
});

export const resetEconomySchema = z.object({
  password: z.string().min(1),
});
