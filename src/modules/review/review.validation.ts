import { z } from 'zod';

// ==================== Create Review Validation ====================
export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().min(3, 'Comment must be at least 3 characters').max(500, 'Comment cannot exceed 500 characters').optional(),
    images: z.array(z.string().url('Invalid image URL')).optional(),
    isPublic: z.boolean().default(true),
  }),
});

// ==================== Update Review Validation ====================
export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
    comment: z.string().min(3, 'Comment must be at least 3 characters').max(500, 'Comment cannot exceed 500 characters').optional(),
    images: z.array(z.string().url('Invalid image URL')).optional(),
    isPublic: z.boolean().optional(),
  }),
});

// ==================== Reply to Review Validation ====================
export const replyToReviewSchema = z.object({
  body: z.object({
    reply: z.string().min(3, 'Reply must be at least 3 characters').max(500, 'Reply cannot exceed 500 characters'),
  }),
});

// ==================== ID Param Validation ====================
export const reviewIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Review ID is required'),
  }),
});

// ==================== Query Validation ====================
export const reviewQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    technicianId: z.string().optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    minRating: z.coerce.number().int().min(1).max(5).optional(),
  }),
});

// ==================== Type Exports ====================
export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>['body'];
export type ReplyToReviewInput = z.infer<typeof replyToReviewSchema>['body'];