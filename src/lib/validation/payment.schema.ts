import { z } from 'zod';
import { emailSchema, walletAddressSchema, amountSchema, idSchema } from './common.schema';

export const createCheckoutSchema = z.object({
  drawId: idSchema,
  ticketCount: z.number().int().min(1).max(100),
  walletAddress: z.string().min(1),
  walletNetwork: z.string().min(1),
  email: emailSchema,
  paymentMethod: z.enum(['COINBASE_COMMERCE', 'NOWPAYMENTS']).default('COINBASE_COMMERCE'),
});

export const webhookPayloadSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.any(),
  signature: z.string().optional(),
  timestamp: z.string().optional(),
});

export const paymentStatusUpdateSchema = z.object({
  paymentId: idSchema,
  status: z.enum(['PENDING', 'PROCESSING', 'CONFIRMED', 'FAILED', 'EXPIRED', 'REFUNDED']),
  transactionHash: z.string().optional(),
  blockConfirmations: z.number().optional(),
  failureReason: z.string().optional(),
});

export const recordPayoutSchema = z.object({
  ticketId: idSchema,
  transactionHash: z.string().min(1),
  amount: amountSchema,
  currency: z.string().min(1),
  networkFee: amountSchema.optional(),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
export type PaymentStatusUpdate = z.infer<typeof paymentStatusUpdateSchema>;
export type RecordPayoutInput = z.infer<typeof recordPayoutSchema>;