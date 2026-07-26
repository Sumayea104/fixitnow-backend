import { z } from 'zod';
import { PaymentProvider } from '@prisma/client';

// ==================== Create Payment Validation ====================
export const createPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid('Invalid booking ID'),
    provider: z.enum([PaymentProvider.STRIPE, PaymentProvider.SSLCOMMERZ], {
      errorMap: () => ({ message: 'Provider must be STRIPE or SSLCOMMERZ' }),
    }),
  }),
});

// ==================== Confirm Payment Validation ====================
export const confirmPaymentSchema = z.object({
  body: z.object({
    paymentIntentId: z.string().optional(),
    transactionId: z.string().optional(),
    status: z.enum(['COMPLETED', 'FAILED'], {
      errorMap: () => ({ message: 'Status must be COMPLETED or FAILED' }),
    }),
  }),
});

// ==================== Payment ID Validation ====================
export const paymentIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payment ID'),
  }),
});

// ==================== Get Payments Query Validation ====================
export const paymentQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
    provider: z.enum(['STRIPE', 'SSLCOMMERZ']).optional(),
  }),
});

// ==================== Type Exports ====================
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>['body'];
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>['body'];
export type PaymentIdParam = z.infer<typeof paymentIdSchema>['params'];
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>['query'];