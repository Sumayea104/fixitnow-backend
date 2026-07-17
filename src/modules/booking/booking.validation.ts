import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

// Create booking validation
export const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string({ required_error: "Service ID is required" }),
    scheduledDate: z.string().datetime('Invalid date format'),
    scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    durationMinutes: z.number().int().positive().optional(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

// Update booking status validation
export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      BookingStatus.ACCEPTED,
      BookingStatus.DECLINED,
      BookingStatus.PAID,
      BookingStatus.IN_PROGRESS,
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED,
    ], {
      errorMap: () => ({ message: 'Invalid booking status' }),
    }),
  }),
});

// Cancel booking validation
export const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().max(200, 'Reason cannot exceed 200 characters').optional(),
  }),
});

// Booking ID param validation
export const bookingIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID'),
  }),
});

// Get bookings query validation
export const bookingQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    status: z.enum([
      BookingStatus.REQUESTED,
      BookingStatus.ACCEPTED,
      BookingStatus.DECLINED,
      BookingStatus.PAID,
      BookingStatus.IN_PROGRESS,
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED,
    ]).optional(),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>['body'];
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>['body'];
