import express from 'express';
import { validateRequest } from '../../middlewares/validate';
import authMiddleware from '../../middlewares/auth';
import roleMiddleware from '../../middlewares/role';
import { ServiceController } from './service.controller';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
  serviceQuerySchema,
} from './service.validation';
import { UserRole } from '../../generated/prisma';

const router = express.Router();

// ==================== Public Routes ====================
/**
 * @route   GET /api/services
 * @desc    Get all services with filters
 * @access  Public
 */
router.get(
  '/',
  validateRequest(serviceQuerySchema),
  ServiceController.getAllServices
);

/**
 * @route   GET /api/services/:id
 * @desc    Get service details with reviews
 * @access  Public
 */
router.get(
  '/:id',
  validateRequest(serviceIdSchema),
  ServiceController.getServiceDetails
);

// ==================== Protected Routes (Technician Only) ====================
router.use(authMiddleware);
router.use(roleMiddleware(UserRole.TECHNICIAN));

/**
 * @route   POST /api/services
 * @desc    Create a new service
 * @access  Technician only
 */
router.post(
  '/',
  validateRequest(createServiceSchema),
  ServiceController.createService
);

/**
 * @route   PUT /api/services/:id
 * @desc    Update a service
 * @access  Technician only
 */
router.put(
  '/:id',
  validateRequest(serviceIdSchema),
  validateRequest(updateServiceSchema),
  ServiceController.updateService
);

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete a service
 * @access  Technician only
 */
router.delete(
  '/:id',
  validateRequest(serviceIdSchema),
  ServiceController.deleteService
);

/**
 * @route   GET /api/services/technician/my-services
 * @desc    Get all services of the logged-in technician
 * @access  Technician only
 */
router.get(
  '/technician/my-services',
  ServiceController.getTechnicianServices
);

export default router;