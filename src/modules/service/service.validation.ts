import { z } from 'zod';

export const createServiceSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, 'Category ID is required'), 
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
    price: z.number().min(0, 'Price must be a positive number'),
    discountedPrice: z.number().min(0, 'Discounted price must be a positive number').optional(),
    durationMinutes: z.number().int().min(5, 'Duration must be at least 5 minutes').optional(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    images: z.array(z.string().url('Invalid image URL')).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateServiceSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID').optional(),
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters').optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters').optional(),
    price: z.number().min(0, 'Price must be a positive number').optional(),
    discountedPrice: z.number().min(0, 'Discounted price must be a positive number').nullable().optional(),
    durationMinutes: z.number().int().min(5, 'Duration must be at least 5 minutes').optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    images: z.array(z.string().url('Invalid image URL')).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const serviceIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid service ID'),
  }),
});

export const serviceQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    category: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    technicianId: z.string().uuid('Invalid technician ID').optional(),
    isFeatured: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    location: z.string().optional(),
  }),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>['body'];
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>['body'];