import { z } from 'zod';
import { bookingStatus } from './booking.constant';

// ==================== Create Booking Validation ====================
export const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string().min(1, 'Service ID is required'),
    scheduledDate: z.string().datetime('Invalid date format'),
    scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    durationMinutes: z.number().int().positive().optional(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

// ==================== Update Booking Validation ====================
export const updateBookingSchema = z.object({
  body: z.object({
    status: z.enum([
      bookingStatus.ACCEPTED,
      bookingStatus.DECLINED,
      bookingStatus.PAID,
      bookingStatus.IN_PROGRESS,
      bookingStatus.COMPLETED,
      bookingStatus.CANCELLED,
    ]).optional(),
    notes: z.string().max(500).optional(),
    cancellationReason: z.string().max(200).optional(),
  }),
});

// ==================== ID Param Validation ====================
export const bookingIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Booking ID is required'),
  }),
});

// ==================== Query Validation ====================
export const bookingQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    status: z.enum([
      bookingStatus.REQUESTED,
      bookingStatus.ACCEPTED,
      bookingStatus.DECLINED,
      bookingStatus.PAID,
      bookingStatus.IN_PROGRESS,
      bookingStatus.COMPLETED,
      bookingStatus.CANCELLED,
    ]).optional(),
  }),
});

// ==================== Type Exports ====================
export type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>['body'];