import { z } from 'zod';

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
    id: z.string({ required_error: 'Category ID is required' }), 
  }),
});
