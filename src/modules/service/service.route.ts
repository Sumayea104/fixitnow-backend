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
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get(
  '/',
  validateRequest(serviceQuerySchema),
  ServiceController.getAllServices
);

router.get(
  '/:id',
  validateRequest(serviceIdSchema),
  ServiceController.getServiceDetails
);

// ==================== Protected Routes (Technician Only) ====================
router.use(authMiddleware);
router.use(roleMiddleware(UserRole.TECHNICIAN));

router.post(
  '/',
  validateRequest(createServiceSchema),
  ServiceController.createService
);


router.put(
  '/:id',
  validateRequest(serviceIdSchema),
  validateRequest(updateServiceSchema),
  ServiceController.updateService
);

router.delete(
  '/:id',
  validateRequest(serviceIdSchema),
  ServiceController.deleteService
);

router.get(
  '/technician/my-services',
  ServiceController.getTechnicianServices
);

export default router;
