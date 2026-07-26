import express from 'express';
import { validateRequest } from '../../middlewares/validate';
import authMiddleware from '../../middlewares/auth';
import roleMiddleware from '../../middlewares/role';
import { AdminController } from './admin.controller';
import {
  updateUserStatusSchema,
  userIdSchema,
  adminQuerySchema,
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} from './admin.validation';
import { UserRole } from '@prisma/client';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(UserRole.ADMIN));

/**
 * @openapi
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get platform dashboard statistics
 *     description: Returns aggregated statistics for the platform including user counts, booking counts, and revenue.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Dashboard statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         banned:
 *                           type: integer
 *                     technicians:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         verified:
 *                           type: integer
 *                         unverified:
 *                           type: integer
 *                     bookings:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         pending:
 *                           type: integer
 *                         completed:
 *                           type: integer
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/dashboard/stats', AdminController.getDashboardStats);

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Get all users with filters (Admin only)
 *     description: Returns a paginated list of all users with optional filters.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, BANNED]
 *         description: Filter by user status
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [CUSTOMER, TECHNICIAN, ADMIN]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/users', validateRequest(adminQuerySchema), AdminController.getAllUsers);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details by ID (Admin only)
 *     description: Returns detailed information about a specific user including their bookings and payments.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: User not found
 */
router.get('/users/:id', validateRequest(userIdSchema), AdminController.getUserDetails);

/**
 * @openapi
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Update user status (Admin only)
 *     description: Ban or unban a user. Cannot change admin status.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, BANNED]
 *                 example: BANNED
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot change admin status
 *       404:
 *         description: User not found
 */
router.patch(
  '/users/:id/status',
  validateRequest(userIdSchema),
  validateRequest(updateUserStatusSchema),
  AdminController.updateUserStatus
);

/**
 * @openapi
 * /api/admin/categories:
 *   post:
 *     summary: Create a new service category (Admin only)
 *     description: Adds a new service category to the platform.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electrical
 *               slug:
 *                 type: string
 *                 example: electrical
 *               description:
 *                 type: string
 *                 example: Professional electrical services
 *               icon:
 *                 type: string
 *                 example: fa-bolt
 *               parentCategoryId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       409:
 *         description: Category already exists
 */
router.post('/categories', validateRequest(createCategorySchema), AdminController.createCategory);

/**
 * @openapi
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories (Admin only)
 *     description: Returns all service categories with sub-categories.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/categories', AdminController.getAllCategories);

/**
 * @openapi
 * /api/admin/categories/{id}:
 *   patch:
 *     summary: Update a category (Admin only)
 *     description: Updates an existing service category.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category with this name or slug already exists
 */
router.patch(
  '/categories/:id',
  validateRequest(categoryIdSchema),
  validateRequest(updateCategorySchema),
  AdminController.updateCategory
);

/**
 * @openapi
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     description: Deletes a service category. Cannot delete categories with associated services or sub-categories.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Cannot delete category with associated services or sub-categories
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Category not found
 */
router.delete(
  '/categories/:id',
  validateRequest(categoryIdSchema),
  AdminController.deleteCategory
);

export default router;