import express from 'express';
import { validateRequest } from '../../middlewares/validate';
import authMiddleware from '../../middlewares/auth';
import roleMiddleware from '../../middlewares/role';
import { AdminController } from './admin.controller';
import {
  updateUserStatusSchema,
  updateBookingStatusSchema,
  verifyTechnicianSchema,
  userIdSchema,
  bookingIdSchema,
  technicianIdSchema,
  adminQuerySchema,
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} from './admin.validation';
import { UserRole } from '../../generated/prisma';

const router = express.Router();

// Apply auth and admin role middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware(UserRole.ADMIN));

// ==================== Dashboard Routes ====================
router.get('/dashboard/stats', AdminController.getDashboardStats);

// ==================== User Management Routes ====================
router.get('/users', validateRequest(adminQuerySchema), AdminController.getAllUsers);
router.get('/users/:id', validateRequest(userIdSchema), AdminController.getUserDetails);
router.patch(
  '/users/:id/status',
  validateRequest(userIdSchema),
  validateRequest(updateUserStatusSchema),
  AdminController.updateUserStatus
);

// ==================== Booking Management Routes ====================
router.get('/bookings', validateRequest(adminQuerySchema), AdminController.getAllBookings);
router.patch(
  '/bookings/:id/status',
  validateRequest(bookingIdSchema),
  validateRequest(updateBookingStatusSchema),
  AdminController.updateBookingStatus
);

// ==================== Technician Management Routes ====================
router.patch(
  '/technicians/:id/verify',
  validateRequest(technicianIdSchema),
  validateRequest(verifyTechnicianSchema),
  AdminController.verifyTechnician
);

// ==================== Category Management Routes ====================
router.post('/categories', validateRequest(createCategorySchema), AdminController.createCategory);
router.get('/categories', AdminController.getAllCategories);
router.patch(
  '/categories/:id',
  validateRequest(categoryIdSchema),
  validateRequest(updateCategorySchema),
  AdminController.updateCategory
);
router.delete('/categories/:id', validateRequest(categoryIdSchema), AdminController.deleteCategory);

export default router;