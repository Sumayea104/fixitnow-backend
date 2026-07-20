import { z } from 'zod';

// ==================== Update Profile Validation ====================
export const updateTechnicianProfileSchema = z.object({
  body: z.object({
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
    experience: z.number().int().min(0, 'Experience must be a positive number').optional(),
    hourlyRate: z.number().min(0, 'Hourly rate must be a positive number').optional(),
    location: z.string().max(100, 'Location cannot exceed 100 characters').optional(),
    skills: z.array(z.string()).optional(),
    isAvailable: z.boolean().optional(),
  }),
});

// ==================== Availability Validation ====================
export const updateAvailabilitySchema = z.object({
  body: z.object({
    availabilitySlots: z.array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6, 'Day must be between 0 (Sunday) and 6 (Saturday)'),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        isRecurring: z.boolean().default(true),
        specificDate: z.string().datetime().optional(),
        maxBookings: z.number().int().min(1).default(1),
      })
    ).optional(),
  }),
});

// ==================== Booking Status Validation ====================
export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED'], {
      errorMap: () => ({ message: 'Status must be ACCEPTED, DECLINED, IN_PROGRESS, or COMPLETED' }),
    }),
  }),
});

// ==================== ID Param Validation ====================
export const technicianIdSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Technician ID is required" }),
  }),
});

export const bookingIdSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Booking ID is required" }),
  }),
});

// ==================== Query Validation ====================
export const technicianQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
    location: z.string().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    isAvailable: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    service: z.string().optional(),
  }),
});

// ==================== Type Exports ====================
export type UpdateTechnicianProfileInput = z.infer<typeof updateTechnicianProfileSchema>['body'];
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>['body'];
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>['body'];