import { z } from 'zod';
import { idSchema, amountSchema } from './common.schema';

export const createDrawSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  ticketPrice: amountSchema,
  currency: z.string().default('USDC'),
  maxTickets: z.number().int().min(1),
  scheduledAt: z.date().min(new Date(), 'Draw must be scheduled in the future'),
});

export const runDrawSchema = z.object({
  drawId: idSchema,
  blockchainAnchor: z.string().optional(), // If not provided, will fetch automatically
});

export const drawFiltersSchema = z.object({
  status: z.enum(['UPCOMING', 'ACTIVE', 'DRAWING', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type CreateDrawInput = z.infer<typeof createDrawSchema>;
export type RunDrawInput = z.infer<typeof runDrawSchema>;
export type DrawFilters = z.infer<typeof drawFiltersSchema>;