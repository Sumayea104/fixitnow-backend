import express from 'express';
import { validateRequest } from '../../middlewares/validate';
import authMiddleware from '../../middlewares/auth';
import roleMiddleware from '../../middlewares/role';
import { CategoryController } from './category.controller';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} from './category.validation';
import { UserRole } from '@prisma/client';

const router = express.Router();

// ==================== Public Routes ====================
/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', CategoryController.getAllCategories);

// ==================== Admin Only Routes ====================
router.use(authMiddleware);
router.use(roleMiddleware(UserRole.ADMIN));

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Admin only
 */
router.post('/', validateRequest(createCategorySchema), CategoryController.createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 * @access  Admin only
 */
router.put('/:id', validateRequest(categoryIdSchema), validateRequest(updateCategorySchema), CategoryController.updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Admin only
 */
router.delete('/:id', validateRequest(categoryIdSchema), CategoryController.deleteCategory);

export default router;
