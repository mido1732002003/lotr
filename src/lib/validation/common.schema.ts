import { z } from 'zod';
import { WalletNetwork } from '@prisma/client';

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .optional()
  .nullable();

export const walletAddressSchema = z.object({
  address: z.string().min(1, 'Wallet address is required'),
  network: z.nativeEnum(WalletNetwork),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const idSchema = z.string().cuid();

export const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .multipleOf(0.00000001); // 8 decimal places for crypto

export const cryptoCurrencySchema = z.enum(['BTC', 'ETH', 'USDC', 'USDT', 'SOL', 'MATIC']);

export const transactionHashSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$|^[a-fA-F0-9]{64}$/, 'Invalid transaction hash');