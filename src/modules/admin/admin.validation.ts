import { z } from 'zod';
import { UserStatus, BookingStatus } from '../../generated/prisma';

// ==================== User Validation ====================

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.BANNED], {
      errorMap: () => ({ message: 'Status must be ACTIVE or BANNED' }),
    }),
  }),
});

export const userIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});

// ==================== Booking Validation ====================

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      BookingStatus.REQUESTED,
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

export const bookingIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID'),
  }),
});

// ==================== Technician Validation ====================

export const verifyTechnicianSchema = z.object({
  body: z.object({
    isVerified: z.boolean({
      required_error: 'isVerified is required',
    }),
  }),
});

export const technicianIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid technician ID'),
  }),
});

// ==================== Category Validation ====================

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    slug: z.string().min(2, 'Slug must be at least 2 characters'),
    description: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().url('Invalid image URL').optional(),
    parentCategoryId: z.string().uuid('Invalid parent category ID').optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').optional(),
    slug: z.string().min(2, 'Slug must be at least 2 characters').optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().url('Invalid image URL').optional(),
    isActive: z.boolean().optional(),
    parentCategoryId: z.string().uuid('Invalid parent category ID').nullable().optional(),
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
});

// ==================== Query Validation ====================

export const adminQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
    status: z.enum([UserStatus.ACTIVE, UserStatus.BANNED]).optional(),
    role: z.enum(['ADMIN', 'CUSTOMER', 'TECHNICIAN']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

// ==================== Type Exports ====================

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>['body'];
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>['body'];
export type VerifyTechnicianInput = z.infer<typeof verifyTechnicianSchema>['body'];
export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];