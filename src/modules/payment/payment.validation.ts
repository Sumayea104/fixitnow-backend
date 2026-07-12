import { z } from 'zod';
import { PaymentProvider } from '../../generated/prisma';

export const createPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    provider: z.enum([PaymentProvider.STRIPE, PaymentProvider.SSLCOMMERZ], {
      errorMap: () => ({ message: 'Provider must be STRIPE or SSLCOMMERZ' }),
    }),
  }),
});

export const confirmPaymentSchema = z.object({
  body: z.object({
    paymentIntentId: z.string().optional(),
    transactionId: z.string().optional(),
    status: z.enum(['COMPLETED', 'FAILED']),
  }),
});

export const paymentIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Payment ID is required'),
  }),
});

export const paymentQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>['body'];
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>['body'];