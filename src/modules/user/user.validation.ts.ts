import { z } from 'zod';

// ==================== Update Profile Validation ====================
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format').optional(),
    address: z.string().max(200, 'Address cannot exceed 200 characters').optional(),
    profileImage: z.string().url('Invalid image URL').optional(),
  }),
});

// ==================== Change Password Validation ====================
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

// ==================== Upload Avatar Validation ====================
export const uploadAvatarSchema = z.object({
  body: z.object({
    avatar: z.string().url('Invalid image URL'),
  }),
});

// ==================== Get User by ID Validation ====================
export const userIdSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'User ID is required' }), // 🌟 .uuid() রিমুভড (CUID Compatibility)
  }),
});

// ==================== Get Users Query Validation (Admin) ====================
export const userQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
    role: z.enum(['CUSTOMER', 'TECHNICIAN', 'ADMIN']).optional(),
    status: z.enum(['ACTIVE', 'BANNED']).optional(),
  }),
});

// ==================== Update User Status (Admin) ====================
export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'BANNED'], {
      errorMap: () => ({ message: 'Status must be ACTIVE or BANNED' }),
    }),
  }),
});

// ==================== Type Exports ====================
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>['body'];
export type UserIdParam = z.infer<typeof userIdSchema>['params'];
export type UserQueryInput = z.infer<typeof userQuerySchema>['query'];
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>['body'];